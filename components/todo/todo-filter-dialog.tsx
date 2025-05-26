"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterState {
  showCompleted: boolean;
  priority: string | null;
  searchTerm: string;
}

interface TodoFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFilters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
}

export function TodoFilterDialog({
  open,
  onOpenChange,
  initialFilters,
  onApplyFilters,
}: TodoFilterDialogProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const handleReset = () => {
    const resetFilters = {
      showCompleted: true,
      priority: null,
      searchTerm: "",
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  const handleApply = () => {
    onApplyFilters(filters);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Filter Tasks</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search by title or description"
              value={filters.searchTerm}
              onChange={(e) =>
                setFilters({ ...filters, searchTerm: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={filters.priority || ""}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  priority: value === "" ? null : value,
                })
              }
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="completed" className="cursor-pointer">
              Show completed tasks
            </Label>
            <Switch
              id="completed"
              checked={filters.showCompleted}
              onCheckedChange={(checked) =>
                setFilters({ ...filters, showCompleted: checked })
              }
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}