/**
 * Sentry Configuration - Error Tracking & Monitoring
 */

import * as Sentry from '@sentry/react';

export function initSentry() {
  // Only initialize in production
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN || '',
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
    });
  }
}

export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

export function setUser(userId: string, email?: string, name?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username: name,
  });
}

export function clearUser() {
  Sentry.setUser(null);
}
