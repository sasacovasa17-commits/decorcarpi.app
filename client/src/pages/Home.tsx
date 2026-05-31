/**
 * Decor Carpi - App Mobile Visualizzatore Texture
 * Design: Dark Luxury, mobile-first, PWA-ready
 * Lingua: Italiano 🇮🇹
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useLocation, useRouter } from "wouter";


import { AdminPanel } from "@/components/AdminPanel";
import { AdminCostDashboard } from "@/components/AdminCostDashboard";

import { CustomQuoteFormScreen } from "@/components/CustomQuoteFormScreen";


import { TextureGallery } from "@/components/TextureGallery";
import { TextureComparison } from "@/components/TextureComparison";
import { TextureCollections } from "@/components/TextureCollections";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { getSessionId, fileToBase64, downloadImage, WALL_COLORS } from "@/lib/utils";

import { RAL_COLORS } from "@/lib/ralColors";
import { useTranslation } from "@/hooks/useTranslation";

import { useZoom } from "@/hooks/useZoom";
import { useHistory } from "@/hooks/useHistory";
import { useTheme } from "@/contexts/ThemeContext";
import { useImageOptimization } from "@/hooks/useImageOptimization";
import { useAuth } from "@/_core/hooks/useAuth";
import { useImageCache } from "@/hooks/useImageCache";
import { askClientData, addPreventive } from "@/lib/preventiveStorage";
import { InputDialog } from "@/components/InputDialog";
import { PromptDialog } from "@/components/PromptDialog";
import { UploadProgressBar } from "@/components/UploadProgressBar";
import { CropTool } from "@/components/CropTool";
import { CropToolAdvanced } from "@/components/CropToolAdvanced";
import { ColorPicker } from "@/components/ColorPicker";
import { ColorPreview } from "@/components/ColorPreview";
import { ContactFormComponent } from "@/components/ContactFormComponent";
import { PaintEditorScreen } from "@/pages/PaintEditorPage"; // Correctly exported as named export
import { FotografaScreen } from "@/pages/FotografaScreen"; // Texture application screen
import { ImageCropEditor } from "@/components/ImageCropEditor";
import { ImageFilters } from "@/components/ImageFilters";
import { BackupManager } from "@/components/BackupManager";
import { PhotoSelectionDialog } from "@/components/PhotoSelectionDialog";
// import { PromoCodeDialog } from "@/components/PromoCodeDialog"; // REMOVED

import { lazy, Suspense } from "react";

import type { Language } from "@/lib/i18n";

import {
  Camera, Upload, Sparkles, ChevronLeft, ChevronRight,
  Download, Share2, Phone, MessageCircle, Home as HomeIcon, Image,
  Layers, X, Check, Star,
  ArrowLeft, ZoomIn, Search, Bookmark, ExternalLink, Heart, Globe, Wand2, Link, Plus, Calculator, FileText,
  Settings, Lightbulb, Palette, FileCheck, ZoomOut, RotateCcw, Undo2, Redo2, Crop,
  Brush, Droplets, Wind, Ruler, FolderOpen, HelpCircle
} from "lucide-react";
// Removed CustomIcons - using standard lucide-react icons instead

// ── Tipi ─────────────────────────────────────────────────────────────────────────────────
type AppScreen = "home" | "upload" | "visualizer" | "gallery" | "contact" | "inspiration" | "style" | "privacy" | "calculator" | "biancatura" | "Antimuffa" | "preventivo" | "preventivi" | "settings" | "apartment-calc" | "project" | "Vernice" | "texture-gallery" | "texture-comparison" | "texture-collections" | "my-preventives" | "custom-quote" | "paint-editor" | "fotografia";
type Texture = { id: string; name: string; description: string; imageUrl: string; category: string };
type InspirationImage = { id: string; url: string; thumb: string; author: string; authorUrl: string; description: string };

// ── Costanti ──────────────────────────────────────────────────────────────────
const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/hero-banner-v2-NwecKWHDwJvSatLmHpEj4e.webp";

// ── Componenti UI ─────────────────────────────────────────────────────────────
const GoldDivider = React.memo(() => {
  return <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #c9a227, transparent)", opacity: 0.4 }} />;
});

// Lazy Loading Image Component
const LazyImage = React.memo(({ src, alt, className, onError }: { src: string; alt: string; className: string; onError?: (e: any) => void }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  return (
    <>
      {!loaded && !error && (
        <div className={`${className} bg-[#222] animate-pulse`} />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0 absolute'}`}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          setError(true);
          onError?.(e);
        }}
        loading="lazy"
      />
    </>
  );
});

// Skeleton Loader Component
const SkeletonLoader = React.memo(({ className }: { className: string }) => {
  return <div className={`${className} bg-gradient-to-r from-[#222] via-[#333] to-[#222] animate-pulse`} />;
});

const FAQItem = React.memo(({ question, answer, helpText }: { question: string; answer: string; helpText?: string }) => {
  const [open, setOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  return (
    <div className="rounded-sm border transition-all" style={{ borderColor: open ? "rgba(201,162,39,0.4)" : "rgba(201,162,39,0.15)", background: open ? "rgba(201,162,39,0.05)" : "transparent" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-start justify-between gap-3 text-left"
      >
        <div className="flex-1 flex items-start gap-2">
          <span className="text-xs font-semibold flex-1" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
            {question}
          </span>
          {helpText && (
            <div className="relative group" onClick={(e) => e.stopPropagation()}>
              <div
                onClick={() => setShowHelp(!showHelp)}
                className="text-[#c9a227] hover:text-[#d4b84f] transition-colors shrink-0 text-xs w-5 h-5 flex items-center justify-center rounded-full hover:bg-[rgba(201,162,39,0.1)] cursor-pointer"
                title="Help"
              >
                ℹ
              </div>
              {showHelp && (
                <div className="absolute bottom-full right-0 mb-2 w-40 p-2 rounded-sm bg-[#1a1a1a] border border-[rgba(201,162,39,0.3)] text-[9px] text-[#aaa] z-10" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  {helpText}
                  <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent" style={{ borderTopColor: "rgba(201,162,39,0.3)" }} />
                </div>
              )}
            </div>
          )}
        </div>
        <span className="text-[#c9a227] shrink-0 transition-transform" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          ▼
        </span>
      </button>
      {open && (
        <div className="px-4 pb-3 border-t" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
          <p className="text-[10px] text-[#888] mt-2 leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            {answer}
          </p>
        </div>
      )}
    </div>
  );
});

const LoadingSpinner = React.memo(({ size: s = 24 }: { size?: number }) => {
  return (
    <div
      className="rounded-full border-2 border-t-transparent animate-spin"
      style={{ width: s, height: s, borderColor: "#c9a227", borderTopColor: "transparent" }}
    />
  );
});

// ── Utilità colore ───────────────────────────────────────────────────────────────────
function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

// ── Color Picker Avanzato ───────────────────────────────────────────────────────────
function ColorPickerPanel({ selectedColor, onSelectColor, t }: {
  selectedColor: string | null;
  onSelectColor: (c: string | null) => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const [colorMode, setColorMode] = useState<"palette" | "spectrum" | "hex" | "ral">("palette");
  const [hexInput, setHexInput] = useState("");
  const [hexError, setHexError] = useState(false);
  const [ralSearch, setRalSearch] = useState("");
  const spectrumRef = useRef<HTMLCanvasElement>(null);
  const hueRef = useRef<HTMLCanvasElement>(null);
  const [hue, setHue] = useState(0);

  // Disegna il gradiente colore sul canvas
  useEffect(() => {
    if (colorMode !== "spectrum" || !spectrumRef.current) return;
    const canvas = spectrumRef.current;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width; const h = canvas.height;
    // Gradiente orizzontale: bianco -> colore hue
    const gradH = ctx.createLinearGradient(0, 0, w, 0);
    gradH.addColorStop(0, "#fff");
    gradH.addColorStop(1, `hsl(${hue},100%,50%)`);
    ctx.fillStyle = gradH;
    ctx.fillRect(0, 0, w, h);
    // Gradiente verticale: trasparente -> nero
    const gradV = ctx.createLinearGradient(0, 0, 0, h);
    gradV.addColorStop(0, "rgba(0,0,0,0)");
    gradV.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = gradV;
    ctx.fillRect(0, 0, w, h);
  }, [hue, colorMode]);

  // Disegna la barra hue
  useEffect(() => {
    if (colorMode !== "spectrum" || !hueRef.current) return;
    const canvas = hueRef.current;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    [0,60,120,180,240,300,360].forEach((h, i) => grad.addColorStop(i/6, `hsl(${h},100%,50%)`));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [colorMode]);

  const pickFromSpectrum = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = spectrumRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width - 1));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height - 1));
    const ctx = canvas.getContext("2d")!;
    const px = ctx.getImageData(Math.round(x * canvas.width / rect.width), Math.round(y * canvas.height / rect.height), 1, 1).data;
    const hex = "#" + [px[0], px[1], px[2]].map(v => v.toString(16).padStart(2, "0")).join("");
    onSelectColor(hex);
  }, [hue, onSelectColor]);

  const pickHue = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = hueRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width - 1));
    setHue(Math.round((x / rect.width) * 360));
  }, []);

  const applyHex = () => {
    const val = hexInput.trim();
    const full = val.startsWith("#") ? val : "#" + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(full)) {
      onSelectColor(full.toUpperCase());
      setHexError(false);
    } else {
      setHexError(true);
    }
  };

  const ralFiltered = ralSearch.trim().length > 0
    ? RAL_COLORS.filter(c =>
        c.ral.toLowerCase().includes(ralSearch.toLowerCase()) ||
        c.name.toLowerCase().includes(ralSearch.toLowerCase())
      ).slice(0, 40)
    : RAL_COLORS.slice(0, 40);

  const modeTabs = [
    { key: "palette", label: t.colorModePalette ?? "Palette" },
    { key: "spectrum", label: t.colorModeSpectrum ?? "Spettro" },
    { key: "hex", label: "HEX" },
    { key: "ral", label: "RAL" },
  ] as const;

  return (
    <div>
      {/* Colore selezionato */}
      {selectedColor && (
        <div className="flex items-center gap-2 mb-3 p-2 rounded-sm" style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.2)" }}>
          <div className="w-7 h-7 rounded-sm border border-white/20 shrink-0" style={{ background: selectedColor }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#e8e8e8] truncate">
              {RAL_COLORS.find(c => c.hex.toUpperCase() === selectedColor.toUpperCase())?.ral ||
               WALL_COLORS.find(c => c.hex.toUpperCase() === selectedColor.toUpperCase())?.name ||
               selectedColor.toUpperCase()}
            </p>
            <p className="text-[10px] text-[#888]">{selectedColor.toUpperCase()}</p>
          </div>
          <button onClick={() => onSelectColor(null)} className="text-[#666] shrink-0"><X size={14} /></button>
        </div>
      )}

      {/* Tabs modalità */}
      <div className="flex gap-1 mb-3">
        {modeTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setColorMode(tab.key)}
            className="flex-1 py-1.5 text-[10px] font-bold tracking-wide rounded-sm transition-colors"
            style={{
              fontFamily: "'Raleway', sans-serif",
              background: colorMode === tab.key ? "#c9a227" : "rgba(255,255,255,0.05)",
              color: colorMode === tab.key ? "#0a0a0a" : "#888",
              border: colorMode === tab.key ? "none" : "1px solid rgba(255,255,255,0.1)",
            }}
          >{tab.label}</button>
        ))}
      </div>

      {/* PALETTE */}
      {colorMode === "palette" && (
        <div className="grid grid-cols-6 gap-2">
          {WALL_COLORS.map((c) => (
            <button
              key={c.hex}
              onClick={() => onSelectColor(c.hex === selectedColor ? null : c.hex)}
              className="aspect-square rounded-sm transition-transform active:scale-90"
              title={c.name}
              style={{
                background: c.hex,
                border: selectedColor === c.hex ? "2px solid #c9a227" : "1px solid rgba(255,255,255,0.15)",
                boxShadow: selectedColor === c.hex ? "0 0 0 2px rgba(201,162,39,0.4)" : "none",
              }}
            />
          ))}
        </div>
      )}

      {/* SPETTRO */}
      {colorMode === "spectrum" && (
        <div className="space-y-3">
          <p className="text-[10px] text-[#666]" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            {t.colorSpectrumHint ?? "Tocca per scegliere il colore"}
          </p>
          {/* Canvas colore */}
          <canvas
            ref={spectrumRef}
            width={280} height={160}
            className="w-full rounded-sm cursor-crosshair"
            style={{ border: "1px solid rgba(255,255,255,0.1)", touchAction: "none" }}
            onClick={pickFromSpectrum}
            onMouseMove={(e) => { if (e.buttons === 1) pickFromSpectrum(e); }}
          />
          {/* Barra hue */}
          <canvas
            ref={hueRef}
            width={280} height={18}
            className="w-full rounded-sm cursor-pointer"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            onClick={pickHue}
            onMouseMove={(e) => { if (e.buttons === 1) pickHue(e); }}
          />
          <p className="text-[10px] text-[#666] text-center">
            {t.colorHueHint ?? "Trascina la barra hue per cambiare tono"}
          </p>
        </div>
      )}

      {/* HEX */}
      {colorMode === "hex" && (
        <div className="space-y-3">
          <p className="text-[10px] text-[#888]" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            {t.colorHexHint ?? "Inserisci il codice HEX (es. #F5E6D3)"}
          </p>
          <div className="flex gap-2 items-center">
            <div className="w-9 h-9 rounded-sm border border-white/20 shrink-0" style={{ background: hexInput && !hexError ? (hexInput.startsWith("#") ? hexInput : "#" + hexInput) : "#333" }} />
            <input
              type="text"
              value={hexInput}
              onChange={(e) => { setHexInput(e.target.value); setHexError(false); }}
              onKeyDown={(e) => e.key === "Enter" && applyHex()}
              placeholder="#C9A227"
              maxLength={7}
              className="flex-1 px-3 py-2 text-sm rounded-sm"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: hexError ? "1px solid #e74c3c" : "1px solid rgba(255,255,255,0.15)",
                color: "#e8e8e8",
                fontFamily: "monospace",
                outline: "none",
              }}
            />
            <button
              onClick={applyHex}
              className="px-3 py-2 text-xs font-bold rounded-sm"
              style={{ background: "#c9a227", color: "#0a0a0a", fontFamily: "'Raleway', sans-serif" }}
            >
              OK
            </button>
          </div>
          {hexError && <p className="text-[10px]" style={{ color: "#e74c3c" }}>Codice HEX non valido. Usa il formato #RRGGBB</p>}
        </div>
      )}

      {/* RAL */}
      {colorMode === "ral" && (
        <div className="space-y-3">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#666]" />
            <input
              type="text"
              value={ralSearch}
              onChange={(e) => setRalSearch(e.target.value)}
              placeholder={t.colorRalSearch ?? "Cerca RAL (es. 9001, bianco...)"}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-sm"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#e8e8e8",
                fontFamily: "'Open Sans', sans-serif",
                outline: "none",
              }}
            />
          </div>
          <div className="grid grid-cols-1 gap-1.5 max-h-64 overflow-y-auto pr-1">
            {ralFiltered.map((c) => (
              <button
                key={c.ral}
                onClick={() => onSelectColor(c.hex === selectedColor ? null : c.hex)}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-sm transition-colors active:scale-95"
                style={{
                  background: selectedColor === c.hex ? "rgba(201,162,39,0.15)" : "rgba(255,255,255,0.03)",
                  border: selectedColor === c.hex ? "1px solid rgba(201,162,39,0.5)" : "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="w-7 h-7 rounded-sm shrink-0 border border-white/10" style={{ background: c.hex }} />
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[11px] font-bold text-[#e8e8e8] leading-tight" style={{ fontFamily: "'Raleway', sans-serif" }}>{c.ral}</p>
                  <p className="text-[10px] text-[#888] truncate">{c.name}</p>
                </div>
                {selectedColor === c.hex && <Check size={13} style={{ color: "#c9a227" }} className="shrink-0" />}
              </button>
            ))}
          </div>
          {ralSearch.trim().length === 0 && (
            <p className="text-[10px] text-[#555] text-center">{t.colorRalAll ?? "Mostra i primi 40 — cerca per filtrare"}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Selettore Lingua ────────────────────────────────────────────────────────────
// LanguageSelector rimosso - app in italiano solo

// ── Griglia Preview Texture ───────────────────────────────────────────────────
function TexturePreviewGrid({ onSelect }: { onSelect: (textureId: string) => void }) {
  const { data: textures } = trpc.textures.list.useQuery();
  if (!textures) return <div className="flex justify-center py-4"><LoadingSpinner /></div>;
  return (
    <div className="grid grid-cols-3 gap-2">
      {textures.map((t) => (
        <button key={t.id} onClick={() => onSelect(t.id)} className="relative rounded-sm overflow-hidden aspect-square active:scale-95 transition-transform">
          <LazyImage src={t.imageUrl} alt={t.name} className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.background = '#1a1a1a'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <p className="absolute bottom-1 left-1 right-1 text-[9px] text-white font-semibold leading-tight" style={{ fontFamily: "'Raleway', sans-serif" }}>
            {t.name}
          </p>
        </button>
      ))}
    </div>
  );
}

// ── Certifications Section Component ─────────────────────────────────────────
function CertificationsSection() {
  const [selectedCert, setSelectedCert] = useState<number | null>(null);
  const certs = [
    { 
      title: "Certificat Antimuffa", 
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/zokRXgi6ILBO_a6b32a93.jpg",
      alt: "Certificato specializzazione trattamenti Antimuffa e protezione biologica pareti"
    },
    { 
      title: "Certificat Vernici Professionali", 
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/ULwliGo9w3Dg_344edeff.jpg",
      alt: "Certificazione vernici professionali e tecniche di pittura decorativa avanzate"
    },
    { 
      title: "Certificat Qualità", 
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/8WnrzSbgVLfl_7d492611.jpg",
      alt: "Certificato garanzia qualità e standard internazionali servizi decorativi Decor Carpi"
    },
    { 
      title: "Certificat Stucchi Decorativi", 
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/5WjbvFPD2wjC_e4a0a6aa.jpg",
      alt: "Certificazione professionale per applicazione Stucchi decorativi e finiture murali di qualità"
    }
  ];

  return (
    <>
      {/* 3 Diploma Images in a Row */}
      <div className="grid grid-cols-3 gap-2">
        {certs.map((cert, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedCert(idx)}
            className="rounded-sm overflow-hidden transition-all hover:scale-105 active:scale-95"
            style={{ 
              cursor: "pointer",
              border: "1px solid rgba(201,162,39,0.3)"
            }}
          >
            <img 
              src={cert.image} 
              alt={cert.alt} 
              className="w-full h-auto object-cover" 
              style={{ maxHeight: "200px" }}
            />
          </button>
        ))}
      </div>

      {/* Full-Screen Modal */}
      {selectedCert !== null && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCert(null)}
        >
          <div 
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-2 right-2 p-2 bg-black/70 hover:bg-black rounded-sm transition z-10"
              style={{ color: "#c9a227" }}
            >
              <X size={24} />
            </button>

            {/* Full Diploma Image */}
            <img 
              src={certs[selectedCert].image} 
              alt={certs[selectedCert].title} 
              className="w-full h-auto rounded-sm" 
            />
          </div>
        </div>
      )}
    </>
  );
}


// ── Schermata: Home ───────────────────────────────────────────────────────────
function HomeScreen({ onNavigate, onNavigateWithTexture, isPro }: {
  onNavigate: (s: AppScreen) => void;
  onNavigateWithTexture: (textureId: string) => void;
  isPro: boolean;
}) {
  const { t } = useTranslation();
  const { currentColorTheme } = useTheme();

  const [isRepartoOpen, setIsRepartoOpen] = useState(false);
  const [notificationBadges, setNotificationBadges] = useState<Record<string, number>>({
    preventivo: 3,
    project: 2,
  });

  // Trigger fade-in animation on mount
  useEffect(() => {
    const headerElements = document.querySelectorAll('.fade-in');
    headerElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('fade-in');
      }, index * 100);
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: currentColorTheme.colors.bg }}>
      {/* Header cu PRO Button - Sticky */}
      <div className="w-full px-4 py-3 flex items-center justify-between gap-4">
        {/* STÎNGA: DECOR CARPI + VISUALIZZATORE TEXTURE */}
        <div className="flex flex-col items-start justify-center">
          <h1 className="text-lg font-bold tracking-widest" style={{ color: "#c9a227", fontFamily: "'Playfair Display', serif" }}>
            {t.appName}
          </h1>
          <p className="text-[8px] tracking-[0.2em] mt-0.5 uppercase" style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}>
            {t.appSubtitle}
          </p>
        </div>


      </div>

      {/* Hero - HIDDEN (logo moved to header) */}

      {/* Contenuto principale */}
      <div className="flex-1 px-5 pt-1 pb-24">


        {/* CTA */}
        <button
          onClick={() => window.location.href = '/ispirazione-dc'}
          className="flex items-start gap-4 mb-4 w-full text-left active:scale-95 transition-transform rounded-sm"
          style={{ background: "transparent" }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-colors" style={{ borderColor: "#c9a227", color: "#c9a227", background: "rgba(201,162,39,0.06)", fontSize: "16px" }}>
            💡
          </div>
          <div className="flex-1">
            <p className="text-[#e8e8e8] text-sm font-semibold" style={{ fontFamily: "'Raleway', sans-serif" }}>
              Ispirazione D.C.
            </p>
            <p className="text-[#888] text-xs leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>
              Cerca ispirazione dai nostri progetti e scopri come trasformare i tuoi spazi
            </p>
          </div>
          <div className="shrink-0 self-center" style={{ color: "#c9a227", opacity: 0.5 }}>
            <ChevronRight size={16} />
          </div>
        </button>

        <GoldDivider />

        {/* Passi */}
        {[
          { icon: <Camera size={20} color="#c9a227" />, step: "1", title: t.homeStep1Title, desc: t.homeStep1Desc, action: () => onNavigate("fotografia") },
          { icon: "🖌️", step: "2", title: t.homeStep2Title, desc: t.homeStep2Desc, action: () => onNavigate("paint-editor") },
          { icon: <Palette size={20} color="#c9a227" />, step: "3", title: "Combina Stili", desc: "Combina due finiture per creare effetti personalizzati", action: () => window.location.href = "/?screen=style" },
        ].map((item) => (
          <button
            key={item.step}
            onClick={item.action}
            className="flex items-start gap-4 mb-4 w-full text-left active:scale-95 transition-transform rounded-sm"
            style={{ background: "transparent" }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-colors" style={{ borderColor: "#c9a227", color: "#c9a227", background: "rgba(201,162,39,0.06)", fontSize: typeof item.icon === 'string' ? '16px' : 'inherit' }}>
              {typeof item.icon === 'string' ? item.icon : item.icon}
            </div>
            <div className="flex-1">
              <p className="text-[#e8e8e8] text-sm font-semibold" style={{ fontFamily: "'Raleway', sans-serif" }}>
                {item.title}
              </p>
              <p className="text-[#888] text-xs leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                {item.desc}
              </p>
            </div>
            <div className="shrink-0 self-center" style={{ color: "#c9a227", opacity: 0.5 }}>
              <ChevronRight size={16} />
            </div>
          </button>
        ))}

        <GoldDivider />



        {/* Anteprima texture */}
        <div className="mt-5">
          <h2 className="text-base font-semibold mb-3" style={{ color: "#c9a227", fontFamily: "'Playfair Display', serif" }}>
            {t.homeFinishesTitle}
          </h2>
          <TexturePreviewGrid onSelect={onNavigateWithTexture} />
        </div>

        <GoldDivider />



        {/* Portafoglio - Lavori Reali */}
        <div className="mt-6">
          <h2 className="text-base font-semibold mb-4" style={{ color: "#c9a227", fontFamily: "'Playfair Display', serif" }}>
            🏗️ Portafoglio - Lavori Reali
          </h2>
          <p className="text-xs text-[#888] mb-4" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            Scopri i nostri progetti realizzati con le finiture Decor Carpi
          </p>
          <div className="grid grid-cols-1 gap-3">
            {[
              { type: "image", src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/zokRXgi6ILBO_a6b32a93.jpg", title: "Bagno Lussuoso - Effetto Marmorino", desc: "Finitura elegante con specchio illuminato" },
              { type: "image", src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/marmurino-enhanced_4c2c6afd.png", title: "Applicazione Texture - Dettagli", desc: "Guarda come viene applicata la texture" },
              { type: "image", src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/stencil-real_1aa8a383.jpg", title: "Parete Decorativa - Effetto Stencil", desc: "Motivi decorativi sofisticati" },
              { type: "image", src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/pelle-elefante-real_97d5e5fe.jpg", title: "Parete Principale - Effetto Naturale", desc: "Texture ruvida e sofisticata" },
              { type: "image", src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/pietra-spaccata-real_8224ab3e.jpg", title: "Elemento Decorativo - Pietra Spaccata", desc: "Finitura lussuosa con dettagli" },
              { type: "image", src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/effetto-cimento-real_a6e8f9b1.jpg", title: "Lavoro Realizzato - Parte 1", desc: "Processo di applicazione passo dopo passo" },
              { type: "image", src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/mappa-mondo-enhanced_13c1f23e.png", title: "Lavoro Realizzato - Parte 2", desc: "Dettagli della finitura finale" },
              { type: "image", src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/5WjbvFPD2wjC_e4a0a6aa.jpg", title: "Lavoro Realizzato - Parte 3", desc: "Risultato finale e qualità" },
            ].map((item, idx) => (
              <div key={idx} className="rounded-sm overflow-hidden border" style={{ borderColor: "rgba(201,162,39,0.2)", background: "rgba(255,255,255,0.02)" }}>
                {item.type === "image" ? (
                  <div className="relative h-40 bg-[#111] overflow-hidden">
                    <LazyImage src={item.src} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="relative h-40 bg-[#111] overflow-hidden flex items-center justify-center">
                    <video src={item.src} className="w-full h-full object-cover" controls />
                  </div>
                )}
                <div className="p-3">
                  <p className="text-xs font-semibold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
                    {item.title}
                  </p>
                  <p className="text-[10px] text-[#888] mt-1" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <GoldDivider />

        {/* Diplome - Certificazioni */}
        <div className="mt-6">
          <h2 className="text-base font-semibold mb-4" style={{ color: "#c9a227", fontFamily: "'Playfair Display', serif" }}>
            🏆 Le nostre Certificazioni
          </h2>
          <CertificationsSection />
        </div>

        <GoldDivider />

        {/* Recenzii - Testimoniale */}
        <div className="mt-6 mb-6">
          <h2 className="text-base font-semibold mb-4" style={{ color: "#c9a227", fontFamily: "'Playfair Display', serif" }}>
            ⭐ Cosa dicono i nostri clienti
          </h2>
          <div className="flex flex-col gap-3">
            {[
              { name: "bogdan zavati", city: "Google", text: "Ottimo servizio, professionali e puntuali. Consigliatissimi!", stars: 5 },
            ].map((r, i) => (
              <div key={i} className="p-4 rounded-sm" style={{ background: "rgba(201,162,39,0.05)", border: "1px solid rgba(201,162,39,0.18)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-bold" style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}>{r.name}</span>
                    <span className="text-[10px] ml-1.5" style={{ color: "#666" }}>{r.city}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} size={11} className={s <= r.stars ? "fill-yellow-400 text-yellow-400" : "text-gray-600"} />)}
                  </div>
                </div>
                <p className="text-[#aaa] text-xs italic leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  \"{r.text}\"
                </p>
              </div>
            ))}
            <a
              href="https://maps.app.goo.gl/chkRNnTrHGfME7KZ6?g_st=ac"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-sm text-center text-xs font-bold transition-all duration-300 hover:scale-105"
              style={{
                background: "rgba(201,162,39,0.15)",
                color: "#c9a227",
                border: "1px solid rgba(201,162,39,0.3)",
                fontFamily: "'Raleway', sans-serif",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(201,162,39,0.25)";
                e.currentTarget.style.borderColor = "rgba(201,162,39,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(201,162,39,0.15)";
                e.currentTarget.style.borderColor = "rgba(201,162,39,0.3)";
              }}
            >
              📍 Leggi tutte le recensioni su Google Maps
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Schermata: Upload ─────────────────────────────────────────────────────────
function UploadScreen({ onBack, onImageReady, t }: {
  onBack: () => void;
  onImageReady: (url: string, preview: string) => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const { currentColorTheme } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"uploading" | "compressing" | "optimizing" | "complete" | "error">("uploading");
  const [uploadFileName, setUploadFileName] = useState("");
  const { optimizeImage, progress: optimizationProgress } = useImageOptimization();
  const { cacheImage, getCachedImage, hashFile } = useImageCache();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const sessionId = getSessionId();
  const uploadMutation = trpc.upload.image.useMutation();

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;
    setError("");
    setUploading(true);
    setUploadFileName(file.name);
    setUploadProgress(0);
    setUploadStatus("compressing");
    
    try {
      const fileHash = await hashFile(file);
      const cached = getCachedImage(fileHash);
      
      if (cached) {
        setUploadProgress(100);
        setUploadStatus("complete");
        onImageReady(cached.url, cached.url);
        setTimeout(() => setUploading(false), 500);
        return;
      }
      
      setUploadStatus("optimizing");
      const optimized = await optimizeImage(file, {
        maxWidth: 1920,
        maxHeight: 1440,
        quality: 0.85,
        format: "webp",
      });
      
      setUploadProgress(80);
      setUploadStatus("uploading");
      const base64 = await fileToBase64(new File([optimized.blob], uploadFileName, { type: 'image/webp' }));
      const preview = optimized.url;
      const result = await uploadMutation.mutateAsync({ 
        base64, 
        mimeType: "image/webp", 
        sessionId 
      });
      
      cacheImage(fileHash, result.url, optimized.compressedSize);
      setUploadProgress(100);
      setUploadStatus("complete");
      onImageReady(result.url, preview);
      
      const saved = Math.round((optimized.compressionRatio * file.size) / 100 / 1024);
      toast.success(`Immagine optimizata! Economie: ${saved}KB`);
    } catch (err) {
      setError(t.uploadError);
      setUploadStatus("error");
      console.error("Upload error:", err);
    } finally {
      setTimeout(() => setUploading(false), 500);
    }
  }, [optimizeImage, hashFile, getCachedImage, cacheImage, uploadMutation, sessionId, onImageReady, t]);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: currentColorTheme.colors.bg }}>
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: "rgba(201,162,39,0.2)" }}>
        <button onClick={onBack} className="text-[#c9a227]"><ArrowLeft size={22} /></button>
        <h1 className="text-base font-bold tracking-wide" style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}>
          {t.uploadTitle}
        </h1>
      </div>

      <div className="flex-1 px-5 py-6 flex flex-col gap-5">
        <p className="text-[#888] text-sm text-center" style={{ fontFamily: "'Open Sans', sans-serif" }}>
          {t.uploadDesc}
        </p>

        <button
          onClick={() => cameraRef.current?.click()}
          disabled={uploading}
          className="w-full py-5 flex flex-col items-center gap-3 rounded-sm border-2 transition-all active:scale-95"
          style={{ borderColor: "#c9a227", background: "rgba(201,162,39,0.08)" }}
        >
          <Camera size={36} style={{ color: "#c9a227" }} />
          <span className="text-sm font-bold tracking-widest uppercase" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
            {t.uploadCameraBtn}
          </span>
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full py-5 flex flex-col items-center gap-3 rounded-sm border transition-all active:scale-95"
          style={{ borderColor: "rgba(201,162,39,0.3)", background: "rgba(255,255,255,0.03)" }}
        >
          <Upload size={36} style={{ color: "#e8e8e8" }} />
          <span className="text-sm font-bold tracking-widest uppercase" style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}>
            {t.uploadGalleryBtn}
          </span>
        </button>

        <UploadProgressBar 
          progress={uploadProgress} 
          isVisible={uploading} 
          fileName={uploadFileName}
          status={uploadStatus}
        />

        {uploading && !uploadProgress && (
          <div className="flex flex-col items-center gap-3 py-4">
            <LoadingSpinner size={32} />
            <p className="text-[#888] text-sm">{t.uploadUploading}</p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-sm border text-sm" style={{ borderColor: "rgba(231,76,60,0.4)", color: "#e74c3c", background: "rgba(231,76,60,0.08)" }}>
            {error}
          </div>
        )}

        <div className="mt-2 p-4 rounded-sm" style={{ background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.15)" }}>
          <p className="text-xs font-semibold mb-2" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
            {t.uploadTips}:
          </p>
          {[t.uploadTip1, t.uploadTip2, t.uploadTip3].map((tip) => (
            <p key={tip} className="text-xs text-[#888] mb-1" style={{ fontFamily: "'Open Sans', sans-serif" }}>• {tip}</p>
          ))}
        </div>
      </div>

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </div>
  );
}

// ── Schermata: Visualizzatore ─────────────────────────────────────────────────
function VisualizerScreen({ originalUrl, previewUrl, onBack, onSaveResult, t, preselectedTextureId, proCode, isPro }: {
  originalUrl: string;
  previewUrl: string;
  onBack: () => void;
  onSaveResult: (url: string, textureName: string) => void;
  t: ReturnType<typeof useTranslation>["t"];
  preselectedTextureId?: string | null;
  proCode?: string;
  isPro?: boolean;
}) {
  const { currentColorTheme } = useTheme();
  const { data: textures } = trpc.textures.list.useQuery();
  const [selectedTexture, setSelectedTexture] = useState<Texture | null>(null);

  // Auto-seleziona la texture pre-selezionata quando i dati sono disponibili
  useEffect(() => {
    if (preselectedTextureId && textures && !selectedTexture) {
      const found = textures.find((tx: Texture) => tx.id === preselectedTextureId);
      if (found) setSelectedTexture(found);
    }
  }, [preselectedTextureId, textures]); // eslint-disable-line react-hooks/exhaustive-deps

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(80);
  const [zone, setZone] = useState<"full" | "partial">("full");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [sliderPos, setSliderPos] = useState(50);
  const [activeTab, setActiveTab] = useState<"texture" | "color" | "options">("texture");
  const sessionId = getSessionId();
  
  // Zoom Controls
  const { zoom, containerRef, handleZoomIn, handleZoomOut, handleResetZoom } = useZoom(1, 0.5, 3);
  
  // Undo/Redo History
  const history = useHistory<{ texture: Texture | null; color: string | null; intensity: number }>(
    { texture: null, color: null, intensity: 80 }
  );
  
  // Ritaglio Tool
  const [showCropTool, setShowCropTool] = useState(false);
  const [showCropToolAdvanced, setShowCropToolAdvanced] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  
  const { data: usageData, refetch: refetchUsage } = trpc.usage.get.useQuery({ sessionId });
  const isUnlimited = usageData?.isUnlimited ?? false;
  const remaining = isUnlimited ? 999 : (usageData?.totalRemaining ?? 15);
  const requiresLogin = (usageData as any)?.requiresLogin ?? false;
  const renderMutation = trpc.render.generate.useMutation();
  const handleGenerate = async () => {
    console.log('[TEXTURE] handleGenerate START - texture:', selectedTexture?.id, 'color:', selectedColor, 'url:', originalUrl?.substring(0, 40));
    if (!selectedTexture && !selectedColor) { setError(t.vizSelectTexture + "!"); return; }
    setError("");
    setGenerating(true);
    setResultUrl(null);
    try {
      console.log('[TEXTURE] Calling renderMutation.mutateAsync...');
      const result = await renderMutation.mutateAsync({
        originalImageUrl: originalUrl,
        textureId: selectedTexture?.id ?? undefined,
        colorHex: selectedColor ?? undefined,
        intensity,
        sessionId,
        zone,
        proCode: proCode === "nina1221" ? proCode : undefined,
      });
      console.log('[TEXTURE] Result received:', result);
      if (result.url) {
        console.log('[TEXTURE] Setting resultUrl:', result.url.substring(0, 40));
        setResultUrl(result.url);
        onSaveResult(result.url, selectedTexture?.name ?? `Colore ${selectedColor}`);
        refetchUsage();
      } else {
        console.error('[TEXTURE] ERROR: result.url is undefined!');
      }
    } catch (err: unknown) {
      console.error('[TEXTURE] Mutation error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("LIMIT_REACHED")) {
        setError("Generazioni gratuite esaurite. Attiva la modalità PRO per generazioni illimitate!");
      } else {
        console.error('[TEXTURE] Full error:', err);
        setError(msg || t.vizErrorMsg);
      }
    } finally {
      setGenerating(false);
    }
  };;

  const sliderRef = useRef<HTMLDivElement>(null);
  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const pos = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pos);
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: currentColorTheme.colors.bg }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(201,162,39,0.2)" }}>
        <button onClick={onBack} className="text-[#c9a227]"><ArrowLeft size={22} /></button>
        <h1 className="text-sm font-bold tracking-wide" style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}>
          {t.vizTitle}
        </h1>
        <div className="flex gap-1 items-center">
          <button
            onClick={() => history.undo()}
            disabled={!history.canUndo}
            className="p-1.5 rounded-sm transition-colors disabled:opacity-30"
            style={{ background: history.canUndo ? "rgba(201,162,39,0.2)" : "transparent", color: "#c9a227" }}
            title="Undo"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={() => history.redo()}
            disabled={!history.canRedo}
            className="p-1.5 rounded-sm transition-colors disabled:opacity-30"
            style={{ background: history.canRedo ? "rgba(201,162,39,0.2)" : "transparent", color: "#c9a227" }}
            title="Redo"
          >
            <Redo2 size={16} />
          </button>
        </div>
      </div>

      {/* Preview immagine */}
      <div className="relative w-full bg-[#111]" style={{ height: "85vh", maxHeight: "85vh", minHeight: "100%" }}>
        {resultUrl ? (
          <>
            <div
              ref={sliderRef}
              className="relative w-full h-full overflow-hidden select-none flex items-center justify-center"
              onMouseMove={(e) => handleSliderMove(e.clientX)}
              onTouchMove={(e) => handleSliderMove(e.touches[0].clientX)}
            >
              <img src={resultUrl} alt="Risultato" className="absolute inset-0 w-full h-full object-contain" />
              <div className="absolute inset-0 overflow-hidden flex items-center justify-center" style={{ width: `${sliderPos}%` }}>
                <img src={previewUrl} alt="Originale" className="w-full h-full object-contain" style={{ width: `${100 / (sliderPos / 100)}%`, maxWidth: "none" }} />
              </div>
              <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${sliderPos}%` }}>
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xl">
                  <ChevronLeft size={10} className="text-gray-800" />
                  <ChevronRight size={10} className="text-gray-800" />
                </div>
              </div>
              <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-sm" style={{ background: "rgba(0,0,0,0.6)", color: "#fff", fontFamily: "'Raleway', sans-serif" }}>{t.vizBeforeLabel.toUpperCase()}</span>
              <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-sm" style={{ background: "rgba(201,162,39,0.8)", color: "#000", fontFamily: "'Raleway', sans-serif" }}>{t.vizAfterLabel.toUpperCase()}</span>
            </div>
            <div className="absolute bottom-2 left-2 flex gap-2">
              <button
                onClick={handleZoomIn}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.7)", color: "#c9a227" }}
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={handleZoomOut}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.7)", color: "#c9a227" }}
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <button
                onClick={handleResetZoom}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.7)", color: "#c9a227" }}
                title="Reset Zoom"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => setShowCropToolAdvanced(true)}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.7)", color: "#c9a227" }}
                title="Crop Advanced"
              >
                <Crop size={16} />
              </button>
            </div>
            <div className="absolute bottom-2 right-2 flex gap-2">
              <button
                onClick={() => { downloadImage(resultUrl, `decor-carpi-${selectedTexture?.id ?? "preview"}.jpg`); toast.success("Immagine Salvato\u0103 con successo!", { duration: 2500 }); }}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.7)", color: "#c9a227" }}
                title="Download"
              >
                <Download size={16} />
              </button>
              <a
                href={`https://wa.me/393343600932?text=${encodeURIComponent(`Ciao Decor Carpi! Ho visualizzato la texture "${selectedTexture?.name ?? "colore personalizzato"}" sulla mia Parete e vorrei ricevere un preventivo. Ecco il risultato: ${resultUrl}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "#25D366", color: "#fff" }}
                title="WhatsApp"
              >
                <MessageCircle size={16} />
              </a>
              <button
                onClick={() => { if (navigator.share) navigator.share({ title: "Decor Carpi Preview", url: resultUrl }); }}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.7)", color: "#c9a227" }}
                title="Condividi"
              >
                <Share2 size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full relative">
            <img src={previewUrl} alt="Camera" className="w-full h-full object-cover" />
            {generating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background: "rgba(10,10,10,0.75)" }}>
                <LoadingSpinner size={40} />
                <p className="text-sm font-semibold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>{t.vizGenerating}</p>
                <p className="text-xs text-[#888]">{t.vizGeneratingHint}</p>
              </div>
            )}
            {!generating && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-6">
                  <Sparkles size={28} style={{ color: "#c9a227" }} className="mx-auto mb-2" />
                  <p className="text-xs text-[#aaa]" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                    {t.vizSelectTextureHint}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: "rgba(201,162,39,0.2)" }}>
        {(["texture", "color", "options"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2.5 text-xs font-semibold tracking-wide uppercase transition-colors"
            style={{
              fontFamily: "'Raleway', sans-serif",
              color: activeTab === tab ? "#c9a227" : "#666",
              borderBottom: activeTab === tab ? "2px solid #c9a227" : "2px solid transparent",
            }}
          >
            {tab === "texture" ? t.vizTextureTab : tab === "color" ? t.vizColorTab : t.vizZoneTab}
          </button>
        ))}
      </div>

      {/* Contenuto tab */}
      <div className="flex-1 overflow-y-auto px-4 py-3" style={{ maxHeight: "calc(100vh - 380px)" }}>
        {activeTab === "texture" && (
          <div className="space-y-4">
            <p className="text-xs text-[#666] mb-3" style={{ fontFamily: "'Open Sans', sans-serif" }}>
              {t.vizSelectTextureHint}:
            </p>
            {textures ? (
              <div className="grid grid-cols-2 gap-2">
                {textures.map((tex) => (
                  <button
                    key={tex.id}
                    onClick={() => { console.log('[TEXTURE] Selected texture:', tex.id); setSelectedTexture(tex); }}
                    className="relative rounded-sm overflow-hidden active:scale-95 transition-transform"
                    style={{
                      border: selectedTexture?.id === tex.id ? "2px solid #c9a227" : "2px solid transparent",
                      outline: selectedTexture?.id === tex.id ? "1px solid rgba(201,162,39,0.4)" : "none",
                    }}
                  >
                    <LazyImage src={tex.imageUrl} alt={tex.name} className="w-full aspect-video object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    {selectedTexture?.id === tex.id && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#c9a227" }}>
                        <Check size={11} className="text-black" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-[11px] font-bold text-white leading-tight" style={{ fontFamily: "'Raleway', sans-serif" }}>{tex.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex justify-center py-6"><LoadingSpinner /></div>
            )}
            {selectedTexture && (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-3.5 flex items-center justify-center gap-2 rounded-sm font-bold text-sm tracking-widest uppercase transition-all active:scale-95 disabled:opacity-40"
                style={{ background: "#c9a227", color: "#0a0a0a", fontFamily: "'Raleway', sans-serif" }}
              >
                {generating ? (
                  <><LoadingSpinner size={18} /><span>{t.vizGenerating}</span></>
                ) : (
                  <><Sparkles size={18} /><span>{resultUrl ? t.vizRetryBtn : t.vizGenerateBtn}</span></>
                )}
              </button>
            )}
          </div>
        )}

        {activeTab === "color" && (
          <div className="space-y-4">
            <ColorPickerPanel selectedColor={selectedColor} onSelectColor={setSelectedColor} t={t} />
            {selectedColor && (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-3.5 flex items-center justify-center gap-2 rounded-sm font-bold text-sm tracking-widest uppercase transition-all active:scale-95 disabled:opacity-40"
                style={{ background: selectedColor, color: isLightColor(selectedColor) ? "#0a0a0a" : "#ffffff", fontFamily: "'Raleway', sans-serif", boxShadow: `0 0 16px ${selectedColor}55` }}
              >
                {generating ? (
                  <><LoadingSpinner size={18} /><span>{t.vizGenerating}</span></>
                ) : (
                  <><Sparkles size={18} /><span>{t.vizGenerateBtn}</span></>
                )}
              </button>
            )}
          </div>
        )}

        {activeTab === "options" && (
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-semibold text-[#e8e8e8]" style={{ fontFamily: "'Raleway', sans-serif" }}>
                  {t.vizIntensityLabel}
                </p>
                <span className="text-xs font-bold" style={{ color: "#c9a227" }}>{intensity}%</span>
              </div>
              <input
                type="range" min={20} max={100} value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none"
                style={{ accentColor: "#c9a227", background: `linear-gradient(to right, #c9a227 ${intensity}%, rgba(255,255,255,0.15) ${intensity}%)` }}
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-[#e8e8e8] mb-2" style={{ fontFamily: "'Raleway', sans-serif" }}>
                {t.vizZoneTab}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: "full" as const, label: t.vizZoneFullLabel },
                  { value: "partial" as const, label: t.vizZonePartialLabel },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setZone(opt.value)}
                    className="p-3 rounded-sm text-left transition-colors"
                    style={{
                      border: zone === opt.value ? "1.5px solid #c9a227" : "1px solid rgba(255,255,255,0.1)",
                      background: zone === opt.value ? "rgba(201,162,39,0.1)" : "rgba(255,255,255,0.03)",
                    }}
                  >
                    <p className="text-xs font-bold" style={{ color: zone === opt.value ? "#c9a227" : "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}>{opt.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {selectedTexture && (
              <div className="p-3 rounded-sm" style={{ background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.2)" }}>
                <p className="text-[10px] text-[#888] mb-1">{t.vizSelectTexture}:</p>
                <p className="text-xs font-bold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>{selectedTexture.name}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Banner generazioni rimanenti */}
      {isPro ? (
        <div className="mx-4 mt-3 px-3 py-2 rounded-sm flex items-center justify-between gap-2" style={{
          background: "rgba(201,162,39,0.1)",
          border: "1px solid rgba(201,162,39,0.4)",
        }}>
          <span className="text-xs font-bold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
            ⭐ Modalità PRO attiva — generazioni illimitate
          </span>
        </div>
      ) : isPro || isUnlimited ? null : (
        <div className="mx-4 mt-3 px-3 py-2 rounded-sm flex items-center justify-between gap-2" style={{
          background: remaining === 0 ? "rgba(231,76,60,0.1)" : remaining <= 3 ? "rgba(201,162,39,0.12)" : "rgba(201,162,39,0.05)",
          border: `1px solid ${remaining === 0 ? "rgba(231,76,60,0.3)" : remaining <= 3 ? "rgba(201,162,39,0.4)" : "rgba(201,162,39,0.2)"}`,
        }}>
          <div className="flex-1">
            <span className="text-xs font-semibold" style={{ color: remaining === 0 ? "#e74c3c" : remaining <= 3 ? "#d4b84f" : "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
              {remaining === 0
                ? "⚠️ Generazioni esaurite"
                : remaining <= 3
                ? `⚠️ Attenzione: ${remaining} generazione${remaining === 1 ? "" : "i"} rimanente${remaining === 1 ? "" : "i"}`
                : `📊 Generazioni: ${remaining}/15 disponibili`
              }
            </span>
            {remaining > 0 && remaining <= 3 && (
              <span className="text-xs mt-1 block" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
                Attiva PRO per generazioni illimitate
              </span>
            )}
          </div>

        </div>
      )}
      {error && (
        <div className="mx-4 mb-2 p-2 text-xs rounded-sm" style={{ background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)", color: "#e74c3c" }}>
          {error}
        </div>
      )}

      {/* Promo Code Dialog - REMOVED */}
      <div className="px-4 pb-24 pt-2 border-t flex flex-col gap-2" style={{ borderColor: "rgba(201,162,39,0.15)" }}>
        {resultUrl && (
          <button
            onClick={() => {
              const waUrl = `https://wa.me/393343600932?text=${encodeURIComponent(
                `Ciao Decor Carpi! Ho visualizzato la texture "${selectedTexture?.name ?? ""}" sulla mia Parete e vorrei ricevere un preventivo. Potete contattarmi? Grazie!`
              )}`;
              window.open(waUrl, '_blank', 'noopener,noreferrer');
              toast.success(t.whatsappToast ?? "Apertura WhatsApp... Ti risponderemo presto!", {
                duration: 4000,
                style: { background: '#111', color: '#c9a227', border: '1px solid rgba(201,162,39,0.4)' },
              });
            }}
            className="w-full py-3.5 flex items-center justify-center gap-2 rounded-sm font-bold text-sm tracking-widest uppercase transition-all active:scale-95"
            style={{ background: "#25D366", color: "#fff", fontFamily: "'Raleway', sans-serif" }}
          >
            <MessageCircle size={18} />
            <span>{t.vizRequestQuote ?? "Richiedi Preventivo"}</span>
          </button>
        )}
      </div>
      
      {/* Ritaglio Tool Modal */}
      {showCropTool && (
        <CropTool
          imageUrl={previewUrl}
          onCropChange={(cropArea) => {
            toast.success("Crop applicato! Zona selezionata", { duration: 2000 });
          }}
          onClose={() => setShowCropTool(false)}
        />
      )}
      
      {/* Ritaglio Tool Advanced Modal */}
      {showCropToolAdvanced && (
        <CropToolAdvanced
          imageUrl={previewUrl}
          onCropChange={(cropArea) => {
            toast.success("Crop avansat aplicat! Zona selezionata", { duration: 2000 });
          }}
          onClose={() => setShowCropToolAdvanced(false)}
        />
      )}
    </div>
  );
}

// ── Schermata: Galleria ───────────────────────────────────────────────────────
function GalleryScreen({ gallery, onBack, t }: {
  gallery: Array<{ url: string; textureName: string; timestamp: number }>;
  onBack: () => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const { currentColorTheme } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: currentColorTheme.colors.bg }}>
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: "rgba(201,162,39,0.2)" }}>
        <button onClick={onBack} className="text-[#c9a227]"><ArrowLeft size={22} /></button>
        <h1 className="text-base font-bold tracking-wide" style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}>
          {t.galleryTitle}
        </h1>
      </div>

      <div className="flex-1 px-4 py-4 pb-24">
        {gallery.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Image size={48} style={{ color: "#333" }} />
            <p className="text-[#555] text-sm text-center" style={{ fontFamily: "'Open Sans', sans-serif" }}>
              {t.galleryEmpty}<br />{t.galleryEmptyHint}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {gallery.map((item, i) => (
              <div key={i} className="rounded-sm overflow-hidden" style={{ border: "1px solid rgba(201,162,39,0.15)" }}>
                <div className="relative aspect-video">
                  <img src={item.url} alt={`Anteprima visualizzazione ${item.textureName} - Decor Carpi`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setSelected(item.url)}
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.6)", color: "#c9a227" }}
                  >
                    <ZoomIn size={13} />
                  </button>
                </div>
                <div className="p-2 bg-[#0d0d0d]">
                  <p className="text-[11px] font-bold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>{item.textureName}</p>
                  <div className="flex gap-1.5 mt-1.5">
                    <button
                      onClick={() => { downloadImage(item.url, `decor-carpi-${item.textureName.toLowerCase().replace(/\s/g, "-")}.jpg`); toast.success("Immagine Salvato\u0103 con successo!", { duration: 2500 }); }}
                      className="flex-1 py-1 text-[10px] font-semibold flex items-center justify-center gap-1 rounded-sm"
                      style={{ background: "#c9a227", color: "#000", fontFamily: "'Raleway', sans-serif" }}
                    >
                      <Download size={10} /> {t.galleryDownload}
                    </button>
                    <a
                      href={`https://wa.me/393343600932?text=${encodeURIComponent(`Ciao Decor Carpi! Ho visualizzato la texture "${item.textureName}" e vorrei un preventivo. Ecco il risultato: ${item.url}`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex-1 py-1 text-[10px] font-semibold flex items-center justify-center gap-1 rounded-sm"
                      style={{ background: "#25D366", color: "#fff", fontFamily: "'Raleway', sans-serif" }}
                    >
                      <MessageCircle size={10} /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95" onClick={() => setSelected(null)}>
          <img src={selected} alt="Preview" className="max-w-full max-h-full object-contain" />
          <button className="absolute top-4 right-4 text-white" onClick={() => setSelected(null)}><X size={28} /></button>
        </div>
      )}
    </div>
  );
}

// ── Schermata: Contatti ───────────────────────────────────────────────────────
function ContactScreen({ onBack, onNavigate, t }: {
  onBack: () => void;
  onNavigate: (s: AppScreen) => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const { currentColorTheme } = useTheme();
  return (
    <div className="flex flex-col min-h-screen" style={{ background: currentColorTheme.colors.bg }}>
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: "rgba(201,162,39,0.2)" }}>
        <button onClick={onBack} className="text-[#c9a227]"><ArrowLeft size={22} /></button>
        <h1 className="text-base font-bold tracking-wide" style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}>
          {t.contactTitle}
        </h1>
      </div>

      <div className="flex-1 px-5 py-6 pb-24 flex flex-col gap-5">
        <div className="text-center py-4">
          <h2 className="text-xl font-bold mb-2" style={{ color: "#c9a227", fontFamily: "'Playfair Display', serif" }}>
            {t.appName}
          </h2>
          <p className="text-[#888] text-sm" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            {t.contactSubtitle} — {t.contactAddressValue}
          </p>
        </div>

        <GoldDivider />

        <button
          onClick={() => {
            window.open('https://wa.me/393343600932', '_blank', 'noopener,noreferrer');
            toast.success(t.whatsappToast ?? "Apertura WhatsApp... Ti risponderemo presto!", {
              duration: 4000,
              style: { background: '#111', color: '#c9a227', border: '1px solid rgba(201,162,39,0.4)' },
            });
          }}
          className="w-full py-4 flex items-center justify-center gap-3 rounded-sm font-bold text-base tracking-wide transition-all active:scale-95"
          style={{ background: "#25D366", color: "#fff", fontFamily: "'Raleway', sans-serif" }}
        >
          <MessageCircle size={22} />
          {t.contactWhatsApp}
        </button>

        <a
          href="tel:+393343600932"
          className="w-full py-4 flex items-center justify-center gap-3 rounded-sm font-bold text-base tracking-wide border transition-all active:scale-95"
          style={{ borderColor: "#c9a227", color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}
        >
          <Phone size={22} />
          {t.contactCall}: +39 334 360 0932
        </a>

        <a
          href="mailto:decorcarpi@gmail.com"
          className="w-full py-4 flex items-center justify-center gap-3 rounded-sm font-bold text-base tracking-wide border transition-all active:scale-95"
          style={{ borderColor: "rgba(201,162,39,0.3)", color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}
        >
          ✉️ decorcarpi@gmail.com
        </a>

        <GoldDivider />

        {/* Contact Form */}
        <div>
          <h3 className="text-sm font-bold tracking-wide mb-4" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
            Inviaci un messaggio
          </h3>
          <ContactFormComponent
            onSuccess={() => {
              toast.success("Messaggio inviato con successo! Ti risponderemo presto.", {
                duration: 4000,
                style: { background: '#111', color: '#c9a227', border: '1px solid rgba(201,162,39,0.4)' },
              });
            }}
            onError={(error) => {
              toast.error(error || "Errore nell'invio del messaggio", {
                duration: 4000,
                style: { background: '#111', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.4)' },
              });
            }}
          />
        </div>

        <GoldDivider />
        {/* Recensioni clienti reali da Google */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
            ⭐ Cosa dicono i nostri clienti
          </h3>
          {[
            { name: "bogdan zavati", city: "Google", text: "Ottimo servizio, professionali e puntuali. Consigliatissimi!", stars: 5 },
          ].map((r, i) => (
            <div key={i} className="p-4 rounded-sm" style={{ background: "rgba(201,162,39,0.05)", border: "1px solid rgba(201,162,39,0.18)" }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-bold" style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}>{r.name}</span>
                  <span className="text-[10px] ml-1.5" style={{ color: "#666" }}>{r.city}</span>
                </div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => <Star key={s} size={11} className={s <= r.stars ? "fill-yellow-400 text-yellow-400" : "text-gray-600"} />)}
                </div>
              </div>
              <p className="text-[#aaa] text-xs italic leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                "{r.text}"
              </p>
            </div>
          ))}
          {/* Pulsante Google Maps */}
          <a
            href="https://maps.app.goo.gl/chkRNnTrHGfME7KZ6?g_st=ac"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-sm text-center text-xs font-bold transition-all duration-300 hover:scale-105"
            style={{
              background: "rgba(201,162,39,0.15)",
              color: "#c9a227",
              border: "1px solid rgba(201,162,39,0.3)",
              fontFamily: "'Raleway', sans-serif",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(201,162,39,0.25)";
              e.currentTarget.style.borderColor = "rgba(201,162,39,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(201,162,39,0.15)";
              e.currentTarget.style.borderColor = "rgba(201,162,39,0.3)";
            }}
          >
            📍 Leggi tutte le recensioni su Google Maps
          </a>
        </div>
        <GoldDivider />

        {/* Custom Quote Form */}


        <GoldDivider />

        {/* Additional Services */}


        <GoldDivider />

        <button
          onClick={() => onNavigate("privacy")}
          className="text-center text-xs underline w-full"
          style={{ color: "rgba(201,162,39,0.6)", fontFamily: "'Open Sans', sans-serif", background: "none", border: "none", cursor: "pointer" }}
        >
          {t.privacyLink ?? "Privacy Policy"}
        </button>
      </div>
    </div>
  );
}

// ── Schermata: Ispirazione ────────────────────────────────────────────────────
function InspirationScreen({ onBack, onUseImage, t }: {
  onBack: () => void;
  onUseImage: (url: string) => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const { currentColorTheme } = useTheme();
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [lightbox, setLightbox] = useState<InspirationImage | null>(null);

  const { data: categories } = trpc.inspiration.categories.useQuery();
  const { data: images, isLoading } = trpc.inspiration.search.useQuery({ query, category });

  const handleSearch = () => setQuery(searchInput);

  const toggleLike = (id: string) => {
    setLiked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Mappa etichette categorie con traduzioni
  const getCatLabel = (id: string) => {
    const map: Record<string, string> = {
      all: t.inspirationCatAll,
      decorcarpi: "🏠 Decor Carpi",
      stucco: t.inspirationCatStucco,
      beton: t.inspirationCatBeton,
      piatra: t.inspirationCatPiatra,
      venetian: t.inspirationCatVenetian,
      minimalist: t.inspirationCatMinimalist,
      industrial: t.inspirationCatIndustrial,
    };
    return map[id] ?? id;
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: currentColorTheme.colors.bg }}>
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: "rgba(201,162,39,0.2)" }}>
        <button onClick={onBack} className="text-[#c9a227]"><ArrowLeft size={22} /></button>
        <h1 className="text-base font-bold tracking-wide flex-1" style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}>
          {t.inspirationTitle}
        </h1>
        <span className="text-xs" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
          {images?.length ?? 0}
        </span>
      </div>

      {/* Barra di ricerca */}
      <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-sm" style={{ background: "#111", border: "1px solid rgba(201,162,39,0.25)" }}>
            <Search size={15} style={{ color: "#666" }} />
            <input
              type="text"
              placeholder={t.inspirationSearchPlaceholder}
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "#e8e8e8", fontFamily: "'Open Sans', sans-serif" }}
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(""); setQuery(""); }}>
                <X size={14} style={{ color: "#666" }} />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 text-xs font-bold tracking-wide rounded-sm"
            style={{ background: "#c9a227", color: "#0a0a0a", fontFamily: "'Raleway', sans-serif" }}
          >
            {t.inspirationSearchBtn}
          </button>
        </div>
      </div>

      {/* Categorie */}
      <div className="px-4 py-3 overflow-x-auto border-b" style={{ borderColor: "rgba(201,162,39,0.1)" }}>
        <div className="flex gap-2" style={{ minWidth: "max-content" }}>
          {(categories ?? []).map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: category === cat.id ? "#c9a227" : "rgba(201,162,39,0.1)",
                color: category === cat.id ? "#0a0a0a" : "#c9a227",
                border: "1px solid rgba(201,162,39,0.3)",
                fontFamily: "'Raleway', sans-serif",
              }}
            >
              {cat.emoji} {getCatLabel(cat.id)}
            </button>
          ))}
        </div>
      </div>

      {/* Griglia immagini */}
      <div className="flex-1 overflow-y-auto pb-24 px-3 pt-3">
        {isLoading ? (
          <div className="flex justify-center py-12"><LoadingSpinner size={32} /></div>
        ) : !images || images.length === 0 ? (
          <div className="text-center py-12">
            <Search size={40} style={{ color: "#333", margin: "0 auto 12px" }} />
            <p className="text-[#555] text-sm">{t.inspirationNoResults}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {images.map(img => (
              <div key={img.id} className="relative rounded-sm overflow-hidden" style={{ aspectRatio: "4/3" }}>
                <img
                  src={img.thumb}
                  alt={img.description}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setLightbox(img)}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-white text-[10px] leading-tight font-semibold" style={{ fontFamily: "'Raleway', sans-serif" }}>
                    {img.description}
                  </p>
                  <p className="text-[#aaa] text-[9px] mt-0.5">📷 {img.author}</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); toggleLike(img.id); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.6)" }}
                >
                  <Heart size={14} className={liked.has(img.id) ? "fill-red-500 text-red-500" : "text-white"} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-4 rounded-sm text-center" style={{ background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.2)" }}>
          <p className="text-[#c9a227] text-xs font-semibold mb-1" style={{ fontFamily: "'Raleway', sans-serif" }}>{t.inspirationTip}</p>
          <p className="text-[#888] text-xs leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            {t.inspirationTipText}
          </p>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={() => setLightbox(null)}>
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-[#e8e8e8] text-sm font-semibold" style={{ fontFamily: "'Raleway', sans-serif" }}>
              {lightbox.description}
            </p>
            <button onClick={() => setLightbox(null)}><X size={24} className="text-white" /></button>
          </div>
          <div className="flex-1 flex items-center justify-center px-4" onClick={e => e.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.description} className="max-w-full max-h-full object-contain rounded-sm" />
          </div>
          <div className="px-4 py-4 flex gap-3">
            <button
              onClick={() => { onUseImage(lightbox.url); setLightbox(null); }}
              className="flex-1 py-3 font-bold text-sm tracking-wide rounded-sm flex items-center justify-center gap-2"
              style={{ background: "#c9a227", color: "#0a0a0a", fontFamily: "'Raleway', sans-serif" }}
            >
              <Camera size={18} /> {t.inspirationUseBtn}
            </button>
            <a
              href={lightbox.authorUrl}
              target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="px-4 py-3 rounded-sm flex items-center justify-center"
              style={{ border: "1px solid rgba(201,162,39,0.3)", color: "#c9a227" }}
            >
              <ExternalLink size={18} />
            </a>
          </div>
          <p className="text-center text-[#444] text-[10px] pb-3">📷 {lightbox.author} · Unsplash</p>
        </div>
      )}
    </div>
  );
}

/// ── Schermata: Style Transfer (Combina 2 Foto) ──────────────────────────────
const StyleTransferScreen = React.memo(function StyleTransferScreenComponent({ onBack, t, onNavigate, proCode, isPro }: {
  onBack: () => void;
  t: ReturnType<typeof useTranslation>["t"];
  onNavigate: (s: AppScreen) => void;
  proCode?: string;
  isPro?: boolean;
}) {
  const { currentColorTheme } = useTheme();
  const [roomImage, setRoomImage] = useState<string>("");
  const [refImage, setRefImage] = useState<string>("");
  const [urlInput, setUrlInput] = useState<string>("");
  const [urlRefInput, setUrlRefInput] = useState<string>("");
  const [intensity, setIntensity] = useState(70);
  const [zone, setZone] = useState<"full" | "partial">("full");
  const [resultUrl, setResultUrl] = useState<string>("");
  const [error, setError] = useState("");
  const [_activeSlot, _setActiveSlot] = useState<"room" | "ref">("room");
  const [generating, setGenerating] = useState(false);
  const uploadMutation = trpc.upload.image.useMutation();
  const roomInputRef = useRef<HTMLInputElement>(null);
  const refInputRef = useRef<HTMLInputElement>(null);
  const roomGalleryRef = useRef<HTMLInputElement>(null);
  const refGalleryRef = useRef<HTMLInputElement>(null);

  const sessionId = getSessionId();
  
  // Zoom Controls
  const { zoom, containerRef, handleZoomIn, handleZoomOut, handleResetZoom } = useZoom(1, 0.5, 3);
  
  // Undo/Redo History
  const history = useHistory<{ texture: Texture | null; color: string | null; intensity: number }>(
    { texture: null, color: null, intensity: 80 }
  );
  
  // Ritaglio Tool
  const [showCropTool, setShowCropTool] = useState(false);
  const [showCropToolAdvanced, setShowCropToolAdvanced] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  
  const { data: usageData, refetch: refetchUsage } = trpc.usage.get.useQuery({ sessionId });
  const remaining = usageData?.totalRemaining ?? 15;
  const isUnlimited = usageData?.isUnlimited ?? false;
  const generateMutation = trpc.generateFromReference.useMutation({
    onSuccess: (data) => {
      setResultUrl(data.url ?? "");
      refetchUsage();
    },
    onError: (err: { message?: string }) => {
      setError(err.message || t.styleErrorGen);
    },
  });
  const handleFileSelect = (file: File, slot: "room" | "ref") => {
    try {
      console.log(`[${slot}] handleFileSelect called with file:`, file.name, file.size, file.type);
      
      // Validazione file
      if (!file || !file.type.startsWith('image/')) {
        setError('Seleziona o Immagine valida');
        console.error(`[${slot}] Invalid file type:`, file.type);
        return;
      }
      
      // Usa direct Blob URL (cel mai rapid pe mobile)
      const imageUrl = URL.createObjectURL(file);
      console.log(`[${slot}] Blob URL created:`, imageUrl);
      
      if (slot === "room") {
        setRoomImage(imageUrl);
        console.log(`[${slot}] Room image set to:`, imageUrl);
      } else {
        setRefImage(imageUrl);
        console.log(`[${slot}] Ref image set to:`, imageUrl);
      }
      setError('');
    } catch (err) {
      console.error(`[${slot}] File selection error:`, err);
      setError('Errore la incarcare imaginii. Incearca din nou.');
    }
  };

  const handleUrlLoad = async (slot: "room" | "ref") => {
    const url = slot === "room" ? urlInput : urlRefInput;
    if (!url.trim()) return;
    if (slot === "room") setRoomImage(url);
    else setRefImage(url);
  };

  const handleGenerate = async () => {
    if (!roomImage) { setError(t.styleErrorNoRoom); return; }
    if (!refImage) { setError(t.styleErrorNoRef); return; }
    setError("");
    setResultUrl("");
    setGenerating(true);
    
    try {
      // Converti blob URL la Blob
      const roomBlob = await fetch(roomImage).then(r => r.blob());
      const refBlob = await fetch(refImage).then(r => r.blob());
      
      // Converti Blob la base64
      const roomBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(roomBlob);
      });
      
      const refBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(refBlob);
      });
      
      console.log('[StyleTransfer] Uploading room image...');
      const roomUploadResult = await uploadMutation.mutateAsync({
        base64: roomBase64,
        mimeType: 'image/jpeg',
        sessionId,
      });
      
      console.log('[StyleTransfer] Uploading reference image...');
      const refUploadResult = await uploadMutation.mutateAsync({
        base64: refBase64,
        mimeType: 'image/jpeg',
        sessionId,
      });
      
      console.log('[StyleTransfer] Calling generateFromReference with uploaded URLs');
      // Apeleaza mutation cu URL-urile uploadate
      await new Promise<void>((resolve, reject) => {
        generateMutation.mutate(
          {
            roomImageUrl: roomUploadResult.url,
            referenceImageUrl: refUploadResult.url,
            intensity,
            zone,
            sessionId,
            proCode: proCode === "nina1221" ? proCode : undefined,
          },
          {
            onSuccess: () => resolve(),
            onError: (err: any) => reject(err),
          }
        );
      });
    } catch (err: any) {
      console.error('[StyleTransfer] Error:', err);
      setError(err?.message || 'Errore la generare');
    } finally {
      setGenerating(false);
    }
  };

  const ImageSlot = React.memo(({ slot, image, setImage, urlVal, setUrlVal, inputRef, galleryRef, handleFileSelect, t, setError }: {
    slot: "room" | "ref";
    image: string;
    setImage: (v: string) => void;
    urlVal: string;
    setUrlVal: (v: string) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
    galleryRef: React.RefObject<HTMLInputElement | null>;
    handleFileSelect: (file: File, slot: "room" | "ref") => void;
    t: ReturnType<typeof useTranslation>["t"];
    setError: (msg: string) => void;
  }) => (
    <div className="flex-1 flex flex-col gap-2">
      <p className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
        {slot === "room" ? t.styleRoomSlot : t.styleRefSlot}
      </p>
      <p className="text-[10px]" style={{ color: "#666", fontFamily: "'Open Sans', sans-serif" }}>
        {slot === "room" ? t.styleRoomDesc : t.styleRefDesc}
      </p>

      {image ? (
        <div className="relative rounded-sm overflow-hidden" style={{ aspectRatio: "4/3", border: "2px solid #c9a227" }}>
          <img src={image} alt="" className="w-full h-full object-cover" />
          <button
            onClick={() => setImage("")}
            className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.8)" }}
          >
            <X size={12} className="text-white" />
          </button>
        </div>
      ) : (
        <div
          className="rounded-sm flex flex-col items-center justify-center gap-2 cursor-pointer"
          style={{ aspectRatio: "4/3", border: "2px dashed rgba(201,162,39,0.4)", background: "rgba(201,162,39,0.04)" }}
          onClick={() => inputRef.current?.click()}
        >
          <Plus size={24} style={{ color: "rgba(201,162,39,0.5)" }} />
          <p className="text-[10px] text-center px-2" style={{ color: "#555", fontFamily: "'Open Sans', sans-serif" }}>
            {t.styleCameraBtn} / {t.styleGalleryBtn}
          </p>
        </div>
      )}

      {/* Pulsanti upload */}
      <div className="flex gap-1.5">
        {/* Camera input (con capture) - MUST be before label for iOS */}
        <input
          id={`camera-${slot}`}
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0], slot)}
        />
        {/* Galleria input (senza capture) - MUST be before label for iOS */}
        <input
          id={`gallery-${slot}`}
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0], slot)}
        />
        {/* Camera button - uses label for iOS compatibility */}
        <label
          htmlFor={`camera-${slot}`}
          className="flex-1 py-2 text-[10px] font-semibold rounded-sm flex items-center justify-center gap-1 cursor-pointer"
          style={{ background: "rgba(201,162,39,0.12)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.3)", fontFamily: "'Raleway', sans-serif" }}
        >
          <Camera size={12} /> {t.styleCameraBtn}
        </label>
        {/* Gallery button - uses label for iOS compatibility */}
        <label
          htmlFor={`gallery-${slot}`}
          className="flex-1 py-2 text-[10px] font-semibold rounded-sm flex items-center justify-center gap-1 cursor-pointer"
          style={{ background: "rgba(201,162,39,0.12)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.3)", fontFamily: "'Raleway', sans-serif" }}
        >
          <Image size={12} /> Galleria
        </label>
      </div>

      {/* URL input */}
      <div className="flex gap-1">
        <input
          type="url"
          placeholder={t.styleUrlPlaceholder}
          value={urlVal}
          onChange={e => setUrlVal(e.target.value)}
          className="flex-1 px-2 py-1.5 text-[10px] rounded-sm outline-none"
          style={{ background: "#111", border: "1px solid rgba(201,162,39,0.2)", color: "#e8e8e8", fontFamily: "'Open Sans', sans-serif" }}
        />
        <button
          onClick={() => handleUrlLoad(slot)}
          className="px-2 py-1.5 rounded-sm text-[10px] font-bold"
          style={{ background: "#c9a227", color: "#0a0a0a", fontFamily: "'Raleway', sans-serif" }}
        >
          <Link size={12} />
        </button>
      </div>


    </div>
  ));

  return (
    <div className="flex flex-col min-h-screen" style={{ background: currentColorTheme.colors.bg }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: "rgba(201,162,39,0.2)" }}>
        <button onClick={onBack} className="text-[#c9a227]"><ArrowLeft size={22} /></button>
        <h1 className="text-base font-bold tracking-wide flex-1" style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}>
          {t.styleTitle}
        </h1>
        <Wand2 size={20} style={{ color: "#c9a227" }} />
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 py-5 flex flex-col gap-5">
        {/* Descrizione */}
        <p className="text-[#888] text-xs leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>
          {t.styleDesc}
        </p>

        <GoldDivider />

        {/* I 2 slot immagine affiancati */}
        <div className="flex gap-3">
          <ImageSlot
            slot="room"
            image={roomImage}
            setImage={setRoomImage}
            urlVal={urlInput}
            setUrlVal={setUrlInput}
            inputRef={roomInputRef}
            galleryRef={roomGalleryRef}
            handleFileSelect={handleFileSelect}
            t={t}
            setError={setError}
          />
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(201,162,39,0.15)", border: "1px solid rgba(201,162,39,0.3)" }}>
              <Plus size={16} style={{ color: "#c9a227" }} />
            </div>
          </div>
          <ImageSlot
            slot="ref"
            image={refImage}
            setImage={setRefImage}
            urlVal={urlRefInput}
            setUrlVal={setUrlRefInput}
            inputRef={refInputRef}
            galleryRef={refGalleryRef}
            handleFileSelect={handleFileSelect}
            t={t}
            setError={setError}
          />
        </div>

        <GoldDivider />

        {/* Impostazioni */}
        <div className="flex flex-col gap-4">
          {/* Intensità */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs font-semibold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>{t.styleIntensityLabel}</span>
              <span className="text-xs" style={{ color: "#888" }}>{intensity}%</span>
            </div>
            <input
              type="range" min={20} max={100} value={intensity}
              onChange={e => setIntensity(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, #c9a227 ${intensity}%, #333 ${intensity}%)` }}
            />
          </div>

          {/* Zona */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>{t.styleZoneLabel}</p>
            <div className="flex gap-2">
              {(["full", "partial"] as const).map(z => (
                <button
                  key={z}
                  onClick={() => setZone(z)}
                  className="flex-1 py-2 text-xs font-semibold rounded-sm transition-all"
                  style={{
                    background: zone === z ? "#c9a227" : "rgba(201,162,39,0.08)",
                    color: zone === z ? "#0a0a0a" : "#c9a227",
                    border: "1px solid rgba(201,162,39,0.3)",
                    fontFamily: "'Raleway', sans-serif",
                  }}
                >
                  {z === "full" ? t.styleZoneFull : t.styleZonePartial}
                </button>
              ))}
            </div>
          </div>
        </div>

         {/* Banner generazioni rimanenti */}
        {!isPro && !isUnlimited && (
        <div className="px-3 py-2 flex items-center justify-between rounded-sm" style={{
          background: remaining === 0 ? "rgba(231,76,60,0.1)" : remaining <= 3 ? "rgba(201,162,39,0.12)" : "rgba(201,162,39,0.05)",
          border: `1px solid ${remaining === 0 ? "rgba(231,76,60,0.3)" : remaining <= 3 ? "rgba(201,162,39,0.4)" : "rgba(201,162,39,0.2)"}`,
        }}>
          <div className="flex-1">
            <span className="text-xs font-semibold" style={{ color: remaining === 0 ? "#e74c3c" : remaining <= 3 ? "#d4b84f" : "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
              {remaining === 0
                ? "⚠️ Generazioni esaurite"
                : remaining <= 3
                ? `⚠️ Attenzione: ${remaining} generazione${remaining === 1 ? "" : "i"} rimanente${remaining === 1 ? "" : "i"}`
                : `📊 Generazioni: ${remaining}/15 disponibili`
              }
            </span>
            {remaining > 0 && remaining <= 3 && (
              <span className="text-xs mt-1 block" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
                Attiva PRO per generazioni illimitate
              </span>
            )}
          </div>

        </div>
        )}

        {/* Errore */}
        {error && (
          <div className="p-3 rounded-sm text-xs" style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", color: "#f87171" }}>
            {error}
          </div>
        )}
        {/* Pulsante genera */}
        {!resultUrl && (
          <button
            onClick={handleGenerate}
            disabled={generateMutation.isPending || (remaining <= 0 && !isPro)}
            className="w-full py-4 font-bold text-sm tracking-widest rounded-sm flex items-center justify-center gap-3 transition-all active:scale-95"
            style={{
              background: generateMutation.isPending ? "rgba(201,162,39,0.3)" : "#c9a227",
              color: generateMutation.isPending ? "#888" : "#0a0a0a",
              fontFamily: "'Raleway', sans-serif",
            }}
          >
            {generateMutation.isPending ? (
              <><LoadingSpinner size={18} /> {t.styleGenerating}</>
            ) : (
              <><Wand2 size={18} /> {t.styleGenerateBtn}</>
            )}
          </button>
        )}

        {generateMutation.isPending && (
          <p className="text-center text-[11px]" style={{ color: "#666", fontFamily: "'Open Sans', sans-serif" }}>
            {t.styleGeneratingHint}
          </p>
        )}

        {/* Risultato */}
        {resultUrl && (
          <div className="flex flex-col gap-3">
            <GoldDivider />
            <p className="text-sm font-bold text-center" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
              ✨ {t.styleResultTitle}
            </p>
            <div className="rounded-sm overflow-hidden" style={{ border: "2px solid #c9a227" }}>
              <img src={resultUrl} alt="Risultato" className="w-full object-cover" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { downloadImage(resultUrl, "decor-carpi-style.jpg"); toast.success("Immagine Salvato\u0103 con successo!", { duration: 2500 }); }}
                className="flex-1 py-3 text-xs font-bold rounded-sm flex items-center justify-center gap-2"
                style={{ background: "rgba(201,162,39,0.12)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.3)", fontFamily: "'Raleway', sans-serif" }}
              >
                <Download size={14} /> {t.vizDownloadBtn}
              </button>
              <a
                href={`https://wa.me/393343600932?text=${encodeURIComponent("Ciao! Ho usato l'app Decor Carpi e vorrei un preventivo per questo stile! Ecco il risultato: " + resultUrl)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 py-3 text-xs font-bold rounded-sm flex items-center justify-center gap-2"
                style={{ background: "#25D366", color: "#fff", fontFamily: "'Raleway', sans-serif" }}
              >
                <MessageCircle size={14} /> {t.vizRequestQuote}
              </a>
            </div>
            <button
              onClick={() => { setResultUrl(""); setRoomImage(""); setRefImage(""); setError(""); }}
              className="w-full py-2.5 text-xs font-semibold rounded-sm"
              style={{ border: "1px solid rgba(201,162,39,0.3)", color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}
            >
              {t.vizNewBtn}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

// ── Barra di Navigazione Bottom ─────────────────────────────────────────────
// ── Schermata: Calcolatore Prezzo ──────────────────────────────────────────────
const TEXTURE_PRICES: Record<string, { min: number; max: number; unit: string }> = {
  "craquele":        { min: 35, max: 55, unit: "m²" },
  "fila-seta":       { min: 22, max: 35, unit: "m²" },
  "pietra-zen":      { min: 45, max: 65, unit: "m²" },
  "effetto-cimento": { min: 40, max: 60, unit: "m²" },
  "pelle-elefante":  { min: 45, max: 65, unit: "m²" },
  "stencil":         { min: 45, max: 85, unit: "m²" },
  "perlato":         { min: 20, max: 32, unit: "m²" },
  "pietra-spaccata": { min: 45, max: 75, unit: "m²" },
  "stucco-venexian": { min: 80, max: 110, unit: "m²" },
  "pietra-bamboo":   { min: 28, max: 36, unit: "m²" },
  "marmorino":       { min: 35, max: 60, unit: "m²" },
  "marmorino-premium": { min: 50, max: 90, unit: "m²" },
  "mappa-mondo": { min: 26, max: 42, unit: "m²" },
  "effetto-cimento-tiles": { min: 40, max: 60, unit: "m²" },
  "mappa-mondo-stencil": { min: 35, max: 55, unit: "m²" },
  "Marmurino-new": { min: 80, max: 100, unit: "m²" },
  "effetto-ruggine": { min: 40, max: 60, unit: "m²" },
  "mappa-mondo-oro": { min: 50, max: 65, unit: "m²" },
  "pietra-spaccata-new": { min: 45, max: 65, unit: "m²" },
  "stencil-elegante": { min: 50, max: 80, unit: "m²" },
  "pietra-spaccata-lusso": { min: 45, max: 65, unit: "m²" },
  "pietra-spaccata-venato-effetto": { min: 60, max: 100, unit: "m²" },
  "geometrie-materiche": { min: 55, max: 75, unit: "m²" },
};

function CalculatorPretScreen({ onBack, t }: {
  onBack: () => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const { currentColorTheme } = useTheme();
  const [selectedTextureId, setSelectedTextureId] = useState<string>("marmorino");
  const [lunghezza, setLunghezza] = useState("");
  const [altezza, setAltezza] = useState("");
  const [ferestre, setFerestre] = useState("0");
  const [porte, setPorte] = useState("0");
  const [mq, setMq] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [discountPercent, setScontoPercent] = useState(0);
  const [extraWorkPercent, setExtraWorkPercent] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [wallPhoto, setWallPhoto] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const { data: textures } = trpc.textures.list.useQuery();

  const handlePhotoCapture = useCallback((file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const photoUrl = e.target?.result as string;
          setWallPhoto(photoUrl);
        } catch (err) {
          console.error('Errore nel processare Foto:', err);
          toast.error('Errore nel caricamento Foto', {
            style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
          });
        }
      };
      reader.onerror = () => {
        console.error('Errore FileReader');
        toast.error('Errore nel leggere file', {
          style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
        });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Errore in handlePhotoCapture:', err);
    }
  }, []);

  // Caricamento preferenze da localStorage al montaggio
  useEffect(() => {
    const saved = localStorage.getItem('calculatorPreferences');
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        if (prefs.selectedTextureId) setSelectedTextureId(prefs.selectedTextureId);
        if (prefs.lunghezza) setLunghezza(prefs.lunghezza);
        if (prefs.altezza) setAltezza(prefs.altezza);
        if (prefs.mq) setMq(prefs.mq);
      } catch (e) {
        console.error('Errore nel caricamento delle preferenze:', e);
      }
    }
  }, []);

  // Salvataggio preferenze in localStorage ad ogni cambio
  useEffect(() => {
    const prefs = {
      selectedTextureId,
      lunghezza,
      altezza,
      mq,
    };
    localStorage.setItem('calculatorPreferences', JSON.stringify(prefs));
  }, [selectedTextureId, lunghezza, altezza, mq]);

  const lunghezzaNum = parseFloat(lunghezza) || 0;
  const altezzaNum = parseFloat(altezza) || 0;
  const ferestreNum = parseInt(ferestre) || 0;
  const porteNum = parseInt(porte) || 0;
  
  const mqCalcolato = lunghezzaNum > 0 && altezzaNum > 0 
    ? (lunghezzaNum * altezzaNum) - (ferestreNum * 1.5) - (porteNum * 2)
    : 0;
  
  const mqFinale = mq ? parseFloat(mq) : mqCalcolato;
  const mqLucro = Math.max(mqFinale, 0);

  const price = TEXTURE_PRICES[selectedTextureId];
  const baseMin = mqLucro > 0 && price ? mqLucro * price.min : 0;
  const baseMax = mqLucro > 0 && price ? mqLucro * price.max : 0;
  const mobileFactor = isMobile ? 1.15 : 1;
  const totalMin = baseMin > 0 ? Math.round(baseMin * mobileFactor) : null;
  const totalMax = baseMax > 0 ? Math.round(baseMax * mobileFactor) : null;
  const selectedTexture = textures?.find(t => t.id === selectedTextureId);

  const handleWhatsApp = () => {
    if (!totalMin || !totalMax) {
      toast.error("Inserisci le dimensioni o i m² per calcolare il preventivo", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
      return;
    }
    const dettagli = lunghezzaNum > 0 && altezzaNum > 0 
      ? `\n• Dimensioni: ${lunghezzaNum}m x ${altezzaNum}m\n• Ferestre: ${ferestreNum}\n• Porte: ${porteNum}\n• Superficie netta: ${mqFinale.toFixed(1)} m²`
      : `\n• Superficie: ${mq} m²`;
    const msg = `Ciao Decor Carpi! Vorrei un preventivo per:\n\n• Texture: ${selectedTexture?.name ?? selectedTextureId}${dettagli}\n• Stima: €${totalMin} - €${totalMax}\n\nPotete confermarmi il prezzo e i tempi?? Grazie!`;
    window.open(`https://wa.me/393343600932?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };



  return (
    <div className="flex flex-col min-h-screen" style={{ background: currentColorTheme.colors.bg }}>
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: "rgba(201,162,39,0.2)" }}>
        <button onClick={onBack} className="text-[#c9a227]"><ArrowLeft size={22} /></button>
        <h1 className="text-base font-bold tracking-wide" style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}>
          Preventivo Rapido
        </h1>
      </div>
      <div className="flex-1 px-5 py-6 pb-28 flex flex-col gap-5">
        <div className="text-center">
          <p className="text-xs" style={{ color: "#888", fontFamily: "'Open Sans', sans-serif" }}>
            Calcola il preventivo per la tua tencuiatura
          </p>
        </div>
        <GoldDivider />
        {/* Selettore texture */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
            1. Scegli la texture
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(textures ?? []).map(tex => (
              <button
                key={tex.id}
                onClick={() => setSelectedTextureId(tex.id)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-sm text-left transition-all"
                style={{
                  background: selectedTextureId === tex.id ? "rgba(201,162,39,0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selectedTextureId === tex.id ? "#c9a227" : "rgba(201,162,39,0.15)"}`,
                }}
              >
                <LazyImage src={tex.imageUrl} alt={tex.name} className="w-8 h-8 rounded-sm object-cover flex-shrink-0" />
                <span className="text-[11px] font-semibold leading-tight" style={{ color: selectedTextureId === tex.id ? "#c9a227" : "#aaa", fontFamily: "'Raleway', sans-serif" }}>
                  {tex.name}
                </span>
              </button>
            ))}
          </div>
        </div>
        <GoldDivider />
        {/* Opzione 1: Calcolo da dimensioni */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>1. Opzione A: Inserisci dimensioni</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-sm" style={{ background: "#111", border: "1px solid rgba(201,162,39,0.3)" }}>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="Lunghezza"
                value={lunghezza}
                onChange={e => setLunghezza(e.target.value)}
                className="flex-1 bg-transparent text-sm font-semibold outline-none"
                style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}
              />
              <span className="text-xs" style={{ color: "#888" }}>m</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-sm" style={{ background: "#111", border: "1px solid rgba(201,162,39,0.3)" }}>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="Altezza"
                value={altezza}
                onChange={e => setAltezza(e.target.value)}
                className="flex-1 bg-transparent text-sm font-semibold outline-none"
                style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}
              />
              <span className="text-xs" style={{ color: "#888" }}>m</span>
            </div>

          </div>
          {mqCalcolato > 0 && (
            <div className="mt-2 p-3 rounded-sm" style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.25)" }}>
              <p className="text-xs text-center" style={{ color: "#c9a227", fontFamily: "'Open Sans', sans-serif" }}>
                📐 Superficie calcolata: <strong>{mqCalcolato.toFixed(2)} m²</strong>
              </p>
              {price && mqCalcolato > 0 && (
                <p className="text-xs text-center mt-1" style={{ color: "#e8e8e8", fontFamily: "'Open Sans', sans-serif" }}>
                  💰 Preventivo: <strong>€{Math.round(Math.max(mqCalcolato, 0) * price.min * (isMobile ? 1.15 : 1))} – €{Math.round(Math.max(mqCalcolato, 0) * price.max * (isMobile ? 1.15 : 1))}</strong>
                </p>
              )}
            </div>
          )}
        </div>
        <GoldDivider />
        {/* Opzione 2: Input diretto m² */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>3. Opzione B: Inserisci m² direttamente</p>
          <div className="flex items-center gap-3 px-4 py-3 rounded-sm" style={{ background: "#111", border: "1px solid rgba(201,162,39,0.3)" }}>
            <input
              type="number"
              min="1"
              max="999"
              placeholder="Es. 25"
              value={mq}
              onChange={e => setMq(e.target.value)}
              className="flex-1 bg-transparent text-lg font-bold outline-none"
              style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}
            />
            <span className="text-sm font-bold" style={{ color: "#c9a227" }}>m²</span>
          </div>
        </div>
        <GoldDivider />
        {/* Risultato stima */}
        {totalMin !== null && totalMax !== null && (
          <div className="p-5 rounded-sm flex flex-col gap-3" style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.35)" }}>
            <p className="text-xs font-bold tracking-wide text-center" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
              STIMA PREVENTIVO
            </p>
            <div className="text-center">
              <span className="text-3xl font-bold" style={{ color: "#e8e8e8", fontFamily: "'Playfair Display', serif" }}>
                €{totalMin} – €{totalMax}
              </span>
            </div>
            <p className="text-[11px] text-center" style={{ color: "#888", fontFamily: "'Open Sans', sans-serif" }}>
              {selectedTexture?.name} • {mqLucro.toFixed(1)} m² • €{price?.min}–{price?.max}/m²
            </p>
            <p className="text-[10px] text-center" style={{ color: "#4caf50", fontFamily: "'Open Sans', sans-serif" }}>
              ✓ Materiale e IVA incluse
            </p>
            <p className="text-[10px] text-center italic" style={{ color: "#666", fontFamily: "'Open Sans', sans-serif" }}>
              * Stima indicativa. Il prezzo definitivo dipende da preparazione, zona e complessità.
            </p>
            <div className="mt-3 p-3 rounded-sm" style={{ background: "rgba(255,193,7,0.1)", border: "1px solid rgba(255,193,7,0.3)" }}>
              <p className="text-[10px] text-center" style={{ color: "#ffc107", fontFamily: "'Open Sans', sans-serif" }}>
                ⚠️ <strong>Nota importante:</strong> Se i muri sono umidi, macchiati o necessitano di preparazione speciale (stuccatura, pulizia profonda), il prezzo finale potrebbe aumentare. Vi contatteremo dopo un'ispezione in situ per una quotazione precisa.
              </p>
            </div>
            
            {/* Riduzioni */}
            <div className="p-4 rounded-sm" style={{ background: "rgba(76, 175, 80, 0.1)", border: "1px solid rgba(76, 175, 80, 0.3)" }}>
              <div className="flex flex-col gap-3">
                <p className="text-sm font-bold" style={{ color: "#4caf50", fontFamily: "'Raleway', sans-serif" }}>💰 Riduzioni/Sconto</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: "#4caf50", fontFamily: "'Raleway', sans-serif" }}>-% </span>
                    <input type="number" min="0" max="100" value={discountPercent} onChange={e => setScontoPercent(Math.min(100, Math.max(0, Number(e.target.value))))} className="w-16 px-2 py-1 bg-[#1a1a1a] text-xs rounded-sm" style={{ color: "#4caf50", border: "1px solid rgba(76, 175, 80, 0.5)" }} />
                  </div>
                  {discountPercent > 0 && <p className="text-xs" style={{ color: "#4caf50", fontFamily: "'Open Sans', sans-serif" }}>Riduzione: -€{Math.round(totalMin * (discountPercent / 100))}</p>}
                </div>
              </div>
            </div>
            
            {/* Lavori Supplementari */}
            <div className="p-4 rounded-sm" style={{ background: "rgba(255, 152, 0, 0.1)", border: "1px solid rgba(255, 152, 0, 0.3)" }}>
              <div className="flex flex-col gap-3">
                <p className="text-sm font-bold" style={{ color: "#ff9800", fontFamily: "'Raleway', sans-serif" }}>🔧 Lavori Supplementari</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: "#ff9800", fontFamily: "'Raleway', sans-serif" }}>+% </span>
                    <input type="number" min="0" max="100" value={extraWorkPercent} onChange={e => setExtraWorkPercent(Math.min(100, Math.max(0, Number(e.target.value))))} className="w-16 px-2 py-1 bg-[#1a1a1a] text-xs rounded-sm" style={{ color: "#ff9800", border: "1px solid rgba(255, 152, 0, 0.5)" }} />
                  </div>
                  {extraWorkPercent > 0 && <p className="text-xs" style={{ color: "#ff9800", fontFamily: "'Open Sans', sans-serif" }}>Supplemento: +€{Math.round(totalMin * (extraWorkPercent / 100))}</p>}
                </div>
              </div>
            </div>
            
            {(discountPercent > 0 || extraWorkPercent > 0) && (
              <div className="p-4 rounded-sm" style={{ background: "linear-gradient(135deg, rgba(201,162,39,0.3), rgba(201,162,39,0.1))", border: "2px solid rgba(201,162,39,0.5)" }}>
                <p className="text-xs font-bold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>Preventivo Finale: €{Math.round(totalMin * (1 - discountPercent / 100) * (1 + extraWorkPercent / 100))} - €{Math.round(totalMax * (1 - discountPercent / 100) * (1 + extraWorkPercent / 100))}</p>
              </div>
            )}
                 <div className="flex flex-col gap-2">



              <button
                onClick={handleWhatsApp}
                className="w-full py-3.5 flex items-center justify-center gap-2 rounded-sm font-bold text-sm tracking-widest uppercase"
                style={{ background: "#25D366", color: "#fff", fontFamily: "'Raleway', sans-serif" }}
              >
                <MessageCircle size={18} />
                 Richiedi Preventivo su WhatsApp
              </button>
              <button
                onClick={async () => {
                  if (!totalMin || !totalMax) {
                    toast.error("Inserisci i m² per salvare il preventivo", {
                      style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
                    });
                    return;
                  }
                  const clientData = await askClientData();
                  if (!clientData) {
                    toast.error("Operazione annullata", {
                      style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
                    });
                    return;
                  }
                  const subtotal = totalMin;
                  const others = 0;
                  const Totale = subtotal + others;
                  addPreventive(
                    clientData,
                    "Stucchi",
                    `${mq} m² - €${price?.min}-€${price?.max}/m²`,
                    subtotal,
                    others,
                    Totale,
                    totalMin,
                    totalMax
                  );
                  toast.custom((t) => (
                    <div style={{
                      background: "#4caf50",
                      color: "#000",
                      padding: "16px 24px",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      fontSize: "16px",
                      fontFamily: "'Raleway', sans-serif",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      boxShadow: "0 4px 12px rgba(76, 175, 80, 0.4)",
                      border: "2px solid #45a049",
                      animation: "slideDown 0.3s ease-out",
                      position: "fixed",
                      top: "20px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      zIndex: 9999,
                    }}>
                      <span style={{ fontSize: "20px" }}>✅</span>
                      <span>Preventivo salvato in Miei!</span>
                    </div>
                  ), { duration: 10000 });
                }}
                className="w-full py-3.5 flex items-center justify-center gap-2 rounded-sm font-bold text-sm tracking-widest uppercase"
                style={{ background: "rgba(201,162,39,0.2)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.4)", fontFamily: "'Raleway', sans-serif" }}
              >
                <Bookmark size={18} />
                Salva in Miei
              </button>
            </div>
          </div>
        )}
        {!totalMin && (
          <div className="p-4 rounded-sm text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,162,39,0.1)" }}>
            <Calculator size={32} style={{ color: "#333", margin: "0 auto 8px" }} />
            <p className="text-xs" style={{ color: "#555", fontFamily: "'Open Sans', sans-serif" }}>
              Inserisci i m² per vedere la stima di prezzo
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
// ── Schermata: Calculator Vernice
function CalculatorVerniceScreen({ onBack, t }: {
  onBack: () => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const { currentColorTheme } = useTheme();
  const [lunghezza, setLunghezza] = useState("");
  const [altezza, setAltezza] = useState("");
  const [mq, setMq] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [hexInput, setHexInput] = useState("");
  const [discountPercent, setScontoPercent] = useState(0);
  const [extraWorkPercent, setExtraWorkPercent] = useState(0);
  const [wallPhoto, setWallPhoto] = useState<string | null>(null);
  const [previewCanvas, setPreviewCanvas] = useState<string | null>(null);
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showCropEditor, setShowCropEditor] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showBackupManager, setShowBackupManager] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const COEFFICIENT = 2.7;

  // Caricamento preferenze da localStorage al montaggio
  useEffect(() => {
    const saved = localStorage.getItem('calculatorVernicePreferences');
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        if (prefs.lunghezza) setLunghezza(prefs.lunghezza);
        if (prefs.altezza) setAltezza(prefs.altezza);
        if (prefs.mq) setMq(prefs.mq);
        if (prefs.selectedColor) setSelectedColor(prefs.selectedColor);
        if (prefs.hexInput) setHexInput(prefs.hexInput);
      } catch (e) {
        console.error('Errore nel caricamento delle preferenze Vernice:', e);
      }
    }
  }, []);

  // Salvataggio preferenze in localStorage ad ogni cambio
  useEffect(() => {
    const prefs = {
      lunghezza,
      altezza,
      mq,
      selectedColor,
      hexInput,
    };
    localStorage.setItem('calculatorVernicePreferences', JSON.stringify(prefs));
  }, [lunghezza, altezza, mq, selectedColor, hexInput]);

  // Genera preview con colore applicato
  const generateColorPreview = useCallback((photoUrl: string, color: string) => {
    try {
      const img = document.createElement('img');
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = (img as HTMLImageElement).width;
          canvas.height = (img as HTMLImageElement).height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          
          // Disegna immagine originale
          ctx.drawImage(img as HTMLImageElement, 0, 0);
          
          // Applica colore con blend mode multiply
          ctx.globalCompositeOperation = 'multiply';
          ctx.fillStyle = color;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Converte a data URL
          const previewUrl = canvas.toDataURL('image/jpeg', 0.9);
          setPreviewCanvas(previewUrl);
        } catch (err) {
          console.error('Errore nel generare preview:', err);
        }
      };
      img.onerror = () => {
        console.error('Errore nel caricare immagine');
      };
      img.src = photoUrl;
    } catch (err) {
      console.error('Errore in generateColorPreview:', err);
    }
  }, []);

  // Gestisce caricamento Foto
  const handlePhotoCapture = useCallback((file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const photoUrl = e.target?.result as string;
          setWallPhoto(photoUrl);
          setShowCropEditor(true); // Deschide crop editor
        } catch (err) {
          console.error('Errore nel processare Foto:', err);
          toast.error('Errore nel caricamento Foto', {
            style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
          });
        }
      };
      reader.onerror = () => {
        console.error('Errore FileReader');
        toast.error('Errore nel leggere file', {
          style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
        });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Errore in handlePhotoCapture:', err);
    }
  }, [selectedColor, generateColorPreview, toast]);

  // Rigenera preview quando cambia colore
  useEffect(() => {
    if (wallPhoto && selectedColor && !previewCanvas) {
      generateColorPreview(wallPhoto, selectedColor);
    }
  }, [selectedColor, wallPhoto]);

  // Salva Foto con colore applicato
  const handleSavePhoto = useCallback(() => {
    if (!previewCanvas) {
      toast.error("Nessuna anteprima disponibile", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
      return;
    }
    try {
      const link = document.createElement('a');
      link.href = previewCanvas;
      link.download = `Vernice-preview-${new Date().getTime()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Foto salvata nel telefono!", {
        style: { background: "#1a0a0a", color: "#4caf50", border: "1px solid rgba(76,175,80,0.3)" },
      });
    } catch (error) {
      console.error('Errore nel salvataggio Foto:', error);
      toast.error("Errore nel salvataggio", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
    }
  }, [previewCanvas]);

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("").toUpperCase();
  };

  const hslToRgb = (h: number, s: number, l: number) => {
    const c = (1 - Math.abs(2 * l / 100 - 1)) * (s / 100);
    const hp = h / 60;
    const x = c * (1 - Math.abs((hp % 2) - 1));
    let r = 0, g = 0, b = 0;
    if (hp >= 0 && hp < 1) { r = c; g = x; b = 0; }
    else if (hp >= 1 && hp < 2) { r = x; g = c; b = 0; }
    else if (hp >= 2 && hp < 3) { r = 0; g = c; b = x; }
    else if (hp >= 3 && hp < 4) { r = 0; g = x; b = c; }
    else if (hp >= 4 && hp < 5) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    const m = l / 100 - c / 2;
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  };

  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  const VERNICE_IMAGES = [
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/5WjbvFPD2wjC_e4a0a6aa.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/8WnrzSbgVLfl_7d492611.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/ULwliGo9w3Dg_344edeff.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/zokRXgi6ILBO_a6b32a93.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/img_1_e9b1b085.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/img_2_c24d0cc7.jpg",
  ];

  // Calcolo: Opzione A (Lunghezza × Altezza) sau Opzione B (m² direttamente)
  const mqFromLunghezzaAltezza = lunghezza && altezza ? parseFloat(lunghezza) * parseFloat(altezza) : 0;
  const mqFinale = mq ? parseFloat(mq) : mqFromLunghezzaAltezza;
  const mqPeretiCalcolati = mqFinale; // Muri: m² direttamente
  const mqTotalee = mqPeretiCalcolati; // Solo i muri

  const priceMin = 8;
  const priceMax = 10;
  const baseMin = mqTotalee > 0 ? mqTotalee * priceMin : 0;
  const baseMax = mqTotalee > 0 ? mqTotalee * priceMax : 0;
  const totalMin = baseMin > 0 ? Math.round(baseMin) : null;
  const totalMax = baseMax > 0 ? Math.round(baseMax) : null;

  const handleWhatsApp = () => {
    if (!totalMin || !totalMax) {
      toast.error("Inserisci i m² per calcolare il preventivo", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
      return;
    }
    const msg = `Ciao Decor Carpi! Vorrei un preventivo per Vernice:\n\n• Muri: ${mqPeretiCalcolati.toFixed(1)} m²\n• Stima: €${totalMin} - €${totalMax}\n\nPotete confermarmi il prezzo e i tempi?? Grazie!`;
    window.open(`https://wa.me/393343600932?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  const handleSaveQuote = async () => {
    if (!totalMin || !totalMax) {
      toast.error("Inserisci i m² per salvare il preventivo", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
      return;
    }

    // Chiedi dati cliente
    const clientData = await askClientData();
    if (!clientData) {
      toast.error("Operazione annullata", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
      return;
    }
    
    // Calcola totali
    const subtotal = totalMin;
    const others = 0;
    const Totale = subtotal + others;

    // Salva Preventiva
    addPreventive(
      clientData,
      "Vernice",
      `${mqTotalee} m² - €8-€10/m²`,
      subtotal,
      others,
      Totale,
      totalMin,
      totalMax
    );

    toast.custom((t) => (
      <div
        style={{
          background: "#4caf50",
          color: "#000",
          padding: "16px 24px",
          borderRadius: "8px",
          fontWeight: "bold",
          fontSize: "16px",
          fontFamily: "'Raleway', sans-serif",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          boxShadow: "0 4px 12px rgba(76, 175, 80, 0.4)",
          border: "2px solid #45a049",
          animation: "slideDown 0.3s ease-out",
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
        }}
      >
        <span style={{ fontSize: "20px" }}>✅</span>
        <span>Preventivo salvato in Miei!</span>
      </div>
    ), { duration: 10000 });
  };



  return (
    <div className="flex flex-col min-h-screen" style={{ background: currentColorTheme.colors.bg }}>
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: "rgba(201,162,39,0.2)" }}>
        <button onClick={onBack} className="text-[#c9a227]"><ArrowLeft size={22} /></button>
        <h1 className="text-base font-bold tracking-wide" style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}>
          Preventivo Vernice
        </h1>
      </div>
      <div className="flex-1 px-5 py-6 pb-28 flex flex-col gap-5">
        <div className="text-center">
          <p className="text-xs" style={{ color: "#888", fontFamily: "'Open Sans', sans-serif" }}>
            Calcola il preventivo per la Vernice
          </p>
        </div>
        <GoldDivider />
        {/* Seleziona colore */}
        {wallPhoto && (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
              🎨 Seleziona Colore
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="color"
                value={selectedColor || "#c9a227"}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-16 h-10 rounded-sm cursor-pointer"
                style={{ border: "2px solid rgba(201,162,39,0.5)" }}
              />
              <input
                type="text"
                value={hexInput}
                onChange={(e) => {
                  setHexInput(e.target.value);
                  if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                    setSelectedColor(e.target.value);
                  }
                }}
                placeholder="#RRGGBB"
                className="flex-1 px-2 py-2 rounded-sm text-xs"
                style={{ background: "rgba(201,162,39,0.1)", color: "#e8e8e8", border: "1px solid rgba(201,162,39,0.3)" }}
              />
            </div>
            {/* RAL Colors Grid */}
            <div className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
              Colori RAL
            </div>
            <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
              {RAL_COLORS.map((color: any) => (
                <button
                  key={color.ral}
                  onClick={() => {
                    setSelectedColor(color.hex);
                    setHexInput(color.hex);
                  }}
                  className="w-full aspect-square rounded-sm transition hover:scale-110 hover:shadow-lg"
                  style={{
                    background: color.hex,
                    border: selectedColor === color.hex ? "3px solid #fff" : "1px solid rgba(0,0,0,0.3)",
                  }}
                  title={`${color.ral} - ${color.name || ''}`}
                />
              ))}
            </div>
          </div>
        )}
        <GoldDivider />
        {/* Anteprima con colore applicato */}
        {previewCanvas && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
              👁️ Anteprima Colore
            </label>
            <div className="rounded-sm overflow-hidden" style={{ border: "1px solid rgba(201,162,39,0.3)" }}>
              <img src={previewCanvas} alt="Anteprima Parete con Vernice decorativa applicata - Decor Carpi" className="w-full h-auto object-cover" />
            </div>
            <button
              onClick={handleSavePhoto}
              className="w-full py-2 rounded-sm font-semibold flex items-center justify-center gap-2 transition text-sm"
              style={{ background: "#4caf50", color: "#fff" }}
            >
              <Download size={16} /> Salva Foto
            </button>
          </div>
        )}
        <GoldDivider />
        {/* Galleria Foto Vernice */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
            {t.verniceExamples}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {VERNICE_IMAGES.map((img, i) => (
              <div key={i} className="rounded-sm overflow-hidden" style={{ border: "1px solid rgba(201,162,39,0.2)" }}>
                <img src={img} alt={`Vernice esempio ${i + 1}`} className="w-full h-20 object-cover" />
              </div>
            ))}
          </div>
        </div>
        <GoldDivider />
        {/* Spectru de Colori - Compact Layout */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
            {t.verniceChooseColor}
          </label>
          {/* Layout: Colori sus, Spectru jos (vertical) */}
          <div className="flex flex-col gap-3">
            {/* Colori: 20 Colori + 10 nuante gri */}
            <div className="w-full">
              {/* Palet 20 Colori + 10 nuante gri */}
              <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto pr-2">
                {/* 20 Colori */}
                {PAINT_COLORS.map((color, i) => (
                  <button
                    key={`color-${i}`}
                    onClick={() => setSelectedColor(color.hex)}
                    className="flex flex-col items-center gap-1 p-2 rounded-sm transition-all"
                    style={{
                      background: selectedColor === color.hex ? "rgba(201,162,39,0.2)" : "transparent",
                      border: selectedColor === color.hex ? "2px solid #c9a227" : "1px solid rgba(201,162,39,0.2)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-sm"
                      style={{ background: color.hex, border: "1px solid rgba(0,0,0,0.2)" }}
                    />
                    <span className="text-[7px] text-center leading-tight" style={{ color: "#aaa", fontFamily: "'Open Sans', sans-serif" }}>
                      {color.name.split(" ")[0]}
                    </span>
                  </button>
                ))}
                {/* 10 nuante gri */}
                {["#FFFFFF", "#F2F2F2", "#E6E6E6", "#D9D9D9", "#CCCCCC", "#BFBFBF", "#B3B3B3", "#A6A6A6", "#999999", "#8C8C8C"].map((color, i) => (
                  <button
                    key={`gray-${i}`}
                    onClick={() => setSelectedColor(color)}
                    className="flex flex-col items-center gap-1 p-1.5 rounded-sm transition-all"
                    style={{
                      background: selectedColor === color ? "rgba(201,162,39,0.2)" : "transparent",
                      border: selectedColor === color ? "2px solid #c9a227" : "1px solid rgba(201,162,39,0.2)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-sm"
                      style={{ background: color, border: "1px solid rgba(0,0,0,0.2)" }}
                    />
                    <span className="text-[7px] text-center leading-tight" style={{ color: "#aaa", fontFamily: "'Open Sans', sans-serif" }}>
                      {i === 0 ? t.verniceWhite : `${t.verniceGray} ${i * 10}%`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            {/* Spectru RGB - 3 slidere pentru control precis */}
            <div className="w-full flex flex-col gap-3">
              <label className="text-[10px] font-bold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>{t.verniceRgbControl}</label>
              {/* Red Slider */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold" style={{ color: "#ff6b6b", width: "20px" }}>R</span>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={parseInt(selectedColor?.substring(1, 3) || "0", 16)}
                  onChange={(e) => {
                    const r = parseInt(e.target.value);
                    const g = parseInt(selectedColor?.substring(3, 5) || "00", 16);
                    const b = parseInt(selectedColor?.substring(5, 7) || "00", 16);
                    const hex = rgbToHex(r, g, b);
                    setSelectedColor(hex);
                  }}
                  className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(0,${parseInt(selectedColor?.substring(3, 5) || "0", 16)},${parseInt(selectedColor?.substring(5, 7) || "0", 16)}), rgb(255,${parseInt(selectedColor?.substring(3, 5) || "0", 16)},${parseInt(selectedColor?.substring(5, 7) || "0", 16)}))`,
                  }}
                />
                <span className="text-[10px] font-bold" style={{ color: "#aaa", width: "30px", textAlign: "right" }}>{parseInt(selectedColor?.substring(1, 3) || "0", 16)}</span>
              </div>
              {/* Green Slider */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold" style={{ color: "#51cf66", width: "20px" }}>G</span>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={parseInt(selectedColor?.substring(3, 5) || "0", 16)}
                  onChange={(e) => {
                    const r = parseInt(selectedColor?.substring(1, 3) || "00", 16);
                    const g = parseInt(e.target.value);
                    const b = parseInt(selectedColor?.substring(5, 7) || "00", 16);
                    const hex = rgbToHex(r, g, b);
                    setSelectedColor(hex);
                  }}
                  className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(${parseInt(selectedColor?.substring(1, 3) || "0", 16)},0,${parseInt(selectedColor?.substring(5, 7) || "0", 16)}), rgb(${parseInt(selectedColor?.substring(1, 3) || "0", 16)},255,${parseInt(selectedColor?.substring(5, 7) || "0", 16)}))`,
                  }}
                />
                <span className="text-[10px] font-bold" style={{ color: "#aaa", width: "30px", textAlign: "right" }}>{parseInt(selectedColor?.substring(3, 5) || "0", 16)}</span>
              </div>
              {/* Blue Slider */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold" style={{ color: "#4dabf7", width: "20px" }}>B</span>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={parseInt(selectedColor?.substring(5, 7) || "0", 16)}
                  onChange={(e) => {
                    const r = parseInt(selectedColor?.substring(1, 3) || "00", 16);
                    const g = parseInt(selectedColor?.substring(3, 5) || "00", 16);
                    const b = parseInt(e.target.value);
                    const hex = rgbToHex(r, g, b);
                    setSelectedColor(hex);
                  }}
                  className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(${parseInt(selectedColor?.substring(1, 3) || "0", 16)},${parseInt(selectedColor?.substring(3, 5) || "0", 16)},0), rgb(${parseInt(selectedColor?.substring(1, 3) || "0", 16)},${parseInt(selectedColor?.substring(3, 5) || "0", 16)},255))`,
                  }}
                />
                <span className="text-[10px] font-bold" style={{ color: "#aaa", width: "30px", textAlign: "right" }}>{parseInt(selectedColor?.substring(5, 7) || "0", 16)}</span>
              </div>
            </div>
            {/* HEX Input */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold" style={{ color: "#c9a227", width: "40px" }}>HEX</span>
              <input
                type="text"
                placeholder="#000000"
                value={hexInput}
                onChange={(e) => {
                  let val = e.target.value.trim().toUpperCase();
                  if (val && !val.startsWith("#")) {
                    val = "#" + val;
                  }
                  setHexInput(val);
                  if (val.length === 7 && /^#[0-9A-F]{6}$/.test(val)) {
                    setSelectedColor(val);
                  }
                }}
                onBlur={() => {
                  let val = hexInput.trim().toUpperCase();
                  if (val && !val.startsWith("#")) {
                    val = "#" + val;
                  }
                  setHexInput(val);
                  if (val.length === 7 && /^#[0-9A-F]{6}$/.test(val)) {
                    setSelectedColor(val);
                  }
                }}
                maxLength={7}
                autoComplete="off"
                spellCheck="false"
                inputMode="text"
                className="flex-1 px-2 py-1 rounded-sm text-sm font-semibold outline-none"
                style={{ background: "#111", border: "1px solid rgba(201,162,39,0.3)", color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}
              />
            </div>
          </div>
          {/* Anteprima colore selezionato */}
          {selectedColor && (
            <div className="p-3 rounded-sm" style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.35)" }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-sm"
                  style={{ background: selectedColor, border: "1px solid rgba(0,0,0,0.2)" }}
                />
                <div className="text-xs" style={{ color: "#aaa", fontFamily: "'Open Sans', sans-serif" }}>
                  <p style={{ color: "#c9a227" }}>{PAINT_COLORS.find(c => c.hex === selectedColor)?.name || "Colore personalizzato"}</p>
                  <p>{selectedColor}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <GoldDivider />
        {/* Inserisci dimensioni - Lunghezza e Altezza sulla stessa riga */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
            Inserisci dimensioni
          </label>
          {/* Riga 1: Lunghezza e Altezza */}
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1">
              <p className="text-[9px]" style={{ color: "#888", fontFamily: "'Open Sans', sans-serif" }}>Lunghezza (m)</p>
              <input
                type="number"
                min="0.1"
                step="0.1"
                placeholder="5"
                value={lunghezza}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  if (isNaN(val) || val <= 0) {
                    setLunghezza('');
                  } else {
                    setLunghezza(e.target.value);
                  }
                }}
                className="px-2 py-2 rounded-sm text-sm font-semibold outline-none"
                style={{ background: "#111", border: "1px solid rgba(201,162,39,0.3)", color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p className="text-[9px]" style={{ color: "#888", fontFamily: "'Open Sans', sans-serif" }}>Altezza (m)</p>
              <input
                type="number"
                min="0.1"
                step="0.1"
                placeholder="3"
                value={altezza}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  if (isNaN(val) || val <= 0) {
                    setAltezza('');
                  } else {
                    setAltezza(e.target.value);
                  }
                }}
                className="px-2 py-2 rounded-sm text-sm font-semibold outline-none"
                style={{ background: "#111", border: "1px solid rgba(201,162,39,0.3)", color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}
              />
            </div>
          </div>
          {lunghezza && altezza && (
            <div className="p-2 rounded-sm" style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.35)" }}>
              <p className="text-xs font-bold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>📐 {(parseFloat(lunghezza) * parseFloat(altezza)).toFixed(2)} m²</p>
            </div>
          )}
          {/* O separator */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px" style={{ background: "rgba(201,162,39,0.2)" }}></div>
            <p className="text-[9px] font-semibold" style={{ color: "#666", fontFamily: "'Open Sans', sans-serif" }}>O</p>
            <div className="flex-1 h-px" style={{ background: "rgba(201,162,39,0.2)" }}></div>
          </div>
          {/* Riga 2: m² direttamente */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-sm" style={{ background: "#111", border: "1px solid rgba(201,162,39,0.3)" }}>
            <input
              type="number"
              min="1"
              max="9999"
              placeholder="25"
              value={mq}
              onChange={e => {
                const val = parseFloat(e.target.value);
                if (isNaN(val) || val <= 0) {
                  setMq('');
                } else if (val > 9999) {
                  setMq('9999');
                } else {
                  setMq(e.target.value);
                }
              }}
              className="flex-1 bg-transparent text-lg font-bold outline-none"
              style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}
            />
            <span className="text-sm font-bold" style={{ color: "#c9a227" }}>m²</span>
          </div>

        </div>
        <GoldDivider />
        {/* Calcul detaliat */}
        {mqFinale > 0 && (
          <div className="p-4 rounded-sm" style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.35)" }}>
            <div className="space-y-2 text-xs" style={{ fontFamily: "'Open Sans', sans-serif" }}>
              <p><span style={{ color: "#c9a227" }}>📐 Muri:</span> <span style={{ color: "#e8e8e8" }}>{mqPeretiCalcolati.toFixed(1)} m²</span></p>

              <p style={{ borderTop: "1px solid rgba(201,162,39,0.2)", paddingTop: "8px", marginTop: "8px" }}><span style={{ color: "#c9a227" }}>📊 Totalee:</span> <span style={{ color: "#e8e8e8", fontWeight: "bold" }}>{mqTotalee.toFixed(1)} m²</span></p>
            </div>
          </div>
        )}
        {/* Risultato stima */}
        {totalMin !== null && totalMax !== null && (
          <div className="p-5 rounded-sm flex flex-col gap-3" style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.35)" }}>
            <p className="text-xs font-bold tracking-wide text-center" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
              STIMA PREVENTIVO
            </p>
            <div className="text-center">
              <span className="text-3xl font-bold" style={{ color: "#e8e8e8", fontFamily: "'Playfair Display', serif" }}>
                €{totalMin} – €{totalMax}
              </span>
            </div>
            <p className="text-[11px] text-center" style={{ color: "#888", fontFamily: "'Open Sans', sans-serif" }}>
              Vernice • {mqTotalee.toFixed(1)} m² • €{priceMin}–{priceMax}/m²
            </p>
            <p className="text-[10px] text-center" style={{ color: "#4caf50", fontFamily: "'Open Sans', sans-serif" }}>
              ✓ Materiale e IVA incluse
            </p>
            <p className="text-[10px] text-center italic" style={{ color: "#666", fontFamily: "'Open Sans', sans-serif" }}>
              * Stima indicativa. Il prezzo definitivo dipende da preparazione, zona e complessità.
            </p>
            <div className="mt-3 p-3 rounded-sm" style={{ background: "rgba(255,193,7,0.1)", border: "1px solid rgba(255,193,7,0.3)" }}>
              <p className="text-[10px] text-center" style={{ color: "#ffc107", fontFamily: "'Open Sans', sans-serif" }}>
                ⚠️ <strong>Nota importante:</strong> Se i muri sono umidi, macchiati o necessitano di preparazione speciale (stuccatura, pulizia profonda), il prezzo finale potrebbe aumentare. Vi contatteremo dopo un'ispezione in situ per una quotazione precisa.
              </p>
            </div>
            
            {/* Riduzioni */}
            <div className="p-4 rounded-sm" style={{ background: "rgba(76, 175, 80, 0.1)", border: "1px solid rgba(76, 175, 80, 0.3)" }}>
              <div className="flex flex-col gap-3">
                <p className="text-sm font-bold" style={{ color: "#4caf50", fontFamily: "'Raleway', sans-serif" }}>💰 Riduzioni/Sconto</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: "#4caf50", fontFamily: "'Raleway', sans-serif" }}>-% </span>
                    <input type="number" min="0" max="100" value={discountPercent} onChange={e => setScontoPercent(Math.min(100, Math.max(0, Number(e.target.value))))} className="w-16 px-2 py-1 bg-[#1a1a1a] text-xs rounded-sm" style={{ color: "#4caf50", border: "1px solid rgba(76, 175, 80, 0.5)" }} />
                  </div>
                  {discountPercent > 0 && <p className="text-xs" style={{ color: "#4caf50", fontFamily: "'Open Sans', sans-serif" }}>Riduzione: -€{Math.round(totalMin * (discountPercent / 100))}</p>}
                </div>
              </div>
            </div>
            
            {/* Lavori Supplementari */}
            <div className="p-4 rounded-sm" style={{ background: "rgba(255, 152, 0, 0.1)", border: "1px solid rgba(255, 152, 0, 0.3)" }}>
              <div className="flex flex-col gap-3">
                <p className="text-sm font-bold" style={{ color: "#ff9800", fontFamily: "'Raleway', sans-serif" }}>🔧 Lavori Supplementari</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: "#ff9800", fontFamily: "'Raleway', sans-serif" }}>+% </span>
                    <input type="number" min="0" max="100" value={extraWorkPercent} onChange={e => setExtraWorkPercent(Math.min(100, Math.max(0, Number(e.target.value))))} className="w-16 px-2 py-1 bg-[#1a1a1a] text-xs rounded-sm" style={{ color: "#ff9800", border: "1px solid rgba(255, 152, 0, 0.5)" }} />
                  </div>
                  {extraWorkPercent > 0 && <p className="text-xs" style={{ color: "#ff9800", fontFamily: "'Open Sans', sans-serif" }}>Supplemento: +€{Math.round(totalMin * (extraWorkPercent / 100))}</p>}
                </div>
              </div>
            </div>
            
            {(discountPercent > 0 || extraWorkPercent > 0) && (
              <div className="p-4 rounded-sm" style={{ background: "linear-gradient(135deg, rgba(201,162,39,0.3), rgba(201,162,39,0.1))", border: "2px solid rgba(201,162,39,0.5)" }}>
                <p className="text-xs font-bold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>Preventivo Finale: €{Math.round(totalMin * (1 - discountPercent / 100) * (1 + extraWorkPercent / 100))} - €{Math.round(totalMax * (1 - discountPercent / 100) * (1 + extraWorkPercent / 100))}</p>
              </div>
            )}            <div className="flex flex-col gap-2">

              <button
                onClick={handleWhatsApp}
                className="w-full py-3.5 flex items-center justify-center gap-2 rounded-sm font-bold text-sm tracking-widest uppercase"
                style={{ background: "#25D366", color: "#fff", fontFamily: "'Raleway', sans-serif" }}
              >
                <MessageCircle size={18} />
                Richiedi Preventivo su WhatsApp
              </button>
              <button
                onClick={() => handleSaveQuote()}
                className="w-full py-3.5 flex items-center justify-center gap-2 rounded-sm font-bold text-sm tracking-widest uppercase"
                style={{ background: "rgba(201,162,39,0.2)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.4)", fontFamily: "'Raleway', sans-serif" }}
              >
                <Bookmark size={18} />
                Salva in Miei
              </button>
            </div>
          </div>
        )}
        {!totalMin && (
          <div className="p-4 rounded-sm text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,162,39,0.1)" }}>
            <Calculator size={32} style={{ color: "#333", margin: "0 auto 8px" }} />
            <p className="text-xs" style={{ color: "#555", fontFamily: "'Open Sans', sans-serif" }}>
              Inserisci i m² per vedere la stima di prezzo
            </p>
          </div>
        )}
      </div>
      {/* Advanced Paint Editor Modal - Removed */}
    </div>
  );
}


// ── Schermata: Calculator Antimuffa
function CalculatorAntimuffaScreen({ onBack, t }: {
  onBack: () => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const { currentColorTheme } = useTheme();
  const [lunghezza, setLunghezza] = useState("");
  const [altezza, setAltezza] = useState("");
  const [ferestre, setFerestre] = useState("0");
  const [porte, setPorte] = useState("0");
  const [mq, setMq] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [discountPercent, setScontoPercent] = useState(0);
  const [extraWorkPercent, setExtraWorkPercent] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [wallPhoto, setWallPhoto] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoCapture = useCallback((file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const photoUrl = e.target?.result as string;
          setWallPhoto(photoUrl);
        } catch (err) {
          console.error('Errore nel processare Foto:', err);
          toast.error('Errore nel caricamento Foto', {
            style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
          });
        }
      };
      reader.onerror = () => {
        console.error('Errore FileReader');
        toast.error('Errore nel leggere file', {
          style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
        });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Errore in handlePhotoCapture:', err);
    }
  }, []);

  // Caricamento preferenze da localStorage al montaggio
  useEffect(() => {
    const saved = localStorage.getItem('calculatorAntimuffaPreferences');
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        if (prefs.lunghezza) setLunghezza(prefs.lunghezza);
        if (prefs.altezza) setAltezza(prefs.altezza);
        if (prefs.mq) setMq(prefs.mq);
      } catch (e) {
        console.error('Errore nel caricamento delle preferenze Antimuffa:', e);
      }
    }
  }, []);

  // Salvataggio preferenze in localStorage ad ogni cambio
  useEffect(() => {
    const prefs = {
      lunghezza,
      altezza,
      mq,
    };
    localStorage.setItem('calculatorAntimuffaPreferences', JSON.stringify(prefs));
  }, [lunghezza, altezza, mq]);

  const lunghezzaNum = parseFloat(lunghezza) || 0;
  const altezzaNum = parseFloat(altezza) || 0;
  const ferestreNum = parseInt(ferestre) || 0;
  const porteNum = parseInt(porte) || 0;

  const mqCalcolato = lunghezzaNum > 0 && altezzaNum > 0
    ? (lunghezzaNum * altezzaNum) - (ferestreNum * 1.5) - (porteNum * 2)
    : 0;

  const mqFinale = mq ? parseFloat(mq) : mqCalcolato;
  const mqLucro = Math.max(mqFinale, 0);

  const ANTIMUFFA_PRICES = { min: 22, max: 35 };
  const baseMin = mqLucro > 0 ? mqLucro * ANTIMUFFA_PRICES.min : 0;
  const baseMax = mqLucro > 0 ? mqLucro * ANTIMUFFA_PRICES.max : 0;
  const mobileFactor = isMobile ? 1.15 : 1;
  const totalMin = baseMin > 0 ? Math.round(baseMin * mobileFactor) : null;
  const totalMax = baseMax > 0 ? Math.round(baseMax * mobileFactor) : null;

  const handleWhatsApp = () => {
    if (!totalMin || !totalMax) {
      toast.error("Inserisci le dimensioni o i m² per calcolare il preventivo", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
      return;
    }
    const dettagli = lunghezzaNum > 0 && altezzaNum > 0
      ? `\n• Dimensioni: ${lunghezzaNum}m x ${altezzaNum}m\n• Ferestre: ${ferestreNum}\n• Porte: ${porteNum}\n• Superficie netta: ${mqFinale.toFixed(1)} m²`
      : `\n• Superficie: ${mq} m²`;
    const msg = `Ciao Decor Carpi! Vorrei un preventivo per Antimuffa:\n${dettagli}${isMobile ? "\n• Intervento completo" : ""}\n• Stima: €${totalMin} - €${totalMax}\n\nPotete confermarmi il prezzo e i tempi?? Grazie!`;
    window.open(`https://wa.me/393343600932?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };



  return (
    <div className="flex flex-col min-h-screen" style={{ background: currentColorTheme.colors.bg }}>
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: "rgba(201,162,39,0.2)" }}>
        <button onClick={onBack} className="text-[#c9a227]"><ArrowLeft size={22} /></button>
        <h1 className="text-base font-bold tracking-wide" style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}>
          Preventivo Antimuffa
        </h1>
      </div>
      <div className="flex-1 px-5 py-6 pb-28 flex flex-col gap-5">
        <div className="text-center">
          <p className="text-xs" style={{ color: "#888", fontFamily: "'Open Sans', sans-serif" }}>
            Calcola il preventivo per il trattamento Antimuffa
          </p>
        </div>
        <GoldDivider />
        {/* Galerie poze Antimuffa */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
            Exemple de tratamente Antimuffa
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/hero-banner-v2-NwecKWHDwJvSatLmHpEj4e.webp",
              "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/perlato-real_3ac71f2a.jpg",
              "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/effetto-cimento-real_a6e8f9b1.jpg",
            ].map((img, i) => (
              <div key={i} className="rounded-sm overflow-hidden" style={{ border: "1px solid rgba(201,162,39,0.2)" }}>
                <img src={img} alt={`Antimuffa ${i + 1}`} className="w-full h-20 object-cover" />
              </div>
            ))}
          </div>
        </div>
        <GoldDivider />
        {/* Opzione A: Calcolo da dimensioni */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>1. Opzione A: Inserisci dimensioni</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-sm" style={{ background: "#111", border: "1px solid rgba(201,162,39,0.3)" }}>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="Lunghezza"
                value={lunghezza}
                onChange={e => setLunghezza(e.target.value)}
                className="flex-1 bg-transparent text-sm font-semibold outline-none"
                style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}
              />
              <span className="text-xs" style={{ color: "#888" }}>m</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-sm" style={{ background: "#111", border: "1px solid rgba(201,162,39,0.3)" }}>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="Altezza"
                value={altezza}
                onChange={e => setAltezza(e.target.value)}
                className="flex-1 bg-transparent text-sm font-semibold outline-none"
                style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}
              />
              <span className="text-xs" style={{ color: "#888" }}>m</span>
            </div>
          </div>
        </div>
        <GoldDivider />
        {/* Opzione B: Input diretto m² */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>2. Inserisci m² Appartamento</p>
          <div className="flex items-center gap-3 px-4 py-3 rounded-sm" style={{ background: "#111", border: "1px solid rgba(201,162,39,0.3)" }}>
            <input
              type="number"
              min="1"
              max="9999"
              placeholder="Es. 50"
              value={mq}
              onChange={e => setMq(e.target.value)}
              className="flex-1 bg-transparent text-lg font-bold outline-none"
              style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}
            />
            <span className="text-sm font-bold" style={{ color: "#c9a227" }}>m²</span>
          </div>
        </div>
        <GoldDivider />

        {/* Risultato stima */}
        {totalMin !== null && totalMax !== null && (
          <div className="p-5 rounded-sm flex flex-col gap-3" style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.35)" }}>
            <p className="text-xs font-bold tracking-wide text-center" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
              STIMA PREVENTIVO
            </p>
            <div className="text-center">
              <span className="text-3xl font-bold" style={{ color: "#e8e8e8", fontFamily: "'Playfair Display', serif" }}>
                €{totalMin} – €{totalMax}
              </span>
            </div>
            <p className="text-[11px] text-center" style={{ color: "#888", fontFamily: "'Open Sans', sans-serif" }}>
              Antimuffa • {mqLucro.toFixed(1)} m² • €{ANTIMUFFA_PRICES.min}–{ANTIMUFFA_PRICES.max}/m²
            </p>
            <p className="text-[10px] text-center" style={{ color: "#4caf50", fontFamily: "'Open Sans', sans-serif" }}>
              ✓ Materiale e IVA incluse
            </p>
            <p className="text-[10px] text-center italic" style={{ color: "#666", fontFamily: "'Open Sans', sans-serif" }}>
              * Stima indicativa. Il prezzo definitivo dipende da preparazione, zona e complessità.
            </p>
            <div className="mt-2 pt-3 border-t" style={{ borderColor: "rgba(201,162,39,0.2)" }}>
              <p className="text-[9px] text-center" style={{ color: "#888", fontFamily: "'Open Sans', sans-serif" }}>
                ⚠️ <strong>Nota importante:</strong> Se i muri sono incrinati, deteriorati o necessitano di trattamenti speciali, il prezzo finale potrebbe aumentare. Vi contatteremo dopo un'ispezione in situ per una quotazione precisa.
              </p>
            </div>
            
            {/* Riduzioni */}
            <div className="p-4 rounded-sm" style={{ background: "rgba(76, 175, 80, 0.1)", border: "1px solid rgba(76, 175, 80, 0.3)" }}>
              <div className="flex flex-col gap-3">
                <p className="text-sm font-bold" style={{ color: "#4caf50", fontFamily: "'Raleway', sans-serif" }}>💰 Riduzioni/Sconto</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: "#4caf50", fontFamily: "'Raleway', sans-serif" }}>-% </span>
                    <input type="number" min="0" max="100" value={discountPercent} onChange={e => setScontoPercent(Math.min(100, Math.max(0, Number(e.target.value))))} className="w-16 px-2 py-1 bg-[#1a1a1a] text-xs rounded-sm" style={{ color: "#4caf50", border: "1px solid rgba(76, 175, 80, 0.5)" }} />
                  </div>
                  {discountPercent > 0 && <p className="text-xs" style={{ color: "#4caf50", fontFamily: "'Open Sans', sans-serif" }}>Riduzione: -€{Math.round(totalMin * (discountPercent / 100))}</p>}
                </div>
              </div>
            </div>
            
            {/* Lavori Supplementari */}
            <div className="p-4 rounded-sm" style={{ background: "rgba(255, 152, 0, 0.1)", border: "1px solid rgba(255, 152, 0, 0.3)" }}>
              <div className="flex flex-col gap-3">
                <p className="text-sm font-bold" style={{ color: "#ff9800", fontFamily: "'Raleway', sans-serif" }}>🔧 Lavori Supplementari</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: "#ff9800", fontFamily: "'Raleway', sans-serif" }}>+% </span>
                    <input type="number" min="0" max="100" value={extraWorkPercent} onChange={e => setExtraWorkPercent(Math.min(100, Math.max(0, Number(e.target.value))))} className="w-16 px-2 py-1 bg-[#1a1a1a] text-xs rounded-sm" style={{ color: "#ff9800", border: "1px solid rgba(255, 152, 0, 0.5)" }} />
                  </div>
                  {extraWorkPercent > 0 && <p className="text-xs" style={{ color: "#ff9800", fontFamily: "'Open Sans', sans-serif" }}>Supplemento: +€{Math.round(totalMin * (extraWorkPercent / 100))}</p>}
                </div>
              </div>
            </div>
            
            {(discountPercent > 0 || extraWorkPercent > 0) && (
              <div className="p-4 rounded-sm" style={{ background: "linear-gradient(135deg, rgba(201,162,39,0.3), rgba(201,162,39,0.1))", border: "2px solid rgba(201,162,39,0.5)" }}>
                <p className="text-xs font-bold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>Preventivo Finale: €{Math.round(totalMin * (1 - discountPercent / 100) * (1 + extraWorkPercent / 100))} - €{Math.round(totalMax * (1 - discountPercent / 100) * (1 + extraWorkPercent / 100))}</p>
              </div>
            )}             <div className="flex flex-col gap-2">


              <button
                onClick={handleWhatsApp}
                className="w-full py-3.5 flex items-center justify-center gap-2 rounded-sm font-bold text-sm tracking-widest uppercase"
                style={{ background: "#25D366", color: "#fff", fontFamily: "'Raleway', sans-serif" }}
              >
                <MessageCircle size={18} />
                Richiedi Preventivo su WhatsApp
              </button>
              <button
                onClick={async () => {
                  if (!totalMin || !totalMax) {
                    toast.error("Inserisci i m² per salvare il preventivo", {
                      style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
                    });
                    return;
                  }
                  const clientData = await askClientData();
                  if (!clientData) {
                    toast.error("Operazione annullata", {
                      style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
                    });
                    return;
                  }
                  const subtotal = totalMin;
                  const others = 0;
                  const Totale = subtotal + others;
                  addPreventive(
                    clientData,
                    "Antimuffa",
                    `${mq} m² - €${ANTIMUFFA_PRICES.min}-€${ANTIMUFFA_PRICES.max}/m²`,
                    subtotal,
                    others,
                    Totale,
                    totalMin,
                    totalMax
                  );
                  toast.custom((t) => (
                    <div style={{
                      background: "#4caf50",
                      color: "#000",
                      padding: "16px 24px",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      fontSize: "16px",
                      fontFamily: "'Raleway', sans-serif",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      boxShadow: "0 4px 12px rgba(76, 175, 80, 0.4)",
                      border: "2px solid #45a049",
                      animation: "slideDown 0.3s ease-out",
                      position: "fixed",
                      top: "20px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      zIndex: 9999,
                    }}>
                      <span style={{ fontSize: "20px" }}>✅</span>
                      <span>Preventivo salvato in Miei!</span>
                    </div>
                  ), { duration: 10000 });
                }}
                className="w-full py-3.5 flex items-center justify-center gap-2 rounded-sm font-bold text-sm tracking-widest uppercase"
                style={{ background: "rgba(201,162,39,0.2)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.4)", fontFamily: "'Raleway', sans-serif" }}
              >
                <Bookmark size={18} />
                Salva in Miei
              </button>
            </div>
          </div>
        )}
        {!totalMin && (
          <div className="p-4 rounded-sm text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,162,39,0.1)" }}>
            <Calculator size={32} style={{ color: "#333", margin: "0 auto 8px" }} />
            <p className="text-xs" style={{ color: "#555", fontFamily: "'Open Sans', sans-serif" }}>
              Inserisci i m² per vedere la stima di prezzo
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Schermata: Calcolatore Appartamento (m² casa → muri con coef 2.7) ──────────────
function ApartmentCalculatorScreen({ onBack, t }: {
  onBack: () => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const { currentColorTheme } = useTheme();
  const [mqCasa, setMqCasa] = useState("");
  const [includeTavan, setIncludeTavan] = useState(false);
  const [discountPercent, setScontoPercent] = useState(0);
  const [extraWorkPercent, setExtraWorkPercent] = useState(0);
  const VERNICE_PRICE_MIN = 8;
  const VERNICE_PRICE_MAX = 10;

  // Caricamento preferenze da localStorage al montaggio
  useEffect(() => {
    const saved = localStorage.getItem('calculatorApartmentPreferences');
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        if (prefs.mqCasa) setMqCasa(prefs.mqCasa);
        if (prefs.includeTavan !== undefined) setIncludeTavan(prefs.includeTavan);
      } catch (e) {
        console.error('Errore nel caricamento delle preferenze Apartament:', e);
      }
    }
  }, []);

  // Salvataggio preferenze in localStorage ad ogni cambio
  useEffect(() => {
    const prefs = {
      mqCasa,
      includeTavan,
    };
    localStorage.setItem('calculatorApartmentPreferences', JSON.stringify(prefs));
  }, [mqCasa, includeTavan]);

  const mqCasaNum = parseFloat(mqCasa) || 0;
  
  // Coefficiente dinamico in base alle dimensioni della casa
  let COEFFICIENT = 2.5;
  if (mqCasaNum > 51 && mqCasaNum <= 76) COEFFICIENT = 2.7;
  else if (mqCasaNum > 76 && mqCasaNum <= 101) COEFFICIENT = 2.8;
  else if (mqCasaNum > 101 && mqCasaNum <= 121) COEFFICIENT = 2.9;
  else if (mqCasaNum > 121) COEFFICIENT = 3;
  
  const mqPeretiCalculati = mqCasaNum > 0 ? mqCasaNum * COEFFICIENT : 0;
  const mqTavanCalculat = includeTavan ? mqCasaNum : 0;
  const mqTotale = mqPeretiCalculati + mqTavanCalculat;
  const verniceMin = mqTotale > 0 ? Math.round(mqTotale * VERNICE_PRICE_MIN) : 0;
  const verniceMax = mqTotale > 0 ? Math.round(mqTotale * VERNICE_PRICE_MAX) : 0;
  
  // Calcul cu reduceri si lucrari suplimentare
  const verniceMinWithAdjustments = Math.round(verniceMin * (1 - discountPercent / 100) * (1 + extraWorkPercent / 100));
  const verniceMaxWithAdjustments = Math.round(verniceMax * (1 - discountPercent / 100) * (1 + extraWorkPercent / 100));
  const discountAmount = Math.round(verniceMin * (discountPercent / 100));
  const extraWorkAmount = Math.round(verniceMin * (extraWorkPercent / 100));

  return (
    <div className="flex flex-col min-h-screen" style={{ background: currentColorTheme.colors.bg }}>
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: "rgba(201,162,39,0.2)" }}>
        <button onClick={onBack} className="text-[#c9a227]"><ArrowLeft size={22} /></button>
        <h1 className="text-base font-bold tracking-wide" style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}>
          Calcola m² Muri
        </h1>
      </div>
      <div className="flex-1 px-5 py-6 pb-28 flex flex-col gap-5">
        <div className="text-center">
          <p className="text-xs" style={{ color: "#888", fontFamily: "'Open Sans', sans-serif" }}>
            Calcola la superficie dei muri dai m² della casa
          </p>
        </div>
        <GoldDivider />
        
        {/* Input m² casa */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
            Superficie della casa (m²)
          </label>
          <div className="flex items-center gap-2 px-3 py-3 rounded-sm" style={{ background: "#111", border: "1px solid rgba(201,162,39,0.3)" }}>
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="Ex: 100"
              value={mqCasa}
              onChange={e => setMqCasa(e.target.value)}
              className="flex-1 bg-transparent text-sm font-semibold outline-none"
              style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}
            />
            <span className="text-xs" style={{ color: "#888" }}>m²</span>
          </div>
        </div>
        <GoldDivider />

        {/* Checkbox Include Tavan */}
        <div className="flex items-center gap-3 p-3 rounded-sm" style={{ background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.2)" }}>
          <input
            type="checkbox"
            id="include-tavan"
            checked={includeTavan}
            onChange={e => setIncludeTavan(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
            style={{ accentColor: "#c9a227" }}
          />
          <label htmlFor="include-tavan" className="flex-1 text-sm cursor-pointer" style={{ color: "#d0d0d0", fontFamily: "'Raleway', sans-serif" }}>
            Includi anche il soffitto ({mqCasaNum.toFixed(1)} m²)
          </label>
        </div>
        <GoldDivider />

        {/* Rezultat calcul */}
        {mqCasaNum > 0 && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-sm" style={{ background: "linear-gradient(135deg, rgba(201,162,39,0.15), rgba(201,162,39,0.05))", border: "1px solid rgba(201,162,39,0.3)" }}>
              <div className="flex flex-col gap-2">
                <p className="text-xs" style={{ color: "#aaa", fontFamily: "'Open Sans', sans-serif" }}>
                  <strong>Calcul detaliat:</strong>
                </p>
                <p className="text-sm" style={{ color: "#d0d0d0", fontFamily: "'Raleway', sans-serif" }}>
                  Muri: {mqCasaNum.toFixed(1)} m² × {COEFFICIENT} = <strong style={{ color: "#c9a227" }}>{mqPeretiCalculati.toFixed(1)} m²</strong>
                </p>
                {includeTavan && (
                  <p className="text-sm" style={{ color: "#d0d0d0", fontFamily: "'Raleway', sans-serif" }}>
                    Tavan: <strong style={{ color: "#c9a227" }}>{mqTavanCalculat.toFixed(1)} m²</strong>
                  </p>
                )}
                <p className="text-sm font-bold mt-2" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
                  Totalee: <strong>{mqTotale.toFixed(1)} m²</strong>
                </p>
                <p className="text-xs mt-2" style={{ color: "#888", fontFamily: "'Open Sans', sans-serif" }}>
                  ℹ️ Coefficiente dinamico: fino 51m² (2.5) | 52-76m² (2.7) | 77-101m² (2.8) | 102-121m² (2.9) | oltre 121m² (3). Tiene conto di numero camere e muri.
                </p>
              </div>
            </div>
            
            {/* Preventivo Vernice */}
            <div className="p-4 rounded-sm" style={{ background: "linear-gradient(135deg, rgba(201,162,39,0.2), rgba(201,162,39,0.08))", border: "2px solid rgba(201,162,39,0.4)" }}>
              <div className="flex flex-col gap-3">
                <p className="text-sm font-bold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
                  💰 Preventivo Vernice
                </p>
                <div className="flex flex-col gap-2">
                  <p className="text-xs" style={{ color: "#d0d0d0", fontFamily: "'Open Sans', sans-serif" }}>
                    Superficie totale: <strong>{mqTotale.toFixed(1)} m²</strong>
                  </p>
                  <p className="text-xs" style={{ color: "#d0d0d0", fontFamily: "'Open Sans', sans-serif" }}>
                    Prezzo/m²: <strong>€{VERNICE_PRICE_MIN} - €{VERNICE_PRICE_MAX}</strong>
                  </p>
                  <p className="text-sm font-bold mt-2" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
                    Estimare: €{verniceMin} - €{verniceMax}
                  </p>
                </div>
                <p className="text-xs mt-2" style={{ color: "#888", fontFamily: "'Open Sans', sans-serif" }}>
                  ⚠️ Prezzo indicativo. Può variare in base allo stato dei muri e ai trattamenti speciali.
                </p>
              </div>
            </div>
            
            {/* Riduzioni */}
            <div className="p-4 rounded-sm" style={{ background: "rgba(76, 175, 80, 0.1)", border: "1px solid rgba(76, 175, 80, 0.3)" }}>
              <div className="flex flex-col gap-3">
                <p className="text-sm font-bold" style={{ color: "#4caf50", fontFamily: "'Raleway', sans-serif" }}>💰 Riduzioni/Sconto</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: "#4caf50", fontFamily: "'Raleway', sans-serif" }}>-% </span>
                    <input type="number" min="0" max="100" value={discountPercent} onChange={e => setScontoPercent(Math.min(100, Math.max(0, Number(e.target.value))))} className="w-16 px-2 py-1 bg-[#1a1a1a] text-xs rounded-sm" style={{ color: "#4caf50", border: "1px solid rgba(76, 175, 80, 0.5)" }} />
                  </div>
                  {discountPercent > 0 && <p className="text-xs" style={{ color: "#4caf50", fontFamily: "'Open Sans', sans-serif" }}>Riduzione: -€{Math.round(verniceMin * (discountPercent / 100))}</p>}
                </div>
              </div>
            </div>
            
            {/* Lavori Supplementari */}
            <div className="p-4 rounded-sm" style={{ background: "rgba(255, 152, 0, 0.1)", border: "1px solid rgba(255, 152, 0, 0.3)" }}>
              <div className="flex flex-col gap-3">
                <p className="text-sm font-bold" style={{ color: "#ff9800", fontFamily: "'Raleway', sans-serif" }}>🔧 Lavori Supplementari</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: "#ff9800", fontFamily: "'Raleway', sans-serif" }}>+% </span>
                    <input type="number" min="0" max="100" value={extraWorkPercent} onChange={e => setExtraWorkPercent(Math.min(100, Math.max(0, Number(e.target.value))))} className="w-16 px-2 py-1 bg-[#1a1a1a] text-xs rounded-sm" style={{ color: "#ff9800", border: "1px solid rgba(255, 152, 0, 0.5)" }} />
                  </div>
                  {extraWorkPercent > 0 && <p className="text-xs" style={{ color: "#ff9800", fontFamily: "'Open Sans', sans-serif" }}>Supplemento: +€{Math.round(verniceMin * (extraWorkPercent / 100))}</p>}
                </div>
              </div>
            </div>
            
            {/* Preventivo Final */}
            {(discountPercent > 0 || extraWorkPercent > 0) && (
              <div className="p-4 rounded-sm" style={{ background: "linear-gradient(135deg, rgba(201,162,39,0.3), rgba(201,162,39,0.1))", border: "2px solid rgba(201,162,39,0.5)" }}>
                <div className="flex flex-col gap-2">
                  <p className="text-xs" style={{ color: "#aaa", fontFamily: "'Open Sans', sans-serif" }}>
                    <strong>Preventivo Finale:</strong>
                  </p>
                  <p className="text-sm font-bold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
                    €{verniceMinWithAdjustments} - €{verniceMaxWithAdjustments}
                  </p>
                </div>
              </div>
            )}
            
            {mqCasaNum > 0 && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={async () => {
                    if (!verniceMin || !verniceMax) {
                      toast.error("Inserisci i m² per salvare il preventivo", {
                        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
                      });
                      return;
                    }
                    const clientData = await askClientData();
                    if (!clientData) {
                      toast.error("Operazione annullata", {
                        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
                      });
                      return;
                    }
                    const subtotal = verniceMinWithAdjustments;
                    const others = 0;
                    const Totale = subtotal + others;
                    addPreventive(
                      clientData,
                      "m² Appartamento",
                      `${mqTotale} m² - €${verniceMinWithAdjustments}-€${verniceMaxWithAdjustments}`,
                      subtotal,
                      others,
                      Totale,
                      verniceMinWithAdjustments,
                      verniceMaxWithAdjustments
                    );
                    toast.custom((t) => (
                      <div style={{
                        background: "#4caf50",
                        color: "#000",
                        padding: "16px 24px",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        fontSize: "16px",
                        fontFamily: "'Raleway', sans-serif",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        boxShadow: "0 4px 12px rgba(76, 175, 80, 0.4)",
                        border: "2px solid #45a049",
                        animation: "slideDown 0.3s ease-out",
                        position: "fixed",
                        top: "20px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 9999,
                      }}>
                        <span style={{ fontSize: "20px" }}>✅</span>
                        <span>Preventivo salvato in Miei!</span>
                      </div>
                    ), { duration: 10000 });
                  }}
                  className="w-full py-3.5 flex items-center justify-center gap-2 rounded-sm font-bold text-sm tracking-widest uppercase"
                  style={{ background: "rgba(201,162,39,0.2)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.4)", fontFamily: "'Raleway', sans-serif" }}
                >
                  <Bookmark size={18} />
                  Salva in Miei
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Schermata: Privacy Policy ───────────────────────────────────────────────
function PrivacyPolicyScreen({ onBack, t }: {
  onBack: () => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const { currentColorTheme } = useTheme();
  return (
    <div className="flex flex-col min-h-screen" style={{ background: currentColorTheme.colors.bg }}>
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: "rgba(201,162,39,0.2)" }}>
        <button onClick={onBack} className="text-[#c9a227]"><ArrowLeft size={22} /></button>
        <h1 className="text-base font-bold tracking-wide" style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}>
          {t.privacyTitle ?? "Privacy Policy"}
        </h1>
      </div>
      <div className="flex-1 px-5 py-6 pb-24 overflow-y-auto" style={{ color: "#d0d0d0", fontFamily: "'Open Sans', sans-serif", fontSize: "13px", lineHeight: "1.7" }}>
        <h2 style={{ color: "#c9a227", fontFamily: "'Playfair Display', serif", fontSize: "18px", marginBottom: "12px" }}>Privacy Policy — DECOR CARPI</h2>
        <p style={{ marginBottom: "8px" }}>Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}</p>
        <GoldDivider />
        <div style={{ marginTop: "16px" }}>
          <h3 style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif", fontSize: "14px", fontWeight: "700", marginBottom: "6px", marginTop: "16px" }}>1. Titolare del Trattamento</h3>
          <p>Il titolare del trattamento dei dati personali è <strong style={{ color: "#e8e8e8" }}>DECOR CARPI</strong>, con sede in 41012 Carpi (MO), Italia. Contatto: <a href="mailto:decorcarpi@gmail.com" style={{ color: "#c9a227" }}>decorcarpi@gmail.com</a></p>

          <h3 style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif", fontSize: "14px", fontWeight: "700", marginBottom: "6px", marginTop: "16px" }}>2. Dati Raccolti</h3>
          <p>Raccogliamo i seguenti dati:</p>
          <ul style={{ paddingLeft: "16px", marginTop: "6px", marginBottom: "6px" }}>
            <li><strong style={{ color: "#e8e8e8" }}>Immagini caricate:</strong> Le Foto che carichi per la visualizzazione AI vengono elaborate temporaneamente e non vengono conservate dopo la sessione.</li>
            <li><strong style={{ color: "#e8e8e8" }}>Dati di navigazione:</strong> Indirizzi IP, tipo di browser, pagine visitate, raccolti automaticamente per finalità tecniche.</li>
            <li><strong style={{ color: "#e8e8e8" }}>Cookie:</strong> Utilizziamo cookie tecnici necessari al funzionamento del sito.</li>
          </ul>

          <h3 style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif", fontSize: "14px", fontWeight: "700", marginBottom: "6px", marginTop: "16px" }}>3. Finalità del Trattamento</h3>
          <p>I dati vengono trattati per:</p>
          <ul style={{ paddingLeft: "16px", marginTop: "6px", marginBottom: "6px" }}>
            <li>Fornire il servizio di visualizzazione AI delle texture decorative</li>
            <li>Migliorare le funzionalità dell'applicazione</li>
            <li>Rispondere alle richieste di preventivo inviate tramite WhatsApp o email</li>
          </ul>

          <h3 style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif", fontSize: "14px", fontWeight: "700", marginBottom: "6px", marginTop: "16px" }}>4. Base Giuridica</h3>
          <p>Il trattamento è basato sul consenso dell'utente (Art. 6, par. 1, lett. a del GDPR) e sull'esecuzione di un contratto o misure precontrattuali (Art. 6, par. 1, lett. b del GDPR).</p>

          <h3 style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif", fontSize: "14px", fontWeight: "700", marginBottom: "6px", marginTop: "16px" }}>5. Conservazione dei Dati</h3>
          <p>Le immagini caricate vengono eliminate automaticamente al termine della sessione. I dati di navigazione vengono conservati per un massimo di 12 mesi.</p>

          <h3 style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif", fontSize: "14px", fontWeight: "700", marginBottom: "6px", marginTop: "16px" }}>6. Diritti dell'Utente</h3>
          <p>Ai sensi del GDPR (Regolamento UE 2016/679), hai il diritto di:</p>
          <ul style={{ paddingLeft: "16px", marginTop: "6px", marginBottom: "6px" }}>
            <li>Accedere ai tuoi dati personali</li>
            <li>Richiedere la rettifica o cancellazione dei dati</li>
            <li>Opporti al trattamento</li>
            <li>Richiedere la portabilità dei dati</li>
            <li>Revocare il consenso in qualsiasi momento</li>
          </ul>
          <p>Per esercitare i tuoi diritti, contattaci a: <a href="mailto:decorcarpi@gmail.com" style={{ color: "#c9a227" }}>decorcarpi@gmail.com</a></p>

          <h3 style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif", fontSize: "14px", fontWeight: "700", marginBottom: "6px", marginTop: "16px" }}>7. Cookie</h3>
          <p>Utilizziamo cookie tecnici necessari al funzionamento del sito. Non utilizziamo cookie di profilazione di terze parti senza il tuo consenso esplicito.</p>

          <h3 style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif", fontSize: "14px", fontWeight: "700", marginBottom: "6px", marginTop: "16px" }}>8. Modifiche alla Privacy Policy</h3>
          <p>Ci riserviamo il diritto di modificare questa Privacy Policy in qualsiasi momento. Le modifiche saranno pubblicate su questa pagina con la data di aggiornamento.</p>

          <h3 style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif", fontSize: "14px", fontWeight: "700", marginBottom: "6px", marginTop: "16px" }}>9. Contatti</h3>
          <p>Per qualsiasi domanda relativa alla privacy, contattaci:<br />
          Email: <a href="mailto:decorcarpi@gmail.com" style={{ color: "#c9a227" }}>decorcarpi@gmail.com</a><br />
          Indirizzo: 41012 Carpi (MO), Italia</p>
        </div>
      </div>
    </div>
  );
}

