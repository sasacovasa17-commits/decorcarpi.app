/**
 * Image generation helper using internal ImageService
 *
 * Example usage:
 *   const { url: imageUrl } = await generateImage({
 *     prompt: "A serene landscape with mountains"
 *   });
 *
 * For editing:
 *   const { url: imageUrl } = await generateImage({
 *     prompt: "Add a rainbow to this landscape",
 *     originalImages: [{
 *       url: "https://example.com/original.jpg",
 *       mimeType: "image/jpeg"
 *     }]
 *   });
 */
import { storagePut } from "server/storage";
import { ENV } from "./env";

export type GenerateImageOptions = {
  prompt: string;
  originalImages?: Array<{
    url?: string;
    b64Json?: string;
    mimeType?: string;
  }>;
};

export type GenerateImageResponse = {
  url?: string;
};

export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResponse> {
  if (!ENV.forgeApiUrl) {
    throw new Error("BUILT_IN_FORGE_API_URL is not configured");
  }
  if (!ENV.forgeApiKey) {
    throw new Error("BUILT_IN_FORGE_API_KEY is not configured");
  }

  // Retry logic with exponential backoff
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Build the full URL by appending the service path to the base URL
      const baseUrl = ENV.forgeApiUrl.endsWith("/")
        ? ENV.forgeApiUrl
        : `${ENV.forgeApiUrl}/`;
      const fullUrl = new URL(
        "images.v1.ImageService/GenerateImage",
        baseUrl
      ).toString();

      // Add timeout for fetch request (30 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "connect-protocol-version": "1",
          authorization: `Bearer ${ENV.forgeApiKey}`,
        },
        body: JSON.stringify({
          prompt: options.prompt,
          original_images: options.originalImages || [],
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        const errorMsg = `Image generation request failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`;
        lastError = new Error(errorMsg);

        // Retry on 429 (rate limit) or 503 (service unavailable)
        if ((response.status === 429 || response.status === 503) && attempt < maxRetries - 1) {
          const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          console.log(`[ImageGeneration] Rate limited (${response.status}). Retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        // Provide user-friendly error messages
        if (response.status === 429) {
          throw new Error("Il servizio AI è momentaneamente sovraccarico. Attendi 1-2 minuti e riprova.");
        }
        if (response.status === 503) {
          throw new Error("Il servizio AI non è disponibile. Attendi alcuni minuti e riprova.");
        }
        throw lastError;
      }

      // Success - process response
      const result = (await response.json()) as {
        image: {
          b64Json: string;
          mimeType: string;
        };
      };
      const base64Data = result.image.b64Json;
      const buffer = Buffer.from(base64Data, "base64");

      console.log(`[ImageGeneration] Image generated successfully (${buffer.length} bytes)`);

      // Save to S3
      const { url } = await storagePut(
        `generated/${Date.now()}.png`,
        buffer,
        result.image.mimeType
      );
      
      console.log(`[ImageGeneration] Image saved to S3: ${url}`);
      return {
        url,
      };
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const msg = lastError.message.toLowerCase();
      
      console.error(`[ImageGeneration] Attempt ${attempt + 1} failed:`, lastError.message);
      
      // Handle timeout errors
      if (msg.includes("abort") || msg.includes("timeout")) {
        console.log(`[ImageGeneration] Timeout detected. Retrying...`);
        if (attempt < maxRetries - 1) {
          const waitTime = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        throw new Error("Generazione immagine timeout. Riprova.");
      }
      
      // If it's not a rate limit error or we've exhausted retries, throw immediately
      if (!msg.includes("429") && !msg.includes("503") && !msg.includes("rate") && !msg.includes("unavailable")) {
        throw lastError;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw lastError;
      }

      // Otherwise, continue to next retry
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`[ImageGeneration] Retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  // Should not reach here, but throw last error if we do
  throw lastError || new Error("Image generation failed after all retries");
}
