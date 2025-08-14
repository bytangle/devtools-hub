import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TimestampConverter = () => {
  const [timestamp, setTimestamp] = useState("");
  const [humanDate, setHumanDate] = useState("");
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [timezone, setTimezone] = useState("UTC");
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const convertToHuman = () => {
    try {
      const ts = parseInt(timestamp);
      if (isNaN(ts)) {
        toast({
          title: "Invalid timestamp",
          description: "Please enter a valid timestamp",
          variant: "destructive",
        });
        return;
      }

      // Handle both seconds and milliseconds
      const date = new Date(ts.toString().length === 10 ? ts * 1000 : ts);
      
      const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone === "local" ? undefined : timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      };

      setHumanDate(date.toLocaleString('en-US', options));
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: "Unable to convert timestamp",
        variant: "destructive",
      });
    }
  };

  const convertToTimestamp = () => {
    try {
      const date = new Date(humanDate);
      if (isNaN(date.getTime())) {
        toast({
          title: "Invalid date",
          description: "Please enter a valid date format",
          variant: "destructive",
        });
        return;
      }

      setTimestamp(Math.floor(date.getTime() / 1000).toString());
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: "Unable to convert date",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
  };

  const setCurrentTimestamp = () => {
    setTimestamp(Math.floor(currentTime / 1000).toString());
  };

  const formatCurrentTime = () => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone === "local" ? undefined : timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    };

    return new Date(currentTime).toLocaleString('en-US', options);
  };

  const getTimezoneOffset = () => {
    if (timezone === "local") return "Local Time";
    if (timezone === "UTC") return "UTC";
    return timezone;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Timestamp Converter</h1>
            </div>
            <p className="text-muted-foreground">
              Convert between Unix timestamps and human-readable dates across timezones
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="secondary">Unix</Badge>
              <Badge variant="secondary">ISO</Badge>
              <Badge variant="secondary">Timezones</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local Time</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
                      <SelectItem value="Asia/Kolkata">Mumbai/Delhi</SelectItem>
                      <SelectItem value="Australia/Sydney">Sydney</SelectItem>
                      <SelectItem value="Europe/Berlin">Berlin</SelectItem>
                      <SelectItem value="America/Sao_Paulo">São Paulo</SelectItem>
                      <SelectItem value="Africa/Cairo">Cairo</SelectItem>
                      <SelectItem value="Asia/Dubai">Dubai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span>Timestamp:</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-background px-2 py-1 rounded">
                          {Math.floor(currentTime / 1000)}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(Math.floor(currentTime / 1000).toString(), "Timestamp")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Date:</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-background px-2 py-1 rounded text-xs">
                          {formatCurrentTime()}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(formatCurrentTime(), "Date")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>ISO:</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-background px-2 py-1 rounded text-xs">
                          {new Date(currentTime).toISOString()}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(new Date(currentTime).toISOString(), "ISO Date")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={setCurrentTimestamp} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Use Current Time
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Convert Timestamp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Unix Timestamp</Label>
                  <div className="flex gap-2">
                    <Input
                      value={timestamp}
                      onChange={(e) => setTimestamp(e.target.value)}
                      placeholder="1640995200"
                    />
                    <Button onClick={convertToHuman}>
                      Convert
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter seconds or milliseconds since Unix epoch
                  </p>
                </div>

                {humanDate && (
                  <div className="space-y-2">
                    <Label>Human Readable Date</Label>
                    <div className="flex gap-2">
                      <Input value={humanDate} readOnly />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(humanDate, "Date")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Convert Date to Timestamp</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Date String</Label>
                <div className="flex gap-2">
                  <Input
                    value={humanDate}
                    onChange={(e) => setHumanDate(e.target.value)}
                    placeholder="2024-01-01 12:00:00 or January 1, 2024"
                    className="flex-1"
                  />
                  <Button onClick={convertToTimestamp}>
                    Convert
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Examples: "2024-01-01", "January 1, 2024", "2024-01-01T12:00:00Z"
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle>About Unix Timestamps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>• Seconds since January 1, 1970 (Unix epoch)</div>
                  <div>• Timezone-independent</div>
                  <div>• Widely used in programming and databases</div>
                  <div>• Both 10-digit (seconds) and 13-digit (milliseconds) supported</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supported Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div><strong>Input:</strong> Unix timestamp, ISO string, natural language</div>
                  <div><strong>Output:</strong> Human readable date with timezone</div>
                  <div><strong>Timezones:</strong> UTC, Local, and major world timezones</div>
                  <div><strong>Precision:</strong> Second-level accuracy</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TimestampConverter;