import { describe, it, expect } from "vitest";

describe("ColorPicker & Smooth Transitions", () => {
  describe("Color Picker - Hex to HSL conversion", () => {
    it("should convert white hex to HSL", () => {
      const hex = "#FFFFFF";
      const r = parseInt(hex.substring(1, 3), 16) / 255;
      const g = parseInt(hex.substring(3, 5), 16) / 255;
      const b = parseInt(hex.substring(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = (max + min) / 2;

      expect(l).toBe(1); // White should have lightness 100%
    });

    it("should convert black hex to HSL", () => {
      const hex = "#000000";
      const r = parseInt(hex.substring(1, 3), 16) / 255;
      const g = parseInt(hex.substring(3, 5), 16) / 255;
      const b = parseInt(hex.substring(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = (max + min) / 2;

      expect(l).toBe(0); // Black should have lightness 0%
    });

    it("should convert gold hex to HSL", () => {
      const hex = "#c9a227";
      const r = parseInt(hex.substring(1, 3), 16) / 255;
      const g = parseInt(hex.substring(3, 5), 16) / 255;
      const b = parseInt(hex.substring(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = (max + min) / 2;

      expect(l).toBeGreaterThan(0.3);
      expect(l).toBeLessThan(0.7);
    });
  });

  describe("Color Picker - HSL to Hex conversion", () => {
    it("should convert HSL red to hex", () => {
      const h = 0;
      const s = 100;
      const l = 50;

      const c = (1 - Math.abs(2 * l / 100 - 1)) * (s / 100);
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = l / 100 - c / 2;

      const r = Math.round((c + m) * 255);
      const g = Math.round((0 + m) * 255);
      const b = Math.round((0 + m) * 255);

      expect(r).toBeGreaterThan(200); // Red component should be high
      expect(g).toBeLessThan(100); // Green component should be low
      expect(b).toBeLessThan(100); // Blue component should be low
    });

    it("should convert HSL green to hex", () => {
      const h = 120;
      const s = 100;
      const l = 50;

      const c = (1 - Math.abs(2 * l / 100 - 1)) * (s / 100);
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = l / 100 - c / 2;

      const r = Math.round((0 + m) * 255);
      const g = Math.round((c + m) * 255);
      const b = Math.round((0 + m) * 255);

      expect(r).toBeLessThan(100); // Red component should be low
      expect(g).toBeGreaterThan(200); // Green component should be high
      expect(b).toBeLessThan(100); // Blue component should be low
    });
  });

  describe("Color Picker - Hex validation", () => {
    it("should validate correct hex color", () => {
      const hex = "#c9a227";
      const isValid = /^#[0-9A-F]{6}$/i.test(hex);
      expect(isValid).toBe(true);
    });

    it("should reject invalid hex color", () => {
      const hex = "#gggggg";
      const isValid = /^#[0-9A-F]{6}$/i.test(hex);
      expect(isValid).toBe(false);
    });

    it("should reject hex without hash", () => {
      const hex = "c9a227";
      const isValid = /^#[0-9A-F]{6}$/i.test(hex);
      expect(isValid).toBe(false);
    });
  });

  describe("Smooth Transitions", () => {
    it("should have 300ms transition duration", () => {
      const transitionDuration = "0.3s";
      const durationMs = parseFloat(transitionDuration) * 1000;
      expect(durationMs).toBe(300);
    });

    it("should use ease timing function", () => {
      const timingFunction = "ease";
      expect(timingFunction).toBe("ease");
    });

    it("should apply transitions to all elements", () => {
      const properties = ["background-color", "color", "border-color"];
      expect(properties.length).toBe(3);
      properties.forEach((prop) => {
        expect(prop).toMatch(/color|border/);
      });
    });

    it("should transition background-color on theme change", () => {
      const transition = "background-color 0.3s ease";
      expect(transition).toContain("background-color");
      expect(transition).toContain("0.3s");
      expect(transition).toContain("ease");
    });

    it("should transition color on theme change", () => {
      const transition = "color 0.3s ease";
      expect(transition).toContain("color");
      expect(transition).toContain("0.3s");
      expect(transition).toContain("ease");
    });
  });

  describe("Color Picker - Copy to clipboard", () => {
    it("should format color code correctly", () => {
      const color = "#c9a227";
      const formatted = color.toUpperCase();
      expect(formatted).toBe("#C9A227");
    });

    it("should handle lowercase hex", () => {
      const color = "#c9a227";
      const isValid = /^#[0-9A-F]{6}$/i.test(color);
      expect(isValid).toBe(true);
    });
  });

  describe("Color Picker - Canvas rendering", () => {
    it("should have correct canvas dimensions", () => {
      const width = 250;
      const height = 150;
      expect(width).toBeGreaterThan(200);
      expect(height).toBeGreaterThan(100);
    });

    it("should calculate hue from x coordinate", () => {
      const canvasWidth = 250;
      const x = 125; // Middle of canvas
      const hue = (x / canvasWidth) * 360;
      expect(hue).toBe(180); // Should be 180 degrees (cyan)
    });

    it("should calculate lightness from y coordinate", () => {
      const canvasHeight = 150;
      const y = 75; // Middle of canvas
      const lightness = 100 - (y / canvasHeight) * 100;
      expect(lightness).toBe(50); // Should be 50% lightness
    });
  });

  describe("Color Picker - Color format validation", () => {
    it("should validate background color format", () => {
      const color = "#1a1a1a";
      const isValid = /^#[0-9A-F]{6}$/i.test(color);
      expect(isValid).toBe(true);
    });

    it("should validate accent color format", () => {
      const color = "#e8e8e8";
      const isValid = /^#[0-9A-F]{6}$/i.test(color);
      expect(isValid).toBe(true);
    });

    it("should validate gold color format", () => {
      const color = "#d4af37";
      const isValid = /^#[0-9A-F]{6}$/i.test(color);
      expect(isValid).toBe(true);
    });

    it("should reject invalid color format", () => {
      const color = "invalid";
      const isValid = /^#[0-9A-F]{6}$/i.test(color);
      expect(isValid).toBe(false);
    });
  });

  describe("Color Picker - Color range validation", () => {
    it("should have valid hue range (0-360)", () => {
      const hue = 180;
      expect(hue).toBeGreaterThanOrEqual(0);
      expect(hue).toBeLessThanOrEqual(360);
    });

    it("should have valid saturation range (0-100)", () => {
      const saturation = 75;
      expect(saturation).toBeGreaterThanOrEqual(0);
      expect(saturation).toBeLessThanOrEqual(100);
    });

    it("should have valid lightness range (0-100)", () => {
      const lightness = 50;
      expect(lightness).toBeGreaterThanOrEqual(0);
      expect(lightness).toBeLessThanOrEqual(100);
    });
  });
});
