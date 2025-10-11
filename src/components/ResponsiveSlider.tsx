import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SliderItem {
    id: number;
    title: string;
    description: string;
    image: string;
    color: string;
}

interface ResponsiveSliderProps {
    items: SliderItem[];
    className?: string;
}

export const ResponsiveSlider = ({ items, className }: ResponsiveSliderProps) => {
    return (
        <div className={cn("w-full px-4 sm:px-8 lg:px-12", className)}>
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-2 sm:-ml-4">
                    {items.map((item) => (
                        <CarouselItem key={item.id} className="pl-2 sm:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 overflow-hidden group">
                                <CardContent className="p-0">
                                    <div
                                        className={cn(
                                            "w-full h-48 sm:h-56 lg:h-64 relative overflow-hidden",
                                            item.color
                                        )}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40 group-hover:from-black/10 group-hover:to-black/30 transition-all duration-300" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white/90">{item.id}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 sm:p-6">
                                        <h3 className="text-lg sm:text-xl font-bold mb-2 text-foreground">{item.title}</h3>
                                        <p className="text-sm sm:text-base text-muted-foreground line-clamp-2">{item.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <div className="hidden sm:block">
                    <CarouselPrevious className="left-0 -translate-x-1/2" />
                    <CarouselNext className="right-0 translate-x-1/2" />
                </div>
            </Carousel>
        </div>
    );
};
