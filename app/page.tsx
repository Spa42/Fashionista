import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="py-4 sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Container>
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center space-x-2">
                <h1 className="text-xl font-semibold tracking-tight bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-500 text-transparent bg-clip-text">
                  Beauty AI
                </h1>
            </Link>
          </div>
        </Container>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 z-[-1] animate-gradient-xy"
            style={{
              background: 'linear-gradient(120deg, oklch(0.95 0.05 290 / 0.2), oklch(0.9 0.08 330 / 0.2), oklch(0.95 0.05 20 / 0.2))',
              backgroundSize: '300% 300%',
            }}
          />
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="space-y-5 sm:space-y-6 z-10 text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-tight">
                  <span className="block">Unlock Your Radiant</span>
                  <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-transparent bg-clip-text">
                    Skin Potential
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 lg:max-w-[600px]">
                  Experience the future of skincare. Our AI consultant analyzes your unique profile to curate a personalized routine just for you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                  <Link href="/upload" passHref>
                    <Button variant="gradient" size="xl" className="shadow-lg group w-full sm:w-auto">
                      Start Free Consultation
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block relative aspect-square lg:aspect-[4/5] lg:h-[550px] rounded-2xl overflow-hidden shadow-2xl z-10">
                <Image
                  src="/hero-image.jpg"
                  alt="Futuristic skincare concept"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              </div>
            </div>
          </Container>
        </section>

        {/* Features Section - Updated Styling */}
        <section id="how-it-works" className="py-16 sm:py-20 bg-secondary/50 border-t">
          <Container>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Simple Steps to Personalized Skincare</h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Our intelligent platform streamlines your journey to healthier skin. Get started in minutes.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  title: "Upload Your Photos",
                  description: "Provide clear front, left, and right facial photos in good lighting.",
                  icon: "📷",
                },
                {
                  title: "AI Skin Analysis",
                  description: "Our advanced AI evaluates skin type, tone, texture, and concerns.",
                  icon: "✨",
                },
                {
                  title: "Receive Your Plan",
                  description: "Get a tailored skincare routine and product recommendations instantly.",
                  icon: "🧪",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-background p-6 md:p-8 rounded-xl shadow-lg border border-border/50 flex flex-col items-center text-center transition-transform hover:scale-105"
                >
                  <div className="text-4xl md:text-5xl mb-4 md:mb-5 p-3 md:p-4 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-full">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      </main>

      <footer className="border-t py-6 md:py-8 bg-background">
        <Container>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              © {new Date().getFullYear()} Beauty AI. Revolutionizing Skincare.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                Privacy Policy
              </Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                Terms of Service
              </Link>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
