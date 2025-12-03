import { Button } from "@/components/ui/button";
import { Sun, Menu, Camera, Smartphone } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { OnyxLogo } from "@/components/onyx-logo";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [showStickyQuote, setShowStickyQuote] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      if (heroRef.current) {
        const heroHeight = heroRef.current.offsetHeight;
        setShowStickyQuote(currentScrollY > heroHeight * 0.7);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToQuote = () => {
    const quoteSection = document.getElementById('quote-section');
    if (quoteSection) {
      quoteSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Clean Onyx Design matching onyxenersol.com */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <OnyxLogo size={48} className="text-black" />
              <span className="text-2xl font-bold text-gray-900">Onyx Energy Solutions</span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">Why Go Solar</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 font-medium">About</Link>
              <Link href="/ar-preview" className="text-gray-600 hover:text-gray-900 font-medium flex items-center space-x-1">
                <Camera className="h-4 w-4" />
                <span>AR Preview</span>
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 font-medium">Contact</Link>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input 
                    type="search" 
                    placeholder="Search..." 
                    className="pl-4 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </button>
                </div>
              </div>
            </nav>

            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Exact match to onyxenersol.com */}
      <section 
        ref={heroRef}
        className="relative min-h-screen bg-cover bg-center bg-no-repeat text-white overflow-hidden flex items-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><rect fill="%23334155" width="1200" height="800"/><defs><pattern id="solarGrid" x="0" y="0" width="240" height="160" patternUnits="userSpaceOnUse"><rect fill="%23475569" width="240" height="160"/><rect fill="%231e293b" x="5" y="5" width="230" height="150" rx="8"/><rect fill="%230f172a" x="10" y="10" width="220" height="140" rx="6"/><g stroke="%23334155" stroke-width="2" fill="none"><line x1="10" y1="30" x2="230" y2="30"/><line x1="10" y1="50" x2="230" y2="50"/><line x1="10" y1="70" x2="230" y2="70"/><line x1="10" y1="90" x2="230" y2="90"/><line x1="10" y1="110" x2="230" y2="110"/><line x1="10" y1="130" x2="230" y2="130"/><line x1="30" y1="10" x2="30" y2="150"/><line x1="50" y1="10" x2="50" y2="150"/><line x1="70" y1="10" x2="70" y2="150"/><line x1="90" y1="10" x2="90" y2="150"/><line x1="110" y1="10" x2="110" y2="150"/><line x1="130" y1="10" x2="130" y2="150"/><line x1="150" y1="10" x2="150" y2="150"/><line x1="170" y1="10" x2="170" y2="150"/><line x1="190" y1="10" x2="190" y2="150"/><line x1="210" y1="10" x2="210" y2="150"/></g></pattern></defs><rect fill="url(%23solarGrid)" width="1200" height="800"/></svg>')`,
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      >
        <div className="relative container mx-auto px-4 py-32 z-10 max-w-4xl">
          <div className="text-center space-y-8">
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Switch to Solar Power with Onyx Energy Solutions
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Make the switch to solar energy and start saving on your electricity bills while reducing your carbon footprint. 
              Onyx Energy Solutions offers reliable and eco-friendly solar power solutions for your home or business.
            </p>
            
            <p className="text-lg text-yellow-300 font-medium">
              Gold Standards Keeping You in the Black
            </p>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section id="quote-section" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Ready to Get Started?
          </h2>
          <Button 
            size="lg" 
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-12 py-4 text-xl font-bold rounded-full"
            onClick={scrollToQuote}
          >
            Get Your Free Solar Quote
          </Button>
          <p className="mt-4 text-gray-600">
            Massachusetts homeowners - start saving with solar today
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sun className="h-6 w-6 text-yellow-400" />
            <span className="text-xl font-bold">Onyx Energy Solutions</span>
          </div>
          <p className="text-gray-400 mb-4">
            Gold standards keeping you in the black
          </p>
          <p className="text-gray-500">
            &copy; 2024 Onyx Energy Solutions. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}