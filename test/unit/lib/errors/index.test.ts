import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
} from '@/lib/errors';

describe('errors/index.ts - Centralized exports', () => {
  it('should export AppError', () => {
    expect(AppError).toBeDefined();
    const error = new AppError('test', 400);
    expect(error).toBeInstanceOf(AppError);
  });

  it('should export ValidationError', () => {
    expect(ValidationError).toBeDefined();
    const error = new ValidationError('validation failed');
    expect(error).toBeInstanceOf(ValidationError);
  });

  it('should export UnauthorizedError', () => {
    expect(UnauthorizedError).toBeDefined();
    const error = new UnauthorizedError();
    expect(error).toBeInstanceOf(UnauthorizedError);
  });

  it('should export ForbiddenError', () => {
    expect(ForbiddenError).toBeDefined();
    const error = new ForbiddenError();
    expect(error).toBeInstanceOf(ForbiddenError);
  });

  it('should export NotFoundError', () => {
    expect(NotFoundError).toBeDefined();
    const error = new NotFoundError();
    expect(error).toBeInstanceOf(NotFoundError);
  });

  it('should export ConflictError', () => {
    expect(ConflictError).toBeDefined();
    const error = new ConflictError('conflict');
    expect(error).toBeInstanceOf(ConflictError);
  });

  it('should export DatabaseError', () => {
    expect(DatabaseError).toBeDefined();
    const error = new DatabaseError('db error');
    expect(error).toBeInstanceOf(DatabaseError);
  });

  it('should export ExternalServiceError', () => {
    expect(ExternalServiceError).toBeDefined();
    const error = new ExternalServiceError('service error');
    expect(error).toBeInstanceOf(ExternalServiceError);
  });
});
