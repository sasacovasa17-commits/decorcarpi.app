import { useState, useCallback, useRef, useEffect } from 'react';

interface ZoomState {
  scale: number;
  panX: number;
  panY: number;
  rotation: number;
}

export function useZoom(initialScale = 1, minScale = 0.5, maxScale = 3) {
  const [zoom, setZoom] = useState<ZoomState>({
    scale: initialScale,
    panX: 0,
    panY: 0,
    rotation: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const isPinchingRef = useRef(false);
  const initialDistanceRef = useRef(0);
  const initialScaleRef = useRef(initialScale);

  // Zoom in/out cu butoane
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => ({
      ...prev,
      scale: Math.min(prev.scale + 0.2, maxScale),
    }));
  }, [maxScale]);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => ({
      ...prev,
      scale: Math.max(prev.scale - 0.2, minScale),
    }));
  }, [minScale]);

  // Reset zoom și rotație
  const handleResetZoom = useCallback(() => {
    setZoom({
      scale: initialScale,
      panX: 0,
      panY: 0,
      rotation: 0,
    });
  }, [initialScale]);

  // Pan (drag) pe Immagine
  const handlePan = useCallback((deltaX: number, deltaY: number) => {
    setZoom((prev) => ({
      ...prev,
      panX: prev.panX + deltaX,
      panY: prev.panY + deltaY,
    }));
  }, []);

  // Pinch-to-zoom pe mobile
  const handlePinchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      isPinchingRef.current = true;
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      initialDistanceRef.current = distance;
      initialScaleRef.current = zoom.scale;
    }
  }, [zoom.scale]);

  const handlePinchMove = useCallback((e: TouchEvent) => {
    if (!isPinchingRef.current || e.touches.length !== 2) return;

    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const distance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );

    const scaleFactor = distance / initialDistanceRef.current;
    const newScale = Math.max(minScale, Math.min(maxScale, initialScaleRef.current * scaleFactor));

    setZoom((prev) => ({
      ...prev,
      scale: newScale,
    }));
  }, [minScale, maxScale]);

  const handlePinchEnd = useCallback(() => {
    isPinchingRef.current = false;
  }, []);

  // Two-finger rotate
  const initialRotationRef = useRef(0);
  const initialAngleRef = useRef(0);

  const handleRotateStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const angle = Math.atan2(
        touch2.clientY - touch1.clientY,
        touch2.clientX - touch1.clientX
      );
      initialAngleRef.current = angle;
      initialRotationRef.current = zoom.rotation;
    }
  }, [zoom.rotation]);

  const handleRotateMove = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 2) return;

    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const angle = Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    );

    const angleDiff = (angle - initialAngleRef.current) * (180 / Math.PI);
    const newRotation = (initialRotationRef.current + angleDiff) % 360;

    setZoom((prev) => ({
      ...prev,
      rotation: newRotation,
    }));
  }, []);

  // Double-tap reset zoom
  const lastTapRef = useRef(0);
  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      handleResetZoom();
    }
    lastTapRef.current = now;
  }, [handleResetZoom]);

  // Attach touch listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      handlePinchStart(e);
      handleRotateStart(e);
      handleDoubleTap();
    };

    const handleTouchMove = (e: TouchEvent) => {
      handlePinchMove(e);
      handleRotateMove(e);
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handlePinchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handlePinchEnd);
    };
  }, [handlePinchStart, handlePinchMove, handlePinchEnd, handleRotateStart, handleRotateMove, handleDoubleTap]);

  return {
    zoom,
    containerRef,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handlePan,
  };
}
