import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { OnyxLogo } from "@/components/onyx-logo";
import { 
  Search, 
  Ruler, 
  Trash2, 
  ZapIcon,
  DollarSign,
  Home as HomeIcon,
  ArrowLeft,
  Info,
  RotateCcw,
  Sparkles
} from "lucide-react";
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import * as turf from '@turf/turf';

interface Panel {
  id: string;
  lng: number;
  lat: number;
  wattage: number;
  marker?: mapboxgl.Marker;
}

const PANEL_WATTAGE = 350; // watts per panel
const PANEL_WIDTH_FT = 3.25; // feet
const PANEL_HEIGHT_FT = 5.4; // feet
const AVG_SUN_HOURS = 4.5; // average sun hours per day in MA
const ELECTRICITY_RATE = 0.22; // $ per kWh in MA

export default function Designer() {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [draw, setDraw] = useState<MapboxDraw | null>(null);
  const [roofArea, setRoofArea] = useState<number>(0);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPolygonId, setCurrentPolygonId] = useState<string | null>(null);
  const [drawMode, setDrawMode] = useState<'polygon' | 'rectangle'>('rectangle');
  const [isDetecting, setIsDetecting] = useState(false);
  const [manualSquareFeet, setManualSquareFeet] = useState<string>('');
  
  const mapContainer = useRef<HTMLDivElement>(null);

  // Initialize Mapbox
  useEffect(() => {
    if (!mapContainer.current) return;

    const initMap = async () => {
      try {
        // Fetch Mapbox API key
        const response = await fetch('/api/mapbox-key');
        const data = await response.json();
        
        if (!data.apiKey) {
          console.error('Mapbox API key not found');
          return;
        }

        mapboxgl.accessToken = data.apiKey;

        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [-71.0589, 42.3601], // Boston, MA
          zoom: 19,
          pitch: 0,
          bearing: 0,
        });

        // Add navigation controls
        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add geocoder for address search
        const geocoder = new MapboxGeocoder({
          accessToken: data.apiKey,
          mapboxgl: mapboxgl as any,
          countries: 'us',
          placeholder: 'Search for your address',
          marker: false,
        });

        mapInstance.addControl(geocoder);

        // Initialize drawing tools
        const drawInstance = new MapboxDraw({
          displayControlsDefault: false,
          controls: {},
          defaultMode: 'simple_select',
          styles: [
            // Polygon fill
            {
              'id': 'gl-draw-polygon-fill',
              'type': 'fill',
              'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
              'paint': {
                'fill-color': '#d4a574',
                'fill-opacity': 0.3
              }
            },
            // Polygon outline stroke
            {
              'id': 'gl-draw-polygon-stroke-active',
              'type': 'line',
              'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
              'layout': {
                'line-cap': 'round',
                'line-join': 'round'
              },
              'paint': {
                'line-color': '#d4a574',
                'line-width': 3
              }
            },
            // Vertex points
            {
              'id': 'gl-draw-polygon-and-line-vertex-active',
              'type': 'circle',
              'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
              'paint': {
                'circle-radius': 5,
                'circle-color': '#d4a574'
              }
            }
          ]
        });

        mapInstance.addControl(drawInstance as any);

        // Listen for drawing events
        mapInstance.on('draw.create', (e: any) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            if (feature.geometry.type === 'Polygon') {
              setCurrentPolygonId(feature.id);
              calculateArea(feature);
            }
          }
        });

        mapInstance.on('draw.update', (e: any) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            if (feature.geometry.type === 'Polygon') {
              calculateArea(feature);
            }
          }
        });

        mapInstance.on('draw.delete', () => {
          setCurrentPolygonId(null);
          setRoofArea(0);
          clearAllPanels();
        });

        mapInstance.on('load', () => {
          setIsLoaded(true);
        });

        setMap(mapInstance);
        setDraw(drawInstance);

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    return () => {
      if (map) map.remove();
    };
  }, []);

  // Auto-place panels when roof is drawn
  useEffect(() => {
    if (currentPolygonId && map && draw && panels.length === 0 && roofArea > 0) {
      // Trigger auto-placement after roof is drawn
      setTimeout(() => {
        autoPlacePanels();
      }, 300);
    }
  }, [currentPolygonId, roofArea]);

  const calculateArea = (feature: any) => {
    try {
      const area = turf.area(feature);
      const areaInSquareFeet = area * 10.7639; // Convert m² to ft²
      setRoofArea(Math.round(areaInSquareFeet));
    } catch (error) {
      console.error('Error calculating area:', error);
    }
  };

  const startDrawing = () => {
    if (draw && currentPolygonId) {
      // Delete existing polygon
      draw.delete(currentPolygonId);
      setCurrentPolygonId(null);
      setRoofArea(0);
      clearAllPanels();
    }
    if (draw) {
      draw.changeMode('draw_polygon');
    }
  };

  const clearRoof = () => {
    if (draw && currentPolygonId) {
      draw.delete(currentPolygonId);
      setCurrentPolygonId(null);
      setRoofArea(0);
    }
    clearAllPanels();
  };

  const autoPlacePanels = () => {
    if (!map || !draw || !currentPolygonId) return;
    
    try {
      // Clear existing panels first
      clearAllPanels();

      const polygonFeature = draw.get(currentPolygonId);
      if (!polygonFeature || polygonFeature.geometry.type !== 'Polygon') return;

      // Get bounding box of polygon
      const bbox = turf.bbox(polygonFeature as any);
      const [minLng, minLat, maxLng, maxLat] = bbox;

      // Convert panel dimensions from feet to approximate degrees
      // At 42°N latitude, 1 degree lng ≈ 288,200 feet, 1 degree lat ≈ 364,000 feet
      const PANEL_WIDTH_DEGREES = PANEL_WIDTH_FT / 288200;
      const PANEL_HEIGHT_DEGREES = PANEL_HEIGHT_FT / 364000;

      // Add spacing between panels (20% gap)
      const spacingX = PANEL_WIDTH_DEGREES * 1.2;
      const spacingY = PANEL_HEIGHT_DEGREES * 1.2;

      const newPanels: Panel[] = [];
      let panelCount = 0;

      // Generate grid of potential panel positions
      for (let lng = minLng; lng <= maxLng; lng += spacingX) {
        for (let lat = minLat; lat <= maxLat; lat += spacingY) {
          const point = turf.point([lng, lat]);
          
          // Check if point is inside polygon
          if (turf.booleanPointInPolygon(point, polygonFeature as any)) {
            // Create panel marker
            const el = document.createElement('div');
            el.className = 'solar-panel-marker';
            el.style.width = '20px';
            el.style.height = '12px';
            el.style.backgroundColor = '#3b82f6';
            el.style.border = '2px solid #1e40af';
            el.style.borderRadius = '2px';
            el.style.cursor = 'pointer';
            el.style.opacity = '0.9';
            el.style.transition = 'all 0.2s';

            // Add hover effect
            el.onmouseenter = () => {
              el.style.backgroundColor = '#ef4444';
              el.style.borderColor = '#dc2626';
              el.style.transform = 'scale(1.2)';
            };
            el.onmouseleave = () => {
              el.style.backgroundColor = '#3b82f6';
              el.style.borderColor = '#1e40af';
              el.style.transform = 'scale(1)';
            };

            const marker = new mapboxgl.Marker({
              element: el,
              draggable: false,
            })
              .setLngLat([lng, lat])
              .addTo(map);

            const newPanel: Panel = {
              id: `panel-${Date.now()}-${panelCount}`,
              lng,
              lat,
              wattage: PANEL_WATTAGE,
              marker: marker,
            };

            // Click to delete panel
            el.onclick = () => {
              removePanel(newPanel.id);
            };

            newPanels.push(newPanel);
            panelCount++;
          }
        }
      }

      setPanels(newPanels);
    } catch (error) {
      console.error('Error auto-placing panels:', error);
    }
  };

  const addPanel = () => {
    if (!map || !draw || !currentPolygonId) return;
    
    try {
      const polygonFeature = draw.get(currentPolygonId);
      if (!polygonFeature || polygonFeature.geometry.type !== 'Polygon') return;

      // Get center of polygon
      const center = turf.centroid(polygonFeature as any);
      const [lng, lat] = center.geometry.coordinates;

      // Add small offset for multiple panels
      const offset = panels.length * 0.00002;
      const panelPosition: [number, number] = [lng + offset, lat + offset];

      // Create custom marker element (blue rectangle representing solar panel)
      const el = document.createElement('div');
      el.className = 'solar-panel-marker';
      el.style.width = '20px';
      el.style.height = '12px';
      el.style.backgroundColor = '#3b82f6';
      el.style.border = '2px solid #1e40af';
      el.style.borderRadius = '2px';
      el.style.cursor = 'pointer';
      el.style.opacity = '0.9';

      const marker = new mapboxgl.Marker({
        element: el,
        draggable: false,
      })
        .setLngLat(panelPosition)
        .addTo(map);

      const newPanel: Panel = {
        id: `panel-${Date.now()}`,
        lng: panelPosition[0],
        lat: panelPosition[1],
        wattage: PANEL_WATTAGE,
        marker: marker,
      };

      // Click to delete panel
      el.onclick = () => {
        removePanel(newPanel.id);
      };

      setPanels([...panels, newPanel]);
    } catch (error) {
      console.error('Error adding panel:', error);
    }
  };

  const removePanel = (id: string) => {
    const panel = panels.find(p => p.id === id);
    if (panel?.marker) {
      panel.marker.remove();
    }
    setPanels(panels.filter(p => p.id !== id));
  };

  const clearAllPanels = () => {
    panels.forEach(panel => {
      if (panel.marker) {
        panel.marker.remove();
      }
    });
    setPanels([]);
  };

  const createRoofFromSquareFeet = () => {
    if (!map || !draw || !manualSquareFeet) return;
    
    const sqft = parseFloat(manualSquareFeet);
    if (isNaN(sqft) || sqft <= 0) {
      alert('Please enter a valid square footage');
      return;
    }
    
    // Clear existing polygon
    if (currentPolygonId) {
      draw.delete(currentPolygonId);
    }
    clearAllPanels();
    
    // Create a rectangle of the specified square footage centered on current view
    const center = map.getCenter();
    
    // Assume roughly square roof, calculate dimensions
    const sideLengthFeet = Math.sqrt(sqft);
    
    // Convert feet to degrees (approximate at 42°N latitude)
    // 1 degree lng ≈ 288,200 feet, 1 degree lat ≈ 364,000 feet
    const halfWidthDegrees = (sideLengthFeet / 2) / 288200;
    const halfHeightDegrees = (sideLengthFeet / 2) / 364000;
    
    const minLng = center.lng - halfWidthDegrees;
    const maxLng = center.lng + halfWidthDegrees;
    const minLat = center.lat - halfHeightDegrees;
    const maxLat = center.lat + halfHeightDegrees;
    
    // Create rectangle polygon
    const polygon = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [minLng, minLat],
          [maxLng, minLat],
          [maxLng, maxLat],
          [minLng, maxLat],
          [minLng, minLat]
        ]]
      },
      properties: {}
    };
    
    const ids = draw.add(polygon as any);
    setCurrentPolygonId(ids[0]);
    setRoofArea(sqft);
    setManualSquareFeet('');
  };

  // Calculations
  const totalPanels = panels.length;
  const systemSize = (totalPanels * PANEL_WATTAGE) / 1000; // kW
  const annualProduction = Math.round(systemSize * AVG_SUN_HOURS * 365); // kWh/year
  const annualSavings = Math.round(annualProduction * ELECTRICITY_RATE);
  const twentyYearSavings = annualSavings * 20;

  const maxPanels = roofArea > 0 ? Math.floor(roofArea / (PANEL_WIDTH_FT * PANEL_HEIGHT_FT)) : 0;
  const coveragePercent = roofArea > 0 ? Math.round((totalPanels * PANEL_WIDTH_FT * PANEL_HEIGHT_FT / roofArea) * 100) : 0;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black border-b border-gray-800 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-onyx-gold hover:text-onyx-gold/80">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <OnyxLogo size={40} className="text-onyx-gold" />
              <span className="text-xl font-bold text-onyx-gold">Solar Roof Designer</span>
            </div>
            <Link href="/contact">
              <Button className="bg-onyx-gold hover:bg-onyx-gold/90 text-black font-bold" data-testid="button-get-quote">
                Get Quote
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Address Search */}
            <Card className="bg-gray-900 border-onyx-gold/30">
              <CardHeader>
                <CardTitle className="text-onyx-gold flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Find Your Property
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                    <div className="flex gap-2 text-gray-300 text-sm">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>Use the search box at the top of the map to find any address. Zoom in to view satellite imagery.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Roof Drawing */}
            <Card className="bg-gray-900 border-onyx-gold/30">
              <CardHeader>
                <CardTitle className="text-onyx-gold flex items-center gap-2">
                  <Ruler className="w-5 h-5" />
                  Outline Your Roof
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                  <div className="flex gap-2 text-gray-300 text-sm">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p><strong>Don't know your square footage?</strong> Just trace your roof outline and we'll calculate it automatically!</p>
                  </div>
                </div>
                <Button
                  onClick={startDrawing}
                  className="w-full bg-onyx-gold hover:bg-onyx-gold/90 text-black font-bold"
                  data-testid="button-trace-roof"
                >
                  <Ruler className="w-4 h-4 mr-2" />
                  {currentPolygonId ? 'Redraw Roof' : 'Start Drawing Roof'}
                </Button>
                <div className="text-center text-xs text-gray-500">OR enter size manually</div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Square feet"
                    value={manualSquareFeet}
                    onChange={(e) => setManualSquareFeet(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    data-testid="input-square-feet"
                  />
                  <Button
                    onClick={createRoofFromSquareFeet}
                    disabled={!manualSquareFeet || parseFloat(manualSquareFeet) <= 0}
                    variant="outline"
                    className="border-onyx-gold text-onyx-gold hover:bg-onyx-gold/10"
                    data-testid="button-create-roof"
                  >
                    <Sparkles className="w-4 h-4" />
                  </Button>
                </div>
                {roofArea > 0 && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">Roof Area</p>
                      <p className="text-2xl font-bold text-onyx-gold">{roofArea.toLocaleString()} ft²</p>
                      <p className="text-gray-400 text-xs mt-1">Max ~{maxPanels} panels</p>
                    </div>
                  </div>
                )}
                <Button
                  onClick={clearRoof}
                  disabled={!currentPolygonId}
                  variant="outline"
                  className="w-full border-red-500 text-red-500 hover:bg-red-500/10"
                  data-testid="button-clear-roof"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Roof
                </Button>
              </CardContent>
            </Card>

            {/* Panel Controls */}
            <Card className="bg-gray-900 border-onyx-gold/30">
              <CardHeader>
                <CardTitle className="text-onyx-gold flex items-center gap-2">
                  <ZapIcon className="w-5 h-5" />
                  Solar Panels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                  <div className="flex gap-2 text-gray-300 text-sm">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>Panels auto-fill when you finish drawing. Click any panel on the map to remove it.</p>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-300 text-sm">Panel Specs:</p>
                  <p className="text-onyx-gold font-bold">{PANEL_WATTAGE}W | {PANEL_WIDTH_FT}' x {PANEL_HEIGHT_FT}'</p>
                </div>
                <Button
                  onClick={autoPlacePanels}
                  disabled={!currentPolygonId}
                  className="w-full bg-onyx-gold hover:bg-onyx-gold/90 text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-autofill-panels"
                >
                  <ZapIcon className="w-4 h-4 mr-2" />
                  {currentPolygonId ? 'Auto-Fill Roof' : 'Draw Roof First'}
                </Button>
                <Button
                  onClick={addPanel}
                  disabled={!currentPolygonId}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-400"
                  data-testid="button-add-panel"
                >
                  Add Single Panel
                </Button>
                <div className="text-center text-gray-400 text-sm">
                  Panels Placed: <span className="text-onyx-gold font-bold">{totalPanels}</span>
                </div>
                {coveragePercent > 0 && (
                  <div className="text-center text-gray-400 text-sm">
                    Coverage: <span className="text-onyx-gold font-bold">{coveragePercent}%</span>
                  </div>
                )}
                <Button
                  onClick={clearAllPanels}
                  disabled={panels.length === 0}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-400"
                  data-testid="button-clear-panels"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Panels
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="bg-transparent border-onyx-gold/50" style={{ background: 'linear-gradient(to bottom right, rgba(212, 165, 116, 0.2), rgba(249, 115, 22, 0.2))' }}>
              <CardHeader className="bg-transparent">
                <CardTitle className="text-onyx-gold flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  System Estimate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/30 rounded-lg p-3 text-center">
                    <p className="text-gray-300 text-xs">System Size</p>
                    <p className="text-2xl font-bold text-onyx-gold">{systemSize.toFixed(1)} kW</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 text-center">
                    <p className="text-gray-300 text-xs">Annual Production</p>
                    <p className="text-2xl font-bold text-onyx-gold">{annualProduction.toLocaleString()}</p>
                    <p className="text-gray-400 text-xs">kWh/year</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 text-center">
                    <p className="text-gray-300 text-xs">Annual Savings</p>
                    <p className="text-2xl font-bold text-green-500">${annualSavings.toLocaleString()}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 text-center">
                    <p className="text-gray-300 text-xs">20-Year Savings</p>
                    <p className="text-2xl font-bold text-green-500">${twentyYearSavings.toLocaleString()}</p>
                  </div>
                </div>
                
                <Link href="/contact">
                  <Button className="w-full bg-onyx-gold hover:bg-onyx-gold/90 text-black font-bold" data-testid="button-quote-design">
                    Get Quote for This Design
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Map */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-onyx-gold/30 h-[800px]">
              <CardContent className="p-0 h-full relative">
                <div ref={mapContainer} className="w-full h-full rounded-lg" data-testid="map-container" />
                
                {/* Instructions Overlay */}
                {!currentPolygonId && (
                  <div className="absolute top-20 left-4 max-w-sm bg-black/80 backdrop-blur-sm border border-onyx-gold/50 rounded-lg p-4 z-10 pointer-events-none">
                    <h3 className="text-onyx-gold font-bold mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Quick Start:
                    </h3>
                    <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                      <li>Search and zoom to your property</li>
                      <li>Click "Start Drawing Roof"</li>
                      <li>Click points around roof edge, double-click to finish</li>
                      <li>System calculates size & auto-fills panels!</li>
                      <li>Click any panel to remove it</li>
                    </ol>
                  </div>
                )}

                {/* Panel Summary */}
                {panels.length > 0 && (
                  <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-onyx-gold/50 rounded-lg px-4 py-2 z-10">
                    <p className="text-onyx-gold font-bold text-sm">
                      <ZapIcon className="w-4 h-4 inline mr-2" />
                      {panels.length} panels placed • Click any panel on map to remove
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
