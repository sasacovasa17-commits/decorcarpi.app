import { describe, it, expect } from "vitest";
import { RoomIcon, LightingIcon, StyleIcon } from "./ProfessionalIcons";
import { render } from "@testing-library/react";

describe("ProfessionalIcons", () => {
  describe("RoomIcon", () => {
    it("renders room icon with correct size", () => {
      const { container } = render(<RoomIcon id="soggiorno" size={24} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute("width")).toBe("24");
      expect(svg?.getAttribute("height")).toBe("24");
    });

    it("renders all room types", () => {
      const roomTypes = ["soggiorno", "cucina", "camera", "bagno", "ufficio", "sala"] as const;
      roomTypes.forEach((roomType) => {
        const { container } = render(<RoomIcon id={roomType} size={20} />);
        const svg = container.querySelector("svg");
        expect(svg).toBeTruthy();
      });
    });

    it("applies custom color", () => {
      const { container } = render(<RoomIcon id="soggiorno" size={20} color="#c9a227" />);
      const svg = container.querySelector("svg");
      expect(svg?.style.color).toBe("rgb(201, 162, 39)");
    });
  });

  describe("LightingIcon", () => {
    it("renders lighting icon with correct size", () => {
      const { container } = render(<LightingIcon id="naturale" size={24} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute("width")).toBe("24");
      expect(svg?.getAttribute("height")).toBe("24");
    });

    it("renders all lighting types", () => {
      const lightingTypes = ["naturale", "calda", "fredda", "mista"] as const;
      lightingTypes.forEach((lightingType) => {
        const { container } = render(<LightingIcon id={lightingType} size={18} />);
        const svg = container.querySelector("svg");
        expect(svg).toBeTruthy();
      });
    });
  });

  describe("StyleIcon", () => {
    it("renders style icon with correct size", () => {
      const { container } = render(<StyleIcon id="moderno" size={24} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute("width")).toBe("24");
      expect(svg?.getAttribute("height")).toBe("24");
    });

    it("renders all style types", () => {
      const styleTypes = ["minimalista", "classico", "industriale", "rustico", "moderno", "lusso"] as const;
      styleTypes.forEach((styleType) => {
        const { container } = render(<StyleIcon id={styleType} size={16} />);
        const svg = container.querySelector("svg");
        expect(svg).toBeTruthy();
      });
    });

    it("applies custom className", () => {
      const { container } = render(<StyleIcon id="moderno" size={20} className="test-class" />);
      const svg = container.querySelector("svg");
      expect(svg?.classList.contains("test-class")).toBe(true);
    });
  });
});
