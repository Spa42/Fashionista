'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Stepper, Step } from '@/components/ui/stepper';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecommendationSection {
  title: string;
  description: string;
}

interface RecommendationsPayload {
  concernAnalysis: RecommendationSection;
  potentialSolutions: RecommendationSection;
  nextSteps: RecommendationSection;
}

interface StoredAnalysisResult {
  recommendations: RecommendationsPayload | null;
  fallback: boolean;
  message?: string;
  errorDetails?: string;
  timestamp: string;
}

const steps: Step[] = [
  {
    id: 'upload',
    title: 'Upload',
    description: 'Photos/Details'
  },
  {
    id: 'processing',
    title: 'AI Analysis',
    description: 'Processing'
  },
  {
    id: 'results',
    title: 'Results',
    description: 'View Results'
  }
];

export function ConclusionClient() {
  const [storedResult, setStoredResult] = useState<StoredAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setLocalError(null);
    try {
      const savedResult = localStorage.getItem('analysisResult');
      
      if (savedResult) {
        const parsedResult: StoredAnalysisResult = JSON.parse(savedResult);
        if (!parsedResult.timestamp) {
          parsedResult.timestamp = new Date().toISOString();
        }
        setStoredResult(parsedResult);
      } else {
        setLocalError('No analysis data found in local storage. Please upload your photos first.');
      }
    } catch (err: any) {
      console.error('Error loading analysis result from localStorage:', err);
      setLocalError(`Could not load analysis results from local storage: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12 px-4">Loading your results...</div>;
  }

  if (localError || !storedResult) {
    return (
      <div className="text-center py-12 px-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Analysis Data Issue</h1>
        <p className="mb-8 text-muted-foreground">
          {localError || 'Could not retrieve analysis results.'}
        </p>
        <Link href="/upload">
          <Button variant="gradient">Go to Upload</Button>
        </Link>
      </div>
    );
  }

  const analysisDate = new Date(storedResult.timestamp);
  const formattedDate = analysisDate.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'
  });

  const recommendations = storedResult.recommendations;
  const isFallback = storedResult.fallback;
  const message = storedResult.message;
  const errorDetails = storedResult.errorDetails;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <Stepper steps={steps} activeStep="results" />
      </div>

      <div className="text-center mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
          Your AI Skin Consultation Results
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
           {isFallback ? "Displaying general recommendations as AI analysis encountered issues." : "Here are the personalized recommendations based on our AI analysis."}
        </p>
      </div>

      <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Analysis Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-6">
          <div className="p-3 sm:p-4 bg-secondary/30 rounded-lg">
            <div className="text-xs sm:text-sm text-muted-foreground">Analysis Generated</div>
            <div className="font-medium text-sm sm:text-base">{formattedDate}</div>
          </div>
          
          <div className="p-3 sm:p-4 bg-secondary/30 rounded-lg">
            <div className="text-xs sm:text-sm text-muted-foreground">Status</div>
            <div className={cn(
                 "font-medium flex items-center gap-1.5 text-sm sm:text-base",
                 isFallback ? 'text-amber-600' : 'text-green-600'
                )}>
              {isFallback ? <AlertCircle className="w-4 h-4 flex-shrink-0"/> : <CheckCircle2 className="w-4 h-4 flex-shrink-0"/>}
              {isFallback ? 'Completed with Fallback' : 'Completed Successfully'}
            </div>
          </div>
        </div>

        {message && (
             <div className={cn(
                 "p-3 sm:p-4 rounded-lg mb-5 sm:mb-6 text-sm border",
                 isFallback ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-blue-50 border-blue-200 text-blue-800'
                )}>
              <div className="flex items-start">
                <Info className="w-5 h-5 mr-2 sm:mr-3 mt-0.5 flex-shrink-0"/>
                <div>
                  <p className="font-medium">Analysis Note</p>
                  <p className="mt-1 text-xs sm:text-sm">{message}</p>
                  {errorDetails && errorDetails !== "No specific error details available." && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer font-medium">View technical details</summary>
                      <pre className="text-xs mt-1 p-2 bg-black/5 rounded overflow-x-auto">{errorDetails}</pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}

        <div className="border-t pt-5 sm:pt-6 mt-5 sm:mt-6">
          <h3 className="text-base sm:text-md font-medium mb-3 sm:mb-4">Personalized Recommendations</h3>
          
          {recommendations ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 border rounded-lg">
                <h4 className="font-medium text-sm sm:text-base">{recommendations.concernAnalysis.title || "Concern Analysis"}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                  {recommendations.concernAnalysis.description}
                </p>
              </div>
              
              <div className="p-3 sm:p-4 border rounded-lg">
                <h4 className="font-medium text-sm sm:text-base">{recommendations.potentialSolutions.title || "Potential Solutions"}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                  {recommendations.potentialSolutions.description}
                </p>
              </div>
              
              <div className="p-3 sm:p-4 border rounded-lg bg-primary/10">
                <h4 className="font-medium text-primary text-sm sm:text-base">{recommendations.nextSteps.title || "Next Steps"}</h4>
                <p className="text-xs sm:text-sm text-primary/80 mt-1 whitespace-pre-wrap">
                  {recommendations.nextSteps.description}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 sm:p-4 border rounded-lg text-muted-foreground flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4"/> Could not load recommendations data.
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 sm:mb-16">
        <Button variant="outline" asChild size="lg">
          <Link href="/upload">Start New Analysis</Link>
        </Button>
      </div>
    </div>
  );
} 