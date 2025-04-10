'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhotoUploader } from '@/components/upload/photo-uploader';
// Removed createFormData as we are sending JSON now
// import { createFormData } from '@/lib/validation';

interface FormData {
  photos: Record<'front' | 'side', File>;
  description: string;
}

// Helper function to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export function UploadForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0); // Keep progress for visual feedback

  const handleFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);
    setProgress(5); // Start progress immediately

    try {
      // 1. Convert images to base64
      setProgress(20);
      const frontImageBase64 = await fileToBase64(data.photos.front);
      setProgress(40);
      const sideImageBase64 = await fileToBase64(data.photos.side);
      setProgress(50);

      // 2. Call the backend API
      console.log('Sending data to /api/analyze:', { 
        skinConcerns: data.description, 
        imageCount: 2 // For logging
      });

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          skinConcerns: data.description,
          // Send base64 strings *including* the data URL prefix (e.g., "data:image/jpeg;base64,...")
          images: [frontImageBase64, sideImageBase64] 
        }),
      });
      
      setProgress(90);

      if (!response.ok) {
        // Try to get error details from response body
        let errorData = { message: `API request failed with status ${response.status}` };
        try {
            errorData = await response.json();
        } catch (parseError) {
            // Ignore if response body isn't valid JSON
        }
        console.error('API Error Response:', errorData);
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      const result = await response.json();
      setProgress(100);
      console.log('Received analysis from /api/analyze:', result);

      // 3. Store result in localStorage for the conclusion page
      localStorage.setItem('analysisResult', JSON.stringify({
        timestamp: new Date().toISOString(),
        recommendations: result.recommendations,
        fallback: result.fallback,
        message: result.message, // Store any message (e.g., fallback reason)
        errorDetails: result.errorDetails // Store any error details
      }));
       // Clear potentially stale concern data if new analysis succeeded
      localStorage.removeItem('skinConcerns'); 
      localStorage.removeItem('uploadData'); 

      // 4. Navigate to the conclusion page
      router.push('/conclusion');

    } catch (err: any) {
      console.error('Error processing submission:', err);
      setError(err.message || 'There was an error processing your submission. Please try again.');
      setProgress(0); // Reset progress on error
      localStorage.removeItem('analysisResult'); // Clear potentially broken result
    } finally {
      // Don't set isSubmitting to false immediately, let the navigation happen
      // setIsSubmitting(false); 
      // We might want to keep the loading state until the next page loads fully
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Ensure PhotoUploader provides files correctly in its onPhotosComplete callback */}
      <PhotoUploader onPhotosComplete={handleFormSubmit} disabled={isSubmitting} />
      
      {isSubmitting && (
        <div className="mt-6">
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-muted-foreground mt-2">
            {progress < 50 ? 'Preparing images...' : 
             progress < 90 ? 'Analyzing with AI...' : 
             progress < 100 ? 'Finalizing...' : 
             'Loading results...'
            }
          </p>
        </div>
      )}
    </div>
  );
} 