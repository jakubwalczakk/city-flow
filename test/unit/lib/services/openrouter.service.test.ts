import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenRouterService } from '@/lib/services/openrouter.service';
import { ExternalServiceError, ValidationError } from '@/lib/errors/app-error';
import { z } from 'zod';

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('OpenRouterService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    global.fetch = vi.fn();
  });

  describe('constructor', () => {
    it('should create service with API key', () => {
      const service = new OpenRouterService({ apiKey: 'test-api-key' });
      expect(service).toBeInstanceOf(OpenRouterService);
    });

    it('should throw error if API key is missing', () => {
      expect(() => {
        new OpenRouterService({ apiKey: '' });
      }).toThrow('OpenRouter API key is required.');
    });

    it('should throw error if API key is undefined', () => {
      expect(() => {
        new OpenRouterService({ apiKey: undefined as unknown as string });
      }).toThrow('OpenRouter API key is required.');
    });

    it('should use default baseUrl if not provided', () => {
      const service = new OpenRouterService({ apiKey: 'test-api-key' });
      expect(service).toBeInstanceOf(OpenRouterService);
      // Service should use default URL: https://openrouter.ai/api/v1
    });

    it('should use custom baseUrl if provided', () => {
      const service = new OpenRouterService({
        apiKey: 'test-api-key',
        baseUrl: 'https://custom.example.com',
      });
      expect(service).toBeInstanceOf(OpenRouterService);
    });

    it('should log debug message on initialization', async () => {
      const { logger } = await import('@/lib/utils/logger');

      new OpenRouterService({ apiKey: 'test-api-key' });

      expect(logger.debug).toHaveBeenCalledWith('OpenRouterService initialized', {
        baseUrl: 'https://openrouter.ai/api/v1',
        hasDefaultModel: false,
      });
    });

    it('should log with hasDefaultModel true when default model is provided', async () => {
      const { logger } = await import('@/lib/utils/logger');

      new OpenRouterService({
        apiKey: 'test-api-key',
        defaultModel: 'openai/gpt-4',
      });

      expect(logger.debug).toHaveBeenCalledWith('OpenRouterService initialized', {
        baseUrl: 'https://openrouter.ai/api/v1',
        hasDefaultModel: true,
      });
    });
  });

  describe('getStructuredResponse', () => {
    const testSchema = z.object({
      status: z.literal('success'),
      message: z.string(),
    });

    const mockSuccessResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              status: 'success',
              message: 'Test response',
            }),
          },
        },
      ],
    };

    it('should successfully generate structured response', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockSuccessResponse,
      } as Response);

      const service = new OpenRouterService({ apiKey: 'test-api-key' });
      const result = await service.getStructuredResponse({
        systemPrompt: 'You are a helpful assistant',
        userPrompt: 'Generate a response',
        responseSchema: testSchema,
      });

      expect(result).toEqual({
        status: 'success',
        message: 'Test response',
      });
    });

    it('should log debug at start', async () => {
      const { logger } = await import('@/lib/utils/logger');

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockSuccessResponse,
      } as Response);

      const service = new OpenRouterService({
        apiKey: 'test-api-key',
        defaultModel: 'openai/gpt-4',
      });

      await service.getStructuredResponse({
        systemPrompt: 'Test system prompt',
        userPrompt: 'Test user prompt',
        responseSchema: testSchema,
      });

      expect(logger.debug).toHaveBeenCalledWith('Requesting structured response from OpenRouter', {
        model: 'openai/gpt-4',
        systemPromptLength: 18,
        userPromptLength: 16,
      });
    });

    it('should log info on success', async () => {
      const { logger } = await import('@/lib/utils/logger');

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockSuccessResponse,
      } as Response);

      const service = new OpenRouterService({
        apiKey: 'test-api-key',
        defaultModel: 'openai/gpt-4o-mini',
      });

      await service.getStructuredResponse({
        systemPrompt: 'Test',
        userPrompt: 'Test',
        responseSchema: testSchema,
      });

      expect(logger.info).toHaveBeenCalledWith('Structured response generated successfully', {
        model: 'openai/gpt-4o-mini',
      });
    });

    it('should use model from options over default model', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockSuccessResponse,
      } as Response);

      const service = new OpenRouterService({
        apiKey: 'test-api-key',
        defaultModel: 'openai/gpt-3.5-turbo',
      });

      await service.getStructuredResponse({
        systemPrompt: 'Test',
        userPrompt: 'Test',
        responseSchema: testSchema,
        model: 'anthropic/claude-3-opus',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          body: expect.stringContaining('anthropic/claude-3-opus'),
        })
      );
    });

    it('should include max_tokens in request', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockSuccessResponse,
      } as Response);

      const service = new OpenRouterService({ apiKey: 'test-api-key' });

      await service.getStructuredResponse({
        systemPrompt: 'Test',
        userPrompt: 'Test',
        responseSchema: testSchema,
      });

      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      const requestBody = JSON.parse((callArgs[1] as RequestInit).body as string);

      expect(requestBody.max_tokens).toBe(4096);
    });

    it('should include Authorization header with API key', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockSuccessResponse,
      } as Response);

      const service = new OpenRouterService({ apiKey: 'secret-key-123' });

      await service.getStructuredResponse({
        systemPrompt: 'Test',
        userPrompt: 'Test',
        responseSchema: testSchema,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer secret-key-123',
          }),
        })
      );
    });

    it('should handle 401 Unauthorized error', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'Invalid API key',
      } as Response);

      const service = new OpenRouterService({ apiKey: 'invalid-key' });

      await expect(
        service.getStructuredResponse({
          systemPrompt: 'Test',
          userPrompt: 'Test',
          responseSchema: testSchema,
        })
      ).rejects.toThrow(ExternalServiceError);

      await expect(
        service.getStructuredResponse({
          systemPrompt: 'Test',
          userPrompt: 'Test',
          responseSchema: testSchema,
        })
      ).rejects.toThrow('Invalid API key. Please check your OpenRouter configuration.');
    });

    it('should handle 429 Rate Limit error', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: async () => 'Rate limit exceeded',
      } as Response);

      const service = new OpenRouterService({ apiKey: 'test-key' });

      await expect(
        service.getStructuredResponse({
          systemPrompt: 'Test',
          userPrompt: 'Test',
          responseSchema: testSchema,
        })
      ).rejects.toThrow('Rate limit exceeded. Please try again later.');
    });

    it('should handle 400 Bad Request error', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'Invalid parameters',
      } as Response);

      const service = new OpenRouterService({ apiKey: 'test-key' });

      await expect(
        service.getStructuredResponse({
          systemPrompt: 'Test',
          userPrompt: 'Test',
          responseSchema: testSchema,
        })
      ).rejects.toThrow('Invalid request parameters. Please check your input.');
    });

    it('should handle 500 Server Error', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error',
      } as Response);

      const service = new OpenRouterService({ apiKey: 'test-key' });

      await expect(
        service.getStructuredResponse({
          systemPrompt: 'Test',
          userPrompt: 'Test',
          responseSchema: testSchema,
        })
      ).rejects.toThrow('OpenRouter service is temporarily unavailable. Please try again later.');
    });

    it('should handle 503 Service Unavailable error', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        text: async () => 'Service down',
      } as Response);

      const service = new OpenRouterService({ apiKey: 'test-key' });

      await expect(
        service.getStructuredResponse({
          systemPrompt: 'Test',
          userPrompt: 'Test',
          responseSchema: testSchema,
        })
      ).rejects.toThrow('OpenRouter service is temporarily unavailable. Please try again later.');
    });

    it('should handle unknown HTTP status codes', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 418,
        statusText: "I'm a teapot",
        text: async () => 'Unusual error',
      } as Response);

      const service = new OpenRouterService({ apiKey: 'test-key' });

      await expect(
        service.getStructuredResponse({
          systemPrompt: 'Test',
          userPrompt: 'Test',
          responseSchema: testSchema,
        })
      ).rejects.toThrow("OpenRouter API error: I'm a teapot");
    });

    it('should handle network errors', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network connection failed'));

      const service = new OpenRouterService({ apiKey: 'test-key' });

      await expect(
        service.getStructuredResponse({
          systemPrompt: 'Test',
          userPrompt: 'Test',
          responseSchema: testSchema,
        })
      ).rejects.toThrow('Failed to connect to OpenRouter API. Please check your network connection.');
    });

    it('should throw ValidationError when response has no content', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: null,
              },
            },
          ],
        }),
      } as Response);

      const service = new OpenRouterService({ apiKey: 'test-key' });

      await expect(
        service.getStructuredResponse({
          systemPrompt: 'Test',
          userPrompt: 'Test',
          responseSchema: testSchema,
        })
      ).rejects.toThrow(ValidationError);

      await expect(
        service.getStructuredResponse({
          systemPrompt: 'Test',
          userPrompt: 'Test',
          responseSchema: testSchema,
        })
      ).rejects.toThrow('Invalid response structure from OpenRouter API.');
    });

    it('should throw ValidationError when response has invalid JSON', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'Not valid JSON {',
              },
            },
          ],
        }),
      } as Response);

      const service = new OpenRouterService({ apiKey: 'test-key' });

      await expect(
        service.getStructuredResponse({
          systemPrompt: 'Test',
          userPrompt: 'Test',
          responseSchema: testSchema,
        })
      ).rejects.toThrow(ValidationError);

      await expect(
        service.getStructuredResponse({
          systemPrompt: 'Test',
          userPrompt: 'Test',
          responseSchema: testSchema,
        })
      ).rejects.toThrow('Failed to parse the response from OpenRouter API.');
    });

    it('should throw ValidationError when response fails Zod validation', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  status: 'error', // Should be 'success'
                  message: 'Test',
                }),
              },
            },
          ],
        }),
      } as Response);

      const service = new OpenRouterService({ apiKey: 'test-key' });

      await expect(
        service.getStructuredResponse({
          systemPrompt: 'Test',
          userPrompt: 'Test',
          responseSchema: testSchema,
        })
      ).rejects.toThrow(ValidationError);

      await expect(
        service.getStructuredResponse({
          systemPrompt: 'Test',
          userPrompt: 'Test',
          responseSchema: testSchema,
        })
      ).rejects.toThrow('The response from OpenRouter does not match the expected format');
    });

    it('should log error when API request fails', async () => {
      const { logger } = await import('@/lib/utils/logger');

      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error details',
      } as Response);

      const service = new OpenRouterService({ apiKey: 'test-key' });

      try {
        await service.getStructuredResponse({
          systemPrompt: 'Test',
          userPrompt: 'Test',
          responseSchema: testSchema,
        });
      } catch {
        // Expected
      }

      expect(logger.error).toHaveBeenCalledWith('OpenRouter API request failed', {
        status: 500,
        statusText: 'Internal Server Error',
        errorText: 'Server error details',
      });
    });

    it('should log error when validation fails', async () => {
      const { logger } = await import('@/lib/utils/logger');

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  status: 'wrong',
                  message: 'Test',
                }),
              },
            },
          ],
        }),
      } as Response);

      const service = new OpenRouterService({ apiKey: 'test-key' });

      try {
        await service.getStructuredResponse({
          systemPrompt: 'Test',
          userPrompt: 'Test',
          responseSchema: testSchema,
        });
      } catch {
        // Expected
      }

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to parse or validate response',
        expect.objectContaining({
          error: expect.any(Object),
        })
      );
    });

    it('should include custom params in request', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockSuccessResponse,
      } as Response);

      const service = new OpenRouterService({ apiKey: 'test-key' });

      await service.getStructuredResponse({
        systemPrompt: 'Test',
        userPrompt: 'Test',
        responseSchema: testSchema,
        params: {
          temperature: 0.7,
          top_p: 0.9,
        },
      });

      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      const requestBody = JSON.parse((callArgs[1] as RequestInit).body as string);

      expect(requestBody.temperature).toBe(0.7);
      expect(requestBody.top_p).toBe(0.9);
    });

    it('should handle response with empty choices array', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [],
        }),
      } as Response);

      const service = new OpenRouterService({ apiKey: 'test-key' });

      await expect(
        service.getStructuredResponse({
          systemPrompt: 'Test',
          userPrompt: 'Test',
          responseSchema: testSchema,
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should handle unexpected non-error exceptions', async () => {
      const { logger } = await import('@/lib/utils/logger');

      vi.mocked(global.fetch).mockImplementation(() => {
        // Simulate an unexpected error (not caught by known error types)
        throw 'String error instead of Error object';
      });

      const service = new OpenRouterService({ apiKey: 'test-key' });

      await expect(
        service.getStructuredResponse({
          systemPrompt: 'Test',
          userPrompt: 'Test',
          responseSchema: testSchema,
        })
      ).rejects.toThrow(ExternalServiceError);

      expect(logger.error).toHaveBeenCalledWith(
        'Network error while calling OpenRouter API',
        expect.objectContaining({
          error: 'String error instead of Error object',
        })
      );
    });
  });
});
