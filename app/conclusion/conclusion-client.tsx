'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Star, TrendingUp, PlayCircle, X, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Keep this if it's there
import { Skeleton } from "@/components/ui/skeleton";

interface Solution {
  service: string;
  benefit: string;
}

// New interface for product recommendations
interface ProductRecommendation {
  type: string; // e.g., "Hydrating Moisturizer", "Vitamin C Serum"
  benefit: string;
}

interface RecommendationSection {
  title: string;
  description?: string;
  solutions?: Solution[];
  concerns?: string[];
  products?: ProductRecommendation[]; // Added products array
  analysisSummary?: string; // Added analysis summary field
}

interface RecommendationsPayload {
  concernAnalysis: RecommendationSection;
  potentialSolutions: RecommendationSection;
  recommendedProducts: RecommendationSection; // Added recommended products section
  nextSteps: RecommendationSection;
}

interface StoredAnalysisResult {
  recommendations: RecommendationsPayload | null;
  fallback: boolean;
  message?: string;
  errorDetails?: string;
  timestamp: string;
}

// Updated mapping with LOWERCASE keys for robust matching
const serviceToVideoMap: { [key: string]: string } = {
  "chemical peels": "/videos/treatments/chemical-peel.mp4",
  "laser skin resurfacing": "/videos/treatments/laser-skin-resurfacing.mp4",
  "laser treatment": "/videos/treatments/laser-skin-resurfacing.mp4", // Maps to same video
  "under eye treatment": "/videos/treatments/under-eye-treatment.mp4",
  "acne treatment": "/videos/treatments/acne-treatment.mp4", 
  "acne treatment program": "/videos/treatments/acne-treatment.mp4", // Maps to same video
  "hydrating facial": "/videos/treatments/hydrating-facial.mp4", // Added mapping
  "microneedling": "/videos/treatments/microneedling.mp4", // Ensure this exists
  // Add other known variations if necessary, ensuring keys are lowercase
  // Add other mappings as needed based on actual service names returned by API
  // Examples from fallback (might not have videos):
  // "Hydration Therapy": "/videos/treatments/hydration-therapy.mp4",
  // "Gentle Exfoliation": "/videos/treatments/gentle-exfoliation.mp4",
  // "Antioxidant Treatment": "/videos/treatments/antioxidant-treatment.mp4",
};

// New mapping for product types to image paths
// **** USER ACTION REQUIRED: Add your product images to public/images/products ****
// **** and update this mapping accordingly. Keys should match possible 'type' values from the LLM. ****
const productTypeToImageMap: { [key: string]: string } = {
  // Updated paths based on uploaded files
  "Gentle Cleanser": "/images/products/cleanser.png", 
  "Hydrating Moisturizer": "/images/products/moisturizer.png",
  "Broad-Spectrum Sunscreen": "/images/products/sunscreen.png", // Corrected path
  "SPF 30 Sunscreen": "/images/products/sunscreen.png", // Use consistent sunscreen image
  "Broad-Spectrum Sunscreen, SPF 30": "/images/products/sunscreen.png", 
  "Broad-Spectrum Sunscreen, SPF 50": "/images/products/sunscreen.png", // Pointing to the correct file
  "Vitamin C Serum": "/images/products/vitamin-c-serum.jpg", // Kept example, replace if needed
  // Add other product types returned by the LLM and their corresponding image paths
  "default": "/images/products/default-product.png" // Added explicit default
};

