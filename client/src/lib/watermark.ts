/**
 * Utility pentru adaugare watermark pe Immagini
 * Watermark-ul este "decor carpi" scris de mână cursive
 */

/**
 * Aggiungi watermark pe o Immagine
 * @param imageUrl - URL-ul imaginii pe care se adaugă watermark-ul
 * @param options - Opzioni pentru watermark (paddingX, paddingY, fontSize, opacity)
 * @returns Promise cu URL-ul imaginii cu watermark
 */
export async function addWatermarkToImage(
  imageUrl: string,
  options?: {
    paddingX?: number; // padding orizontal din stânga (default: 15)
    paddingY?: number; // padding vertical de sus (default: 60 - puțin mai jos)
    fontSize?: number; // font size pentru text (default: 28 - mic)
    opacity?: number; // opacity pentru watermark (default: 0.7)
  }
): Promise<string> {
  const paddingX = options?.paddingX ?? 15;
  const paddingY = options?.paddingY ?? 60; // 60px - puțin mai jos decât 15px
  const fontSize = options?.fontSize ?? 28; // 28px - mic și elegant
  const opacity = options?.opacity ?? 0.7; // 70% opacity

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Nu s-a putut obține context-ul canvas"));
      return;
    }

    // Carica imaginea principală
    const mainImage = new Image();
    mainImage.crossOrigin = "anonymous";

    mainImage.onload = () => {
      // Imposta dimensiunile canvas-ului
      canvas.width = mainImage.width;
      canvas.height = mainImage.height;

      // Disegna imaginea principală
      ctx.drawImage(mainImage, 0, 0);

      // Disegna watermark-ul text direct pe canvas
      try {
        // Imposta font-ul - cursive elegant
        ctx.font = `italic ${fontSize}px 'Brush Script MT', 'Lucida Handwriting', cursive`;
        ctx.fillStyle = "rgba(255, 255, 255, 1)"; // Alb - transparent pe fundal
        ctx.globalAlpha = opacity; // 70% opacity
        ctx.textBaseline = "top";
        ctx.textAlign = "left";

        // Disegna textul "decor carpi" - puțin mai jos
        ctx.fillText("decor carpi", paddingX, paddingY);
        ctx.globalAlpha = 1;

        // Converti canvas-ul în blob și returnează URL-ul
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve(url);
            } else {
              reject(new Error("Nu s-a putut crea blob-ul imaginii"));
            }
          },
          "image/png",
          0.95
        );
      } catch (error) {
        reject(new Error("Errore la desenarea watermark-ului: " + error));
      }
    };

    mainImage.onerror = () => {
      reject(new Error("Nu s-a putut încărca imaginea principală"));
    };

    mainImage.src = imageUrl;
  });
}

/**
 * Descarcă o Immagine cu watermark
 * @param imageUrl - URL-ul imaginii
 * @param filename - Numele fișierului pentru download
 */
export async function downloadImageWithWatermark(
  imageUrl: string,
  filename: string = "decor-carpi.png"
): Promise<void> {
  try {
    const watermarkedUrl = await addWatermarkToImage(imageUrl);
    
    // Aggiungi timestamp la nume pentru a evita dialog-ul "Descarci din nou?"
    // Ogni descărcare va avea un nume unic
    const timestamp = Date.now();
    const filenameParts = filename.split('.');
    const ext = filenameParts.pop() || 'png';
    const baseName = filenameParts.join('.');
    const uniqueFilename = `${baseName}-${timestamp}.${ext}`;
    
    const link = document.createElement("a");
    link.href = watermarkedUrl;
    link.download = uniqueFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(watermarkedUrl);
  } catch (error) {
    console.error("Errore la descărcarea imaginii cu watermark:", error);
    throw error;
  }
}
