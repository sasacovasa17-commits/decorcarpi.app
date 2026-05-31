import { describe, it, expect, vi } from "vitest";

// Mock the LLM and image generation modules
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          walls: [
            { id: "wall_1", description: "Parete frontale", percentage: 50, currentColor: "bianco" },
            { id: "wall_2", description: "Parete laterale", percentage: 30, currentColor: "grigio chiaro" }
          ],
          totalWalls: 2,
          roomType: "soggiorno"
        })
      }
    }]
  })
}));

vi.mock("./_core/imageGeneration", () => ({
  generateImage: vi.fn().mockResolvedValue({ url: "https://example.com/result.jpg" })
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://example.com/uploaded.jpg", key: "test-key" }),
  storageGet: vi.fn().mockResolvedValue({ url: "https://example.com/get.jpg", key: "test-key" })
}));

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null)
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true)
}));

describe("Vernice AI Router", () => {
  it("should have the vernice router defined in appRouter", async () => {
    const { appRouter } = await import("./routers");
    expect(appRouter).toBeDefined();
    // Check that vernice procedures exist
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain("vernice.uploadPhoto");
    expect(procedures).toContain("vernice.detectWalls");
    expect(procedures).toContain("vernice.applyColor");
  });

  it("vernice.uploadPhoto should accept base64 and fileName", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller({} as any);
    
    const result = await caller.vernice.uploadPhoto({
      base64: "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
      fileName: "test-room.jpg",
    });
    
    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("url");
    expect(result.url).toContain("example.com");
  });

  it("vernice.detectWalls should return wall detection results", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller({} as any);
    
    const result = await caller.vernice.detectWalls({
      imageUrl: "https://example.com/room.jpg",
    });
    
    expect(result).toHaveProperty("walls");
    expect(result).toHaveProperty("totalWalls");
    expect(result).toHaveProperty("roomType");
    expect(result.walls.length).toBeGreaterThan(0);
    expect(result.walls[0]).toHaveProperty("id");
    expect(result.walls[0]).toHaveProperty("description");
    expect(result.walls[0]).toHaveProperty("percentage");
    expect(result.walls[0]).toHaveProperty("currentColor");
  });

  it("vernice.applyColor should return generated image URL", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller({} as any);
    
    const result = await caller.vernice.applyColor({
      originalImageUrl: "https://example.com/room.jpg",
      colorHex: "#E63946",
      colorName: "Rosso Vibrante",
      wallId: "wall_1",
      wallDescription: "Parete frontale",
      sessionId: "test-session-123",
    });
    
    expect(result).toHaveProperty("url");
    expect(result.url).toContain("example.com");
  });

  it("vernice.applyColor should throw LIMIT_REACHED when over free limit", async () => {
    // Re-mock getDb to return a db with usage over limit
    const { getDb } = await import("./db");
    (getDb as any).mockResolvedValueOnce({
      select: () => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([{ generationsUsed: 999 }])
          })
        })
      })
    });

    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller({} as any);
    
    await expect(caller.vernice.applyColor({
      originalImageUrl: "https://example.com/room.jpg",
      colorHex: "#E63946",
      wallId: "wall_1",
      wallDescription: "Parete frontale",
      sessionId: "test-session-limited",
    })).rejects.toThrow("LIMIT_REACHED");
  });
});
