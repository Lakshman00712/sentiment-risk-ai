import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { ClientData } from "@/utils/csvParser";
import { useToast } from "@/hooks/use-toast";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ClientData[];
}

const allColumns = [
  { key: "id", label: "Customer ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phoneNumber", label: "Phone Number" },
  { key: "invoiceAmount", label: "Invoice Amount" },
  { key: "invoiceDate", label: "Invoice Date" },
  { key: "dueDate", label: "Due Date" },
  { key: "paymentDate", label: "Payment Date" },
  { key: "avgOrders60Days", label: "Avg Orders (60 days)" },
  { key: "remindersCount", label: "Reminders Count" },
  { key: "creditLimit", label: "Credit Limit" },
  { key: "creditUsed", label: "Credit Used" },
  { key: "daysPastDue", label: "Days Past Due" },
  { key: "creditUtilization", label: "Credit Utilization (%)" },
  { key: "riskScore", label: "Risk Score" },
  { key: "riskCategory", label: "Risk Category" },
  { key: "riskRationale", label: "Risk Rationale" },
];

const ExportDialog = ({ open, onOpenChange, data }: ExportDialogProps) => {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    allColumns.map((col) => col.key)
  );
  const { toast } = useToast();

  const toggleColumn = (key: string) => {
    setSelectedColumns((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key]
    );
  };

  const selectAll = () => {
    setSelectedColumns(allColumns.map((col) => col.key));
  };

  const deselectAll = () => {
    setSelectedColumns([]);
  };

  const handleExport = () => {
    if (selectedColumns.length === 0) {
      toast({
        title: "No columns selected",
        description: "Please select at least one column to export",
        variant: "destructive",
      });
      return;
    }

    const headers = selectedColumns.map(
      (key) => allColumns.find((col) => col.key === key)?.label || key
    );
    
    const rows = data.map((row) =>
      selectedColumns.map((key) => {
        const value = row[key as keyof ClientData];
        // Escape commas and quotes in CSV
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
    );

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `credit_risk_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${data.length} records with ${selectedColumns.length} columns`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Select the columns you want to include in your export
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll}>
              Deselect All
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
            {allColumns.map((column) => (
              <div key={column.key} className="flex items-center space-x-2">
                <Checkbox
                  id={column.key}
                  checked={selectedColumns.includes(column.key)}
                  onCheckedChange={() => toggleColumn(column.key)}
                />
                <Label htmlFor={column.key} className="text-sm cursor-pointer">
                  {column.label}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedColumns.length} of {allColumns.length} columns selected •{" "}
            {data.length} records to export
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={selectedColumns.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
