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
    <div className="relative w-full bg-black rounded-lg overflow-hidden group">
      <video
        ref={videoRef}
        className="w-full h-auto max-h-[70vh] object-contain"
        poster={thumbnailUrl}
        controls
        crossOrigin="anonymous"
      ></video>

      {(audioTracks.length > 1 ||
        subtitleTracks.length > 0 ||
        qualityLevels.length > 1) && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-sm p-2 rounded-md space-y-2">

            {/* Audio Selection */}
            {audioTracks.length > 1 && (
              <div>
                Audio:
                {audioTracks.map((track, idx) => (
                  <button
                    key={idx}
                    onClick={() => switchAudio(track.name || track.lang)}
                    className={`ml-2 px-2 py-1 rounded ${currentAudio === idx ? "bg-white/30" : "bg-white/10"
                      }`}
                  >
                    {track.name || track.lang || `Track ${idx + 1}`}
                  </button>
                ))}
              </div>
            )}

            {/* Subtitle Selection */}
            {subtitleTracks.length > 0 && (
              <div>
                Subs:
                <button
                  onClick={() => switchSubtitle(-1)}
                  className={`ml-2 px-2 py-1 rounded ${currentSubtitle === -1 ? "bg-white/30" : "bg-white/10"
                    }`}
                >
                  Off
                </button>
                {subtitleTracks.map((sub, idx) => (
                  <button
                    key={idx}
                    onClick={() => switchSubtitle(idx)}
                    className={`ml-2 px-2 py-1 rounded ${currentSubtitle === idx ? "bg-white/30" : "bg-white/10"
                      }`}
                  >
                    {sub.name || sub.lang}
                  </button>
                ))}
              </div>
            )}

            {/* Quality Selection */}
            {qualityLevels.length > 1 && (
              <div>
                Quality:
                <button
                  onClick={() => switchQuality(-1)}
                  className={`ml-2 px-2 py-1 rounded ${currentLevel === -1 ? "bg-white/30" : "bg-white/10"
                    }`}
                >
                  Auto
                </button>
                {qualityLevels.map((level, idx) => (
                  <button
                    key={idx}
                    onClick={() => switchQuality(idx)}
                    className={`ml-2 px-2 py-1 rounded ${currentLevel === idx ? "bg-white/30" : "bg-white/10"
                      }`}
                  >
                    {level.height}p
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
    </div>
  );
};

export default VideoPlayer;
