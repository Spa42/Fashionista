'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadForm } from './upload-form';
import { Container } from '@/components/ui/container';
import { Header } from '@/components/layout/header';
import { PhotoGuide } from '@/components/upload/photo-guide';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

export default function UploadPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysisComplete = (result: any) => {
    try {
      // Store result in localStorage
      localStorage.setItem('analysisResult', JSON.stringify(result));
      setIsLoading(false);
      router.push('/conclusion');
    } catch (storageError) {
      console.error("Failed to save analysis result to localStorage:", storageError);
      setError("Could not save analysis results. Please try again.");
      setIsLoading(false);
    }
  };

  const handleAnalysisError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-8 sm:py-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center lg:text-left">Skin Consultation</h1>
              <p className="text-muted-foreground mb-6 text-center lg:text-left"> 
                Upload photos of your face for our AI to analyze and provide personalized skincare recommendations.
              </p>

              {error && (
                 <Alert variant="destructive" className="mb-6">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Analysis Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <UploadForm 
                 onAnalysisComplete={handleAnalysisComplete} 
                 onAnalysisError={handleAnalysisError}
                 setIsLoading={setIsLoading}
                 isLoading={isLoading}
              />
            </div>

            <aside className="lg:col-span-1">
              <PhotoGuide className="sticky top-24" />
            </aside>
          </div>
        </Container>
      </main>
    </div>
  );
} 