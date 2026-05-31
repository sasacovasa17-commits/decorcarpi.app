import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { generateImage } from "./_core/imageGeneration";
import { invokeLLM } from "./_core/llm";
import { storagePut, storageGet } from "./storage";
import { getDb } from "./db";
import { notifyOwner } from "./_core/notification";
import { projects, renders, sessionUsage, aiUsage, sessionPromoCodes } from "../drizzle/schema";
import { logAiUsage, getAiUsageStats, getRecentAiUsage, applyPromoCode, getSessionGenerationsRemaining, decrementSessionGenerations, getAllPromoCodes, createPromoCode, deactivatePromoCode } from "./db";
import { preventiveRouter } from "./routers/preventive";
import { pushRouter } from "./routers/push";
import { discountRouter } from "./routers/discount";
import { contactRouter } from "./contact-router";
import { adminEmailsRouter } from "./admin-emails-router";
import { pushNotificationsRouter } from "./push-notifications-router";
import { exportRouter } from "./export-router";
import { auditLogsRouter } from "./audit-logs-router";
import { whatsappRouter } from "./routers/whatsapp";
import { excelExportRouter } from "./routers/excel-export";
import { calendarRouter } from "./routers/calendar";
import { aiInteriorDesignerRouter } from "./routers/ai-interior-designer-v2";
import { testRouter } from "./routers/test-router";

import { eq, desc, and } from "drizzle-orm";
import { protectedProcedure } from "./_core/trpc";

// Numărul maxim de generări AI gratuite per sesiune

