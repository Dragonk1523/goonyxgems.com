import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { OnyxLogo } from "@/components/onyx-logo";
import { ColorPicker } from "@/components/color-picker";
import { Sidebar } from "@/components/sidebar";
import houseImage from "@assets/IMG_20250614_145904_1749927554477.jpg";
import kilburnLogo from "@assets/image_1760392044719.png";
import { 
  Sun, 
  Zap, 
  DollarSign, 
  Shield, 
  CheckCircle, 
  TrendingDown,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Calculator,
  Home,
  Award
} from "lucide-react";

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customColor, setCustomColor] = useState("#d4a574");

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Apply custom color to CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--onyx-gold', customColor);
    
    // Generate lighter and darker variants
    const hex = customColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Lighter variant (increase lightness by 15%)
    const lighter = `rgb(${Math.min(255, Math.round(r * 1.15))}, ${Math.min(255, Math.round(g * 1.15))}, ${Math.min(255, Math.round(b * 1.15))})`;
    document.documentElement.style.setProperty('--onyx-gold-light', lighter);
    
    // Darker variant (decrease lightness by 15%)
    const darker = `rgb(${Math.round(r * 0.85)}, ${Math.round(g * 0.85)}, ${Math.round(b * 0.85)})`;
    document.documentElement.style.setProperty('--onyx-gold-dark', darker);
    
    // Glow variant (30% opacity)
    document.documentElement.style.setProperty('--onyx-gold-glow', `${customColor}4D`);
  }, [customColor]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <Sidebar />
      {/* Header - Mobile Optimized */}
      <header className="fixed top-0 w-full bg-black/90 backdrop-blur-sm border-b border-onyx-gold/20 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Mobile Logo - Fits Header */}
            <div className="md:hidden">
              <OnyxLogo size={100} />
            </div>
            {/* Desktop Logo */}
            <div className="hidden md:block">
              <OnyxLogo size={120} />
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center">
              <Button 
                size="sm" 
                className="bg-onyx-gold text-black font-bold"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                Menu
              </Button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-onyx-gold font-medium hover:text-onyx-gold transition-colors">
                Why Go Solar
              </Link>
              <Link href="/about" className="text-gray-300 hover:text-onyx-gold font-medium transition-colors">
                About
              </Link>
              <Link href="/extras" className="text-gray-300 hover:text-onyx-gold font-medium transition-colors">
                Extras
              </Link>
              <Link href="/gallery" className="text-gray-300 hover:text-onyx-gold font-medium transition-colors">
                Gallery
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-onyx-gold font-medium transition-colors">
                Contact
              </Link>
              <Button 
                asChild 
                variant="outline"
                className="border-onyx-gold text-onyx-gold hover:bg-onyx-gold hover:text-black font-bold px-4"
              >
                <Link href="/contact">Residential Quote</Link>
              </Button>
              <Button 
                asChild 
                className="bg-onyx-gold hover:bg-onyx-gold text-black font-bold px-4"
              >
                <Link href="/contact">Commercial Quote</Link>
              </Button>
            </nav>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-sm border-t border-onyx-gold/20">
            <div className="px-4 py-4 space-y-4">
              <Link 
                href="/" 
                className="block text-onyx-gold font-medium text-center py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Why Go Solar
              </Link>
              <Link 
                href="/about" 
                className="block text-gray-300 font-medium text-center py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/extras" 
                className="block text-gray-300 font-medium text-center py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Extras
              </Link>
              <Link 
                href="/gallery" 
                className="block text-gray-300 font-medium text-center py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Gallery
              </Link>
              <Link 
                href="/contact" 
                className="block text-gray-300 font-medium text-center py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="space-y-3 pt-4">
                <Button 
                  asChild 
                  variant="outline"
                  className="border-onyx-gold text-onyx-gold hover:bg-onyx-gold hover:text-black font-bold w-full"
                >
                  <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                    Residential Quote
                  </Link>
                </Button>
                <Button 
                  asChild 
                  className="bg-onyx-gold hover:bg-onyx-gold text-black font-bold w-full"
                >
                  <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                    Commercial Quote
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section 
        className="relative flex items-center justify-center hero-section"
        style={{
          minHeight: '100vh',
          backgroundImage: `url(${houseImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>
        
        <div 
          className="relative z-10 text-center text-white px-4"
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: 'clamp(2rem, 10vh, 8rem) 1rem clamp(1rem, 5vh, 4rem)'
          }}
        >
          <div 
            className="inline-block bg-black bg-opacity-80 text-onyx-gold border border-onyx-gold rounded-full px-6 py-2"
            style={{
              fontSize: 'clamp(0.8rem, 2vw, 1.1rem)',
              marginBottom: 'clamp(1.5rem, 4vh, 3rem)'
            }}
          >
            #1 Solar Installer in Massachusetts
          </div>
          
          <h1 
            className="font-bold text-onyx-gold"
            style={{
              fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
              lineHeight: '1.1',
              marginBottom: 'clamp(1.5rem, 4vh, 3rem)',
              textShadow: '3px 3px 6px rgba(0,0,0,0.8)'
            }}
          >
            Switch to Solar Power<br />
            with Onyx Energy Solutions
          </h1>
          
          <p 
            style={{
              fontSize: 'clamp(1.1rem, 3vw, 1.8rem)',
              maxWidth: '800px',
              margin: '0 auto',
              marginBottom: 'clamp(2rem, 6vh, 4rem)',
              lineHeight: '1.5',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}
          >
            Make the switch to solar energy and start saving on your electricity bills while reducing your carbon footprint.
          </p>
          
          <div 
            className="flex flex-wrap justify-center gap-4"
            style={{marginBottom: 'clamp(2rem, 5vh, 3rem)'}}
          >
            <Button 
              asChild 
              className="bg-onyx-gold hover:bg-onyx-gold-light text-black font-bold shadow-xl transition-all duration-300"
              style={{
                padding: 'clamp(1rem, 2.5vh, 1.5rem) clamp(2rem, 5vw, 3rem)',
                fontSize: 'clamp(1rem, 2.2vw, 1.3rem)',
                minWidth: 'clamp(250px, 30vw, 320px)',
                borderRadius: '8px'
              }}
            >
              <Link href="/contact">
                <Home style={{marginRight: '0.5rem', width: 'clamp(1.2rem, 2.5vw, 1.5rem)', height: 'clamp(1.2rem, 2.5vw, 1.5rem)'}} />
                Residential Quote
              </Link>
            </Button>
            
            <Button 
              asChild 
              className="bg-onyx-gold-dark hover:bg-onyx-gold text-black font-bold shadow-xl transition-all duration-300"
              style={{
                padding: 'clamp(1rem, 2.5vh, 1.5rem) clamp(2rem, 5vw, 3rem)',
                fontSize: 'clamp(1rem, 2.2vw, 1.3rem)',
                minWidth: 'clamp(250px, 30vw, 320px)',
                borderRadius: '8px'
              }}
            >
              <Link href="/contact">
                <Zap style={{marginRight: '0.5rem', width: 'clamp(1.2rem, 2.5vw, 1.5rem)', height: 'clamp(1.2rem, 2.5vw, 1.5rem)'}} />
                Commercial Quote
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline"
              className="border-2 border-onyx-gold text-onyx-gold hover:bg-onyx-gold hover:text-black font-bold shadow-xl transition-all duration-300"
              style={{
                padding: 'clamp(1rem, 2.5vh, 1.5rem) clamp(2rem, 5vw, 3rem)',
                fontSize: 'clamp(1rem, 2.2vw, 1.3rem)',
                minWidth: 'clamp(250px, 30vw, 320px)',
                borderRadius: '8px'
              }}
            >
              <a href="tel:5082571664">
                <Phone style={{marginRight: '0.5rem', width: 'clamp(1.2rem, 2.5vw, 1.5rem)', height: 'clamp(1.2rem, 2.5vw, 1.5rem)'}} />
                Call (508) 257-1664
              </a>
            </Button>
          </div>

          <p 
            className="text-onyx-gold font-semibold italic"
            style={{
              fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}
          >
            "Gold Standards Keeping You in the Black"
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-gray-900 to-black">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center max-w-6xl mx-auto">
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold text-onyx-gold mb-4 group-hover:scale-110 transition-transform duration-300">1000+</div>
              <div className="text-onyx-gold text-lg font-medium">Installations</div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold text-onyx-gold mb-4 group-hover:scale-110 transition-transform duration-300">$2M+</div>
              <div className="text-onyx-gold text-lg font-medium">Customer Savings</div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold text-onyx-gold mb-4 group-hover:scale-110 transition-transform duration-300">25</div>
              <div className="text-onyx-gold text-lg font-medium">Year Warranty</div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold text-onyx-gold mb-4 group-hover:scale-110 transition-transform duration-300">A+</div>
              <div className="text-onyx-gold text-lg font-medium">BBB Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Go Solar Section */}
      <section className="py-24 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-onyx-gold">
              Why Go Solar?
            </h2>
            <p className="text-xl text-onyx-gold leading-relaxed">
              Transform your energy future with cutting-edge solar technology. 
              Join thousands of Massachusetts homeowners who've already made the switch.
            </p>
          </div>

          {/* Interactive Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="group relative">
              <Card className="bg-gray-900/80 border-gray-700 hover:border-onyx-gold/70 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-onyx-gold/20 backdrop-blur-sm">
                <CardHeader className="relative">
                  <div className="absolute -top-6 left-6 w-12 h-12 bg-gradient-to-r from-onyx-gold to-onyx-gold-dark rounded-full flex items-center justify-center shadow-lg">
                    <DollarSign className="h-6 w-6 text-black" />
                  </div>
                  <CardTitle className="text-onyx-gold text-xl mt-8 group-hover:text-onyx-gold-light transition-colors">
                    Massive Savings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-3xl font-bold text-onyx-gold">90%</div>
                    <p className="text-onyx-gold leading-relaxed">
                      Average electricity bill reduction. Massachusetts customers save 
                      <span className="text-onyx-gold-light font-semibold"> $25,000+</span> over 20 years.
                    </p>
                    <div className="flex justify-between text-sm text-onyx-gold pt-2 border-t border-onyx-gold/30">
                      <span>Avg Monthly: $180 → $18</span>
                      <span className="text-onyx-gold-light">$162/mo saved</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="group relative">
              <Card className="bg-gray-900/80 border-gray-700 hover:border-onyx-gold/70 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-onyx-gold/20 backdrop-blur-sm">
                <CardHeader className="relative">
                  <div className="absolute -top-6 left-6 w-12 h-12 bg-gradient-to-r from-onyx-gold to-onyx-gold-dark rounded-full flex items-center justify-center shadow-lg">
                    <Shield className="h-6 w-6 text-black" />
                  </div>
                  <CardTitle className="text-onyx-gold text-xl mt-8 group-hover:text-onyx-gold-light transition-colors">
                    Energy Freedom
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-3xl font-bold text-onyx-gold">24/7</div>
                    <p className="text-onyx-gold leading-relaxed">
                      Power independence from rising utility rates. Massachusetts electricity 
                      costs have increased <span className="text-onyx-gold-light font-semibold">40%</span> in 5 years.
                    </p>
                    <div className="flex justify-between text-sm text-onyx-gold pt-2 border-t border-onyx-gold/30">
                      <span>Rate Protection</span>
                      <span className="text-onyx-gold-light">Locked In</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="group relative">
              <Card className="bg-gray-900/80 border-gray-700 hover:border-onyx-gold/70 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-onyx-gold/20 backdrop-blur-sm">
                <CardHeader className="relative">
                  <div className="absolute -top-6 left-6 w-12 h-12 bg-gradient-to-r from-onyx-gold to-onyx-gold-dark rounded-full flex items-center justify-center shadow-lg">
                    <TrendingDown className="h-6 w-6 text-black" />
                  </div>
                  <CardTitle className="text-onyx-gold text-xl mt-8 group-hover:text-onyx-gold-light transition-colors">
                    Home Value Boost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-3xl font-bold text-onyx-gold">4%</div>
                    <p className="text-onyx-gold leading-relaxed">
                      Average home value increase. Plus qualify for 
                      <span className="text-onyx-gold-light font-semibold"> 30% federal tax credit</span> in 2024.
                    </p>
                    <div className="flex justify-between text-sm text-onyx-gold pt-2 border-t border-onyx-gold/30">
                      <span>Investment Grade</span>
                      <span className="text-onyx-gold-light">Premium</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Advanced ROI Calculator Preview */}
          <div className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 rounded-2xl p-8 border border-onyx-gold/30 backdrop-blur-sm">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-onyx-gold mb-2">Massachusetts Solar ROI</h3>
              <p className="text-onyx-gold">Average customer metrics based on $180/month electric bill</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-onyx-gold">6.2</div>
                <div className="text-sm text-onyx-gold">Years to Break Even</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-onyx-gold">280%</div>
                <div className="text-sm text-onyx-gold">20-Year ROI</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-onyx-gold">$45K</div>
                <div className="text-sm text-onyx-gold">Net Profit</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-onyx-gold">30%</div>
                <div className="text-sm text-onyx-gold">Federal Tax Credit</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gradient-to-r from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Simple 4-Step Process</h2>
            <p className="text-xl text-onyx-gold">From consultation to installation, we make going solar easy.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Free Consultation", desc: "We assess your home and energy needs" },
              { step: "2", title: "Custom Design", desc: "We create a solar system tailored to your property" },
              { step: "3", title: "Installation", desc: "Our certified team installs your system" },
              { step: "4", title: "Start Saving", desc: "Begin enjoying lower energy bills immediately" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-onyx-gold rounded-full flex items-center justify-center text-black font-bold text-xl mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-onyx-gold mb-2">{item.title}</h3>
                <p className="text-onyx-gold">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-onyx-gold/10 to-onyx-gold/10 border-onyx-gold/30 max-w-4xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="flex justify-center mb-6">
                {[1,2,3,4,5].map((star) => (
                  <CheckCircle key={star} className="h-6 w-6 text-onyx-gold mx-1" />
                ))}
              </div>
              <blockquote className="text-2xl text-onyx-gold mb-6 italic">
                "Onyx Energy Solutions saved us over $3,000 in our first year alone. 
                The installation was professional and the team was knowledgeable. 
                Highly recommend!"
              </blockquote>
              <div className="text-onyx-gold font-bold">- Sarah M., Cambridge, MA</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-onyx-gold/20 to-onyx-gold/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-onyx-gold mb-6">Ready to Start Saving?</h2>
          <p className="text-xl text-onyx-gold mb-8 max-w-2xl mx-auto">
            Get your free solar consultation today and discover how much you can save with solar energy.
          </p>
          <Button 
            asChild 
            size="lg" 
            className="bg-onyx-gold hover:bg-onyx-gold text-black font-bold px-12 py-6 text-xl"
          >
            <Link href="/contact">
              Get Your Free Quote Now
              <ArrowRight className="ml-2 h-6 w-6" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <OnyxLogo size={40} />
                <div>
                  <h3 className="text-xl font-bold text-onyx-gold">Onyx Energy Solutions</h3>
                  <p className="text-xs text-gray-400">Massachusetts Solar Experts</p>
                </div>
              </div>
              <p className="text-onyx-gold mb-4">
                Gold standards keeping you in the black.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-onyx-gold mb-4">Contact</h4>
              <div className="space-y-2 text-onyx-gold">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-onyx-gold" />
                  <span>(508) 257-1664</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-onyx-gold" />
                  <span>info@goonyxgems.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-onyx-gold" />
                  <span>Massachusetts & Surrounding Areas</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-onyx-gold mb-4">Services</h4>
              <ul className="space-y-2 text-onyx-gold">
                <li>Residential Solar Installation</li>
                <li>Commercial Solar Systems</li>
                <li>Solar Panel Maintenance</li>
                <li>Energy Storage Solutions</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-onyx-gold mb-4">Certifications</h4>
              <div className="space-y-2 text-onyx-gold">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-onyx-gold" />
                  <span>Licensed & Insured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-onyx-gold" />
                  <span>Licensed & Insured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-onyx-gold" />
                  <span>NABCEP Certified</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-onyx-gold/30 pt-8 text-center text-onyx-gold">
            <p>&copy; 2024 Onyx Energy Solutions. All rights reserved. | Massachusetts Solar Installation Company</p>
            <div className="flex items-center justify-center mt-4 pt-4 border-t border-onyx-gold/20">
              <img 
                src={kilburnLogo} 
                alt="Kilburn Tech Solutions" 
                className="w-6 h-6 opacity-70 mr-2"
              />
              <span className="text-xs text-onyx-gold/70">
                Website by Kilburn Tech Solutions
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}