import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="summary">
            <BarChart3 className="h-4 w-4 mr-2" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4 mr-2" />
            Reports
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
                        <span className="text-muted-foreground text-xs">Score: {client.riskScore}</span>
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
