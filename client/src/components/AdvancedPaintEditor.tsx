/**
 * Advanced Paint Editor with Fabric.js
 * - Polygonal Selection Tool
 * - Paint Layer with Blending
 * - Eraser Tool with Touch Support
 */

import React, { useRef, useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { toast } from 'sonner';
import { Download, RotateCcw, Trash2, Wand2 } from 'lucide-react';

// Lazy load fabric.js to reduce initial bundle size
let fabric: any = null;
const loadFabric = async () => {
  if (!fabric) {
    fabric = await import('fabric');
  }
  return fabric;
};

interface AdvancedPaintEditorProps {
  imageUrl: string;
  selectedColor: string;
  onSave: (canvasDataUrl: string) => void;
  onClose: () => void;
}

type ToolMode = 'polygon' | 'paint' | 'eraser' | 'none';

export const AdvancedPaintEditor: React.FC<AdvancedPaintEditorProps> = ({
  imageUrl,
  selectedColor,
  onSave,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any>(null);
  const [toolMode, setToolMode] = useState<ToolMode>('polygon');
  const [polygonPoints, setPolygonPoints] = useState<any[]>([]);
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(true);
  const [paintLayer, setPaintLayer] = useState<any>(null);
  const [brushSize, setBrushSize] = useState(20);

  // Inizializza Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const initCanvas = async () => {
      const fabricLib = await loadFabric();
      const canvas = new fabricLib.Canvas(canvasRef.current!, {
        width: canvasRef.current!.parentElement?.clientWidth || 400,
        height: canvasRef.current!.parentElement?.clientHeight || 600,
        backgroundColor: '#fff',
      });

      fabricCanvasRef.current = canvas;

      // Carica imaginea
      fabricLib.Image.fromURL(imageUrl, (img: any) => {
        const maxWidth = canvas.width || 400;
        const maxHeight = canvas.height || 600;
        const scale = Math.min(maxWidth / (img.width || 400), maxHeight / (img.height || 600));

        img.scale(scale);
        img.set({ left: 0, top: 0 });
        canvas.add(img);
        canvas.renderAll();
      });
    };

    initCanvas();

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }
    };
  }, [imageUrl]);

  // Disegna punctele poligonului
  const drawPolygonPoints = useCallback(async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Rimuovi liniile anterioare
    canvas.forEachObject((obj: any) => {
      if (obj.name === 'polygon-line' || obj.name === 'polygon-point') {
        canvas.remove(obj);
      }
    });

    // Disegna liniile poligonului
    if (polygonPoints.length > 1) {
      for (let i = 0; i < polygonPoints.length - 1; i++) {
        const fabricLib = await loadFabric();
        const line = new fabricLib.Line(
          [polygonPoints[i].x, polygonPoints[i].y, polygonPoints[i + 1].x, polygonPoints[i + 1].y],
          {
            stroke: '#c9a227',
            strokeWidth: 2,
            selectable: false,
            name: 'polygon-line',
          } as any
        );
        canvas.add(line);
      }

      // Linea de la ultimul Punto la primul (închidere Poligono)
      if (polygonPoints.length > 2) {
        const fabricLib = await loadFabric();
        const closeLine = new fabricLib.Line(
          [polygonPoints[polygonPoints.length - 1].x, polygonPoints[polygonPoints.length - 1].y, polygonPoints[0].x, polygonPoints[0].y],
          {
            stroke: '#c9a227',
            strokeWidth: 2,
            selectable: false,
            name: 'polygon-line',
          } as any
        );
        canvas.add(closeLine);
      }
    }

    // Disegna punctele
    const addPoints = async () => {
      const fabricLib = await loadFabric();
      polygonPoints.forEach((point) => {
        const circle = new fabricLib.Circle({
          left: point.x - 5,
          top: point.y - 5,
          radius: 5,
          fill: '#c9a227',
          selectable: false,
          name: 'polygon-point',
        } as any);
        canvas.add(circle);
      });
    };
    addPoints();

    if (canvas) {
      canvas.renderAll();
    }
  }, [polygonPoints]);

  // Gestisci Fai clic su canvas pentru Poligono
  const handleCanvasClick = useCallback(async (e: any) => {
    if (toolMode !== 'polygon' || !isDrawingPolygon) return;

    const pointer = fabricCanvasRef.current?.getPointer(e.e as MouseEvent);
    if (!pointer) return;

    const fabricLib = await loadFabric();
    const newPoint = new fabricLib.Point(pointer.x, pointer.y);
    setPolygonPoints([...polygonPoints, newPoint]);
  }, [toolMode, isDrawingPolygon, polygonPoints]);

  // Gestisci touch events
  const handleCanvasTouch = useCallback((e: TouchEvent) => {
    if (toolMode === 'eraser') {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const touch = e.touches[0];
      const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      // Rimuovi zona din paint layer
      if (paintLayer) {
        const ctx = paintLayer.getContext();
        ctx.clearRect(x - brushSize / 2, y - brushSize / 2, brushSize, brushSize);
        canvas.renderAll();
      }
    }
  }, [toolMode, brushSize, paintLayer]);

  // Finaleizza il poligono
  const finishPolygon = useCallback(async () => {
    if (polygonPoints.length < 3) {
      toast.error('Seleziona almeno 3 punti per il poligono', {
        style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
      });
      return;
    }

    setIsDrawingPolygon(false);
    setToolMode('paint');

    // Crea paint layer
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

     // Crea canvas per paint layer
    const paintCanvas = document.createElement('canvas');
    paintCanvas.width = canvas.width || 400;
    paintCanvas.height = canvas.height || 600;
    const paintCtx = paintCanvas.getContext('2d');
    if (!paintCtx) return;

    // Disegna il poligono su paint layer
    paintCtx.fillStyle = selectedColor;
    paintCtx.globalCompositeOperation = 'multiply';
    paintCtx.beginPath();
    paintCtx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
    for (let i = 1; i < polygonPoints.length; i++) {
      paintCtx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
    }
    paintCtx.closePath();
    paintCtx.fill();

    // Aggiungi paint layer
    const fabricLib = await loadFabric();
    const paintImage = new fabricLib.Image(paintCanvas, {
      left: 0,
      top: 0,
      selectable: false,
      evented: false,
    } as any);
    canvas.add(paintImage);
    canvas.renderAll();

    // Memorizza il riferimento paint layer
    setPaintLayer(paintCanvas);

    toast.success('Poligono applicato! Ora usa la gomma per pulire.', {
      style: { background: '#1a0a0a', color: '#4caf50', border: '1px solid rgba(76,175,80,0.3)' },
    });
  }, [polygonPoints, selectedColor]);

  // Ripristina l'editor
  const handleReset = useCallback(async () => {
    setPolygonPoints([]);
    setIsDrawingPolygon(true);
    setToolMode('polygon');
    setPaintLayer(null);

    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.forEachObject((obj: any) => {
      if (obj.name === 'polygon-line' || obj.name === 'polygon-point') {
        canvas.remove(obj);
      }
    });
    canvas.renderAll();
  }, []);

  // Salva il risultato
  const handleSave = useCallback(async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onSave(dataUrl);

    toast.success('Foto salvata!', {
      style: { background: '#1a0a0a', color: '#4caf50', border: '1px solid rgba(76,175,80,0.3)' },
    });
  }, [onSave]);

  // Imposta i listener degli eventi
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.on('mouse:down', handleCanvasClick);
    const canvasElement = canvas.getElement() as HTMLCanvasElement;
    canvasElement.addEventListener('touchmove', handleCanvasTouch);

    return () => {
      canvas.off('mouse:down', handleCanvasClick);
      canvasElement.removeEventListener('touchmove', handleCanvasTouch);
    };
  }, [handleCanvasClick, handleCanvasTouch]);

  // Redraw polygon points
  useEffect(() => {
    const redraw = async () => {
      await drawPolygonPoints();
    };
    redraw();
  }, [polygonPoints, drawPolygonPoints]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col" style={{ background: '#000' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(201,162,39,0.2)' }}>
        <h2 className="text-lg font-bold" style={{ color: '#c9a227' }}>
          Editor Vopsea Avansat
        </h2>
        <button onClick={onClose} className="text-[#c9a227] text-2xl">×</button>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center overflow-auto">
        <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%' }} />
      </div>

      {/* Instrumente */}
      <div className="px-4 py-4 border-t space-y-3" style={{ borderColor: 'rgba(201,162,39,0.2)' }}>
        {/* Stato */}
        <div className="text-xs text-center" style={{ color: '#888' }}>
          {isDrawingPolygon ? (
            <span>
              {polygonPoints.length === 0 ? '👆 Fai clic sugli angoli del muro' : `✓ ${polygonPoints.length} punti - Fai clic per altri o Finalizza`}
            </span>
          ) : (
            <span>🧹 Usa la gomma per pulire i Mobili</span>
          )}
        </div>

        {/* Controale */}
        <div className="flex gap-2">
          {isDrawingPolygon ? (
            <button
              onClick={finishPolygon}
              disabled={polygonPoints.length < 3}
              className="flex-1 py-2 rounded-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: '#c9a227', color: '#000' }}
            >
              <Wand2 size={16} /> Finalizza Poligono
            </button>
          ) : (
            <>
              <button
                onClick={() => setToolMode('eraser')}
                className={`flex-1 py-2 rounded-sm font-semibold flex items-center justify-center gap-2 transition ${
                  toolMode === 'eraser' ? 'opacity-100' : 'opacity-60'
                }`}
                style={{ background: '#666' }}
              >
                🧹 Gomma
              </button>
              <input
                type="range"
                min="5"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="flex-1"
              />
            </>
          )}
        </div>

        {/* Butoane */}
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex-1 py-2 rounded-sm font-semibold flex items-center justify-center gap-2"
            style={{ background: 'rgba(255,107,107,0.2)', color: '#ff6b6b' }}
          >
            <RotateCcw size={16} /> Ripristina
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded-sm font-semibold flex items-center justify-center gap-2"
            style={{ background: '#4caf50', color: '#fff' }}
          >
            <Download size={16} /> Salva
          </button>
        </div>
      </div>
    </div>
  );
};
