import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ClientData } from "@/utils/csvParser";
import { useMemo } from "react";

interface RiskDistributionProps {
  viewMode: "clients" | "value";
  clientData: ClientData[];
  onCategoryClick?: (category: string, clients: ClientData[]) => void;
}

const RiskDistribution = ({ viewMode, clientData, onCategoryClick }: RiskDistributionProps) => {
  const data = useMemo(() => {
    const lowRisk = clientData.filter(c => c.riskCategory === "Low");
    const mediumRisk = clientData.filter(c => c.riskCategory === "Medium");
    const highRisk = clientData.filter(c => c.riskCategory === "High");

    if (viewMode === "clients") {
      return [
        { name: "Low Risk", value: lowRisk.length, color: "hsl(var(--success))" },
        { name: "Medium Risk", value: mediumRisk.length, color: "hsl(var(--warning))" },
        { name: "High Risk", value: highRisk.length, color: "hsl(var(--destructive))" },
      ];
    } else {
      return [
        { 
          name: "Low Risk", 
          value: lowRisk.reduce((sum, c) => sum + c.invoiceAmount, 0), 
          color: "hsl(var(--success))" 
        },
        { 
          name: "Medium Risk", 
          value: mediumRisk.reduce((sum, c) => sum + c.invoiceAmount, 0), 
          color: "hsl(var(--warning))" 
        },
        { 
          name: "High Risk", 
          value: highRisk.reduce((sum, c) => sum + c.invoiceAmount, 0), 
          color: "hsl(var(--destructive))" 
        },
      ];
    }
  }, [clientData, viewMode]);

  const formatValue = (value: number) => {
    if (viewMode === "clients") {
      return value.toString();
    } else {
      return `$${(value / 1000).toFixed(1)}K`;
    }
  };

  return (
    <div className="space-y-6">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatValue(value)} />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="grid grid-cols-3 gap-4">
        {data.map((item) => {
          const category = item.name.replace(" Risk", "");
          const categoryClients = clientData.filter(c => c.riskCategory === category);
          
          return (
            <div 
              key={item.name} 
              className="text-center p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => onCategoryClick?.(category, categoryClients)}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <div 
                  className="h-3 w-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <p className="text-sm font-medium text-foreground">{item.name}</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatValue(item.value)}</p>
              <p className="text-xs text-muted-foreground">
                {viewMode === "clients" ? "clients" : "AR value"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RiskDistribution;
