import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface CircularProgressProps {
    watchedCount: number;
    totalEpisodes: number;
    size?: number;
    strokeWidth?: number;
}

export function CircularProgress({
    watchedCount,
    totalEpisodes,
    size = 80,
    strokeWidth = 6
}: CircularProgressProps) {
    const percentage = totalEpisodes > 0 ? (watchedCount / totalEpisodes) * 100 : 0;
    const isComplete = watchedCount === totalEpisodes && totalEpisodes > 0;

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            {/* SVG Circular Progress */}
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    className="fill-none stroke-muted"
                    strokeWidth={strokeWidth}
                />

                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    className={`fill-none transition-all duration-500 ${isComplete
                        ? 'stroke-green-500 dark:stroke-green-400'
                        : 'stroke-primary'
                        }`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {isComplete ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500 dark:text-green-400" />
                ) : (
                    <>
                        <span className="text-lg font-bold text-foreground">
                            {watchedCount}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            / {totalEpisodes}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}
