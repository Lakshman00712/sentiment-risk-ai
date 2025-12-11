import { useState, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Smile, Meh, Frown, MessageSquare, TrendingUp, TrendingDown, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

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

// Generate trend data
const generateTrendData = (period: string) => {
  const baseData = {
    "7d": [
      { date: "Mon", positive: 58, neutral: 30, negative: 12 },
      { date: "Tue", positive: 60, neutral: 28, negative: 12 },
      { date: "Wed", positive: 55, neutral: 32, negative: 13 },
      { date: "Thu", positive: 62, neutral: 26, negative: 12 },
      { date: "Fri", positive: 65, neutral: 25, negative: 10 },
      { date: "Sat", positive: 63, neutral: 27, negative: 10 },
      { date: "Sun", positive: 62, neutral: 28, negative: 10 },
    ],
    "30d": [
      { date: "Week 1", positive: 55, neutral: 32, negative: 13 },
      { date: "Week 2", positive: 58, neutral: 30, negative: 12 },
      { date: "Week 3", positive: 60, neutral: 28, negative: 12 },
      { date: "Week 4", positive: 62, neutral: 28, negative: 10 },
    ],
    "90d": [
      { date: "Jan", positive: 50, neutral: 35, negative: 15 },
      { date: "Feb", positive: 55, neutral: 32, negative: 13 },
      { date: "Mar", positive: 62, neutral: 28, negative: 10 },
    ],
  };
  return baseData[period as keyof typeof baseData] || baseData["30d"];
};

const SentimentAnalysis = () => {
  const [trendPeriod, setTrendPeriod] = useState("30d");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(true);

  const trendData = useMemo(() => generateTrendData(trendPeriod), [trendPeriod]);

  const filteredTrendData = useMemo(() => {
    if (sentimentFilter === "all") return trendData;
    return trendData.map(item => ({
      date: item.date,
      [sentimentFilter]: item[sentimentFilter as keyof typeof item],
    }));
  }, [trendData, sentimentFilter]);

  const trendAnalysis = useMemo(() => {
    if (trendData.length < 2) return { change: 0, direction: "stable" };
    const first = trendData[0].positive;
    const last = trendData[trendData.length - 1].positive;
    const change = ((last - first) / first * 100).toFixed(1);
    return {
      change: Math.abs(parseFloat(change)),
      direction: parseFloat(change) >= 0 ? "up" : "down"
    };
  }, [trendData]);

  return (
    <div className="space-y-6">
      {/* Current Sentiment Distribution */}
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

      {/* Trend Analysis Section */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Sentiment Trend Analysis
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs"
            >
              <Filter className="h-3 w-3 mr-1" />
              Filters
              {showFilters ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showFilters && (
            <div className="flex flex-wrap gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Time Period</label>
                <Select value={trendPeriod} onValueChange={setTrendPeriod}>
                  <SelectTrigger className="w-[120px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Sentiment Type</label>
                <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                  <SelectTrigger className="w-[120px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Trend Summary */}
          <div className="flex items-center gap-2 text-sm">
            {trendAnalysis.direction === "up" ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
            <span>
              Positive sentiment {trendAnalysis.direction === "up" ? "increased" : "decreased"} by{" "}
              <strong>{trendAnalysis.change}%</strong> over the selected period
            </span>
          </div>

          {/* Trend Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                {(sentimentFilter === "all" || sentimentFilter === "positive") && (
                  <Line type="monotone" dataKey="positive" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
                )}
                {(sentimentFilter === "all" || sentimentFilter === "neutral") && (
                  <Line type="monotone" dataKey="neutral" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} />
                )}
                {(sentimentFilter === "all" || sentimentFilter === "negative") && (
                  <Line type="monotone" dataKey="negative" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
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
