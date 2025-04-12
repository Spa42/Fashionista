'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadForm } from './upload-form';
import { Container } from '@/components/ui/container';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import Link from "next/link";

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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="py-4 sticky top-0 z-50 w-full border-b border-maroon/10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-sm">
        <Container>
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center space-x-2">
              <h1 className="text-2xl font-semibold tracking-tight text-maroon">
                Dr. Bashar Clinic
              </h1>
            </Link>
          </div>
        </Container>
      </header>

      <main className="flex-1 py-6 sm:py-10">
        <Container className="max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-3 text-gray-800">Skin Consultation</h1>
            <p className="text-gray-600 max-w-md mx-auto text-sm">
              Upload photos and describe your skin concerns for AI-powered analysis.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 border border-red-200 bg-red-50">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Analysis Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-white rounded-xl shadow-soft-lg p-6 border border-gray-100">
            <UploadForm 
              onAnalysisComplete={handleAnalysisComplete} 
              onAnalysisError={handleAnalysisError}
              setIsLoading={setIsLoading}
              isLoading={isLoading}
            />
          </div>
        </Container>
      </main>
    </div>
  );
} 