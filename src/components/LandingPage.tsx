import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LayoutDashboard, BarChart3, Shield, TrendingUp, Users } from "lucide-react";
import { ClientData } from "@/utils/csvParser";
import DataConnection from "@/components/DataConnection";
import DashboardModules from "@/components/DashboardModules";
import ThemeToggle from "@/components/ThemeToggle";
import CSVFormatDialog from "@/components/CSVFormatDialog";

interface LandingPageProps {
  onDataLoaded: (data: ClientData[]) => void;
  onRiskCategoryClick?: (category: string, clients: ClientData[]) => void;
  onAlertClick?: (client: ClientData) => void;
  sampleData?: ClientData[];
}

const LandingPage = ({ onDataLoaded, onRiskCategoryClick, onAlertClick, sampleData = [] }: LandingPageProps) => {
  const [csvFormatOpen, setCsvFormatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-end p-4 gap-3">
          <ThemeToggle />
          {sampleData.length > 0 && (
            <Sheet>
              <SheetTrigger asChild>
                <Button size="sm" className="shadow-lg">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Explore Modules
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
                    clientData={sampleData}
                    onRiskCategoryClick={onRiskCategoryClick || (() => {})}
                    onAlertClick={onAlertClick || (() => {})}
                  />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-4xl space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="h-14 w-14 rounded-xl bg-gradient-orange flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-4xl font-semibold text-foreground">
                  Credit Risk Insights
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-normal">
                AI-powered credit risk assessment and accounts receivable analytics
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
                <Shield className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs font-medium text-foreground">Risk Analysis</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
                <TrendingUp className="h-6 w-6 text-success mb-2" />
                <span className="text-xs font-medium text-foreground">Trend Insights</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
                <Users className="h-6 w-6 text-accent mb-2" />
                <span className="text-xs font-medium text-foreground">Client Monitoring</span>
              </div>
            </div>

            {/* Unified Data Connection */}
            <Card className="border-2 hover:border-primary/50 transition-colors shadow-xl bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Connect Your Data Source</CardTitle>
                <CardDescription>
                  Choose from multiple data sources to begin your analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataConnection 
                  onDataLoaded={onDataLoaded} 
                  onShowCSVFormat={() => setCsvFormatOpen(true)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CSV Format Dialog */}
      <CSVFormatDialog open={csvFormatOpen} onOpenChange={setCsvFormatOpen} />
    </div>
  );
};

export default LandingPage;
