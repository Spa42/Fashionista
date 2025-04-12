'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ClientPhotoGuide } from './client-photo-guide';
import { PhotoUploader } from '@/components/upload/photo-uploader';
import { Spinner } from '@/components/ui/spinner';

interface UploadFormProps {
  onAnalysisComplete: (result: any) => void;
  onAnalysisError: (error: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
}

export function UploadForm({ onAnalysisComplete, onAnalysisError, setIsLoading, isLoading }: UploadFormProps) {
  const [showGuide, setShowGuide] = useState(false);

  const handleToggleGuide = () => {
    setShowGuide(!showGuide);
  };

  const handlePhotosComplete = async (data: { photos: File[]; description: string }) => {
    setIsLoading(true);
    
    try {
      const { photos, description } = data;
      const base64Photos: string[] = [];
      
      // Convert photos to base64
      for (const photo of photos) {
        try {
          const base64 = await convertFileToBase64(photo);
          base64Photos.push(base64);
        } catch (error) {
          console.error("Error converting photo to base64:", error);
          onAnalysisError("Error processing photos. Please try again.");
          return;
        }
      }
      
      // Send to API for analysis
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: base64Photos,
          description: description
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      onAnalysisComplete(result);
      
    } catch (error: any) {
      console.error("Error during analysis:", error);
      onAnalysisError(error.message || "Failed to analyze images. Please try again.");
    }
  };

  // Helper function to convert File to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="space-y-6">
      {!isLoading ? (
        <>
          <div className="flex items-end justify-end">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleToggleGuide}
              className="text-maroon hover:text-maroon/80 border-maroon/20 hover:border-maroon/40"
            >
              {showGuide ? "Hide Guidelines" : "Photo Guidelines"}
            </Button>
          </div>
          
          {showGuide && (
            <div className="mb-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
              <ClientPhotoGuide />
            </div>
          )}
          
          <PhotoUploader 
            onPhotosComplete={handlePhotosComplete}
            disabled={isLoading}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size="lg" className="text-maroon mb-6" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Analyzing your skin...</h3>
          <p className="text-gray-600 text-sm text-center max-w-md">
            Our AI is examining your photos and concerns to provide personalized recommendations. This usually takes less than a minute.
          </p>
        </div>
      )}
    </div>
  );
} 