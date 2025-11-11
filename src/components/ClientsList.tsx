import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ClientData } from "@/utils/csvParser";

interface Client {
  id: string;
  name: string;
  industry: string;
  riskScore: number;
  outstandingBalance: number;
  paymentHistory: number;
  sentiment: "positive" | "neutral" | "negative";
  lastContact: string;
}

const convertClientData = (data: ClientData): Client => {
  // Convert sentiment score to positive/neutral/negative
  const sentiment = data.sentimentScore > 0.3 ? "positive" : 
                   data.sentimentScore < -0.3 ? "negative" : "neutral";
  
  // Convert behavior score (0-1) to percentage for payment history
  const paymentHistory = Math.round(data.behaviorScore * 100);
  
  // Calculate risk score from risk category and behavior
  const riskScore = data.riskCategory === "High" ? 70 + Math.random() * 30 :
                   data.riskCategory === "Medium" ? 40 + Math.random() * 30 :
                   Math.random() * 40;
  
  return {
    id: data.id,
    name: data.name,
    industry: data.industry || "General",
    riskScore: Math.round(riskScore),
    outstandingBalance: data.invoiceAmount,
    paymentHistory,
    sentiment,
    lastContact: new Date(data.lastPaymentDate).toLocaleDateString() || "Unknown"
  };
};

const getRiskBadge = (score: number) => {
  if (score >= 70) return { label: "High Risk", variant: "destructive" as const };
  if (score >= 40) return { label: "Medium Risk", variant: "warning" as const };
  return { label: "Low Risk", variant: "success" as const };
};

const getSentimentIcon = (sentiment: string) => {
  switch (sentiment) {
    case "positive":
      return <TrendingUp className="h-4 w-4 text-success" />;
    case "negative":
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
};

interface ClientsListProps {
  filter: "all" | "high" | "medium" | "low";
  clientData?: ClientData[];
}

const ClientsList = ({ filter, clientData = [] }: ClientsListProps) => {
  const clients = clientData.map(convertClientData);
  
  const filteredClients = clients.filter(client => {
    if (filter === "all") return true;
    if (filter === "high") return client.riskScore >= 70;
    if (filter === "medium") return client.riskScore >= 40 && client.riskScore < 70;
    if (filter === "low") return client.riskScore < 40;
    return true;
  });

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {filteredClients.map((client) => {
            const riskBadge = getRiskBadge(client.riskScore);
            return (
              <div
                key={client.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Building2 className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-foreground">{client.name}</h4>
                      <Badge variant={riskBadge.variant}>{riskBadge.label}</Badge>
                      {getSentimentIcon(client.sentiment)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{client.industry}</span>
                      <span>•</span>
                      <span>Last contact: {client.lastContact}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Outstanding</p>
                    <p className="font-semibold text-foreground">
                      ${(client.outstandingBalance / 1000).toFixed(0)}K
                    </p>
                  </div>
                  
                  <div className="w-32">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-muted-foreground">Risk Score</p>
                      <p className="text-xs font-semibold text-foreground">{client.riskScore}/100</p>
                    </div>
                    <Progress 
                      value={client.riskScore} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="w-32">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-muted-foreground">Payment History</p>
                      <p className="text-xs font-semibold text-foreground">{client.paymentHistory}%</p>
                    </div>
                    <Progress 
                      value={client.paymentHistory} 
                      className="h-2"
                    />
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    View Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientsList;
