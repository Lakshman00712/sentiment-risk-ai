import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, ChevronRight, Clock, CreditCard } from "lucide-react";
import { ClientData } from "@/utils/csvParser";

interface Client {
  id: string;
  name: string;
  riskScore: number;
  riskCategory: "Low" | "Medium" | "High";
  outstandingBalance: number;
  daysPastDue: number;
  creditUtilization: number;
  dueDate: string;
}

const convertClientData = (data: ClientData): Client => {
  return {
    id: data.id,
    name: data.name,
    riskScore: data.riskScore,
    riskCategory: data.riskCategory,
    outstandingBalance: data.invoiceAmount,
    daysPastDue: data.daysPastDue,
    creditUtilization: data.creditUtilization,
    dueDate: data.dueDate,
  };
};

const getRiskBadge = (category: "Low" | "Medium" | "High") => {
  if (category === "High") return { label: "High Risk", variant: "destructive" as const };
  if (category === "Medium") return { label: "Medium Risk", variant: "warning" as const };
  return { label: "Low Risk", variant: "success" as const };
};

const getDaysPastDueColor = (days: number) => {
  if (days >= 90) return "text-destructive";
  if (days >= 30) return "text-warning";
  return "text-success";
};

interface ClientsListProps {
  filter: "all" | "high" | "medium" | "low";
  clientData?: ClientData[];
}

const ClientsList = ({ filter, clientData = [] }: ClientsListProps) => {
  const clients = clientData.map(convertClientData);
  
  const filteredClients = clients.filter(client => {
    if (filter === "all") return true;
    if (filter === "high") return client.riskCategory === "High";
    if (filter === "medium") return client.riskCategory === "Medium";
    if (filter === "low") return client.riskCategory === "Low";
    return true;
  });

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {filteredClients.map((client) => {
            const riskBadge = getRiskBadge(client.riskCategory);
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
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className={getDaysPastDueColor(client.daysPastDue)}>
                          {client.daysPastDue} days overdue
                        </span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        {client.creditUtilization}% utilized
                      </span>
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
                      <p className="text-xs text-muted-foreground">Credit Used</p>
                      <p className="text-xs font-semibold text-foreground">{client.creditUtilization}%</p>
                    </div>
                    <Progress 
                      value={client.creditUtilization} 
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
