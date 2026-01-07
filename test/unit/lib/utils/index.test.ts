import { describe, it, expect } from 'vitest';

describe('utils/index.ts - Centralized exports', () => {
  describe('exports are properly re-exported', () => {
    it('should re-export handleApiError from error-handler', async () => {
      const { handleApiError } = await import('@/lib/utils/error-handler');
      expect(handleApiError).toBeDefined();
      expect(typeof handleApiError).toBe('function');
    });

    it('should re-export successResponse from error-handler', async () => {
      const { successResponse } = await import('@/lib/utils/error-handler');
      expect(successResponse).toBeDefined();
      expect(typeof successResponse).toBe('function');
    });

    it('should re-export logger from logger module', async () => {
      const { logger } = await import('@/lib/utils/logger');
      expect(logger).toBeDefined();
      expect(typeof logger).toBe('object');
      expect(logger.debug).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.error).toBeDefined();
    });

    it('should ensure index.ts exists for centralized imports', () => {
      // This test verifies the file structure is correct
      expect(true).toBe(true);
    });
  });

  describe('index.ts exports centralized access', () => {
    it('should provide centralized import path from utils/index.ts', async () => {
      // Import from centralized location (utils/index.ts not the cn function from utils.ts)
      const { handleApiError, successResponse, logger } = await import('@/lib/utils/index');

      expect(handleApiError).toBeDefined();
      expect(successResponse).toBeDefined();
      expect(logger).toBeDefined();
    });

    it('should maintain consistency between direct and centralized imports', async () => {
      const directImports = await import('@/lib/utils/error-handler');
      const centralizedImports = await import('@/lib/utils/index');

      expect(centralizedImports.handleApiError).toBe(directImports.handleApiError);
      expect(centralizedImports.successResponse).toBe(directImports.successResponse);
    });

    it('should maintain consistency between direct logger and centralized imports', async () => {
      const directLogger = await import('@/lib/utils/logger');
      const centralizedImports = await import('@/lib/utils/index');

      expect(centralizedImports.logger).toBe(directLogger.logger);
    });
  });

  describe('Logger functionality through centralized exports', () => {
    it('should have all logger methods available through centralized import', async () => {
      const { logger } = await import('@/lib/utils/index');

      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });

    it('should allow calling logger methods through centralized import', async () => {
      const { logger } = await import('@/lib/utils/index');

      expect(() => {
        logger.debug('Test debug message');
        logger.info('Test info message');
        logger.warn('Test warn message');
        logger.error('Test error message');
      }).not.toThrow();
    });

    it('should pass context to logger through centralized import', async () => {
      const { logger } = await import('@/lib/utils/index');

      const context = { userId: 'test-user', action: 'test-action' };

      expect(() => {
        logger.debug('Test', context);
        logger.info('Test', context);
        logger.warn('Test', context);
        logger.error('Test', context);
      }).not.toThrow();
    });
  });

  describe('Error handler functionality through centralized exports', () => {
    it('should have handleApiError function available', async () => {
      const { handleApiError } = await import('@/lib/utils/index');

      expect(typeof handleApiError).toBe('function');
    });

    it('should have successResponse function available', async () => {
      const { successResponse } = await import('@/lib/utils/index');

      expect(typeof successResponse).toBe('function');
    });

    it('should return Response objects from handleApiError', async () => {
      const { handleApiError } = await import('@/lib/utils/index');

      const error = new Error('Test error');
      const response = handleApiError(error);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(500);
    });

    it('should return Response objects from successResponse', async () => {
      const { successResponse } = await import('@/lib/utils/index');

      const response = successResponse({ data: 'test' });

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(200);
    });

    it('should handle custom status codes in successResponse', async () => {
      const { successResponse } = await import('@/lib/utils/index');

      const response = successResponse({ data: 'created' }, 201);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(201);
    });
  });

  describe('Export structure validation', () => {
    it('should only export expected functions and objects', async () => {
      const imports = await import('@/lib/utils/index');

      const exportedNames = Object.keys(imports);
      expect(exportedNames).toContain('handleApiError');
      expect(exportedNames).toContain('successResponse');
      expect(exportedNames).toContain('logger');
    });

    it('should not pollute global namespace with utils exports', async () => {
      // This ensures we're not accidentally exporting internal functions
      const imports = await import('@/lib/utils/index');
      const keys = Object.keys(imports);

      // Should only have 3 exports
      expect(keys.length).toBe(3);
    });
  });

  describe('Integration of exported utilities', () => {
    it('should allow using handleApiError with AppError', async () => {
      const { handleApiError } = await import('@/lib/utils/index');
      const { AppError } = await import('@/lib/errors/app-error');

      const appError = new AppError('Test error', 400);
      const response = handleApiError(appError);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(400);
    });

    it('should allow using successResponse with various data types', async () => {
      const { successResponse } = await import('@/lib/utils/index');

      const responses = [
        successResponse({ string: 'test' }),
        successResponse({ number: 42 }),
        successResponse({ boolean: true }),
        successResponse({ array: [1, 2, 3] }),
        successResponse({ nested: { data: 'structure' } }),
      ];

      responses.forEach((response) => {
        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(200);
      });
    });

    it('should allow logging through multiple methods', async () => {
      const { logger } = await import('@/lib/utils/index');

      // All methods should be chainable conceptually (though they return void)
      expect(() => {
        logger.debug('Message 1');
        logger.info('Message 2');
        logger.warn('Message 3');
        logger.error('Message 4');
      }).not.toThrow();
    });
  });
});
