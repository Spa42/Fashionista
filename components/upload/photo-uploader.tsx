import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { validateImage, validateDescription, ACCEPTABLE_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/lib/validation';
import { CheckCircle2, AlertCircle, UploadCloud, X, Image as ImageIcon, Camera } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface UploadedPhoto {
  id: string;
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
    setFormError(null);
    let newPhotos: UploadedPhoto[] = [...uploadedPhotos];
    let fileErrors: string[] = [];

    acceptedFiles.forEach(file => {
      if (newPhotos.length >= MAX_FILES) {
          fileErrors.push(`Maximum ${MAX_FILES} photos allowed.`);
          return;
      }
      const validation = validateImage(file);
      const photoId = `${file.name}-${file.lastModified}-${file.size}`;
      if (validation.isValid) {
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
    maxFiles: MAX_FILES,
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
        setFormError(null);
    }
  };

  const handleSubmit = () => {
    const isDescriptionProvided = description.trim().length > 0;
    const arePhotosProvided = uploadedPhotos.length > 0;
    const isDescriptionValid = !descriptionError;

    setFormError(null);

    if (!arePhotosProvided && !isDescriptionProvided) {
      setFormError('Please upload at least one photo or provide a description of your skin concerns.');
      return;
    }

    if (isDescriptionProvided && !isDescriptionValid) {
      setFormError('Please correct the error in the description.');
      return;
    }
    
    onPhotosComplete({
      photos: uploadedPhotos.map(p => p.file),
      description
    });
  };

  const canSubmit = (!disabled && (uploadedPhotos.length > 0 || (description.trim().length > 0 && !descriptionError)));

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Camera className="w-4 h-4 mr-1.5" /> Photos of Your Skin Concerns
        </h3>
        
        <div 
          {...getRootProps()} 
          className={cn(
            "border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors bg-white",
            isDragActive ? "border-maroon bg-maroon/5" : "border-gray-300 hover:border-maroon/50",
            (disabled || uploadedPhotos.length >= MAX_FILES) && "cursor-not-allowed opacity-60",
            formError && formError.includes('photo') && "border-red-300"
          )}
        >
          <input {...getInputProps()} />
          
          {uploadedPhotos.length === 0 ? (
            <div className="flex flex-col items-center text-gray-500 py-6">
              <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
              <p className="font-medium text-sm">
                {isDragActive ? 'Drop photos here...' : 'Drag & drop photos or click to select'}
              </p>
              <p className="text-xs mt-1 text-gray-400">
                Max {MAX_FILES} files (PNG, JPG, WEBP), up to {MAX_IMAGE_SIZE / (1024 * 1024)}MB each
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 py-2">
              {uploadedPhotos.map(photo => (
                <div key={photo.id} className="relative aspect-square rounded-md overflow-hidden border bg-white shadow-sm">
                  <Image 
                    src={photo.preview}
                    alt={`Skin concern photo`}
                    fill
                    className="object-cover"
                  />
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-1 right-1 rounded-full p-1 h-6 w-6 z-10 opacity-90 hover:opacity-100" 
                    onClick={(e) => { e.stopPropagation(); removePhoto(photo.id); }}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4"/>
                  </Button>
                </div>
              ))}
              
              {uploadedPhotos.length < MAX_FILES && (
                <div className="aspect-square rounded-md border border-dashed flex flex-col items-center justify-center text-gray-400 bg-gray-50 hover:bg-gray-100">
                  <ImageIcon className="w-6 h-6 mb-1"/>
                  <span className="text-xs">Add more</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {formError && formError.includes('photo') && (
          <p className="text-xs text-red-500 mt-1.5 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" /> {formError}
          </p>
        )}
        
        {uploadedPhotos.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            <CheckCircle2 className="w-3 h-3 inline mr-1 text-green-500" /> 
            {uploadedPhotos.length} {uploadedPhotos.length === 1 ? 'photo' : 'photos'} uploaded
          </p>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between mb-2 items-center">
          <Label htmlFor="description" className="text-sm font-medium text-gray-700 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1.5" /> 
            Describe Your Skin Concerns
          </Label>
          <span className={`text-xs ${characterCount > 500 ? 'text-red-500' : 'text-gray-500'}`}>
            {characterCount}/500
          </span>
        </div>
        
        <Textarea
          id="description"
          placeholder="Describe your concerns (e.g., dryness, acne, dark spots)..."
          value={description}
          onChange={handleDescriptionChange}
          rows={3}
          maxLength={500}
          className={cn(
            "text-sm border-gray-300 bg-white resize-none",
            descriptionError && "border-red-300"
          )}
          disabled={disabled}
        />
        
        {descriptionError && (
          <p className="text-xs text-red-500 mt-1.5 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" /> {descriptionError}
          </p>
        )}
      </div>

      <div className="flex flex-col pt-4">
        {formError && !formError.includes('photo') && (
          <p className="text-sm text-red-500 flex items-center justify-center mb-4">
            <AlertCircle className="w-4 h-4 mr-1" /> {formError}
          </p>
        )}
        
        <Button 
          variant="gradient" 
          size="lg" 
          onClick={handleSubmit}
          disabled={!canSubmit || disabled}
          className="w-full"
        >
          Get Skin Analysis
        </Button>
        
        <p className="text-xs text-gray-500 text-center mt-3">
          By submitting, you agree to our <a href="#" className="text-maroon hover:underline">Terms</a> and <a href="#" className="text-maroon hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}