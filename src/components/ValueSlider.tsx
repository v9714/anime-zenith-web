import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ValueSliderProps {
    title: string;
    min?: number;
    max?: number;
    step?: number;
    defaultValue?: number;
    className?: string;
    unit?: string;
}

export const ValueSlider = ({
    title,
    min = 0,
    max = 100,
    step = 1,
    defaultValue = 50,
    className,
    unit = ""
}: ValueSliderProps) => {
    const [value, setValue] = useState([defaultValue]);

    return (
        <div className={cn("w-full space-y-4", className)}>
            <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">{title}</h3>
                <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl font-bold text-primary">{value[0]}</span>
                    {unit && <span className="text-sm sm:text-base text-muted-foreground">{unit}</span>}
                </div>
            </div>
            <Slider
                value={value}
                onValueChange={setValue}
                min={min}
                max={max}
                step={step}
                className="w-full"
            />
            <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                <span>{min}{unit}</span>
                <span>{max}{unit}</span>
            </div>
        </div>
    );
};
