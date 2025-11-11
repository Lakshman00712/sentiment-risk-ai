import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link as LinkIcon, Database, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parseCSV, fetchCSVFromURL, ClientData } from "@/utils/csvParser";

interface DataImportProps {
  onDataImported: (data: ClientData[]) => void;
}

const DataImport = ({ onDataImported }: DataImportProps) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const data = parseCSV(text);
      onDataImported(data);
      toast({
        title: "Success",
        description: `Imported ${data.length} client records`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse CSV file",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleURLImport = async () => {
    if (!url) return;

    setLoading(true);
    try {
      const data = await fetchCSVFromURL(url);
      onDataImported(data);
      toast({
        title: "Success",
        description: `Imported ${data.length} client records from URL`,
      });
      setUrl("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data from URL",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <CardTitle>Data Import</CardTitle>
        </div>
        <CardDescription>
          Upload CSV file or connect to external data source
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV
            </TabsTrigger>
            <TabsTrigger value="url">
              <LinkIcon className="h-4 w-4 mr-2" />
              From URL
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select CSV File</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={loading}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                CSV should contain: CustomerID, Name, Email, PhoneNumber, InvoiceAmount, 
                PaymentHistory, SentimentScore, BehaviorScore, RiskCategory
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url-input">Data Source URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="url-input"
                  type="url"
                  placeholder="https://example.com/data.csv"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  className="flex-1"
                />
                <Button 
                  onClick={handleURLImport} 
                  disabled={!url || loading}
                >
                  {loading ? "Loading..." : "Import"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                URL must point to a publicly accessible CSV file
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Expected CSV Format:</p>
              <p>CustomerID, Name, Email, PhoneNumber, InvoiceAmount, PaymentHistory, 
              LastPaymentDate, SentimentScore, BehaviorScore, SocialMediaSignal, RiskCategory</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataImport;