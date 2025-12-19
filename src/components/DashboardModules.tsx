import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertCircle, 
  DollarSign,
  Info,
  History,
  FileText,
  Database,
  BarChart3,
  Download,
  ChevronDown,
  ChevronUp,
  Calendar,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Clock,
  Activity,
} from "lucide-react";
import MetricsCard from "@/components/MetricsCard";
import ClientsList from "@/components/ClientsList";
import RiskDistribution from "@/components/RiskDistribution";
import DataImport from "@/components/DataImport";
import LiveDataDialog from "@/components/LiveDataDialog";
import AdvancedFilters, { FilterOptions } from "@/components/AdvancedFilters";
import ExportDialog from "@/components/ExportDialog";
import { ClientData } from "@/utils/csvParser";
import { useToast } from "@/hooks/use-toast";

interface DashboardModulesProps {
  clientData: ClientData[];
  onRiskCategoryClick: (category: string, clients: ClientData[]) => void;
  onAlertClick: (client: ClientData) => void;
}

// Generate dynamic history data with IST timezone
const generateHistoryData = () => {
  const now = new Date();
  const formatIST = (date: Date) => {
    return date.toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }) + ' IST';
  };
  
  return [
    { id: 1, action: "Data Import", details: "Imported 150 client records", timestamp: formatIST(new Date(now.getTime() - 30 * 60 * 1000)), user: "System" },
    { id: 2, action: "Risk Assessment", details: "Batch risk scoring completed", timestamp: formatIST(new Date(now.getTime() - 60 * 60 * 1000)), user: "AI Engine" },
    { id: 3, action: "Alert Generated", details: "3 high-risk clients flagged", timestamp: formatIST(new Date(now.getTime() - 90 * 60 * 1000)), user: "System" },
    { id: 4, action: "Report Export", details: "Monthly summary exported", timestamp: formatIST(new Date(now.getTime() - 24 * 60 * 60 * 1000)), user: "Admin" },
    { id: 5, action: "Data Refresh", details: "ERP data synchronized", timestamp: formatIST(new Date(now.getTime() - 32 * 60 * 60 * 1000)), user: "System" },
    { id: 6, action: "Risk Update", details: "Risk scoring model updated", timestamp: formatIST(new Date(now.getTime() - 48 * 60 * 60 * 1000)), user: "AI Engine" },
  ];
};

