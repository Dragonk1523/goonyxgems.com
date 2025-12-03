import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { OnyxLogo } from "@/components/onyx-logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header - Dark Mode */}
      <header className="bg-black border-b border-gray-800 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center space-x-2">
                <OnyxLogo size={40} className="text-yellow-400" />
                <span className="text-xl font-bold text-yellow-400">Onyx Energy Solutions</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-300 hover:text-yellow-400 font-medium">Why Go Solar</Link>
              <Link href="/about" className="text-gray-300 hover:text-yellow-400 font-medium">About</Link>
              <Link href="/contact" className="text-gray-300 hover:text-yellow-400 font-medium">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="w-full flex items-center justify-center py-20">
        <Card className="w-full max-w-md mx-4 bg-gray-900/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2 items-center">
              <AlertCircle className="h-8 w-8 text-yellow-400" />
              <h1 className="text-2xl font-bold text-yellow-400">404 Page Not Found</h1>
            </div>

            <p className="mt-4 text-sm text-gray-300">
              The page you're looking for doesn't exist.
            </p>
            
            <Button asChild className="mt-6 w-full bg-yellow-400 hover:bg-yellow-500 text-black">
              <Link href="/">Return to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
