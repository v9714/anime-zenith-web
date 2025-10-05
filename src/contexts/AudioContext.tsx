import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { audioSettingsUtils, AudioSettings } from '@/utils/localStorage';
import { BACKEND_API_BASE_URL } from '@/utils/constants';

interface AudioContextType {
  settings: AudioSettings;
  updateSettings: (newSettings: Partial<AudioSettings>) => void;
  playButtonClick: () => void;
  pauseBackgroundMusic: () => void;
  resumeBackgroundMusic: () => void;
  isBackgroundMusicPlaying: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AudioSettings>(audioSettingsUtils.get());
  const [isBackgroundMusicPlaying, setIsBackgroundMusicPlaying] = useState(false);

  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const buttonClickSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    // Background music
    backgroundMusicRef.current = new Audio(`${BACKEND_API_BASE_URL}/music/ui/theme.mp3`);
    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.volume = settings.backgroundMusicVolume;

    // Button click sound
    buttonClickSoundRef.current = new Audio(`${BACKEND_API_BASE_URL}/music/ui/click.mp3`);
    buttonClickSoundRef.current.volume = settings.buttonClickVolume;

    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current = null;
      }
      if (buttonClickSoundRef.current) {
        buttonClickSoundRef.current = null;
      }
    };
  }, []);

  // Auto-play background music on load if enabled
  useEffect(() => {
    if (settings.backgroundMusic && backgroundMusicRef.current && !isBackgroundMusicPlaying) {
      backgroundMusicRef.current.play().then(() => {
        setIsBackgroundMusicPlaying(true);
      }).catch((error) => {
        console.log('Background music autoplay prevented:', error);
      });
    }
  }, [settings.backgroundMusic]);

  const updateSettings = useCallback((newSettings: Partial<AudioSettings>) => {
    const updated = audioSettingsUtils.update(newSettings);
    setSettings(updated);

    // Handle background music volume
    if (newSettings.backgroundMusicVolume !== undefined && backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = newSettings.backgroundMusicVolume;
    }

    // Handle button click volume
    if (newSettings.buttonClickVolume !== undefined && buttonClickSoundRef.current) {
      buttonClickSoundRef.current.volume = newSettings.buttonClickVolume;
    }

    // Handle background music toggle
    if (newSettings.backgroundMusic !== undefined) {
      if (newSettings.backgroundMusic) {
        backgroundMusicRef.current?.play().then(() => {
          setIsBackgroundMusicPlaying(true);
        }).catch((error) => {
          console.log('Failed to play background music:', error);
        });
      } else {
        backgroundMusicRef.current?.pause();
        setIsBackgroundMusicPlaying(false);
      }
    }
  }, []);

  const playButtonClick = useCallback(() => {
    if (settings.buttonClickSound && buttonClickSoundRef.current) {
      buttonClickSoundRef.current.currentTime = 0;
      buttonClickSoundRef.current.play().catch((error) => {
        console.log('Failed to play button click sound:', error);
      });
    }
  }, [settings.buttonClickSound]);

  const pauseBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current && isBackgroundMusicPlaying) {
      backgroundMusicRef.current.pause();
      setIsBackgroundMusicPlaying(false);
    }
  }, [isBackgroundMusicPlaying]);

  const resumeBackgroundMusic = useCallback(() => {
    if (settings.backgroundMusic && backgroundMusicRef.current && !isBackgroundMusicPlaying) {
      backgroundMusicRef.current.play().then(() => {
        setIsBackgroundMusicPlaying(true);
      }).catch((error) => {
        console.log('Failed to resume background music:', error);
      });
    }
  }, [settings.backgroundMusic, isBackgroundMusicPlaying]);

  return (
    <AudioContext.Provider
      value={{
        settings,
        updateSettings,
        playButtonClick,
        pauseBackgroundMusic,
        resumeBackgroundMusic,
        isBackgroundMusicPlaying,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
