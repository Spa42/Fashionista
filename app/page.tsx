import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-6 border-b">
        <Container>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
                Beauty AI
              </h1>
            </div>
          </div>
        </Container>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 sm:py-32">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                  <span className="block">Discover Your</span>
                  <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
                    Perfect Skincare Routine
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-[600px]">
                  Our AI-powered skin consultant analyzes your unique skin profile and recommends personalized skincare products tailored specifically for you.
                </p>
                <div className="flex gap-4 pt-4">
                  <Link href="/upload" passHref>
                    <Button variant="gradient" size="xl" className="shadow-lg">
                      Begin Skin Consultation
                    </Button>
                  </Link>
                  <Button variant="outline" size="xl">
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="relative aspect-square lg:aspect-auto lg:h-[600px] rounded-2xl overflow-hidden">
                <Image
                  src="/hero-image.jpg"
                  alt="Beautiful skin"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </Container>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-secondary/30">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our AI-powered platform makes it easy to get personalized skincare recommendations in just three simple steps.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Upload a Selfie",
                  description: "Take a clear photo of your face in natural lighting without makeup.",
                  icon: "📸",
                },
                {
                  title: "AI Analysis",
                  description: "Our advanced AI analyzes your skin type, concerns, and needs.",
                  icon: "🔍",
                },
                {
                  title: "Get Recommendations",
                  description: "Receive personalized skincare product recommendations and routine.",
                  icon: "✨",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-background p-6 rounded-xl shadow-sm border flex flex-col items-center text-center"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
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
