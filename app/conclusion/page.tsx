import { ConclusionClient } from "./conclusion-client";
import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function ConclusionPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="py-4 sticky top-0 z-50 w-full border-b border-maroon/10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-sm">
        <Container>
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center space-x-2">
              <h1 className="text-2xl font-semibold tracking-tight text-maroon">
                Results
              </h1>
            </Link>
          </div>
        </Container>
      </header>
      
      <main className="flex-1 py-6 sm:py-10">
        <Container className="max-w-lg">
          <ConclusionClient />
        </Container>
      </main>
      
      <footer className="border-t border-gray-100 py-8 bg-white">
        <Container>
          <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Dr. Bashar Clinic. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 sm:mt-0">
              <Link href="#" className="text-sm text-gray-500 hover:text-maroon transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-gray-500 hover:text-maroon transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
} 