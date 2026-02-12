import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ExpiryType = "time" | "views";

interface ExpirySelectorProps {
  expiryType: ExpiryType;
  onExpiryTypeChange: (type: ExpiryType) => void;
  expiresAt?: Date;
  onExpiresAtChange: (date: Date | undefined) => void;
  maxViews?: number;
  onMaxViewsChange: (views: number | undefined) => void;
}

export function ExpirySelector({
  expiryType,
  onExpiryTypeChange,
  expiresAt,
  onExpiresAtChange,
  maxViews,
  onMaxViewsChange,
}: ExpirySelectorProps) {
  const options = [
    { value: "time" as ExpiryType, label: "Expire after time", icon: Clock },
    { value: "views" as ExpiryType, label: "Expire after views", icon: Eye },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = expiryType === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onExpiryTypeChange(option.value);
              }}
              className={cn(
                "group flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                  : "border-border hover:border-primary/30 hover:bg-secondary/30"
              )}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
                  isSelected 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground group-hover:bg-secondary"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      {expiryType === "time" && (
        <div className="animate-fade-in p-3 rounded-xl bg-secondary/30 border border-border/50">
          <p className="text-xs text-muted-foreground mb-2">When should this wish expire?</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-11",
                  !expiresAt && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                {expiresAt ? format(expiresAt, "PPP") : "Pick an expiry date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={expiresAt}
                onSelect={onExpiresAtChange}
                disabled={(date) => date < new Date()}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {expiryType === "views" && (
        <div className="animate-fade-in p-3 rounded-xl bg-secondary/30 border border-border/50">
          <p className="text-xs text-muted-foreground mb-2">How many times can this be viewed?</p>
          <Select
            value={maxViews?.toString() || ""}
            onValueChange={(val) => onMaxViewsChange(parseInt(val))}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select max views" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 view (one-time)</SelectItem>
              <SelectItem value="2">2 views</SelectItem>
              <SelectItem value="5">5 views</SelectItem>
              <SelectItem value="10">10 views</SelectItem>
              <SelectItem value="25">25 views</SelectItem>
              <SelectItem value="50">50 views</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
