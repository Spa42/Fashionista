'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Stepper, Step } from '@/components/ui/stepper';
import { AlertCircle, CheckCircle2, Info, ArrowRight, Sparkles, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Solution {
  service: string;
  benefit: string;
}

interface RecommendationSection {
  title: string;
  description?: string;
  solutions?: Solution[];
  concerns?: string[];
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

// --- Video Mapping --- 
// Map AI service names (or keywords) to actual video file paths in /public
const serviceToVideoMap: Record<string, string | null> = {
  // Exact matches (lowercase) - Add more as needed
  "chemical peels": "/videos/treatments/chemical-peel.mp4", // Note singular peel in filename
  "laser skin resurfacing": "/videos/treatments/laser-skin-resurfacing.mp4",
  "acne treatment program": "/videos/treatments/acne-treatment.mp4", // Map program to this file
  "acne treatment": "/videos/treatments/acne-treatment.mp4", // Also map generic acne
  "under eye treatment": "/videos/treatments/under-eye-treatment.mp4",
  "dermatological consultation": "/videos/treatments/consultation-info.mp4", // Example if you have a general consult video
  "aesthetic facial": null, // Explicitly no video for this example
  // Add more mappings here based on your available videos and expected AI service names
};

// Function to find the video path based on service name (case-insensitive)
const getVideoPath = (serviceName: string): string | null => {
    if (!serviceName) return null;
    const lowerServiceName = serviceName.toLowerCase();
    // Try exact match first
    if (serviceToVideoMap[lowerServiceName] !== undefined) {
        return serviceToVideoMap[lowerServiceName];
    }
    // Optional: Add partial matching if needed (e.g., check if name *includes* a keyword)
    // for (const key in serviceToVideoMap) {
    //     if (lowerServiceName.includes(key)) {
    //         return serviceToVideoMap[key];
    //     }
    // }
    return null; // No match found
};

export function ConclusionClient() {
  const [storedResult, setStoredResult] = useState<StoredAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [openVideoIndex, setOpenVideoIndex] = useState<number | null>(null);

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

  const renderRecommendationCard = (section: RecommendationSection | undefined, variant: 'default' | 'primary' = 'default') => {
    if (!section) return null;
    
    const isPrimary = variant === 'primary';
    const isNextSteps = section.title === (recommendations?.nextSteps?.title || "Recommended Next Steps");
    const isConcernAnalysis = section.title === (recommendations?.concernAnalysis?.title || "Concern Analysis");
    const isPotentialSolutions = section.title === (recommendations?.potentialSolutions?.title || "Potential Clinic Solutions");
    const hasSolutions = section.solutions && section.solutions.length > 0;

    return (
      <div className={cn("p-4 sm:p-5 border rounded-lg", isPrimary && "bg-primary/10 border-primary/20")}>
        <h4 className={cn(
          "font-semibold text-base sm:text-lg mb-2",
          isPrimary ? "text-primary" : "text-foreground"
        )}>
          {section.title}
        </h4>
        {section.description && (
          <p className={cn(
            "text-sm text-muted-foreground whitespace-pre-wrap", 
            isPrimary && "text-primary/80",
            isNextSteps && "mb-4",
            isConcernAnalysis && section.concerns && section.concerns.length > 0 && "mb-3"
            )}>
            {section.description}
          </p>
        )}
        {isConcernAnalysis && section.concerns && section.concerns.length > 0 && (
             <ul className="mt-1 mb-3 space-y-2">
                {section.concerns.map((concern, index) => (
                <li key={index} className="flex items-center gap-2.5 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{concern}</span>
                </li>
                ))}
            </ul>
        )}
        {isPotentialSolutions && section.solutions && section.solutions.length > 0 && (
          <ul className="mt-3 space-y-4">
            {section.solutions?.map((solution, index) => {
              const videoPath = getVideoPath(solution.service);
              const isVideoOpen = openVideoIndex === index;
              
              return (
                  <li key={index} className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 mt-1 text-primary/70 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                           <span className="font-medium text-sm text-foreground block">{solution.service}</span>
                           <p className="text-xs text-muted-foreground">{solution.benefit}</p>
                        </div>
                        {videoPath && (
                            <Button 
                                variant="ghost"
                                size="icon" 
                                className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-primary"
                                onClick={() => setOpenVideoIndex(isVideoOpen ? null : index)}
                                aria-label={isVideoOpen ? "Close video demo" : "Play video demo"}
                            >
                                <PlayCircle className="h-5 w-5" />
                            </Button>
                         )}
                      </div>
                      {isVideoOpen && videoPath && (
                        <div className="aspect-video w-full max-w-full bg-secondary rounded overflow-hidden mt-2">
                          <video 
                            src={videoPath}
                            playsInline 
                            muted 
                            loop 
                            controls
                            autoPlay
                            className="w-full h-full object-cover"
                          >
                             Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                    </div>
                  </li>
              );
            })}
          </ul>
        )}
        {isNextSteps && (
             <Button 
                variant="gradient" 
                size="default"
                className="w-full sm:w-auto mt-4"
                onClick={() => alert('Booking system integration needed!')} 
            >
                Book Now
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        )}
      </div>
    );
  };

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
            <div className="space-y-4 sm:space-y-5">
              {renderRecommendationCard(recommendations.concernAnalysis)}
              {renderRecommendationCard(recommendations.potentialSolutions)}
              {renderRecommendationCard(recommendations.nextSteps, 'primary')}
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