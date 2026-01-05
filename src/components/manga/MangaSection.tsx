import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <section className={cn("py-8", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {icon}
              </div>
            )}
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-muted-foreground text-sm md:text-base">
              {subtitle}
            </p>
          )}
        </div>

        {viewAllLink && (
          <Button
            asChild
            variant="ghost"
            className="group text-muted-foreground hover:text-foreground"
          >
            <Link to={viewAllLink}>
              {viewAllText}
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        )}
      </div>

      {/* Content */}
      {children}
    </section>
  );
}
