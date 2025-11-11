import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertCircle, 
  Users, 
  DollarSign,
  Shield,
  Brain,
} from "lucide-react";
import MetricsCard from "@/components/MetricsCard";
import ClientsList from "@/components/ClientsList";
import RiskDistribution from "@/components/RiskDistribution";
import SentimentAnalysis from "@/components/SentimentAnalysis";
import DataImport from "@/components/DataImport";
import LiveDataDialog from "@/components/LiveDataDialog";
import AdvancedFilters, { FilterOptions } from "@/components/AdvancedFilters";
import { ClientData, loadSampleData } from "@/utils/csvParser";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [clientData, setClientData] = useState<ClientData[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    paymentHistory: "all",
    riskCategory: "all",
    sentimentMin: -1,
    sentimentMax: 1,
    dateFrom: undefined,
    dateTo: undefined,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSampleData().then(data => {
      setClientData(data);
      toast({
        title: "Sample Data Loaded",
        description: `Loaded ${data.length} client records`,
      });
    });
  }, []);

  // Filter client data based on all filter criteria
  const filteredData = useMemo(() => {
    return clientData.filter(client => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          client.name.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower) ||
          client.phoneNumber.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Payment history filter
      if (filters.paymentHistory !== "all" && client.paymentHistory !== filters.paymentHistory) {
        return false;
      }

      // Risk category filter
      if (filters.riskCategory !== "all" && client.riskCategory !== filters.riskCategory) {
        return false;
      }

      // Sentiment score range
      if (client.sentimentScore < filters.sentimentMin || client.sentimentScore > filters.sentimentMax) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        const paymentDate = new Date(client.lastPaymentDate);
        if (filters.dateFrom && paymentDate < filters.dateFrom) return false;
        if (filters.dateTo && paymentDate > filters.dateTo) return false;
      }

      return true;
    });
  }, [clientData, filters]);

  // Calculate metrics from filtered data
  const metrics = useMemo(() => {
    const totalAR = filteredData.reduce((sum, client) => sum + client.invoiceAmount, 0);
    const avgRiskScore = filteredData.length > 0 
      ? filteredData.reduce((sum, client) => {
          const riskValue = client.riskCategory === "High" ? 85 : client.riskCategory === "Medium" ? 60 : 35;
          return sum + riskValue;
        }, 0) / filteredData.length
      : 0;
    const highRiskCount = filteredData.filter(c => c.riskCategory === "High").length;

    return {
      totalAR: totalAR.toFixed(2),
      avgRiskScore: avgRiskScore.toFixed(0),
      highRiskCount,
      activeClients: filteredData.length
    };
  }, [filteredData]);

  const handleExport = () => {
    const csv = [
      Object.keys(filteredData[0] || {}).join(','),
      ...filteredData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credit_risk_data_${new Date().toISOString()}.csv`;
    a.click();
    
    toast({
      title: "Export Complete",
      description: `Exported ${filteredData.length} records`,
    });
  };

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
              <LiveDataDialog onDataFetched={setClientData} />
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
            value={`$${(parseFloat(metrics.totalAR) / 1000).toFixed(1)}K`}
            change={8.2}
            trend="up"
            icon={DollarSign}
            description="Outstanding receivables"
          />
          <MetricsCard
            title="Average Risk Score"
            value={`${metrics.avgRiskScore}/100`}
            change={-5.3}
            trend="down"
            icon={Shield}
            description="Lower is better"
          />
          <MetricsCard
            title="High Risk Accounts"
            value={metrics.highRiskCount.toString()}
            change={12.5}
            trend="up"
            icon={AlertCircle}
            description="Requiring attention"
            variant="warning"
          />
          <MetricsCard
            title="Active Clients"
            value={metrics.activeClients.toString()}
            change={3.1}
            trend="up"
            icon={Users}
            description="Filtered records"
          />
        </div>

        {/* Data Import */}
        <div className="mb-8">
          <DataImport onDataImported={setClientData} />
        </div>

        {/* Advanced Filters */}
        <div className="mb-8">
          <AdvancedFilters
            filters={filters}
            onFiltersChange={setFilters}
            onExport={handleExport}
            totalRecords={clientData.length}
            filteredRecords={filteredData.length}
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
            <ClientsList filter="all" clientData={filteredData} />
          </TabsContent>
          
          <TabsContent value="high-risk" className="space-y-4">
            <ClientsList filter="high" clientData={filteredData} />
          </TabsContent>
          
          <TabsContent value="medium-risk" className="space-y-4">
            <ClientsList filter="medium" clientData={filteredData} />
          </TabsContent>
          
          <TabsContent value="low-risk" className="space-y-4">
            <ClientsList filter="low" clientData={filteredData} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
