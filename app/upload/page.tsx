import Link from 'next/link';
import { Container } from "@/components/ui/container";
import { Button } from '@/components/ui/button';
import { UploadForm } from "./upload-form";
import { Steps } from './steps';
import { ClientPhotoGuide } from "./client-photo-guide";

export default function UploadPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-6 border-b">
        <Container>
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
                Beauty AI
              </h1>
            </Link>
          </div>
        </Container>
      </header>
      
      <main className="flex-1 py-12 sm:py-16">
        <Container>
          <div className="max-w-4xl mx-auto">
            <Steps />
            
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Skin Consultation
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Upload two photos of your face for our AI to analyze and provide personalized skincare recommendations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <UploadForm />
              </div>
              <div className="hidden lg:block">
                <div className="sticky top-8">
                  <Steps className="lg:hidden mb-6" />
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Get the most out of your analysis</h2>
                    <p className="text-muted-foreground text-sm">
                      For the most accurate skin analysis and personalized recommendations, please follow these guidelines.
                    </p>
                    <ClientPhotoGuide />
                    
                    <div className="mt-6 p-4 bg-secondary/30 rounded-lg border">
                      <h3 className="font-medium mb-2">Having trouble?</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        If you're having issues uploading your photos, please try again or contact support.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Contact Support
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </main>
      
      <footer className="border-t py-8 bg-secondary/10">
        <Container>
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Beauty AI. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 sm:mt-0">
              <Link href="#" className="text-sm text-muted-foreground hover:underline">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:underline">
                Terms of Service
              </Link>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
} 