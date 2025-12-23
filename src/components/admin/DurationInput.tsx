import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DurationInputProps {
  value: number; // Total minutes
  onChange: (minutes: number) => void;
  label?: string;
  required?: boolean;
}

export function DurationInput({ value, onChange, label = "Duration", required = false }: DurationInputProps) {
  // Convert total minutes to hours, minutes, seconds
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  // Initialize from value (total minutes)
  useEffect(() => {
    const totalSeconds = Math.round(value * 60);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    setHours(h);
    setMinutes(m);
    setSeconds(s);
  }, []);

  // Update parent when any field changes
  const updateDuration = (h: number, m: number, s: number) => {
    const totalMinutes = h * 60 + m + s / 60;
    onChange(Math.round(totalMinutes * 100) / 100); // Round to 2 decimal places
  };

  const handleHoursChange = (val: string) => {
    const h = Math.max(0, parseInt(val) || 0);
    setHours(h);
    updateDuration(h, minutes, seconds);
  };

  const handleMinutesChange = (val: string) => {
    const m = Math.max(0, Math.min(59, parseInt(val) || 0));
    setMinutes(m);
    updateDuration(hours, m, seconds);
  };

  const handleSecondsChange = (val: string) => {
    const s = Math.max(0, Math.min(59, parseInt(val) || 0));
    setSeconds(s);
    updateDuration(hours, minutes, s);
  };

  // Format display of total duration
  const formatTotal = () => {
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(" ");
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      
      <div className="flex flex-wrap items-center gap-2">
        {/* Hours */}
        <div className="flex flex-col items-center min-w-[50px]">
          <Input
            type="number"
            min={0}
            max={99}
            value={hours}
            onChange={(e) => handleHoursChange(e.target.value)}
            className="w-14 text-center text-sm"
            placeholder="0"
          />
          <span className="text-xs text-muted-foreground mt-1">Hrs</span>
        </div>

        <span className="text-lg font-bold text-muted-foreground pb-5">:</span>

        {/* Minutes */}
        <div className="flex flex-col items-center min-w-[50px]">
          <Input
            type="number"
            min={0}
            max={59}
            value={minutes}
            onChange={(e) => handleMinutesChange(e.target.value)}
            className="w-14 text-center text-sm"
            placeholder="0"
          />
          <span className="text-xs text-muted-foreground mt-1">Min</span>
        </div>

        <span className="text-lg font-bold text-muted-foreground pb-5">:</span>

        {/* Seconds */}
        <div className="flex flex-col items-center min-w-[50px]">
          <Input
            type="number"
            min={0}
            max={59}
            value={seconds}
            onChange={(e) => handleSecondsChange(e.target.value)}
            className="w-14 text-center text-sm"
            placeholder="0"
          />
          <span className="text-xs text-muted-foreground mt-1">Sec</span>
        </div>

        {/* Total display */}
        <div className="px-2 py-1.5 bg-muted rounded-md">
          <span className="text-xs font-medium">{formatTotal()}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Enter duration in hours, minutes, and seconds format
      </p>
    </div>
  );
}
