import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface DropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  label?: string;
  acceptedFileTypes?: string[];
  maxFiles?: number;
  maxSize?: number;
  className?: string;
  previewUrl?: string;
  error?: string;
}

export function Dropzone({
  onDrop,
  label = 'Drag & drop image here, or click to select',
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024, // 5MB
  className,
  previewUrl,
  error,
}: DropzoneProps) {
  const [preview, setPreview] = useState<string | null>(previewUrl || null);

  const onDropCallback = useCallback(
    (acceptedFiles: File[]) => {
      onDrop(acceptedFiles);
      
      // Create preview for the first file
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        
        // Free memory when component unmounts
        return () => URL.revokeObjectURL(objectUrl);
      }
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop: onDropCallback,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    maxSize,
  });

  // Format file types for display
  const formattedFileTypes = acceptedFileTypes.map(type => 
    type.replace('image/', '').toUpperCase()
  ).join(', ');

  // Format max size for display
  const formattedMaxSize = `${Math.round(maxSize / 1024 / 1024)}MB`;

  return (
    <div className="space-y-2 w-full">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer min-h-40 flex flex-col items-center justify-center',
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          isDragReject && 'border-destructive bg-destructive/5',
          error && 'border-destructive',
          preview && 'border-primary',
          className
        )}
      >
        <input {...getInputProps()} />
        
        {preview ? (
          <div className="relative h-32 w-32 rounded-lg overflow-hidden">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <div className="text-4xl">
              {isDragReject ? '❌' : '📸'}
            </div>
            <p className="text-sm text-muted-foreground">{label}</p>
            {isDragReject && (
              <p className="text-xs text-destructive">File type not accepted or too many files</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Accepted: {formattedFileTypes} (Max: {formattedMaxSize})
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
} 