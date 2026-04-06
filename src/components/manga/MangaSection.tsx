import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MangaSectionProps {
    title: string;
    subtitle?: string;
    icon?: ReactNode;
    viewAllLink?: string;
    viewAllText?: string;
    children: ReactNode;
    className?: string;
}

export function MangaSection({
    title,
    subtitle,
    icon,
    viewAllLink,
    viewAllText = 'View All',
    children,
    className,
}: MangaSectionProps) {
    return (
        <section className={cn("py-6 md:py-8", className)}>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="p-2 rounded-xl bg-manga-neon-purple/10 border border-manga-neon-purple/20">
                                {icon}
                            </div>
                        )}
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {viewAllLink && (
                    <Link
                        to={viewAllLink}
                        className="group flex items-center gap-1 text-sm text-muted-foreground hover:text-manga-neon-pink transition-colors duration-200 flex-shrink-0 ml-4"
                    >
                        {viewAllText}
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                )}
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-manga-neon-purple/40 via-manga-neon-pink/20 to-transparent mb-5" />

            {children}
        </section>
    );
}
