import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, Search, CalendarIcon, X, Download } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface FilterOptions {
  search: string;
  riskCategory: string;
  daysPastDueMin: number;
  daysPastDueMax: number;
  creditUtilizationMin: number;
  creditUtilizationMax: number;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onExport: () => void;
  totalRecords: number;
  filteredRecords: number;
}

const AdvancedFilters = ({ filters, onFiltersChange, onExport, totalRecords, filteredRecords }: AdvancedFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleReset = () => {
    onFiltersChange({
      search: "",
      riskCategory: "all",
      daysPastDueMin: 0,
      daysPastDueMax: 180,
      creditUtilizationMin: 0,
      creditUtilizationMax: 100,
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  const hasActiveFilters = 
    filters.search !== "" ||
    filters.riskCategory !== "all" ||
    filters.daysPastDueMin !== 0 ||
    filters.daysPastDueMax !== 180 ||
    filters.creditUtilizationMin !== 0 ||
    filters.creditUtilizationMax !== 100 ||
    filters.dateFrom !== undefined ||
    filters.dateTo !== undefined;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Filters & Search</CardTitle>
              <CardDescription>
                {filteredRecords} of {totalRecords} records
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Hide" : "Show"} Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search - Always Visible */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            {/* Risk Category */}
            <div className="space-y-2">
              <Label>Risk Category</Label>
              <Select
                value={filters.riskCategory}
                onValueChange={(value) => onFiltersChange({ ...filters, riskCategory: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Low">Low Risk</SelectItem>
                  <SelectItem value="Medium">Medium Risk</SelectItem>
                  <SelectItem value="High">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Days Past Due Range */}
            <div className="space-y-2">
              <Label>Days Past Due Range</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.daysPastDueMin}
                  onChange={(e) => onFiltersChange({ ...filters, daysPastDueMin: parseInt(e.target.value) || 0 })}
                  min="0"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.daysPastDueMax}
                  onChange={(e) => onFiltersChange({ ...filters, daysPastDueMax: parseInt(e.target.value) || 180 })}
                  min="0"
                />
              </div>
            </div>

            {/* Credit Utilization Range */}
            <div className="space-y-2">
              <Label>Credit Utilization (%)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.creditUtilizationMin}
                  onChange={(e) => onFiltersChange({ ...filters, creditUtilizationMin: parseInt(e.target.value) || 0 })}
                  min="0"
                  max="100"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.creditUtilizationMax}
                  onChange={(e) => onFiltersChange({ ...filters, creditUtilizationMax: parseInt(e.target.value) || 100 })}
                  min="0"
                  max="100"
                />
              </div>
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <Label>Due Date From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? format(filters.dateFrom, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => onFiltersChange({ ...filters, dateFrom: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label>Due Date To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? format(filters.dateTo, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => onFiltersChange({ ...filters, dateTo: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!hasActiveFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedFilters;
