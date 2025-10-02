import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Settings, Volume2, Subtitles, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const VideoPlayer = ({ videoUrl, thumbnailUrl }) => {
  const videoRef = useRef(null);
  const [hlsInstance, setHlsInstance] = useState(null);
  const [audioTracks, setAudioTracks] = useState([]);
  const [subtitleTracks, setSubtitleTracks] = useState([]);
  const [qualityLevels, setQualityLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [currentAudio, setCurrentAudio] = useState(0);
  const [currentSubtitle, setCurrentSubtitle] = useState(-1);

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

      // Manifest loaded → Get audio, subtitle, quality
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

  /** Switch audio by lang or name */
  const switchAudio = (lang) => {
    if (!hlsInstance) return;
    const idx = hlsInstance.audioTracks.findIndex(
      (t) =>
        t.name?.toLowerCase().includes(lang.toLowerCase()) ||
        t.lang?.toLowerCase() === lang.toLowerCase()
    );
    if (idx !== -1) {
      hlsInstance.audioTrack = idx;
      setCurrentAudio(idx);
    }
  };

  /** Switch subtitle */
  const switchSubtitle = (index) => {
    if (!hlsInstance) return;
    hlsInstance.subtitleTrack = index;
    setCurrentSubtitle(index);
  };

  /** Switch quality */
  const switchQuality = (index) => {
    if (!hlsInstance) return;
    hlsInstance.currentLevel = index; // -1 = AUTO
    setCurrentLevel(index);
  };

  return (
    <div className="w-full">
      {/* Video Container */}
      <div className="relative w-full bg-black rounded-lg overflow-hidden group">
        <video
          ref={videoRef}
          className="w-full h-auto max-h-[70vh] object-contain"
          poster={thumbnailUrl}
          controls
          crossOrigin="anonymous"
        ></video>

        {/* Options Panel - Bottom Right Corner */}
        {(audioTracks.length > 1 || subtitleTracks.length > 0 || qualityLevels.length > 1) && (
          <div className="absolute bottom-16 right-4 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-black/80 hover:bg-black/90 text-white border border-white/20 backdrop-blur-sm shadow-lg"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-64 bg-background/95 backdrop-blur-sm border-border/50 shadow-xl"
              >
                {/* Quality Selection */}
                {qualityLevels.length > 1 && (
                  <>
                    <DropdownMenuLabel className="flex items-center gap-2 text-foreground">
                      <Gauge className="h-4 w-4 text-primary" />
                      Video Quality
                    </DropdownMenuLabel>
                    <div className="px-2 pb-2 space-y-1">
                      <DropdownMenuItem
                        onClick={() => switchQuality(-1)}
                        className={`cursor-pointer ${
                          currentLevel === -1 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        }`}
                      >
                        Auto
                      </DropdownMenuItem>
                      {qualityLevels.map((level, idx) => (
                        <DropdownMenuItem
                          key={idx}
                          onClick={() => switchQuality(idx)}
                          className={`cursor-pointer ${
                            currentLevel === idx 
                              ? "bg-primary text-primary-foreground" 
                              : "hover:bg-muted"
                          }`}
                        >
                          {level.height}p
                        </DropdownMenuItem>
                      ))}
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}

                {/* Audio Selection */}
                {audioTracks.length > 1 && (
                  <>
                    <DropdownMenuLabel className="flex items-center gap-2 text-foreground">
                      <Volume2 className="h-4 w-4 text-primary" />
                      Audio Language
                    </DropdownMenuLabel>
                    <div className="px-2 pb-2 space-y-1">
                      {audioTracks.map((track, idx) => (
                        <DropdownMenuItem
                          key={idx}
                          onClick={() => switchAudio(track.name || track.lang)}
                          className={`cursor-pointer ${
                            currentAudio === idx 
                              ? "bg-primary text-primary-foreground" 
                              : "hover:bg-muted"
                          }`}
                        >
                          {track.name || track.lang || `Track ${idx + 1}`}
                        </DropdownMenuItem>
                      ))}
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}

                {/* Subtitle Selection */}
                {subtitleTracks.length > 0 && (
                  <>
                    <DropdownMenuLabel className="flex items-center gap-2 text-foreground">
                      <Subtitles className="h-4 w-4 text-primary" />
                      Subtitles
                    </DropdownMenuLabel>
                    <div className="px-2 pb-2 space-y-1">
                      <DropdownMenuItem
                        onClick={() => switchSubtitle(-1)}
                        className={`cursor-pointer ${
                          currentSubtitle === -1 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        }`}
                      >
                        Off
                      </DropdownMenuItem>
                      {subtitleTracks.map((sub, idx) => (
                        <DropdownMenuItem
                          key={idx}
                          onClick={() => switchSubtitle(idx)}
                          className={`cursor-pointer ${
                            currentSubtitle === idx 
                              ? "bg-primary text-primary-foreground" 
                              : "hover:bg-muted"
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
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
