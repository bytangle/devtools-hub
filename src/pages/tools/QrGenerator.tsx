import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCodeStyling from "qr-code-styling";

const QrGenerator = () => {
  const [text, setText] = useState("");
  const [qrType, setQrType] = useState("text");
  const [qrSize, setQrSize] = useState("256");
  const [qrColor, setQrColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [qrStyle, setQrStyle] = useState("square");
  const [cornerStyle, setCornerStyle] = useState("square");
  const [dotStyle, setDotStyle] = useState("square");
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!qrCodeRef.current) {
      qrCodeRef.current = new QRCodeStyling({
        width: parseInt(qrSize),
        height: parseInt(qrSize),
        type: "svg",
        data: "https://bytangle.com",
        dotsOptions: {
          color: qrColor,
          type: dotStyle as any
        },
        cornersSquareOptions: {
          color: qrColor,
          type: cornerStyle as any
        },
        cornersDotOptions: {
          color: qrColor,
          type: dotStyle as any
        },
        backgroundOptions: {
          color: bgColor
        }
      });
    }
  }, []);

  useEffect(() => {
    if (qrCodeRef.current && qrRef.current) {
      qrCodeRef.current.append(qrRef.current);
    }
  }, []);

  const updateQRCode = () => {
    if (!qrCodeRef.current) return;

    qrCodeRef.current.update({
      width: parseInt(qrSize),
      height: parseInt(qrSize),
      data: text || "https://bytangle.com",
      dotsOptions: {
        color: qrColor,
        type: dotStyle as any
      },
      cornersSquareOptions: {
        color: qrColor,
        type: cornerStyle as any
      },
      cornersDotOptions: {
        color: qrColor,
        type: dotStyle as any
      },
      backgroundOptions: {
        color: bgColor
      }
    });
  };

  const generateQR = () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to generate QR code",
        variant: "destructive",
      });
      return;
    }

    let qrData = text;
    
    // Format data based on type
    switch (qrType) {
      case "url":
        if (!text.startsWith('http://') && !text.startsWith('https://')) {
          qrData = 'https://' + text;
        }
        break;
      case "email":
        qrData = `mailto:${text}`;
        break;
      case "phone":
        qrData = `tel:${text}`;
        break;
      case "sms":
        qrData = `sms:${text}`;
        break;
      case "wifi":
        // For WiFi, expect format: SSID,Password,Security
        const parts = text.split(',');
        if (parts.length >= 2) {
          qrData = `WIFI:T:WPA;S:${parts[0]};P:${parts[1]};;`;
        }
        break;
    }

    if (qrCodeRef.current) {
      qrCodeRef.current.update({
        data: qrData
      });
    }
    
    updateQRCode();
    
    toast({
      title: "QR Code Generated!",
      description: "Your QR code is ready for download",
    });
  };

  const downloadQR = () => {
    if (qrCodeRef.current) {
      qrCodeRef.current.download({
        name: "qrcode",
        extension: "png"
      });
    }
  };

  const getPlaceholder = () => {
    switch (qrType) {
      case "url": return "https://example.com";
      case "email": return "user@example.com";
      case "phone": return "+1234567890";
      case "sms": return "+1234567890";
      case "wifi": return "NetworkName,Password,WPA";
      default: return "Enter your text here";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="QR Code Generator - Create Custom QR Codes Online Free"
        description="Generate customizable QR codes for URLs, text, contact info, and more. Download in PNG format with various sizes and styles. Free QR code maker."
        keywords="qr code generator, qr code maker, qr code creator, custom qr codes, generate qr code"
        canonicalUrl="/tools/qr-generator"
      />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <QrCode className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">QR Code Generator</h1>
            </div>
            <p className="text-muted-foreground">
              Generate QR codes for text, URLs, emails, phone numbers, and more
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="secondary">URL</Badge>
              <Badge variant="secondary">Text</Badge>
              <Badge variant="secondary">Email</Badge>
              <Badge variant="secondary">WiFi</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>QR Code Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>QR Code Type</Label>
                  <Select value={qrType} onValueChange={setQrType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Plain Text</SelectItem>
                      <SelectItem value="url">Website URL</SelectItem>
                      <SelectItem value="email">Email Address</SelectItem>
                      <SelectItem value="phone">Phone Number</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="wifi">WiFi Network</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={getPlaceholder()}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Size</Label>
                    <Select value={qrSize} onValueChange={(value) => { setQrSize(value); updateQRCode(); }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="128">128x128</SelectItem>
                        <SelectItem value="256">256x256</SelectItem>
                        <SelectItem value="512">512x512</SelectItem>
                        <SelectItem value="1024">1024x1024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Dot Style</Label>
                    <Select value={dotStyle} onValueChange={(value) => { setDotStyle(value); updateQRCode(); }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="rounded">Rounded</SelectItem>
                        <SelectItem value="dots">Dots</SelectItem>
                        <SelectItem value="classy">Classy</SelectItem>
                        <SelectItem value="classy-rounded">Classy Rounded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Corner Style</Label>
                    <Select value={cornerStyle} onValueChange={(value) => { setCornerStyle(value); updateQRCode(); }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="dot">Dot</SelectItem>
                        <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Foreground Color</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={qrColor}
                        onChange={(e) => { setQrColor(e.target.value); updateQRCode(); }}
                        className="w-12 h-10 rounded border border-border cursor-pointer"
                      />
                      <Input
                        value={qrColor}
                        onChange={(e) => { setQrColor(e.target.value); updateQRCode(); }}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => { setBgColor(e.target.value); updateQRCode(); }}
                      className="w-12 h-10 rounded border border-border cursor-pointer"
                    />
                    <Input
                      value={bgColor}
                      onChange={(e) => { setBgColor(e.target.value); updateQRCode(); }}
                      className="flex-1"
                    />
                  </div>
                </div>

                <Button onClick={generateQR} className="w-full">
                  Generate QR Code
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <div 
                    ref={qrRef}
                    className="border border-border rounded-lg p-4 bg-background flex items-center justify-center"
                    style={{ minHeight: '300px', minWidth: '300px' }}
                  />
                  
                  <Button onClick={downloadQR} variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download PNG
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle>QR Code Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div><strong>Text:</strong> Plain text content</div>
                  <div><strong>URL:</strong> Website links</div>
                  <div><strong>Email:</strong> Email addresses</div>
                  <div><strong>Phone:</strong> Phone numbers for calling</div>
                  <div><strong>SMS:</strong> SMS messages</div>
                  <div><strong>WiFi:</strong> Network credentials (SSID,Password,Security)</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>• Use high contrast colors for better scanning</div>
                  <div>• Test QR codes before printing</div>
                  <div>• Larger sizes work better for printing</div>
                  <div>• Different styles affect readability - test before use</div>
                  <div>• Keep text short for better reliability</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QrGenerator;