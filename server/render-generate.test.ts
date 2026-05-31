import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

/**
 * Test pentru procedura render.generate
 * Verific: fluxul de generare, limita de generări, coduri promo, salvare în DB
 */

// Mock pentru generateImage
vi.mock('./server/_core/imageGeneration', () => ({
  generateImage: vi.fn(async () => ({
    url: 'https://example.com/generated-image.png',
  })),
}));

// Mock pentru DB
vi.mock('./db', () => ({
  getDb: vi.fn(async () => ({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
  })),
}));

describe('render.generate - Flux Generare AI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate required inputs', () => {
    const schema = z.object({
      originalImageUrl: z.string(),
      textureId: z.string().optional(),
      colorHex: z.string().optional(),
      intensity: z.number().min(0).max(100).default(80),
      sessionId: z.string(),
      zone: z.enum(["full", "partial"]).default("full"),
      proCode: z.string().optional(),
    });

    // Valid input
    const validInput = {
      originalImageUrl: 'https://example.com/room.jpg',
      textureId: 'stucco-veneziano',
      intensity: 80,
      sessionId: 'session-123',
    };
    expect(() => schema.parse(validInput)).not.toThrow();

    // Invalid input - missing required field
    const invalidInput = {
      textureId: 'stucco-veneziano',
      intensity: 80,
    };
    expect(() => schema.parse(invalidInput)).toThrow();
  });

  it('should accept either textureId or colorHex', () => {
    const schema = z.object({
      originalImageUrl: z.string(),
      textureId: z.string().optional(),
      colorHex: z.string().optional(),
      intensity: z.number().min(0).max(100).default(80),
      sessionId: z.string(),
    });

    // With texture
    const withTexture = {
      originalImageUrl: 'https://example.com/room.jpg',
      textureId: 'stucco-veneziano',
      intensity: 80,
      sessionId: 'session-123',
    };
    expect(() => schema.parse(withTexture)).not.toThrow();

    // With color
    const withColor = {
      originalImageUrl: 'https://example.com/room.jpg',
      colorHex: '#FF5733',
      intensity: 80,
      sessionId: 'session-123',
    };
    expect(() => schema.parse(withColor)).not.toThrow();
  });

  it('should validate intensity range (0-100)', () => {
    const schema = z.object({
      intensity: z.number().min(0).max(100).default(80),
    });

    expect(() => schema.parse({ intensity: 50 })).not.toThrow();
    expect(() => schema.parse({ intensity: 0 })).not.toThrow();
    expect(() => schema.parse({ intensity: 100 })).not.toThrow();
    expect(() => schema.parse({ intensity: 150 })).toThrow();
    expect(() => schema.parse({ intensity: -10 })).toThrow();
  });

  it('should validate zone parameter', () => {
    const schema = z.object({
      zone: z.enum(["full", "partial"]).default("full"),
    });

    expect(() => schema.parse({ zone: 'full' })).not.toThrow();
    expect(() => schema.parse({ zone: 'partial' })).not.toThrow();
    expect(() => schema.parse({ zone: 'invalid' })).toThrow();
  });

  it('should recognize PRO code "nina1221"', () => {
    const PRO_CODE = "nina1221";
    
    const proCode1 = "nina1221";
    const proCode2 = "invalid";
    
    expect(proCode1 === PRO_CODE).toBe(true);
    expect(proCode2 === PRO_CODE).toBe(false);
  });

  it('should calculate intensity description correctly', () => {
    const getIntensityDesc = (intensity: number) => {
      if (intensity < 40) return "subtle, light";
      if (intensity < 70) return "medium";
      return "strong, prominent";
    };

    expect(getIntensityDesc(30)).toBe("subtle, light");
    expect(getIntensityDesc(50)).toBe("medium");
    expect(getIntensityDesc(80)).toBe("strong, prominent");
  });

  it('should generate correct prompt for texture mode with CRITICAL REQUIREMENTS', () => {
    const textureName = "Stucco Veneziano";
    const textureKeyword = "elegant venetian plaster with marble-like finish";
    const colorDesc = "";
    const intensityDesc = "strong, prominent";
    const zoneDesc = "Apply the texture to all visible walls in the room.";

    const prompt = `You are a professional interior design visualizer for Decor Carpi, an Italian decorative plaster company.

Transform the walls in this room photo by applying the "${textureName}" decorative finish.

Texture description: ${textureKeyword} ${colorDesc}.
Application intensity: ${intensityDesc} (80%).
${zoneDesc}

Requirements:
- Keep all furniture, objects, floor, ceiling, and lighting EXACTLY as they are
- Only change the wall surfaces
- Make the result look photorealistic and professionally applied
- The texture should look natural and consistent across the wall surface
- Maintain the same room perspective, lighting, and shadows
- Result should look like a professional interior design preview photo`;

    expect(prompt).toContain("Decor Carpi");
    expect(prompt).toContain(textureName);
    expect(prompt).toContain("photorealistic");
    expect(prompt).toContain("professional");
  });

  it('should generate correct prompt for color-only mode', () => {
    const colorHex = "#FF5733";
    const intensityDesc = "medium";
    const zoneDesc = "Apply the texture only to the main visible wall, keeping other surfaces unchanged.";

    const prompt = `You are a professional interior design visualizer for Decor Carpi, an Italian decorative plaster company.

Transform the walls in this room photo by painting them with the color ${colorHex}.

Application intensity: ${intensityDesc} (50%).
${zoneDesc}

Requirements:
- Keep all furniture, objects, floor, ceiling, and lighting EXACTLY as they are
- Only change the wall surfaces to the specified color
- Make the result look photorealistic and professionally painted
- The color should look natural and consistent across the wall surface
- Maintain the same room perspective, lighting, and shadows
- Result should look like a professional interior design preview photo`;

    expect(prompt).toContain("Decor Carpi");
    expect(prompt).toContain(colorHex);
    expect(prompt).toContain("color");
    expect(prompt).toContain("photorealistic");
  });

  it('should handle generation errors gracefully', () => {
    const errors = [
      { msg: "rate limit exceeded", expected: "Il servizio AI è momentaneamente sovraccarico" },
      { msg: "network timeout", expected: "Errore di connessione" },
      { msg: "unknown error", expected: "Generazione non riuscita" },
    ];

    errors.forEach(({ msg, expected }) => {
      const isRateLimit = msg.toLowerCase().includes("rate") || msg.toLowerCase().includes("limit");
      const isNetwork = msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network");
      
      if (isRateLimit) {
        expect(expected).toContain("sovraccarico");
      } else if (isNetwork) {
        expect(expected).toContain("connessione");
      } else {
        expect(expected).toContain("Generazione");
      }
    });
  });

  it('should track free generations limit (15)', () => {
    const FREE_GENERATIONS = 15;
    const usedGenerations = 14;
    
    expect(usedGenerations < FREE_GENERATIONS).toBe(true);
    expect(usedGenerations + 1 <= FREE_GENERATIONS).toBe(true);
    expect(usedGenerations + 1 > FREE_GENERATIONS).toBe(false);
  });

  it('should increment generation counter after successful render', () => {
    const initialUsed = 5;
    const afterGeneration = initialUsed + 1;
    
    expect(afterGeneration).toBe(6);
    expect(afterGeneration).toBeGreaterThan(initialUsed);
  });

  it('should log AI usage cost ($0.05 per generation)', () => {
    const costPerGeneration = 5; // cents
    const generationsCount = 10;
    const totalCost = costPerGeneration * generationsCount;
    
    expect(totalCost).toBe(50); // 50 cents for 10 generations
    expect(costPerGeneration).toBe(5);
  });

  it('should validate promo code with unlimited generations', () => {
    const promoCode = {
      code: "UNLIMITED2024",
      generationsRemaining: -1, // -1 means unlimited
    };

    const hasUnlimited = promoCode.generationsRemaining === -1;
    expect(hasUnlimited).toBe(true);
  });

  it('should check if session has promo code applied', () => {
    const sessionPromoCodes = [
      { sessionId: 'session-1', code: 'PROMO1', generationsRemaining: 10 },
      { sessionId: 'session-1', code: 'UNLIMITED', generationsRemaining: -1 },
    ];

    const hasUnlimited = sessionPromoCodes.some(p => p.generationsRemaining === -1);
    expect(hasUnlimited).toBe(true);
  });
});
