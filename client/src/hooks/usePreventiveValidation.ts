import { useState, useCallback } from 'react';

export interface ValidationErrors {
  clientName?: string;
  clientCF?: string;
  clientAddress?: string;
  projectDescription?: string;
  items?: string;
}

export function usePreventiveValidation() {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validate = useCallback((data: {
    clientName: string;
    clientCF: string;
    clientAddress: string;
    projectDescription: string;
    items: any[];
  }): boolean => {
    const newErrors: ValidationErrors = {};

    // Validazione client name
    if (!data.clientName || data.clientName.trim().length === 0) {
      newErrors.clientName = 'Nome cliente è obbligatorio';
    } else if (data.clientName.trim().length < 2) {
      newErrors.clientName = 'Nome cliente deve avere almeno 2 caratteri';
    }

    // Validazione client CF
    if (!data.clientCF || data.clientCF.trim().length === 0) {
      newErrors.clientCF = 'C.F./P.IVA è obbligatorio';
    } else if (data.clientCF.trim().length < 5) {
      newErrors.clientCF = 'C.F./P.IVA non valido';
    }

    // Validazione indirizzo
    if (!data.clientAddress || data.clientAddress.trim().length === 0) {
      newErrors.clientAddress = 'Indirizzo è obbligatorio';
    } else if (data.clientAddress.trim().length < 5) {
      newErrors.clientAddress = 'Indirizzo deve avere almeno 5 caratteri';
    }

    // Validazione descrizione
    if (!data.projectDescription || data.projectDescription.trim().length === 0) {
      newErrors.projectDescription = 'Descrizione lavori è obbligatoria';
    } else if (data.projectDescription.trim().length < 10) {
      newErrors.projectDescription = 'Descrizione deve avere almeno 10 caratteri';
    }

    // Validazione articoli
    if (!data.items || data.items.length === 0) {
      newErrors.items = 'Aggiungi almeno un articolo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearError = useCallback((field: keyof ValidationErrors) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    errors,
    validate,
    clearErrors,
    clearError,
  };
}
