import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Download, MessageCircle, Calculator, Camera, Upload, Wand2, Check, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/hooks/useTranslation';

import { LazyImage } from '@/components/LazyImage';
import { RAL_COLORS } from '@/lib/ralColors';
import { trpc } from '@/lib/trpc';
import { downloadImageWithWatermark } from '@/lib/watermark';
import { addPreventive } from '@/lib/preventiveStorage';

// GoldDivider Component
function GoldDivider() {
  return <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #c9a227, transparent)", opacity: 0.4 }} />;
}



// Wall type from AI detection
interface DetectedWall {
  id: string;
  description: string;
  percentage: number;
  currentColor: string;
}

// Logging utility
const logger = {
  info: (action: string, data?: any) => {
    console.log(`[Vernice] ${action}`, data || '');
  },
  error: (action: string, error?: any) => {
    console.error(`[Vernice Error] ${action}`, error || '');
  },
  warn: (action: string, data?: any) => {
    console.warn(`[Vernice Warning] ${action}`, data || '');
  },
};

// Session ID helper
function getSessionId() {
  let id = localStorage.getItem('vernice_session_id');
  if (!id) {
    id = `vernice_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('vernice_session_id', id);
    logger.info('Session created', { sessionId: id });
  }
  return id;
}

export function PaintEditorScreen({ onBack }: { onBack: () => void }) {
  const { currentColorTheme } = useTheme();
  const { t } = useTranslation();
  
  // --- AI Section State ---
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [detectedWalls, setDetectedWalls] = useState<DetectedWall[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null);
  const [roomType, setRoomType] = useState<string>('');
  const [aiResultUrl, setAiResultUrl] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [aiStep, setAiStep] = useState<'upload' | 'detect' | 'color' | 'result'>('upload');
  
  // --- Calculator State (existing) ---
  const [lunghezza, setLunghezza] = useState("");
  const [altezza, setAltezza] = useState("");
  const [mq, setMq] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [hexInput, setHexInput] = useState("");
  const [discountPercent, setScontoPercent] = useState(0);
  const [extraWorkPercent, setExtraWorkPercent] = useState(0);
  
  // --- Pro Code State ---
  const [proCode, setProCode] = useState<string>("");
  const [showProInput, setShowProInput] = useState(false);
  
  // --- Saved Quotes State ---
  const [savedQuotes, setSavedQuotes] = useState<any[]>([]);
  const [showSavedQuotes, setShowSavedQuotes] = useState(false);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const sessionId = getSessionId();

  // tRPC mutations
  const uploadPhotoMutation = trpc.vernice.uploadPhoto.useMutation();
  const detectWallsMutation = trpc.vernice.detectWalls.useMutation();
  const applyColorMutation = trpc.vernice.applyColor.useMutation();

  // Caricamento preferenze da localStorage
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
    
    const savedQuotesData = localStorage.getItem('verniceQuotes');
    if (savedQuotesData) {
      try {
        setSavedQuotes(JSON.parse(savedQuotesData));
      } catch (e) {
        console.error('Errore nel caricamento dei preventivuri:', e);
      }
    }
  }, []);

  // Salvataggio preferenze
  useEffect(() => {
    const prefs = { lunghezza, altezza, mq, selectedColor, hexInput };
    localStorage.setItem('calculatorVernicePreferences', JSON.stringify(prefs));
  }, [lunghezza, altezza, mq, selectedColor, hexInput]);

  // --- AI FUNCTIONS ---
  
  // Handle photo upload (gallery or camera)
  const handlePhotoSelect = useCallback(async (file: File) => {
    // Validate file type
    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validMimeTypes.includes(file.type)) {
      logger.warn('Invalid file type', { type: file.type });
      toast.error("Formato non supportato. Usa JPG, PNG o WebP.", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
      return;
    }
    
    // Validate file size (max 10MB)
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeBytes) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      logger.warn('File too large', { sizeMB, maxMB: 10 });
      toast.error(`File troppo grande (${sizeMB}MB). Massimo 10MB.`, {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
      return;
    }
    
    logger.info('Photo selected', { fileName: file.name, size: file.size });

    setIsUploading(true);
    setDetectedWalls([]);
    setSelectedWallId(null);
    setAiResultUrl(null);

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setUploadedPhoto(base64);

        // Upload to server
        try {
          const result = await uploadPhotoMutation.mutateAsync({
            base64,
            fileName: file.name || 'room-photo.jpg',
          });
          setUploadedPhotoUrl(result.url);
          setAiStep('detect');
          logger.info('Photo uploaded successfully', { url: result.url });
          toast.success("Foto caricata con successo!", {
            style: { background: "#1a0a0a", color: "#4caf50", border: "1px solid rgba(76,175,80,0.3)" },
          });
        } catch (err) {
          logger.error('Photo upload failed', err);
          toast.error("Errore nel caricamento. Riprova.", {
            style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File read error:', err);
      toast.error("Errore nella lettura del file", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
    } finally {
      setIsUploading(false);
    }
  }, [uploadPhotoMutation]);

  // Detect walls with AI
  const handleDetectWalls = useCallback(async () => {
    if (!uploadedPhotoUrl) return;
    
    setIsDetecting(true);
    try {
      const result = await detectWallsMutation.mutateAsync({
        imageUrl: uploadedPhotoUrl,
      });
      setDetectedWalls(result.walls);
      setRoomType(result.roomType);
      if (result.walls.length > 0) {
        setSelectedWallId(result.walls[0].id);
      }
      setAiStep('color');
      toast.success(`${result.totalWalls} paret${result.totalWalls === 1 ? 'e' : 'i'} rilevat${result.totalWalls === 1 ? 'a' : 'i'}!`, {
        style: { background: "#1a0a0a", color: "#4caf50", border: "1px solid rgba(76,175,80,0.3)" },
      });
    } catch (err) {
      console.error('Wall detection error:', err);
      toast.error("Errore nella rilevazione dei pareti. Riprova.", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
    } finally {
      setIsDetecting(false);
    }
  }, [uploadedPhotoUrl, detectWallsMutation]);

  // Salva preventivo in localStorage
  const handleSaveQuote = useCallback(() => {
    if (!mq || !selectedColor) {
      toast.error("Completa il preventivo prima di salvare", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
      return;
    }

    const quote = {
      id: `quote_${Date.now()}`,
      date: new Date().toLocaleDateString('it-IT'),
      lunghezza,
      altezza,
      mq,
      selectedColor,
      colorName: RAL_COLORS.find((c: any) => c.hex === selectedColor)?.name || selectedColor,
      discountPercent,
      extraWorkPercent,
    };

    const updated = [...savedQuotes, quote];
    setSavedQuotes(updated);
    localStorage.setItem('verniceQuotes', JSON.stringify(updated));
    
    toast.success("Preventivo salvato!", {
      style: { background: "#1a0a0a", color: "#4caf50", border: "1px solid rgba(76,175,80,0.3)" },
    });
  }, [mq, selectedColor, lunghezza, altezza, discountPercent, extraWorkPercent, savedQuotes]);

  // Carica preventivo salvato
  const handleLoadQuote = useCallback((quote: any) => {
    setLunghezza(quote.lunghezza);
    setAltezza(quote.altezza);
    setMq(quote.mq);
    setSelectedColor(quote.selectedColor);
    setHexInput(quote.selectedColor);
    setScontoPercent(quote.discountPercent);
    setExtraWorkPercent(quote.extraWorkPercent);
    setShowSavedQuotes(false);
    
    toast.success("Preventivo caricato!", {
      style: { background: "#1a0a0a", color: "#4caf50", border: "1px solid rgba(76,175,80,0.3)" },
    });
  }, []);

  // Rimuovi preventivo Salvato
  const handleDeleteQuote = useCallback((id: string) => {
    const updated = savedQuotes.filter(q => q.id !== id);
    setSavedQuotes(updated);
    localStorage.setItem('verniceQuotes', JSON.stringify(updated));
    
    toast.success("Preventivo eliminat!", {
      style: { background: "#1a0a0a", color: "#4caf50", border: "1px solid rgba(76,175,80,0.3)" },
    });
  }, [savedQuotes]);

  // Handle pro code submission - no longer needed
  const handleProCodeSubmit = useCallback(() => {
    setShowProInput(false);
  }, []);

  // Apply color to selected wall
  const handleApplyColor = useCallback(async () => {
    if (!uploadedPhotoUrl || !selectedColor || !selectedWallId) {
      toast.error("Seleziona un colore e una Parete", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
      return;
    }

    const wall = detectedWalls.find(w => w.id === selectedWallId);
    if (!wall) return;

    setIsApplying(true);
    try {
      const colorName = RAL_COLORS.find((c: any) => c.hex === selectedColor)?.name || selectedColor;
      
      const result = await applyColorMutation.mutateAsync({
        originalImageUrl: uploadedPhotoUrl,
        colorHex: selectedColor,
        colorName,
        wallId: wall.id,
        wallDescription: wall.description,
        sessionId,
      });
      
      setAiResultUrl(result.url || null);
      setAiStep('result');
      toast.success("Colore applicato con successo!", {
        style: { background: "#1a0a0a", color: "#4caf50", border: "1px solid rgba(76,175,80,0.3)" },
      });
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg === 'LIMIT_REACHED') {
        toast.error("Hai raggiunto il limite di generazioni gratuite. Contattaci su WhatsApp per continuare!", {
          style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
          duration: 5000,
        });
      } else {
        toast.error(msg || "Errore nell'applicazione del colore. Riprova.", {
          style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
        });
      }
    } finally {
      setIsApplying(false);
    }
  }, [uploadedPhotoUrl, selectedColor, selectedWallId, detectedWalls, sessionId, applyColorMutation]);

  // Export functions
  const handleDownloadResult = useCallback(async () => {
    if (!aiResultUrl) return;
    try {
      await downloadImageWithWatermark(aiResultUrl, `Vernice-ai-${Date.now()}.jpg`);
      toast.success("Immagine scaricata!", {
        style: { background: "#1a0a0a", color: "#4caf50", border: "1px solid rgba(76,175,80,0.3)" },
      });
    } catch (error) {
      console.error("Errore la descarcarea imaginii:", error);
      toast.error("Errore la descarcarea imaginii", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
    }
  }, [aiResultUrl]);

  const handleWhatsAppShare = useCallback(() => {
    if (!aiResultUrl) return;
    const wall = detectedWalls.find(w => w.id === selectedWallId);
    const colorName = RAL_COLORS.find((c: any) => c.hex === selectedColor)?.name || selectedColor;
    const msg = `Ciao Decor Carpi! Ho usato il vostro visualizzatore AI per la Vernice.\n\n🎨 Colore: ${colorName} (${selectedColor})\n🏠 Stanza: ${roomType}\n🧱 Parete: ${wall?.description || 'Parete principale'}\n\n📸 Risultato: ${aiResultUrl}\n\nVorrei un preventivo per questo lavoro. Grazie!`;
    window.open(`https://wa.me/393343600932?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  }, [aiResultUrl, selectedColor, selectedWallId, detectedWalls, roomType]);

  const handleExportPDF = useCallback(async () => {
    if (!aiResultUrl) return;
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF('p', 'mm', 'a4');
      const wall = detectedWalls.find(w => w.id === selectedWallId);
      const colorName = RAL_COLORS.find((c: any) => c.hex === selectedColor)?.name || selectedColor || '';
      
      // Header
      doc.setFillColor(10, 10, 10);
      doc.rect(0, 0, 210, 297, 'F');
      
      doc.setTextColor(201, 162, 39);
      doc.setFontSize(22);
      doc.text('DECOR CARPI', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('Visualizzatore AI Vernice', 105, 28, { align: 'center' });
      
      // Info
      doc.setFontSize(12);
      doc.setTextColor(232, 232, 232);
      doc.text(`Stanza: ${roomType}`, 20, 45);
      doc.text(`Parete: ${wall?.description || 'Principale'}`, 20, 55);
      doc.text(`Colore: ${colorName}`, 20, 65);
      doc.text(`Codice: ${selectedColor}`, 20, 75);
      
      // Color swatch
      const hex = selectedColor || '#000000';
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      doc.setFillColor(r, g, b);
      doc.roundedRect(160, 42, 30, 30, 3, 3, 'F');
      
      // Image
      try {
        const response = await fetch(aiResultUrl);
        const blob = await response.blob();
        const imgData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        doc.addImage(imgData, 'JPEG', 15, 85, 180, 135);
      } catch {
        doc.setTextColor(255, 100, 100);
        doc.text('Immagine non disponibile', 105, 150, { align: 'center' });
      }
      
      // Footer
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generato il ${new Date().toLocaleDateString('it-IT')} - Decor Carpi`, 105, 235, { align: 'center' });
      doc.text('Tel: 334 360 0932 | Email: decorcarpi@gmail.com', 105, 242, { align: 'center' });
      
      doc.save(`Vernice-AI-${roomType}-${Date.now()}.pdf`);
      toast.success("PDF esportato con successo!", {
        style: { background: "#1a0a0a", color: "#4caf50", border: "1px solid rgba(76,175,80,0.3)" },
      });
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error("Errore nell'esportazione PDF", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
    }
  }, [aiResultUrl, selectedColor, selectedWallId, detectedWalls, roomType]);

  // Reset AI flow
  const handleResetAI = useCallback(() => {
    setUploadedPhoto(null);
    setUploadedPhotoUrl(null);
    setDetectedWalls([]);
    setSelectedWallId(null);
    setAiResultUrl(null);
    setRoomType('');
    setAiStep('upload');
  }, []);

  // --- Calculator helpers ---
  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("").toUpperCase();
  };



  // Calcolo
  const mqFromLunghezzaAltezza = lunghezza && altezza ? parseFloat(lunghezza) * parseFloat(altezza) : 0;
  const mqFinale = mq ? parseFloat(mq) : mqFromLunghezzaAltezza;
  const mqPeretiCalcolati = mqFinale;
  const mqTotalee = mqPeretiCalcolati;

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
    const msg = `Ciao Decor Carpi! Vorrei un preventivo per Vernice:

• Muri: ${mqPeretiCalcolati.toFixed(1)} m²
• Stima: €${totalMin} - €${totalMax}

Potete confermarmi il prezzo e i tempi?? Grazie!`;
    window.open(`https://wa.me/393343600932?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };



  return (
    <div className="flex flex-col min-h-screen" style={{ background: currentColorTheme.colors.bg }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: "rgba(201,162,39,0.2)" }}>
        <button onClick={onBack} className="text-[#c9a227]"><ArrowLeft size={22} /></button>
        <h1 className="text-base font-bold tracking-wide" style={{ color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}>
          Vernice AI
        </h1>
      </div>

      <div className="flex-1 px-5 py-6 pb-28 flex flex-col gap-5">
        
        {/* ═══════════════════════════════════════════════════════════════════════
            SEZIONE AI - VISUALIZZATORE COLORI
        ═══════════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col gap-4">
          <div className="text-center">
            <h2 className="text-sm font-bold tracking-widest uppercase" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
              🎨 Visualizzatore AI
            </h2>
            <p className="text-xs mt-1" style={{ color: "#888", fontFamily: "'Open Sans', sans-serif" }}>
              Carica una Foto della tua stanza e prova i colori sulle pareti
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2">
            {['upload', 'detect', 'color', 'result'].map((step, i) => (
              <div key={step} className="flex items-center gap-1">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                  style={{
                    background: aiStep === step ? '#c9a227' : 
                               ['upload', 'detect', 'color', 'result'].indexOf(aiStep) > i ? 'rgba(76,175,80,0.8)' : 'rgba(201,162,39,0.15)',
                    color: aiStep === step || ['upload', 'detect', 'color', 'result'].indexOf(aiStep) > i ? '#000' : '#666',
                    border: aiStep === step ? '2px solid #c9a227' : '1px solid rgba(201,162,39,0.3)',
                  }}
                >
                  {['upload', 'detect', 'color', 'result'].indexOf(aiStep) > i ? <Check size={12} /> : i + 1}
                </div>
                {i < 3 && <div className="w-6 h-px" style={{ background: ['upload', 'detect', 'color', 'result'].indexOf(aiStep) > i ? '#4caf50' : 'rgba(201,162,39,0.2)' }} />}
              </div>
            ))}
          </div>

          {/* STEP 1: Upload Photo */}
          {aiStep === 'upload' && (
            <div className="flex flex-col gap-3">
              <div
                className="p-8 rounded-lg flex flex-col items-center justify-center gap-4 cursor-pointer transition-all hover:border-[#c9a227]"
                style={{ background: "rgba(201,162,39,0.05)", border: "2px dashed rgba(201,162,39,0.3)" }}
                onClick={() => galleryInputRef.current?.click()}
              >
                <Upload size={40} style={{ color: "#c9a227", opacity: 0.7 }} />
                <p className="text-sm font-semibold text-center" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
                  Carica una Foto della stanza
                </p>
                <p className="text-[10px] text-center" style={{ color: "#666" }}>
                  Tocca per selezionare dalla galleria
                </p>
              </div>
              
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm transition-all"
                style={{ background: "rgba(201,162,39,0.15)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.3)" }}
              >
                <Camera size={18} />
                Scatta una Foto con la fotocamera
              </button>

              {/* Hidden file inputs */}
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoSelect(file);
                  e.target.value = '';
                }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoSelect(file);
                  e.target.value = '';
                }}
              />

              {isUploading && (
                <div className="flex items-center justify-center gap-2 py-3">
                  <Loader2 size={18} className="animate-spin" style={{ color: "#c9a227" }} />
                  <span className="text-xs" style={{ color: "#c9a227" }}>Caricamento in corso...</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Detect Walls */}
          {aiStep === 'detect' && uploadedPhoto && (
            <div className="flex flex-col gap-3">
              <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(201,162,39,0.3)" }}>
                <img src={uploadedPhoto} alt="Foto stanza" className="w-full h-48 object-cover" />
              </div>
              
              <button
                onClick={handleDetectWalls}
                disabled={isDetecting}
                className="w-full py-3.5 rounded-lg font-bold flex items-center justify-center gap-2 text-sm tracking-wide uppercase transition-all disabled:opacity-50"
                style={{ background: "#c9a227", color: "#000", fontFamily: "'Raleway', sans-serif" }}
              >
                {isDetecting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Analisi AI in corso...
                  </>
                ) : (
                  <>
                    <Wand2 size={18} />
                    Rileva Pareti con AI
                  </>
                )}
              </button>

              <button
                onClick={handleResetAI}
                className="text-xs text-center py-2"
                style={{ color: "#666" }}
              >
                ← Cambia Foto
              </button>
            </div>
          )}

          {/* STEP 3: Select Wall + Color */}
          {aiStep === 'color' && (
            <div className="flex flex-col gap-4">
              {/* Photo preview */}
              <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(201,162,39,0.3)" }}>
                <img src={uploadedPhoto!} alt="Foto stanza" className="w-full h-36 object-cover" />
              </div>

              {/* Room info */}
              {roomType && (
                <div className="px-3 py-2 rounded-lg" style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.2)" }}>
                  <p className="text-[10px]" style={{ color: "#888" }}>Tipo di stanza rilevato:</p>
                  <p className="text-xs font-bold capitalize" style={{ color: "#c9a227" }}>{roomType}</p>
                </div>
              )}

              {/* Wall selection */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
                  Seleziona la Parete da dipingere:
                </label>
                <div className="flex flex-col gap-2">
                  {detectedWalls.map((wall) => (
                    <button
                      key={wall.id}
                      onClick={() => setSelectedWallId(wall.id)}
                      className="flex items-center gap-3 p-3 rounded-lg transition-all text-left"
                      style={{
                        background: selectedWallId === wall.id ? "rgba(201,162,39,0.15)" : "rgba(255,255,255,0.03)",
                        border: selectedWallId === wall.id ? "2px solid #c9a227" : "1px solid rgba(201,162,39,0.15)",
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          background: selectedWallId === wall.id ? "#c9a227" : "transparent",
                          border: selectedWallId === wall.id ? "2px solid #c9a227" : "2px solid rgba(201,162,39,0.4)",
                        }}
                      >
                        {selectedWallId === wall.id && <Check size={12} color="#000" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold" style={{ color: "#e8e8e8" }}>{wall.description}</p>
                        <p className="text-[10px]" style={{ color: "#666" }}>
                          Colore attuale: {wall.currentColor} • ~{wall.percentage}% dell'immagine
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color selection for AI */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
                  Scegli il colore da applicare:
                </label>

                {/* RAL Colors (collapsible) */}
                <details className="group">
                  <summary className="text-[10px] font-bold cursor-pointer py-1" style={{ color: "#c9a227" }}>
                    Colori RAL ({RAL_COLORS.length} colori) ▼
                  </summary>
                  <div className="grid grid-cols-8 gap-1.5 max-h-32 overflow-y-auto p-1 mt-1">
                    {RAL_COLORS.map((color: any) => (
                      <button
                        key={color.ral}
                        onClick={() => { setSelectedColor(color.hex); setHexInput(color.hex); }}
                        className="w-full aspect-square rounded transition-all hover:scale-110"
                        style={{
                          background: color.hex,
                          border: selectedColor === color.hex ? "3px solid #fff" : "1px solid rgba(0,0,0,0.3)",
                        }}
                        title={`${color.ral} - ${color.name || ''}`}
                      />
                    ))}
                  </div>
                </details>

                {/* Selected color preview */}
                {selectedColor && (
                  <div className="flex items-center gap-3 p-2 rounded-lg" style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.2)" }}>
                    <div className="w-8 h-8 rounded" style={{ background: selectedColor, border: "1px solid rgba(255,255,255,0.2)" }} />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "#c9a227" }}>
                        {RAL_COLORS.find((c: any) => c.hex === selectedColor)?.name || selectedColor}
                      </p>
                      <p className="text-[10px]" style={{ color: "#888" }}>{selectedColor}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Apply button */}
              <button
                onClick={handleApplyColor}
                disabled={isApplying || !selectedColor || !selectedWallId}
                className="w-full py-3.5 rounded-lg font-bold flex items-center justify-center gap-2 text-sm tracking-wide uppercase transition-all disabled:opacity-40"
                style={{ background: "#c9a227", color: "#000", fontFamily: "'Raleway', sans-serif" }}
              >
                {isApplying ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Applicazione AI in corso...
                  </>
                ) : (
                  <>
                    <Wand2 size={18} />
                    Applica Colore sulla Parete
                  </>
                )}
              </button>

              <button onClick={handleResetAI} className="text-xs text-center py-1" style={{ color: "#666" }}>
                ← Ricomincia da capo
              </button>
              
              {/* Pro Code Input */}
              {!showProInput && (
                <button
                  onClick={() => setShowProInput(true)}
                  className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                  style={{ background: "rgba(201,162,39,0.1)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.3)" }}
                >
                  <Lock size={14} />
                  Attiva Modalità PRO
                </button>
              )}
              
              {showProInput && (
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Inserisci codice PRO"
                    value={proCode}
                    onChange={(e) => setProCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleProCodeSubmit()}
                    className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                    style={{ background: "#111", border: "1px solid rgba(201,162,39,0.3)", color: "#e8e8e8" }}
                  />
                  <button
                    onClick={handleProCodeSubmit}
                    className="px-4 py-2 rounded-lg text-xs font-semibold"
                    style={{ background: "#c9a227", color: "#000" }}
                  >
                    OK
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Result */}
          {aiStep === 'result' && aiResultUrl && (
            <div className="flex flex-col gap-4">
              {/* Before/After */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <p className="text-[9px] font-bold text-center uppercase" style={{ color: "#888" }}>Prima</p>
                  <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(201,162,39,0.2)" }}>
                    <img src={uploadedPhoto!} alt="Prima" className="w-full h-32 object-cover" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[9px] font-bold text-center uppercase" style={{ color: "#4caf50" }}>Dopo</p>
                  <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(76,175,80,0.3)" }}>
                    <img src={aiResultUrl} alt="Dopo" className="w-full h-32 object-cover animate-fadeIn" />
                  </div>
                </div>
              </div>

              {/* Full result */}
              <div className="rounded-lg overflow-hidden" style={{ border: "2px solid rgba(201,162,39,0.4)" }}>
                <img src={aiResultUrl} alt="Risultato AI" className="w-full h-auto object-cover animate-fadeIn" />
              </div>

              {/* Info */}
              <div className="p-3 rounded-lg" style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.2)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded" style={{ background: selectedColor || '#000', border: "1px solid rgba(255,255,255,0.2)" }} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "#c9a227" }}>
                      {RAL_COLORS.find((c: any) => c.hex === selectedColor)?.name || selectedColor}
                    </p>
                    <p className="text-[10px]" style={{ color: "#888" }}>
                      {detectedWalls.find(w => w.id === selectedWallId)?.description} • {roomType}
                    </p>
                  </div>
                </div>
              </div>

              {/* Export buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleDownloadResult}
                  className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 text-sm"
                  style={{ background: "#c9a227", color: "#000", fontFamily: "'Raleway', sans-serif" }}
                >
                  <Download size={16} />
                  Scarica Immagine
                </button>
                <button
                  onClick={handleExportPDF}
                  className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 text-sm"
                  style={{ background: "rgba(201,162,39,0.15)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.3)" }}
                >
                  <Download size={16} />
                  Esporta PDF
                </button>
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 text-sm"
                  style={{ background: "#25D366", color: "#fff", fontFamily: "'Raleway', sans-serif" }}
                >
                  <MessageCircle size={16} />
                  Invia su WhatsApp
                </button>
              </div>

              {/* Try another color */}
              <div className="flex gap-2">
                <button
                  onClick={() => { setAiResultUrl(null); setAiStep('color'); }}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold"
                  style={{ background: "rgba(201,162,39,0.1)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.2)" }}
                >
                  Prova un Altro colore
                </button>
                <button
                  onClick={handleResetAI}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold"
                  style={{ background: "rgba(255,255,255,0.03)", color: "#888", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  Nuova Foto
                </button>
              </div>
            </div>
          )}
        </div>

        <GoldDivider />

        {/* ═══════════════════════════════════════════════════════════════════════
            SEZIONE CALCULATOR Vernice (ESISTENTE - NON MODIFICATA)
        ═══════════════════════════════════════════════════════════════════════ */}
        
        <div className="text-center">
          <h2 className="text-sm font-bold tracking-widest uppercase" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
            <Calculator size={16} className="inline mr-2" />
            Preventivo Vernice
          </h2>
          <p className="text-xs mt-1" style={{ color: "#888", fontFamily: "'Open Sans', sans-serif" }}>
            Calcola il preventivo per la Vernice
          </p>
        </div>

        <GoldDivider />

        {/* Spectru de Colori */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
            {t.verniceChooseColor}
          </label>
          <div className="flex flex-col gap-3">
            <div className="w-full">
              <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto pr-2">
                {RAL_COLORS.map((color: any, i: number) => (
                  <button
                    key={`color-${i}`}
                    onClick={() => { setSelectedColor(color.hex); setHexInput(color.hex); }}
                    className="flex flex-col items-center gap-1 p-2 rounded-sm transition-all"
                    style={{
                      background: selectedColor === color.hex ? "rgba(201,162,39,0.2)" : "transparent",
                      border: selectedColor === color.hex ? "2px solid #c9a227" : "1px solid rgba(201,162,39,0.2)",
                    }}
                  >
                    <div className="w-10 h-10 rounded-sm" style={{ background: color.hex, border: "1px solid rgba(0,0,0,0.2)" }} />
                    <span className="text-[7px] text-center leading-tight" style={{ color: "#aaa", fontFamily: "'Open Sans', sans-serif" }}>
                      {color.name.split(" ")[0]}
                    </span>
                  </button>
                ))}
                {["#FFFFFF", "#F2F2F2", "#E6E6E6", "#D9D9D9", "#CCCCCC", "#BFBFBF", "#B3B3B3", "#A6A6A6", "#999999", "#8C8C8C"].map((color: string, i: number) => (
                  <button
                    key={`gray-${i}`}
                    onClick={() => { setSelectedColor(color); setHexInput(color); }}
                    className="flex flex-col items-center gap-1 p-1.5 rounded-sm transition-all"
                    style={{
                      background: selectedColor === color ? "rgba(201,162,39,0.2)" : "transparent",
                      border: selectedColor === color ? "2px solid #c9a227" : "1px solid rgba(201,162,39,0.2)",
                    }}
                  >
                    <div className="w-8 h-8 rounded-sm" style={{ background: color, border: "1px solid rgba(0,0,0,0.2)" }} />
                    <span className="text-[7px] text-center leading-tight" style={{ color: "#aaa", fontFamily: "'Open Sans', sans-serif" }}>
                      {i === 0 ? t.verniceWhite : `${t.verniceGray} ${i * 10}%`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            {/* RGB Sliders */}
            <div className="w-full flex flex-col gap-3">
              <label className="text-[10px] font-bold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>{t.verniceRgbControl}</label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold" style={{ color: "#ff6b6b", width: "20px" }}>R</span>
                <input
                  type="range" min="0" max="255"
                  value={parseInt(selectedColor?.substring(1, 3) || "0", 16)}
                  onChange={(e) => {
                    const r = parseInt(e.target.value);
                    const g = parseInt(selectedColor?.substring(3, 5) || "00", 16);
                    const b = parseInt(selectedColor?.substring(5, 7) || "00", 16);
                    const hex = rgbToHex(r, g, b);
                    setSelectedColor(hex); setHexInput(hex);
                  }}
                  className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, rgb(0,${parseInt(selectedColor?.substring(3, 5) || "0", 16)},${parseInt(selectedColor?.substring(5, 7) || "0", 16)}), rgb(255,${parseInt(selectedColor?.substring(3, 5) || "0", 16)},${parseInt(selectedColor?.substring(5, 7) || "0", 16)}))` }}
                />
                <span className="text-[10px] font-bold" style={{ color: "#aaa", width: "30px", textAlign: "right" }}>{parseInt(selectedColor?.substring(1, 3) || "0", 16)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold" style={{ color: "#51cf66", width: "20px" }}>G</span>
                <input
                  type="range" min="0" max="255"
                  value={parseInt(selectedColor?.substring(3, 5) || "0", 16)}
                  onChange={(e) => {
                    const r = parseInt(selectedColor?.substring(1, 3) || "00", 16);
                    const g = parseInt(e.target.value);
                    const b = parseInt(selectedColor?.substring(5, 7) || "00", 16);
                    const hex = rgbToHex(r, g, b);
                    setSelectedColor(hex); setHexInput(hex);
                  }}
                  className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, rgb(${parseInt(selectedColor?.substring(1, 3) || "0", 16)},0,${parseInt(selectedColor?.substring(5, 7) || "0", 16)}), rgb(${parseInt(selectedColor?.substring(1, 3) || "0", 16)},255,${parseInt(selectedColor?.substring(5, 7) || "0", 16)}))` }}
                />
                <span className="text-[10px] font-bold" style={{ color: "#aaa", width: "30px", textAlign: "right" }}>{parseInt(selectedColor?.substring(3, 5) || "0", 16)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold" style={{ color: "#4dabf7", width: "20px" }}>B</span>
                <input
                  type="range" min="0" max="255"
                  value={parseInt(selectedColor?.substring(5, 7) || "0", 16)}
                  onChange={(e) => {
                    const r = parseInt(selectedColor?.substring(1, 3) || "00", 16);
                    const g = parseInt(selectedColor?.substring(3, 5) || "00", 16);
                    const b = parseInt(e.target.value);
                    const hex = rgbToHex(r, g, b);
                    setSelectedColor(hex); setHexInput(hex);
                  }}
                  className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, rgb(${parseInt(selectedColor?.substring(1, 3) || "0", 16)},${parseInt(selectedColor?.substring(3, 5) || "0", 16)},0), rgb(${parseInt(selectedColor?.substring(1, 3) || "0", 16)},${parseInt(selectedColor?.substring(3, 5) || "0", 16)},255))` }}
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
                  if (val && !val.startsWith("#")) val = "#" + val;
                  setHexInput(val);
                  if (val.length === 7 && /^#[0-9A-F]{6}$/.test(val)) setSelectedColor(val);
                }}
                maxLength={7}
                className="flex-1 px-2 py-1 rounded-sm text-sm font-semibold outline-none"
                style={{ background: "#111", border: "1px solid rgba(201,162,39,0.3)", color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}
              />
            </div>
          </div>
          {/* Anteprima colore selezionato */}
          {selectedColor && (
            <div className="p-3 rounded-sm" style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.35)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm" style={{ background: selectedColor, border: "1px solid rgba(0,0,0,0.2)" }} />
                <div className="text-xs" style={{ color: "#aaa", fontFamily: "'Open Sans', sans-serif" }}>
                  <p style={{ color: "#c9a227" }}>{RAL_COLORS.find((c: any) => c.hex === selectedColor)?.name || "Colore personalizzato"}</p>
                  <p>{selectedColor}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <GoldDivider />

        {/* Inserisci dimensioni */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
            Inserisci dimensioni
          </label>
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1">
              <p className="text-[9px]" style={{ color: "#888", fontFamily: "'Open Sans', sans-serif" }}>Lunghezza (m)</p>
              <input
                type="number" min="0.1" step="0.1" placeholder="5"
                value={lunghezza} onChange={e => setLunghezza(e.target.value)}
                className="px-2 py-2 rounded-sm text-sm font-semibold outline-none"
                style={{ background: "#111", border: "1px solid rgba(201,162,39,0.3)", color: "#e8e8e8", fontFamily: "'Raleway', sans-serif" }}
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p className="text-[9px]" style={{ color: "#888", fontFamily: "'Open Sans', sans-serif" }}>Altezza (m)</p>
              <input
                type="number" min="0.1" step="0.1" placeholder="3"
                value={altezza} onChange={e => setAltezza(e.target.value)}
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
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px" style={{ background: "rgba(201,162,39,0.2)" }}></div>
            <p className="text-[9px] font-semibold" style={{ color: "#666", fontFamily: "'Open Sans', sans-serif" }}>O</p>
            <div className="flex-1 h-px" style={{ background: "rgba(201,162,39,0.2)" }}></div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-sm" style={{ background: "#111", border: "1px solid rgba(201,162,39,0.3)" }}>
            <input
              type="number" min="1" max="9999" placeholder="25"
              value={mq} onChange={e => setMq(e.target.value)}
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
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: "#4caf50" }}>-% </span>
                  <input type="number" min="0" max="100" value={discountPercent} onChange={e => setScontoPercent(Math.min(100, Math.max(0, Number(e.target.value))))} className="w-16 px-2 py-1 bg-[#1a1a1a] text-xs rounded-sm" style={{ color: "#4caf50", border: "1px solid rgba(76, 175, 80, 0.5)" }} />
                </div>
                {discountPercent > 0 && <p className="text-xs" style={{ color: "#4caf50" }}>Riduzione: -€{Math.round(totalMin * (discountPercent / 100))}</p>}
              </div>
            </div>
            
            {/* Lavori Supplementari */}
            <div className="p-4 rounded-sm" style={{ background: "rgba(255, 152, 0, 0.1)", border: "1px solid rgba(255, 152, 0, 0.3)" }}>
              <div className="flex flex-col gap-3">
                <p className="text-sm font-bold" style={{ color: "#ff9800", fontFamily: "'Raleway', sans-serif" }}>🔧 Lavori Supplementari</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: "#ff9800" }}>+% </span>
                  <input type="number" min="0" max="100" value={extraWorkPercent} onChange={e => setExtraWorkPercent(Math.min(100, Math.max(0, Number(e.target.value))))} className="w-16 px-2 py-1 bg-[#1a1a1a] text-xs rounded-sm" style={{ color: "#ff9800", border: "1px solid rgba(255, 152, 0, 0.5)" }} />
                </div>
                {extraWorkPercent > 0 && <p className="text-xs" style={{ color: "#ff9800" }}>Supplemento: +€{Math.round(totalMin * (extraWorkPercent / 100))}</p>}
              </div>
            </div>
            
            {(discountPercent > 0 || extraWorkPercent > 0) && (
              <div className="p-4 rounded-sm" style={{ background: "linear-gradient(135deg, rgba(201,162,39,0.3), rgba(201,162,39,0.1))", border: "2px solid rgba(201,162,39,0.5)" }}>
                <p className="text-xs font-bold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>Preventivo Finale: €{Math.round(totalMin * (1 - discountPercent / 100) * (1 + extraWorkPercent / 100))} - €{Math.round(totalMax * (1 - discountPercent / 100) * (1 + extraWorkPercent / 100))}</p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={handleSaveQuote}
                  className="flex-1 py-3.5 flex items-center justify-center gap-2 rounded-sm font-bold text-sm tracking-widest uppercase"
                  style={{ background: "#c9a227", color: "#000", fontFamily: "'Raleway', sans-serif" }}
                >
                  <Download size={18} />
                  Salva in Miei
                </button>
                <button
                  onClick={() => setShowSavedQuotes(!showSavedQuotes)}
                  className="flex-1 py-3.5 flex items-center justify-center gap-2 rounded-sm font-bold text-sm tracking-widest uppercase"
                  style={{ background: savedQuotes.length > 0 ? "rgba(201,162,39,0.2)" : "rgba(201,162,39,0.1)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.3)", fontFamily: "'Raleway', sans-serif" }}
                >
                  📋 {savedQuotes.length}
                </button>
              </div>
              <button
                onClick={handleWhatsApp}
                className="w-full py-3.5 flex items-center justify-center gap-2 rounded-sm font-bold text-sm tracking-widest uppercase"
                style={{ background: "#25D366", color: "#fff", fontFamily: "'Raleway', sans-serif" }}
              >
                <MessageCircle size={18} />
                WhatsApp
              </button>
            </div>
            
            {showSavedQuotes && savedQuotes.length > 0 && (
              <div className="p-4 rounded-sm" style={{ background: "rgba(76, 175, 80, 0.08)", border: "1px solid rgba(76, 175, 80, 0.3)" }}>
                <p className="text-sm font-bold mb-3" style={{ color: "#4caf50", fontFamily: "'Raleway', sans-serif" }}>📋 Preventivuri Salvati ({savedQuotes.length})</p>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {savedQuotes.map((quote) => (
                    <div key={quote.id} className="p-3 rounded-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(76, 175, 80, 0.2)" }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 text-xs" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                          <p style={{ color: "#c9a227", fontWeight: "bold" }}>{quote.colorName}</p>
                          <p style={{ color: "#888" }}>{quote.mq} m² • €{Math.round(parseFloat(quote.mq) * 12)} - €{Math.round(parseFloat(quote.mq) * 18)}</p>
                          <p style={{ color: "#666", fontSize: "9px" }}>{quote.date}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleLoadQuote(quote)}
                            className="px-2 py-1 text-xs rounded-sm"
                            style={{ background: "#4caf50", color: "#fff" }}
                          >
                            Carica
                          </button>
                          <button
                            onClick={() => handleDeleteQuote(quote.id)}
                            className="px-2 py-1 text-xs rounded-sm"
                            style={{ background: "#ff6b6b", color: "#fff" }}
                          >
                            Elimina
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
