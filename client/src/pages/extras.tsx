import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { OnyxLogo } from "@/components/onyx-logo";
import { 
  Battery, 
  Home, 
  Wind, 
  Zap, 
  Shield, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Gauge
} from "lucide-react";

const extras = [
  {
    id: 1,
    icon: Battery,
    title: "Battery Storage Systems",
    description: "Power your home even during outages with cutting-edge battery storage technology.",
    features: [
      "24/7 backup power",
      "Energy independence",
      "Peak shaving capabilities",
      "25-year warranty"
    ],
    gradient: "from-blue-500/20 to-purple-500/20"
  },
  {
    id: 2,
    icon: Home,
    title: "Roofing Services",
    description: "Complete roofing solutions including new installations and repairs before solar setup.",
    features: [
      "New roof installations",
      "Roof repairs & maintenance",
      "Same-day assessments",
      "Solar-ready preparation"
    ],
    gradient: "from-amber-500/20 to-orange-500/20"
  },
  {
    id: 3,
    icon: Wind,
    title: "Mini-Split HVAC Systems",
    description: "Efficient heating and cooling solutions that pair perfectly with your solar installation.",
    features: [
      "Energy-efficient climate control",
      "Zone-based temperature management",
      "Whisper-quiet operation",
      "Smart home integration"
    ],
    gradient: "from-cyan-500/20 to-blue-500/20"
  },
  {
    id: 4,
    icon: Zap,
    title: "EV Chargers",
    description: "Future-proof your home with electric vehicle charging stations powered by solar.",
    features: [
      "Level 2 fast charging",
      "Smart charging schedules",
      "Solar-optimized charging",
      "Multiple connector types"
    ],
    gradient: "from-green-500/20 to-emerald-500/20"
  },
  {
    id: 5,
    icon: Gauge,
    title: "Energy Monitoring",
    description: "Track your energy production and consumption in real-time with advanced monitoring systems.",
    features: [
      "Real-time analytics",
      "Mobile app access",
      "Usage optimization alerts",
      "Historical data tracking"
    ],
    gradient: "from-violet-500/20 to-purple-500/20"
  },
  {
    id: 6,
    icon: Shield,
    title: "Extended Warranties",
    description: "Comprehensive protection plans for your entire solar ecosystem and components.",
    features: [
      "Up to 30-year coverage",
      "Zero-deductible service",
      "Performance guarantees",
      "Transferable warranties"
    ],
    gradient: "from-rose-500/20 to-pink-500/20"
  }
];

export default function Extras() {
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
              <Link href="/about" className="text-gray-300 hover:text-onyx-gold font-medium">About</Link>
              <Link href="/extras" className="text-onyx-gold font-medium">Extras</Link>
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

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-onyx-gold/10 via-transparent to-purple-500/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-onyx-gold/20 via-transparent to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-onyx-gold/10 border border-onyx-gold/30 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-onyx-gold" />
              <span className="text-onyx-gold text-sm font-medium">Complete Solar Solutions</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-onyx-gold mb-6 leading-tight">
              More Than Just
              <span className="block text-onyx-gold">
                Solar Panels
              </span>
            </h1>
            
            <p className="text-xl text-onyx-gold mb-8 max-w-2xl mx-auto">
              Discover our comprehensive range of energy solutions and home upgrades that complement your solar installation.
            </p>
            
            <Link href="/contact">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-onyx-gold to-yellow-600 hover:from-yellow-600 hover:to-onyx-gold text-black px-8 py-6 text-lg font-bold shadow-lg shadow-onyx-gold/50 group"
                data-testid="button-get-quote"
              >
                Get Your Custom Quote
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {extras.map((extra) => {
              const Icon = extra.icon;
              return (
                <Card 
                  key={extra.id}
                  className="group relative bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-onyx-gold/50 transition-all duration-300 hover:shadow-2xl hover:shadow-onyx-gold/20 hover:-translate-y-2 overflow-hidden"
                  data-testid={`card-extra-${extra.id}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${extra.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  <CardHeader className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-onyx-gold/20 to-yellow-600/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-onyx-gold" />
                    </div>
                    <CardTitle className="text-2xl text-white group-hover:text-onyx-gold transition-colors">
                      {extra.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="relative z-10">
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      {extra.description}
                    </p>
                    
                    <ul className="space-y-3">
                      {extra.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-onyx-gold flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full mt-6 text-onyx-gold hover:text-yellow-400 hover:bg-onyx-gold/10 group/btn"
                      data-testid={`button-learn-more-${extra.id}`}
                    >
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative bg-gradient-to-br from-onyx-gold/10 via-gray-900 to-purple-500/10 border border-onyx-gold/30 rounded-3xl p-12 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-onyx-gold/20 via-transparent to-transparent"></div>
            
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <TrendingUp className="w-16 h-16 text-onyx-gold mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Maximize Your Energy Savings?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Combine our solar solutions with these premium extras for the ultimate energy-independent home.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button 
                    size="lg" 
                    className="bg-onyx-gold hover:bg-yellow-400 text-black px-8 py-6 text-lg font-bold"
                    data-testid="button-contact-expert"
                  >
                    Contact an Expert
                  </Button>
                </Link>
                <Link href="/gallery">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-onyx-gold text-onyx-gold hover:bg-onyx-gold/10 px-8 py-6 text-lg font-bold"
                    data-testid="button-view-gallery"
                  >
                    View Our Work
                  </Button>
                </Link>
              </div>
            </div>
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
