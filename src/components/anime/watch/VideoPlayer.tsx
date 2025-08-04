// import { useState, useEffect, useRef } from "react";
// import { 
//   Play, Pause, Volume, Languages, Subtitles, Headphones, 
//   RotateCcw, Maximize, Minimize 
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { 
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { 
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/contexts/AuthContext";

// // Define types for video configuration
// interface VideoConfig {
//   language: 'japanese' | 'english' | 'spanish';
//   subtitles: 'english' | 'spanish' | 'none';
//   isDubbed: boolean;
// }

// // Define type for playback progress
// interface PlaybackProgress {
//   animeId: number;
//   episodeNumber: number;
//   timestamp: number;
//   duration: number;
//   lastUpdated: string;
// }

// interface VideoPlayerProps {
//   animeId: number;
//   episodeNumber: number;
//   title: string;
//   episodeTitle: string;
// }

// export function VideoPlayer({ animeId, episodeNumber, title, episodeTitle }: VideoPlayerProps) {
//   const { currentUser } = useAuth();
//   const [showControls, setShowControls] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [volume, setVolume] = useState(1);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [isLoaded, setIsLoaded] = useState(false);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const { toast } = useToast();

//   // Language and subtitle options
//   const [videoConfig, setVideoConfig] = useState<VideoConfig>({
//     language: 'japanese',
//     subtitles: 'english',
//     isDubbed: false
//   });

//   // Set up playback tracking
//   useEffect(() => {
//     if (!currentUser) return;

//     // Load saved progress if available
//     const savedProgress = localStorage.getItem(`playback-${animeId}-${episodeNumber}`);

//     if (savedProgress) {
//       try {
//         const progress: PlaybackProgress = JSON.parse(savedProgress);
//         if (videoRef.current && progress.timestamp > 0) {
//           videoRef.current.currentTime = progress.timestamp;

//           // Show resume toast notification
//           toast({
//             id: String(Date.now()),
//             title: "Resuming playback",
//             description: `Continuing from ${formatTime(progress.timestamp)}`,
//           });
//         }
//       } catch (error) {
//         console.error("Error loading saved playback position", error);
//       }
//     }

//     // Set up interval to save progress periodically
//     const saveInterval = setInterval(() => {
//       if (videoRef.current && videoRef.current.currentTime > 0) {
//         savePlaybackProgress();
//       }
//     }, 10000); // Save every 10 seconds

//     return () => clearInterval(saveInterval);
//   }, [currentUser, animeId, episodeNumber]);

//   // Handle fullscreen changes
//   useEffect(() => {
//     const handleFullscreenChange = () => {
//       setIsFullscreen(document.fullscreenElement !== null);
//     };

//     document.addEventListener('fullscreenchange', handleFullscreenChange);
//     return () => {
//       document.removeEventListener('fullscreenchange', handleFullscreenChange);
//     };
//   }, []);

//   // Save current playback progress
//   const savePlaybackProgress = () => {
//     if (!currentUser || !videoRef.current) return;

//     const progress: PlaybackProgress = {
//       animeId,
//       episodeNumber,
//       timestamp: videoRef.current.currentTime,
//       duration: videoRef.current.duration,
//       lastUpdated: new Date().toISOString()
//     };

//     localStorage.setItem(`playback-${animeId}-${episodeNumber}`, JSON.stringify(progress));
//   };

//   // Handle play/pause
//   const togglePlayPause = () => {
//     if (videoRef.current) {
//       if (isPlaying) {
//         videoRef.current.pause();
//       } else {
//         videoRef.current.play();
//       }
//       setIsPlaying(!isPlaying);
//     }
//   };

//   // Toggle fullscreen mode
//   const toggleFullscreen = () => {
//     if (!containerRef.current) return;

//     if (!document.fullscreenElement) {
//       containerRef.current.requestFullscreen().catch(err => {
//         toast({
//           id: String(Date.now()),
//           title: "Fullscreen error",
//           description: `Error attempting to enable fullscreen: ${err.message}`,
//         });
//       });
//     } else {
//       document.exitFullscreen();
//     }
//   };

//   // Handle video loaded - DON'T auto-play
//   const handleLoadedData = () => {
//     setIsLoaded(true);
//     if (videoRef.current) {
//       videoRef.current.pause();
//       setIsPlaying(false);
//     }
//   };

//   // Handle time update
//   const handleTimeUpdate = () => {
//     if (videoRef.current) {
//       setCurrentTime(videoRef.current.currentTime);
//     }
//   };

//   // Handle duration change
//   const handleDurationChange = () => {
//     if (videoRef.current) {
//       setDuration(videoRef.current.duration);
//     }
//   };

//   // Format time from seconds to MM:SS
//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   // Handle progress bar click
//   const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (!videoRef.current) return;

//     const progressBar = e.currentTarget;
//     const rect = progressBar.getBoundingClientRect();
//     const pos = (e.clientX - rect.left) / rect.width;
//     const newTime = pos * duration;

//     videoRef.current.currentTime = newTime;
//     setCurrentTime(newTime);
//   };

//   // Update video config
//   const updateVideoConfig = (config: Partial<VideoConfig>) => {
//     const newConfig = { ...videoConfig, ...config };
//     setVideoConfig(newConfig);

//     // In a real app, this would change the video source or subtitle track
//     toast({
//       id: String(Date.now()),
//       title: "Preferences updated",
//       description: config.isDubbed !== undefined 
//         ? `Audio: ${config.isDubbed ? "Dubbed" : "Original"} ${newConfig.language.charAt(0).toUpperCase() + newConfig.language.slice(1)}`
//         : config.subtitles !== undefined
//           ? `Subtitles: ${newConfig.subtitles === "none" ? "Off" : newConfig.subtitles.charAt(0).toUpperCase() + newConfig.subtitles.slice(1)}`
//           : `Language: ${newConfig.language.charAt(0).toUpperCase() + newConfig.language.slice(1)}`
//     });
//   };

//   return (
//     <div 
//       ref={containerRef}
//       className={`relative w-full ${isFullscreen ? 'h-screen' : 'aspect-video'} bg-black rounded-lg overflow-hidden shadow-xl group`}
//       onMouseEnter={() => setShowControls(true)}
//       onMouseLeave={() => setShowControls(false)}
//       onTouchStart={() => setShowControls(true)}
//     >
//       <video
//         className="w-full h-full object-contain"
//         controls={false}
//         ref={videoRef}
//         onTimeUpdate={handleTimeUpdate}
//         onDurationChange={handleDurationChange}
//         onLoadedData={handleLoadedData}
//         onEnded={() => savePlaybackProgress()}
//         poster="https://cdn.myanimelist.net/images/anime/13/56139.jpg"
//         preload="metadata"
//       >
//         <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
//       </video>

//       {/* Custom video player overlay */}
//       <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 flex flex-col justify-between p-4`}>
//         {/* Top controls */}
//         <div className="flex items-center justify-between">
//           <Badge variant="outline" className="bg-black/70 text-white border-white/20">
//             Now Playing: {episodeTitle}
//           </Badge>
//           <div className="flex items-center gap-2">
//             {/* Language Selection Dropdown */}
//             <DropdownMenu>
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <DropdownMenuTrigger asChild>
//                     <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full bg-black/40 hover:bg-black/60 text-white">
//                       <Languages className="h-4 w-4" />
//                     </Button>
//                   </DropdownMenuTrigger>
//                 </TooltipTrigger>
//                 <TooltipContent>Language Options</TooltipContent>
//               </Tooltip>
//               <DropdownMenuContent align="end" className="w-56">
//                 <DropdownMenuLabel>Audio</DropdownMenuLabel>
//                 <DropdownMenuItem 
//                   className={videoConfig.language === 'japanese' && !videoConfig.isDubbed ? "bg-primary/20 text-primary" : ""}
//                   onClick={() => updateVideoConfig({ language: 'japanese', isDubbed: false })}
//                 >
//                   <Headphones className="mr-2 h-4 w-4" />
//                   Japanese (Original)
//                 </DropdownMenuItem>
//                 <DropdownMenuItem 
//                   className={videoConfig.language === 'english' && videoConfig.isDubbed ? "bg-primary/20 text-primary" : ""}
//                   onClick={() => updateVideoConfig({ language: 'english', isDubbed: true })}
//                 >
//                   <Headphones className="mr-2 h-4 w-4" />
//                   English (Dubbed)
//                 </DropdownMenuItem>
//                 <DropdownMenuItem 
//                   className={videoConfig.language === 'spanish' && videoConfig.isDubbed ? "bg-primary/20 text-primary" : ""}
//                   onClick={() => updateVideoConfig({ language: 'spanish', isDubbed: true })}
//                 >
//                   <Headphones className="mr-2 h-4 w-4" />
//                   Spanish (Dubbed)
//                 </DropdownMenuItem>

//                 <DropdownMenuSeparator />
//                 <DropdownMenuLabel>Subtitles</DropdownMenuLabel>
//                 <DropdownMenuItem 
//                   className={videoConfig.subtitles === 'english' ? "bg-primary/20 text-primary" : ""}
//                   onClick={() => updateVideoConfig({ subtitles: 'english' })}
//                 >
//                   <Subtitles className="mr-2 h-4 w-4" />
//                   English
//                 </DropdownMenuItem>
//                 <DropdownMenuItem 
//                   className={videoConfig.subtitles === 'spanish' ? "bg-primary/20 text-primary" : ""}
//                   onClick={() => updateVideoConfig({ subtitles: 'spanish' })}
//                 >
//                   <Subtitles className="mr-2 h-4 w-4" />
//                   Spanish
//                 </DropdownMenuItem>
//                 <DropdownMenuItem 
//                   className={videoConfig.subtitles === 'none' ? "bg-primary/20 text-primary" : ""}
//                   onClick={() => updateVideoConfig({ subtitles: 'none' })}
//                 >
//                   Off
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>

//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button 
//                   size="sm" 
//                   variant="ghost" 
//                   className="h-8 w-8 p-0 rounded-full bg-black/40 hover:bg-black/60 text-white"
//                   onClick={() => {
//                     if (videoRef.current) {
//                       videoRef.current.muted = !videoRef.current.muted;
//                     }
//                   }}
//                 >
//                   <Volume className="h-4 w-4" />
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>Toggle Audio</TooltipContent>
//             </Tooltip>

//             {/* Fullscreen button */}
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button 
//                   size="sm" 
//                   variant="ghost" 
//                   className="h-8 w-8 p-0 rounded-full bg-black/40 hover:bg-black/60 text-white"
//                   onClick={toggleFullscreen}
//                 >
//                   {isFullscreen ? (
//                     <Minimize className="h-4 w-4" />
//                   ) : (
//                     <Maximize className="h-4 w-4" />
//                   )}
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</TooltipContent>
//             </Tooltip>
//           </div>
//         </div>

//         {/* Center play button */}
//         <div className="absolute inset-0 flex items-center justify-center">
//           <Button 
//             size="lg" 
//             className={`h-20 w-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 shadow-lg transition-all duration-300 ${isPlaying ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
//             onClick={togglePlayPause}
//           >
//             {isPlaying ? (
//               <Pause className="h-8 w-8" />
//             ) : (
//               <Play className="h-8 w-8 ml-1" />
//             )}
//           </Button>
//         </div>

//         {/* Progress bar and controls */}
//         <div className="w-full space-y-2">
//           {/* Progress bar */}
//           <div 
//             className="w-full h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer"
//             onClick={handleProgressBarClick}
//           >
//             <div 
//               className="h-full bg-primary rounded-full"
//               style={{ width: `${(currentTime/duration)*100 || 0}%` }}
//             ></div>
//           </div>

//           {/* Bottom controls */}
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <Button 
//                 size="sm" 
//                 variant="ghost" 
//                 className="text-white hover:bg-white/10 px-2 h-8"
//                 onClick={togglePlayPause}
//               >
//                 {isPlaying ? (
//                   <><Pause className="h-4 w-4 mr-1" /> Pause</>
//                 ) : (
//                   <><Play className="h-4 w-4 mr-1" /> Play</>
//                 )}
//               </Button>

//               {currentUser && (
//                 <Tooltip>
//                   <TooltipTrigger asChild>
//                     <Button 
//                       size="sm" 
//                       variant="ghost" 
//                       className="h-8 w-8 p-0 text-white hover:bg-white/10"
//                       onClick={() => {
//                         if (videoRef.current) {
//                           videoRef.current.currentTime = 0;
//                           setCurrentTime(0);
//                           toast({
//                             id: String(Date.now()),
//                             title: "Restarted",
//                             description: "Playback restarted from beginning"
//                           });
//                         }
//                       }}
//                     >
//                       <RotateCcw className="h-4 w-4" />
//                     </Button>
//                   </TooltipTrigger>
//                   <TooltipContent>Restart</TooltipContent>
//                 </Tooltip>
//               )}

//               <div className="text-xs text-white/70">{formatTime(currentTime)} / {formatTime(duration || 0)}</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* "Now Playing" badge */}
//       <div className="absolute left-3 top-3 bg-primary/90 rounded-md text-xs text-white px-2 py-1 shadow-[0_0_10px_rgba(138,43,226,0.5)]">
//         Now Playing
//       </div>

//       {/* Subtitle example */}
//       {videoConfig.subtitles !== 'none' && (
//         <div className="absolute bottom-8 left-0 right-0 text-center">
//           <div className="inline-block bg-black/50 text-white px-4 py-1 rounded text-sm mx-auto shadow-md">
//             I have to keep trying, no matter what!
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';

const VideoPlayer = ({ videoUrl, thumbnailUrl }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('Video Loaded');
        });
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native support
        videoRef.current.src = videoUrl;
      }
    }
  }, [videoUrl]);

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-contain"
      poster={thumbnailUrl}
      preload="metadata"
      onTimeUpdate={() => { }}
      onDurationChange={() => { }}
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      onEnded={() => setIsPlaying(false)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      controls // <-- Add controls to manage playback
      onClick={togglePlay}
    />
  );
};

export default VideoPlayer;
