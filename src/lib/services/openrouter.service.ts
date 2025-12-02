import { z } from "zod";
import { ExternalServiceError, ValidationError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";
import type { OpenRouterConfig, GetStructuredResponseOptions, OpenRouterResponse } from "./openrouter.types";

/**
 * Service for interacting with the OpenRouter API.
 * Provides methods for generating structured responses using LLM models.
 */
export class OpenRouterService {
  private readonly config: OpenRouterConfig;

  /**
   * Creates a new instance of the OpenRouter service.
   * @param config - Configuration object containing API key and optional settings
   * @throws {Error} If API key is not provided
   */
  constructor(config: OpenRouterConfig) {
    if (!config.apiKey) {
      throw new Error("OpenRouter API key is required.");
    }

    this.config = {
      ...config,
      baseUrl: config.baseUrl || "https://openrouter.ai/api/v1",
    };

    logger.debug("OpenRouterService initialized", {
      baseUrl: this.config.baseUrl,
      hasDefaultModel: !!this.config.defaultModel,
    });
  }

  /**
   * Generates a structured response from the LLM based on provided prompts and schema.
   * @param options - Configuration options including prompts, schema, and model settings
   * @returns A promise resolving to the validated response matching the provided schema
   * @throws {ValidationError} If the response doesn't match the expected schema
   * @throws {ExternalServiceError} If the API request fails
   */
  public async getStructuredResponse<T extends z.ZodTypeAny>(
    options: GetStructuredResponseOptions<T>
  ): Promise<z.infer<T>> {
    logger.debug("Requesting structured response from OpenRouter", {
      model: options.model || this.config.defaultModel,
      systemPromptLength: options.systemPrompt.length,
      userPromptLength: options.userPrompt.length,
    });

    try {
      // Build the request body
      const requestBody = this.buildRequestBody(options);

      // Send request to OpenRouter API
      const apiResponse = await this.sendRequest(requestBody);

      // Parse and validate the response
      const result = await this.parseAndValidateResponse(apiResponse, options.responseSchema);

      logger.info("Structured response generated successfully", {
        model: options.model || this.config.defaultModel,
      });

      return result;
    } catch (error: unknown) {
      // Handle and transform errors
      if (error instanceof ValidationError || error instanceof ExternalServiceError) {
        throw error;
      }

      logger.error("Unexpected error in getStructuredResponse", {
        error,
      });

      throw new ExternalServiceError(
        "An unexpected error occurred while generating the response.",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Builds the request body for the OpenRouter API call.
   * @param options - Options containing prompts, schema, and model settings
   * @returns The formatted request body
   */
  private buildRequestBody<T extends z.ZodTypeAny>(options: GetStructuredResponseOptions<T>): Record<string, unknown> {
    const { systemPrompt, userPrompt, model, params } = options;

    return {
      model: model || this.config.defaultModel || "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_object",
        // NOTE: Removing the 'schema' property for broader model compatibility.
        // Some models on OpenRouter support json_object mode but not schema enforcement.
        // The detailed instructions in the system prompt will guide the model.
        // schema: actualSchema,
      },
      ...this.config.defaultParams,
      ...params,
      // Add a generous token limit to prevent truncated JSON responses
      max_tokens: 4096,
    };
  }

  /**
   * Sends an HTTP POST request to the OpenRouter API.
   * @param body - The request body
   * @returns The API response
   * @throws {ExternalServiceError} If the request fails
   */
  private async sendRequest(body: Record<string, unknown>): Promise<OpenRouterResponse> {
    const fullUrl = `${this.config.baseUrl}/chat/completions`;

    logger.debug("Sending request to OpenRouter API", {
      url: fullUrl,
    });

    try {
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "No error details available");

        logger.error("OpenRouter API request failed", {
          status: response.status,
          statusText: response.statusText,
          errorText,
        });

        // Map HTTP status codes to appropriate error messages
        let errorMessage: string;
        switch (response.status) {
          case 401:
            errorMessage = "Invalid API key. Please check your OpenRouter configuration.";
            break;
          case 429:
            errorMessage = "Rate limit exceeded. Please try again later.";
            break;
          case 400:
            errorMessage = "Invalid request parameters. Please check your input.";
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage = "OpenRouter service is temporarily unavailable. Please try again later.";
            break;
          default:
            errorMessage = `OpenRouter API error: ${response.statusText}`;
        }

        throw new ExternalServiceError(errorMessage, new Error(`HTTP ${response.status}: ${errorText}`));
      }

      return await response.json();
    } catch (error: unknown) {
      if (error instanceof ExternalServiceError) {
        throw error;
      }

      logger.error("Network error while calling OpenRouter API", {
        error,
      });

      throw new ExternalServiceError(
        "Failed to connect to OpenRouter API. Please check your network connection.",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Parses and validates the API response against the provided Zod schema.
   * @param apiResponse - The raw API response
   * @param schema - The Zod schema to validate against
   * @returns The validated and typed response
   * @throws {ValidationError} If parsing or validation fails
   */
  private async parseAndValidateResponse<T extends z.ZodTypeAny>(
    apiResponse: OpenRouterResponse,
    schema: T
  ): Promise<z.infer<T>> {
    const jsonString = apiResponse.choices[0]?.message?.content;

    logger.info("Raw content from OpenRouter API before parsing:", {
      content: jsonString,
    });

    if (!jsonString) {
      logger.error("Invalid response structure from OpenRouter API", {
        response: apiResponse,
      });
      throw new ValidationError("Invalid response structure from OpenRouter API.");
    }

    try {
      // Parse the JSON content
      const parsedContent = JSON.parse(jsonString);

      // Validate against the Zod schema
      const validatedResult = schema.parse(parsedContent);

      logger.debug("Response validated successfully");

      return validatedResult;
    } catch (error: unknown) {
      logger.error("Failed to parse or validate response", {
        error,
        content: jsonString,
      });

      if (error instanceof z.ZodError) {
        throw new ValidationError("The response from OpenRouter does not match the expected format.", error.errors);
      }

      throw new ValidationError("Failed to parse the response from OpenRouter API.", error);
    }
  }
}
