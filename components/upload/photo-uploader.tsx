import React, { useState } from 'react';
import { Dropzone } from '@/components/ui/dropzone';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  validateImage, 
  validateDescription, 
  ACCEPTABLE_IMAGE_TYPES, 
  MAX_IMAGE_SIZE 
} from '@/lib/validation';

type PhotoType = 'front' | 'side';

interface UploadedPhoto {
  file: File;
  preview: string;
}

interface PhotoUploaderProps {
  onPhotosComplete: (data: { photos: Record<PhotoType, File>; description: string }) => void;
  disabled?: boolean;
}

export function PhotoUploader({ onPhotosComplete, disabled = false }: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<Partial<Record<PhotoType, UploadedPhoto>>>({});
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Partial<Record<PhotoType | 'description', string>>>({});
  const [characterCount, setCharacterCount] = useState(0);

  const handleDrop = (type: PhotoType) => (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Use the validation utility
    const validation = validateImage(file);
    
    if (!validation.isValid) {
      setErrors({ ...errors, [type]: validation.error });
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    
    // Update state
    setPhotos(prev => ({
      ...prev,
      [type]: { file, preview }
    }));
    
    // Clear error if exists
    if (errors[type]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[type];
        return newErrors;
      });
    }
  };

  const removePhoto = (type: PhotoType) => {
    setPhotos(prev => {
      const newPhotos = { ...prev };
      
      // Free memory from the preview URL
      if (newPhotos[type]?.preview) {
        URL.revokeObjectURL(newPhotos[type]!.preview);
      }
      
      delete newPhotos[type];
      return newPhotos;
    });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
    setCharacterCount(newDescription.length);
    
    // Validate the description
    const validation = validateDescription(newDescription);
    
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, description: validation.error }));
    } else if (errors.description) {
      // Clear description error if it exists
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.description;
        return newErrors;
      });
    }
  };

  const handleSubmit = () => {
    // Validate that both photos are present
    const newErrors: Partial<Record<PhotoType | 'description', string>> = {};
    
    if (!photos.front) {
      newErrors.front = 'Front photo is required';
    }
    
    if (!photos.side) {
      newErrors.side = 'Side photo is required';
    }
    
    // Validate description if provided
    const descriptionValidation = validateDescription(description);
    if (!descriptionValidation.isValid) {
      newErrors.description = descriptionValidation.error;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // All validations passed, call the onPhotosComplete callback
    onPhotosComplete({
      photos: {
        front: photos.front!.file,
        side: photos.side!.file
      },
      description
    });
  };

  const isComplete = photos.front && photos.side;
  const isDescriptionValid = !errors.description;
  const isFormValid = isComplete && isDescriptionValid;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-6">Upload Your Photos</h2>
        <p className="text-muted-foreground mb-6">
          Please upload two clear photos of your face - one from the front and one from the side.
          Make sure you're in good lighting and not wearing makeup for the most accurate analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Front Photo</h3>
          {photos.front ? (
            <div className="relative">
              <Dropzone
                onDrop={handleDrop('front')}
                label="Front view of your face"
                previewUrl={photos.front.preview}
                error={errors.front}
              />
              <Button 
                variant="destructive" 
                size="sm" 
                className="absolute top-2 right-2 rounded-full p-2 h-8 w-8"
                onClick={() => removePhoto('front')}
              >
                ✕
              </Button>
            </div>
          ) : (
            <Dropzone
              onDrop={handleDrop('front')}
              label="Drag & drop front photo, or click to select"
              error={errors.front}
              acceptedFileTypes={ACCEPTABLE_IMAGE_TYPES}
              maxSize={MAX_IMAGE_SIZE}
            />
          )}
          <p className="text-xs text-muted-foreground mt-2">
            A clear, well-lit photo of your face from the front.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Side Photo</h3>
          {photos.side ? (
            <div className="relative">
              <Dropzone
                onDrop={handleDrop('side')}
                label="Side view of your face"
                previewUrl={photos.side.preview}
                error={errors.side}
              />
              <Button 
                variant="destructive" 
                size="sm" 
                className="absolute top-2 right-2 rounded-full p-2 h-8 w-8"
                onClick={() => removePhoto('side')}
              >
                ✕
              </Button>
            </div>
          ) : (
            <Dropzone
              onDrop={handleDrop('side')}
              label="Drag & drop side photo, or click to select"
              error={errors.side}
              acceptedFileTypes={ACCEPTABLE_IMAGE_TYPES}
              maxSize={MAX_IMAGE_SIZE}
            />
          )}
          <p className="text-xs text-muted-foreground mt-2">
            A clear, well-lit photo of your face from the side.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between mb-2">
          <Label htmlFor="description" optional>Skin Concerns</Label>
          <span className={`text-xs ${characterCount > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {characterCount}/500 characters
          </span>
        </div>
        <Textarea
          id="description"
          placeholder="Describe any specific skin concerns you'd like us to address (e.g., acne, dryness, fine lines, etc.)"
          value={description}
          onChange={handleDescriptionChange}
          rows={4}
          error={errors.description}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground mt-2">
          This helps our AI provide more targeted recommendations for your specific needs.
        </p>
      </div>

      <div className="flex justify-center mt-8">
        <Button 
          variant="gradient" 
          size="lg" 
          onClick={handleSubmit}
          disabled={!isFormValid || disabled}
        >
          {isComplete ? 'Submit for Analysis' : 'Upload Both Photos to Continue'}
        </Button>
      </div>
    </div>
  );
} 