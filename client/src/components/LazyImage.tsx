/**
 * LazyImage Component - Optimized Image Loading with Intersection Observer
 * Loads images only when they become visible in viewport
 */

import { useEffect, useRef, useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  placeholder?: string;
}

export function LazyImage({ 
  src, 
  alt, 
  className = '', 
  style = {}, 
  width, 
  height,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23222" width="400" height="300"/%3E%3C/svg%3E'
}: LazyImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = src;
            img.onload = () => setIsLoaded(true);
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-75'}`}
      style={style}
      width={width}
      height={height}
      loading="lazy"
    />
  );
}