// -- Texturi disponibile Decor Carpi ------------------------------------------
export const TEXTURES = [
  {
    id: "craquele",
    name: "Auto Spaccante Craquèele",
    description: "Texture craquelé con giochi di luce unici",
    category: "stucco",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/img_1_e9b1b085.jpg",
    promptKeyword: "intonaco decorativo craquelé PREMIUM con crepe uniformi e regolari, superficie bianca pura con venature dorate sottili e consistenti. Le crepe devono essere distribuite uniformemente su TUTTA la superficie, con profondità costante. Effetto 3D marcato con ombre naturali. Consistenza visiva identica su tutti i muri della stanza.",
  },
  {
    id: "fila-seta",
    name: "Fila di Seta",
    description: "Effetto setoso raffinato, luminoso",
    category: "stucco",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/img_2_c24d0cc7.jpg",
    promptKeyword: "intonaco decorativo FILA DI SETA con finitura setosa liscia e lucida. Pennellate orizzontali sottili e regolari, distribuite uniformemente. Superficie morbida con riflessi luminosi delicati e consistenti. Effetto di seta naturale con lucentezza uniforme su TUTTA la parete. Nessuna irregolarità o macchie.",
  },
  {
    id: "pietra-zen",
    name: "Pietra Zen",
    description: "Texture di pietra naturale, calma ed eleganza",
    category: "stucco",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/img_3_871e14ce.jpg",
    promptKeyword: "finitura murale decorativa PIETRA ZEN con texture di pietra naturale liscia. Motivi organici verticali uniformi e regolari, distribuiti simmetricamente. Colore grigio naturale con variazioni sottili e consistenti. Superficie calma e armoniosa con profondità moderata. Effetto di pietra naturale autentico su TUTTA la parete.",
  },
  {
    id: "effetto-cimento",
    name: "Effetto Cimento",
    description: "Cemento decorativo moderno, stile industriale con linee diagonali",
    category: "stucco",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/effetto-cimento-diagonal_d71d96cc.png",
    promptKeyword: "intonaco decorativo EFFETTO CIMENTO con linee geometriche diagonali precise e regolari. Stile industriale moderno con finitura cemento grigio scuro. Linee marcate e uniformi, distribuite con angoli coerenti su TUTTA la superficie. Texture cemento ruvida ma consistente. Profondità industriale con ombre definite e regolari.",
  },
  {
    id: "pelle-elefante",
    name: "Pelle di Elefante",
    description: "Texture pelle di elefante, profondità e carattere",
    category: "stucco",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/img_5_6904f665.jpg",
    promptKeyword: "finitura murale decorativa PELLE DI ELEFANTE con texture di rilievo profondo e caratteristico. Motivi di pelle naturale distribuiti uniformemente, grigio profondo con variazioni coerenti. Effetto 3D marcato con ombre naturali consistenti. Superficie ruvida e tattile con profondità uniforme su TUTTA la parete. Nessuna irregolarità casuale.",
  },
  {
    id: "stencil",
    name: "Stencil",
    description: "Effetto 3D sofisticato, eleganza e modernità",
    category: "stucco",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/img_6_46b55eae.jpg",
    promptKeyword: "intonaco decorativo STENCIL con motivi fleur-de-lis e script eleganti. Effetto di rilievo 3D profondo e marcato, distribuito uniformemente su TUTTA la superficie. Motivi simmetrici e regolari con ombre naturali coerenti. Profondità costante con contrasto definito. Finitura sofisticata e precisa.",
  },
  {
    id: "perlato",
    name: "Effetto Perlato",
    description: "Riflessi perlati, superficie viva e luminosa",
    category: "stucco",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/img_7_d98e19af.jpg",
    promptKeyword: "finitura murale decorativa EFFETTO PERLATO con scintillio metallico iridescente uniforme. Riflessi argento e perla distribuiti coerentemente su TUTTA la superficie. Texture liscia con lucentezza naturale e consistente. Effetto luminoso che cambia con l'angolo di visione in modo prevedibile e uniforme. Nessun punto opaco o irregolare.",
  },
  {
    id: "pietra-spaccata",
    name: "Pietra Spaccata",
    description: "Pietra naturale spaccata, carattere e profondità",
    category: "stucco",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/img_8_13bddbc4.jpg",
    promptKeyword: "finitura murale decorativa PIETRA SPACCATA con marmo grigio naturale autentico. Texture di pietra spaccata ruvida con linee di frattura uniformi e regolari. Profondità naturale con ombre coerenti. Superficie caratteristica distribuita uniformemente su TUTTA la parete. Effetto di pietra naturale autentico e consistente.",
  },
  {
    id: "stucco-venexian",
    name: "Stucco Venexian",
    description: "Stucco veneziano tradizionale, lusso e splendore",
    category: "stucco",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/img_9_9182a863.jpg",
    promptKeyword: "stucco veneziano INTONACO LUCIDO con colore blu azzurro profondo e ricco. Venature dorate sottili e regolari, distribuite uniformemente su TUTTA la superficie. Finitura marmorizzata lussuosa con riflessi naturali coerenti. Profondità elegante con ombre morbide e consistenti. Effetto veneziano autentico e sofisticato.",
  },
  {
    id: "pietra-bamboo",
    name: "Pietra Bamboo",
    description: "Pietra con delicatezza del bambù, armonia naturale",
    category: "stucco",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/img_10_d3eedfb8.jpg",
    promptKeyword: "finitura murale decorativa PIETRA BAMBÙ con motivi verticali ispirati al bambù. Tonalità beige calde e naturali, distribuite uniformemente. Linee verticali regolari e coerenti su TUTTA la parete. Texture naturale con profondità moderata e ombre consistenti. Effetto armonico e naturale.",
  },
  {
    id: "marmorino",
    name: "Marmorino",
    description: "Intonaco di marmo veneziano, superficie lucida e pregiata",
    category: "stucco",
    imageUrl: "/manus-storage/10540_37f051da.jpg",
    promptKeyword: "marmorino INTONACO MARMO VENEZIANO con superficie liscia e lucida. Venature di marmo sottili e regolari, distribuite uniformemente su TUTTA la parete. Tonalità avorio calde e naturali con riflessi coerenti. Finitura elegante con profondità moderata e ombre morbide. Effetto marmorizzato autentico e consistente.",
  },
  {
    id: "marmorino-premium",
    name: "Marmorino Premium",
    description: "Marmo veneziano elegante con vene grigie profonde e contrasto elevato",
    category: "stucco",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/marmurino-enhanced_4c2c6afd.png",
    promptKeyword: "marmorino PREMIUM intonaco marmo con venature grigie profonde e marcate. Superficie elegante ad alto contrasto, distribuito uniformemente su TUTTA la parete. Finitura veneziana lussuosa con motivi di marmo regolari e coerenti. Profondità ricca con ombre naturali definite. Effetto marmorizzato premium e sofisticato.",
  },
  {
    id: "mappa-mondo",
    name: "Mappa Mondo",
    description: "Texture organica con aspetto di mappa, beige e marrone, profondità naturale",
    category: "stucco",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/mappa-mondo-enhanced_13c1f23e.png",
    promptKeyword: "intonaco decorativo MAPPA MONDO con motivi organici simili a mappe geografiche. Tonalità beige abbronzate naturali, distribuite uniformemente su TUTTA la superficie. Texture di rilievo naturale con profondità coerente. Motivi geografici irregolari ma armoniosi e consistenti. Finitura artigianale autentica con ombre naturali.",
  },
  {
    id: "effetto-cimento-tiles",
    name: "Effetto Cimento Tiles",
    description: "Cemento decorativo con piastrelle, linee di fuga, stile industriale moderno",
    category: "stucco",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/effetto-cimento-tiles_4edafcc5.png",
    promptKeyword: "piastrelle decorative EFFETTO CIMENTO TILES con linee di fuga precise e regolari. Stile industriale moderno con finitura cemento grigio scuro. Motivi di piastrelle geometrici uniformi su TUTTA la superficie, distribuiti con precisione matematica. Linee di fuga coerenti e marcate. Texture cemento ruvida consistente.",
  },
  {
    id: "mappa-mondo-stencil",
    name: "Mappa Mondo con Stencil",
    description: "Mappa Mondo con linee dorate stencil, elegante e sofisticata",
    category: "stucco",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/mappa-mondo-stencil-enhanced_f5fdf7bc.png",
    promptKeyword: "intonaco decorativo MAPPA MONDO CON STENCIL con linee dorate eleganti e precise. Motivi di mappa geografica distribuiti uniformemente su TUTTA la parete. Linee dorate coerenti e regolari con effetto di rilievo 3D marcato. Profondità naturale con ombre consistenti. Finitura sofisticata e elegante.",
  },
  {
    id: "marmurino-new",
    name: "Marmurino",
    description: "Texture marmorino lussuosa, finitura elegante e raffinata",
    category: "stucco",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/marmurino-texture-6LuTA7LZ33EC7qKpQiigzq.png",
    promptKeyword: "marmurino decorative plaster, luxurious marble-like finish with subtle veining, elegant polished surface with warm tones and refined texture",
  },
  {
    id: "effetto-ruggine",
    name: "Effetto Ruggine",
    description: "Texture patinata con effetto ruggine, aspetto antico e sofisticato",
    category: "stucco",
    imageUrl: "/manus-storage/effetto-ruggine-texture_86535040.jpg",
    promptKeyword: "rust effect decorative plaster, oxidized patina finish with copper and blue tones, antique weathered appearance with natural oxidation patterns",
  },
  {
    id: "mappa-mondo-oro",
    name: "Mappa Mondo Oro",
    description: "Texture patinata con effetto mappa mondo, accenti dorati su sfondo grigio-beige, aspetto naturale e sofisticato",
    category: "stucco",
    imageUrl: "/manus-storage/mappa-mondo-oro-texture_7314c7b1.jpg",
    promptKeyword: "mappa mondo gold decorative plaster with organic map-like patterns, golden accents on grey-beige background, natural patina finish with sophisticated texture",
  },
  {
    id: "pietra-spaccata-new",
    name: "Pietra Spaccata",
    description: "Texture pietra naturale spaccata con linee di frattura, tonalità grigio-bianche con accenti scuri, aspetto robusto e naturale",
    category: "stucco",
    imageUrl: "/manus-storage/pietra-spaccata-texture_888cb678.jpg",
    promptKeyword: "split stone decorative plaster with natural fracture lines, grey-white tones with dark accents, robust and natural appearance",
  },
  {
    id: "stencil-elegante",
    name: "Stencil Elegante",
    description: "Texture stencil sofisticata con motivi decorativi complessi, pizzo, fiori, stelle, pattern geometrici su sfondo beige-crema",
    category: "stucco",
    imageUrl: "/manus-storage/stencil-elegante-texture_4a9bcbe5.jpg",
    promptKeyword: "elegant stencil decorative plaster with sophisticated motifs, lace patterns, flowers, stars, geometric patterns on beige-cream background",
  },
  {
    id: "pietra-spaccata-lusso",
    name: "Pietra Spaccata Lusso",
    description: "Texture pietra naturale spaccata con aspetto lussuoso, tonalità beige-marrone con sfumature grigie, rilievo profondo e naturale",
    category: "stucco",
    imageUrl: "/manus-storage/pietra-spaccata-lusso-texture_d0a89023.jpg",
    promptKeyword: "luxury split stone decorative plaster with natural appearance, beige-brown tones with grey shades, deep relief and authentic texture",
  },
  {
    id: "pietra-spaccata-venato-effetto",
    name: "Pietra Spaccata (Effetto Venato)",
    description: "Pietra naturale spaccata con vene eleganti, aspetto robusto e naturale",
    category: "stucco",
    imageUrl: "/manus-storage/IMG_20260501_105555_ab7a5412.jpg",
    promptKeyword: "split stone decorative plaster with elegant veins, natural robust appearance, beige-grey tones",
  },
  {
    id: "geometrie-materiche",
    name: "Geometrie Materiche",
    description: "Finiture decorative con effetto crepe e linee geometriche, aspetto sofisticato e moderno",
    category: "stucco",
    imageUrl: "/manus-storage/IMG_20260501_105622_d091e263.jpg",
    promptKeyword: "geometric decorative plaster with crack effect and geometric lines, sophisticated modern appearance, textured finish",
  },
];


