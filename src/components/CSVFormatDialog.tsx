import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CSVFormatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CSVFormatDialog = ({ open, onOpenChange }: CSVFormatDialogProps) => {
  const columns = [
    { name: "CustomerID", description: "Unique customer identifier" },
    { name: "Name", description: "Customer/company name" },
    { name: "Email", description: "Contact email address" },
    { name: "PhoneNumber", description: "Contact phone number" },
    { name: "InvoiceAmount", description: "Outstanding invoice amount" },
    { name: "InvoiceDate", description: "Date of invoice (YYYY-MM-DD)" },
    { name: "DueDate", description: "Payment due date (YYYY-MM-DD)" },
    { name: "PaymentDate", description: "Actual payment date (empty if unpaid)" },
    { name: "AvgOrders60Days", description: "Average orders in last 60 days" },
    { name: "RemindersCount", description: "Number of payment reminders sent" },
    { name: "CreditLimit", description: "Customer's credit limit" },
    { name: "CreditUsed", description: "Current credit utilized" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Required CSV Format</DialogTitle>
          <DialogDescription>
            Your CSV file should include the following 11 columns for accurate risk analysis
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {columns.map((column, index) => (
              <div key={column.name} className="flex items-start gap-3 text-sm p-2 rounded bg-muted/30">
                <div className="h-5 w-5 rounded-full bg-orange/20 text-orange flex items-center justify-center text-xs font-medium shrink-0">
                  {index + 1}
                </div>
                <div>
                  <span className="font-mono text-xs font-medium">{column.name}</span>
                  <p className="text-xs text-muted-foreground">{column.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <p className="text-xs text-muted-foreground">
              <strong>Calculated Fields:</strong> The system will automatically calculate DaysPastDue, CreditUtilization, RiskScore, RiskCategory, and RiskRationale.
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Tip:</strong> Ensure dates are in YYYY-MM-DD format. Leave PaymentDate empty for unpaid invoices.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CSVFormatDialog;
