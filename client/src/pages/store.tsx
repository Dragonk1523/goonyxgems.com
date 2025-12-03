import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Sun, 
  ShoppingCart, 
  Star, 
  Truck, 
  Shield, 
  CreditCard,
  Filter,
  Search,
  Grid3X3,
  List,
  Heart,
  Share
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { OnyxLogo } from "@/components/onyx-logo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const products = [
  {
    id: 1,
    name: "Onyx Energy Logo T-Shirt",
    price: 24.99,
    originalPrice: 29.99,
    rating: 4.8,
    reviews: 156,
    image: "🌞",
    category: "Apparel",
    description: "Premium cotton t-shirt with Onyx Energy Solutions logo",
    colors: ["Black", "Navy", "Charcoal"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    featured: true
  },
  {
    id: 2,
    name: "Solar Power Hoodie",
    price: 49.99,
    originalPrice: 59.99,
    rating: 4.9,
    reviews: 89,
    image: "⚡",
    category: "Apparel",
    description: "Comfortable hoodie celebrating clean energy",
    colors: ["Black", "Navy", "Green"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    featured: true
  },
  {
    id: 3,
    name: "Solar Panel Coffee Mug",
    price: 16.99,
    originalPrice: 19.99,
    rating: 4.7,
    reviews: 203,
    image: "☕",
    category: "Drinkware",
    description: "11oz ceramic mug with solar panel design",
    colors: ["White", "Black"],
    sizes: ["11oz"],
    featured: false
  },
  {
    id: 4,
    name: "Clean Energy Baseball Cap",
    price: 22.99,
    originalPrice: 27.99,
    rating: 4.6,
    reviews: 124,
    image: "🧢",
    category: "Accessories",
    description: "Adjustable cap with embroidered Onyx logo",
    colors: ["Black", "Navy", "Khaki"],
    sizes: ["One Size"],
    featured: false
  },
  {
    id: 5,
    name: "Solar Efficiency Water Bottle",
    price: 18.99,
    originalPrice: 24.99,
    rating: 4.8,
    reviews: 67,
    image: "🍶",
    category: "Drinkware",
    description: "Insulated stainless steel water bottle",
    colors: ["Silver", "Black", "Blue"],
    sizes: ["20oz"],
    featured: true
  },
  {
    id: 6,
    name: "Onyx Energy Laptop Sticker Pack",
    price: 8.99,
    originalPrice: 12.99,
    rating: 4.5,
    reviews: 301,
    image: "💻",
    category: "Accessories",
    description: "Pack of 5 vinyl stickers",
    colors: ["Multi"],
    sizes: ["Pack of 5"],
    featured: false
  },
  {
    id: 7,
    name: "Solar Champion Polo Shirt",
    price: 39.99,
    originalPrice: 49.99,
    rating: 4.7,
    reviews: 78,
    image: "👔",
    category: "Apparel",
    description: "Professional polo with subtle Onyx branding",
    colors: ["Navy", "White", "Gray"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    featured: false
  },
  {
    id: 8,
    name: "Renewable Energy Tote Bag",
    price: 14.99,
    originalPrice: 18.99,
    rating: 4.9,
    reviews: 145,
    image: "👜",
    category: "Accessories",
    description: "Eco-friendly canvas tote bag",
    colors: ["Natural", "Black"],
    sizes: ["One Size"],
    featured: true
  }
];

export default function Store() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [cart, setCart] = useState<number[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);

  const categories = ['all', 'Apparel', 'Drinkware', 'Accessories'];

  const filteredProducts = products.filter(product => 
    selectedCategory === 'all' || product.category === selectedCategory
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'featured':
      default:
        return b.featured === a.featured ? 0 : b.featured ? 1 : -1;
    }
  });

  const addToCart = (productId: number) => {
    setCart(prev => [...prev, productId]);
  };

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <OnyxLogo size={40} className="text-yellow-400" />
              <div>
                <h1 className="text-xl font-bold text-yellow-400">Onyx Energy Solutions</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Store</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Wishlist ({wishlist.length})
              </Button>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart ({cart.length})
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-orange-500 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Onyx Energy Store
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Show your support for clean energy with premium Onyx Energy Solutions merchandise
          </p>
          <div className="flex justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5" />
              <span>Free shipping over $50</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>30-day returns</span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Secure checkout</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Sort */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Filter:</span>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between lg:justify-end space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {sortedProducts.map((product) => (
              <Card 
                key={product.id} 
                className={`group hover:shadow-lg transition-all duration-300 ${
                  viewMode === 'list' ? 'flex flex-row' : ''
                }`}
              >
                <div className={`${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                  <div className="relative">
                    <div className="aspect-square bg-gradient-to-br from-orange-100 to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-t-lg flex items-center justify-center text-6xl">
                      {product.image}
                    </div>
                    {product.featured && (
                      <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
                        Featured
                      </Badge>
                    )}
                    {product.originalPrice > product.price && (
                      <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                        Sale
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => toggleWishlist(product.id)}
                    >
                      <Heart 
                        className={`h-4 w-4 ${
                          wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''
                        }`} 
                      />
                    </Button>
                  </div>
                </div>
                
                <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <CardHeader className={viewMode === 'list' ? 'pb-2' : ''}>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg group-hover:text-orange-600 transition-colors">
                        {product.name}
                      </CardTitle>
                      <Button variant="ghost" size="sm">
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star} 
                            className={`h-4 w-4 ${
                              star <= product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">({product.reviews})</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription className="mb-4">
                      {product.description}
                    </CardDescription>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-orange-600">
                          ${product.price}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-lg text-gray-500 line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {product.category}
                        </Badge>
                        <Badge variant="outline">
                          {product.colors.length} colors
                        </Badge>
                      </div>
                      
                      <Button 
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        onClick={() => addToCart(product.id)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-gradient-to-r from-orange-500 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get notified about new products, exclusive deals, and solar energy updates
          </p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 p-3 rounded-lg text-gray-900"
            />
            <Button className="bg-white text-orange-600 hover:bg-gray-100">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sun className="h-6 w-6 text-orange-500" />
                <span className="text-xl font-bold">Onyx Energy Solutions</span>
              </div>
              <p className="text-gray-400">
                Premium merchandise from California's leading solar company.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/services" className="hover:text-white transition-colors">Services</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Store Info</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Shipping & Returns</li>
                <li>Size Guide</li>
                <li>Track Your Order</li>
                <li>Customer Service</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Facebook</li>
                <li>Instagram</li>
                <li>Twitter</li>
                <li>LinkedIn</li>
              </ul>
            </div>
          </div>
          <Separator className="my-8 bg-gray-800" />
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Onyx Energy Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}