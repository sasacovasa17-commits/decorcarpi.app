import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("render.generate input validation", () => {
  it("accepts color-only generation (no textureId)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // This should NOT throw a validation error for missing textureId
    // It will throw a different error (e.g., image generation failure) but NOT "Texture non trovata"
    try {
      await caller.render.generate({
        originalImageUrl: "https://example.com/room.jpg",
        colorHex: "#721C1C",
        intensity: 80,
        sessionId: "test-session-color",
        zone: "full",
        
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Should NOT be a texture validation error
      expect(msg).not.toBe("Texture non trovata");
      expect(msg).not.toBe("Seleziona una texture o un colore");
    }
  });

  it("rejects generation with neither texture nor color", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.render.generate({
        originalImageUrl: "https://example.com/room.jpg",
        intensity: 80,
        sessionId: "test-session-empty",
        zone: "full",
        
      });
      // Should not reach here
      expect(true).toBe(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      expect(msg).toBe("Seleziona una texture o un colore");
    }
  });

  it("accepts texture-only generation (no colorHex)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.render.generate({
        originalImageUrl: "https://example.com/room.jpg",
        textureId: "marmorino",
        intensity: 80,
        sessionId: "test-session-texture",
        zone: "full",
        
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Should NOT be a texture/color validation error
      expect(msg).not.toBe("Texture non trovata");
      expect(msg).not.toBe("Seleziona una texture o un colore");
    }
  });

  it("rejects invalid textureId", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.render.generate({
        originalImageUrl: "https://example.com/room.jpg",
        textureId: "non-existent-texture",
        intensity: 80,
        sessionId: "test-session-invalid",
        zone: "full",
        
      });
      expect(true).toBe(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      expect(msg).toBe("Texture non trovata");
    }
  });
});
