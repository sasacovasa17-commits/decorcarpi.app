import { describe, it, expect } from 'vitest';
import { translations, useTranslationExtended } from '../client/src/lib/i18n-extended';

describe('Translation System', () => {
  it('should have all languages', () => {
    expect(translations).toHaveProperty('it');
    expect(translations).toHaveProperty('ro');
    expect(translations).toHaveProperty('en');
  });

  it('should have same keys for all languages', () => {
    const itKeys = Object.keys(translations.it).sort();
    const roKeys = Object.keys(translations.ro).sort();
    const enKeys = Object.keys(translations.en).sort();

    expect(itKeys).toEqual(roKeys);
    expect(itKeys).toEqual(enKeys);
  });

  it('should return Italian translations by default', () => {
    const t = useTranslationExtended('it');
    expect(t.appName).toBe('DECOR CARPI');
    expect(t.appSubtitle).toBe('VISUALIZZATORE TEXTURE');
  });

  it('should return Romanian translations', () => {
    const t = useTranslationExtended('ro');
    expect(t.appName).toBe('DECOR CARPI');
    expect(t.appSubtitle).toBe('VIZUALIZATOR TEXTURI');
  });

  it('should return English translations', () => {
    const t = useTranslationExtended('en');
    expect(t.appName).toBe('DECOR CARPI');
    expect(t.appSubtitle).toBe('TEXTURE VISUALIZER');
  });

  it('should have all notification keys translated', () => {
    const notificationKeys = [
      'salvatoConSuccesso',
      'erroreDiCaricamento',
      'generazioneInCorso',
      'imagineGenerata',
      'immagineSalvata',
      'erroreSalvataggio',
    ];

    notificationKeys.forEach((key) => {
      expect(translations.it).toHaveProperty(key);
      expect(translations.ro).toHaveProperty(key);
      expect(translations.en).toHaveProperty(key);
    });
  });

  it('should have all PDF export keys translated', () => {
    const pdfKeys = ['esportaPDF', 'generandoPDF', 'pdfGenerato', 'errorePDF'];

    pdfKeys.forEach((key) => {
      expect(translations.it).toHaveProperty(key);
      expect(translations.ro).toHaveProperty(key);
      expect(translations.en).toHaveProperty(key);
    });
  });

  it('should have all toast keys translated', () => {
    const toastKeys = ['toastSuccess', 'toastError', 'toastWarning', 'toastInfo'];

    toastKeys.forEach((key) => {
      expect(translations.it).toHaveProperty(key);
      expect(translations.ro).toHaveProperty(key);
      expect(translations.en).toHaveProperty(key);
    });
  });

  it('should have all UI element keys translated', () => {
    const uiKeys = [
      'home',
      'combina',
      'stili',
      'prev',
      'ispir',
      'impost',
      'cont',
      'prog',
      'genera',
      'salva',
      'scarica',
      'condividi',
      'whatsapp',
      'email',
    ];

    uiKeys.forEach((key) => {
      expect(translations.it).toHaveProperty(key);
      expect(translations.ro).toHaveProperty(key);
      expect(translations.en).toHaveProperty(key);
    });
  });

  it('should have all filter keys translated', () => {
    const filterKeys = ['brightness', 'contrast', 'saturation', 'hue', 'blur', 'opacity'];

    filterKeys.forEach((key) => {
      expect(translations.it).toHaveProperty(key);
      expect(translations.ro).toHaveProperty(key);
      expect(translations.en).toHaveProperty(key);
    });
  });

  it('should have all button keys translated', () => {
    const buttonKeys = ['applica', 'annulla', 'indietro', 'avanti'];

    buttonKeys.forEach((key) => {
      expect(translations.it).toHaveProperty(key);
      expect(translations.ro).toHaveProperty(key);
      expect(translations.en).toHaveProperty(key);
    });
  });
});

describe('Toast Notifications', () => {
  it('should have success toast message', () => {
    expect(translations.it.toastSuccess).toBe('Operazione completata!');
    expect(translations.ro.toastSuccess).toBe('Operație completată!');
    expect(translations.en.toastSuccess).toBe('Operation completed!');
  });

  it('should have error toast message', () => {
    expect(translations.it.toastError).toBe('Si è verificato un errore');
    expect(translations.ro.toastError).toBe('A apărut o eroare');
    expect(translations.en.toastError).toBe('An error occurred');
  });

  it('should have warning toast message', () => {
    expect(translations.it.toastWarning).toBe('Attenzione');
    expect(translations.ro.toastWarning).toBe('Avertisment');
    expect(translations.en.toastWarning).toBe('Warning');
  });

  it('should have info toast message', () => {
    expect(translations.it.toastInfo).toBe('Informazione');
    expect(translations.ro.toastInfo).toBe('Informație');
    expect(translations.en.toastInfo).toBe('Information');
  });
});

describe('PDF Export Translations', () => {
  it('should have PDF export button text', () => {
    expect(translations.it.esportaPDF).toBe('Esporta PDF');
    expect(translations.ro.esportaPDF).toBe('Exportă PDF');
    expect(translations.en.esportaPDF).toBe('Export PDF');
  });

  it('should have PDF generating message', () => {
    expect(translations.it.generandoPDF).toBe('Generazione PDF in corso...');
    expect(translations.ro.generandoPDF).toBe('Se generează PDF...');
    expect(translations.en.generandoPDF).toBe('Generating PDF...');
  });

  it('should have PDF generated success message', () => {
    expect(translations.it.pdfGenerato).toBe('PDF generato con successo!');
    expect(translations.ro.pdfGenerato).toBe('PDF generat cu succes!');
    expect(translations.en.pdfGenerato).toBe('PDF generated successfully!');
  });

  it('should have PDF error message', () => {
    expect(translations.it.errorePDF).toBe('Errore durante la generazione del PDF');
    expect(translations.ro.errorePDF).toBe('Eroare la generarea PDF');
    expect(translations.en.errorePDF).toBe('Error generating PDF');
  });
});