// -- Inspirație: căutare imagini --------------------------------------------─
// Colecție curată de imagini Unsplash pentru fiecare categorie
const INSPIRATION_COLLECTIONS: Record<string, Array<{ id: string; url: string; thumb: string; author: string; authorUrl: string; description: string }>> = {
  // -- Foto reali Decor Carpi (dal sito decorcarpi.it) --
  decorcarpi: [
    { id: "dc1", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/5WjbvFPD2wjC_e4a0a6aa.jpg", thumb: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/5WjbvFPD2wjC_e4a0a6aa.jpg", author: "Decor Carpi", authorUrl: "https://decorcarpi.it", description: "Fila di Seta - effetto seta raffinato e luminoso" },
    { id: "dc2", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/8WnrzSbgVLfl_7d492611.jpg", thumb: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/8WnrzSbgVLfl_7d492611.jpg", author: "Decor Carpi", authorUrl: "https://decorcarpi.it", description: "Fila di Seta - applicazione professionale" },
    { id: "dc3", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/ULwliGo9w3Dg_344edeff.jpg", thumb: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/ULwliGo9w3Dg_344edeff.jpg", author: "Decor Carpi", authorUrl: "https://decorcarpi.it", description: "Pietra Spaccata - texture naturale e robusta" },
    { id: "dc4", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/zokRXgi6ILBO_a6b32a93.jpg", thumb: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/zokRXgi6ILBO_a6b32a93.jpg", author: "Decor Carpi", authorUrl: "https://decorcarpi.it", description: "Effetto Marmorino - intonaco veneziano elegante" },
    { id: "dc5", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/effetto-cimento-real_a6e8f9b1.jpg", thumb: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/effetto-cimento-real_a6e8f9b1.jpg", author: "Decor Carpi", authorUrl: "https://decorcarpi.it", description: "Effetto Cimento - stile industriale moderno" },
    { id: "dc6", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/pelle-elefante-real_97d5e5fe.jpg", thumb: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/pelle-elefante-real_97d5e5fe.jpg", author: "Decor Carpi", authorUrl: "https://decorcarpi.it", description: "Pelle di Elefante - texture naturale unica" },
    { id: "dc7", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/stencil-real_1aa8a383.jpg", thumb: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/stencil-real_1aa8a383.jpg", author: "Decor Carpi", authorUrl: "https://decorcarpi.it", description: "Stencil - finitura 3D sofisticata" },
    { id: "dc8", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/perlato-real_3ac71f2a.jpg", thumb: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/perlato-real_3ac71f2a.jpg", author: "Decor Carpi", authorUrl: "https://decorcarpi.it", description: "Effetto Perlato - riflessi di luce unici" },
    { id: "dc9", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/pietra-spaccata-real_8224ab3e.jpg", thumb: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/pietra-spaccata-real_8224ab3e.jpg", author: "Decor Carpi", authorUrl: "https://decorcarpi.it", description: "Pietra Spaccata - forza e carattere" },
  ],
};

