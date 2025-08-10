import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  subtitles?: Array<{
    lang: string;
    url: string;
    label: string;
  }>;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  thumbnailUrl,
  subtitles = []
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([100]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('Auto');
  const [selectedSubtitle, setSelectedSubtitle] = useState('Off');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsRef.current = hls;

      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest loaded');
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Network error, trying to recover...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Media error, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.log('Fatal error, cannot recover');
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
    } else {
      console.error('HLS is not supported in this browser');
    }
  }, [videoUrl]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const volumeValue = newVolume[0] / 100;
    video.volume = volumeValue;
    setVolume(newVolume);
    setIsMuted(volumeValue === 0);
  };

  const handleSeek = (newTime: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = newTime[0];
    setCurrentTime(newTime[0]);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      video.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeout);
      setShowControls(true);
      timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    const handleMouseMove = () => resetTimeout();
    const handleMouseLeave = () => {
      if (isPlaying) {
        setShowControls(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden group">
      <video
        ref={videoRef}
        className="w-full h-auto max-h-[70vh] object-contain"
        poster={thumbnailUrl}
        onClick={togglePlay}
        onLoadedMetadata={() => {
          const video = videoRef.current;
          if (video) {
            setDuration(video.duration);
          }
        }}
      >
        {subtitles.map((subtitle) => (
          <track
            key={subtitle.lang}
            kind="subtitles"
            src={subtitle.url}
            srcLang={subtitle.lang}
            label={subtitle.label}
            default={subtitle.lang === 'en'}
          />
        ))}
      </video>

      {/* Controls Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Play/Pause Button (Center) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            size="lg"
            variant="ghost"
            className="text-white hover:bg-white/20 h-16 w-16 rounded-full"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
          </Button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          {/* Progress Bar */}
          <div className="w-full">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="w-full"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={() => skipTime(-10)}>
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={() => skipTime(10)}>
                <SkipForward className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <div className="w-20">
                  <Slider
                    value={volume}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                    className="w-full"
                  />
                </div>
              </div>

              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Quality Settings */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedQuality('Auto')}>
                    Auto
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedQuality('1080p')}>
                    1080p
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedQuality('720p')}>
                    720p
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedQuality('480p')}>
                    480p
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Subtitle Settings */}
              {subtitles.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      CC
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSelectedSubtitle('Off')}>
                      Off
                    </DropdownMenuItem>
                    {subtitles.map((subtitle) => (
                      <DropdownMenuItem
                        key={subtitle.lang}
                        onClick={() => setSelectedSubtitle(subtitle.label)}
                      >
                        {subtitle.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={toggleFullscreen}>
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
