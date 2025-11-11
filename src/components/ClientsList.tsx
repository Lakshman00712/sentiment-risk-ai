import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

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

const mockClients: Client[] = [
  {
    id: "1",
    name: "TechCorp Industries",
    industry: "Technology",
    riskScore: 89,
    outstandingBalance: 245000,
    paymentHistory: 67,
    sentiment: "negative",
    lastContact: "2 days ago"
  },
  {
    id: "2",
    name: "Global Retail Co",
    industry: "Retail",
    riskScore: 72,
    outstandingBalance: 180000,
    paymentHistory: 78,
    sentiment: "neutral",
    lastContact: "5 days ago"
  },
  {
    id: "3",
    name: "Manufacturing Plus",
    industry: "Manufacturing",
    riskScore: 35,
    outstandingBalance: 92000,
    paymentHistory: 94,
    sentiment: "positive",
    lastContact: "1 day ago"
  },
  {
    id: "4",
    name: "Healthcare Solutions",
    industry: "Healthcare",
    riskScore: 28,
    outstandingBalance: 156000,
    paymentHistory: 96,
    sentiment: "positive",
    lastContact: "3 days ago"
  },
  {
    id: "5",
    name: "Energy Dynamics",
    industry: "Energy",
    riskScore: 58,
    outstandingBalance: 310000,
    paymentHistory: 82,
    sentiment: "neutral",
    lastContact: "1 week ago"
  }
];

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
}

const ClientsList = ({ filter }: ClientsListProps) => {
  const filteredClients = mockClients.filter(client => {
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