// ── Settings Screen ────────────────────────────────────────────────────────
function SettingsScreen({ onBack, t }: {
  onBack: () => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const [notificationBadges, setNotificationBadges] = useState<Record<string, number>>({
    preventivo: 3,
    project: 2,
  });
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => localStorage.getItem('app-language') || 'it');
  const [showBackupManager, setShowBackupManager] = useState(false);
  
  const { selectedColorTheme, setSelectedColorTheme, darkMode, setDarkMode, colorThemes, currentColorTheme } = useTheme();
  const themes = colorThemes;
  
  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    localStorage.setItem('app-language', lang);
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: currentColorTheme.colors.bg }}>
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: `${currentColorTheme.colors.gold}40` }}>
        <button onClick={onBack} style={{ color: currentColorTheme.colors.gold }}><ArrowLeft size={22} /></button>
        <h1 className="text-base font-bold tracking-wide" style={{ color: currentColorTheme.colors.accent, fontFamily: "'Raleway', sans-serif" }}>
          Impostazioni
        </h1>
      </div>
      <div className="flex-1 px-5 py-6 pb-24 overflow-y-auto space-y-6">
        {/* Color Themes */}
        <div className="p-4 rounded-sm" style={{ background: `${currentColorTheme.colors.gold}14`, border: `1px solid ${currentColorTheme.colors.gold}33` }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: currentColorTheme.colors.gold, fontFamily: "'Playfair Display', serif" }}>
            🎨 Temi di Colori
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {themes.map((theme: any) => (
              <button
                key={theme.id}
                onClick={() => setSelectedColorTheme(theme.id as any)}
                className="p-3 rounded-sm transition border-2"
                style={{
                  background: theme.colors.bg,
                  borderColor: selectedColorTheme === theme.id ? theme.colors.gold : "rgba(201,162,39,0.2)",
                  borderWidth: selectedColorTheme === theme.id ? "2px" : "1px",
                }}
              >
                <p className="text-xs font-bold" style={{ color: theme.colors.accent }}>{theme.name}</p>
                <p className="text-[10px] mt-1" style={{ color: theme.colors.accent, opacity: 0.7 }}>{theme.desc}</p>
                <div className="flex gap-1 mt-2">
                  <div className="w-3 h-3 rounded" style={{ background: theme.colors.bg, border: `1px solid ${theme.colors.accent}` }} />
                  <div className="w-3 h-3 rounded" style={{ background: theme.colors.accent }} />
                  <div className="w-3 h-3 rounded" style={{ background: theme.colors.gold }} />
                </div>
              </button>
            ))}
          </div>
        </div>
        {/* Dark Mode Toggle */}
        <div className="p-4 rounded-sm" style={{ background: `${currentColorTheme.colors.gold}14`, border: `1px solid ${currentColorTheme.colors.gold}33` }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: currentColorTheme.colors.gold, fontFamily: "'Playfair Display', serif" }}>
            🌙 Tema
          </h3>
          <label className="flex items-center gap-3 p-3 rounded-sm cursor-pointer transition" style={{ background: `${currentColorTheme.colors.gold}14` }}>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: currentColorTheme.colors.accent }}>{darkMode ? "🌙 Modalità Scura" : "☀️ Modalità Chiara"}</p>
              <p className="text-xs" style={{ color: currentColorTheme.colors.accent, opacity: 0.6 }}>{darkMode ? "Sfondo scuro, testo chiaro" : "Sfondo chiaro, testo scuro"}</p>
            </div>
          </label>
        </div>

        {/* Admin Panel */}
        <div className="p-4 rounded-sm" style={{ background: `${currentColorTheme.colors.gold}14`, border: `1px solid ${currentColorTheme.colors.gold}33` }}>
          <AdminPanel />
        </div>
        {/* Admin Cost Dashboard */}
        <div className="p-4 rounded-sm" style={{ background: `${currentColorTheme.colors.gold}14`, border: `1px solid ${currentColorTheme.colors.gold}33` }}>
          <AdminCostDashboard />
        </div>

        {/* Backup Manager - HIDDEN FOR SECURITY - Admin only */}
      </div>
      {/* Backup Manager Modal */}
      {showBackupManager && <BackupManager onClose={() => setShowBackupManager(false)} />}
    </div>
  );
}

