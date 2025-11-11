import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Users, 
  DollarSign,
  Activity,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  CheckCircle,
  Clock
} from "lucide-react";
import MetricsCard from "@/components/MetricsCard";
import ClientsList from "@/components/ClientsList";
import RiskDistribution from "@/components/RiskDistribution";
import SentimentAnalysis from "@/components/SentimentAnalysis";

const Index = () => {
  const [timeRange, setTimeRange] = useState("30d");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">RiskGuard AI</h1>
                <p className="text-xs text-muted-foreground">Credit Risk Assessment Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Live Updates
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent">
                <Brain className="h-4 w-4 mr-2" />
                Run Analysis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Time Range Selector */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Executive Dashboard</h2>
            <p className="text-muted-foreground">Real-time credit risk insights and predictions</p>
          </div>
          <div className="flex gap-2">
            {["7d", "30d", "90d", "1y"].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Total AR Value"
            value="$2.4M"
            change={8.2}
            trend="up"
            icon={DollarSign}
            description="Outstanding receivables"
          />
          <MetricsCard
            title="Average Risk Score"
            value="68/100"
            change={-5.3}
            trend="down"
            icon={Shield}
            description="Lower is better"
          />
          <MetricsCard
            title="High Risk Accounts"
            value="23"
            change={12.5}
            trend="up"
            icon={AlertCircle}
            description="Requiring attention"
            variant="warning"
          />
          <MetricsCard
            title="Active Clients"
            value="347"
            change={3.1}
            trend="up"
            icon={Users}
            description="With outstanding invoices"
          />
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution Analysis</CardTitle>
                <CardDescription>Client portfolio segmented by risk level</CardDescription>
              </CardHeader>
              <CardContent>
                <RiskDistribution />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>AI Sentiment Analysis</CardTitle>
                <CardDescription>Communication patterns & behavior</CardDescription>
              </CardHeader>
              <CardContent>
                <SentimentAnalysis />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alerts & Priority Actions */}
        <Card className="mb-8 border-warning/50 bg-warning/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-warning" />
                <CardTitle>Priority Alerts</CardTitle>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  <div>
                    <p className="font-medium text-sm">TechCorp Industries - Payment Overdue 45 Days</p>
                    <p className="text-xs text-muted-foreground">Risk score increased to 89/100</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Take Action</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-warning animate-pulse" />
                  <div>
                    <p className="font-medium text-sm">Global Retail Co - Negative Sentiment Detected</p>
                    <p className="text-xs text-muted-foreground">Recent communication shows financial stress</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Review</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Portfolio */}
        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Clients</TabsTrigger>
              <TabsTrigger value="high-risk">High Risk</TabsTrigger>
              <TabsTrigger value="medium-risk">Medium Risk</TabsTrigger>
              <TabsTrigger value="low-risk">Low Risk</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="space-y-4">
            <ClientsList filter="all" />
          </TabsContent>
          
          <TabsContent value="high-risk" className="space-y-4">
            <ClientsList filter="high" />
          </TabsContent>
          
          <TabsContent value="medium-risk" className="space-y-4">
            <ClientsList filter="medium" />
          </TabsContent>
          
          <TabsContent value="low-risk" className="space-y-4">
            <ClientsList filter="low" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