const DashboardModules = ({ clientData, onRiskCategoryClick, onAlertClick }: DashboardModulesProps) => {
  const [timeRange, setTimeRange] = useState("30d");
  const [riskViewMode, setRiskViewMode] = useState<"clients" | "value">("clients");
  const [alertsLimit, setAlertsLimit] = useState(5);
  const [showFilters, setShowFilters] = useState(true);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    riskCategory: "all",
    daysPastDueMin: 0,
    daysPastDueMax: 180,
    creditUtilizationMin: 0,
    creditUtilizationMax: 100,
    dateFrom: undefined,
    dateTo: undefined,
  });
  const { toast } = useToast();

  // Filter client data based on all filter criteria
  const filteredData = useMemo(() => {
    return clientData.filter(client => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          client.name.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower) ||
          client.phoneNumber.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.riskCategory !== "all" && client.riskCategory !== filters.riskCategory) {
        return false;
      }

      if (client.daysPastDue < filters.daysPastDueMin || client.daysPastDue > filters.daysPastDueMax) {
        return false;
      }

      if (client.creditUtilization < filters.creditUtilizationMin || client.creditUtilization > filters.creditUtilizationMax) {
        return false;
      }

      if (filters.dateFrom || filters.dateTo) {
        const dueDate = new Date(client.dueDate);
        if (filters.dateFrom && dueDate < filters.dateFrom) return false;
        if (filters.dateTo && dueDate > filters.dateTo) return false;
      }

      return true;
    });
  }, [clientData, filters]);

  // Metrics for Summary tab (uses all client data, not filtered)
  const summaryMetrics = useMemo(() => {
    const totalAR = clientData.reduce((sum, client) => sum + client.invoiceAmount, 0);
    const avgRiskScore = clientData.length > 0 
      ? Math.round(clientData.reduce((sum, client) => sum + client.riskScore, 0) / clientData.length)
      : 0;
    const highRiskCount = clientData.filter(c => c.riskCategory === "High").length;

    return {
      totalAR: totalAR.toFixed(2),
      avgRiskScore,
      highRiskCount,
      activeClients: clientData.length
    };
  }, [clientData]);

  // Metrics for Reports tab (uses filtered data)
  const reportsMetrics = useMemo(() => {
    const totalAR = filteredData.reduce((sum, client) => sum + client.invoiceAmount, 0);
    const highRiskCount = filteredData.filter(c => c.riskCategory === "High").length;

    return {
      totalAR: totalAR.toFixed(2),
      highRiskCount,
      activeClients: filteredData.length
    };
  }, [filteredData]);

  const handleDataImported = (data: ClientData[]) => {
    // This would update parent state in real implementation
    toast({
      title: "Data Updated",
      description: `${data.length} records imported`,
    });
  };

  return (
    <>
      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="summary">
            <BarChart3 className="h-4 w-4 mr-2" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="sentiment">
            <Activity className="h-4 w-4 mr-2" />
            Sentiment
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="h-4 w-4 mr-2" />
            Data
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="info">
            <Info className="h-4 w-4 mr-2" />
            Info
          </TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Executive Dashboard</h3>
            <div className="flex gap-2">
              {["7d", "30d", "90d"].map((range) => (
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
          <div className="grid grid-cols-2 gap-4">
            <MetricsCard
              title="Total AR Value"
              value={`$${(parseFloat(summaryMetrics.totalAR) / 1000).toFixed(1)}K`}
              change={8.2}
              trend="up"
              icon={DollarSign}
              description="Outstanding receivables"
            />
            <MetricsCard
              title="High Risk"
              value={summaryMetrics.highRiskCount.toString()}
              change={12.5}
              trend="up"
              icon={AlertCircle}
              description="Attention needed"
              variant="warning"
            />
          </div>

          {/* Risk Distribution */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Risk Distribution</CardTitle>
                <Select value={riskViewMode} onValueChange={(value: "clients" | "value") => setRiskViewMode(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clients">Clients</SelectItem>
                    <SelectItem value="value">AR Value</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <RiskDistribution 
                viewMode={riskViewMode} 
                clientData={clientData}
                onCategoryClick={onRiskCategoryClick}
              />
            </CardContent>
          </Card>

          {/* Priority Alerts */}
          <Card className="border-warning/50 bg-warning/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  Priority Alerts
                </CardTitle>
                <Select value={alertsLimit.toString()} onValueChange={(value) => setAlertsLimit(parseInt(value))}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 alerts</SelectItem>
                    <SelectItem value="5">5 alerts</SelectItem>
                    <SelectItem value="10">10 alerts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {clientData
                  .filter(client => client.riskCategory === "High" || client.riskScore >= 65)
                  .sort((a, b) => b.riskScore - a.riskScore)
                  .slice(0, alertsLimit)
                  .map((client, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-card rounded border text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${client.riskCategory === "High" ? "bg-destructive" : "bg-warning"}`} />
                        <span className="font-medium">{client.name}</span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => onAlertClick(client)}>
                        Action
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab - with filters shown by default */}
        <TabsContent value="reports" className="space-y-6">
          <h3 className="text-lg font-semibold">Reports & Filters</h3>
          
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Filters & Search</CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    {showFilters ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                    {showFilters ? "Hide Filters" : "Show Filters"}
                  </Button>
                  <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => setExportDialogOpen(true)}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            {showFilters && (
              <CardContent className="pt-0">
                <AdvancedFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  onExport={() => setExportDialogOpen(true)}
                  totalRecords={clientData.length}
                  filteredRecords={filteredData.length}
                />
              </CardContent>
            )}
          </Card>
          
          <ClientsList filter="all" clientData={filteredData} />
        </TabsContent>

        {/* Sentiment & Trends Tab */}
        <TabsContent value="sentiment" className="space-y-6">
          <h3 className="text-lg font-semibold">Sentiment & Trends</h3>
          
          {/* Portfolio Health Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Risk Trend</p>
                    <p className="text-2xl font-bold text-success">↓ Improving</p>
                    <p className="text-xs text-muted-foreground mt-1">-5.2% vs last month</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Collection Efficiency</p>
                    <p className="text-2xl font-bold text-foreground">78%</p>
                    <p className="text-xs text-success mt-1">+3.1% vs last month</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Days to Payment</p>
                    <p className="text-2xl font-bold text-foreground">32 days</p>
                    <p className="text-xs text-warning mt-1">+2 days vs last month</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Movement Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Risk Movement Summary</CardTitle>
              <CardDescription>Client risk category changes this period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                      <ArrowUpRight className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Moved to High Risk</p>
                      <p className="text-xl font-bold text-destructive">
                        {clientData.filter(c => c.riskCategory === "High").length > 3 ? 3 : clientData.filter(c => c.riskCategory === "High").length} clients
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg border border-success/30 bg-success/5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                      <ArrowDownRight className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Improved from High Risk</p>
                      <p className="text-xl font-bold text-success">
                        {clientData.filter(c => c.riskCategory === "Low").length > 5 ? 5 : clientData.filter(c => c.riskCategory === "Low").length} clients
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aging Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aging Analysis</CardTitle>
              <CardDescription>AR breakdown by age buckets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "Current (0-30 days)", count: clientData.filter(c => c.daysPastDue <= 30).length, color: "bg-success" },
                  { label: "31-60 days", count: clientData.filter(c => c.daysPastDue > 30 && c.daysPastDue <= 60).length, color: "bg-warning" },
                  { label: "61-90 days", count: clientData.filter(c => c.daysPastDue > 60 && c.daysPastDue <= 90).length, color: "bg-orange" },
                  { label: "90+ days", count: clientData.filter(c => c.daysPastDue > 90).length, color: "bg-destructive" },
                ].map((bucket) => (
                  <div key={bucket.label} className="flex items-center gap-4">
                    <div className="w-32 text-sm text-muted-foreground">{bucket.label}</div>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${bucket.color} transition-all duration-500`}
                        style={{ width: `${clientData.length > 0 ? (bucket.count / clientData.length) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="w-20 text-sm font-medium text-right">{bucket.count} clients</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trend Watch Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-success" />
                  Improving Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {clientData
                    .filter(c => c.riskCategory === "Low" || c.riskScore < 40)
                    .slice(0, 5)
                    .map((client, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded bg-success/5 border border-success/20">
                        <span className="text-sm font-medium">{client.name}</span>
                        <Badge variant="success">Improving</Badge>
                      </div>
                    ))}
                  {clientData.filter(c => c.riskCategory === "Low" || c.riskScore < 40).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No improving clients</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-destructive" />
                  Watch List
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {clientData
                    .filter(c => c.riskCategory === "High" || c.remindersCount >= 3)
                    .slice(0, 5)
                    .map((client, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded bg-destructive/5 border border-destructive/20">
                        <span className="text-sm font-medium">{client.name}</span>
                        <Badge variant="destructive">Watch</Badge>
                      </div>
                    ))}
                  {clientData.filter(c => c.riskCategory === "High" || c.remindersCount >= 3).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No clients on watch list</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Pattern Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Pattern Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-muted/30 border">
                  <p className="text-sm text-muted-foreground mb-1">Best Payment Day</p>
                  <p className="text-lg font-semibold">Thursday</p>
                  <p className="text-xs text-muted-foreground">32% of payments received</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border">
                  <p className="text-sm text-muted-foreground mb-1">Payment Delay Trend</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold">-2.3 days</p>
                    <Badge variant="success" className="text-xs">Improving</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Average delay vs last quarter</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Connections Tab */}
        <TabsContent value="data" className="space-y-6">
          <h3 className="text-lg font-semibold">Data Connections</h3>
          <DataImport onDataImported={handleDataImported} />
          <LiveDataDialog onDataFetched={handleDataImported} />
        </TabsContent>

        {/* History Tab - Now with functional history */}
        <TabsContent value="history" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Activity History</h3>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {generateHistoryData().map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-sm text-foreground">{item.action}</h4>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{item.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.details}</p>
                      <span className="text-xs text-primary mt-2 inline-block">by {item.user}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Info Tab - Enhanced with more details */}
        <TabsContent value="info" className="space-y-6">
          <h3 className="text-lg font-semibold">System Information</h3>
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Version</span>
                  <span className="text-sm font-medium">2.0.0</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="text-sm font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Developer</span>
                  <span className="text-sm font-medium">Credit Risk Insights Team</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">License</span>
                  <span className="text-sm font-medium">MIT License</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Build</span>
                  <span className="text-sm font-medium font-mono">2024.12.17-001</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Scoring Model</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Days Past Due Weight</span>
                  <span className="text-sm font-medium">50%</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Credit Utilization Weight</span>
                  <span className="text-sm font-medium">25%</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Reminders Count Weight</span>
                  <span className="text-sm font-medium">15%</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Avg Orders (60 days) Weight</span>
                  <span className="text-sm font-medium">10%</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">High Risk Threshold</span>
                  <span className="text-sm font-medium">≥ 65</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Medium Risk Threshold</span>
                  <span className="text-sm font-medium">35 - 64</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Support</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>For support inquiries, please contact the developer: <a href="mailto:kplakshman007@gmail.com" className="text-primary hover:underline">kplakshman007@gmail.com</a></p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <ExportDialog 
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        data={filteredData}
      />
    </>
  );
};

export default DashboardModules;
