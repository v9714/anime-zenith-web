import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

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
    <div className="w-full space-y-4">
      {/* Video Container */}
      <div className="relative w-full bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-auto max-h-[70vh] object-contain"
          poster={thumbnailUrl}
          controls
          crossOrigin="anonymous"
        ></video>
      </div>

      {/* Interactive Video Controls */}
      {(audioTracks.length > 1 || subtitleTracks.length > 0 || qualityLevels.length > 1) && (
        <div className="bg-card rounded-lg p-4 border border-border/30 space-y-4">
          
          {/* Audio Selection */}
          {audioTracks.length > 1 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                Audio Language
              </h4>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {audioTracks.map((track, idx) => (
                  <button
                    key={idx}
                    onClick={() => switchAudio(track.name || track.lang)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      currentAudio === idx 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {track.name || track.lang || `Track ${idx + 1}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subtitle Selection */}
          {subtitleTracks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                Subtitles
              </h4>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                <button
                  onClick={() => switchSubtitle(-1)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    currentSubtitle === -1 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Off
                </button>
                {subtitleTracks.map((sub, idx) => (
                  <button
                    key={idx}
                    onClick={() => switchSubtitle(idx)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      currentSubtitle === idx 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {sub.name || sub.lang}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quality Selection */}
          {qualityLevels.length > 1 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                Video Quality
              </h4>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                <button
                  onClick={() => switchQuality(-1)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    currentLevel === -1 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Auto
                </button>
                {qualityLevels.map((level, idx) => (
                  <button
                    key={idx}
                    onClick={() => switchQuality(idx)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      currentLevel === idx 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {level.height}p
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
