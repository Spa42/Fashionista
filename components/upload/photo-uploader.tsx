import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone'; // Import directly for more control
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { validateImage, validateDescription, ACCEPTABLE_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/lib/validation';
import { CheckCircle2, AlertCircle, UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface UploadedPhoto {
  id: string; // Add an id for key prop
  file: File;
  preview: string;
  error?: string;
}

interface PhotoUploaderProps {
  onPhotosComplete: (data: { photos: File[]; description: string }) => void;
  disabled?: boolean;
}

const MAX_FILES = 3;

export function PhotoUploader({ onPhotosComplete, disabled = false }: PhotoUploaderProps) {
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [characterCount, setCharacterCount] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setFormError(null); // Clear general form error on new drop
    let newPhotos: UploadedPhoto[] = [...uploadedPhotos];
    let fileErrors: string[] = [];

    acceptedFiles.forEach(file => {
      if (newPhotos.length >= MAX_FILES) {
          fileErrors.push(`Maximum ${MAX_FILES} photos allowed.`);
          return; // Skip if max files reached
      }
      const validation = validateImage(file);
      const photoId = `${file.name}-${file.lastModified}-${file.size}`;
      if (validation.isValid) {
        // Prevent duplicates based on id
        if (!newPhotos.some(p => p.id === photoId)) {
            newPhotos.push({ 
                id: photoId,
                file, 
                preview: URL.createObjectURL(file) 
            });
        }
      } else {
        fileErrors.push(`${file.name}: ${validation.error}`);
      }
    });

    fileRejections.forEach((rejection: any) => {
        fileErrors.push(`${rejection.file.name}: ${rejection.errors[0].message}`);
    });

    setUploadedPhotos(newPhotos);

    if (fileErrors.length > 0) {
        setFormError(fileErrors.join(' \n'));
    } 

  }, [uploadedPhotos]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTABLE_IMAGE_TYPES.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: MAX_IMAGE_SIZE,
    maxFiles: MAX_FILES, // Can technically drop more, but we handle limit in onDrop
    disabled: disabled || uploadedPhotos.length >= MAX_FILES
  });

  const removePhoto = (idToRemove: string) => {
    setUploadedPhotos(prev => {
        const photoToRemove = prev.find(p => p.id === idToRemove);
        if (photoToRemove?.preview) {
            URL.revokeObjectURL(photoToRemove.preview);
        }
        return prev.filter(photo => photo.id !== idToRemove);
    });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
    setCharacterCount(newDescription.length);
    const validation = validateDescription(newDescription);
    setDescriptionError(validation.isValid ? null : (validation.error ?? null));
    if (validation.isValid && formError === 'Description is required if no photos are uploaded.') {
        setFormError(null); // Clear form error if description becomes valid
    }
  };

  const handleSubmit = () => {
    const isDescriptionProvided = description.trim().length > 0;
    const arePhotosProvided = uploadedPhotos.length > 0;
    const isDescriptionValid = !descriptionError;

    // Reset general form error
    setFormError(null);

    if (!arePhotosProvided && !isDescriptionProvided) {
      setFormError('Please upload at least one photo or provide a description.');
      return;
    }

    if (isDescriptionProvided && !isDescriptionValid) {
      setFormError('Please correct the error in the description.');
      // Focus the textarea or indicate error visually
      return;
    }
    
    // Validation passed
    onPhotosComplete({
      photos: uploadedPhotos.map(p => p.file),
      description
    });
  };

  const canSubmit = (!disabled && (uploadedPhotos.length > 0 || (description.trim().length > 0 && !descriptionError)));

  return (
    <div className="space-y-6">
      {/* Combined Dropzone and Photo Preview Area */} 
      <div>
        <Label>Upload Photos (Optional, up to {MAX_FILES})</Label>
        <div 
            {...getRootProps()} 
            className={cn(
                "mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
                (disabled || uploadedPhotos.length >= MAX_FILES) && "cursor-not-allowed opacity-60",
                formError && (formError.includes('photo') || formError.startsWith('Please upload')) && "border-destructive"
            )}
        >
          <input {...getInputProps()} />
          {uploadedPhotos.length === 0 ? (
            <div className="flex flex-col items-center text-muted-foreground">
                <UploadCloud className="w-10 h-10 mb-2" />
                <p className="font-medium">
                    {isDragActive ? 'Drop photos here...' : `Drag & drop photos or click to select`}
                </p>
                <p className="text-xs mt-1">Max {MAX_FILES} files (PNG, JPG, WEBP), up to {MAX_IMAGE_SIZE / (1024 * 1024)}MB each</p>
            </div>
           ) : (
            // Show thumbnails when photos are present
            <div className="grid grid-cols-3 gap-4">
                 {uploadedPhotos.map(photo => (
                    <div key={photo.id} className="relative aspect-square rounded-md overflow-hidden border">
                        <Image 
                            src={photo.preview}
                            alt={`Photo preview ${photo.file.name}`}
                            fill
                            className="object-cover"
                        />
                        <Button 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-1 right-1 rounded-full p-1 h-6 w-6 z-10 opacity-80 hover:opacity-100" 
                            onClick={(e) => { e.stopPropagation(); removePhoto(photo.id); }}
                            disabled={disabled}
                        >
                            <X className="h-4 w-4"/>
                        </Button>
                    </div>
                ))}
                {/* Placeholder for adding more if below max */}
                {uploadedPhotos.length < MAX_FILES && (
                    <div className="aspect-square rounded-md border border-dashed flex flex-col items-center justify-center text-muted-foreground bg-secondary/50 hover:bg-secondary/70">
                        <ImageIcon className="w-8 h-8 mb-1"/>
                        <span className="text-xs">Add more</span>
                    </div>
                )}
            </div>
          )}
        </div>
         {uploadedPhotos.length >= MAX_FILES && (
            <p className="text-xs text-muted-foreground mt-2 text-center">Maximum {MAX_FILES} photos uploaded.</p>
         )}
      </div>

      {/* Description Textarea - Always visible */}
      <div className="mt-6">
        <div className="flex justify-between mb-2 items-center">
          <Label htmlFor="description">Skin Concerns (Optional)</Label>
          <span className={`text-xs ${characterCount > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {characterCount}/500
          </span>
        </div>
        <Textarea
          id="description"
          placeholder="Describe any specific skin concerns (e.g., acne, dryness...)"
          value={description}
          onChange={handleDescriptionChange}
          rows={3}
          maxLength={500}
          className={cn("text-sm", descriptionError && "border-destructive")}
          disabled={disabled}
        />
        {descriptionError && (
            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3"/> {descriptionError}
            </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">Describe your concerns if you're not uploading photos, or add details.</p>
      </div>

      {/* Submit Button */} 
      <div className="flex flex-col items-center mt-6 space-y-2">
        {formError && (
            <p className="text-sm text-destructive flex items-center gap-1 text-center">
                <AlertCircle className="w-4 h-4 flex-shrink-0"/> {formError}
            </p>
        )}
        <Button 
          variant="gradient" 
          size="lg" 
          onClick={handleSubmit}
          disabled={!canSubmit || disabled}
          className="w-full sm:w-auto"
        >
          {disabled ? 'Processing...' : 'Get AI Analysis'}
        </Button>
      </div>
    </div>
  );
}