import { useState, useMemo, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Smile, Meh, Frown, MessageSquare, TrendingUp, TrendingDown, Filter, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type SectionId = "distribution" | "trends" | "insights";

interface Section {
  id: SectionId;
  title: string;
}

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
  const [sections, setSections] = useState<Section[]>([
    { id: "distribution", title: "Current Sentiment Distribution" },
    { id: "trends", title: "Sentiment Trend Analysis" },
    { id: "insights", title: "AI Insights" },
  ]);

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

  const moveSection = useCallback((index: number, direction: "up" | "down") => {
    setSections(prev => {
      const newSections = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newSections.length) return prev;
      [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
      return newSections;
    });
  }, []);

  const renderSection = (section: Section, index: number) => {
    const canMoveUp = index > 0;
    const canMoveDown = index < sections.length - 1;

    const moveControls = (
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          disabled={!canMoveUp}
          onClick={() => moveSection(index, "up")}
          title="Move up"
        >
          <ArrowUp className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          disabled={!canMoveDown}
          onClick={() => moveSection(index, "down")}
          title="Move down"
        >
          <ArrowDown className="h-3 w-3" />
        </Button>
      </div>
    );

    switch (section.id) {
      case "distribution":
        return (
          <div key={section.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">{section.title}</h4>
              {moveControls}
            </div>
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
        );

      case "trends":
        return (
          <Card key={section.id} className="border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  {section.title}
                </CardTitle>
                <div className="flex items-center gap-2">
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
                  {moveControls}
                </div>
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
        );

      case "insights":
        return (
          <div key={section.id} className="pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">{section.title}</h4>
              </div>
              {moveControls}
            </div>
            <div className="space-y-3">
              {insights.map((insight, idx) => (
                <div 
                  key={idx} 
                  className="p-3 rounded-lg bg-muted/30 border border-border"
                >
                  <p className="text-xs text-foreground mb-1">{insight.text}</p>
                  <p className="text-xs text-muted-foreground">{insight.timestamp}</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {sections.map((section, index) => renderSection(section, index))}
    </div>
  );
};

export default SentimentAnalysis;
