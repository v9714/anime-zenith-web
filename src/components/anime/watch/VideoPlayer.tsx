// import React, { useEffect, useRef, useState } from 'react';
// import Hls from 'hls.js';

// interface Subtitle {
//   lang: string;
//   url: string;
//   label?: string;
// }

// interface VideoPlayerProps {
//   videoUrl: string;
//   thumbnailUrl?: string;
//   subtitles?: Subtitle[];
// }

// const VideoPlayer: React.FC<VideoPlayerProps> = ({
//   videoUrl,
//   thumbnailUrl,
//   subtitles = [],
// }) => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const [hlsInstance, setHlsInstance] = useState<Hls | null>(null); // <-- Hls instance reference
//   const [audioTracks, setAudioTracks] = useState<Hls.AudioTrack[]>([]);
//   const [activeSub, setActiveSub] = useState<number>(0);

//   useEffect(() => {
//     if (!videoRef.current) return;

//     if (Hls.isSupported()) {
//       const hls = new Hls();
//       hls.loadSource(videoUrl);
//       hls.attachMedia(videoRef.current);
//       setHlsInstance(hls);  // <-- Save Hls instance

//       hls.on(Hls.Events.MANIFEST_PARSED, () => {
//         setAudioTracks(hls.audioTracks);
//         if (videoRef.current && videoRef.current.textTracks.length > 0) {
//           videoRef.current.textTracks[activeSub].mode = 'showing';
//         }
//       });

//       hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (_, data) => {
//         console.log('Audio switched to index', data.id);
//       });

//     } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
//       videoRef.current.src = videoUrl;
//     }
//   }, [videoUrl, activeSub]);

//   // Subtitle Switching Logic
//   useEffect(() => {
//     if (!videoRef.current) return;
//     const tr = videoRef.current.textTracks;
//     for (let i = 0; i < tr.length; i++) {
//       tr[i].mode = i === activeSub ? 'showing' : 'disabled';
//     }
//   }, [activeSub]);

//   const switchAudio = (index: number) => {
//     if (hlsInstance) {
//       hlsInstance.audioTrack = index;
//       console.log(`Switched audio to index: ${index}`);
//     }
//   };

//   return (
//     <div className="relative w-full aspect-w-16 aspect-h-9 bg-black">
//       <video
//         ref={videoRef}
//         className="w-full h-full object-contain"
//         poster={thumbnailUrl}
//         controls
//       >
//         {subtitles.map((s, i) => (
//           <track
//             key={i}
//             kind="subtitles"
//             srcLang={s.lang}
//             src={s.url}
//             label={s.label || s.lang}
//             default={i === activeSub}
//           />
//         ))}
        
//       </video>

//       {(audioTracks.length > 1 || subtitles.length > 0) && (
//         <div className="absolute bottom-2 right-2 bg-black/50 text-white text-sm p-2 rounded-md space-y-1">
//           {audioTracks.length > 1 && (
//             <div>
//               Audio:
//               {audioTracks.map((a, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => switchAudio(idx)}
//                   className="ml-2 px-2 py-1 bg-white/10 hover:bg-white/20 rounded"
//                 >
//                   {a.name || a.lang || `Track ${idx + 1}`}
//                 </button>
//               ))}
              
//             </div>
//           )}
//           {subtitles.length > 0 && (
//             <div>
//               Subs:
//               {subtitles.map((s, idx) => (
//                 <button
//                   key={s.lang}
//                   onClick={() => setActiveSub(idx)}
//                   className={`ml-2 px-2 py-1 rounded ${activeSub === idx ? 'bg-white/30' : 'bg-white/10'
//                     }`}
//                 >
//                   {s.label || s.lang}
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default VideoPlayer;


import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface Subtitle {
  lang: string;
  url: string;
  label?: string;
}

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  subtitles?: Subtitle[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  subtitles = [],
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hlsInstance, setHlsInstance] = useState<Hls | null>(null);
  const [audioTracks, setAudioTracks] = useState<Hls.AudioTrack[]>([]);
  const [activeSub, setActiveSub] = useState<number>(0);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls({
        renderTextTracksNatively: false,
      });

      hls.attachMedia(video);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(videoUrl);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setAudioTracks(hls.audioTracks);
        hls.subtitleTrack = 0;
      });

      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (_, data) => {
        setAudioTracks(data.audioTracks);
      });

      hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (_, data) => {
        console.log('Audio switched to index:', data.id);
      });

      hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (_, data) => {
        console.log('Subtitles switched to index:', data.id);
      });

      setHlsInstance(hls);

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
    }
  }, [videoUrl]);

  useEffect(() => {
    if (!videoRef.current) return;
    const tracks = videoRef.current.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].mode = i === activeSub ? 'showing' : 'disabled';
    }
  }, [activeSub]);

  const switchAudio = (index: number) => {
    if (hlsInstance) {
      hlsInstance.audioTrack = index;
    }
  };

  return (
    <div className="relative w-full aspect-w-16 aspect-h-9 bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={thumbnailUrl}
        controls
      >
        {subtitles.map((s, i) => (
          <track
            key={i}
            kind="subtitles"
            srcLang={s.lang}
            src={s.url}
            label={s.label || s.lang}
            default={i === activeSub}
          />
        ))}
      </video>

      {(audioTracks.length > 1 || subtitles.length > 0) && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-sm p-2 rounded-md space-y-1">
          {audioTracks.length > 1 && (
            <div>
              Audio:
              {audioTracks.map((track, idx) => (
                <button
                  key={idx}
                  onClick={() => switchAudio(idx)}
                  className="ml-2 px-2 py-1 bg-white/10 hover:bg-white/20 rounded"
                >
                  {track.name || track.lang || `Track ${idx + 1}`}
                </button>
              ))}
            </div>
          )}
          {subtitles.length > 0 && (
            <div>
              Subs:
              {subtitles.map((sub, idx) => (
                <button
                  key={sub.lang}
                  onClick={() => setActiveSub(idx)}
                  className={`ml-2 px-2 py-1 rounded ${activeSub === idx ? 'bg-white/30' : 'bg-white/10'}`}
                >
                  {sub.label || sub.lang}
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
