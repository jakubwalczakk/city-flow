import { describe, it, expect } from 'vitest';
import type {
  OpenRouterConfig,
  GetStructuredResponseOptions,
  OpenRouterResponse,
} from '@/lib/services/openrouter.types';
import { z } from 'zod';

describe('openrouter.types.ts - Type definitions', () => {
  describe('OpenRouterConfig', () => {
    it('should define OpenRouterConfig with required apiKey', () => {
      const config: OpenRouterConfig = {
        apiKey: 'test-key',
      };
      expect(config.apiKey).toBe('test-key');
    });

    it('should allow optional baseUrl', () => {
      const config: OpenRouterConfig = {
        apiKey: 'test-key',
        baseUrl: 'https://api.openrouter.ai/api/v1',
      };
      expect(config.baseUrl).toBe('https://api.openrouter.ai/api/v1');
    });

    it('should allow optional defaultModel', () => {
      const config: OpenRouterConfig = {
        apiKey: 'test-key',
        defaultModel: 'gpt-4',
      };
      expect(config.defaultModel).toBe('gpt-4');
    });

    it('should allow optional defaultParams', () => {
      const config: OpenRouterConfig = {
        apiKey: 'test-key',
        defaultParams: { temperature: 0.7 },
      };
      expect(config.defaultParams).toEqual({ temperature: 0.7 });
    });

    it('should allow all optional fields together', () => {
      const config: OpenRouterConfig = {
        apiKey: 'test-key',
        baseUrl: 'https://api.openrouter.ai/api/v1',
        defaultModel: 'gpt-4',
        defaultParams: { temperature: 0.7, maxTokens: 1000 },
      };
      expect(config).toMatchObject({
        apiKey: 'test-key',
        baseUrl: 'https://api.openrouter.ai/api/v1',
        defaultModel: 'gpt-4',
        defaultParams: { temperature: 0.7, maxTokens: 1000 },
      });
    });
  });

  describe('GetStructuredResponseOptions', () => {
    it('should define options with required fields', () => {
      const schema = z.object({ name: z.string() });
      const options: GetStructuredResponseOptions<typeof schema> = {
        systemPrompt: 'You are helpful',
        userPrompt: 'Tell me something',
        responseSchema: schema,
      };
      expect(options.systemPrompt).toBe('You are helpful');
      expect(options.userPrompt).toBe('Tell me something');
      expect(options.responseSchema).toBe(schema);
    });

    it('should allow optional model', () => {
      const schema = z.object({ name: z.string() });
      const options: GetStructuredResponseOptions<typeof schema> = {
        systemPrompt: 'You are helpful',
        userPrompt: 'Tell me something',
        responseSchema: schema,
        model: 'gpt-4',
      };
      expect(options.model).toBe('gpt-4');
    });

    it('should allow optional params', () => {
      const schema = z.object({ name: z.string() });
      const options: GetStructuredResponseOptions<typeof schema> = {
        systemPrompt: 'You are helpful',
        userPrompt: 'Tell me something',
        responseSchema: schema,
        params: { temperature: 0.5 },
      };
      expect(options.params).toEqual({ temperature: 0.5 });
    });

    it('should allow all fields together', () => {
      const schema = z.object({ name: z.string() });
      const options: GetStructuredResponseOptions<typeof schema> = {
        systemPrompt: 'You are helpful',
        userPrompt: 'Tell me something',
        responseSchema: schema,
        model: 'gpt-4',
        params: { temperature: 0.5, maxTokens: 2000 },
      };
      expect(options).toMatchObject({
        systemPrompt: 'You are helpful',
        userPrompt: 'Tell me something',
        model: 'gpt-4',
        params: { temperature: 0.5, maxTokens: 2000 },
      });
      expect(options.responseSchema).toBe(schema);
    });
  });

  describe('OpenRouterResponse', () => {
    it('should define OpenRouterResponse structure', () => {
      const response: OpenRouterResponse = {
        choices: [
          {
            message: {
              content: 'Hello world',
            },
          },
        ],
      };
      expect(response.choices).toHaveLength(1);
      expect(response.choices[0].message.content).toBe('Hello world');
    });

    it('should support multiple choices', () => {
      const response: OpenRouterResponse = {
        choices: [
          {
            message: {
              content: 'First response',
            },
          },
          {
            message: {
              content: 'Second response',
            },
          },
        ],
      };
      expect(response.choices).toHaveLength(2);
      expect(response.choices[0].message.content).toBe('First response');
      expect(response.choices[1].message.content).toBe('Second response');
    });
  });

  describe('Type Validation and Structure - Comprehensive Tests', () => {
    describe('OpenRouterConfig - comprehensive validation', () => {
      it('should enforce apiKey as required field', () => {
        // This is a compile-time check, but we verify the shape
        const config: OpenRouterConfig = {
          apiKey: 'sk-test-key-12345',
        };
        expect(config).toHaveProperty('apiKey');
        expect(config.apiKey).toBe('sk-test-key-12345');
      });

      it('should support complex defaultParams', () => {
        const config: OpenRouterConfig = {
          apiKey: 'test-key',
          defaultParams: {
            temperature: 0.7,
            max_tokens: 2000,
            top_p: 0.9,
            presence_penalty: 0.5,
            frequency_penalty: 0.2,
          },
        };
        expect(config.defaultParams).toEqual({
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 0.9,
          presence_penalty: 0.5,
          frequency_penalty: 0.2,
        });
      });

      it('should support different model names', () => {
        const models = ['gpt-4', 'gpt-3.5-turbo', 'claude-2', 'anthropic/claude-2', 'openai/gpt-4'];

        models.forEach((model) => {
          const config: OpenRouterConfig = {
            apiKey: 'test-key',
            defaultModel: model,
          };
          expect(config.defaultModel).toBe(model);
        });
      });

      it('should support custom baseUrl values', () => {
        const baseUrls = [
          'https://api.openrouter.ai/api/v1',
          'https://custom-endpoint.com/api/v1',
          'http://localhost:8000/api/v1',
        ];

        baseUrls.forEach((baseUrl) => {
          const config: OpenRouterConfig = {
            apiKey: 'test-key',
            baseUrl,
          };
          expect(config.baseUrl).toBe(baseUrl);
        });
      });

      it('should allow empty defaultParams object', () => {
        const config: OpenRouterConfig = {
          apiKey: 'test-key',
          defaultParams: {},
        };
        expect(config.defaultParams).toEqual({});
      });

      it('should preserve parameter types in defaultParams', () => {
        const config: OpenRouterConfig = {
          apiKey: 'test-key',
          defaultParams: {
            stringValue: 'text',
            numberValue: 42,
            booleanValue: true,
            nullValue: null,
            objectValue: { nested: 'object' },
            arrayValue: [1, 2, 3],
          },
        };

        expect(typeof config.defaultParams?.stringValue).toBe('string');
        expect(typeof config.defaultParams?.numberValue).toBe('number');
        expect(typeof config.defaultParams?.booleanValue).toBe('boolean');
        expect(config.defaultParams?.nullValue).toBeNull();
        expect(typeof config.defaultParams?.objectValue).toBe('object');
        expect(Array.isArray(config.defaultParams?.arrayValue)).toBe(true);
      });
    });

    describe('GetStructuredResponseOptions - comprehensive validation', () => {
      it('should work with different Zod schema types', () => {
        // Simple object schema
        const simpleSchema = z.object({ name: z.string() });
        const simpleOptions: GetStructuredResponseOptions<typeof simpleSchema> = {
          systemPrompt: 'System',
          userPrompt: 'User',
          responseSchema: simpleSchema,
        };
        expect(simpleOptions.responseSchema).toBe(simpleSchema);

        // Complex schema with nested objects
        const complexSchema = z.object({
          user: z.object({
            name: z.string(),
            email: z.string(),
            preferences: z.record(z.string(), z.boolean()),
          }),
          metadata: z.object({
            createdAt: z.date(),
            tags: z.array(z.string()),
          }),
        });
        const complexOptions: GetStructuredResponseOptions<typeof complexSchema> = {
          systemPrompt: 'System',
          userPrompt: 'User',
          responseSchema: complexSchema,
        };
        expect(complexOptions.responseSchema).toBe(complexSchema);
      });

      it('should support empty params object', () => {
        const schema = z.object({ name: z.string() });
        const options: GetStructuredResponseOptions<typeof schema> = {
          systemPrompt: 'System',
          userPrompt: 'User',
          responseSchema: schema,
          params: {},
        };
        expect(options.params).toEqual({});
      });

      it('should preserve complex parameter structures', () => {
        const schema = z.object({ name: z.string() });
        const options: GetStructuredResponseOptions<typeof schema> = {
          systemPrompt: 'System',
          userPrompt: 'User',
          responseSchema: schema,
          params: {
            temperature: 0.7,
            stop: ['END'],
            logit_bias: { '123': 1, '456': -1 },
            top_k: 50,
            functions: [{ name: 'test', description: 'Test function' }],
          },
        };
        expect(options.params).toMatchObject({
          temperature: 0.7,
          stop: ['END'],
          logit_bias: { '123': 1, '456': -1 },
          top_k: 50,
        });
      });

      it('should support different model specifications', () => {
        const schema = z.object({ result: z.string() });
        const models = ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'claude-2.1'];

        models.forEach((model) => {
          const options: GetStructuredResponseOptions<typeof schema> = {
            systemPrompt: 'System',
            userPrompt: 'User',
            responseSchema: schema,
            model,
          };
          expect(options.model).toBe(model);
        });
      });

      it('should preserve all optional fields correctly', () => {
        const schema = z.object({ test: z.string() });
        const options: GetStructuredResponseOptions<typeof schema> = {
          systemPrompt: 'You are a helpful assistant',
          userPrompt: 'Generate a response',
          responseSchema: schema,
          model: 'gpt-4',
          params: {
            temperature: 0.5,
            max_tokens: 1000,
          },
        };

        expect(options.systemPrompt).toBe('You are a helpful assistant');
        expect(options.userPrompt).toBe('Generate a response');
        expect(options.model).toBe('gpt-4');
        expect(options.params).toEqual({
          temperature: 0.5,
          max_tokens: 1000,
        });
      });
    });

    describe('OpenRouterResponse - comprehensive validation', () => {
      it('should support empty choices array', () => {
        const response: OpenRouterResponse = {
          choices: [],
        };
        expect(response.choices).toHaveLength(0);
      });

      it('should support very large content strings', () => {
        const largeContent = 'A'.repeat(10000);
        const response: OpenRouterResponse = {
          choices: [
            {
              message: {
                content: largeContent,
              },
            },
          ],
        };
        expect(response.choices[0].message.content.length).toBe(10000);
      });

      it('should support multiline content', () => {
        const multilineContent = `This is line 1
This is line 2
This is line 3

And this has empty lines`;
        const response: OpenRouterResponse = {
          choices: [
            {
              message: {
                content: multilineContent,
              },
            },
          ],
        };
        expect(response.choices[0].message.content).toContain('line 1');
        expect(response.choices[0].message.content).toContain('empty lines');
      });

      it('should preserve content with special characters', () => {
        const specialContent = 'Hello! @#$%^&*() 中文 🎉 \n\t';
        const response: OpenRouterResponse = {
          choices: [
            {
              message: {
                content: specialContent,
              },
            },
          ],
        };
        expect(response.choices[0].message.content).toBe(specialContent);
      });

      it('should support many choices in array', () => {
        const manyChoices = Array.from({ length: 10 }, (_, i) => ({
          message: {
            content: `Response ${i + 1}`,
          },
        }));
        const response: OpenRouterResponse = {
          choices: manyChoices,
        };
        expect(response.choices).toHaveLength(10);
        expect(response.choices[5].message.content).toBe('Response 6');
      });

      it('should maintain content integrity with JSON in response', () => {
        const jsonContent = JSON.stringify({
          data: { nested: 'value' },
          array: [1, 2, 3],
        });
        const response: OpenRouterResponse = {
          choices: [
            {
              message: {
                content: jsonContent,
              },
            },
          ],
        };
        expect(response.choices[0].message.content).toBe(jsonContent);
        expect(() => JSON.parse(response.choices[0].message.content)).not.toThrow();
      });

      it('should handle empty string content', () => {
        const response: OpenRouterResponse = {
          choices: [
            {
              message: {
                content: '',
              },
            },
          ],
        };
        expect(response.choices[0].message.content).toBe('');
      });

      it('should support nested choice structures', () => {
        const response: OpenRouterResponse = {
          choices: [
            {
              message: {
                content: 'Choice 1',
              },
            },
            {
              message: {
                content: 'Choice 2',
              },
            },
            {
              message: {
                content: 'Choice 3',
              },
            },
          ],
        };

        response.choices.forEach((choice, index) => {
          expect(choice.message).toBeDefined();
          expect(choice.message.content).toBe(`Choice ${index + 1}`);
        });
      });
    });

    describe('Type Structure Integrity', () => {
      it('should enforce correct OpenRouterConfig structure', () => {
        const config: OpenRouterConfig = {
          apiKey: 'key',
          baseUrl: 'url',
          defaultModel: 'model',
          defaultParams: { temp: 0.5 },
        };

        const keys = Object.keys(config);
        expect(keys).toContain('apiKey');
        expect(keys).toContain('baseUrl');
        expect(keys).toContain('defaultModel');
        expect(keys).toContain('defaultParams');
      });

      it('should enforce correct GetStructuredResponseOptions structure', () => {
        const schema = z.object({ test: z.string() });
        const options: GetStructuredResponseOptions<typeof schema> = {
          systemPrompt: 'prompt',
          userPrompt: 'prompt',
          responseSchema: schema,
          model: 'model',
          params: { key: 'value' },
        };

        const keys = Object.keys(options);
        expect(keys).toContain('systemPrompt');
        expect(keys).toContain('userPrompt');
        expect(keys).toContain('responseSchema');
        expect(keys).toContain('model');
        expect(keys).toContain('params');
      });

      it('should enforce correct OpenRouterResponse structure', () => {
        const response: OpenRouterResponse = {
          choices: [
            {
              message: {
                content: 'test',
              },
            },
          ],
        };

        expect(response).toHaveProperty('choices');
        expect(Array.isArray(response.choices)).toBe(true);
        expect(response.choices[0]).toHaveProperty('message');
        expect(response.choices[0].message).toHaveProperty('content');
      });
    });
  });
});
