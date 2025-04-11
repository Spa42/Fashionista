'use client';

import { useState, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { PhotoUploader } from '@/components/upload/photo-uploader';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Interface for a single recommendation section
interface RecommendationSection {
  title: string;
  description: string;
}

// Interface for the full set of recommendations
interface RecommendationsPayload {
  concernAnalysis: RecommendationSection;
  potentialSolutions: RecommendationSection;
  nextSteps: RecommendationSection;
}

// Interface for the expected API response
interface ApiResponse {
  recommendations: RecommendationsPayload | null;
  fallback: boolean;
  message?: string;
  errorDetails?: string;
  error?: string; // Added for direct API error messages
}

// Define props for UploadForm
interface UploadFormProps {
  onAnalysisComplete: (result: ApiResponse & { timestamp: string }) => void; // Pass the full enriched response
  onAnalysisError: (error: string) => void;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  isLoading: boolean;
}

// Utility function to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export function UploadForm({ 
  onAnalysisComplete, 
  onAnalysisError, 
  setIsLoading, 
  isLoading 
}: UploadFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handlePhotoDataSubmit = async (data: { 
    photos: File[];
    description: string 
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Convert images to base64
      const base64Images = await Promise.all(
        data.photos.map(photo => fileToBase64(photo))
      );

      // Construct payload: Send description and an array of base64 images
      const payload = {
        description: data.description,
        images: base64Images,
      };

      // Call the API route
      const response = await fetch('/api/analyze', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        // Use error message from API response if available, otherwise generic error
        throw new Error(result.error || result.message || `API Error (${response.status}): ${response.statusText}`);
      }

      // Add timestamp to the result before passing it up
      const resultWithTimestamp = {
          ...result,
          timestamp: new Date().toISOString()
      };

      // Handle successful analysis (even if it's a fallback response)
      onAnalysisComplete(resultWithTimestamp);

    } catch (error: any) {
      console.error("Analysis API call failed:", error);
      const errorMessage = error.message || "An unexpected error occurred during analysis.";
      setError(errorMessage);
      onAnalysisError(errorMessage);
      // No need to remove localStorage item here, handled in parent or conclusion page
    } finally {
      // Loading state is managed by the parent component now
      // setIsLoading(false); // Let parent component handle this
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      
      <PhotoUploader 
        onPhotosComplete={handlePhotoDataSubmit} 
        disabled={isLoading} 
      />
      
      {/* Loading indicator handled by parent */} 
    </div>
  );
} 