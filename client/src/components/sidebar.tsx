import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { 
  Menu, 
  X, 
  Home, 
  Phone, 
  User, 
  Image as ImageIcon,
  Sun,
  ChevronDown,
  Ruler
} from "lucide-react";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const menuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: User },
    { href: "/extras", label: "Extras", icon: Sun },
    { href: "/designer", label: "Solar Designer", icon: Ruler },
    { href: "/gallery", label: "Gallery", icon: ImageIcon },
    { href: "/contact", label: "Contact", icon: Phone },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Sidebar Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-12 left-4 z-50 bg-black/80 backdrop-blur-sm border border-onyx-gold/30 text-onyx-gold hover:bg-onyx-gold hover:text-black transition-all duration-300 px-2 py-1 h-8 w-8 min-w-0"
        onClick={toggleSidebar}
        data-testid="sidebar-toggle"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300"
          onClick={toggleSidebar}
          data-testid="sidebar-backdrop"
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-black/95 to-gray-900/95 backdrop-blur-md 
        border-r border-onyx-gold/30 z-40 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <Sun className="h-6 w-6 text-onyx-gold" />
              <span className="text-lg font-bold text-onyx-gold">Menu</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-onyx-gold hover:text-onyx-gold hover:bg-onyx-gold/20"
              onClick={toggleSidebar}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  <div className={`
                    flex items-center space-x-3 p-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-onyx-gold text-black font-semibold' 
                      : 'text-onyx-gold hover:bg-onyx-gold/20 hover:text-onyx-gold-light'
                    }
                  `}>
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="my-6 border-t border-onyx-gold/30" />

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-onyx-gold/80 uppercase tracking-wider">
              Quick Actions
            </h3>
            <Link href="/contact" onClick={() => setIsOpen(false)}>
              <Button 
                className="w-full bg-onyx-gold hover:bg-onyx-gold-light text-black font-bold"
                data-testid="sidebar-quote-button"
              >
                Get Free Quote
              </Button>
            </Link>
            <a 
              href="tel:5082571664" 
              onClick={() => setIsOpen(false)}
              className="block"
            >
              <Button 
                variant="outline" 
                className="w-full border-onyx-gold text-onyx-gold hover:bg-onyx-gold hover:text-black"
                data-testid="sidebar-call-button"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call (508) 257-1664
              </Button>
            </a>
          </div>

          {/* Footer */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="text-center text-xs text-onyx-gold/60">
              <p className="italic mb-2">"Gold Standards Keeping You in the Black"</p>
              <p>&copy; 2024 Onyx Energy Solutions</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}