import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertCircle, LayoutDashboard, BarChart3 } from "lucide-react";
import { ClientData } from "@/utils/csvParser";
import DataConnection from "@/components/DataConnection";
import DashboardModules from "@/components/DashboardModules";

interface LandingPageProps {
  onDataLoaded: (data: ClientData[]) => void;
  onRiskCategoryClick?: (category: string, clients: ClientData[]) => void;
  onAlertClick?: (client: ClientData) => void;
  sampleData?: ClientData[];
}

const LandingPage = ({ onDataLoaded, onRiskCategoryClick, onAlertClick, sampleData = [] }: LandingPageProps) => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-orange/5 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header with Modules Button */}
        <div className="flex items-center justify-between">
          <div className="flex-1" />
          <div className="text-center space-y-4 flex-1">
            <div className="flex items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-orange flex items-center justify-center shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-orange bg-clip-text text-transparent">
                Credit Risk Insights
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AI-powered credit risk assessment and accounts receivable analytics
            </p>
          </div>
          <div className="flex-1 flex justify-end">
            {sampleData.length > 0 && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="lg" className="shadow-lg">
                    <LayoutDashboard className="h-5 w-5 mr-2" />
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
        </div>

        {/* Unified Data Connection */}
        <Card className="border-2 hover:border-orange transition-colors shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Connect Your Data Source</CardTitle>
            <CardDescription>
              Choose from multiple data sources to begin your analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataConnection onDataLoaded={onDataLoaded} />
          </CardContent>
        </Card>

        {/* File Format Instructions */}
        <Card className="bg-muted/50 border-orange/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange" />
              <CardTitle className="text-sm">Required CSV Format</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Your CSV file should include the following columns:
            </p>
            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange" />
                <span>CustomerID</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange" />
                <span>Name</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange" />
                <span>Email</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange" />
                <span>PhoneNumber</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange" />
                <span>InvoiceAmount</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange" />
                <span>PaymentHistory</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange" />
                <span>LastPaymentDate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange" />
                <span>SentimentScore</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange" />
                <span>BehaviorScore</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange" />
                <span>RiskCategory</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LandingPage;
