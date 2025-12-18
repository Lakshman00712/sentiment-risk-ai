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
    "InvoiceDate",
    "DueDate",
    "PaymentDate",
    "AvgOrders60Days",
    "RemindersCount",
    "CreditLimit",
    "CreditUsed",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Required CSV Format</DialogTitle>
          <DialogDescription>
            Your CSV file should include these 12 columns:
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {columns.map((column, index) => (
              <div key={column} className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                <div className="h-5 w-5 rounded-full bg-orange/20 text-orange flex items-center justify-center text-xs font-semibold shrink-0">
                  {index + 1}
                </div>
                <span className="font-mono text-sm">{column}</span>
              </div>
            ))}
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Tip:</strong> Dates should be in YYYY-MM-DD format. Leave PaymentDate empty for unpaid invoices.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CSVFormatDialog;