// ── Onboarding Splash ────────────────────────────────────────────────────────
function OnboardingSplash({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: <Camera size={48} style={{ color: "#c9a227" }} />,
      title: "Fotografa la tua stanza",
      desc: "Scatta una Foto della camera che vuoi decorare, oppure carica un'immagine dalla galleria del tuo telefono.",
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{ background: "rgba(10,10,10,0.97)", backdropFilter: "blur(8px)" }}
    >
      {/* Header: Logo STÎNGA + PRO DREAPTA */}
      <div className="absolute top-4 left-0 right-0 px-4 flex items-start justify-between">
        {/* STÎNGA: Logo + Text */}
        <div className="flex flex-col items-start">
          <h1 className="text-base font-bold tracking-widest" style={{ color: "#c9a227", fontFamily: "'Playfair Display', serif" }}>DECOR CARPI</h1>
          <p className="text-[6px] tracking-[0.2em] mt-0 uppercase" style={{ color: "#888", fontFamily: "'Raleway', sans-serif" }}>Visualizzatore Texture</p>
        </div>

      </div>

      {/* Card step */}
      <div
        className="w-full max-w-xs mx-6 p-7 rounded-lg flex flex-col items-center text-center"
        style={{ background: "#111", border: "1px solid rgba(201,162,39,0.3)" }}
      >
        <div className="mb-5 p-4 rounded-full" style={{ background: "rgba(201,162,39,0.08)" }}>
          {current.icon}
        </div>
        <h2 className="text-lg font-bold mb-3" style={{ color: "#e8e8e8", fontFamily: "'Playfair Display', serif" }}>
          {current.title}
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "#aaa", fontFamily: "'Open Sans', sans-serif" }}>
          {current.desc}
        </p>
      </div>

      {/* Indicatori step */}
      <div className="flex gap-2 mt-6">
        {steps.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: i === step ? 20 : 8,
              height: 8,
              background: i === step ? "#c9a227" : "rgba(201,162,39,0.25)",
            }}
          />
        ))}
      </div>

      {/* Bottoni */}
      <div className="flex gap-3 mt-6 w-full max-w-xs px-6">
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex-1 py-3 rounded-sm text-sm font-semibold"
            style={{ border: "1px solid rgba(201,162,39,0.4)", color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}
          >
            Indietro
          </button>
        )}
        <button
          onClick={() => { if (isLast) { onDone(); } else { setStep(s => s + 1); } }}
          className="flex-1 py-3 rounded-sm text-sm font-bold"
          style={{ background: "#c9a227", color: "#0a0a0a", fontFamily: "'Raleway', sans-serif" }}
        >
          {isLast ? "Inizia ora" : "Avanti"}
        </button>
      </div>

      {/* Salta */}
      {!isLast && (
        <button
          onClick={onDone}
          className="mt-4 text-xs"
          style={{ color: "#555", fontFamily: "'Open Sans', sans-serif" }}
        >
          Salta introduzione
        </button>
      )}
    </div>
  );
}

