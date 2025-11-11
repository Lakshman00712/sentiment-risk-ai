import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchCSVFromURL, ClientData } from "@/utils/csvParser";

interface LiveDataDialogProps {
  onDataFetched: (data: ClientData[]) => void;
}

const LiveDataDialog = ({ onDataFetched }: LiveDataDialogProps) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectedUrl, setConnectedUrl] = useState("");
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!url) return;

    setLoading(true);
    try {
      const data = await fetchCSVFromURL(url);
      onDataFetched(data);
      setConnectedUrl(url);
      setConnected(true);
      toast({
        title: "Connected",
        description: `Live data connected successfully. Loaded ${data.length} records.`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to the URL. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!connectedUrl) return;

    setLoading(true);
    try {
      const data = await fetchCSVFromURL(connectedUrl);
      onDataFetched(data);
      toast({
        title: "Data Refreshed",
        description: `Updated with ${data.length} records`,
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data from URL",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Activity className="h-4 w-4 mr-2" />
          Live Updates
          {connected && <span className="ml-2 h-2 w-2 rounded-full bg-success animate-pulse" />}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Live Data Connection</DialogTitle>
          <DialogDescription>
            Connect to a live data source URL for automatic updates
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="live-url">Data Source URL</Label>
            <Input
              id="live-url"
              type="url"
              placeholder="https://example.com/live-data.csv"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Must be a publicly accessible CSV file with the same format
            </p>
          </div>

          {connected && (
            <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-sm font-medium text-success mb-1">Connected</p>
              <p className="text-xs text-muted-foreground break-all">{connectedUrl}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleConnect} 
              disabled={!url || loading}
              className="flex-1"
            >
              {loading ? "Connecting..." : connected ? "Update Connection" : "Connect"}
            </Button>
            
            {connected && (
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveDataDialog;
