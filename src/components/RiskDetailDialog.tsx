import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClientData } from "@/utils/csvParser";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Phone, DollarSign, Calendar, TrendingDown, TrendingUp } from "lucide-react";

interface RiskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: ClientData[];
  category: string;
}

const RiskDetailDialog = ({ open, onOpenChange, clients, category }: RiskDetailDialogProps) => {
  const totalAR = clients.reduce((sum, c) => sum + c.invoiceAmount, 0);
  const avgSentiment = clients.reduce((sum, c) => sum + c.sentimentScore, 0) / clients.length;

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
            {clients.length} clients • Total AR: ${totalAR.toLocaleString()} • Avg Sentiment: {avgSentiment.toFixed(2)}
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
                  <Badge variant={getRiskColor(client.riskCategory) as any}>
                    {client.riskCategory}
                  </Badge>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-sm">
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
                    <span className="text-muted-foreground">{new Date(client.lastPaymentDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {client.sentimentScore >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                    <span>Sentiment: {client.sentimentScore.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={client.paymentHistory === "On-time" ? "success" as any : "warning" as any}>
                      {client.paymentHistory}
                    </Badge>
                  </div>
                </div>

                {client.socialMediaSignal && (
                  <div className="mt-3 p-2 bg-muted rounded text-xs">
                    <span className="font-medium">Social Signal: </span>
                    {client.socialMediaSignal}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default RiskDetailDialog;
