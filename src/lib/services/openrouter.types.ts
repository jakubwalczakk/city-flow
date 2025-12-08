import { z } from 'zod';

/**
 * Configuration interface for the OpenRouter service.
 */
export type OpenRouterConfig = {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  defaultParams?: Record<string, unknown>;
};

/**
 * Options for structured response generation.
 */
export type GetStructuredResponseOptions<T extends z.ZodTypeAny> = {
  systemPrompt: string;
  userPrompt: string;
  responseSchema: T;
  model?: string;
  params?: Record<string, unknown>;
};

/**
 * OpenRouter API response structure.
 */
export type OpenRouterResponse = {
  choices: {
    message: {
      content: string;
    };
  }[];
};
