/**
 * Error Handler Utilities
 * Centralized error handling cu toast notifications
 */

export type ErrorType = 
  | 'network'
  | 'validation'
  | 'auth'
  | 'rate_limit'
  | 'server'
  | 'unknown';

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Mappa gli errori tRPC a messaggi amichevoli
 */
export function parseError(error: unknown): AppError {
  // Errori tRPC
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = String(error.message);
    
    if (msg.includes('Rate exceeded')) {
      return {
        type: 'rate_limit',
        message: 'Hai superato il limite di generazioni gratuite. Esegui l\'upgrade a PRO!',
        code: 'RATE_EXCEEDED',
      };
    }
    
    if (msg.includes('Email invalid')) {
      return {
        type: 'validation',
        message: 'Email non valido. Verifica e riprova.',
        code: 'INVALID_EMAIL',
      };
    }
    
    if (msg.includes('prea scurt')) {
      return {
        type: 'validation',
        message: msg,
        code: 'VALIDATION_ERROR',
      };
    }
    
    if (msg.includes('not configured')) {
      return {
        type: 'server',
        message: 'Servizio non disponibile. Riprova più tardi.',
        code: 'SERVICE_UNAVAILABLE',
      };
    }
  }
  
  // Errori fetch/network
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: 'network',
      message: 'Errore di connessione. Verifica la connessione internet e riprova.',
      code: 'NETWORK_ERROR',
      details: error,
    };
  }
  
  // Errori generici
  if (error instanceof Error) {
    return {
      type: 'unknown',
      message: error.message || 'Errore sconosciuto. Riprova.',
      code: 'UNKNOWN_ERROR',
      details: error,
    };
  }
  
  return {
    type: 'unknown',
    message: 'Errore sconosciuto. Riprova.',
    code: 'UNKNOWN_ERROR',
    details: error,
  };
}

/**
 * Determina il tipo di toast in base all'errore
 */
export function getToastType(errorType: ErrorType): 'error' | 'warning' | 'info' {
  switch (errorType) {
    case 'rate_limit':
      return 'warning';
    case 'validation':
      return 'error';
    case 'network':
      return 'error';
    case 'auth':
      return 'error';
    case 'server':
      return 'error';
    default:
      return 'error';
  }
}

/**
 * Registra gli errori per il debug
 */
export function logError(error: AppError, context?: string) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    context,
    type: error.type,
    code: error.code,
    message: error.message,
    details: error.details,
  };
  
  // Log în console pentru development
  if (process.env.NODE_ENV === 'development') {
    console.error('[AppError]', logEntry);
  }
  
  // Puoi aggiungere il logging al backend qui se vuoi
  // await fetch('/api/logs', { method: 'POST', body: JSON.stringify(logEntry) });
}

/**
 * Valida input comuni
 */
export function validateContactForm(data: {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}): AppError | null {
  if (!data.name || data.name.length < 2) {
    return {
      type: 'validation',
      message: 'Nome troppo breve (minimo 2 caratteri)',
      code: 'INVALID_NAME',
    };
  }
  
  if (!data.email || !data.email.includes('@')) {
    return {
      type: 'validation',
      message: 'Email invalid',
      code: 'INVALID_EMAIL',
    };
  }
  
  if (!data.phone || data.phone.length < 5) {
    return {
      type: 'validation',
      message: 'Telefono non valido (minimo 5 caratteri)',
      code: 'INVALID_PHONE',
    };
  }
  
  if (!data.message || data.message.length < 10) {
    return {
      type: 'validation',
      message: 'Messaggio troppo breve (minimo 10 caratteri)',
      code: 'INVALID_MESSAGE',
    };
  }
  
  return null;
}

/**
 * Logica di retry per operazioni che possono fallire
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (i < maxRetries - 1) {
        // Backoff esponenziale
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
}
