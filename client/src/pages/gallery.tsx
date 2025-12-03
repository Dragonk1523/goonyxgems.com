import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OnyxLogo } from "@/components/onyx-logo";
import { Link } from "wouter";
import { 
  ArrowLeft,
  Image as ImageIcon, 
  Video,
  Calendar,
  Download,
  Play
} from "lucide-react";

interface GalleryItem {
  name: string;
  size: number;
  contentType: string;
  timeCreated: string;
  url: string;
  displayUrl?: string;
}

interface GalleryData {
  images: GalleryItem[];
  videos: GalleryItem[];
}

export default function Gallery() {
  const [selectedTab, setSelectedTab] = useState<'all' | 'images' | 'videos'>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const { data: galleryData, isLoading, error } = useQuery<GalleryData>({
    queryKey: ['/api/gallery'],
    refetchOnWindowFocus: false,
  });

  const allItems = galleryData ? [...galleryData.images, ...galleryData.videos] : [];
  
  const filteredItems = selectedTab === 'all' 
    ? allItems 
    : selectedTab === 'images' 
      ? galleryData?.images || []
      : galleryData?.videos || [];

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-onyx-gold mb-4">Gallery Unavailable</h2>
          <p className="text-onyx-gold">Unable to load installation gallery.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <header className="bg-black/90 backdrop-blur-sm border-b border-onyx-gold/20">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-onyx-gold hover:text-onyx-gold">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <OnyxLogo size={40} />
              <div>
                <h1 className="text-xl font-bold text-onyx-gold">Installation Gallery</h1>
                <p className="text-xs text-gray-400">Finished Solar Projects</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Tab Filter */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-900/50 rounded-lg p-1 border border-onyx-gold/30">
            <Button
              variant={selectedTab === 'all' ? 'default' : 'ghost'}
              size="sm"
              className={selectedTab === 'all' 
                ? 'bg-onyx-gold text-black font-bold' 
                : 'text-onyx-gold hover:text-onyx-gold hover:bg-onyx-gold/20'
              }
              onClick={() => setSelectedTab('all')}
            >
              All ({allItems.length})
            </Button>
            <Button
              variant={selectedTab === 'images' ? 'default' : 'ghost'}
              size="sm"
              className={selectedTab === 'images' 
                ? 'bg-onyx-gold text-black font-bold' 
                : 'text-onyx-gold hover:text-onyx-gold hover:bg-onyx-gold/20'
              }
              onClick={() => setSelectedTab('images')}
            >
              <ImageIcon className="h-4 w-4 mr-1" />
              Photos ({galleryData?.images.length || 0})
            </Button>
            <Button
              variant={selectedTab === 'videos' ? 'default' : 'ghost'}
              size="sm"
              className={selectedTab === 'videos' 
                ? 'bg-onyx-gold text-black font-bold' 
                : 'text-onyx-gold hover:text-onyx-gold hover:bg-onyx-gold/20'
              }
              onClick={() => setSelectedTab('videos')}
            >
              <Video className="h-4 w-4 mr-1" />
              Videos ({galleryData?.videos.length || 0})
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-onyx-gold"></div>
            <p className="text-onyx-gold mt-4">Loading gallery...</p>
          </div>
        )}

        {/* Gallery Grid */}
        {!isLoading && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <Card 
                key={index}
                className="bg-gray-900/80 border-gray-700 hover:border-onyx-gold/70 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <CardContent className="p-4">
                  <div className="aspect-video bg-gray-800 rounded-lg mb-4 relative overflow-hidden">
                    {item.contentType?.startsWith('image/') ? (
                      <img 
                        src={item.displayUrl || item.url} 
                        alt="Solar installation"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          console.error('Image load error for:', item.displayUrl || item.url);
                          // Fallback for unsupported image formats or conversion failures
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                              <div class="text-center">
                                <svg class="h-16 w-16 text-amber-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p class="text-amber-500 text-sm font-medium">Solar Installation Photo</p>
                                <p class="text-gray-400 text-xs mt-1">Processing image...</p>
                              </div>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full relative">
                        <video 
                          src={item.url}
                          className="w-full h-full object-cover"
                          preload="metadata"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                          <div className="bg-black/60 rounded-full p-4 backdrop-blur-sm">
                            <Play className="h-10 w-10 text-onyx-gold fill-onyx-gold" />
                          </div>
                        </div>
                      </div>
                    )}
                    <Badge 
                      className={`absolute top-2 right-2 ${
                        item.contentType?.startsWith('image/') 
                          ? 'bg-blue-600' 
                          : 'bg-purple-600'
                      }`}
                    >
                      {item.contentType?.startsWith('image/') ? (
                        <ImageIcon className="h-3 w-3 mr-1" />
                      ) : (
                        <Video className="h-3 w-3 mr-1" />
                      )}
                      {item.contentType?.startsWith('image/') ? 'Photo' : 'Video'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-onyx-gold font-medium text-sm">
                      Solar Installation
                    </p>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(item.timeCreated)}
                      </span>
                      <span>{item.contentType === 'image/heic' || item.contentType === 'image/heif' ? 'HEIC' : formatFileSize(item.size)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <ImageIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-onyx-gold mb-2">No {selectedTab === 'all' ? 'media' : selectedTab} found</h3>
              <p className="text-gray-400">
                Upload installation photos and videos to showcase your completed solar projects.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Media Viewer Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div className="max-w-4xl max-h-full w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-onyx-gold">
                Solar Installation {selectedItem.contentType?.startsWith('image/') ? 'Photo' : 'Video'}
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-onyx-gold text-onyx-gold hover:bg-onyx-gold hover:text-black"
                  onClick={() => window.open(selectedItem.url, '_blank')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-onyx-gold hover:text-onyx-gold"
                  onClick={() => setSelectedItem(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              {selectedItem.contentType?.startsWith('image/') ? (
                <img 
                  src={selectedItem.displayUrl || selectedItem.url} 
                  alt="Solar installation"
                  className="w-full h-auto max-h-[70vh] object-contain"
                  onError={(e) => {
                    console.error('Modal image load error for:', selectedItem.displayUrl || selectedItem.url);
                    // Try fallback URL if displayUrl fails
                    if (selectedItem.displayUrl && e.currentTarget.src !== selectedItem.url) {
                      e.currentTarget.src = selectedItem.url;
                    }
                  }}
                />
              ) : (
                <video 
                  src={selectedItem.url} 
                  controls 
                  className="w-full h-auto max-h-[70vh]"
                >
                  Your browser does not support video playback.
                </video>
              )}
            </div>
            
            <div className="mt-4 text-center text-gray-400 text-sm">
              {formatDate(selectedItem.timeCreated)} • {formatFileSize(selectedItem.size)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}