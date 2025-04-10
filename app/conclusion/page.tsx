import { ConclusionClient } from "./conclusion-client";
import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function ConclusionPage() {
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
      
      <main className="flex-1 py-12">
        <Container>
          <ConclusionClient />
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