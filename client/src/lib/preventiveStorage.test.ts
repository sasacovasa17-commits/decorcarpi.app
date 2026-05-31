/**
 * preventiveStorage.test.ts
 * Test vitest pentru core logic localStorage
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  addPreventive,
  getPreventives,
  updatePreventiveClientData,
  deletePreventive,
  generatePreventiveHTML,
  editPreventivePricing,
  type ClientData,
} from './preventiveStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Setup localStorage mock - global assignment
(global as any).localStorage = localStorageMock;

describe('preventiveStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should add a Preventivi to localStorage', () => {
    const clientData: ClientData = {
      nome: 'Test Client',
      email: 'test@example.com',
      telefono: '3334567890',
      codiceFiscale: 'ABC123DEF456',
    };

    const Preventivi = addPreventive(
      clientData,
      'Stucchi',
      'Test description',
      100,
      10,
      110
    );

    expect(Preventivi.id).toBeDefined();
    expect(Preventivi.clientData.nome).toBe('Test Client');
    expect(Preventivi.calculator).toBe('Stucchi');
    expect(Preventivi.Totale).toBe(110);
  });

  it('should retrieve all preventives', () => {
    const clientData: ClientData = {
      nome: 'Test Client',
      email: 'test@example.com',
      telefono: '3334567890',
      codiceFiscale: 'ABC123DEF456',
    };

    addPreventive(clientData, 'Stucchi', 'Test 1', 100, 10, 110);
    addPreventive(clientData, 'Vernice', 'Test 2', 50, 5, 55);

    const preventives = getPreventives();
    expect(preventives).toHaveLength(2);
  });

  it('should update a Preventivi', () => {
    const clientData: ClientData = {
      nome: 'Test Client',
      email: 'test@example.com',
      telefono: '3334567890',
      codiceFiscale: 'ABC123DEF456',
    };

    const Preventivi = addPreventive(
      clientData,
      'Stucchi',
      'Original',
      100,
      10,
      110
    );

    const updated = updatePreventiveClientData(Preventivi.id, {
      nome: 'Updated Client',
      email: 'updated@example.com',
    });

    expect(updated).not.toBeNull();
    const preventives = getPreventives();
    expect(updated?.clientData.nome).toBe('Updated Client');
  });

  it('should delete a Preventivi', () => {
    const clientData: ClientData = {
      nome: 'Test Client',
    };

    const Preventivi = addPreventive(
      clientData,
      'Stucchi',
      'Test',
      100,
      10,
      110
    );

    const deleted = deletePreventive(Preventivi.id);
    expect(deleted).toBe(true);
    expect(getPreventives()).toHaveLength(0);
  });

  it('should generate Preventivi HTML', () => {
    const clientData: ClientData = {
      nome: 'Test Client',
    };

    const Preventivi = addPreventive(
      clientData,
      'Stucchi',
      'Test',
      100,
      10,
      110
    );

    const html = generatePreventiveHTML(Preventivi);
    expect(html).toContain('PREVENTIVO');
    expect(html).toContain('Test Client');
    expect(html).toContain('110');
  });

  it('should edit Preventivi pricing', () => {
    const clientData: ClientData = {
      nome: 'Test Client',
    };

    const Preventivi = addPreventive(
      clientData,
      'Stucchi',
      'Test',
      100,
      10,
      110
    );

    const updated = editPreventivePricing(Preventivi.id, 150, 15, 'Updated description');
    expect(updated).toBe(true);

    const preventives = getPreventives();
    expect(preventives[0].subtotal).toBe(150);
    expect(preventives[0].others).toBe(15);
    expect(preventives[0].Totale).toBe(165);
    expect(preventives[0].description).toBe('Updated description');
  });
});
