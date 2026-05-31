import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
}

/**
 * OptimizedImage component that supports WebP format with fallback
 * Automatically uses WebP if supported, falls back to original format
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  loading = 'lazy',
  width,
  height,
}) => {
  // Convert image URL to WebP if it's a JPG or PNG
  const getWebPUrl = (url: string) => {
    if (url.includes('.jpg') || url.includes('.jpeg')) {
      return url.replace(/\.(jpg|jpeg)$/i, '.webp');
    }
    if (url.includes('.png')) {
      return url.replace(/\.png$/i, '.webp');
    }
    return url;
  };

  const webpSrc = getWebPUrl(src);

  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        width={width}
        height={height}
      />
    </picture>
  );
};

export default OptimizedImage;