const ALL_INSPIRATION = Object.values(INSPIRATION_COLLECTIONS).flat();

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // -- Texturi disponibile --------------------------------------------─
  textures: router({
    list: publicProcedure.query(() => TEXTURES),
  }),

  // -- Admin: gestione sessioni e credite -----------------------------------
  admin: router({
    listSessions: publicProcedure
      .input(z.object({ password: z.string() }))
      .query(async ({ input }) => {
        if (input.password !== (process.env.ADMIN_PASSWORD ?? "decorcarpi2024")) {
          throw new Error("Password errata");
        }
        const db = await getDb();
        if (!db) return [];
        const rows = await db.select().from(sessionUsage)
          .orderBy(desc(sessionUsage.createdAt));
        return rows;
      }),
    resetSession: publicProcedure
      .input(z.object({ password: z.string(), sessionId: z.string() }))
      .mutation(async ({ input }) => {
        if (input.password !== (process.env.ADMIN_PASSWORD ?? "decorcarpi2024")) {
          throw new Error("Password errata");
        }
        const db = await getDb();
        if (!db) return { ok: false };
        await db.update(sessionUsage)
          .set({ generationsUsed: 0 })
          .where(eq(sessionUsage.sessionId, input.sessionId));
        return { ok: true };
      }),
    resetAll: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(async ({ input }) => {
        if (input.password !== (process.env.ADMIN_PASSWORD ?? "decorcarpi2024")) {
          throw new Error("Password errata");
        }
        const db = await getDb();
        if (!db) return { ok: false };
        await db.update(sessionUsage).set({ generationsUsed: 0 });
        return { ok: true };
      }),
    getAiStats: publicProcedure
      .input(z.object({
        days: z.number().min(1).max(30).default(7),
      }))
      .query(async ({ input }) => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - input.days);
        const stats = await getAiUsageStats(startDate, endDate);
        return stats;
      }),
    getRecentUsage: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(20),
      }))
      .query(async ({ input }) => {
        return await getRecentAiUsage(input.limit);
      }),

    // Promo Codes Management
    getAllPromoCodes: publicProcedure
      .input(z.object({ password: z.string() }))
      .query(async ({ input }) => {
        if (input.password !== (process.env.ADMIN_PASSWORD ?? "decorcarpi2024")) {
          throw new Error("Password errata");
        }
        return await getAllPromoCodes();
      }),

    createPromoCode: publicProcedure
      .input(z.object({
        password: z.string(),
        code: z.string().min(3).max(64),
        generationsLimit: z.number().min(-1),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        if (input.password !== (process.env.ADMIN_PASSWORD ?? "decorcarpi2024")) {
          throw new Error("Password errata");
        }
        return await createPromoCode({
          code: input.code.toUpperCase(),
          generationsLimit: input.generationsLimit,
          notes: input.notes,
        });
      }),

    deactivatePromoCode: publicProcedure
      .input(z.object({
        password: z.string(),
        codeId: z.number(),
      }))
      .mutation(async ({ input }) => {
        if (input.password !== (process.env.ADMIN_PASSWORD ?? "decorcarpi2024")) {
          throw new Error("Password errata");
        }
        return await deactivatePromoCode(input.codeId);
      }),
  }),

   // -- Contor generări per sesiune ----------------------------------
  usage: router({
    get: publicProcedure
      .input(z.object({
        sessionId: z.string(),
      }))
      .query(async ({ input, ctx }) => {
        const remaining = await getSessionGenerationsRemaining(input.sessionId);
        
        // Dacă utilizatorul nu e autentificat și a epuizat generările gratuite
        // DAR NU daca are PRO activ (isUnlimited)
        if (!ctx.user && (remaining.totalRemaining ?? 0) <= 0 && !remaining.isUnlimited) {
          return {
            ...remaining,
            requiresLogin: true,
            message: 'Conectati-vă pentru a continua cu coduri promo',
          };
        }
        
        return remaining;
      }),


    applyCode: publicProcedure
      .input(z.object({ sessionId: z.string(), code: z.string() }))
      .mutation(async ({ input }) => {
        return await applyPromoCode(input.sessionId, input.code);
      }),
  }),

  // -- Inspirație ----------------------------------------------------
  inspiration: router({
    categories: publicProcedure.query(() => [
      { id: "all", label: "Tutte", emoji: "✨" },
      { id: "decorcarpi", label: "Decor Carpi", emoji: "🏛️" },
    ]),
    search: publicProcedure
      .input(z.object({
        query: z.string().optional(),
        category: z.string().default("all"),
      }))
      .query(({ input }) => {
        let results = input.category === "all"
          ? ALL_INSPIRATION
          : (INSPIRATION_COLLECTIONS[input.category] ?? ALL_INSPIRATION);
        if (input.query && input.query.trim().length > 0) {
          const q = input.query.toLowerCase();
          results = results.filter(img =>
            img.description.toLowerCase().includes(q) ||
            img.author.toLowerCase().includes(q)
          );
        }
        return results;
      }),
  }),

  // -- Upload imagine originală ----------------------------------------------
  upload: router({
    image: publicProcedure
      .input(z.object({
        base64: z.string(),
        mimeType: z.string().default("image/jpeg"),
        sessionId: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Extrage base64 pur din data URL (data:image/...;base64,XXX) sau din base64 raw
        const rawBase64 = input.base64.includes(",") ? input.base64.split(",")[1] : input.base64;
        // Rileva il tipo MIME dall'URL dei dati se disponibile
        const mimeMatch = input.base64.match(/data:([^;]+);/);
        const mimeType = mimeMatch ? mimeMatch[1] : input.mimeType;
        const buffer = Buffer.from(rawBase64, "base64");
        const ext = mimeType.includes("png") ? "png" : "jpg";
        const key = `uploads/${input.sessionId}/${Date.now()}.${ext}`;
        const { url } = await storagePut(key, buffer, mimeType);

        // Salva il progetto nel DB
        const db = await getDb();
        if (db) {
          await db.insert(projects).values({
            sessionId: input.sessionId,
            originalImageUrl: url,
          });
        }

        return { url, key };
      }),
  }),

  // -- Generare preview AI --------------------------------------------------─
  render: router({
    generate: publicProcedure
      .input(z.object({
        originalImageUrl: z.string(),
        textureId: z.string().optional(),
        colorHex: z.string().optional(),
        intensity: z.number().min(0).max(100).default(80),
        sessionId: z.string(),
        zone: z.enum(["full", "partial"]).default("full"),
        proCode: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const texture = input.textureId ? TEXTURES.find(t => t.id === input.textureId) : null;
        if (input.textureId && !texture) throw new Error("Texture non trovata");
        if (!texture && !input.colorHex) throw new Error("Seleziona una texture o un colore");

        // Verifica se è in modalità PRO (basato su user.role) - salta il limite
        const isPro = ctx.user?.role === "pro";



        const colorDesc = input.colorHex
          ? `with color tint ${input.colorHex}`
          : "";
        const intensityDesc = input.intensity < 40
          ? "subtle, light"
          : input.intensity < 70
          ? "medium"
          : "strong, prominent";
        const zoneDesc = input.zone === "partial"
          ? "Apply the texture only to the main visible wall, keeping other surfaces unchanged."
          : "Apply the texture to all visible walls in the room.";

        const textureName = texture?.name ?? "Colore personalizzato";
        const textureKeyword = texture?.promptKeyword ?? "";
        const textureImageUrl = texture?.imageUrl ?? "";

        const colorOnlyMode = !texture && input.colorHex;
        const promptText = colorOnlyMode
          ? `You are a professional interior design visualizer for Decor Carpi, an Italian decorative plaster company specializing in luxury decorative stucco finishes.

TRANSFORM THE WALLS with a premium decorative stucco finish:
- Color: ${input.colorHex} (${input.colorHex})
- Finish Type: Luxury Italian decorative plaster (stucco)
- Application intensity: ${intensityDesc} (${input.intensity}%)
${zoneDesc}

CRITICAL REQUIREMENTS FOR PHOTOREALISTIC RESULT:
- Apply the color as a professional decorative stucco finish (NOT flat paint)
- Create subtle texture variations that mimic real stucco material
- Include realistic light reflections and material depth
- Keep all furniture, objects, floor, ceiling, doors, windows, and lighting EXACTLY as they are
- Maintain natural shadows and room perspective
- The stucco should appear professionally applied with consistent finish
- Result should look like a high-end interior design preview with luxury stucco finish`
          : `You are a professional interior design visualizer for Decor Carpi, an Italian luxury decorative stucco company.

You MUST apply the EXACT decorative stucco texture shown in the reference image.

Texture name: "${textureName}"
Texture characteristics: ${textureKeyword}
Color: ${input.colorHex}
Application intensity: ${intensityDesc} (${input.intensity}%)
${zoneDesc}

CRITICAL REQUIREMENTS FOR PHOTOREALISTIC STUCCO FINISH:
- MUST replicate the EXACT texture pattern, surface finish, and material appearance from the reference image
- Apply as a professional decorative stucco finish (NOT wallpaper, NOT paint, NOT generic texture)
- Study the reference image carefully: texture depth, light reflection, material porosity, surface irregularities
- Apply the texture uniformly with realistic material variations
- Include subtle shadows and depth to mimic real stucco material
- Keep all furniture, objects, floor, ceiling, doors, windows, and lighting EXACTLY as they are
- Maintain the same room perspective, lighting, and natural shadows
- The result must look like a professionally applied luxury stucco finish
- Ensure consistent texture distribution and realistic material appearance
- NO text, watermarks, or overlays
- Result should look like a professional interior design preview photo`;

        const prompt = promptText;

        let result;
        try {
          // Include reference texture image if available
          const originalImages = [{ url: input.originalImageUrl, mimeType: "image/jpeg" }];
          if (textureImageUrl && !colorOnlyMode) {
            originalImages.push({ url: textureImageUrl, mimeType: "image/jpeg" });
          }
          
          result = await generateImage({
            prompt: promptText,
            originalImages: originalImages,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.toLowerCase().includes("rate") || msg.toLowerCase().includes("limit")) {
            throw new Error("Il servizio AI è momentaneamente sovraccarico. Attendi 1-2 minuti e riprova.");
          }
          if (msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network")) {
            throw new Error("Errore di connessione. Controlla la tua connessione internet e riprova.");
          }
          throw new Error("Generazione non riuscita. Riprova tra qualche istante.");
        }

        // Salvează randarea în DB
        const db = await getDb();
        if (db) {
          const project = await db.select().from(projects)
            .where(eq(projects.sessionId, input.sessionId))
            .orderBy(desc(projects.createdAt))
            .limit(1);

          if (project.length > 0) {
            await db.insert(renders).values({
              projectId: project[0].id,
              textureId: input.textureId ?? "color-only",
              colorHex: input.colorHex ?? null,
              intensity: input.intensity,
              resultImageUrl: result.url ?? "",
              prompt,
            });
          }
        }


        // Log AI usage for cost tracking (estimate: $0.05 per generation)
        try {
          await logAiUsage({
            sessionId: input.sessionId,
            userId: null,
            modelUsed: 'render.generate',
            costEstimated: 5, // 5 cents per generation
            status: 'success',
          });
        } catch (err) {
          console.error('[AI Usage] Failed to log usage:', err);
        }

        // Notifica il proprietario che un cliente ha generato un previewew
        try {
          await notifyOwner({
            title: `🎨 Nuovo preview generato - ${textureName}`,
            content: `Un cliente ha generato un'anteprima AI con ${texture ? `la texture "${textureName}"` : `il colore ${input.colorHex}`}${input.colorHex && texture ? ` (colore: ${input.colorHex})` : ""} all'intensità ${input.intensity}%. Potrebbe essere interessato a un preventivo!`,
          });
        } catch {
          // Notifica fallita: non bloccare la risposta al cliente
        }

        return { url: result.url };
      }),

    // Cronologia dei rendering per una sessione
    history: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];

        const projectList = await db.select().from(projects)
          .where(eq(projects.sessionId, input.sessionId))
          .orderBy(desc(projects.createdAt))
          .limit(1);

        if (projectList.length === 0) return [];

        const renderList = await db.select().from(renders)
          .where(eq(renders.projectId, projectList[0].id))
          .orderBy(desc(renders.createdAt))
          .limit(20);

        return renderList.map(r => ({
          ...r,
          textureName: TEXTURES.find(t => t.id === r.textureId)?.name ?? r.textureId,
        }));
      }),
  }),

  // -- Upload da URL esterno (Pinterest, Google Images, ecc.) ------------------
  uploadFromUrl: publicProcedure
    .input(z.object({
      imageUrl: z.string().url(),
      sessionId: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Scarica l'immagine dall'URL esterno
      const response = await fetch(input.imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DecorCarpi/1.0)',
          'Accept': 'image/*,*/*',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error(`Impossibile scaricare l'immagine: ${response.status}`);
      }

      const contentType = response.headers.get('content-type') ?? 'image/jpeg';
      if (!contentType.startsWith('image/')) {
        throw new Error('Il link non punta a un\'immagine valida');
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length > 10 * 1024 * 1024) {
        throw new Error('Immagine troppo grande (max 10MB)');
      }

      // Carica su S3
      const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
      const fileKey = `url-uploads/${input.sessionId}-${Date.now()}.${ext}`;
      const { url } = await storagePut(fileKey, buffer, contentType);

      return { url, originalUrl: input.imageUrl };
    }),

  // -- Style Transfer: combina foto stanza + foto riferimento ------------------
  generateFromReference: publicProcedure
    .input(z.object({
      roomImageUrl: z.string(),       // URL S3 o base64 foto stanza
      referenceImageUrl: z.string(),  // URL S3 o base64 foto riferimento
      sessionId: z.string(),
      zone: z.enum(["full", "partial"]).default("full"),
      intensity: z.number().min(0).max(100).default(80),
      proCode: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verifica se è in modalità PRO (basato su user.role)
      const isPro2 = ctx.user?.role === "pro";

      // Verifică limita de generări gratuite (doar dacă nu e PRO)
      const db2 = await getDb();
      if (db2 && !isPro2) {
        const rows = await db2.select().from(sessionUsage)
          .where(eq(sessionUsage.sessionId, input.sessionId))
          .limit(1);
        const used = rows.length > 0 ? rows[0].generationsUsed : 0;
      }

      // Se l'immagine è base64, caricala su S3 e ottieni un URL reale
      const toUrl = async (data: string, prefix: string): Promise<string> => {
        if (data.startsWith("http")) return data;
        // è base64 (data:image/... o stringa raw)
        const raw = data.includes(",") ? data.split(",")[1] : data;
        const mimeMatch = data.match(/data:([^;]+);/);
        const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
        const ext = mime.includes("png") ? "png" : "jpg";
        const buffer = Buffer.from(raw, "base64");
        const key = `style-transfer/${input.sessionId}/${prefix}-${Date.now()}.${ext}`;
        const { url } = await storagePut(key, buffer, mime);
        return url;
      };

      const roomUrl = await toUrl(input.roomImageUrl, "room");
      const refUrl = await toUrl(input.referenceImageUrl, "ref");
      const intensityDesc = input.intensity < 40 ? "subtle, light"
        : input.intensity < 70 ? "medium"
        : "strong, prominent";
      const zoneDesc = input.zone === "partial"
        ? "Apply the style only to the main visible wall, keeping other surfaces unchanged."
        : "Apply the style to all visible walls in the room.";

      const prompt = `You are a professional interior design AI for Decor Carpi, an Italian luxury decorative stucco company.

You are given TWO images:
1. ROOM PHOTO: The client's actual room that needs to be transformed
2. REFERENCE PHOTO: An inspiration image showing the desired decorative stucco texture and finish

Your task: Transform the walls in the ROOM PHOTO to match the decorative stucco texture and finish shown in the REFERENCE PHOTO.

Application intensity: ${intensityDesc} (${input.intensity}%).
${zoneDesc}

CRITICAL REQUIREMENTS FOR PHOTOREALISTIC STUCCO FINISH:
- Carefully analyze the texture pattern, surface finish, material appearance, color in the REFERENCE PHOTO
- Apply EXACTLY that decorative stucco style to the walls of the ROOM PHOTO
- Study the reference: texture depth, light reflection, material porosity, surface irregularities
- Create realistic material variations and subtle shadows that mimic real stucco
- Keep all furniture, objects, floor, ceiling, doors, windows, and lighting EXACTLY as they are
- Only change the wall surfaces to the decorative stucco finish
- Make the result look photorealistic and professionally applied
- Maintain the same room perspective, lighting, and natural shadows
- Result should look like a professional interior design preview photo with luxury stucco finish`;

      // Passa entrambe le immagini all'AI (URL reali S3) con retry logic
      let result;
      const maxRetries = 3;
      let lastError: Error | null = null;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          result = await generateImage({
            prompt,
            originalImages: [
              { url: roomUrl, mimeType: "image/jpeg" },
              { url: refUrl, mimeType: "image/jpeg" },
            ],
          });
          break; // Success, exit retry loop
        } catch (err: unknown) {
          lastError = err instanceof Error ? err : new Error(String(err));
          const msg = lastError.message.toLowerCase();
          
          // Se e rate limit, retry con exponential backoff
          if ((msg.includes("rate") || msg.includes("limit")) && attempt < maxRetries - 1) {
            const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
            console.log(`[Style Transfer] Rate limited. Retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          
          // Alti erori
          if (msg.includes("fetch") || msg.includes("network")) {
            throw new Error("Errore di connessione. Controlla la tua connessione internet e riprova.");
          }
          
          // Daca e rate limit si e ultima incercare
          if (msg.includes("rate") || msg.includes("limit")) {
            throw new Error("Il servizio AI è momentaneamente sovraccarico. Attendi 1-2 minuti e riprova.");
          }
          
          throw new Error("Generazione non riuscita. Riprova tra qualche istant.");
        }
      }
      
      if (!result) {
        throw lastError || new Error("Generazione non riuscita.");
      }

      // Salva nel DB e incrementa contatore generazioni
      if (db2) {
        const project = await db2.select().from(projects)
          .where(eq(projects.sessionId, input.sessionId))
          .orderBy(desc(projects.createdAt))
          .limit(1);
        if (project.length > 0) {
          await db2.insert(renders).values({
            projectId: project[0].id,
            textureId: "reference-style",
            colorHex: null,
            intensity: input.intensity,
            resultImageUrl: result.url ?? "",
            prompt,
          });
        }

        // Incrementeaza contorul de generari (DOAR daca nu e PRO)
        if (!isPro2) {
          const existingUsage = await db2.select().from(sessionUsage)
            .where(eq(sessionUsage.sessionId, input.sessionId))
            .limit(1);
          if (existingUsage.length > 0) {
            await db2.update(sessionUsage)
              .set({ generationsUsed: existingUsage[0].generationsUsed + 1 })
              .where(eq(sessionUsage.sessionId, input.sessionId));
          } else {
            await db2.insert(sessionUsage).values({
              sessionId: input.sessionId,
              generationsUsed: 1,
            });
          }
        }
      }

      // Log AI usage for cost tracking (estimate: $0.10 per style transfer)
      try {
        await logAiUsage({
          sessionId: input.sessionId,
          userId: null,
          modelUsed: 'generateFromReference',
          costEstimated: 10, // 10 cents per style transfer
          status: 'success',
        });
      } catch (err) {
        console.error('[AI Usage] Failed to log usage:', err);
      }

      // Notifica il proprietario
      try {
        await notifyOwner({
          title: `🎨 Style Transfer generato`,
          content: `Un cliente ha combinato la foto della sua stanza con un'immagine di riferimento. Potrebbe essere interessato a un preventivo!`,
        });
      } catch { /* non bloccare */ }
      return { url: result.url };
    }),

  preventive: preventiveRouter,
  push: pushRouter,
  contact: contactRouter,
  adminEmails: adminEmailsRouter,
  pushNotifications: pushNotificationsRouter,
  export: exportRouter,
  auditLogs: auditLogsRouter,
  discount: discountRouter,
  whatsapp: whatsappRouter,
  excelExport: excelExportRouter,
  calendar: calendarRouter,
  aiInteriorDesigner: aiInteriorDesignerRouter,
  test: testRouter,
  
  // -- AI Interior Designer: Reparto Ispirazione D.C. -------------------------
  vernice: router({
    // Upload foto pentru AI Vernice
    uploadPhoto: publicProcedure
      .input(z.object({
        base64: z.string(),
        fileName: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const buffer = Buffer.from(input.base64.split(',')[1] || input.base64, 'base64');
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(7);
          const fileKey = `vernice-photos/${timestamp}-${random}-${input.fileName}`;
          const { url } = await storagePut(fileKey, buffer, 'image/jpeg');
          return { success: true, url, fileKey };
        } catch (error) {
          console.error('Vernice photo upload error:', error);
          throw new Error('Errore nel caricamento della foto');
        }
      }),

    // Detectare pereți cu AI (LLM multimodal)
    detectWalls: publicProcedure
      .input(z.object({
        imageUrl: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are an expert interior design AI that analyzes room photos. Your task is to identify and describe each distinct wall visible in the image. Be precise and descriptive. Always respond in valid JSON format."
              },
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: {
                      url: input.imageUrl,
                      detail: "high"
                    }
                  },
                  {
                    type: "text",
                    text: `Analyze this room photo and identify all distinct walls visible. For each wall, provide:
1. A unique ID (wall_1, wall_2, etc.)
2. A brief Italian description of the wall's position (e.g., "Parete sinistra", "Parete frontale", "Parete destra")
3. The approximate percentage of the image that wall occupies
4. The current color/finish of the wall

Respond ONLY with a JSON object in this exact format:
{
  "walls": [
    {
      "id": "wall_1",
      "description": "Parete frontale",
      "percentage": 45,
      "currentColor": "bianco"
    }
  ],
  "totalWalls": 2,
  "roomType": "soggiorno"
}`
                  }
                ]
              }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "wall_detection",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    walls: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", description: "Unique wall ID" },
                          description: { type: "string", description: "Italian description of wall position" },
                          percentage: { type: "number", description: "Approximate percentage of image" },
                          currentColor: { type: "string", description: "Current wall color/finish" }
                        },
                        required: ["id", "description", "percentage", "currentColor"],
                        additionalProperties: false
                      }
                    },
                    totalWalls: { type: "number", description: "Total number of walls detected" },
                    roomType: { type: "string", description: "Type of room in Italian" }
                  },
                  required: ["walls", "totalWalls", "roomType"],
                  additionalProperties: false
                }
              }
            }
          });

          const content = response.choices[0]?.message?.content;
          const text = typeof content === 'string' ? content : Array.isArray(content) ? content.find(c => c.type === 'text')?.text || '' : '';
          const parsed = JSON.parse(text as string);
          return parsed;
        } catch (error) {
          console.error('Wall detection error:', error);
          // Fallback: returnează un perete generic
          return {
            walls: [
              { id: "wall_1", description: "Parete principale", percentage: 60, currentColor: "non determinato" },
              { id: "wall_2", description: "Parete laterale", percentage: 30, currentColor: "non determinato" }
            ],
            totalWalls: 2,
            roomType: "stanza"
          };
        }
      }),

    // Aplică culoare pe perete specific cu AI
    applyColor: publicProcedure
      .input(z.object({
        originalImageUrl: z.string(),
        colorHex: z.string(),
        colorName: z.string().optional(),
        wallId: z.string(),
        wallDescription: z.string(),
        sessionId: z.string(),
        proCode: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Verifica se è in modalità PRO (basato su user.role)
        const isPro = ctx.user?.role === "pro";

        // Verifică limita de generări gratuite
        const db = await getDb();
        if (db && !isPro) {
          const rows = await db.select().from(sessionUsage)
            .where(eq(sessionUsage.sessionId, input.sessionId))
            .limit(1);
          const used = rows.length > 0 ? rows[0].generationsUsed : 0;
        }

        const colorName = input.colorName || input.colorHex;
        const promptText = `You are a professional interior design visualizer for Decor Carpi, an Italian decorative painting company.

Paint ONLY the "${input.wallDescription}" (${input.wallId}) in this room photo with the color ${input.colorHex} (${colorName}).

CRITICAL REQUIREMENTS:
- Paint ONLY the specified wall: "${input.wallDescription}"
- Keep ALL other walls, furniture, objects, floor, ceiling, doors, windows, and lighting EXACTLY as they are
- The painted wall should look photorealistic with the new color ${input.colorHex}
- Maintain natural lighting, shadows, and reflections on the painted surface
- The color should look like professionally applied paint (smooth, even coverage)
- Maintain the same room perspective and camera angle
- Result should look like a real professional interior design photo
- Do NOT change anything else in the room except the specified wall`;

        let result;
        try {
          result = await generateImage({
            prompt: promptText,
            originalImages: [{ url: input.originalImageUrl, mimeType: "image/jpeg" }],
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.toLowerCase().includes("rate") || msg.toLowerCase().includes("limit")) {
            throw new Error("Il servizio AI è momentaneamente sovraccarico. Attendi 1-2 minuti e riprova.");
          }
          if (msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network")) {
            throw new Error("Errore di connessione. Controlla la tua connessione internet e riprova.");
          }
          throw new Error("Generazione non riuscita. Riprova tra qualche istante.");
        }

        // Incrementeaza contorul de generari (DOAR daca nu e PRO)
        if (db && !isPro) {
          const existingUsage = await db.select().from(sessionUsage)
            .where(eq(sessionUsage.sessionId, input.sessionId))
            .limit(1);
          if (existingUsage.length > 0) {
            await db.update(sessionUsage)
              .set({ generationsUsed: existingUsage[0].generationsUsed + 1 })
              .where(eq(sessionUsage.sessionId, input.sessionId));
          } else {
            await db.insert(sessionUsage).values({
              sessionId: input.sessionId,
              generationsUsed: 1,
            });
          }
        }

        // Notifica il proprietario
        try {
          await notifyOwner({
            title: `🎨 Vernice AI: Colore applicato`,
            content: `Un cliente ha applicato il colore ${input.colorHex} (${colorName}) sulla "${input.wallDescription}". Potrebbe essere interessato a un preventivo!`,
          });
        } catch {
          // Non bloccare
        }

        return { url: result.url };
      }),
  }),

  quote: router({
    uploadPhoto: publicProcedure
      .input(z.object({
        base64: z.string(),
        fileName: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const buffer = Buffer.from(input.base64.split(',')[1] || input.base64, 'base64');
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(7);
          const fileKey = `quote-photos/${timestamp}-${random}-${input.fileName}`;
          const { url } = await storagePut(fileKey, buffer, 'image/jpeg');
          return { success: true, url, fileKey };
        } catch (error) {
          console.error('Photo upload error:', error);
          throw new Error('Failed to upload photo');
        }
      }),
  }),

  // -- AI Chatbot: Intelligent Texture Recommendations (Protected) ----------------
  chatbot: router({
    chat: protectedProcedure
      .input(z.object({
        message: z.string().min(1).max(500),
        conversationHistory: z.array(z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })).optional().default([]),
      }))
      .mutation(async ({ input, ctx }) => {
        // Timeout protection: 15 seconds max
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Chatbot response timeout')), 15000)
        );

        try {
          const systemPrompt = `You are an expert AI assistant for Decor Carpi, an Italian decorative plaster company.

You specialize in helping customers find the perfect decorative finishes for their spaces.

Available textures:
${TEXTURES.map(t => `- ${t.name}: ${t.description}`).join('\n')}\n\nYour role:
1. Answer questions about textures, finishes, styles, and design
2. Provide personalized recommendations based on customer preferences
3. Explain characteristics, durability, and maintenance of different finishes
4. Suggest creative combinations and applications
5. Be helpful, professional, and enthusiastic about Decor Carpi products

Always respond in Italian. Keep responses concise and friendly.`;

          const messages = [
            { role: 'system' as const, content: systemPrompt },
            ...input.conversationHistory,
            { role: 'user' as const, content: input.message },
          ];

          const response = await Promise.race([
            invokeLLM({ messages }),
            timeoutPromise,
          ]);

          const assistantMessage = (response as any)?.choices?.[0]?.message?.content || 'Mi scusa, non ho potuto generare una risposta. Riprova.';

          return {
            success: true,
            message: assistantMessage,
            userId: ctx.user.id,
          };
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Unknown error';
          console.error('[Chatbot Error]', msg);
          
          if (msg.includes('timeout')) {
            throw new Error('Il servizio AI è momentaneamente lento. Riprova tra qualche istante.');
          }
          if (msg.toLowerCase().includes('rate') || msg.toLowerCase().includes('limit')) {
            throw new Error('Troppi messaggi. Attendi un momento e riprova.');
          }
          throw new Error('Errore nella generazione della risposta. Riprova.');
        }
      }),
  }),

  // Fotografia Router - Aplicare Texturi
  fotografia: router({
    uploadPhoto: publicProcedure
      .input(z.object({
        photoBase64: z.string(),
        sessionId: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const buffer = Buffer.from(input.photoBase64.split(',')[1] || input.photoBase64, 'base64');
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(7);
          const fileKey = `fotografia-photos/${timestamp}-${random}.jpg`;
          const { url } = await storagePut(fileKey, buffer, 'image/jpeg');
          return { success: true, url, fileKey };
        } catch (error) {
          console.error('Fotografia photo upload error:', error);
          throw new Error('Errore nel caricamento della foto');
        }
      }),

    applyTexture: publicProcedure
      .input(z.object({
        originalImageUrl: z.string(),
        textureId: z.string(),
        textureName: z.string(),
        intensity: z.number().min(0).max(100),
        opacity: z.number().min(0).max(100),
        sessionId: z.string(),
        proCode: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Verifica se è in modalità PRO (basato su user.role)
        const isPro = ctx.user?.role === "pro";

        const db = await getDb();
        if (db && !isPro) {
          const rows = await db.select().from(sessionUsage)
            .where(eq(sessionUsage.sessionId, input.sessionId))
            .limit(1);
          const used = rows.length > 0 ? rows[0].generationsUsed : 0;
        }

        const texture = TEXTURES.find(t => t.id === input.textureId);
        if (!texture) {
          throw new Error("Textură nu găsită");
        }

        const promptText = `You are a professional interior design visualizer for Decor Carpi, an Italian luxury decorative stucco company.

Apply the decorative stucco texture "${input.textureName}" to ALL walls in this room photo.
- Texture Intensity: ${input.intensity}%
- Opacity: ${input.opacity}%
- Texture Characteristics: ${texture.promptKeyword}

CRITICAL REQUIREMENTS FOR PHOTOREALISTIC STUCCO FINISH:
- Apply the texture to ALL visible walls as a professional decorative stucco finish
- Create realistic material variations and subtle shadows that mimic real stucco
- The texture should look photorealistic and professionally applied
- Maintain natural lighting, shadows, and reflections from the original room
- Keep furniture, objects, floor, ceiling, doors, windows, and lighting EXACTLY as they are
- The result should look like a real professional interior design preview photo
- Ensure consistent texture distribution across all walls
- Maintain the same room perspective and camera angle`;

        let result;
        try {
          result = await generateImage({
            prompt: promptText,
            originalImages: [{ url: input.originalImageUrl, mimeType: "image/jpeg" }],
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.toLowerCase().includes("rate") || msg.toLowerCase().includes("limit")) {
            throw new Error("Il servizio AI è momentaneamente sovraccarico. Attendi 1-2 minuti e riprova.");
          }
          if (msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network")) {
            throw new Error("Errore di connessione. Controlla la tua connessione internet e riprova.");
          }
          throw new Error("Generazione non riuscita. Riprova tra qualche istante.");
        }

        if (db && !isPro) {
          const existingUsage = await db.select().from(sessionUsage)
            .where(eq(sessionUsage.sessionId, input.sessionId))
            .limit(1);
          if (existingUsage.length > 0) {
            await db.update(sessionUsage)
              .set({ generationsUsed: existingUsage[0].generationsUsed + 1 })
              .where(eq(sessionUsage.sessionId, input.sessionId));
          } else {
            await db.insert(sessionUsage).values({
              sessionId: input.sessionId,
              generationsUsed: 1,
            });
          }
        }

        try {
          await notifyOwner({
            title: `🎨 Fotografia AI: Textură aplicată`,
            content: `Un cliente ha applicato la textură "${input.textureName}" (intensità ${input.intensity}%, opacità ${input.opacity}%). Potrebbe essere interessato a un preventivo!`,
          });
        } catch {
          // Non bloccare
        }

        return { url: result.url || null };
      }),
  }),

});

export type AppRouter = typeof appRouter;
