import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette, RotateCcw } from "lucide-react";

interface ColorPickerProps {
  onColorChange: (color: string) => void;
}

export function ColorPicker({ onColorChange }: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState("#d4a574"); // Default onyx gold
  const [hue, setHue] = useState(35);
  const [saturation, setSaturation] = useState(45);
  const [lightness, setLightness] = useState(65);

  // Convert HSL to hex
  const hslToHex = (h: number, s: number, l: number) => {
    const hDecimal = h / 360;
    const sDecimal = s / 100;
    const lDecimal = l / 100;

    const c = (1 - Math.abs(2 * lDecimal - 1)) * sDecimal;
    const x = c * (1 - Math.abs(((hDecimal * 6) % 2) - 1));
    const m = lDecimal - c / 2;

    let r = 0, g = 0, b = 0;

    if (0 <= hDecimal * 6 && hDecimal * 6 < 1) {
      r = c; g = x; b = 0;
    } else if (1 <= hDecimal * 6 && hDecimal * 6 < 2) {
      r = x; g = c; b = 0;
    } else if (2 <= hDecimal * 6 && hDecimal * 6 < 3) {
      r = 0; g = c; b = x;
    } else if (3 <= hDecimal * 6 && hDecimal * 6 < 4) {
      r = 0; g = x; b = c;
    } else if (4 <= hDecimal * 6 && hDecimal * 6 < 5) {
      r = x; g = 0; b = c;
    } else if (5 <= hDecimal * 6 && hDecimal * 6 < 6) {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  useEffect(() => {
    const newColor = hslToHex(hue, saturation, lightness);
    setSelectedColor(newColor);
    onColorChange(newColor);
  }, [hue, saturation, lightness, onColorChange]);

  const resetToDefault = () => {
    setHue(35);
    setSaturation(45);
    setLightness(65);
  };

  const presetColors = [
    { name: "Onyx Gold", color: "#d4a574" },
    { name: "Deep Gold", color: "#b8935c" },
    { name: "Light Gold", color: "#e6c296" },
    { name: "Bronze", color: "#cd7f32" },
    { name: "Copper", color: "#b87333" },
    { name: "Amber", color: "#ffbf00" },
    { name: "Champagne", color: "#f7e7ce" },
    { name: "Rose Gold", color: "#e8b4a0" }
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-black/80 border-onyx-gold/50 text-onyx-gold hover:bg-onyx-gold/20"
        >
          <Palette className="h-4 w-4 mr-2" />
          Customize Colors
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-black/95 border-onyx-gold/30 backdrop-blur-sm">
        <Card className="bg-transparent border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-onyx-gold text-lg flex items-center justify-between">
              Color Customizer
              <Button
                variant="ghost"
                size="sm"
                onClick={resetToDefault}
                className="text-onyx-gold/70 hover:text-onyx-gold h-8 w-8 p-0"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Color Preview */}
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-lg border-2 border-white/20 shadow-lg"
                style={{ backgroundColor: selectedColor }}
              />
              <div className="text-onyx-gold">
                <div className="font-medium">{selectedColor}</div>
                <div className="text-sm text-onyx-gold/70">
                  HSL({hue}, {saturation}%, {lightness}%)
                </div>
              </div>
            </div>

            {/* HSL Sliders */}
            <div className="space-y-3">
              <div>
                <label className="text-onyx-gold text-sm font-medium mb-1 block">
                  Hue: {hue}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hue}
                  onChange={(e) => setHue(Number(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 via-purple-500 to-red-500 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-onyx-gold text-sm font-medium mb-1 block">
                  Saturation: {saturation}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-gray-500 to-current rounded-lg appearance-none cursor-pointer"
                  style={{ color: `hsl(${hue}, 100%, 50%)` }}
                />
              </div>

              <div>
                <label className="text-onyx-gold text-sm font-medium mb-1 block">
                  Lightness: {lightness}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={lightness}
                  onChange={(e) => setLightness(Number(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-black via-current to-white rounded-lg appearance-none cursor-pointer"
                  style={{ color: `hsl(${hue}, ${saturation}%, 50%)` }}
                />
              </div>
            </div>

            {/* Preset Colors */}
            <div>
              <label className="text-onyx-gold text-sm font-medium mb-2 block">
                Quick Presets
              </label>
              <div className="grid grid-cols-4 gap-2">
                {presetColors.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setSelectedColor(preset.color);
                      onColorChange(preset.color);
                    }}
                    className="w-12 h-12 rounded-lg border-2 border-white/20 shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: preset.color }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}