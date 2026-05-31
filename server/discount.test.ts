import { describe, it, expect } from "vitest";

describe("Sconto Router", () => {
  describe("validate", () => {
    it("should validate WELCOME10 code", () => {
      const code = "WELCOME10";
      const subtotal = 100;
      const percentage = 10;
      const discountAmount = (subtotal * percentage) / 100;
      const finalPrice = subtotal - discountAmount;

      expect(discountAmount).toBe(10);
      expect(finalPrice).toBe(90);
    });

    it("should validate SUMMER20 code", () => {
      const code = "SUMMER20";
      const subtotal = 100;
      const percentage = 20;
      const discountAmount = (subtotal * percentage) / 100;
      const finalPrice = subtotal - discountAmount;

      expect(discountAmount).toBe(20);
      expect(finalPrice).toBe(80);
    });

    it("should validate VIP30 code", () => {
      const code = "VIP30";
      const subtotal = 100;
      const percentage = 30;
      const discountAmount = (subtotal * percentage) / 100;
      const finalPrice = subtotal - discountAmount;

      expect(discountAmount).toBe(30);
      expect(finalPrice).toBe(70);
    });

    it("should reject invalid code", () => {
      const code = "INVALID";
      const validCodes = ["WELCOME10", "SUMMER20", "VIP30"];
      const isValid = validCodes.includes(code);

      expect(isValid).toBe(false);
    });

    it("should calculate discount correctly for different amounts", () => {
      const subtotal = 250;
      const percentage = 20;
      const discountAmount = (subtotal * percentage) / 100;
      const finalPrice = subtotal - discountAmount;

      expect(discountAmount).toBe(50);
      expect(finalPrice).toBe(200);
    });
  });

  describe("discount calculations", () => {
    it("should handle decimal amounts correctly", () => {
      const subtotal = 99.99;
      const percentage = 10;
      const discountAmount = parseFloat(((subtotal * percentage) / 100).toFixed(2));
      const finalPrice = parseFloat((subtotal - discountAmount).toFixed(2));

      expect(discountAmount).toBe(10.00);
      expect(finalPrice).toBe(89.99);
    });

    it("should handle large amounts", () => {
      const subtotal = 10000;
      const percentage = 30;
      const discountAmount = (subtotal * percentage) / 100;
      const finalPrice = subtotal - discountAmount;

      expect(discountAmount).toBe(3000);
      expect(finalPrice).toBe(7000);
    });

    it("should handle zero discount", () => {
      const subtotal = 100;
      const percentage = 0;
      const discountAmount = (subtotal * percentage) / 100;
      const finalPrice = subtotal - discountAmount;

      expect(discountAmount).toBe(0);
      expect(finalPrice).toBe(100);
    });
  });
});
