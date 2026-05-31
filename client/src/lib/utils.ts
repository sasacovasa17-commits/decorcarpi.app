import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { nanoid } from "nanoid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generează sau recuperează session ID persistent
export function getSessionId(): string {
  const key = "decorcarpi_session";
  let id = localStorage.getItem(key);
  if (!id) {
    id = nanoid(24);
    localStorage.setItem(key, id);
  }
  return id;
}

// Converti File în base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Restituiamo l'URL dei dati completo (data:image/...;base64,...) per la visualizzazione in <img>
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Descarcă o Immagine din URL cu watermark
export async function downloadImage(url: string, filename: string) {
  try {
    // Importa funcția de watermark dinamic
    const { downloadImageWithWatermark } = await import('./watermark');
    await downloadImageWithWatermark(url, filename);
  } catch (error) {
    console.error('Errore la adaugarea watermark-ului, incerc descarcarea directa:', error);
    // Fallback la descarcarea directa fara watermark
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      const proxyUrl = `/api/download-image?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
      const a = document.createElement("a");
      a.href = proxyUrl;
      a.download = filename;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(objectUrl);
      } catch {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    }
  }
}

// Colori predefinite pentru Muri
export const WALL_COLORS = [
  { hex: "#FFFFFF", name: "Alb pur" },
  { hex: "#F5F0E8", name: "Alb cald" },
  { hex: "#E8E0D0", name: "Bej deschis" },
  { hex: "#D4C5A9", name: "Bej auriu" },
  { hex: "#C9A227", name: "Auriu Decor" },
  { hex: "#B8860B", name: "Auriu închis" },
  { hex: "#8B7355", name: "Bronz" },
  { hex: "#E8D5C4", name: "Piersică" },
  { hex: "#D4A574", name: "Teracotă deschis" },
  { hex: "#C17F4A", name: "Teracotă" },
  { hex: "#8B4513", name: "Maro roșcat" },
  { hex: "#F0E6D3", name: "Crem" },
  { hex: "#E0D0C0", name: "Gri cald" },
  { hex: "#C0B8B0", name: "Gri perlă" },
  { hex: "#A0A0A0", name: "Gri mediu" },
  { hex: "#707070", name: "Gri antracit" },
  { hex: "#404040", name: "Gri închis" },
  { hex: "#1A1A1A", name: "Negru" },
  { hex: "#2C3E50", name: "Albastru noapte" },
  { hex: "#34495E", name: "Albastru gri" },
  { hex: "#5B8DB8", name: "Albastru deschis" },
  { hex: "#2980B9", name: "Albastru" },
  { hex: "#1A5276", name: "Albastru regal" },
  { hex: "#4A7C59", name: "Verde salvie" },
  { hex: "#27AE60", name: "Verde" },
  { hex: "#1E8449", name: "Verde închis" },
  { hex: "#7D3C98", name: "Mov" },
  { hex: "#9B59B6", name: "Lila" },
  { hex: "#E74C3C", name: "Roșu" },
  { hex: "#C0392B", name: "Roșu închis" },
];
