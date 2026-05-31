/**
 * BatchImageUpload Component - Upload multiple texture images at once
 */

import { useState, useRef } from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export function BatchImageUpload() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const newImages = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending' as const,
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) URL.revokeObjectURL(image.preview);
      return prev.filter((img) => img.id !== id);
    });
  };

  const uploadImages = async () => {
    // Implementare batch upload logic
    const uploadPromises = images.map(async (image) => {
      try {
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id ? { ...img, status: 'uploading' as const } : img
          )
        );

        // Emulazione upload (in produzione, sarebbe una chiamata API)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id ? { ...img, status: 'success' as const } : img
          )
        );
      } catch (error) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : 'Upload failed',
                }
              : img
          )
        );
      }
    });

    await Promise.all(uploadPromises);
    console.log('Batch upload completed');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg border border-border">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Upload Multiple Textures</h2>

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-accent/10 transition"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 mx-auto mb-3 text-amber-600" />
        <p className="text-lg font-semibold text-foreground mb-2">Drag and drop images here</p>
        <p className="text-sm text-muted-foreground">o clicca per selezionare file</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            {images.length} image{images.length !== 1 ? 's' : ''} selected
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.preview}
                  alt="preview"
                  className="w-full h-40 object-cover rounded-lg border border-border"
                />

                {/* Stato Overlay */}
                {image.status === 'success' && (
                  <div className="absolute inset-0 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                )}

                {image.status === 'uploading' && (
                  <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {image.status === 'error' && (
                  <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-red-600 font-semibold">{image.error}</span>
                  </div>
                )}

                {/* Pulsante Rimuovi */}
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* File Name */}
                <p className="text-xs text-muted-foreground mt-2 truncate">{image.file.name}</p>
              </div>
            ))}
          </div>

          {/* Pulsanti Azione */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={uploadImages}
              disabled={images.length === 0 || images.some((img) => img.status === 'uploading')}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
            >
              Upload All ({images.length})
            </Button>
            <Button
              variant="outline"
              onClick={() => setImages([])}
              disabled={images.length === 0}
            >
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
