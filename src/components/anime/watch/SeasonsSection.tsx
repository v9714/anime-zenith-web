import { useNavigate } from "react-router-dom";

interface Season {
    seasonNumber: number;
    title: string;
    bannerImage: string;
    episodeCount?: number;
}

interface SeasonsSectionProps {
    currentSeasonNumber?: number;
    animeTitle: string;
}

export function SeasonsSection({
    currentSeasonNumber = 1,
    animeTitle,
}: SeasonsSectionProps) {
    const navigate = useNavigate();

    // Mock season data with anime-style images
    const seasons: Season[] = [
        {
            seasonNumber: 1,
            title: "Season 1",
            bannerImage:
                "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?w=800&q=80",
            episodeCount: 12,
        },
        {
            seasonNumber: 2,
            title: "Season 2",
            bannerImage:
                "https://images.unsplash.com/photo-1581905764498-3f30e6c6b9f9?w=800&q=80",
            episodeCount: 10,
        },
        {
            seasonNumber: 3,
            title: "Season 3",
            bannerImage:
                "https://images.unsplash.com/photo-1623053432031-cf7d5d98f0ec?w=800&q=80",
            episodeCount: 13,
        },
        {
            seasonNumber: 4,
            title: "Season 4",
            bannerImage:
                "https://images.unsplash.com/photo-1581320545076-6f256c568c96?w=800&q=80",
            episodeCount: 11,
        },
    ];

    const handleSeasonClick = (season: Season) => {
        console.log("Navigate to season:", season.seasonNumber);
        // navigate(`/anime/${animeTitle}/season/${season.seasonNumber}`);
    };

    return (
        <div className="mt-8 space-y-4">
            <h2 className="text-xl font-heading font-bold text-foreground">
                Watch more seasons of {animeTitle}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {seasons.map((season) => {
                    const isActive = season.seasonNumber === currentSeasonNumber;

                    return (
                        <button
                            key={season.seasonNumber}
                            onClick={() => handleSeasonClick(season)}
                            className={`group relative h-20 rounded-xl overflow-hidden transition-all duration-500 ease-in-out hover:scale-105 hover:z-10 ${isActive ? "ring-2 ring-primary shadow-lg shadow-primary/40" : ""} `}
                        >
                            {/* Background Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                style={{ backgroundImage: `url(${season.bannerImage})` }}
                            />

                            {/* Dark Overlay */}
                            <div
                                className={`absolute inset-0 bg-black transition-opacity duration-500 ${isActive ? "opacity-30" : "opacity-60 group-hover:opacity-30"}`}
                            />

                            {/* Season Title + Episode Count */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-10">
                                <h3
                                    className={`font-heading font-bold text-white drop-shadow-md transition-all duration-300 group-hover:scale-110 ${isActive ? "text-lg text-primary-foreground" : "text-base"}`}
                                >
                                    {season.title}
                                </h3>
                                {season.episodeCount && (
                                    <p className="text-xs text-white/80 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {season.episodeCount} Episodes
                                    </p>
                                )}
                            </div>

                            {/* Shimmer Effect */}
                            <div
                                className="absolute inset-0 -translate-x-full group-hover:translate-x-full  transition-transform duration-1000 ease-in-out  bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