// ── App Principale ────────────────────────────────────────────────────────────
export default function Home() {
  const { t, lang, setLang, languages } = useTranslation();
  const [location] = useLocation();
  const router = useRouter();

  // Read screen from URL query params: /?screen=style, /?screen=settings, /?screen=contact
  const getScreenFromUrl = (): AppScreen => {
    const params = new URLSearchParams(window.location.search);
    const screenParam = params.get('screen');
    if (screenParam && ['style', 'settings', 'contact', 'calculator', 'Vernice', 'Antimuffa', 'apartment-calc', 'custom-quote', 'preventivo'].includes(screenParam)) {
      return screenParam as AppScreen;
    }
    if (location === "/paint-editor") return "paint-editor";
    return "home";
  };

  const [screen, setScreenState] = useState<AppScreen>(getScreenFromUrl);

  // Sync screen with URL query params when URL changes
  useEffect(() => {
    const newScreen = getScreenFromUrl();
    if (newScreen !== screen) {
      setScreenState(newScreen);
    }
  }, [location]);

  // Also listen for popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setScreenState(getScreenFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setScreen = useCallback((s: AppScreen) => {
    setScreenState(s);

    // Update URL to reflect screen change (for internal navigation like onBack)
    if (s === 'home') {
      window.history.replaceState(null, '', '/');
    } else if (['style', 'settings', 'contact', 'calculator', 'Vernice', 'Antimuffa', 'apartment-calc', 'custom-quote', 'preventivo'].includes(s)) {
      window.history.replaceState(null, '', `/?screen=${s}`);
    }
  }, []);
  const { data: texturesList = [] } = trpc.textures.list.useQuery();
  const [originalUrl, setOriginalUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [gallery, setGallery] = useState<Array<{ url: string; textureName: string; timestamp: number }>>([])
  const [preselectedTextureId, setPreselectedTextureId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return localStorage.getItem("decorcarpi_onboarding") !== "1"; } catch { return true; }
  });
  const [isRepartoOpen, setIsRepartoOpen] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [inputDialog, setInputDialog] = useState({isOpen: false, title: '', placeholder: '', type: 'text' as const, onConfirm: () => {}, onCancel: () => {}});
  // PRO removed - all users can generate unlimited
  const proCode = "";
  const isPro = false;
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const { user } = useAuth();
  const [cookieAccepted, setCookieAccepted] = useState(() => {
    try { return localStorage.getItem("decorcarpi_cookie") === "1"; } catch { return false; }
  });
  
  useEffect(() => {
  }, []);

  const handleImageReady = (url: string, preview: string) => {
    setOriginalUrl(url);
    setPreviewUrl(preview);
    setScreen("visualizer");
  };

  const handleSaveResult = (url: string, textureName: string) => {
    setGallery(prev => {
      const exists = prev.some(item => item.url === url);
      if (exists) return prev;
      return [{ url, textureName, timestamp: Date.now() }, ...prev];
    });
  };

  const navigate = useCallback((s: AppScreen) => {
    console.log("[DEBUG] navigate called with:", s);
    setScreen(s);
  }, []);

  // Naviga alla schermata upload con una texture pre-selezionata
  const handleNavigateWithTexture = useCallback((textureId: string) => {
    setPreselectedTextureId(textureId);
    setScreen("upload");
  }, []);

  const handleOnboardingDone = () => {
    try { localStorage.setItem("decorcarpi_onboarding", "1"); } catch {}
    setShowOnboarding(false);
  };

  const handlePhotoSelected = (file: File) => {
    setScreen("upload");
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      handleImageReady(url, url);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] max-w-md mx-auto" style={{ fontFamily: "'Open Sans', sans-serif", paddingBottom: !cookieAccepted ? "120px" : "0" }}>
      {showOnboarding && <OnboardingSplash onDone={handleOnboardingDone} />}
      {screen === "home" && (
        <HomeScreen onNavigate={navigate} onNavigateWithTexture={handleNavigateWithTexture} isPro={isPro} />
      )}
      {screen === "upload" && (
        <UploadScreen onBack={() => setScreen("home")} onImageReady={handleImageReady} t={t} />
      )}
      {screen === "visualizer" && originalUrl && (
        <VisualizerScreen
          originalUrl={originalUrl}
          previewUrl={previewUrl}
          onBack={() => setScreen("upload")}
          onSaveResult={handleSaveResult}
          t={t}
          preselectedTextureId={preselectedTextureId}
          proCode={proCode}
          isPro={isPro}
        />
      )}
      {screen === "gallery" && (
        <GalleryScreen gallery={gallery} onBack={() => setScreen("home")} t={t} />
      )}
      {screen === "contact" && (
        <ContactScreen onBack={() => setScreen("home")} onNavigate={navigate} t={t} />
      )}
      {screen === "inspiration" && (
        <InspirationScreen
          onBack={() => setScreen("home")}
          onUseImage={() => setScreen("upload")}
          t={t}
        />
      )}
      {screen === "style" && (
        <StyleTransferScreen
          onBack={() => setScreen("home")}
          onNavigate={navigate}
          t={t}
          proCode={proCode}
          isPro={isPro}
        />
      )}
      {screen === "privacy" && (
        <PrivacyPolicyScreen onBack={() => setScreen("home")} t={t} />
      )}
      {screen === "calculator" && (
        <CalculatorPretScreen onBack={() => setScreen("home")} t={t} />
      )}
      {screen === "Vernice" && (
        <CalculatorVerniceScreen onBack={() => setScreen("home")} t={t} />
      )}
      {screen === "paint-editor" && (
        <PaintEditorScreen onBack={() => setScreen("home")} />
      )}

      {screen === "fotografia" && (
        <FotografaScreen onBack={() => setScreen("home")} />
      )}


      {screen === "Antimuffa" && (
        <CalculatorAntimuffaScreen onBack={() => setScreen("preventivo")} t={t} />
      )}

      {screen === "apartment-calc" && (
        <ApartmentCalculatorScreen onBack={() => setScreen("preventivo")} t={t} />
      )}

      {screen === "preventivo" && (
        <div className="flex flex-col min-h-screen bg-[#0a0a0a] pb-24"><div className="px-4 py-6"><h1 style={{ color: "#c9a227", fontFamily: "'Playfair Display', serif", fontSize: "24px" }}>Preventivo</h1><p style={{ color: "#d0d0d0", marginTop: "12px" }}>Seleziona un tipo di preventivo dal menu sottostante</p></div></div>
      )}


      {screen === "custom-quote" && (
        <CustomQuoteFormScreen onBack={() => setScreen("preventivo")} />
      )}
      {screen === "settings" && (
        <SettingsScreen onBack={() => setScreen("home")} t={t} />
      )}
      {screen === "texture-gallery" && (
        <div className="min-h-screen bg-[#0a0a0a]">
          <div className="px-4 py-6 flex items-center gap-3">
            <button onClick={() => setScreen("home")} className="text-[#c9a227] hover:text-[#d4a835]">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 style={{ color: "#c9a227", fontFamily: "'Playfair Display', serif", fontSize: "24px" }}>Galeria Texture</h1>
          </div>
          <TextureGallery textures={texturesList} onTextureSelect={(texture) => handleNavigateWithTexture(texture.id)} />
        </div>
      )}
      {screen === "texture-comparison" && (
        <div className="min-h-screen bg-[#0a0a0a]">
          <div className="px-4 py-6 flex items-center gap-3">
            <button onClick={() => setScreen("home")} className="text-[#c9a227] hover:text-[#d4a835]">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 style={{ color: "#c9a227", fontFamily: "'Playfair Display', serif", fontSize: "24px" }}>Compara Texture</h1>
          </div>
          <TextureComparison textures={texturesList} onClose={() => setScreen("home")} />
        </div>
      )}
      {screen === "texture-collections" && (
        <div className="min-h-screen bg-[#0a0a0a]">
          <div className="px-4 py-6 flex items-center gap-3">
            <button onClick={() => setScreen("home")} className="text-[#c9a227] hover:text-[#d4a835]">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 style={{ color: "#c9a227", fontFamily: "'Playfair Display', serif", fontSize: "24px" }}>Colectii Texture</h1>
          </div>
          <TextureCollections textures={texturesList} onTextureSelect={(texture) => handleNavigateWithTexture(texture.id)} />
        </div>
      )}

      {/* Modal PRO - introducere Codice */}


      {/* PromptDialog pentru introducere date client */}
      <PromptDialog />

      {/* Cookie Banner - modal centrato, non blocca il contenuto */}
      {!cookieAccepted && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.5)", paddingBottom: "68px", pointerEvents: "none" }}
        >
          <div
            className="w-full max-w-md mx-3 p-4 rounded-t-lg"
            style={{
              background: "#111",
              border: "1px solid rgba(201,162,39,0.4)",
              borderBottom: "none",
              pointerEvents: "auto"
            }}
          >
            <div className="flex items-start gap-2 mb-3">
              <p className="flex-1 text-[#d0d0d0] text-[12px] leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                {t.cookieText}{" "}
                <button
                  onClick={() => { setCookieAccepted(true); navigate("privacy"); }}
                  className="underline"
                  style={{ color: "#c9a227", background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "12px" }}
                >
                  {t.privacyLink ?? "Privacy Policy"}
                </button>
              </p>
              <button
                onClick={() => setCookieAccepted(true)}
                className="shrink-0"
                style={{ color: "#666" }}
                aria-label="Chiudi"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCookieAccepted(true)}
                className="flex-1 py-2 text-[12px] font-semibold border rounded-sm"
                style={{ borderColor: "rgba(201,162,39,0.4)", color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}
              >
                {t.cookieReject}
              </button>
              <button
                onClick={() => {
                  setCookieAccepted(true);
                  try { localStorage.setItem("decorcarpi_cookie", "1"); } catch {}
                }}
                className="flex-1 py-2 text-[12px] font-bold rounded-sm"
                style={{ background: "#c9a227", color: "#0a0a0a", fontFamily: "'Raleway', sans-serif" }}
              >
                {t.cookieAccept}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PhotoSelectionDialog */}
      <PhotoSelectionDialog
        isOpen={showPhotoDialog}
        onClose={() => setShowPhotoDialog(false)}
        onPhotoSelected={handlePhotoSelected}
      />

    </div>
  );
}

  // 25 Colori colorate pentru Vernice
  const PAINT_COLORS = [
    { name: "Rosso Vibrante", hex: "#E63946" },
    { name: "Arancione Caldo", hex: "#F77F00" },
    { name: "Giallo Dorato", hex: "#FCBF49" },
    { name: "Verde Smeraldo", hex: "#06A77D" },
    { name: "Turchese Cielo", hex: "#0891B2" },
    { name: "Blu Reale", hex: "#1E40AF" },
    { name: "Viola Profondo", hex: "#7C3AED" },
    { name: "Rosa Blush", hex: "#EC4899" },
    { name: "Marrone Cacao", hex: "#92400E" },
    { name: "Grigio Antracite", hex: "#374151" },
    { name: "Nero Puro", hex: "#1F2937" },
    { name: "Bianco Crema", hex: "#F3F4F6" },
    { name: "Beige Caldo", hex: "#D2B48C" },
    { name: "Corallo Chiaro", hex: "#FF7F50" },
    { name: "Lime Neon", hex: "#CCFF00" },
    { name: "Teal Piscina", hex: "#20B2AA" },
    { name: "Indaco Notte", hex: "#4B0082" },
    { name: "Magenta Ardente", hex: "#FF00FF" },
    { name: "Oro Antico", hex: "#B8860B" },
    { name: "Argento Metallico", hex: "#C0C0C0" },
    { name: "Rosso Borgogna", hex: "#800020" },
    { name: "Verde Oliva", hex: "#808000" },
    { name: "Blu Inchiostro", hex: "#000080" },
    { name: "Rosa Orchidea", hex: "#DA70D6" },
    { name: "Turchese Chiaro", hex: "#AFEEEE" },
  ];
