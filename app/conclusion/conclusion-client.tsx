'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Stepper, Step } from '@/components/ui/stepper';

interface UploadData {
  timestamp: string;
  hasSkinConcerns: boolean;
}

interface Recommendation {
  title: string;
  description: string;
}

interface Recommendations {
  concernAnalysis: Recommendation;
  potentialSolutions: Recommendation;
  nextSteps: Recommendation;
}

interface AnalysisResult {
  timestamp: string;
  recommendations: Recommendations | null;
  fallback: boolean;
  message?: string;
  errorDetails?: string;
}

const steps: Step[] = [
  {
    id: 'upload',
    title: 'Upload Photos',
    description: 'Upload two clear photos of your face - one from the front and one from the side.'
  },
  {
    id: 'processing',
    title: 'Processing',
    description: 'Our AI analyzes your skin type and concerns.'
  },
  {
    id: 'results',
    title: 'Results',
    description: 'Get personalized skincare recommendations tailored for your skin.'
  }
];

export function ConclusionClient() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    try {
      const savedResult = localStorage.getItem('analysisResult');
      
      if (savedResult) {
        const parsedResult: AnalysisResult = JSON.parse(savedResult);
        setAnalysisResult(parsedResult);
        setRecommendations(parsedResult.recommendations);
        
        if (parsedResult.fallback && parsedResult.message) {
          setError(parsedResult.message);
        } else if (!parsedResult.fallback && parsedResult.message) {
          // Handle potential non-fallback messages if needed
          // setError(parsedResult.message); 
        }
        if (parsedResult.errorDetails) {
          setErrorDetails(parsedResult.errorDetails);
        }
        
        // Optional: Clear the item after loading to prevent reuse on refresh without re-upload
        // localStorage.removeItem('analysisResult');
        
      } else {
        setError('No analysis data found. Please upload your photos first.');
      }
    } catch (err) {
      console.error('Error loading analysis result from localStorage:', err);
      setError('Could not load analysis results.');
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12">Loading your results...</div>;
  }

  if (!analysisResult) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">No Analysis Data Found</h1>
        <p className="mb-8 text-muted-foreground">
          {error || 'We couldn\'t find any analysis results. Please upload your photos first.'}
        </p>
        <Link href="/upload">
          <Button variant="gradient">Upload Photos</Button>
        </Link>
      </div>
    );
  }

  const analysisDate = new Date(analysisResult.timestamp);
  const formattedDate = analysisDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Stepper steps={steps} activeStep="results" />
      </div>

      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          Your Skin Analysis Results
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Based on your photos, our AI has created personalized skincare recommendations for you.
        </p>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border mb-8">
        <h2 className="text-xl font-semibold mb-4">Analysis Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-secondary/30 rounded-lg">
            <div className="text-sm text-muted-foreground">Analysis Date</div>
            <div className="font-medium">{formattedDate}</div>
          </div>
          
          <div className="p-4 bg-secondary/30 rounded-lg">
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="font-medium">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                Completed
              </span>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 mt-6">
          <h3 className="text-md font-medium mb-4">Personalized Recommendations</h3>
          
          {error && !analysisResult.fallback && (
             <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium">Note</p>
                  <p className="text-sm mt-1">{error}</p>
                  {errorDetails && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer">View technical details</summary>
                      <p className="text-xs mt-1 p-2 bg-amber-100 rounded">{errorDetails}</p>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {analysisResult.fallback && error && (
            <div className="bg-amber-50 text-amber-800 p-4 rounded-lg mb-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium">Note</p>
                  <p className="text-sm mt-1">{error}</p>
                  {errorDetails && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer">View technical details</summary>
                      <p className="text-xs mt-1 p-2 bg-amber-100 rounded">{errorDetails}</p>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {!error && !analysisResult.fallback && (
            <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium">Analysis completed successfully</p>
                  <p className="text-sm mt-1">Based on your photos, we've generated personalized skincare recommendations.</p>
                </div>
              </div>
            </div>
          )}
          
          {recommendations ? (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium">{recommendations.concernAnalysis.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {recommendations.concernAnalysis.description}
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium">{recommendations.potentialSolutions.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {recommendations.potentialSolutions.description}
                </p>
              </div>
              
              <div className="p-4 border rounded-lg bg-primary/10">
                <h4 className="font-medium text-primary">{recommendations.nextSteps.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {recommendations.nextSteps.description}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 border rounded-lg text-muted-foreground">
              Could not load recommendations.
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <Button variant="outline" asChild>
          <Link href="/upload">Retake Photos</Link>
        </Button>
        <Button variant="gradient">Download Full Report</Button>
      </div>
    </div>
  );
} 