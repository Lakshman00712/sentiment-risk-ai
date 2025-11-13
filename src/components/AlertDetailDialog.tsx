import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClientData } from "@/utils/csvParser";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Mail, Phone, DollarSign, Calendar, MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AlertDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientData | null;
}

const AlertDetailDialog = ({ open, onOpenChange, client }: AlertDetailDialogProps) => {
  const [action, setAction] = useState("");
  const { toast } = useToast();

  if (!client) return null;

  const handleTakeAction = () => {
    if (!action.trim()) return;

    toast({
      title: "Action Recorded",
      description: `Action noted for ${client.name}. Follow-up scheduled.`,
    });
    setAction("");
    onOpenChange(false);
  };

  const getRiskColor = (risk: string) => {
    if (risk === "High") return "destructive";
    if (risk === "Medium") return "warning";
    return "success";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            Action Required: {client.name}
          </DialogTitle>
          <DialogDescription>
            Review client details and document your follow-up action
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Client Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Client Information</h3>
              <Badge variant={getRiskColor(client.riskCategory) as any}>
                {client.riskCategory} Risk
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{client.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{client.phoneNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Invoice Amount</p>
                  <p className="text-sm font-medium">${client.invoiceAmount.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Last Payment</p>
                  <p className="text-sm font-medium">{new Date(client.lastPaymentDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Indicators */}
          <div className="space-y-3">
            <h3 className="font-semibold">Risk Indicators</h3>
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sentiment Score:</span>
                <span className={client.sentimentScore < 0 ? "text-destructive font-medium" : "text-success font-medium"}>
                  {client.sentimentScore.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Behavior Score:</span>
                <span className="font-medium">{client.behaviorScore}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment History:</span>
                <Badge variant={client.paymentHistory === "On-time" ? "success" as any : "warning" as any}>
                  {client.paymentHistory}
                </Badge>
              </div>
              {client.socialMediaSignal && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Social Signal:</span>
                  <p className="mt-1 text-xs p-2 bg-background rounded">{client.socialMediaSignal}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Documentation */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Document Action
            </h3>
            <Textarea
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="Enter follow-up action, notes, or communication details..."
              rows={4}
            />
            <Button onClick={handleTakeAction} disabled={!action.trim()} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Record Action & Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlertDetailDialog;
