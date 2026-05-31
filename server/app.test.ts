import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter, TEXTURES } from "./routers";

// Mock pentru imageGeneration
vi.mock("./_core/imageGeneration", () => ({
  generateImage: vi.fn().mockResolvedValue({ url: "https://example.com/generated.jpg" }),
}));

// Mock pentru storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "uploads/test/123.jpg", url: "https://example.com/upload.jpg" }),
  storageGet: vi.fn().mockResolvedValue({ key: "uploads/test/123.jpg", url: "https://example.com/upload.jpg" }),
}));

// Mock pentru DB
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null), // DB null = skip DB operations
}));

// Context mock
const mockCtx = {
  req: {
    protocol: "https",
    headers: { "x-forwarded-proto": "https" },
  } as any,
  res: { clearCookie: vi.fn() } as any,
  user: null,
};

const caller = appRouter.createCaller(mockCtx);

describe("TEXTURES catalog", () => {
  it("should have 21 textures", () => {
    expect(TEXTURES).toHaveLength(21);
  });

  it("should have required fields for each texture", () => {
    TEXTURES.forEach((t) => {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(t.imageUrl).toBeTruthy();
      expect(t.promptKeyword).toBeTruthy();
    });
  });

  it("should include craquele texture", () => {
    const craquele = TEXTURES.find((t) => t.id === "craquele");
    expect(craquele).toBeDefined();
    expect(craquele?.name).toContain("Craquèele");
  });
});

describe("textures.list API", () => {
  it("should return all textures", async () => {
    const result = await caller.textures.list();
    expect(result).toHaveLength(21);
    expect(result[0]).toHaveProperty("id");
    expect(result[0]).toHaveProperty("name");
    expect(result[0]).toHaveProperty("imageUrl");
  });
});

describe("upload.image API", () => {
  it("should upload image and return URL", async () => {
    const result = await caller.upload.image({
      base64: Buffer.from("fake-image-data").toString("base64"),
      mimeType: "image/jpeg",
      sessionId: "test-session-123",
    });
    expect(result.url).toBeTruthy();
    expect(result.key).toBeTruthy();
  });
});

describe("render.generate API", () => {
  it("should generate a preview with valid texture", async () => {
    const result = await caller.render.generate({
      originalImageUrl: "https://example.com/room.jpg",
      textureId: "craquele",
      intensity: 80,
      sessionId: "test-session-123",
      zone: "full",
    });
    expect(result.url).toBeTruthy();
  });

  it("should throw error for invalid texture", async () => {
    await expect(
      caller.render.generate({
        originalImageUrl: "https://example.com/room.jpg",
        textureId: "invalid-texture-xyz",
        intensity: 80,
        sessionId: "test-session-123",
        zone: "full",
      })
    ).rejects.toThrow("Texture non trovata");
  });

  it("should include color in prompt when provided", async () => {
    const { generateImage } = await import("./_core/imageGeneration");
    const mockGenerate = vi.mocked(generateImage);
    mockGenerate.mockClear();

    await caller.render.generate({
      originalImageUrl: "https://example.com/room.jpg",
      textureId: "fila-seta",
      colorHex: "#C9A227",
      intensity: 60,
      sessionId: "test-session-456",
      zone: "partial",
    });

    expect(mockGenerate).toHaveBeenCalledOnce();
    const callArgs = mockGenerate.mock.calls[0][0];
    expect(callArgs.prompt).toContain("#C9A227");
    expect(callArgs.prompt).toContain("Fila di Seta");
  });
});

describe("render.history API", () => {
  it("should return empty array when no DB", async () => {
    const result = await caller.render.history({ sessionId: "test-session-no-db" });
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });
});

describe("inspiration API", () => {
  it("should return all categories", async () => {
    const result = await caller.inspiration.categories();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    const allCat = result.find(c => c.id === "all");
    expect(allCat).toBeDefined();
    expect(allCat?.label).toBe("Tutte");
  });

  it("should return images for all category", async () => {
    const result = await caller.inspiration.search({ category: "all" });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("id");
    expect(result[0]).toHaveProperty("url");
    expect(result[0]).toHaveProperty("description");
  });

  it("should return images for decorcarpi category", async () => {
    const result = await caller.inspiration.search({ category: "decorcarpi" });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(9);
  });

  it("should filter by search query", async () => {
    const result = await caller.inspiration.search({ category: "all", query: "stucco" });
    expect(Array.isArray(result)).toBe(true);
    result.forEach(img => {
      const matchesQuery =
        img.description.toLowerCase().includes("stucco") ||
        img.author.toLowerCase().includes("stucco");
      expect(matchesQuery).toBe(true);
    });
  });

  it("should return empty array for unknown query", async () => {
    const result = await caller.inspiration.search({ category: "all", query: "xyznonexistent999" });
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });
});

describe("auth.logout API", () => {
  it("should clear cookie and return success", async () => {
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});
