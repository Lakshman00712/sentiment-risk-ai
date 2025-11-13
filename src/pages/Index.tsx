import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LayoutDashboard, Database, Plus } from "lucide-react";
import LandingPage from "@/components/LandingPage";
import ChatInterface from "@/components/ChatInterface";
import RiskDetailDialog from "@/components/RiskDetailDialog";
import AlertDetailDialog from "@/components/AlertDetailDialog";
import ERPConnectionDialog from "@/components/ERPConnectionDialog";
import { ClientData, loadSampleData } from "@/utils/csvParser";
import { useToast } from "@/hooks/use-toast";

// Import all existing dashboard components
import DashboardModules from "@/components/DashboardModules";

const Index = () => {
  const [clientData, setClientData] = useState<ClientData[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [riskDetailOpen, setRiskDetailOpen] = useState(false);
  const [selectedRiskCategory, setSelectedRiskCategory] = useState<string>("");
  const [selectedRiskClients, setSelectedRiskClients] = useState<ClientData[]>([]);
  const [alertDetailOpen, setAlertDetailOpen] = useState(false);
  const [selectedAlertClient, setSelectedAlertClient] = useState<ClientData | null>(null);
  const [erpDialogOpen, setErpDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDataLoaded = (data: ClientData[]) => {
    setClientData(data);
    setShowDashboard(true);
  };

  const handleRiskCategoryClick = (category: string, clients: ClientData[]) => {
    setSelectedRiskCategory(category);
    setSelectedRiskClients(clients);
    setRiskDetailOpen(true);
  };

  const handleAlertClick = (client: ClientData) => {
    setSelectedAlertClient(client);
    setAlertDetailOpen(true);
  };

  // If no data is loaded, show landing page
  if (!showDashboard || clientData.length === 0) {
    return <LandingPage onDataLoaded={handleDataLoaded} />;
  }

  // Main application interface
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-orange flex items-center justify-center">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-orange bg-clip-text text-transparent">
                  Credit Risk Insights
                </h1>
                <p className="text-xs text-muted-foreground">
                  {clientData.length} clients loaded • AI-powered analytics
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setErpDialogOpen(true)}
              >
                <Database className="h-4 w-4 mr-2" />
                Connect ERP
              </Button>
              
              {/* Modules Access */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="sm">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    View Modules
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Analysis Modules</SheetTitle>
                    <SheetDescription>
                      Explore detailed analytics, reports, and insights
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <DashboardModules 
                      clientData={clientData}
                      onRiskCategoryClick={handleRiskCategoryClick}
                      onAlertClick={handleAlertClick}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <ChatInterface clientData={clientData} />

      {/* Dialogs */}
      <RiskDetailDialog
        open={riskDetailOpen}
        onOpenChange={setRiskDetailOpen}
        clients={selectedRiskClients}
        category={selectedRiskCategory}
      />
      
      <AlertDetailDialog
        open={alertDetailOpen}
        onOpenChange={setAlertDetailOpen}
        client={selectedAlertClient}
      />

      <ERPConnectionDialog
        open={erpDialogOpen}
        onOpenChange={setErpDialogOpen}
      />
    </div>
  );
};

export default Index;
