import { useState, useEffect } from 'react';

export interface CalculationTemplate {
  id: number;
  name: string;
  texture: string;
  discount: number;
  extraWork: number;
  createdAt: number;
}

export function useCalculationTemplates() {
  const [templates, setTemplates] = useState<CalculationTemplate[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carica template-uri din localStorage
  useEffect(() => {
    const saved = localStorage.getItem('calcTemplates');
    if (saved) {
      try {
        setTemplates(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading templates:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveTemplate = (name: string, texture: string, discount: number, extraWork: number) => {
    const newTemplate: CalculationTemplate = {
      id: Date.now(),
      name,
      texture,
      discount,
      extraWork,
      createdAt: Date.now(),
    };
    const updated = [...templates, newTemplate];
    setTemplates(updated);
    localStorage.setItem('calcTemplates', JSON.stringify(updated));
    return newTemplate;
  };

  const deleteTemplate = (id: number) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    localStorage.setItem('calcTemplates', JSON.stringify(updated));
  };

  const updateTemplate = (id: number, updates: Partial<CalculationTemplate>) => {
    const updated = templates.map(t => t.id === id ? { ...t, ...updates } : t);
    setTemplates(updated);
    localStorage.setItem('calcTemplates', JSON.stringify(updated));
  };

  return {
    templates,
    isLoaded,
    saveTemplate,
    deleteTemplate,
    updateTemplate,
  };
}
