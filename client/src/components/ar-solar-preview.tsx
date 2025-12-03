import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, X, RotateCcw, Move, ZoomIn, ZoomOut } from "lucide-react";

interface SolarPanel {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export function ARSolarPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [panels, setPanels] = useState<SolarPanel[]>([]);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [estimatedSavings, setEstimatedSavings] = useState(0);

  useEffect(() => {
    // Calculate estimated savings based on number of panels
    const savings = panels.length * 150; // $150 per panel per year estimate
    setEstimatedSavings(savings);
  }, [panels]);

  const startAR = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      setStream(mediaStream);
      setIsARActive(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access required for AR preview. Please enable camera permissions.');
    }
  };

  const stopAR = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsARActive(false);
    setPanels([]);
    setSelectedPanel(null);
  };

  const addPanel = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isARActive) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const newPanel: SolarPanel = {
      id: `panel-${Date.now()}`,
      x,
      y,
      rotation: 0,
      scale: 1
    };

    setPanels(prev => [...prev, newPanel]);
  };

  const removePanel = (panelId: string) => {
    setPanels(prev => prev.filter(p => p.id !== panelId));
    setSelectedPanel(null);
  };

  const rotatePanel = (panelId: string) => {
    setPanels(prev => prev.map(p => 
      p.id === panelId ? { ...p, rotation: (p.rotation + 15) % 360 } : p
    ));
  };

  const scalePanel = (panelId: string, delta: number) => {
    setPanels(prev => prev.map(p => 
      p.id === panelId ? { ...p, scale: Math.max(0.5, Math.min(2, p.scale + delta)) } : p
    ));
  };

  const renderSolarPanel = (panel: SolarPanel) => (
    <div
      key={panel.id}
      className={`absolute cursor-pointer transform-gpu transition-all duration-200 ${
        selectedPanel === panel.id ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''
      }`}
      style={{
        left: `${panel.x}%`,
        top: `${panel.y}%`,
        transform: `translate(-50%, -50%) rotate(${panel.rotation}deg) scale(${panel.scale})`,
        width: '80px',
        height: '120px'
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedPanel(panel.id);
      }}
    >
      {/* Solar Panel SVG */}
      <svg
        width="80"
        height="120"
        viewBox="0 0 80 120"
        className="drop-shadow-lg"
      >
        {/* Panel Frame */}
        <rect x="2" y="2" width="76" height="116" rx="4" fill="#1a1a1a" stroke="#333" strokeWidth="2"/>
        
        {/* Solar Cells Grid */}
        <g fill="#0f172a" stroke="#334155" strokeWidth="1">
          {Array.from({ length: 6 }, (_, row) =>
            Array.from({ length: 4 }, (_, col) => (
              <rect
                key={`${row}-${col}`}
                x={6 + col * 17}
                y={6 + row * 18}
                width="16"
                height="17"
                rx="1"
              />
            ))
          )}
        </g>
        
        {/* Reflective highlights */}
        <g fill="rgba(255,255,255,0.1)">
          {Array.from({ length: 6 }, (_, row) =>
            Array.from({ length: 4 }, (_, col) => (
              <rect
                key={`highlight-${row}-${col}`}
                x={6 + col * 17}
                y={6 + row * 18}
                width="8"
                height="4"
                rx="1"
              />
            ))
          )}
        </g>
      </svg>
      
      {/* Panel Controls */}
      {selectedPanel === panel.id && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex space-x-1 bg-black bg-opacity-75 rounded px-2 py-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-white hover:text-yellow-400"
            onClick={(e) => {
              e.stopPropagation();
              rotatePanel(panel.id);
            }}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-white hover:text-yellow-400"
            onClick={(e) => {
              e.stopPropagation();
              scalePanel(panel.id, 0.1);
            }}
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-white hover:text-yellow-400"
            onClick={(e) => {
              e.stopPropagation();
              scalePanel(panel.id, -0.1);
            }}
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-white hover:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              removePanel(panel.id);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );

  if (!isARActive) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>AR Solar Preview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Use your camera to visualize how solar panels would look on your home. 
            Point your camera at your roof and tap to place panels.
          </p>
          <Button onClick={startAR} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black">
            <Camera className="h-4 w-4 mr-2" />
            Start AR Preview
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Camera View */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />
      
      {/* AR Overlay Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        onClick={addPanel}
      >
        {/* Solar Panels Overlay */}
        <div className="absolute inset-0">
          {panels.map(renderSolarPanel)}
        </div>
      </canvas>

      {/* AR Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        <Card className="bg-black bg-opacity-75 text-white border-gray-700">
          <CardContent className="p-3">
            <div className="text-sm space-y-1">
              <div>Panels: {panels.length}</div>
              <div>Est. Annual Savings: ${estimatedSavings.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
        
        <Button
          onClick={stopAR}
          variant="destructive"
          size="sm"
          className="bg-red-600 hover:bg-red-700"
        >
          <X className="h-4 w-4 mr-1" />
          Exit AR
        </Button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 right-4">
        <Card className="bg-black bg-opacity-75 text-white border-gray-700">
          <CardContent className="p-3">
            <div className="text-sm text-center space-y-1">
              <div>Tap to place solar panels • Tap panel to select and edit</div>
              <div className="text-yellow-300">Point camera at your roof for best results</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}