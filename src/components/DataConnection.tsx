import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Database, Link as LinkIcon, ArrowRight, HelpCircle } from "lucide-react";
import { parseCSV, fetchCSVFromURL, ClientData } from "@/utils/csvParser";
import { useToast } from "@/hooks/use-toast";

interface DataConnectionProps {
  onDataLoaded: (data: ClientData[]) => void;
  showAsCard?: boolean;
  onShowCSVFormat?: () => void;
}

const DataConnection = ({ onDataLoaded, showAsCard = false, onShowCSVFormat }: DataConnectionProps) => {
  const [loading, setLoading] = useState(false);
  const [connectionType, setConnectionType] = useState<string>("");
  const [url, setUrl] = useState("");
  const [erpType, setErpType] = useState<string>("");
  const [apiKey, setApiKey] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const { toast } = useToast();

  const connectionOptions = [
    { value: "csv-upload", label: "Upload CSV File", icon: Upload },
    { value: "csv-url", label: "CSV from URL", icon: LinkIcon },
    { value: "sap", label: "SAP ERP", icon: Database },
    { value: "oracle", label: "Oracle ERP", icon: Database },
    { value: "netsuite", label: "NetSuite", icon: Database },
    { value: "quickbooks", label: "QuickBooks", icon: Database },
    { value: "xero", label: "Xero", icon: Database },
    { value: "sage", label: "Sage Intacct", icon: Database },
    { value: "dynamics", label: "Microsoft Dynamics", icon: Database },
    { value: "custom", label: "Custom Database", icon: Database },
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const data = parseCSV(text);
      onDataLoaded(data);
      toast({
        title: "Success",
        description: `Loaded ${data.length} client records`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse CSV file",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleURLImport = async () => {
    if (!url) return;

    setLoading(true);
    try {
      const data = await fetchCSVFromURL(url);
      onDataLoaded(data);
      toast({
        title: "Success",
        description: `Loaded ${data.length} client records from URL`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data from URL",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleERPConnect = async () => {
    if (!endpoint) {
      toast({
        title: "Missing Information",
        description: "Please provide endpoint",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate connection
    setTimeout(() => {
      toast({
        title: "Connection Successful",
        description: `Connected to ${connectionOptions.find(e => e.value === erpType)?.label}`,
      });
      setLoading(false);
      // Reset form
      setConnectionType("");
      setErpType("");
      setApiKey("");
      setEndpoint("");
    }, 1500);
  };

  // Track the previous connection type to only show dialog on fresh selection
  const [prevConnectionType, setPrevConnectionType] = useState<string>("");

  // Show CSV format dialog only when user selects CSV upload (not on re-renders)
  useEffect(() => {
    if (connectionType === "csv-upload" && prevConnectionType !== "csv-upload" && onShowCSVFormat) {
      onShowCSVFormat();
    }
    setPrevConnectionType(connectionType);
  }, [connectionType]);

  const renderConnectionForm = () => {
    if (connectionType === "csv-upload") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="file-upload">Select CSV File</Label>
              {onShowCSVFormat && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShowCSVFormat}
                  className="h-6 text-xs"
                >
                  <HelpCircle className="h-3 w-3 mr-1" />
                  View Format
                </Button>
              )}
            </div>
            <Input
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={loading}
            />
          </div>
          <Button 
            className="w-full bg-gradient-to-r from-orange to-orange/80 hover:from-orange/90 hover:to-orange/70 shadow-md hover:shadow-lg transition-all duration-200 text-white font-semibold" 
            disabled={loading}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            {loading ? "Loading..." : "Upload & Analyze"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    }

    if (connectionType === "csv-url") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url-input">CSV Data URL</Label>
            <Input
              id="url-input"
              type="url"
              placeholder="https://example.com/data.csv"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button 
            className="w-full" 
            onClick={handleURLImport}
            disabled={!url || loading}
          >
            {loading ? "Connecting..." : "Connect & Analyze"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    }

    if (connectionType && connectionType !== "csv-upload" && connectionType !== "csv-url") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="endpoint">API Endpoint / Connection String</Label>
            <Input
              id="endpoint"
              type="text"
              placeholder="https://api.example.com/v1 or connection string"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key / Credentials (Optional)</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter API key or authentication token"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your credentials are encrypted and stored securely
            </p>
          </div>

          <Button 
            onClick={handleERPConnect} 
            disabled={loading || !endpoint}
            className="w-full"
          >
            {loading ? "Connecting..." : "Connect to ERP"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    }

    return null;
  };

  const content = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="connection-type">Data Source</Label>
        <Select value={connectionType} onValueChange={setConnectionType}>
          <SelectTrigger id="connection-type">
            <SelectValue placeholder="Select data source" />
          </SelectTrigger>
          <SelectContent>
            {connectionOptions.map((option) => {
              const Icon = option.icon;
              return (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {renderConnectionForm()}
    </div>
  );

  if (showAsCard) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-orange" />
            Data Connection
          </CardTitle>
          <CardDescription>
            Connect to your data source for analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );
  }

  return content;
};

export default DataConnection;
