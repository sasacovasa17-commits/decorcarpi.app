import { useState, useRef, useCallback, useEffect } from 'react';

interface PanZoomState {
  zoom: number;
  panX: number;
  panY: number;
}

export const usePanZoom = (initialZoom = 1, minZoom = 0.5, maxZoom = 3) => {
  const [state, setState] = useState<PanZoomState>({
    zoom: initialZoom,
    panX: 0,
    panY: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchDistanceRef = useRef(0);
  const isPanningRef = useRef(false);
  const lastPanRef = useRef({ x: 0, y: 0 });

  // Zoom in
  const zoomIn = useCallback(() => {
    setState((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom + 0.2, maxZoom),
    }));
  }, [maxZoom]);

  // Zoom out
  const zoomOut = useCallback(() => {
    setState((prev) => ({
      ...prev,
      zoom: Math.max(prev.zoom - 0.2, minZoom),
    }));
  }, [minZoom]);

  // Reset zoom and pan
  const reset = useCallback(() => {
    setState({
      zoom: initialZoom,
      panX: 0,
      panY: 0,
    });
  }, [initialZoom]);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  }, [zoomIn, zoomOut]);

  // Handle mouse pan
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      isPanningRef.current = true;
      lastPanRef.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanningRef.current) return;

    const deltaX = e.clientX - lastPanRef.current.x;
    const deltaY = e.clientY - lastPanRef.current.y;

    setState((prev) => ({
      ...prev,
      panX: prev.panX + deltaX,
      panY: prev.panY + deltaY,
    }));

    lastPanRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
  }, []);

  // Handle touch pinch zoom
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const scale = distance / lastTouchDistanceRef.current;

      if (scale > 1.05) {
        zoomIn();
        lastTouchDistanceRef.current = distance;
      } else if (scale < 0.95) {
        zoomOut();
        lastTouchDistanceRef.current = distance;
      }
    }
  }, [zoomIn, zoomOut]);

  // Handle double tap zoom
  const handleDoubleClick = useCallback(() => {
    if (state.zoom > initialZoom) {
      reset();
    } else {
      zoomIn();
    }
  }, [state.zoom, initialZoom, reset, zoomIn]);

  // Attach event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseUp);
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('dblclick', handleDoubleClick);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, handleTouchStart, handleTouchMove, handleDoubleClick]);

  return {
    ...state,
    containerRef,
    zoomIn,
    zoomOut,
    reset,
    transform: `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`,
  };
};
