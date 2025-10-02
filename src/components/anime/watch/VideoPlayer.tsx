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

  // Save progress periodically
  useEffect(() => {
    if (!videoRef.current || !animeId || !episodeId) return;

    const saveProgress = () => {
      if (videoRef.current && currentTime > 0 && duration > 0) {
        // Don't save if near the end (last 5%)
        if (currentTime < duration * 0.95) {
          localStorage.setItem(`progress_${animeId}_${episodeId}`, currentTime.toString());
        } else {
          // Clear progress if completed
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

    if (Hls.isSupported()) {
      const hls = new Hls({ renderTextTracksNatively: false });
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(videoUrl);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setAudioTracks(data.audioTracks || []);
        setSubtitleTracks(data.subtitleTracks || []);
        setQualityLevels(data.levels || []);
      });

      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (_, data) => {
        setAudioTracks(data.audioTracks || []);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS.js error:", data);
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

      // Handle key combinations
      if (e.shiftKey) {
        if (e.key === '>') {
          e.preventDefault();
          // Increase speed
          const newSpeed = Math.min(playbackSpeed + 0.25, 2);
          handleSpeedChange(newSpeed);
          showControlsTemporarily();
          return;
        }
        if (e.key === '<') {
          e.preventDefault();
          // Decrease speed
          const newSpeed = Math.max(playbackSpeed - 0.25, 0.25);
          handleSpeedChange(newSpeed);
          showControlsTemporarily();
          return;
        }
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          // Start long press detection
          if (!longPressTimerRef.current) {
            longPressTimerRef.current = setTimeout(() => {
              // Long press detected - enable 2x speed
              if (videoRef.current) {
                normalSpeedRef.current = playbackSpeed;
                videoRef.current.playbackRate = 2;
                setIs2xSpeed(true);
                if (!isPlaying) {
                  videoRef.current.play();
                }
              }
            }, 300); // 300ms for long press
          }
          break;
        case 'KeyK':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowUp':
          e.preventDefault();
          // Volume up
          handleVolumeChange([Math.min(volume + 0.1, 1)]);
          showControlsTemporarily();
          break;
        case 'ArrowDown':
          e.preventDefault();
          // Volume down
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

        // Clear long press timer
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }

        // If 2x speed is active, restore normal speed
        if (is2xSpeed) {
          videoRef.current.playbackRate = normalSpeedRef.current;
          setIs2xSpeed(false);
        } else {
          // Short press - toggle play/pause
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
      videoRef.current.muted = newVolume === 0; // keep sync
      setVolume(newVolume);
      setIsMuted(videoRef.current.muted);

      // Show volume indicator
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

      // Show volume indicator
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
    if (!hlsInstance) return;
    hlsInstance.subtitleTrack = index;
    setCurrentSubtitle(index);
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

  // Touch events for mobile long press
  const handleTouchStart = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    longPressTimerRef.current = setTimeout(() => {
      // Long press detected on mobile
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
      {/* Video Element */}
      <video
        ref={videoRef}
        className={`w-full object-contain cursor-pointer ${isFullscreen ? 'h-screen' : isTheaterMode ? 'h-auto max-h-[85vh]' : 'h-auto max-h-[70vh]'
          }`}
        poster={thumbnailUrl}
        crossOrigin="anonymous"
        onClick={togglePlay}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />

      {/* Buffering Loader */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
        </div>
      )}

      {/* 2x Speed Indicator - Top Right */}
      <div className={`absolute top-4 right-4 z-20 pointer-events-none transition-all duration-300 ${is2xSpeed ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}>
        <div className="bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-md text-sm font-semibold backdrop-blur-sm shadow-lg">
          2x
        </div>
      </div>

      {/* Volume Indicator - Top Left */}
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-black/40 hover:bg-black/60 text-white border-0 backdrop-blur-sm"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 bg-black/95 backdrop-blur-sm border-white/10 text-white"
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
                              {sub.name || sub.lang}
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
              {/* Play/Pause */}
              <Button
                size="sm"
                variant="ghost"
                onClick={togglePlay}
                className="text-white hover:bg-white/10 h-10 w-10 p-0"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              {/* Previous Episode */}
              {hasPreviousEpisode && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onPreviousEpisode}
                  className="text-white hover:bg-white/10"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
              )}

              {/* Next Episode */}
              {hasNextEpisode && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onNextEpisode}
                  className="text-white hover:bg-white/10"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              )}

              {/* Volume */}
              <div className="flex items-center gap-2 group/volume">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/10 h-10 w-10 p-0"
                >
                  {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
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
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2">
              {/* Fullscreen */}
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/10 h-10 w-10 p-0"
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
