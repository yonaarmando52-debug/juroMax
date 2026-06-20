import { ThemeMode, ThemeScheme } from './types';

export interface ThemePalette {
  bg: string;
  card: string;
  cardHeader: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;      // background primary (e.g. navy or charcoal)
  accent: string;       // gold or green
  accentHover: string;
  accentLight: string;  // for sub-badges/bg highlights
  border: string;
  accentBorder: string;
  gradientBg: string;
  inputBg: string;
  inputText: string;
  shadow: string;
}

export function getThemePalette(mode: ThemeMode, scheme: ThemeScheme): ThemePalette {
  const isDark = mode === 'dark';

  if (scheme === 'gold') {
    // Option 1: Azul escuro, Dourado, Branco
    if (isDark) {
      return {
        bg: 'bg-[#0B132B] text-slate-100',
        card: 'bg-[#1C2541] border-[#2A3454]',
        cardHeader: 'bg-[#212B4C]',
        textPrimary: 'text-white',
        textSecondary: 'text-slate-300',
        textMuted: 'text-slate-400',
        primary: 'bg-[#0B132B]',
        accent: 'text-amber-400 bg-amber-400',
        accentHover: 'hover:bg-amber-500 hover:text-slate-950',
        accentLight: 'bg-amber-500/10 text-amber-400',
        border: 'border-[#2D3A64]',
        accentBorder: 'border-amber-400/50',
        gradientBg: 'from-[#1C2541] to-[#0B132B]',
        inputBg: 'bg-[#151D35]',
        inputText: 'text-white placeholder-slate-500',
        shadow: 'shadow-[0_4px_20px_rgba(0,0,0,0.4)]',
      };
    } else {
      return {
        bg: 'bg-[#F4F6FA] text-slate-800',
        card: 'bg-white border-slate-200/80',
        cardHeader: 'bg-slate-50',
        textPrimary: 'text-slate-900',
        textSecondary: 'text-slate-600',
        textMuted: 'text-slate-400',
        primary: 'bg-white',
        accent: 'text-amber-600 bg-amber-500',
        accentHover: 'hover:bg-amber-600 hover:text-white',
        accentLight: 'bg-amber-100 text-amber-800',
        border: 'border-slate-100',
        accentBorder: 'border-amber-500/30',
        gradientBg: 'from-slate-50 to-slate-100',
        inputBg: 'bg-slate-50',
        inputText: 'text-slate-900 placeholder-slate-400',
        shadow: 'shadow-[0_4px_15px_rgba(0,0,0,0.05)]',
      };
    }
  } else {
    // Option 2: Preto, Verde financeiro, Branco
    if (isDark) {
      return {
        bg: 'bg-[#09090B] text-zinc-100',
        card: 'bg-[#18181B] border-zinc-800',
        cardHeader: 'bg-[#202023]',
        textPrimary: 'text-white',
        textSecondary: 'text-zinc-300',
        textMuted: 'text-zinc-500',
        primary: 'bg-[#09090B]',
        accent: 'text-emerald-400 bg-emerald-500',
        accentHover: 'hover:bg-emerald-600 hover:text-white',
        accentLight: 'bg-emerald-500/10 text-emerald-400',
        border: 'border-zinc-800',
        accentBorder: 'border-emerald-500/50',
        gradientBg: 'from-[#18181B] to-[#09090B]',
        inputBg: 'bg-[#1F1F23]',
        inputText: 'text-zinc-100 placeholder-zinc-600',
        shadow: 'shadow-[0_4px_20px_rgba(0,0,0,0.6)]',
      };
    } else {
      return {
        bg: 'bg-[#F9F9FB] text-zinc-800',
        card: 'bg-white border-zinc-200/80',
        cardHeader: 'bg-zinc-50',
        textPrimary: 'text-zinc-900',
        textSecondary: 'text-zinc-600',
        textMuted: 'text-zinc-400',
        primary: 'bg-white',
        accent: 'text-emerald-600 bg-emerald-600',
        accentHover: 'hover:bg-emerald-700 hover:text-white',
        accentLight: 'bg-emerald-50 text-emerald-700',
        border: 'border-zinc-100',
        accentBorder: 'border-emerald-600/30',
        gradientBg: 'from-zinc-50 to-zinc-100',
        inputBg: 'bg-zinc-50',
        inputText: 'text-zinc-900 placeholder-zinc-400',
        shadow: 'shadow-[0_4px_15px_rgba(0,0,0,0.04)]',
      };
    }
  }
}
