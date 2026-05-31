import { ArrowLeft, Download, MessageCircle, Camera, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useState, useRef, useCallback, useEffect } from 'react';

import { LazyImage } from '@/components/LazyImage';
import { trpc } from '@/lib/trpc';
import { downloadImageWithWatermark } from '@/lib/watermark';

// GoldDivider Component
function GoldDivider() {
  return <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #c9a227, transparent)", opacity: 0.4 }} />;
}

// Texture interface
interface Texture {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  promptKeyword?: string;
  category?: string;
}

// Session ID helper
function getSessionId() {
  let id = localStorage.getItem('fotografia_session_id');
  if (!id) {
    id = `fotografia_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('fotografia_session_id', id);
  }
  return id;
}

export function FotografaScreen({ onBack }: { onBack: () => void }) {
  const { currentColorTheme } = useTheme();
  const { t } = useTranslation();
  
  // --- State ---
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTexture, setSelectedTexture] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(80);
  const [opacity, setOpacity] = useState(100);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [step, setStep] = useState<'upload' | 'texture' | 'result'>('upload');
  const [savedQuotes, setSavedQuotes] = useState<any[]>([]);
  const [showSavedQuotes, setShowSavedQuotes] = useState(false);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const sessionId = getSessionId();

  // tRPC queries and mutations
  const { data: textures = [] } = trpc.textures.list.useQuery();
  const uploadPhotoMutation = trpc.fotografia.uploadPhoto.useMutation();
  const applyTextureMutation = trpc.fotografia.applyTexture.useMutation();

  // Load saved quotes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('fotografiaQuotes');
    if (saved) {
      try {
        setSavedQuotes(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved quotes:', e);
      }
    }
  }, []);

  // Handle photo upload
  const handlePhotoUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Seleziona o Immagine validă", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imaginea trebuie să fie mai mică de 10MB", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setUploadedPhoto(base64);

        try {
          const result = await uploadPhotoMutation.mutateAsync({
            photoBase64: base64,
            sessionId,
          });
          setUploadedPhotoUrl(result.url);
          setStep('texture');
          toast.success("Immagine încărcată cu Successo!", {
            style: { background: "#1a0a0a", color: "#4caf50", border: "1px solid rgba(76,175,80,0.3)" },
          });
        } catch (err: any) {
          toast.error(err?.message || "Errore la încărcare", {
            style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
          });
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error("Errore la procesare Immagine", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
      setIsUploading(false);
    }
  }, [uploadPhotoMutation, sessionId]);

  // Handle apply texture
  const handleApplyTexture = useCallback(async () => {
    if (!uploadedPhotoUrl || !selectedTexture) {
      toast.error("Seleziona o textură", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
      return;
    }

    const texture = textures.find((t: Texture) => t.id === selectedTexture);
    if (!texture) return;

    setIsApplying(true);
    const toastId = toast.loading("🎨 Generazione in corso preview-ul textureii... (Aceasta poate dura 30-60 de secunde)", {
      style: { background: "#1a0a0a", color: "#c9a227", border: "1px solid rgba(201,162,39,0.3)" },
    });

    try {
      const result = await applyTextureMutation.mutateAsync({
        originalImageUrl: uploadedPhotoUrl,
        textureId: selectedTexture,
        textureName: texture.name,
        intensity,
        opacity,
        sessionId,
      });

      setResultUrl(result.url || null);
      setStep('result');
      toast.success("✓ Textură aplicată cu Successo!", {
        style: { background: "#1a0a0a", color: "#4caf50", border: "1px solid rgba(76,175,80,0.3)" },
      });
      toast.dismiss(toastId);
    } catch (err: any) {
      const errorMsg = err?.message || "Errore la aplicare textură";
      toast.error(errorMsg, {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
      toast.dismiss(toastId);
      console.error("[applyTexture Error]", err);
    } finally {
      setIsApplying(false);
    }
  }, [uploadedPhotoUrl, selectedTexture, intensity, opacity, textures, applyTextureMutation, sessionId]);

  // Handle save quote
  const handleSaveQuote = useCallback(() => {
    if (!resultUrl || !selectedTexture) return;

    const texture = textures.find((t: Texture) => t.id === selectedTexture);
    const quote = {
      id: `foto_${Date.now()}`,
      textureId: selectedTexture,
      textureName: texture?.name || 'Unknown',
      intensity,
      opacity,
      imageUrl: resultUrl,
      date: new Date().toLocaleDateString('it-IT'),
    };

    const updated = [...savedQuotes, quote];
    setSavedQuotes(updated);
    localStorage.setItem('fotografiaQuotes', JSON.stringify(updated));
    
    toast.success("Preventivo Salvato!", {
      style: { background: "#1a0a0a", color: "#4caf50", border: "1px solid rgba(76,175,80,0.3)" },
    });
  }, [resultUrl, selectedTexture, intensity, opacity, textures, savedQuotes]);

  // Handle load quote
  const handleLoadQuote = useCallback((quote: any) => {
    setSelectedTexture(quote.textureId);
    setIntensity(quote.intensity);
    setOpacity(quote.opacity);
    setResultUrl(quote.imageUrl);
    setStep('result');
    setShowSavedQuotes(false);
  }, []);

  // Handle delete quote
  const handleDeleteQuote = useCallback((quoteId: string) => {
    const updated = savedQuotes.filter((q: any) => q.id !== quoteId);
    setSavedQuotes(updated);
    localStorage.setItem('fotografiaQuotes', JSON.stringify(updated));
  }, [savedQuotes]);

  // Handle download result
  const handleDownloadResult = useCallback(async () => {
    if (!resultUrl) return;
    try {
      await downloadImageWithWatermark(resultUrl, `fotografia-${Date.now()}.jpg`);
    } catch (err) {
      toast.error("Errore la descărcare", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
    }
  }, [resultUrl]);

  // Handle export PDF
  const handleExportPDF = useCallback(async () => {
    if (!resultUrl || !selectedTexture) return;
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF('p', 'mm', 'a4');
      const texture = textures.find((t: Texture) => t.id === selectedTexture);
      
      // Header
      doc.setFillColor(10, 10, 10);
      doc.rect(0, 0, 210, 297, 'F');
      
      doc.setTextColor(201, 162, 39);
      doc.setFontSize(22);
      doc.text('DECOR CARPI', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('Visualizzatore AI Texture', 105, 28, { align: 'center' });
      
      // Info
      doc.setFontSize(12);
      doc.setTextColor(232, 232, 232);
      doc.text(`Textură: ${texture?.name || 'Unknown'}`, 20, 45);
      doc.text(`Intensitate: ${intensity}%`, 20, 55);
      doc.text(`Opacitate: ${opacity}%`, 20, 65);
      doc.text(`Data: ${new Date().toLocaleDateString('it-IT')}`, 20, 75);
      
      // Image
      try {
        const response = await fetch(resultUrl);
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
      
      doc.save(`Fotografia-Texture-${texture?.name || 'texture'}-${Date.now()}.pdf`);
      toast.success("PDF esportato con successo!", {
        style: { background: "#1a0a0a", color: "#4caf50", border: "1px solid rgba(76,175,80,0.3)" },
      });
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error("Errore nell'esportazione PDF", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
    }
  }, [resultUrl, selectedTexture, intensity, opacity, textures]);

  // Handle WhatsApp share
  const handleWhatsAppShare = useCallback(() => {
    if (!resultUrl || !selectedTexture) return;
    
    const texture = textures.find((t: Texture) => t.id === selectedTexture);
    const msg = `Ciao Decor Carpi! Ho usato il vostro visualizzatore AI per la texture.\n\n🎨 Texture: ${texture?.name}\n🏠 Intensità: ${intensity}%\n✨ Opacità: ${opacity}%\n\n📸 Risultato: ${resultUrl}\n\nVorrei un preventivo per questo lavoro. Grazie!`;
    window.open(`https://wa.me/393343600932?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  }, [resultUrl, selectedTexture, intensity, opacity, textures]);

  // Handle reset
  const handleReset = useCallback(() => {
    setUploadedPhoto(null);
    setUploadedPhotoUrl(null);
    setSelectedTexture(null);
    setIntensity(80);
    setOpacity(100);
    setResultUrl(null);
    setStep('upload');
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0a0a", color: "#fff" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "rgba(201,162,39,0.2)" }}>
        <button onClick={onBack} className="p-2 hover:bg-gray-900 rounded-lg">
          <ArrowLeft size={20} style={{ color: "#c9a227" }} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
          Fotografia
        </h1>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {/* Title Section */}
        <div className="text-center">
          <h2 className="text-sm font-bold tracking-widest uppercase" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
            📸 Aplicator Texturi
          </h2>
          <p className="text-xs mt-1" style={{ color: "#888", fontFamily: "'Open Sans', sans-serif" }}>
            Carica o Foto și proba texturile
          </p>
        </div>

        <GoldDivider />

        {/* Steps */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: i <= (step === 'upload' ? 1 : step === 'texture' ? 2 : 3) ? "#c9a227" : "rgba(201,162,39,0.2)",
                color: i <= (step === 'upload' ? 1 : step === 'texture' ? 2 : 3) ? "#000" : "#888",
              }}
            >
              {i}
            </div>
          ))}
        </div>

        {/* Upload Section */}
        {step === 'upload' && (
          <>
            <div
              className="p-6 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-900 transition"
              style={{ borderColor: "rgba(201,162,39,0.3)", background: "rgba(201,162,39,0.05)" }}
              onClick={() => galleryInputRef.current?.click()}
            >
              <Upload size={32} style={{ color: "#c9a227" }} />
              <p style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
                Carica o Foto
              </p>
              <p style={{ color: "#888", fontSize: "12px" }}>
                Toca pentru a selecta din galerie
              </p>
            </div>

            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2"
              style={{ background: "rgba(201,162,39,0.15)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.3)" }}
            >
              <Camera size={16} />
              Scatta o Foto cu fotocamera
            </button>

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
            />
          </>
        )}

        {/* Texture Selection */}
        {step === 'texture' && uploadedPhotoUrl && (
          <>
            <div className="rounded-lg overflow-hidden" style={{ border: "2px solid rgba(201,162,39,0.4)" }}>
              <img src={uploadedPhotoUrl} alt="Fotografia" className="w-full h-auto object-cover" />
            </div>

            <div>
              <label className="text-xs font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
                Seleziona Textură
              </label>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {textures.map((texture: Texture) => (
                  <button
                    key={texture.id}
                    onClick={() => setSelectedTexture(texture.id)}
                    className="relative rounded-lg overflow-hidden transition-all hover:scale-105 aspect-square"
                    style={{
                      border: `2px solid ${selectedTexture === texture.id ? "#c9a227" : "rgba(201,162,39,0.3)"}`,
                      opacity: selectedTexture === texture.id ? 1 : 0.8,
                    }}
                  >
                    {texture.imageUrl && (
                      <img
                        src={texture.imageUrl}
                        alt={texture.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 flex items-end justify-start p-2 bg-gradient-to-t from-black/70 to-transparent">
                      <p className="text-xs font-semibold text-white" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
                        {texture.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity Slider */}
            <div>
              <label className="text-xs font-bold" style={{ color: "#c9a227" }}>
                Intensitate: {intensity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>

            {/* Opacity Slider */}
            <div>
              <label className="text-xs font-bold" style={{ color: "#c9a227" }}>
                Opacitate: {opacity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>

            <button
              ref={(el) => {
                if (el && step === 'texture') {
                  setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleApplyTexture();
              }}
              disabled={isApplying || !selectedTexture}
              className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 mt-4"
              style={{ background: "#c9a227", color: "#000" }}
            >
              {isApplying ? <Loader2 size={16} className="animate-spin" /> : null}
              {isApplying ? "Applicazione in corso..." : "Aplica Textură"}
            </button>
          </>
        )}

        {/* Result Section */}
        {step === 'result' && resultUrl && (
          <>
            <div className="rounded-lg overflow-hidden" style={{ border: "2px solid rgba(201,162,39,0.4)" }}>
              <img src={resultUrl} alt="Rezultat" className="w-full h-auto object-cover animate-fadeIn" />
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleDownloadResult}
                className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 text-sm"
                style={{ background: "#c9a227", color: "#000" }}
              >
                <Download size={16} />
                Descarca Immagine
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
                style={{ background: "#25D366", color: "#fff" }}
              >
                <MessageCircle size={16} />
                Invia su WhatsApp
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep('texture')}
                className="flex-1 py-2 rounded-lg text-xs font-semibold"
                style={{ background: "rgba(201,162,39,0.1)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.2)" }}
              >
                Proba altă textură
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2 rounded-lg text-xs font-semibold"
                style={{ background: "rgba(255,255,255,0.03)", color: "#888", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                Noua Foto
              </button>
            </div>

            <button
              onClick={handleSaveQuote}
              className="w-full py-2 rounded-lg text-xs font-semibold"
              style={{ background: "rgba(201,162,39,0.1)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.2)" }}
            >
              📋 Salva in Miei
            </button>
          </>
        )}

        {/* Saved Quotes */}
        {showSavedQuotes && savedQuotes.length > 0 && (
          <div className="p-3 rounded-lg" style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.2)" }}>
            <h3 className="text-xs font-bold mb-2" style={{ color: "#c9a227" }}>
              Preventivi Salvati
            </h3>
            <div className="space-y-2">
              {savedQuotes.map((quote: any) => (
                <div key={quote.id} className="flex justify-between items-center p-2 rounded" style={{ background: "rgba(201,162,39,0.05)" }}>
                  <div className="text-xs">
                    <p style={{ color: "#c9a227" }}>{quote.textureName}</p>
                    <p style={{ color: "#888" }}>{quote.date}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleLoadQuote(quote)}
                      className="px-2 py-1 text-xs rounded"
                      style={{ background: "#c9a227", color: "#000" }}
                    >
                      Carica
                    </button>
                    <button
                      onClick={() => handleDeleteQuote(quote.id)}
                      className="px-2 py-1 text-xs rounded"
                      style={{ background: "rgba(255,107,107,0.2)", color: "#ff6b6b" }}
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {savedQuotes.length > 0 && (
          <button
            onClick={() => setShowSavedQuotes(!showSavedQuotes)}
            className="w-full py-2 rounded-lg text-xs font-semibold"
            style={{ background: "rgba(201,162,39,0.1)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.2)" }}
          >
            📋 Preventivi Salvati ({savedQuotes.length})
          </button>
        )}
      </div>
    </div>
  );
}
