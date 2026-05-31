/// <reference types="vitest" />
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// @vitest-environment jsdom
import {
  addPreventive,
  getPreventives,
  deletePreventive,
  updatePreventiveClientData,
  type Preventivi,
} from './preventiveStorage';

describe('preventiveStorage - EDIT functionality', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should update client data (nome, email, telefono, codiceFiscale)', () => {
    // Aggiungi una Preventiva
    const clientData = { nome: 'Mario Rossi' };
    const Preventivi = addPreventive(
      clientData,
      'Vernice',
      '76.0 m² - €8-€10/m²',
      800,
      176,
      0,
      976
    );

    // Aggiorna dati client
    const updated = updatePreventiveClientData(Preventivi.id, {
      nome: 'Mario Rossi Aggiornato',
      email: 'mario@example.com',
      telefono: '+39 123 456 7890',
      codiceFiscale: 'RSSMRA80A01H501Z',
    });

    expect(updated).not.toBeNull();
    expect(updated?.clientData.nome).toBe('Mario Rossi Aggiornato');
    expect(updated?.clientData.email).toBe('mario@example.com');
    expect(updated?.clientData.telefono).toBe('+39 123 456 7890');
    expect(updated?.clientData.codiceFiscale).toBe('RSSMRA80A01H501Z');
  });

  it('should update only some fields (partial update)', () => {
    const clientData = { nome: 'Luigi Bianchi' };
    const Preventivi = addPreventive(
      clientData,
      'Stucchi',
      '100.0 m² - €15-€20/m²',
      1500,
      330,
      0,
      1830
    );

    // Aggiorna solo email
    const updated = updatePreventiveClientData(Preventivi.id, {
      email: 'luigi@example.com',
    });

    expect(updated?.clientData.nome).toBe('Luigi Bianchi');
    expect(updated?.clientData.email).toBe('luigi@example.com');
    expect(updated?.clientData.telefono).toBeUndefined();
    expect(updated?.clientData.codiceFiscale).toBeUndefined();
  });

  it('should persist updated data in localStorage', () => {
    const clientData = { nome: 'Anna Verdi' };
    const Preventivi = addPreventive(
      clientData,
      'Antimuffa',
      '8.0 m² - €22-€35/m²',
      176,
      38.72,
      0,
      214.72
    );

    updatePreventiveClientData(Preventivi.id, {
      email: 'anna@example.com',
      telefono: '+39 987 654 3210',
    });

    // Leggi da localStorage
    const preventives = getPreventives();
    const found = preventives.find(p => p.id === Preventivi.id);

    expect(found?.clientData.email).toBe('anna@example.com');
    expect(found?.clientData.telefono).toBe('+39 987 654 3210');
  });

  it('should return null when updating non-existent Preventivi', () => {
    const result = updatePreventiveClientData('non-existent-id', {
      nome: 'Test',
    });

    expect(result).toBeNull();
  });

  it('should handle empty optional fields', () => {
    const clientData = { nome: 'Giovanni Neri' };
    const Preventivi = addPreventive(
      clientData,
      'm² Appartamento',
      '375.0 m² - €3000-€3750',
      3000,
      660,
      0,
      3660
    );

    // Aggiorna con campi vuoti
    const updated = updatePreventiveClientData(Preventivi.id, {
      email: '',
      telefono: '',
      codiceFiscale: '',
    });

    expect(updated?.clientData.email).toBe('');
    expect(updated?.clientData.telefono).toBe('');
    expect(updated?.clientData.codiceFiscale).toBe('');
  });

  it('should update multiple preventives independently', async () => {
    const p1 = addPreventive(
      { nome: 'Cliente 1' },
      'Vernice',
      '50 m²',
      500,
      110,
      0,
      610
    );

    // Delay pentru a evita ID-uri duplicate
    await new Promise(resolve => setTimeout(resolve, 1));

    const p2 = addPreventive(
      { nome: 'Cliente 2' },
      'Stucchi',
      '100 m²',
      1000,
      220,
      0,
      1220
    );

    updatePreventiveClientData(p1.id, {
      email: 'cliente1@example.com',
    });

    updatePreventiveClientData(p2.id, {
      email: 'cliente2@example.com',
      telefono: '+39 111 222 3333',
    });

    const preventives = getPreventives();
    const updated1 = preventives.find(p => p.id === p1.id);
    const updated2 = preventives.find(p => p.id === p2.id);

    expect(updated1?.clientData.email).toBe('cliente1@example.com');
    expect(updated1?.clientData.telefono).toBeUndefined();

    expect(updated2?.clientData.email).toBe('cliente2@example.com');
    expect(updated2?.clientData.telefono).toBe('+39 111 222 3333');
  });
});
