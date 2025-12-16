import React from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme, COLOR_THEMES } from '../../contexts/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from './dropdown-menu';
import { Button } from './button';

const ColorThemeSwitcher = () => {
  const { colorTheme, changeColorTheme, isDarkMode } = useTheme();

  // Color preview circles for each theme
  const getThemeColor = (themeKey) => {
    const theme = COLOR_THEMES[themeKey];
    const hslValue = isDarkMode ? theme.dark : theme.light;
    return `hsl(${hslValue})`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-input hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Change color theme"
        >
          <Palette size={18} className="text-primary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-2 glass rounded-xl">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Color Theme
        </div>
        {Object.entries(COLOR_THEMES).map(([key, theme]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => changeColorTheme(key)}
            className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full ring-2 ring-offset-2 ring-offset-background"
                style={{
                  backgroundColor: getThemeColor(key),
                  ringColor: colorTheme === key ? getThemeColor(key) : 'transparent'
                }}
              />
              <span className="text-sm font-medium">{theme.name}</span>
            </div>
            {colorTheme === key && (
              <Check size={16} className="text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ColorThemeSwitcher;
