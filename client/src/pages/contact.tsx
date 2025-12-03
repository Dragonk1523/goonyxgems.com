import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Phone, 
  Mail, 
  Calculator,
  Home,
  Zap,
  DollarSign,
  ArrowRight
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { OnyxLogo } from "@/components/onyx-logo";
import { Link } from "wouter";

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    monthlyBill: "",
    quoteType: "residential",
    message: ""
  });

  const [savings, setSavings] = useState<{
    annualSavings: number;
    twentyYearSavings: number;
  } | null>(null);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact"] });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        monthlyBill: "",
        quoteType: "residential",
        message: ""
      });
      setSavings(null);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Calculate savings in real-time for monthly bill
    if (name === "monthlyBill" && value) {
      const monthlyAmount = parseFloat(value.replace(/[^\d.]/g, ''));
      if (!isNaN(monthlyAmount) && monthlyAmount > 0) {
        const annualBill = monthlyAmount * 12;
        const annualSavings = Math.round(annualBill * 0.8); // 80% reduction
        const twentyYearSavings = annualSavings * 20;
        setSavings({ annualSavings, twentyYearSavings });
      } else {
        setSavings(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

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
              <Link href="/extras" className="text-gray-300 hover:text-onyx-gold font-medium">Extras</Link>
              <Link href="/contact" className="text-onyx-gold font-medium">Contact</Link>
              
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
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-8 text-onyx-gold">
            Get Your Free Solar Quote
          </h1>
          <p className="text-xl text-onyx-gold mb-8 max-w-3xl mx-auto">
            Join hundreds of Massachusetts homeowners saving thousands with solar energy. 
            Start with a quick call or get information sent to your email.
          </p>
          
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-8">
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="border-onyx-gold text-onyx-gold hover:bg-onyx-gold hover:text-black px-8 py-4"
            >
              <Link href="tel:5082571664">
                <Phone className="mr-2 h-5 w-5" />
                Call (508) 257-1664
              </Link>
            </Button>
            
            <div className="text-gray-400">or fill out the form below</div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl text-onyx-gold flex items-center">
                <Calculator className="mr-3 h-8 w-8 text-onyx-gold" />
                Solar Savings Calculator & Quote Request
              </CardTitle>
              <p className="text-onyx-gold">
                Get an instant estimate of your solar savings potential and request a detailed quote.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Quote Type Selection */}
                <div>
                  <h3 className="text-xl font-bold text-onyx-gold mb-4 flex items-center">
                    <Zap className="mr-2 h-5 w-5 text-onyx-gold" />
                    Quote Type
                  </h3>
                  <div>
                    <Label htmlFor="quoteType" className="text-onyx-gold font-medium">Select Quote Type *</Label>
                    <select
                      id="quoteType"
                      name="quoteType"
                      value={formData.quoteType}
                      onChange={handleInputChange}
                      required
                      className="mt-1 w-full bg-gray-800/50 border border-gray-600 text-onyx-gold focus:border-onyx-gold focus:ring-onyx-gold rounded-md px-3 py-2"
                    >
                      <option value="residential">Residential Solar Installation</option>
                      <option value="commercial">Commercial Solar Solutions</option>
                    </select>
                  </div>
                </div>

                {/* Personal Information */}
                <div>
                  <h3 className="text-xl font-bold text-onyx-gold mb-4 flex items-center">
                    <Home className="mr-2 h-5 w-5 text-onyx-gold" />
                    Personal Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-onyx-gold font-medium">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="mt-1 bg-gray-800/50 border-gray-600 text-white focus:border-onyx-gold focus:ring-onyx-gold"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-onyx-gold font-medium">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="mt-1 bg-gray-800/50 border-gray-600 text-white focus:border-onyx-gold focus:ring-onyx-gold"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="email" className="text-onyx-gold font-medium">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1 bg-gray-800/50 border-gray-600 text-white focus:border-onyx-gold focus:ring-onyx-gold"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-onyx-gold font-medium">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="mt-1 bg-gray-800/50 border-gray-600 text-white focus:border-onyx-gold focus:ring-onyx-gold"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Property & Energy Information */}
                <div>
                  <h3 className="text-xl font-bold text-onyx-gold mb-4 flex items-center">
                    <Zap className="mr-2 h-5 w-5 text-onyx-gold" />
                    Property & Energy Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address" className="text-onyx-gold font-medium">Property Address *</Label>
                      <Input
                        id="address"
                        name="address"
                        type="text"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        placeholder="123 Main Street, Boston, MA 02101"
                        className="mt-1 bg-gray-800/50 border-gray-600 text-white focus:border-onyx-gold focus:ring-onyx-gold"
                      />
                      <p className="text-sm text-onyx-gold mt-1">
                        We need your address to analyze your roof and solar potential
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="monthlyBill" className="text-onyx-gold font-medium">Average Monthly Electric Bill *</Label>
                      <div className="relative mt-1">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-onyx-gold" />
                        <Input
                          id="monthlyBill"
                          name="monthlyBill"
                          type="text"
                          value={formData.monthlyBill}
                          onChange={handleInputChange}
                          required
                          placeholder="150"
                          className="pl-10 bg-gray-800/50 border-gray-600 text-white focus:border-onyx-gold focus:ring-onyx-gold"
                        />
                      </div>
                      <p className="text-sm text-onyx-gold mt-1">
                        Enter your average monthly electricity bill amount (numbers only)
                      </p>
                      
                      {/* Real-time Savings Calculator */}
                      {savings && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-onyx-gold/10 to-yellow-400/10 border border-onyx-gold/30 rounded-lg">
                          <h4 className="font-bold text-onyx-gold mb-2 flex items-center">
                            <Calculator className="mr-2 h-4 w-4" />
                            Your Estimated Solar Savings
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-onyx-gold">${savings.annualSavings.toLocaleString()}</div>
                              <div className="text-sm text-onyx-gold">Annual Savings</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-onyx-gold">${savings.twentyYearSavings.toLocaleString()}</div>
                              <div className="text-sm text-onyx-gold">20-Year Savings</div>
                            </div>
                          </div>
                          <p className="text-sm text-onyx-gold mt-2 text-center">
                            *Estimates based on 80% bill reduction with solar
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Additional Information */}
                <div>
                  <Label htmlFor="message" className="text-onyx-gold font-medium">Additional Information</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your energy goals, roof details, or any questions you have..."
                    rows={4}
                    className="mt-1 bg-gray-800/50 border-gray-600 text-white focus:border-onyx-gold focus:ring-onyx-gold"
                  />
                </div>

                <div className="bg-gradient-to-r from-onyx-gold/10 to-yellow-400/10 border border-onyx-gold/30 rounded-lg p-6 text-center">
                  <h4 className="text-xl font-bold text-onyx-gold mb-4">Ready for Your Free Quote?</h4>
                  <p className="text-onyx-gold mb-6">
                    For the most accurate solar quote and personalized consultation, please call us directly. 
                    Our solar experts are standing by to help you calculate your exact savings.
                  </p>
                  
                  <div className="space-y-4">
                    <Button 
                      asChild
                      size="lg"
                      className="w-full bg-onyx-gold hover:bg-yellow-400 text-black py-4 text-lg font-bold"
                    >
                      <Link href="tel:5082571664">
                        <Phone className="mr-2 h-5 w-5" />
                        Call Now for Free Quote: (508) 257-1664
                      </Link>
                    </Button>
                    
                    <div className="text-onyx-gold text-sm">or</div>
                    
                    <Button 
                      type="submit" 
                      variant="outline"
                      size="lg"
                      className="w-full border-onyx-gold text-onyx-gold hover:bg-onyx-gold hover:text-black py-4 text-lg"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? (
                        "Sending Information..."
                      ) : (
                        <>
                          <Mail className="mr-2 h-5 w-5" />
                          Email Me Solar Information
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-400 mt-4">
                    By clicking "Email Me Solar Information", your details will be sent to info@goonyxgems.com 
                    and we'll follow up with solar information within 24 hours.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <OnyxLogo size={40} />
            <div>
              <h3 className="text-xl font-bold text-onyx-gold">Onyx Energy Solutions</h3>
              <p className="text-xs text-gray-400">Massachusetts Solar Experts</p>
            </div>
          </div>
          <p className="text-onyx-gold mb-4 italic">
            "Gold Standards Keeping You in the Black"
          </p>
          <p className="text-gray-500 text-sm">
            &copy; 2024 Onyx Energy Solutions. All rights reserved. | Massachusetts Solar Installation Company
          </p>
        </div>
      </footer>
    </div>
  );
}