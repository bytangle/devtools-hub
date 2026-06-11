import { useState, useRef } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Palette, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ColorPicker = () => {
  const [color, setColor] = useState("#3b82f6");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const hexToHsl = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Scale coordinates to actual canvas size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const actualX = Math.floor(x * scaleX);
    const actualY = Math.floor(y * scaleY);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(actualX, actualY, 1, 1);
    const [r, g, b] = imageData.data;

    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    setColor(hex);

    toast({
      title: "Color picked!",
      description: `Selected color: ${hex.toUpperCase()}`,
    });
  };

  const drawImageOnCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate dimensions to fit image in canvas while maintaining aspect ratio
    const maxWidth = 400;
    const maxHeight = 300;
    let { width, height } = image;

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
  };

  const removeImage = () => {
    setUploadedImage(null);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${format} value copied to clipboard`,
    });
  };

  const rgb = hexToRgb(color);
  const hsl = hexToHsl(color);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Palette className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Color Picker</h1>
            </div>
            <p className="text-muted-foreground">
              Pick colors and get HEX, RGB, and HSL values instantly
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="secondary">HEX</Badge>
              <Badge variant="secondary">RGB</Badge>
              <Badge variant="secondary">HSL</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Color Picker</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="color-input">Select Color</Label>
                  <div className="flex gap-2">
                    <input
                      id="color-input"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-16 h-16 rounded border border-border cursor-pointer"
                    />
                    <Input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div 
                  className="w-full h-32 rounded-lg border border-border"
                  style={{ backgroundColor: color }}
                />

                <div className="space-y-2">
                  <Label>Pick from Image</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <label className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button variant="outline" className="w-full" asChild>
                          <span className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Image
                          </span>
                        </Button>
                      </label>
                      {uploadedImage && (
                        <Button variant="outline" size="icon" onClick={removeImage}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {uploadedImage && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Click on the image to pick a color
                        </p>
                        <div className="relative">
                          <img
                            ref={imageRef}
                            src={uploadedImage}
                            alt="Upload for color picking"
                            className="hidden"
                            onLoad={drawImageOnCanvas}
                          />
                          <canvas
                            ref={canvasRef}
                            onClick={handleCanvasClick}
                            className="max-w-full h-auto border border-border rounded-lg cursor-crosshair"
                            style={{ maxHeight: '300px' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Color Values</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>HEX</Label>
                  <div className="flex gap-2">
                    <Input value={color.toUpperCase()} readOnly />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(color.toUpperCase(), "HEX")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {rgb && (
                  <div className="space-y-2">
                    <Label>RGB</Label>
                    <div className="flex gap-2">
                      <Input value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} readOnly />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, "RGB")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {hsl && (
                  <div className="space-y-2">
                    <Label>HSL</Label>
                    <div className="flex gap-2">
                      <Input value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} readOnly />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, "HSL")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Color Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>HEX:</strong> Hexadecimal color representation used in CSS and web design
                  </div>
                  <div>
                    <strong>RGB:</strong> Red, Green, Blue values (0-255) used in digital displays
                  </div>
                  <div>
                    <strong>HSL:</strong> Hue, Saturation, Lightness - more intuitive for color adjustments
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>• Click the color square to open your system color picker</div>
                  <div>• Type hex values directly in the input field</div>
                  <div>• Use the copy buttons to quickly copy color values</div>
                  <div>• HSL is great for creating color variations</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ColorPicker;