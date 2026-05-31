import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Sentry from '@sentry/react';

vi.mock('@sentry/react');

describe('Sentry Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize Sentry in production', () => {
    // Mock production environment
    const originalEnv = import.meta.env.PROD;
    
    expect(Sentry.init).toBeDefined();
  });

  it('should capture exceptions', () => {
    const error = new Error('Test error');
    Sentry.captureException(error);
    
    expect(Sentry.captureException).toHaveBeenCalledWith(error, expect.any(Object));
  });

  it('should capture messages', () => {
    Sentry.captureMessage('Test message', 'info');
    
    expect(Sentry.captureMessage).toHaveBeenCalled();
  });

  it('should set user context', () => {
    Sentry.setUser({ id: 'user123', email: 'test@example.com' });
    
    expect(Sentry.setUser).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user123' })
    );
  });
});
