import { ResponsiveSlider } from "@/components/ResponsiveSlider";
import { FullWidthSlider } from "@/components/FullWidthSlider";
import { ValueSlider } from "@/components/ValueSlider";

const sliderItems = [
  {
    id: 1,
    title: "Modern Design",
    description: "Beautiful, responsive layouts that adapt to any screen size",
    image: "",
    color: "bg-gradient-to-br from-purple-500 to-pink-500"
  },
  {
    id: 2,
    title: "Smooth Animations",
    description: "Fluid transitions and interactions for a premium feel",
    image: "",
    color: "bg-gradient-to-br from-blue-500 to-cyan-500"
  },
  {
    id: 3,
    title: "Mobile First",
    description: "Optimized for mobile devices with touch-friendly controls",
    image: "",
    color: "bg-gradient-to-br from-green-500 to-emerald-500"
  },
  {
    id: 4,
    title: "Fast Performance",
    description: "Optimized code for lightning-fast loading times",
    image: "",
    color: "bg-gradient-to-br from-orange-500 to-red-500"
  },
  {
    id: 5,
    title: "Easy Customization",
    description: "Simple to modify and adapt to your brand",
    image: "",
    color: "bg-gradient-to-br from-indigo-500 to-purple-500"
  },
  {
    id: 6,
    title: "Accessible",
    description: "Built with accessibility in mind for all users",
    image: "",
    color: "bg-gradient-to-br from-pink-500 to-rose-500"
  }
];

const heroSlides = [
  {
    id: 1,
    title: "Responsive Sliders",
    subtitle: "Beautiful carousels that work perfectly on any device",
    gradient: "bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600"
  },
  {
    id: 2,
    title: "Touch Enabled",
    subtitle: "Swipe gestures on mobile, keyboard navigation on desktop",
    gradient: "bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600"
  },
  {
    id: 3,
    title: "Fully Customizable",
    subtitle: "Adapt every aspect to match your brand perfectly",
    gradient: "bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600"
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Slider Section */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <FullWidthSlider slides={heroSlides} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-foreground">
              Feature Cards
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Responsive card carousel that adapts from 1 column on mobile to 3 on desktop
            </p>
          </div>
          <ResponsiveSlider items={sliderItems} />
        </div>
      </section>

      {/* Value Sliders Section */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-foreground">
              Interactive Controls
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Touch-friendly range sliders with real-time value updates
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 lg:space-y-10">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8 lg:p-10">
              <ValueSlider
                title="Volume Control"
                min={0}
                max={100}
                defaultValue={75}
                unit="%"
              />
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8 lg:p-10">
              <ValueSlider
                title="Price Range"
                min={0}
                max={1000}
                step={10}
                defaultValue={450}
                unit="$"
              />
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8 lg:p-10">
              <ValueSlider
                title="Temperature"
                min={-20}
                max={40}
                defaultValue={22}
                unit="°C"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm sm:text-base text-muted-foreground">
            All sliders are fully responsive and work seamlessly across devices
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
