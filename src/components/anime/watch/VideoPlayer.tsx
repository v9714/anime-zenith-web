/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { Settings, Volume2, VolumeX, Subtitles, Gauge, Play, Pause, Maximize, Minimize, SkipForward, SkipBack, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import defaultThumbnail from "@/assets/default-episode-thumbnail.jpg";

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  animeId?: number;
  episodeId?: string;
  onNextEpisode?: () => void;
  onPreviousEpisode?: () => void;
  hasNextEpisode?: boolean;
  hasPreviousEpisode?: boolean;
  episodeTitle?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  animeId,
  episodeId,
  onNextEpisode,
  onPreviousEpisode,
  hasNextEpisode = false,
  hasPreviousEpisode = false,
  episodeTitle = ""
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hlsInstance, setHlsInstance] = useState<Hls | null>(null);
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [subtitleTracks, setSubtitleTracks] = useState<any[]>([]);
  const [qualityLevels, setQualityLevels] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [currentAudio, setCurrentAudio] = useState(0);
  const [currentSubtitle, setCurrentSubtitle] = useState(-1);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showAutoPlayCountdown, setShowAutoPlayCountdown] = useState(false);
  const [autoPlayCountdown, setAutoPlayCountdown] = useState(10);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [is2xSpeed, setIs2xSpeed] = useState(false);
  const [showVolumeIndicator, setShowVolumeIndicator] = useState(false);


  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const normalSpeedRef = useRef<number>(1);
  const volumeIndicatorTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved progress on mount
  useEffect(() => {
    if (animeId && episodeId && videoRef.current) {
      const savedProgress = localStorage.getItem(`progress_${animeId}_${episodeId}`);
      if (savedProgress) {
        const progress = parseFloat(savedProgress);
        videoRef.current.currentTime = progress;
      }
    }
  }, [animeId, episodeId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all timers
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (progressUpdateRef.current) {
        clearTimeout(progressUpdateRef.current);
      }
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      if (volumeIndicatorTimerRef.current) {
        clearTimeout(volumeIndicatorTimerRef.current);
      }

      // Cleanup HLS
      if (hlsInstance) {
        hlsInstance.destroy();
      }

      // Remove all tracks
      if (videoRef.current) {
        const tracks = videoRef.current.querySelectorAll('track');
        tracks.forEach(track => track.remove());
      }
    };
  }, [hlsInstance]);

  // Save progress periodically
  useEffect(() => {
    if (!videoRef.current || !animeId || !episodeId) return;

    const saveProgress = () => {
      if (videoRef.current && currentTime > 0 && duration > 0) {
        if (currentTime < duration * 0.95) {
          localStorage.setItem(`progress_${animeId}_${episodeId}`, currentTime.toString());
        } else {
          localStorage.removeItem(`progress_${animeId}_${episodeId}`);
        }
      }
    };

    const interval = setInterval(saveProgress, 5000);
    return () => clearInterval(interval);
  }, [animeId, episodeId, currentTime, duration]);

  // Initialize HLS
  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (!video) return;

    // Clean up existing HLS instance before creating new one
    if (hlsInstance) {
      hlsInstance.destroy();
      setHlsInstance(null);
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        renderTextTracksNatively: false,
        enableWebVTT: true,
        debug: false,
        // Performance optimizations
        maxBufferLength: 30,           // Maximum buffer length in seconds
        maxMaxBufferLength: 60,        // Max buffer size cap
        maxBufferSize: 60 * 1000 * 1000, // 60MB buffer size
        maxBufferHole: 0.5,            // Max hole tolerance
        lowLatencyMode: false,         // Disable low latency for better buffering
        backBufferLength: 90,          // Keep 90s of back buffer for seeking

        // Network optimizations
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 3,
        manifestLoadingRetryDelay: 1000,
        levelLoadingTimeOut: 10000,
        levelLoadingMaxRetry: 4,
        fragLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 6,

        // Adaptive bitrate settings
        abrEwmaDefaultEstimate: 500000, // Start at 500kbps
        abrEwmaSlowVoD: 3,
        abrEwmaFastVoD: 3,
        abrBandWidthFactor: 0.95,
        abrBandWidthUpFactor: 0.7,

        // Memory management
        enableWorker: true,            // Use web worker for demuxing
        enableSoftwareAES: true,       // Hardware AES if available
      });

      hls.attachMedia(video);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log("🎬 Media attached");
        hls.loadSource(videoUrl);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        console.log("📋 Manifest parsed");
        console.log("Audio tracks:", data.audioTracks);
        console.log("Subtitle tracks:", data.subtitleTracks);
        console.log("Quality levels:", data.levels);

        setAudioTracks(data.audioTracks || []);
        setSubtitleTracks(data.subtitleTracks || []);
        setQualityLevels(data.levels || []);
      });

      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (_, data) => {
        setAudioTracks(data.audioTracks || []);
      });

      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (_, data) => {
        console.log("📝 Subtitle tracks updated:", data.subtitleTracks);
        setSubtitleTracks(data.subtitleTracks || []);
      });

      hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (_, data) => {
        console.log("✅ Subtitle switched to:", data.id);
        setCurrentSubtitle(data.id);
      });

      hls.on(Hls.Events.SUBTITLE_TRACK_LOADED, (_, data) => {
        console.log("✅ Subtitle track loaded:", data);
      });

      hls.on(Hls.Events.CUES_PARSED, (_, data) => {
        console.log("✅ Cues parsed:", data);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("❌ HLS.js error:", data);
      });

      setHlsInstance(hls);

      return () => {
        if (hls) {
          hls.destroy();
        }
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
    } else {
      console.error('HLS is not supported in this browser');
    }
  }, [videoUrl]);

  // Monitor text tracks changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const checkTracks = () => {
      console.log("🔍 Text tracks count:", video.textTracks.length);
      Array.from(video.textTracks).forEach((track, i) => {
        console.log(`Track ${i}:`, {
          label: track.label,
          language: track.language,
          kind: track.kind,
          mode: track.mode,
          cues: track.cues?.length
        });
      });
    };

    const handleAddTrack = () => {
      console.log("➕ Track added");
      checkTracks();
    };

    const handleRemoveTrack = () => {
      console.log("➖ Track removed");
      checkTracks();
    };

    video.textTracks.addEventListener('addtrack', handleAddTrack);
    video.textTracks.addEventListener('removetrack', handleRemoveTrack);

    // Initial check
    setTimeout(checkTracks, 1000);
    setTimeout(checkTracks, 3000);

    return () => {
      video.textTracks.removeEventListener('addtrack', handleAddTrack);
      video.textTracks.removeEventListener('removetrack', handleRemoveTrack);
    };
  }, []);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handleEnded = () => {
      if (hasNextEpisode) {
        setShowAutoPlayCountdown(true);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
    };
  }, [hasNextEpisode]);

  // Auto-play countdown
  useEffect(() => {
    if (!showAutoPlayCountdown) {
      setAutoPlayCountdown(10);
      return;
    }

    if (autoPlayCountdown === 0) {
      onNextEpisode?.();
      setShowAutoPlayCountdown(false);
      return;
    }

    const timer = setTimeout(() => {
      setAutoPlayCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [showAutoPlayCountdown, autoPlayCountdown, onNextEpisode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      if (e.shiftKey) {
        if (e.key === '>') {
          e.preventDefault();
          const newSpeed = Math.min(playbackSpeed + 0.25, 2);
          handleSpeedChange(newSpeed);
          showControlsTemporarily();
          return;
        }
        if (e.key === '<') {
          e.preventDefault();
          const newSpeed = Math.max(playbackSpeed - 0.25, 0.25);
          handleSpeedChange(newSpeed);
          showControlsTemporarily();
          return;
        }
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (!longPressTimerRef.current) {
            longPressTimerRef.current = setTimeout(() => {
              if (videoRef.current) {
                normalSpeedRef.current = playbackSpeed;
                videoRef.current.playbackRate = 2;
                setIs2xSpeed(true);
                if (!isPlaying) {
                  videoRef.current.play();
                }
              }
            }, 300);
          }
          break;
        case 'KeyK':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange([Math.min(volume + 0.1, 1)]);
          showControlsTemporarily();
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange([Math.max(volume - 0.1, 0)]);
          showControlsTemporarily();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          showControlsTemporarily();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyT':
          e.preventDefault();
          setIsTheaterMode(prev => !prev);
          showControlsTemporarily();
          break;
        case 'ArrowRight':
          e.preventDefault();
          videoRef.current.currentTime = Math.min(
            videoRef.current.currentTime + 10,
            duration
          );
          showControlsTemporarily();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          videoRef.current.currentTime = Math.max(
            videoRef.current.currentTime - 10,
            0
          );
          showControlsTemporarily();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && videoRef.current) {
        e.preventDefault();

        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }

        if (is2xSpeed) {
          videoRef.current.playbackRate = normalSpeedRef.current;
          setIs2xSpeed(false);
        } else {
          togglePlay();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [duration, isPlaying, playbackSpeed, volume, is2xSpeed]);

  // Controls visibility
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    showControlsTemporarily();
  }, [isPlaying, showControlsTemporarily]);

  // Player controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setVolume(newVolume);
      setIsMuted(videoRef.current.muted);

      setShowVolumeIndicator(true);
      if (volumeIndicatorTimerRef.current) {
        clearTimeout(volumeIndicatorTimerRef.current);
      }
      volumeIndicatorTimerRef.current = setTimeout(() => {
        setShowVolumeIndicator(false);
      }, 2000);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);

      setShowVolumeIndicator(true);
      if (volumeIndicatorTimerRef.current) {
        clearTimeout(volumeIndicatorTimerRef.current);
      }
      volumeIndicatorTimerRef.current = setTimeout(() => {
        setShowVolumeIndicator(false);
      }, 2000);
    }
  };

  const handleProgressChange = (value: number[]) => {
    const newTime = value[0];
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const switchAudio = (lang: string) => {
    if (!hlsInstance) return;
    const idx = hlsInstance.audioTracks.findIndex(
      (t: any) =>
        t.name?.toLowerCase().includes(lang.toLowerCase()) ||
        t.lang?.toLowerCase() === lang.toLowerCase()
    );
    if (idx !== -1) {
      hlsInstance.audioTrack = idx;
      setCurrentAudio(idx);
    }
  };

  const switchSubtitle = (index: number) => {
    if (!videoRef.current) return;

    console.log("🔄 Switching subtitle to index:", index);

    // Remove all existing tracks first
    const existingTracks = videoRef.current.querySelectorAll('track');
    existingTracks.forEach(track => track.remove());

    // Turn off all text tracks
    Array.from(videoRef.current.textTracks).forEach(track => {
      track.mode = 'hidden';
    });

    if (index === -1) {
      setCurrentSubtitle(-1);
      return;
    }

    const sub = subtitleTracks[index];
    if (sub && sub.url) {
      console.log("📥 Loading subtitle from:", sub.url);

      // Create a new track element
      const trackElement = document.createElement('track');
      trackElement.kind = 'subtitles';
      trackElement.label = sub.name || sub.lang || 'English';
      trackElement.srclang = 'en';
      trackElement.src = sub.url;
      trackElement.default = true;

      // Add track to video
      videoRef.current.appendChild(trackElement);

      // Wait for track to load
      trackElement.addEventListener('load', () => {
        console.log("✅ Track loaded successfully");
        if (videoRef.current) {
          const textTrack = trackElement.track;
          textTrack.mode = 'showing';
          console.log("✅ Subtitle showing. Cues:", textTrack.cues?.length);
          setCurrentSubtitle(index);
        }
      });

      trackElement.addEventListener('error', (e) => {
        console.error("❌ Track load error:", e);
      });
    }
  };

  const switchQuality = (index: number) => {
    if (!hlsInstance) return;
    hlsInstance.currentLevel = index;
    setCurrentLevel(index);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTouchStart = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    longPressTimerRef.current = setTimeout(() => {
      if (videoRef.current) {
        normalSpeedRef.current = playbackSpeed;
        videoRef.current.playbackRate = 2;
        setIs2xSpeed(true);
        if (!isPlaying) {
          videoRef.current.play();
        }
      }
    }, 300);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (is2xSpeed && videoRef.current) {
      videoRef.current.playbackRate = normalSpeedRef.current;
      setIs2xSpeed(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-lg overflow-hidden group"
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <style>{`
        video::cue {
          background-color: rgba(0, 0, 0, 0.85);
          color: #ffffff;
          font-size: clamp(14px, 1.8vw, 20px);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-weight: 500;
          text-shadow: 
            2px 2px 4px rgba(0, 0, 0, 0.9),
            -1px -1px 2px rgba(0, 0, 0, 0.9),
            1px -1px 2px rgba(0, 0, 0, 0.9),
            -1px 1px 2px rgba(0, 0, 0, 0.9);
          line-height: 1.4;
          padding: 0.2em 0.6em;
          border-radius: 4px;
          letter-spacing: 0.02em;
        }
        video::-webkit-media-text-track-container {
          position: absolute;
          bottom: 12%;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          text-align: center;
          transition: bottom 0.1s ease;
          pointer-events: none;
        }
        video::cue-region {
          background: transparent;
        }
      `}</style>

      {/* Video Element with Fixed Aspect Ratio */}
      <div className={`relative w-full ${isFullscreen ? '' : 'aspect-video'}`}>
        <video
          ref={videoRef}
          className={`w-full h-full object-contain ${isFullscreen ? 'h-screen' : isTheaterMode ? 'max-h-[85vh]' : 'max-h-[70vh]'}`}
          poster={thumbnailUrl || defaultThumbnail}
          crossOrigin="anonymous"
          onClick={togglePlay}
          onDoubleClick={toggleFullscreen}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />
      </div>

      {/* Buffering Loader */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
        </div>
      )}

      {/* Play/Pause Center Overlay */}
      {!isBuffering && (
        <div 
          className={`absolute inset-0 flex items-center justify-center z-15 pointer-events-none transition-all duration-300 ease-out ${
            !isPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          <div className="bg-black/60 backdrop-blur-sm rounded-full p-5 shadow-2xl">
            <Play className="h-12 w-12 text-white fill-white" />
          </div>
        </div>
      )}

      {/* 2x Speed Indicator */}
      <div className={`absolute top-4 right-4 z-20 pointer-events-none transition-all duration-300 ${is2xSpeed ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}>
        <div className="bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-md text-sm font-semibold backdrop-blur-sm shadow-lg">
          2x
        </div>
      </div>


      {/* Volume Indicator */}
      <div className={`absolute top-4 left-4 z-20 pointer-events-none transition-all duration-300 ${showVolumeIndicator ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}>
        <div className="bg-black/80 text-white px-3 py-1.5 rounded-md text-sm font-medium backdrop-blur-sm shadow-lg flex items-center gap-2">
          {isMuted || volume === 0 ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
          <span>{Math.round(volume * 100)}%</span>
        </div>
      </div>

      {/* Auto-play Countdown Overlay */}
      {showAutoPlayCountdown && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-white">Next Episode</h3>
            <p className="text-muted-foreground">Starting in {autoPlayCountdown} seconds...</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => {
                setShowAutoPlayCountdown(false);
                onNextEpisode?.();
              }}>
                Play Now
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAutoPlayCountdown(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 transition-opacity duration-300 pointer-events-none ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
      >
        {/* Top Controls Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h3 className="font-semibold text-lg">{episodeTitle}</h3>
            </div>
            <div className="flex gap-2">
              {/* Settings Dropdown */}
              {(audioTracks.length > 1 || subtitleTracks.length > 0 || qualityLevels.length > 1) && (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-black/40 hover:bg-black/60 text-white border-0 backdrop-blur-sm pointer-events-auto z-[60]"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={5}
                    container={containerRef.current}
                    className="w-64 bg-black/95 backdrop-blur-sm border-white/10 text-white z-[9999] pointer-events-auto"
                  >
                    {/* Quality Selection */}
                    {qualityLevels.length > 1 && (
                      <>
                        <DropdownMenuLabel className="flex items-center gap-2">
                          <Gauge className="h-4 w-4 text-primary" />
                          Video Quality
                        </DropdownMenuLabel>
                        <div className="px-2 pb-2 space-y-1">
                          <DropdownMenuItem
                            onClick={() => switchQuality(-1)}
                            className={`cursor-pointer ${currentLevel === -1
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-white/10"
                              }`}
                          >
                            Auto
                          </DropdownMenuItem>
                          {qualityLevels.map((level, idx) => (
                            <DropdownMenuItem
                              key={idx}
                              onClick={() => switchQuality(idx)}
                              className={`cursor-pointer ${currentLevel === idx
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-white/10"
                                }`}
                            >
                              {level.height}p
                            </DropdownMenuItem>
                          ))}
                        </div>
                        <DropdownMenuSeparator className="bg-white/10" />
                      </>
                    )}

                    {/* Audio Selection */}
                    {audioTracks.length > 1 && (
                      <>
                        <DropdownMenuLabel className="flex items-center gap-2">
                          <Volume2 className="h-4 w-4 text-primary" />
                          Audio Language
                        </DropdownMenuLabel>
                        <div className="px-2 pb-2 space-y-1">
                          {audioTracks.map((track, idx) => (
                            <DropdownMenuItem
                              key={idx}
                              onClick={() => switchAudio(track.name || track.lang)}
                              className={`cursor-pointer ${currentAudio === idx
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-white/10"
                                }`}
                            >
                              {track.name || track.lang || `Track ${idx + 1}`}
                            </DropdownMenuItem>
                          ))}
                        </div>
                        <DropdownMenuSeparator className="bg-white/10" />
                      </>
                    )}

                    {/* Subtitle Selection */}
                    {subtitleTracks.length > 0 && (
                      <>
                        <DropdownMenuLabel className="flex items-center gap-2">
                          <Subtitles className="h-4 w-4 text-primary" />
                          Subtitles
                        </DropdownMenuLabel>
                        <div className="px-2 pb-2 space-y-1">
                          <DropdownMenuItem
                            onClick={() => switchSubtitle(-1)}
                            className={`cursor-pointer ${currentSubtitle === -1
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-white/10"
                              }`}
                          >
                            Off
                          </DropdownMenuItem>
                          {subtitleTracks.map((sub, idx) => (
                            <DropdownMenuItem
                              key={idx}
                              onClick={() => switchSubtitle(idx)}
                              className={`cursor-pointer ${currentSubtitle === idx
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-white/10"
                                }`}
                            >
                              {sub.name || sub.lang || `Subtitle ${idx + 1}`}
                            </DropdownMenuItem>
                          ))}
                        </div>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Controls Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 pointer-events-auto">
          {/* Progress Bar */}
          <div className="space-y-1">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleProgressChange}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-white/70">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                {/* Play/Pause */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={togglePlay}
                      className="text-white hover:bg-white/10 h-10 w-10 p-0"
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{isPlaying ? 'Pause' : 'Play'} (K or Space)</p>
                  </TooltipContent>
                </Tooltip>

                {/* Previous Episode */}
                {hasPreviousEpisode && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={onPreviousEpisode}
                        className="text-white hover:bg-white/10"
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Previous Episode</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Next Episode */}
                {hasNextEpisode && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={onNextEpisode}
                        className="text-white hover:bg-white/10"
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Next Episode</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Volume */}
                <div className="flex items-center gap-2 group/volume">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleMute}
                        className="text-white hover:bg-white/10 h-10 w-10 p-0"
                      >
                        {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Mute (M) / Volume (↑↓)</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="w-0 group-hover/volume:w-24 opacity-0 group-hover/volume:opacity-100 transition-all overflow-hidden">
                    <Slider
                      value={[volume]}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                {/* Speed Control */}
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/10 gap-1"
                        >
                          <Zap className="h-4 w-4" />
                          <span className="text-xs">{playbackSpeed}x</span>
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Speed (Shift + &lt; / &gt;)</p>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent className="bg-black/95 backdrop-blur-sm border-white/10 text-white">
                    <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                      <DropdownMenuItem
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`cursor-pointer ${playbackSpeed === speed
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-white/10"
                          }`}
                      >
                        {speed}x
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipProvider>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2">
              <TooltipProvider>
                {/* Fullscreen */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={toggleFullscreen}
                      className="text-white hover:bg-white/10 h-10 w-10 p-0"
                    >
                      {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Fullscreen (F or Double Click)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;