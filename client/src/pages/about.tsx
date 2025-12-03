import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { OnyxLogo } from "@/components/onyx-logo";

export default function About() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header - Dark Mode */}
      <header className="bg-black border-b border-gray-800 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center space-x-2">
                <OnyxLogo size={40} className="text-onyx-gold" />
                <span className="text-xl font-bold text-onyx-gold">Onyx Energy Solutions</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-300 hover:text-onyx-gold font-medium">Why Go Solar</Link>
              <Link href="/about" className="text-onyx-gold font-medium">About</Link>
              <Link href="/extras" className="text-gray-300 hover:text-onyx-gold font-medium">Extras</Link>
              <Link href="/contact" className="text-gray-300 hover:text-onyx-gold font-medium">Contact</Link>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input 
                    type="search" 
                    placeholder="Search..." 
                    className="pl-4 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-onyx-gold focus:border-onyx-gold"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* About Content - Dark Mode */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-onyx-gold mb-6">
              About Onyx Energy Solutions
            </h1>
            <p className="text-xl text-onyx-gold">
              Massachusetts' trusted solar installation experts
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold text-onyx-gold mb-6">Our Mission</h2>
              <p className="text-lg text-onyx-gold leading-relaxed">
                "To build a community and culture of empowered, compassionate, selfless, and financially independent people by achieving a shared victory for energy-independent families, communities, and the planet we serve."
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-700 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-onyx-gold mb-4">Why Choose Onyx?</h3>
              <ul className="space-y-3 text-onyx-gold">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-onyx-gold rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Licensed and insured solar professionals
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-onyx-gold rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Hundreds of successful installations across Massachusetts
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-onyx-gold rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Comprehensive warranties and ongoing support
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-onyx-gold rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Transparent pricing with no hidden fees
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-onyx-gold rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Local expertise in Massachusetts regulations and incentives
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center bg-gray-900 border border-gray-700 py-16 rounded-lg">
            <h2 className="text-3xl font-bold text-onyx-gold mb-6">
              Ready to Go Solar?
            </h2>
            <p className="text-lg text-onyx-gold mb-8 max-w-2xl mx-auto">
              Join hundreds of Massachusetts families and businesses who have made the switch to clean, 
              renewable solar energy with Onyx Energy Solutions.
            </p>
            <Link href="/contact">
              <Button size="lg" className="bg-onyx-gold hover:bg-yellow-400 text-black px-8 py-3 text-lg font-bold">
                Get Your Free Quote Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Dark Mode */}
      <footer className="bg-gray-900 border-t border-gray-800 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <OnyxLogo size={32} className="text-onyx-gold" />
            <span className="text-xl font-bold text-onyx-gold">Onyx Energy Solutions</span>
          </div>
          <p className="text-onyx-gold mb-4">
            Gold standards keeping you in the black
          </p>
          <p className="text-onyx-gold text-sm">
            &copy; 2024 Onyx Energy Solutions. All rights reserved. | Massachusetts Solar Installation Company
          </p>
        </div>
      </footer>
    </div>
  );
}