import { publicProcedure, router } from "../_core/trpc";

export const testRouter = router({
  echo: publicProcedure
    .input((val: unknown) => {
      console.log("[TEST ROUTER] Input validator called with:", val);
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      return {
        message: String(obj.message || ""),
      };
    })
    .mutation(async ({ input }) => {
      console.log("[TEST ROUTER] Mutation called with input:", input);
      return { 
        success: true, 
        received: input,
      };
    }),
});
