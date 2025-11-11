import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Low Risk", value: 156, color: "hsl(var(--success))" },
  { name: "Medium Risk", value: 168, color: "hsl(var(--warning))" },
  { name: "High Risk", value: 23, color: "hsl(var(--destructive))" },
];

const RiskDistribution = () => {
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
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="grid grid-cols-3 gap-4">
        {data.map((item) => (
          <div key={item.name} className="text-center p-4 rounded-lg bg-muted/30">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <p className="text-sm font-medium text-foreground">{item.name}</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{item.value}</p>
            <p className="text-xs text-muted-foreground">clients</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskDistribution;
