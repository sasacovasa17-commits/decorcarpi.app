/**
 * Integration Tests: Preventivi Storage + Calculator Integration
 * Testează conectarea butoanelor "Salva in Miei" din 4 calculatoare
 * EMPLIFIED: Doar nome + Preventivi number auto
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from "vitest";
import { addPreventive, getPreventives, updatePreventiveClientData } from "./preventiveStorage";

describe("Preventivi Storage Integration - 4 Calculators (SIMPLIFIED)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should save Vernice Preventivi with ONLY nome + auto Preventivi number", () => {
    const clientData = {
      nome: "Mario Rossi",
    };

    const Preventivi = addPreventive(clientData, "Vernice", "76 m² - €8-€10/m²", 760, 167, 0, 927);

    expect(Preventivi.preventiveNumber).toBe("PREV-001");
    expect(Preventivi.clientData.nome).toBe("Mario Rossi");
    expect(Preventivi.clientData.email).toBeUndefined();

    const preventives = getPreventives();
    expect(preventives).toHaveLength(1);
    expect(preventives[0].calculator).toBe("Vernice");
    expect(preventives[0].subtotal).toBe(760);
  });

  it("should auto-increment Preventivi numbers", () => {
    // First Preventivi
    addPreventive({ nome: "Mario Rossi" }, "Vernice", "76 m²", 760, 167, 0, 927);
    
    // Second Preventivi
    addPreventive({ nome: "Luigi Bianchi" }, "Stucchi", "50 m²", 600, 132, 0, 732);
    
    // Third Preventivi
    addPreventive({ nome: "Anna Verdi" }, "Antimuffa", "8 m²", 176, 39, 0, 215);

    const preventives = getPreventives();
    expect(preventives).toHaveLength(3);
    expect(preventives[0].preventiveNumber).toBe("PREV-001");
    expect(preventives[1].preventiveNumber).toBe("PREV-002");
    expect(preventives[2].preventiveNumber).toBe("PREV-003");
  });

  it("should allow updating client data after creation", () => {
    const clientData = { nome: "Mario Rossi" };
    const Preventivi = addPreventive(clientData, "Vernice", "76 m²", 760, 167, 0, 927);

    // Update with email and telefono
    const updated = updatePreventiveClientData(Preventivi.id, {
      email: "mario@example.com",
      telefono: "3331234567",
      codiceFiscale: "RSSMRA80A01H501Z",
    });

    expect(updated).toBeDefined();
    expect(updated?.clientData.nome).toBe("Mario Rossi");
    expect(updated?.clientData.email).toBe("mario@example.com");
    expect(updated?.clientData.telefono).toBe("3331234567");
    expect(updated?.clientData.codiceFiscale).toBe("RSSMRA80A01H501Z");
  });

  it("should save multiple preventives from different calculators", () => {
    addPreventive({ nome: "Mario Rossi" }, "Vernice", "76 m²", 760, 167, 0, 927);
    addPreventive({ nome: "Luigi Bianchi" }, "Stucchi", "50 m²", 600, 132, 0, 732);
    addPreventive({ nome: "Anna Verdi" }, "Antimuffa", "8 m²", 176, 39, 0, 215);
    addPreventive({ nome: "Paolo Neri" }, "m² Appartamento", "375 m²", 3000, 660, 0, 3660);

    const preventives = getPreventives();
    expect(preventives).toHaveLength(4);
    expect(preventives[0].calculator).toBe("Vernice");
    expect(preventives[1].calculator).toBe("Stucchi");
    expect(preventives[2].calculator).toBe("Antimuffa");
    expect(preventives[3].calculator).toBe("m² Appartamento");
  });

  it("should calculate Totale correctly with VAT (22%)", () => {
    const subtotal = 1000;
    const vat = Math.round((subtotal * 0.22) * 100) / 100; // 220
    const others = 0;
    const Totale = Math.round((subtotal + vat + others) * 100) / 100; // 1220

    addPreventive(
      { nome: "Test User" },
      "Vernice",
      "100 m²",
      subtotal,
      vat,
      others,
      Totale
    );

    const preventives = getPreventives();
    expect(preventives[0].vat).toBe(220);
    expect(preventives[0].Totale).toBe(1220);
  });

  it("should filter out corrupted preventives without nome", () => {
    // Add valid Preventivi
    addPreventive({ nome: "Mario Rossi" }, "Vernice", "76 m²", 760, 167, 0, 927);

    // Add corrupted Preventivi (manually to localStorage)
    const existing = JSON.parse(localStorage.getItem("decorcarpi_preventivi") || "[]");
    existing.push({
      id: "corrupted",
      preventiveNumber: "PREV-999",
      calculator: "Vernice",
      description: "Corrupted",
      subtotal: 500,
      vat: 110,
      others: 0,
      Totale: 610,
      clientData: {}, // Missing nome
    });
    localStorage.setItem("decorcarpi_preventivi", JSON.stringify(existing));

    // getPreventives should filter out corrupted ones
    const preventives = getPreventives();
    expect(preventives).toHaveLength(1);
    expect(preventives[0].clientData.nome).toBe("Mario Rossi");
  });
});
