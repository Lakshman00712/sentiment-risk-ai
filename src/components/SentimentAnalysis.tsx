import { Progress } from "@/components/ui/progress";
import { Smile, Meh, Frown, MessageSquare } from "lucide-react";

const sentiments = [
  {
    label: "Positive",
    value: 62,
    icon: Smile,
    color: "text-success",
    bgColor: "bg-success/10"
  },
  {
    label: "Neutral",
    value: 28,
    icon: Meh,
    color: "text-muted-foreground",
    bgColor: "bg-muted"
  },
  {
    label: "Negative",
    value: 10,
    icon: Frown,
    color: "text-destructive",
    bgColor: "bg-destructive/10"
  }
];

const insights = [
  {
    text: "Payment reminder emails show 85% positive response rate",
    timestamp: "2 hours ago"
  },
  {
    text: "Increased communication frequency detected in high-risk accounts",
    timestamp: "5 hours ago"
  },
  {
    text: "Financial stress keywords up 15% this week",
    timestamp: "1 day ago"
  }
];

const SentimentAnalysis = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {sentiments.map((sentiment) => {
          const Icon = sentiment.icon;
          return (
            <div key={sentiment.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${sentiment.bgColor}`}>
                    <Icon className={`h-4 w-4 ${sentiment.color}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {sentiment.label}
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {sentiment.value}%
                </span>
              </div>
              <Progress value={sentiment.value} className="h-2" />
            </div>
          );
        })}
      </div>

      <div className="pt-6 border-t border-border">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">AI Insights</h4>
        </div>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div 
              key={index} 
              className="p-3 rounded-lg bg-muted/30 border border-border"
            >
              <p className="text-xs text-foreground mb-1">{insight.text}</p>
              <p className="text-xs text-muted-foreground">{insight.timestamp}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalysis;
