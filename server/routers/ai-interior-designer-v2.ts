import { router } from "../_core/trpc";
import { publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { generateImage } from "../_core/imageGeneration";
import type { GenerateImageOptions } from "../_core/imageGeneration";

export const aiInteriorDesignerRouter = router({
  analyzeAndRecommend: publicProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      return {
        roomPhoto: String(obj.roomPhoto || ""),
        wallType: String(obj.wallType || ""),
        lighting: String(obj.lighting || ""),
        roomType: String(obj.roomType || ""),
        style: String(obj.style || ""),
        colorPreference: obj.colorPreference ? String(obj.colorPreference) : undefined,
      };
    })
    .mutation(async ({ input }) => {
      try {
        console.log("[AI Router] analyzeAndRecommend called with:", { lighting: input.lighting, roomType: input.roomType, style: input.style });
        
        const analysisPrompt = `
Sei un esperto designer di interni specializzato in finiture di lusso italiane (stucchi, travertino, vernici).

ANALIZZA LA STANZA DELL'UTENTE:
- Tipo di Parete: ${input.wallType}
- Illuminazione: ${input.lighting}
- Tipo di Stanza: ${input.roomType}
- Stile: ${input.style}
- Preferenza di Colore: ${input.colorPreference || "Nessuna preferenza specifica"}

PRIORITÀ DECOR CARPI:
PRIMA di tutto, raccomanda SEMPRE una texture dal portfolio Decor Carpi. Le texture disponibili sono:
- Stucco Veneziano, Fila di Seta, Pietra Zen, Effetto Cimento, Pelle di Elefante, Stencil, Effetto Perlato, Pietra Spaccata, Marmorino, Marmorino Premium, Mappa Mondo, Craquelé, Pietra Bamboo, Effetto Ruggine, Mappa Mondo Oro, Stencil Elegante, Pietra Spaccata Lusso, Geometrie Materiche

RIFERIMENTO AL PORTFOLIO DECOR CARPI:
Utilizza le 22 foto interne SOLO come benchmark di qualità texture e artigianalità. La texture (come riflette la luce, porosità) proviene dal nostro portfolio.

RICERCA TENDENZE GLOBALI DI DESIGN:
Incorpora le tendenze di design d'interni 2026 e le tendenze delle finiture italiane di lusso.

ESEMPI E ISPIRAZIONI:
Nella tua risposta, DEVI includere:
1. PORTFOLIO DECOR CARPI: Raccomanda 2-3 texture dal portfolio che si adattano alle condizioni specifiche dell'utente
2. ISPIRAZIONI DA ITALIA: Suggerisci 2-3 esempi di stucchi/finiture italiane simili che si trovano online (Venetian Plaster, Stucco Italiano, ecc.)
3. Spiega PERCHÉ ogni opzione si adatta alle condizioni specifiche (illuminazione, tipo di stanza, stile)

GENERA RACCOMANDAZIONE:
Rispondi SOLO con JSON valido (senza markdown, senza testo extra):
{
  "textureType": "Nome della texture Decor Carpi (PRIORITÀ: scegli prima dal portfolio Decor Carpi)",
  "textureDescription": "Breve descrizione della texture",
  "colorName": "Nome del colore (es. Verde Smeraldo, Rosa Cipria, Bianco Avorio)",
  "colorHex": "#HEXCODE",
  "portfolioExamples": [
    {"name": "Texture Decor Carpi 1", "reason": "Perché si adatta alle tue condizioni"},
    {"name": "Texture Decor Carpi 2", "reason": "Perché si adatta alle tue condizioni"}
  ],
  "italianInspiration": [
    {"name": "Stucco Italiano 1", "reason": "Ispirazione simile al tuo stile"},
    {"name": "Stucco Italiano 2", "reason": "Ispirazione simile al tuo stile"}
  ],
  "reasoning": "Perché questa combinazione funziona per lo spazio dell'utente - MENZIONA che è una scelta Decor Carpi di lusso",
  "applicationTips": "Come applicare questa finitura Decor Carpi",
  "trendInsight": "Insight su tendenze di design 2026 - MENZIONA come questa texture Decor Carpi si allinea con i trend"
}

IMPORTANTE:
1. Le possibilità di colore sono INFINITE. Genera qualsiasi colore che l'utente vuole o qualsiasi colore di tendenza.
2. PRIORITÀ ASSOLUTA: Raccomanda SEMPRE prima una texture dal portfolio Decor Carpi.
3. PORTFOLIO DECOR CARPI PRIMA: Arată SEMPRE PRIMA exemplele din portfolio tău, APOI exemplele de pe internet.
4. FILTRARE INTELIGENTĂ: Recomandă DOAR stucurile care se potrivesc cu condițiile specifice (dormitorio luminos, culoare roșu, ecc.).
5. Se l'utente vuole combinazioni, suggerisci: Decor Carpi (principale) + Trend 2026 (complementare) + Un'altra variante Decor Carpi (accento).
`;

        console.log("[AI Router] Calling invokeLLM...");
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Sei un esperto designer di interni. Rispondi SOLO con JSON valido, senza markdown, senza testo extra. TUTTE le risposte DEVONO essere in ITALIANO.",
            },
            {
              role: "user",
              content: analysisPrompt,
            },
          ],
        });

        console.log("[AI Router] LLM response received");
        const responseContent = response.choices[0].message.content;
        const contentStr = typeof responseContent === "string" ? responseContent : "";

        // Parse JSON response
        let recommendation;
        try {
          recommendation = JSON.parse(contentStr);
          console.log("[AI Router] JSON parsed successfully");
        } catch (parseError) {
          console.error("[AI Router] JSON parse error:", parseError);
          // Fallback recommendation if parsing fails
          recommendation = {
            textureType: "Stucco Veneziano",
            textureDescription: "Classic Venetian plaster with elegant finish",
            colorName: "Bianco Avorio",
            colorHex: "#F5F5DC",
            portfolioExamples: [
              { name: "Stucco Veneziano", reason: "Elegante e versatile per qualsiasi spazio" },
              { name: "Marmorino Premium", reason: "Finitura lussuosa con venature sottili" }
            ],
            italianInspiration: [
              { name: "Venetian Plaster", reason: "Ispirazione classica italiana" },
              { name: "Stucco Italiano Tradizionale", reason: "Finitura artigianale italiana" }
            ],
            reasoning: "Elegant and versatile choice for any space",
            applicationTips: "Apply in thin layers for best results",
            trendInsight: "Neutral tones remain timeless in 2026",
          };
        }

        console.log("[AI Router] Returning recommendation");
        return {
          success: true,
          recommendation,
        };
      } catch (error) {
        console.error("[AI Router] Analysis error:", error);
        throw new Error("Errore nell'analisi AI. Riprova.");
      }
    }),

  generatePreview: publicProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      return {
        roomPhoto: String(obj.roomPhoto || ""),
        textureType: String(obj.textureType || ""),
        colorHex: String(obj.colorHex || ""),
        colorName: String(obj.colorName || ""),
        wallType: String(obj.wallType || ""),
      };
    })
    .mutation(async ({ input }) => {
      try {
        console.log("[AI Router] generatePreview called with:", { textureType: input.textureType, colorName: input.colorName, colorHex: input.colorHex, roomPhoto: input.roomPhoto });
        
        // Dynamic import to get TEXTURES for reference image
        const { TEXTURES } = await import("../routers");
        const textureData = TEXTURES.find(
          (t: any) => t.name.toLowerCase() === input.textureType.toLowerCase() || t.id === input.textureType.toLowerCase()
        );
        const referenceImageUrl = textureData?.imageUrl || null;
        
        const prompt = `You are an expert interior designer specializing in luxury decorative stucco finishes for Decor Carpi.

TASK: Edit the provided room photo by applying the decorative stucco texture shown in the reference image.

REFERENCE TEXTURE:
- The second image shows the ${input.textureType} decorative stucco texture finish you must apply
- Study the texture pattern carefully: surface finish, material depth, light reflection, porosity, surface irregularities
- Apply this exact decorative stucco style to the main wall in the room photo

CHANGES TO APPLY:
- Wall Color: Change to ${input.colorName} (hex: ${input.colorHex})
- Texture Type: Apply the decorative stucco texture shown in the reference image (${input.textureType})
- Finish Style: Luxury Italian decorative stucco (Decor Carpi quality)
- Wall Area: Main wall in the room

CRITICAL REQUIREMENTS FOR PHOTOREALISTIC STUCCO FINISH:
1. MUST EDIT THE PHOTO - Apply the decorative stucco texture and color visibly using the reference as a guide
2. Create realistic material variations and subtle shadows that mimic real stucco
3. Include light reflection and material depth to look like professional stucco finish
4. Keep everything else UNCHANGED - furniture, doors, windows, floor, ceiling, lighting
5. Make the wall color and texture change obvious and realistic
6. Apply the texture pattern from the reference image to make it look professionally applied
7. Maintain realistic shadows and lighting from the original room
8. The result should clearly show the new luxury stucco wall finish
9. Do NOT add or remove any objects
10. Do NOT change room layout or architecture

This is a LUXURY STUCCO WALL FINISH EDIT - change the wall appearance to look like professional decorative stucco while keeping the rest of the room identical.`;

        console.log("[AI Router] Calling generateImage with roomPhoto + reference texture...");
        const originalImages: Array<{ url: string; mimeType: string }> = [
          {
            url: input.roomPhoto,
            mimeType: "image/jpeg",
          },
        ];
        
        // Add reference image if available
        if (referenceImageUrl) {
          originalImages.push({
            url: referenceImageUrl,
            mimeType: referenceImageUrl.endsWith(".png") ? "image/png" : "image/jpeg",
          });
          console.log("[AI Router] Added reference texture image:", referenceImageUrl);
        }
        
        // Retry logic with exponential backoff
        let result;
        let lastError: any;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            console.log(`[AI Router] generateImage attempt ${attempt}/3...`);
            result = await generateImage({
              prompt,
              originalImages,
            });
            console.log("[AI Router] Image edited successfully:", result.url);
            break;
          } catch (err) {
            lastError = err;
            console.error(`[AI Router] Attempt ${attempt} failed:`, err);
            if (attempt < 3) {
              // Wait before retrying (exponential backoff: 2s, 4s)
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
          }
        }
        
        if (!result) {
          throw lastError || new Error("Generazione non riuscita dopo 3 tentativi");
        }

        return {
          success: true,
          previewUrl: result.url,
        };
      } catch (error) {
        console.error("[AI Router] Preview generation error:", error);
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.toLowerCase().includes("rate") || msg.toLowerCase().includes("limit")) {
          throw new Error("Il servizio AI è momentaneamente sovraccarico. Attendi 1-2 minuti e riprova.");
        }
        throw new Error("Errore nella generazione dell'anteprima. Riprova.");
      }
    }),

  getTextureLibrary: publicProcedure.query(async () => {
    const { TEXTURES } = await import("../routers");
    return {
      textures: TEXTURES.map((t: any) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        imageUrl: t.imageUrl,
        promptKeyword: t.promptKeyword,
      })),
    };
  }),

  getDesignTrends: publicProcedure.query(async () => {
    return {
      trends: [
        { year: 2026, trend: "Sustainable luxury finishes", description: "Eco-friendly stucco with premium aesthetics" },
        { year: 2026, trend: "Textured minimalism", description: "Subtle textures with clean lines" },
        { year: 2026, trend: "Warm neutrals", description: "Earthy tones with depth and character" },
      ],
    };
  }),
});
