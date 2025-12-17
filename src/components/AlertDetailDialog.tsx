import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClientData } from "@/utils/csvParser";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Mail, Phone, DollarSign, Calendar, MessageSquare, Send, Clock, CreditCard, Bell, ShoppingCart } from "lucide-react";
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                {client.riskCategory} Risk ({client.riskScore}/100)
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
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <p className="text-sm font-medium">{client.dueDate ? new Date(client.dueDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Indicators */}
          <div className="space-y-3">
            <h3 className="font-semibold">Risk Indicators</h3>
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Days Past Due
                  </span>
                  <span className={client.daysPastDue >= 90 ? "text-destructive font-medium" : client.daysPastDue >= 30 ? "text-warning font-medium" : "font-medium"}>
                    {client.daysPastDue} days
                  </span>
                </div>
                <Progress value={Math.min(client.daysPastDue / 90 * 100, 100)} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <CreditCard className="h-3 w-3" /> Credit Utilization
                  </span>
                  <span className={client.creditUtilization >= 85 ? "text-destructive font-medium" : client.creditUtilization >= 70 ? "text-warning font-medium" : "font-medium"}>
                    {client.creditUtilization}%
                  </span>
                </div>
                <Progress value={client.creditUtilization} className="h-2" />
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Bell className="h-3 w-3" /> Reminders Sent
                </span>
                <Badge variant={client.remindersCount >= 3 ? "destructive" as any : client.remindersCount >= 2 ? "warning" as any : "secondary"}>
                  {client.remindersCount}
                </Badge>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <ShoppingCart className="h-3 w-3" /> Avg Orders (60 days)
                </span>
                <span className={client.avgOrders60Days < 5 ? "text-destructive font-medium" : "font-medium"}>
                  {client.avgOrders60Days.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Risk Rationale */}
          <div className="space-y-3">
            <h3 className="font-semibold">Risk Analysis</h3>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">{client.riskRationale}</p>
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
