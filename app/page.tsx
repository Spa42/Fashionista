import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowRight, Star, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="py-4 sticky top-0 z-50 w-full border-b border-maroon/10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-sm">
        <Container>
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center space-x-2">
              <h1 className="text-2xl font-semibold tracking-tight text-maroon">
                Dr. Bashar Clinic
              </h1>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="#" className="text-sm font-medium text-gray-600 hover:text-maroon transition-colors">
                About
              </Link>
              <Link href="#" className="text-sm font-medium text-gray-600 hover:text-maroon transition-colors">
                Services
              </Link>
              <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-maroon transition-colors">
                How It Works
              </Link>
            </nav>
          </div>
        </Container>
      </header>

      <main className="flex-1">
        {/* Hero Section - Full viewport height below header */}
        <section 
          className="relative flex flex-col justify-center items-center min-h-[calc(100vh-5.5rem)] overflow-hidden px-4"
          // Header height: h-14 (3.5rem) + py-4 (1rem top/bottom) = 5.5rem total
        >
          {/* Decorative Elements */}
          <div className="absolute top-40 right-[15%] w-24 h-24 rounded-full bg-maroon/5 blur-3xl"></div>
          <div className="absolute top-20 left-[10%] w-32 h-32 rounded-full bg-maroon/10 blur-3xl"></div>
          <div className="absolute bottom-10 right-[10%] w-40 h-40 rounded-full bg-gray-200/80 blur-3xl"></div>
          
          <div className="absolute top-20 right-10 text-maroon/20 rotate-12">
            <Star size={40} fill="currentColor" strokeWidth={0.5} />
          </div>
          <div className="absolute bottom-20 left-10 text-maroon/10 -rotate-12">
            <Star size={60} fill="currentColor" strokeWidth={0.5} />
          </div>
          
          {/* Main Content */}
          <Container>
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-gray-800 mb-8">
                Discover Your<br />
                <span className="text-maroon">Skin Potential</span>
              </h1>
              
              <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto font-light mb-10">
                Elevate your skincare journey with our AI skin consultant. Get personalized recommendations 
                tailored to your unique skin profile and concerns.
              </p>
              
              <Link href="/upload" passHref>
                <Button variant="gradient" size="xl" className="shadow-soft-lg group w-full sm:w-auto transition-all duration-300 hover:shadow-xl">
                  Begin
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </Container>
        </section>

        {/* Features Section - More cohesive and elegant */}
        <section id="how-it-works" className="py-20 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
          <Container>
            <div className="text-center mb-14">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-maroon/10 text-maroon mb-3">
                SIMPLE PROCESS
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5 text-gray-800">How It Works</h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-light">
                Our intelligent skin analysis platform streamlines your journey to exceptional skin. Three simple steps to transform your skincare routine.
              </p>
            </div>
            
            <div className="relative">
              {/* Connecting Line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-maroon/5 via-maroon/20 to-maroon/5 hidden md:block"></div>
              
              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    title: "Upload Your Photos",
                    description: "Provide clear photos to help our AI understand your skin concerns and texture.",
                    icon: "📷",
                    step: "01",
                  },
                  {
                    title: "AI Analysis",
                    description: "Our advanced AI evaluates your unique skin characteristics to create personalized recommendations.",
                    icon: "✨",
                    step: "02",
                  },
                  {
                    title: "Receive Your Skin Analysis",
                    description: "Get instant access to your personalized skincare recommendations and treatment options.",
                    icon: "🧪",
                    step: "03",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="relative bg-white p-6 rounded-xl shadow-soft border border-maroon/5 flex flex-col items-center text-center transition-all duration-300 hover:shadow-soft-lg hover:translate-y-[-4px] group"
                  >
                    <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-maroon/10 to-white rounded-full mb-5 text-2xl relative z-10">
                      {feature.icon}
                      <div className="absolute -right-2 -top-2 bg-maroon text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                        {feature.step}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 group-hover:text-maroon transition-colors">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-14 text-center">
              <Link href="/upload" passHref>
                <Button variant="gradient" size="lg" className="shadow-soft group">
                  Start Your Skin Journey
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </Container>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-20 bg-white">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-5 text-gray-800">What Our Patients Say</h2>
              <p className="text-base text-gray-600 max-w-2xl mx-auto">
                Discover how our skin analysis has transformed skincare for people just like you.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  quote: "The AI analysis identified issues I didn't even know I had, and the recommended treatments made a huge difference.",
                  name: "Emma T.",
                  role: "Patient",
                },
                {
                  quote: "The AI recommendations were spot-on! After years of trying different products, I finally found what works for my skin.",
                  name: "Michael K.",
                  role: "Patient",
                },
                {
                  quote: "My skin has never looked better. The personalized approach made all the difference in my skincare routine.",
                  name: "Sophia L.",
                  role: "Patient",
                },
              ].map((testimonial, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="flex text-maroon mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 mr-3"></div>
                    <div>
                      <p className="font-medium text-sm">{testimonial.name}</p>
                      <p className="text-gray-500 text-xs">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-10 bg-white">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-semibold text-maroon mb-4">Dr. Bashar Clinic</h3>
              <p className="text-sm text-gray-600 mb-4 max-w-md">
                Revolutionizing skincare through AI-powered analysis and personalized treatment recommendations.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 text-gray-500 hover:text-maroon hover:border-maroon transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 text-gray-500 hover:text-maroon hover:border-maroon transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-gray-600 hover:text-maroon transition-colors">About Us</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-maroon transition-colors">Services</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-maroon transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-gray-600 hover:text-maroon transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-maroon transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-maroon transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 mt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Dr. Bashar Clinic. All rights reserved.
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
