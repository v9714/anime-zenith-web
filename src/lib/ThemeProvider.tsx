/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode
} from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "Otaku-theme",
  ...props
}: ThemeProviderProps) {
  // valid themes for validation
  const validThemes: Theme[] = ["dark", "light", "system"];

  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      // validate stored value - must be valid theme
      if (stored && validThemes.includes(stored as Theme)) {
        return stored as Theme;
      }
      // invalid/corrupted data - clear and use default
      if (stored) {
        localStorage.removeItem(storageKey);
      }
      return defaultTheme;
    } catch {
      // localStorage access failed - use default silently
      return defaultTheme;
    }
  });

  useEffect(() => {
    try {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");

      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        root.classList.add(systemTheme);
        return;
      }

      root.classList.add(theme);
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      console.error('Theme application error:', error);
    }
  }, [theme, storageKey]);

  const value = useMemo(() => ({
    theme,
    setTheme: (newTheme: Theme) => {
      try {
        setTheme(newTheme);
      } catch (error) {
        console.error('Theme update error:', error);
      }
    },
  }), [theme]);

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};