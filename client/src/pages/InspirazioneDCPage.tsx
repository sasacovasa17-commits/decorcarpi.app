'use client';

import { useState, useRef, useCallback, useEffect, ChangeEvent } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Camera, Download, RotateCcw, Sparkles, ChevronLeft } from 'lucide-react';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { downloadImageWithWatermark } from '@/lib/watermark';
import { toast } from 'sonner';

// Session ID helper
function getSessionId() {
  let id = localStorage.getItem('ispirazione_session_id');
  if (!id) {
    id = `ispirazione_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('ispirazione_session_id', id);
  }
  return id;
}

// Room types
const ROOM_TYPES = [
  { id: 'living', label: 'Living' },
  { id: 'cucina', label: 'Cucina' },
  { id: 'camera', label: 'Camera' },
  { id: 'ufficio', label: 'Ufficio' },
  { id: 'ingresso', label: 'Ingresso' },
  { id: 'sala-pranzo', label: 'Sala Pranzo' },
  { id: 'bagno', label: 'Bagno' },
];

// Styles
const STYLES = [
  { id: 'rustico', label: 'Rustico' },
  { id: 'moderno', label: 'Moderno' },
  { id: 'lusso', label: 'Lusso' },
  { id: 'minimalista', label: 'Minimalista' },
  { id: 'classico', label: 'Classico Italiano' },
  { id: 'industriale', label: 'Industriale' },
];

// Lighting
const LIGHTING_OPTIONS = [
  { id: 'naturale', label: 'Naturale' },
  { id: 'calda', label: 'Calda' },
  { id: 'fredda', label: 'Fredda' },
  { id: 'neutra', label: 'Neutra' },
];

// Colors
const COLORS = [
  { id: 'beige', label: 'Beige', hex: '#F5F5DC' },
  { id: 'crema', label: 'Crema Soft', hex: '#FFFDD0' },
  { id: 'terracotta', label: 'Terracotta', hex: '#E2725B' },
  { id: 'grigio-caldo', label: 'Grigio Caldo', hex: '#A9A9A9' },
  { id: 'bianco', label: 'Bianco Crema', hex: '#FFFFF0' },
  { id: 'verde-bosco', label: 'Verde Bosco', hex: '#355E3B' },
  { id: 'bordeaux', label: 'Bordeaux', hex: '#800020' },
  { id: 'marrone-scuro', label: 'Marrone Scuro', hex: '#654321' },
  { id: 'marrone-sabbia', label: 'Marrone Sabbia', hex: '#C2B280' },
  { id: 'marrone-talpa', label: 'Marrone Talpa', hex: '#483D8B' },
  { id: 'tan-caldo', label: 'Tan Caldo', hex: '#D2B48C' },
  { id: 'rosy-brown', label: 'Rosy Brown', hex: '#BC8F8F' },
  { id: 'verde-oliva', label: 'Verde Oliva', hex: '#808000' },
  { id: 'verde-scuro', label: 'Verde Scuro', hex: '#013220' },
  { id: 'grigio-scuro', label: 'Grigio Scuro', hex: '#A9A9A9' },
  { id: 'grigio-medio', label: 'Grigio Medio', hex: '#808080' },
  { id: 'blu-petrolio', label: 'Blu Petrolio', hex: '#0A3D62' },
  { id: 'blu-grigio', label: 'Blu Grigio', hex: '#4A5859' },
  { id: 'grigio-chiaro', label: 'Grigio Chiaro', hex: '#D3D3D3' },
  { id: 'bianco-chiaro', label: 'Bianco Chiaro', hex: '#F5F5F5' },
  { id: 'oro-classico', label: 'Oro Classico', hex: '#FFD700' },
  { id: 'oro-caldo', label: 'Oro Caldo', hex: '#FFA500' },
  { id: 'oro-scuro', label: 'Oro Scuro', hex: '#B8860B' },
  { id: 'nocciola', label: 'Nocciola', hex: '#8B7355' },
  { id: 'marrone-caldo', label: 'Marrone Caldo', hex: '#A0522D' },
  { id: 'rosa-cipria', label: 'Rosa Cipria', hex: '#FDBCB4' },
  { id: 'nero-elegante', label: 'Nero Elegante', hex: '#1C1C1C' },
];

export default function InspirazioneDCPage() {
  const [, navigate] = useLocation();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const sessionId = getSessionId();

  // State
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedLighting, setSelectedLighting] = useState<string>('naturale');
  const [selectedColor, setSelectedColor] = useState<string>('beige');
  const [step, setStep] = useState<'upload' | 'options' | 'result'>('upload');
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSavedQuotes, setShowSavedQuotes] = useState(false);
  const [savedQuotes, setSavedQuotes] = useState<any[]>([]);


  // tRPC mutations
  const uploadMutation = trpc.upload.image.useMutation();
  const generateMutation = trpc.aiInteriorDesigner.generatePreview.useMutation();

  // Handle photo upload
  const handlePhotoUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Seleziona o Immagine validă', {
        style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Imaginea trebuie să fie mai mică de 10MB', {
        style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
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
          const result = await uploadMutation.mutateAsync({
            base64: base64,
            sessionId,
          });

          setUploadedPhotoUrl(result.url);
          setStep('options');
          toast.success('Fotografia încărcată cu Successo!', {
            style: { background: '#1a0a0a', color: '#c9a227', border: '1px solid rgba(201,162,39,0.3)' },
          });
        } catch (error) {
          toast.error('Errore la încărcare', {
            style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
          });
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  }, [uploadMutation, sessionId]);

  // Handle generate
  const handleGenerate = async () => {
    if (!uploadedPhotoUrl || !selectedRoomType || !selectedStyle) {
      toast.error('Completează toate opțiunile', {
        style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
      });
      return;
    }

    setIsGenerating(true);
    toast.loading('Generazione in corso inspirația...', {
      style: { background: '#1a0a0a', color: '#c9a227', border: '1px solid rgba(201,162,39,0.3)' },
    });

    try {
      const result = await generateMutation.mutateAsync({
        roomPhoto: uploadedPhotoUrl || '',
        textureType: selectedStyle || '',
        colorHex: COLORS.find(c => c.id === selectedColor)?.hex || '#F5F5DC',
        colorName: COLORS.find(c => c.id === selectedColor)?.label || 'Beige',
        wallType: selectedRoomType || '',
      });

      setGeneratedUrl(result.previewUrl || null);
      setStep('result');
      toast.success('Inspirație generată!', {
        style: { background: '#1a0a0a', color: '#c9a227', border: '1px solid rgba(201,162,39,0.3)' },
      });
    } catch (error: any) {
      toast.error(error.message || 'Errore la generare', {
        style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Download result
  const handleDownload = async () => {
    if (!generatedUrl) return;
    try {
      await downloadImageWithWatermark(generatedUrl, 'inspirazione-dc.png');
      toast.success('Imaginea descărcată!', {
        style: { background: '#1a0a0a', color: '#c9a227', border: '1px solid rgba(201,162,39,0.3)' },
      });
    } catch (error) {
      toast.error('Errore la descărcare', {
        style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
      });
    }
  };

  // Save quote to localStorage
  const handleSaveQuote = () => {
    if (!generatedUrl || !uploadedPhoto) {
      toast.error('Nessun inspirație de Salvato', {
        style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
      });
      return;
    }

    const quote = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('it-IT'),
      roomType: selectedRoomType,
      style: selectedStyle,
      lighting: selectedLighting,
      color: selectedColor,
      colorHex: COLORS.find(c => c.id === selectedColor)?.hex,
      colorName: COLORS.find(c => c.id === selectedColor)?.label,
      originalPhoto: uploadedPhoto,
      generatedUrl: generatedUrl,
    };

    const existing = JSON.parse(localStorage.getItem('ispirazione_quotes') || '[]');
    existing.push(quote);
    localStorage.setItem('ispirazione_quotes', JSON.stringify(existing));
    setSavedQuotes(existing);

    toast.success('Inspirație Salvata!', {
      style: { background: '#1a0a0a', color: '#c9a227', border: '1px solid rgba(201,162,39,0.3)' },
    });
  };

  // Load saved quotes on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('ispirazione_quotes') || '[]');
    setSavedQuotes(saved);
  }, []);

  // Delete quote
  const handleDeleteQuote = (id: number) => {
    const updated = savedQuotes.filter(q => q.id !== id);
    localStorage.setItem('ispirazione_quotes', JSON.stringify(updated));
    setSavedQuotes(updated);
    toast.success('Inspirație ștearsă', {
      style: { background: '#1a0a0a', color: '#c9a227', border: '1px solid rgba(201,162,39,0.3)' },
    });
  };

  // Reset
  const handleReset = () => {
    setUploadedPhoto(null);
    setUploadedPhotoUrl(null);
    setGeneratedUrl(null);
    setStep('upload');
    setSelectedRoomType(null);
    setSelectedStyle(null);
    setSelectedLighting('naturale');
    setSelectedColor('beige');
  };

  return (
    <div className="min-h-screen bg-black pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black border-b border-yellow-700/30 px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="text-yellow-600 hover:text-yellow-500">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-yellow-600">✨ Ispirazione D.C.</h1>
          <div className="w-6" />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Steps */}
        <div className="flex justify-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 'upload' ? 'bg-yellow-600 text-black' : 'bg-yellow-700 text-yellow-300'}`}>1</div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 'options' ? 'bg-yellow-600 text-black' : 'bg-yellow-700 text-yellow-300'}`}>2</div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 'result' ? 'bg-yellow-600 text-black' : 'bg-yellow-700 text-yellow-300'}`}>3</div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 'result' ? 'bg-yellow-600 text-black' : 'bg-yellow-700 text-yellow-300'}`}>4</div>
        </div>

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="space-y-4 animate-slideInStep">
            <h2 className="text-center text-yellow-600 font-bold text-lg">✨ ISPIRAZIONE D.C.</h2>
            <p className="text-center text-yellow-600 text-sm">Carica una Foto e scopri le ispirazioni</p>

            {/* Upload Box - Gallery */}
            <label className="w-full border-2 border-dashed border-yellow-600/50 rounded-lg p-8 text-center cursor-pointer hover:border-yellow-600 transition bg-transparent block">
              <Camera className="mx-auto mb-4 text-yellow-600" size={40} />
              <p className="text-yellow-600 font-semibold">Carica una Foto</p>
              <p className="text-gray-400 text-sm">Tocca per selecta din galerie</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
                className="hidden"
              />
            </label>

            {/* Upload Box - Camera */}
            <label className="w-full bg-yellow-600/30 border border-yellow-600/60 text-yellow-500 py-3 rounded-lg hover:bg-yellow-600/40 transition block cursor-pointer font-semibold">
              📸 Scatta o Foto cu fotocamera
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
                className="hidden"
              />
            </label>

            {/* Saved Quotes Button */}
            <button
              onClick={() => setShowSavedQuotes(true)}
              className="w-full bg-yellow-600/30 border border-yellow-600/60 text-yellow-500 py-3 rounded-lg hover:bg-yellow-600/40 transition font-semibold"
            >
              📋 Preventivi Salvati
            </button>
          </div>
        )}

        {/* Options Step */}
        {step === 'options' && uploadedPhoto && (
          <div className="space-y-6 animate-slideInStep">
            {/* Preview */}
            <div className="rounded-lg overflow-hidden border border-yellow-600/30">
              <img src={uploadedPhoto} alt="Preview" className="w-full h-48 object-cover" />
            </div>

            {/* Room Type */}
            <div>
              <p className="text-yellow-600 font-semibold mb-3">TIPO DI STANZA</p>
              <div className="grid grid-cols-3 gap-2">
                {ROOM_TYPES.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomType(room.id)}
                    className={`py-2 px-3 rounded text-sm font-semibold transition ${
                      selectedRoomType === room.id
                        ? 'bg-yellow-600 text-black'
                        : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-yellow-600'
                    }`}
                  >
                    {room.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div>
              <p className="text-yellow-600 font-semibold mb-3">STILE</p>
              <div className="grid grid-cols-3 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStyle(s.id)}
                    className={`py-2 px-3 rounded text-sm font-semibold transition ${
                      selectedStyle === s.id
                        ? 'bg-yellow-600 text-black'
                        : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-yellow-600'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lighting */}
            <div>
              <p className="text-yellow-600 font-semibold mb-3">ILLUMINAZIONE</p>
              <div className="grid grid-cols-4 gap-2">
                {LIGHTING_OPTIONS.map((light) => (
                  <button
                    key={light.id}
                    onClick={() => setSelectedLighting(light.id)}
                    className={`py-2 px-3 rounded text-sm font-semibold transition ${
                      selectedLighting === light.id
                        ? 'bg-yellow-600 text-black'
                        : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-yellow-600'
                    }`}
                  >
                    {light.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <p className="text-yellow-600 font-semibold mb-3">◆ PREFERITO</p>
              <div className="grid grid-cols-7 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className={`w-10 h-10 rounded-full transition border-2 ${
                      selectedColor === color.id ? 'border-yellow-400' : 'border-gray-600'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedRoomType || !selectedStyle}
              className="w-full bg-yellow-600 text-black py-3 rounded-lg font-bold hover:bg-yellow-500 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              <Sparkles size={20} />
              {isGenerating ? 'Generando...' : 'Genera Ispirazione'}
            </button>
          </div>
        )}

        {/* Result Step */}
        {step === 'result' && generatedUrl && (
          <div className="space-y-4 animate-slideInStep">
            <h3 className="text-yellow-600 font-bold text-lg text-center">
              Inspirazione Generata
            </h3>

            {/* Before/After Slider */}
            <div className="rounded-lg overflow-hidden border border-yellow-600/30 animate-fadeInImage">
              {uploadedPhoto && generatedUrl && (
                <BeforeAfterSlider beforeImage={uploadedPhoto} afterImage={generatedUrl} textureName="Inspirazione Generata" />
              )}
            </div>



            {/* Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleSaveQuote}
                className="w-full bg-yellow-600 text-black py-3 rounded-lg font-bold hover:bg-yellow-500 transition flex items-center justify-center gap-2 button-glow"
              >
                💾 Salva Inspirazione
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-yellow-600 text-black py-3 rounded-lg font-bold hover:bg-yellow-500 transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Scarica Immagine
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gray-800 text-yellow-600 py-3 rounded-lg font-bold hover:bg-gray-700 transition flex items-center justify-center gap-2"
                >
                  <RotateCcw size={20} />
                  Prova di Nuovo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Saved Quotes Modal */}
        {showSavedQuotes && (
          <div className="fixed inset-0 bg-black/80 flex items-end z-50">
            <div className="w-full bg-black border-t border-yellow-600/30 rounded-t-lg p-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-yellow-600 font-bold text-lg">Preventivi Salvati ({savedQuotes.length})</h2>
                <button
                  onClick={() => setShowSavedQuotes(false)}
                  className="text-yellow-600 hover:text-yellow-500 text-2xl"
                >
                  ×
                </button>
              </div>

              {savedQuotes.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nessuna inspirazione salvata</p>
              ) : (
                <div className="space-y-3">
                  {savedQuotes.map((quote: any) => (
                    <div key={quote.id} className="bg-gray-900 border border-yellow-600/30 rounded-lg p-3">
                      <div className="flex gap-3">
                        <img src={quote.generatedUrl} alt="Preview" className="w-20 h-20 object-cover rounded" />
                        <div className="flex-1">
                          <p className="text-yellow-600 font-semibold text-sm">{quote.style}</p>
                          <p className="text-gray-400 text-xs">{quote.timestamp}</p>
                          <p className="text-gray-400 text-xs">Stanza: {quote.roomType}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => {
                            setUploadedPhoto(quote.originalPhoto);
                            setGeneratedUrl(quote.generatedUrl);
                            setStep('result');
                            setShowSavedQuotes(false);
                          }}
                          className="flex-1 bg-yellow-600/20 text-yellow-600 py-2 rounded text-sm hover:bg-yellow-600/30 transition"
                        >
                          Vizualizare
                        </button>
                        <button
                          onClick={() => handleDeleteQuote(quote.id)}
                          className="flex-1 bg-red-600/20 text-red-600 py-2 rounded text-sm hover:bg-red-600/30 transition"
                        >
                          Sterge
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
