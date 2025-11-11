import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  value: string;
  change: number;
  trend: "up" | "down";
  icon: LucideIcon;
  description?: string;
  variant?: "default" | "warning" | "success";
}

const MetricsCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  description,
  variant = "default" 
}: MetricsCardProps) => {
  const isPositive = trend === "up";
  const changeColor = variant === "warning" 
    ? "text-warning" 
    : isPositive 
      ? "text-success" 
      : "text-destructive";

  return (
    <Card className="transition-all hover:shadow-lg hover:scale-[1.02] duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center",
            variant === "warning" 
              ? "bg-warning/10" 
              : "bg-primary/10"
          )}>
            <Icon className={cn(
              "h-6 w-6",
              variant === "warning" ? "text-warning" : "text-primary"
            )} />
          </div>
          <div className={cn("flex items-center gap-1", changeColor)}>
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            <span className="text-sm font-semibold">{Math.abs(change)}%</span>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-foreground mb-1">{value}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricsCard;
