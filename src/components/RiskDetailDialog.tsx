import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClientData } from "@/utils/csvParser";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Mail, Phone, DollarSign, Calendar, Clock, CreditCard, Bell, ShoppingCart } from "lucide-react";

interface RiskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: ClientData[];
  category: string;
}

const RiskDetailDialog = ({ open, onOpenChange, clients, category }: RiskDetailDialogProps) => {
  const totalAR = clients.reduce((sum, c) => sum + c.invoiceAmount, 0);
  const avgRiskScore = clients.length > 0 
    ? Math.round(clients.reduce((sum, c) => sum + c.riskScore, 0) / clients.length)
    : 0;

  const getRiskColor = (risk: string) => {
    if (risk === "High") return "destructive";
    if (risk === "Medium") return "warning";
    return "success";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Badge variant={getRiskColor(category) as any}>{category} Risk</Badge>
            Detailed Analysis
          </DialogTitle>
          <DialogDescription>
            {clients.length} clients • Total AR: ${totalAR.toLocaleString()} • Avg Risk Score: {avgRiskScore}/100
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {clients.map((client) => (
              <div key={client.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{client.name}</h4>
                    <p className="text-sm text-muted-foreground">ID: {client.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{client.riskScore}/100</span>
                    <Badge variant={getRiskColor(client.riskCategory) as any}>
                      {client.riskCategory}
                    </Badge>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-sm mb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{client.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">${client.invoiceAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Due: {client.dueDate ? new Date(client.dueDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                {/* Risk Factor Breakdown */}
                <div className="grid sm:grid-cols-2 gap-3 p-3 bg-muted/30 rounded text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Days Past Due (50%)
                    </span>
                    <span className={client.daysPastDue >= 90 ? "text-destructive font-medium" : "font-medium"}>
                      {client.daysPastDue} days
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <CreditCard className="h-3 w-3" /> Credit Util. (25%)
                    </span>
                    <span className={client.creditUtilization >= 85 ? "text-destructive font-medium" : "font-medium"}>
                      {client.creditUtilization}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Bell className="h-3 w-3" /> Reminders (15%)
                    </span>
                    <span className={client.remindersCount >= 3 ? "text-destructive font-medium" : "font-medium"}>
                      {client.remindersCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ShoppingCart className="h-3 w-3" /> Avg Orders (10%)
                    </span>
                    <span className={client.avgOrders60Days < 5 ? "text-destructive font-medium" : "font-medium"}>
                      {client.avgOrders60Days.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Risk Rationale */}
                <div className="mt-3 p-2 bg-muted rounded text-xs">
                  <span className="font-medium">Analysis: </span>
                  {client.riskRationale}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default RiskDetailDialog;
