import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { ClientData } from "@/utils/csvParser";
import { useToast } from "@/hooks/use-toast";

interface DashboardModulesProps {
  clientData: ClientData[];
  onRiskCategoryClick: (category: string, clients: ClientData[]) => void;
  onAlertClick: (client: ClientData) => void;
}

const DashboardModules = ({ clientData, onRiskCategoryClick, onAlertClick }: DashboardModulesProps) => {
  const [timeRange, setTimeRange] = useState("30d");
  const [riskViewMode, setRiskViewMode] = useState<"clients" | "value">("clients");
  const [alertsLimit, setAlertsLimit] = useState(5);
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

      if (filters.paymentHistory !== "all" && client.paymentHistory !== filters.paymentHistory) {
        return false;
      }

      if (filters.riskCategory !== "all" && client.riskCategory !== filters.riskCategory) {
        return false;
      }

      if (client.sentimentScore < filters.sentimentMin || client.sentimentScore > filters.sentimentMax) {
        return false;
      }

      if (filters.dateFrom || filters.dateTo) {
        const paymentDate = new Date(client.lastPaymentDate);
        if (filters.dateFrom && paymentDate < filters.dateFrom) return false;
        if (filters.dateTo && paymentDate > filters.dateTo) return false;
      }

      return true;
    });
  }, [clientData, filters]);

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

  const handleDataImported = (data: ClientData[]) => {
    // This would update parent state in real implementation
    toast({
      title: "Data Updated",
      description: `${data.length} records imported`,
    });
  };

  return (
    <Tabs defaultValue="summary" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
        <TabsTrigger value="summary">
          <BarChart3 className="h-4 w-4 mr-2" />
          Summary
        </TabsTrigger>
        <TabsTrigger value="sentiment">
          <Brain className="h-4 w-4 mr-2" />
          Sentiment
        </TabsTrigger>
        <TabsTrigger value="data">
          <Database className="h-4 w-4 mr-2" />
          Data
        </TabsTrigger>
        <TabsTrigger value="reports">
          <FileText className="h-4 w-4 mr-2" />
          Reports
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
            value={`$${(parseFloat(metrics.totalAR) / 1000).toFixed(1)}K`}
            change={8.2}
            trend="up"
            icon={DollarSign}
            description="Outstanding receivables"
          />
          <MetricsCard
            title="High Risk"
            value={metrics.highRiskCount.toString()}
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
              clientData={filteredData}
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
              {filteredData
                .filter(client => client.riskCategory === "High" || client.sentimentScore < 0)
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

      {/* AI Sentiment Tab */}
      <TabsContent value="sentiment" className="space-y-6">
        <h3 className="text-lg font-semibold">AI Sentiment Analysis</h3>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sentiment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <SentimentAnalysis />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Data Connections Tab */}
      <TabsContent value="data" className="space-y-6">
        <h3 className="text-lg font-semibold">Data Connections</h3>
        <DataImport onDataImported={handleDataImported} />
        <LiveDataDialog onDataFetched={handleDataImported} />
      </TabsContent>

      {/* Reports Tab */}
      <TabsContent value="reports" className="space-y-6">
        <h3 className="text-lg font-semibold">Reports & Filters</h3>
        <AdvancedFilters
          filters={filters}
          onFiltersChange={setFilters}
          onExport={handleExport}
          totalRecords={clientData.length}
          filteredRecords={filteredData.length}
        />
        <ClientsList filter="all" clientData={filteredData} />
      </TabsContent>

      {/* History Tab */}
      <TabsContent value="history" className="space-y-6">
        <h3 className="text-lg font-semibold">Historical Analysis</h3>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Historical tracking coming soon</p>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Info Tab */}
      <TabsContent value="info" className="space-y-6">
        <h3 className="text-lg font-semibold">System Information</h3>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About This Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>Records Loaded:</strong> {clientData.length}</p>
            <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default DashboardModules;
