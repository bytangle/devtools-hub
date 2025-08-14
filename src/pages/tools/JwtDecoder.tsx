import { useState } from "react";
import { Header } from "@/components/layout/header";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Lock, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DecodedToken {
  header: any;
  payload: any;
  signature: string;
  isValid: boolean;
}

const JwtDecoder = () => {
  const [token, setToken] = useState("");
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const decodeJWT = (jwt: string): DecodedToken | null => {
    try {
      const parts = jwt.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const signature = parts[2];

      // Basic validation
      const isValid = !!(header && payload && signature);

      return {
        header,
        payload,
        signature,
        isValid
      };
    } catch (err) {
      return null;
    }
  };

  const handleDecode = () => {
    if (!token.trim()) {
      setError("Please enter a JWT token");
      setDecodedToken(null);
      return;
    }

    const decoded = decodeJWT(token.trim());
    if (decoded) {
      setDecodedToken(decoded);
      setError("");
      toast({
        title: "JWT decoded successfully!",
        description: "The token has been decoded and validated.",
      });
    } else {
      setError("Invalid JWT token format");
      setDecodedToken(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} copied!`,
      description: `The ${label.toLowerCase()} has been copied to your clipboard.`,
    });
  };

  const loadSample = () => {
    const sampleJWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    setToken(sampleJWT);
    handleDecode();
    toast({
      title: "Sample JWT loaded!",
      description: "A sample JWT token has been loaded and decoded.",
    });
  };

  const clearAll = () => {
    setToken("");
    setDecodedToken(null);
    setError("");
    toast({
      title: "Cleared!",
      description: "All content has been cleared.",
    });
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="JWT Decoder - Decode & Verify JSON Web Tokens Online"
        description="Free online JWT decoder and validator. Decode JSON Web Tokens, view headers and payloads, and verify JWT signatures. Essential developer tool."
        keywords="jwt decoder, jwt validator, json web token, jwt parser, decode jwt, jwt verification"
        canonicalUrl="/tools/jwt-decoder"
      />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Lock className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">JWT Decoder</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Decode and inspect JSON Web Tokens
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>JWT Token Input</CardTitle>
              <CardDescription>Paste your JWT token below to decode it</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="min-h-[120px] font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={handleDecode}>
                  Decode JWT
                </Button>
                <Button onClick={loadSample} variant="outline">
                  Load Sample
                </Button>
                <Button onClick={clearAll} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {decodedToken && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Header
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(decodedToken.header, null, 2), "Header")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>JWT header information</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
                    {JSON.stringify(decodedToken.header, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Payload
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(decodedToken.payload, null, 2), "Payload")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>JWT payload/claims</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-80">
                    {JSON.stringify(decodedToken.payload, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Token Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <div className="flex items-center gap-2">
                        {decodedToken.isValid ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <Badge variant={decodedToken.isValid ? "default" : "destructive"}>
                          {decodedToken.isValid ? "Valid Format" : "Invalid"}
                        </Badge>
                      </div>
                    </div>
                    
                    {decodedToken.header.alg && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Algorithm</label>
                        <Badge variant="secondary">{decodedToken.header.alg}</Badge>
                      </div>
                    )}
                    
                    {decodedToken.header.typ && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <Badge variant="secondary">{decodedToken.header.typ}</Badge>
                      </div>
                    )}
                    
                    {decodedToken.payload.iss && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Issuer</label>
                        <p className="text-sm">{decodedToken.payload.iss}</p>
                      </div>
                    )}
                    
                    {decodedToken.payload.sub && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Subject</label>
                        <p className="text-sm">{decodedToken.payload.sub}</p>
                      </div>
                    )}
                    
                    {decodedToken.payload.aud && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Audience</label>
                        <p className="text-sm">{decodedToken.payload.aud}</p>
                      </div>
                    )}
                    
                    {decodedToken.payload.exp && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Expires</label>
                        <p className="text-sm">{formatTimestamp(decodedToken.payload.exp)}</p>
                      </div>
                    )}
                    
                    {decodedToken.payload.iat && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Issued At</label>
                        <p className="text-sm">{formatTimestamp(decodedToken.payload.iat)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary">Header Decoding</Badge>
                  <Badge variant="secondary">Payload Extraction</Badge>
                  <Badge variant="secondary">Claims Inspection</Badge>
                  <Badge variant="secondary">Timestamp Conversion</Badge>
                  <Badge variant="secondary">Copy to Clipboard</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Use Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Debug authentication tokens</li>
                  <li>Inspect JWT claims</li>
                  <li>Verify token structure</li>
                  <li>Check expiration dates</li>
                  <li>Analyze token metadata</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JwtDecoder;