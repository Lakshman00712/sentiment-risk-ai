import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Database, Link as LinkIcon, AlertCircle, ArrowRight } from "lucide-react";
import { parseCSV, fetchCSVFromURL, ClientData } from "@/utils/csvParser";
import { useToast } from "@/hooks/use-toast";

interface LandingPageProps {
  onDataLoaded: (data: ClientData[]) => void;
}

const LandingPage = ({ onDataLoaded }: LandingPageProps) => {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-orange/5 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-orange flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-orange bg-clip-text text-transparent">
              Credit Risk Insights
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered credit risk assessment and accounts receivable analytics
          </p>
        </div>

        {/* Data Connection Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload CSV */}
          <Card className="border-2 hover:border-orange transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-orange" />
                <CardTitle>Upload CSV File</CardTitle>
              </div>
              <CardDescription>
                Upload your client data file for instant analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={loading}
                />
              </div>
              <Button 
                className="w-full" 
                disabled={loading}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                {loading ? "Loading..." : "Upload & Analyze"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Connect from URL */}
          <Card className="border-2 hover:border-orange transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-orange" />
                <CardTitle>Connect from URL</CardTitle>
              </div>
              <CardDescription>
                Link to your data source for live updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url-input">Data URL</Label>
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
            </CardContent>
          </Card>
        </div>

        {/* File Format Instructions */}
        <Card className="bg-muted/50 border-orange/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange" />
              <CardTitle className="text-base">Required CSV Format</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Your CSV file should include the following columns:
            </p>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange" />
                <span>CustomerID</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange" />
                <span>Name</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange" />
                <span>Email</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange" />
                <span>PhoneNumber</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange" />
                <span>InvoiceAmount</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange" />
                <span>PaymentHistory</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange" />
                <span>LastPaymentDate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange" />
                <span>SentimentScore</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange" />
                <span>BehaviorScore</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange" />
                <span>RiskCategory</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Missing import
import { BarChart3 } from "lucide-react";

export default LandingPage;
