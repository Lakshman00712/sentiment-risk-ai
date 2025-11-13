import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertCircle, 
  Users, 
  DollarSign,
  Shield,
  Brain,
  Info,
  History,
  FileText,
  Database,
  BarChart3,
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
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange to-orange-foreground/90 flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">RiskGuard AI</h1>
                <p className="text-xs text-muted-foreground">Credit Risk Assessment Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Connections
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Info
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Executive Dashboard</h2>
              <p className="text-muted-foreground">Real-time credit risk insights and predictions</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            {/* Analysis Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

            {/* Priority Alerts */}
            <Card className="border-warning/50 bg-warning/5">
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
          </TabsContent>

          {/* Data Connections Tab */}
          <TabsContent value="data" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Data Connections</h2>
              <p className="text-muted-foreground">Import and connect your data sources</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Upload CSV Data
                  </CardTitle>
                  <CardDescription>Import client data from CSV files</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataImport onDataImported={setClientData} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Live Data Connection
                  </CardTitle>
                  <CardDescription>Connect to external data sources via URL</CardDescription>
                </CardHeader>
                <CardContent>
                  <LiveDataDialog onDataFetched={setClientData} />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Connection Status</CardTitle>
                <CardDescription>Overview of your data connections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-success/10 border border-success/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
                      <div>
                        <p className="font-medium">Sample Data</p>
                        <p className="text-sm text-muted-foreground">{clientData.length} records loaded</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Refresh</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Reports & Analytics</h2>
              <p className="text-muted-foreground">Filter and export client data</p>
            </div>

            <AdvancedFilters
              filters={filters}
              onFiltersChange={setFilters}
              onExport={handleExport}
              totalRecords={clientData.length}
              filteredRecords={filteredData.length}
            />

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
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Historical Analysis</h2>
              <p className="text-muted-foreground">Track changes and trends over time</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest risk score changes and client interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 border-l-4 border-l-warning bg-card rounded-r-lg">
                    <div className="text-xs text-muted-foreground min-w-[100px]">2 hours ago</div>
                    <div className="flex-1">
                      <p className="font-medium">Risk Score Update</p>
                      <p className="text-sm text-muted-foreground">TechCorp Industries risk score increased from 72 to 89</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 border-l-4 border-l-success bg-card rounded-r-lg">
                    <div className="text-xs text-muted-foreground min-w-[100px]">5 hours ago</div>
                    <div className="flex-1">
                      <p className="font-medium">Payment Received</p>
                      <p className="text-sm text-muted-foreground">Sunshine Enterprises paid $45,000 invoice</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 border-l-4 border-l-primary bg-card rounded-r-lg">
                    <div className="text-xs text-muted-foreground min-w-[100px]">1 day ago</div>
                    <div className="flex-1">
                      <p className="font-medium">New Client Added</p>
                      <p className="text-sm text-muted-foreground">Quantum Solutions onboarded with initial risk score of 45</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trend Analysis</CardTitle>
                <CardDescription>Monthly risk and payment patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Historical trend charts will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">System Information</h2>
              <p className="text-muted-foreground">Learn about RiskGuard AI features and capabilities</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>About RiskGuard AI</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    RiskGuard AI is an advanced credit risk assessment platform that combines traditional financial metrics with AI-powered sentiment analysis to provide comprehensive insights into accounts receivable.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Key Features:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Real-time risk scoring and monitoring</li>
                      <li>AI-powered sentiment analysis</li>
                      <li>Predictive payment behavior modeling</li>
                      <li>Automated alerts and notifications</li>
                      <li>Comprehensive reporting and analytics</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How to Use</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
                      <div>
                        <p className="font-medium text-sm">Import Your Data</p>
                        <p className="text-xs text-muted-foreground">Upload CSV files or connect live data sources</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
                      <div>
                        <p className="font-medium text-sm">Review Dashboard</p>
                        <p className="text-xs text-muted-foreground">Monitor key metrics and risk indicators</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</div>
                      <div>
                        <p className="font-medium text-sm">Filter & Analyze</p>
                        <p className="text-xs text-muted-foreground">Use advanced filters to segment your portfolio</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</div>
                      <div>
                        <p className="font-medium text-sm">Take Action</p>
                        <p className="text-xs text-muted-foreground">Respond to alerts and export reports</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <p className="font-semibold text-sm text-destructive">High Risk (75-100)</p>
                    <p className="text-xs text-muted-foreground mt-1">Immediate attention required. High probability of payment delays or defaults.</p>
                  </div>
                  <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
                    <p className="font-semibold text-sm text-warning">Medium Risk (50-74)</p>
                    <p className="text-xs text-muted-foreground mt-1">Monitor closely. May require proactive communication.</p>
                  </div>
                  <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
                    <p className="font-semibold text-sm text-success">Low Risk (0-49)</p>
                    <p className="text-xs text-muted-foreground mt-1">Healthy accounts with reliable payment history.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Our support team is here to help you make the most of RiskGuard AI.
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Info className="h-4 w-4 mr-2" />
                      Documentation
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
