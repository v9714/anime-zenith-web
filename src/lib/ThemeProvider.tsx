
import * as React from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
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

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "Otaku-theme",
  ...props
}: ThemeProviderProps) {
  // Add defensive check for React
  if (!React || !React.useState) {
    console.error('React is not properly loaded');
    return <div>{children}</div>;
  }

  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  
  // Initialize theme from localStorage when component mounts
  React.useEffect(() => {
    const savedTheme = localStorage?.getItem(storageKey) as Theme | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, [storageKey]);

  // Apply theme to document
  React.useEffect(() => {
    const root = window?.document?.documentElement;
    
    if (!root) return;
    
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
  }, [theme]);

  const value = React.useMemo(() => ({
    theme,
    setTheme: (theme: Theme) => {
      localStorage?.setItem(storageKey, theme);
      setThemeState(theme);
    },
  }), [theme, storageKey]);

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);
  
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  
  return context;
};
