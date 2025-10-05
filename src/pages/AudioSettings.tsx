import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';
import { toast } from 'sonner';
import { Music, Volume2, Settings } from 'lucide-react';

export default function AudioSettings() {
  const { currentUser } = useAuth();
  const { settings, updateSettings } = useAudio();
  const navigate = useNavigate();
  const [localSettings, setLocalSettings] = useState(settings);

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Sync local state with context
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleToggleBackgroundMusic = (checked: boolean) => {
    setLocalSettings((prev) => ({ ...prev, backgroundMusic: checked }));
    updateSettings({ backgroundMusic: checked });
    toast.success(checked ? '🎵 Background music enabled' : '🔇 Background music disabled', {
      duration: 2000,
    });
  };

  const handleToggleButtonClick = (checked: boolean) => {
    setLocalSettings((prev) => ({ ...prev, buttonClickSound: checked }));
    updateSettings({ buttonClickSound: checked });
    toast.success(checked ? '🔊 Button click sound enabled' : '🔇 Button click sound disabled', {
      duration: 2000,
    });
  };

  if (!currentUser) {
    return null;
  }

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-12 px-4">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-anime-primary to-anime-secondary mb-4">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-anime-primary via-anime-secondary to-anime-accent bg-clip-text text-transparent">
            Audio Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Customize your audio experience
          </p>
        </div>

        {/* Audio Settings Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Volume2 className="w-6 h-6 text-anime-primary" />
              Sound Controls
            </CardTitle>
            <CardDescription>
              Manage background music and sound effects for your experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Background Music Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-background/50 to-accent/5 border border-border/30 hover:border-anime-primary/30 transition-all duration-300 group">
              <div className="flex items-center gap-4 flex-1">
                <div className="p-3 rounded-full bg-anime-primary/10 group-hover:bg-anime-primary/20 transition-colors">
                  <Music className="w-5 h-5 text-anime-primary" />
                </div>
                <div className="flex-1">
                  <Label 
                    htmlFor="background-music" 
                    className="text-base font-semibold cursor-pointer block mb-1"
                  >
                    Background Music
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Ambient music that plays throughout your browsing experience
                  </p>
                </div>
              </div>
              <Switch
                id="background-music"
                checked={localSettings.backgroundMusic}
                onCheckedChange={handleToggleBackgroundMusic}
                className="ml-4"
              />
            </div>

            {/* Button Click Sound Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-background/50 to-accent/5 border border-border/30 hover:border-anime-secondary/30 transition-all duration-300 group">
              <div className="flex items-center gap-4 flex-1">
                <div className="p-3 rounded-full bg-anime-secondary/10 group-hover:bg-anime-secondary/20 transition-colors">
                  <Volume2 className="w-5 h-5 text-anime-secondary" />
                </div>
                <div className="flex-1">
                  <Label 
                    htmlFor="button-click" 
                    className="text-base font-semibold cursor-pointer block mb-1"
                  >
                    Button Click Sound
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Play a sound effect when clicking buttons
                  </p>
                </div>
              </div>
              <Switch
                id="button-click"
                checked={localSettings.buttonClickSound}
                onCheckedChange={handleToggleButtonClick}
                className="ml-4"
              />
            </div>

            {/* Info Note */}
            <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/20">
              <p className="text-sm text-muted-foreground text-center">
                💡 Background music will automatically pause when you start watching anime
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
