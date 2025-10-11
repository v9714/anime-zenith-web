import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SlideContent {
    id: number;
    title: string;
    subtitle: string;
    gradient: string;
}

interface FullWidthSliderProps {
    slides: SlideContent[];
    className?: string;
}

export const FullWidthSlider = ({ slides, className }: FullWidthSliderProps) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    return (
        <div className={cn("w-full relative", className)}>
            <Carousel
                opts={{
                    align: "center",
                    loop: true,
                }}
                className="w-full"
                setApi={(api) => {
                    api?.on("select", () => {
                        setCurrentSlide(api.selectedScrollSnap());
                    });
                }}
            >
                <CarouselContent>
                    {slides.map((slide) => (
                        <CarouselItem key={slide.id}>
                            <div
                                className={cn(
                                    "w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] flex items-center justify-center relative overflow-hidden rounded-2xl",
                                    slide.gradient
                                )}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                                <div className="relative z-10 text-center px-4 sm:px-8 max-w-4xl mx-auto">
                                    <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        {slide.title}
                                    </h2>
                                    <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
                                        {slide.subtitle}
                                    </p>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-4 sm:left-8 h-10 w-10 sm:h-12 sm:w-12 bg-background/80 backdrop-blur-sm hover:bg-background border-border" />
                <CarouselNext className="right-4 sm:right-8 h-10 w-10 sm:h-12 sm:w-12 bg-background/80 backdrop-blur-sm hover:bg-background border-border" />
            </Carousel>

            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mt-4 sm:mt-6">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            currentSlide === index ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};
