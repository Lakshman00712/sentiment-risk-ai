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
    "CustomerID",
    "Name",
    "Email",
    "PhoneNumber",
    "InvoiceAmount",
    "PaymentHistory",
    "LastPaymentDate",
    "SentimentScore",
    "BehaviorScore",
    "RiskCategory",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Required CSV Format</DialogTitle>
          <DialogDescription>
            Your CSV file should include the following columns for accurate analysis
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {columns.map((column) => (
              <div key={column} className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-orange" />
                <span className="font-mono text-xs">{column}</span>
              </div>
            ))}
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Tip:</strong> Ensure dates are in YYYY-MM-DD format and numeric fields contain valid numbers.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CSVFormatDialog;
