import { useState, useRef } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Image, Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ImageOptimizer = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [optimizedImage, setOptimizedImage] = useState<string | null>(null);
  const [quality, setQuality] = useState([80]);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [optimizedSize, setOptimizedSize] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setOriginalSize(file.size);
      setOptimizedImage(null);
      setOptimizedSize(0);
    }
  };

  const optimizeImage = () => {
    if (!selectedFile) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = document.createElement('img');

    img.onload = () => {
      // Set canvas dimensions to image dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image on canvas
      ctx?.drawImage(img, 0, 0);

      // Convert to optimized blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setOptimizedSize(blob.size);
            const url = URL.createObjectURL(blob);
            setOptimizedImage(url);
            toast({
              title: "Image optimized!",
              description: `Reduced size by ${((originalSize - blob.size) / originalSize * 100).toFixed(1)}%`,
            });
          }
        },
        'image/jpeg',
        quality[0] / 100
      );
    };

    img.src = URL.createObjectURL(selectedFile);
  };

  const downloadOptimized = () => {
    if (!optimizedImage || !selectedFile) return;

    const link = document.createElement('a');
    link.href = optimizedImage;
    link.download = `optimized_${selectedFile.name.replace(/\.[^/.]+$/, '.jpg')}`;
    link.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Image className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Image Optimizer</h1>
            </div>
            <p className="text-muted-foreground">
              Compress and optimize images to reduce file size while maintaining quality
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="secondary">JPEG</Badge>
              <Badge variant="secondary">PNG</Badge>
              <Badge variant="secondary">WebP</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Image File</Label>
                  <div className="flex gap-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {selectedFile && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Quality: {quality[0]}%</Label>
                      <Slider
                        value={quality}
                        onValueChange={setQuality}
                        max={100}
                        min={10}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    <Button onClick={optimizeImage} className="w-full">
                      Optimize Image
                    </Button>

                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm space-y-1">
                        <div><strong>Original:</strong> {formatFileSize(originalSize)}</div>
                        {optimizedSize > 0 && (
                          <>
                            <div><strong>Optimized:</strong> {formatFileSize(optimizedSize)}</div>
                            <div><strong>Saved:</strong> {formatFileSize(originalSize - optimizedSize)} ({((originalSize - optimizedSize) / originalSize * 100).toFixed(1)}%)</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedFile ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Original</Label>
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Original"
                        className="w-full h-48 object-contain border border-border rounded"
                      />
                    </div>
                    
                    {optimizedImage && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm text-muted-foreground">Optimized</Label>
                          <Button size="sm" onClick={downloadOptimized}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                        <img
                          src={optimizedImage}
                          alt="Optimized"
                          className="w-full h-48 object-contain border border-border rounded"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 border-2 border-dashed border-border rounded-lg">
                    <div className="text-center">
                      <Image className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Upload an image to start optimizing</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Optimization Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>• Use 80-90% quality for most web images</div>
                  <div>• Lower quality (60-70%) for thumbnails</div>
                  <div>• JPEG works best for photos</div>
                  <div>• PNG for images with transparency</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supported Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div><strong>Input:</strong> JPEG, PNG, WebP, GIF, BMP</div>
                  <div><strong>Output:</strong> JPEG (optimized)</div>
                  <div><strong>Max Size:</strong> 10MB per image</div>
                  <div><strong>Processing:</strong> Client-side (secure)</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ImageOptimizer;