export function ConclusionClient() {
  const [storedResult, setStoredResult] = useState<StoredAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('analysis');
  const [modalVideoSrc, setModalVideoSrc] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    setLoading(true);
    setLocalError(null);
    try {
      const savedResult = localStorage.getItem('analysisResult');
      
      if (savedResult) {
        const parsedResult = JSON.parse(savedResult) as StoredAnalysisResult; // Assume structure for now
        if (!parsedResult.timestamp) {
          parsedResult.timestamp = new Date().toISOString();
        }
        
        // Define default product recommendations separately for clarity
        const defaultProductRecs = {
          title: "Basic Skincare Suggestions",
          products: [
            { type: "Gentle Cleanser", benefit: "Removes impurities without stripping natural oils." },
            { type: "Hydrating Moisturizer", benefit: "Helps maintain the skin's moisture barrier." },
            { type: "Broad-Spectrum Sunscreen", benefit: "Protects skin from harmful UV rays." }
          ]
        };

        // Ensure the recommendations object and its product field exist
        if (parsedResult.recommendations) {
          if (!parsedResult.recommendations.recommendedProducts) {
            // Add default product recommendations if they are missing
            parsedResult.recommendations.recommendedProducts = defaultProductRecs;
          }
        } else {
          // If the entire recommendations object is missing, create a minimal fallback
          // This case should ideally not happen if data was saved correctly, but handles corruption.
          console.warn("Stored recommendations object missing, creating minimal fallback.");
          parsedResult.recommendations = {
             concernAnalysis: { title: "Analysis Incomplete", concerns: [] }, // Minimal valid structure
             potentialSolutions: { title: "Solutions Unavailable", solutions: [] }, // Minimal valid structure
             nextSteps: { title: "Consultation Recommended", description: ""}, // Minimal valid structure
             recommendedProducts: defaultProductRecs // Add the default products
          };
        }
        setStoredResult(parsedResult);
      } else {
        // For demo purposes, set a fallback result if no real analysis exists
        setStoredResult({
          recommendations: {
            concernAnalysis: {
              title: "Skin Analysis",
              description: "Based on our analysis, your skin shows signs of mild dehydration and uneven texture. There are also indications of environmental damage and early signs of aging.",
              concerns: ["Dehydration", "Uneven Texture", "Environmental Damage", "Early Aging Signs"]
            },
            potentialSolutions: {
              title: "Treatment Recommendations",
              solutions: [
                { service: "Hydration Therapy", benefit: "Deep moisturizing treatment to restore skin's moisture barrier and improve overall hydration." },
                { service: "Gentle Exfoliation", benefit: "Removes dead skin cells to improve texture and enhance product absorption." },
                { service: "Antioxidant Treatment", benefit: "Protects against environmental damage and reduces signs of premature aging." },
                { service: "Custom Skincare Regimen", benefit: "Personalized daily routine designed for your specific skin concerns and needs." }
              ]
            },
            recommendedProducts: { // Add fallback products here too
              title: "Basic Skincare Suggestions",
              products: [
                { type: "Gentle Cleanser", benefit: "Removes impurities without stripping natural oils." },
                { type: "Hydrating Moisturizer", benefit: "Helps maintain the skin's moisture barrier." },
                { type: "Broad-Spectrum Sunscreen", benefit: "Protects skin from harmful UV rays." }
              ]
            },
            nextSteps: {
              title: "Recommended Actions",
              description: "To address your skin concerns effectively, we recommend booking a consultation at Dr. Bashar Clinic for a comprehensive in-person assessment and personalized treatment plan."
            }
          },
          fallback: true,
          message: "Sample skin analysis provided for demonstration.",
          timestamp: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.error('Error loading analysis result from localStorage:', err);
      setLocalError(`Could not load analysis results from local storage: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const openImageModal = (productType: string) => {
    console.log("Opening image modal for type:", productType);
    const imageUrl = productTypeToImageMap[productType] || '/images/products/placeholder.jpg'; // Use placeholder if no map entry
    console.log("Resolved image URL:", imageUrl);
    setSelectedImageUrl(imageUrl);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImageUrl(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center py-20 px-4">
      <div className="animate-pulse space-y-4 w-full max-w-md">
        <div className="h-8 bg-maroon/10 rounded-lg w-3/4 mx-auto"></div>
        <div className="h-64 bg-maroon/5 rounded-xl"></div>
        <div className="h-8 bg-maroon/10 rounded-lg w-1/2 mx-auto"></div>
      </div>
    </div>;
  }

  if (localError || !storedResult) {
    return (
      <div className="text-center py-16 px-4">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Analysis Unavailable</h1>
        <p className="mb-8 text-gray-600 max-w-md mx-auto">
          {localError || 'Could not retrieve skin analysis results.'}
        </p>
        <Link href="/upload">
          <Button variant="gradient">Retry Skin Analysis</Button>
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
  const skinConcerns = recommendations?.concernAnalysis?.concerns || [];
  const treatmentRecommendations = recommendations?.potentialSolutions?.solutions || [];
  const productRecommendations = recommendations?.recommendedProducts?.products || []; // Get product recommendations
  
  return (
    <div className="min-h-screen">
      <div className="text-center mb-6 pt-4">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-maroon/10 text-maroon mb-3">
          ANALYSIS COMPLETE
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-800 mb-4">
          Your Skin Analysis Results
        </h1>
      </div>
      
      <div className="flex justify-center mb-6 border-b border-gray-100">
        <button 
          onClick={() => setSelectedTab('analysis')}
          className={cn(
            "px-4 py-3 font-medium text-sm transition-colors relative",
            selectedTab === 'analysis' 
              ? "text-maroon" 
              : "text-gray-500 hover:text-gray-800"
          )}
        >
          Skin Analysis
          {selectedTab === 'analysis' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-maroon"></span>
          )}
        </button>
        <button 
          onClick={() => setSelectedTab('recommendations')}
          className={cn(
            "px-4 py-3 font-medium text-sm transition-colors relative",
            selectedTab === 'recommendations' 
              ? "text-maroon" 
              : "text-gray-500 hover:text-gray-800"
          )}
        >
          Treatments
          {selectedTab === 'recommendations' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-maroon"></span>
          )}
        </button>
        <button 
          onClick={() => setSelectedTab('trending')}
          className={cn(
            "px-4 py-3 font-medium text-sm transition-colors relative",
            selectedTab === 'trending' 
              ? "text-maroon" 
              : "text-gray-500 hover:text-gray-800"
          )}
        >
          Skincare Products
          {selectedTab === 'trending' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-maroon"></span>
          )}
        </button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-soft-lg overflow-hidden">
        {selectedTab === 'analysis' && (
          <div className="p-6 sm:p-8">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-8 h-8 rounded-full bg-maroon/10 text-maroon flex items-center justify-center mr-2">
                  <Check className="w-4 h-4" />
                </span>
                Your Skin Concerns
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6 pl-1">
                {skinConcerns.length > 0 ? (
                  skinConcerns.map((concern, index) => (
                    <li key={index} className="text-sm">{concern}</li>
                  ))
                ) : (
                  <li className="text-sm italic">No specific concerns identified from the analysis.</li>
                )}
              </ul>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Expert Summary</h3>
              <div className="bg-maroon/5 rounded-lg p-4">
                <p className="text-sm text-gray-700 italic">
                  {recommendations?.concernAnalysis?.analysisSummary || 
                    "Our experts recommend booking a consultation for a personalized assessment and treatment plan based on your unique skin needs."} 
                </p>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <Button 
                variant="gradient" 
                size="lg" 
                className="w-full sm:w-auto" 
                onClick={() => setSelectedTab('recommendations')}
              >
                View Treatment Recommendations
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
        
        {selectedTab === 'recommendations' && (
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Recommended Treatments</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {treatmentRecommendations.map((item, index) => {
                const serviceNameLower = item.service.toLowerCase();
                const videoSrc = serviceToVideoMap[serviceNameLower];
                console.log(`Service: "${item.service}" (Lower: "${serviceNameLower}"), Video found: ${videoSrc || 'None'}`); // Log mapping attempt
                
                return (
                  <div key={index} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 flex-1 mr-2">{item.service}</h3>
                      {videoSrc && ( // Button appears only if videoSrc is found
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-maroon/70 hover:text-maroon hover:bg-maroon/10 flex-shrink-0"
                          onClick={() => setModalVideoSrc(videoSrc)} // Use the found videoSrc
                          aria-label={`Play video for ${item.service}`}
                        >
                          <PlayCircle className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{item.benefit}</p>
                  </div>
                );
              })}
            </div>
            
            <div className="bg-maroon/5 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Next Steps</h3>
              <p className="text-gray-600 text-sm mb-4">
                {recommendations?.nextSteps?.description || 
                  "For a comprehensive assessment and personalized treatment plan, we recommend booking a consultation at Dr. Bashar Clinic."}
              </p>
              <Link href="#">
                <Button variant="gradient" size="lg" className="w-full">
                  Book Consultation
                </Button>
              </Link>
            </div>
          </div>
        )}
        
        {selectedTab === 'trending' && (
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">{recommendations?.recommendedProducts?.title || 'Recommended Products'}</h2>
              {/* Optional: Keep or remove the 'Top Rated' badge */}
              {/* <div className="flex items-center text-maroon text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                Top Rated
              </div> */}
            </div>
            
            {productRecommendations.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {productRecommendations.map((product, index) => {
                  // Simplified image source lookup - Use map entry directly or default
                  const imageUrl = productTypeToImageMap[product.type] || productTypeToImageMap["default"];
                  return (
                    <Card key={index} className="overflow-hidden text-center p-4 bg-gray-50/50 border border-gray-100 group">
                      <div 
                        className="relative aspect-square w-full mb-3 overflow-hidden rounded-md cursor-pointer" 
                        onClick={() => {
                          console.log(`Product card clicked: ${product.type}`); // Keep log for debugging
                          openImageModal(product.type)
                        }}
                        role="button" // Added for accessibility/event handling
                        tabIndex={0}  // Added for accessibility/event handling
                        onKeyDown={(e) => e.key === 'Enter' && openImageModal(product.type)} // Allow keyboard activation
                      >
                        <Image 
                          src={imageUrl} // Use the directly looked-up URL
                          alt={product.type} 
                          fill 
                          className="object-cover" 
                          sizes="(max-width: 640px) 50vw, 33vw" // Optimize image loading
                          onError={(e) => { 
                            console.warn(`Failed to load image: ${imageUrl}`);
                            // Use the explicit default path on error
                            (e.target as HTMLImageElement).src = productTypeToImageMap["default"]; 
                          }}
                        />
                      </div>
                      <h3 className="font-semibold text-sm text-gray-800 mb-1">{product.type}</h3>
                      <p className="text-gray-600 text-xs">{product.benefit}</p>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 italic">No specific products recommended based on this analysis.</p>
            )}
            
            <div className="text-center">
              <Link href="#"> 
                <Button variant="outline" className="border-maroon/20 text-maroon hover:bg-maroon/5">
                  View All Products
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-10 text-center">
        <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-maroon transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Video Modal (Restored) */} 
      {modalVideoSrc && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setModalVideoSrc(null)} 
        >
          <div 
            className="relative bg-black rounded-lg overflow-hidden shadow-2xl w-full max-w-2xl max-h-[80vh] aspect-video"
            onClick={(e) => e.stopPropagation()} 
          >
            <Button 
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/75"
              onClick={() => setModalVideoSrc(null)}
              aria-label="Close video"
            >
              <X className="h-5 w-5" />
            </Button>
            <video
              key={modalVideoSrc} 
              src={modalVideoSrc}
              className="w-full h-full object-contain"
              controls
              autoPlay
              playsInline
              loop
              onError={(e) => {
                console.error('Modal video error:', e);
                console.error(`Failed URL: ${modalVideoSrc}`); // Log the URL that failed
                setModalVideoSrc(null);
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {imageModalOpen && selectedImageUrl && (
        <div 
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" 
          onClick={closeImageModal} // Close on overlay click
        >
          <div 
            className="relative bg-white p-2 rounded-lg shadow-xl max-w-xl w-auto max-h-[85vh]"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
          >
             <button 
              onClick={closeImageModal} 
              className="absolute top-1 right-1 text-white bg-black/50 rounded-full p-1 z-10 hover:bg-black/70"
              aria-label="Close image"
            >
              <X size={18} />
            </button>
            <Image 
              src={selectedImageUrl} 
              alt="Enlarged product" 
              width={800} // Provide appropriate width/height or use fill/object-contain
              height={800}
              className="object-contain w-full h-auto max-h-[calc(85vh-1rem)]" // Adjust max height based on padding
            />
          </div>
        </div>
      )}
    </div>
  );
} 