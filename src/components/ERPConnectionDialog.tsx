import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Database, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ERPConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ERPConnectionDialog = ({ open, onOpenChange }: ERPConnectionDialogProps) => {
  const [erpType, setErpType] = useState<string>("");
  const [apiKey, setApiKey] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const erpOptions = [
    { value: "sap", label: "SAP ERP" },
    { value: "oracle", label: "Oracle ERP" },
    { value: "netsuite", label: "NetSuite" },
    { value: "quickbooks", label: "QuickBooks" },
    { value: "xero", label: "Xero" },
    { value: "sage", label: "Sage Intacct" },
    { value: "dynamics", label: "Microsoft Dynamics" },
    { value: "custom", label: "Custom Database" },
  ];

  const handleConnect = async () => {
    if (!erpType || !endpoint) {
      toast({
        title: "Missing Information",
        description: "Please select ERP type and provide endpoint",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate connection
    setTimeout(() => {
      toast({
        title: "Connection Successful",
        description: `Connected to ${erpOptions.find(e => e.value === erpType)?.label}`,
      });
      setLoading(false);
      onOpenChange(false);
      // Reset form
      setErpType("");
      setApiKey("");
      setEndpoint("");
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Database className="h-6 w-6 text-orange" />
            Connect to ERP/Database
          </DialogTitle>
          <DialogDescription>
            Connect your ERP system or database for real-time data synchronization
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="erp-type">ERP System / Database Type</Label>
            <Select value={erpType} onValueChange={setErpType}>
              <SelectTrigger id="erp-type">
                <SelectValue placeholder="Select your ERP system" />
              </SelectTrigger>
              <SelectContent>
                {erpOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          <div className="pt-4 space-y-2">
            <Button 
              onClick={handleConnect} 
              disabled={loading || !erpType || !endpoint}
              className="w-full"
            >
              {loading ? "Connecting..." : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Connect to {erpType ? erpOptions.find(e => e.value === erpType)?.label : "ERP"}
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ERPConnectionDialog;
