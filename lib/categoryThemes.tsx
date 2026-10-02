import React from "react";
import {
  Atom,
  Globe,
  Landmark,
  Cpu,
  Film,
  Lightbulb,
} from "lucide-react";

export interface CategoryTheme {
  nameEn: string;
  nameAl: string;
  emoji: string;
  icon: React.ElementType;
  badgeStyle: string;
  borderNormal: string;
  borderUrgent: string;
  gradientBg: string;
  glowClass: string;
  watermarkColor: string;
  renderWatermark: () => React.ReactNode;
}

export const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  Science: {
    nameEn: "Science",
    nameAl: "Shkencë",
    emoji: "🧪",
    icon: Atom,
    badgeStyle: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    borderNormal: "border-emerald-500/30 dark:border-emerald-500/40 hover:border-emerald-500/50",
    borderUrgent: "border-red-500/80 ring-2 ring-red-500/40 animate-pulse",
    gradientBg: "bg-gradient-to-br from-emerald-500/[0.08] via-teal-500/[0.04] to-cyan-500/[0.08]",
    glowClass: "from-emerald-500/25 via-teal-500/15 to-transparent",
    watermarkColor: "text-emerald-600/10 dark:text-emerald-400/15",
    renderWatermark: () => (
      <svg viewBox="0 0 200 200" className="w-80 h-80 sm:w-96 sm:h-96 stroke-current fill-none">
        <circle cx="100" cy="100" r="14" fill="currentColor" opacity="0.3" />
        <ellipse cx="100" cy="100" rx="82" ry="30" strokeWidth="2.5" transform="rotate(0 100 100)" />
        <ellipse cx="100" cy="100" rx="82" ry="30" strokeWidth="2.5" transform="rotate(60 100 100)" />
        <ellipse cx="100" cy="100" rx="82" ry="30" strokeWidth="2.5" transform="rotate(120 100 100)" />
      </svg>
    ),
  },
  Geography: {
    nameEn: "Geography",
    nameAl: "Gjeografi",
    emoji: "🌍",
    icon: Globe,
    badgeStyle: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
    borderNormal: "border-sky-500/30 dark:border-sky-500/40 hover:border-sky-500/50",
    borderUrgent: "border-red-500/80 ring-2 ring-red-500/40 animate-pulse",
    gradientBg: "bg-gradient-to-br from-sky-500/[0.08] via-blue-500/[0.04] to-emerald-500/[0.08]",
    glowClass: "from-sky-500/25 via-blue-500/15 to-transparent",
    watermarkColor: "text-sky-600/10 dark:text-sky-400/15",
    renderWatermark: () => (
      <svg viewBox="0 0 200 200" className="w-80 h-80 sm:w-96 sm:h-96 stroke-current fill-none">
        <circle cx="100" cy="100" r="82" strokeWidth="2.5" />
        <ellipse cx="100" cy="100" rx="82" ry="42" strokeWidth="2" />
        <ellipse cx="100" cy="100" rx="42" ry="82" strokeWidth="2" />
        <line x1="18" y1="100" x2="182" y2="100" strokeWidth="2" />
        <line x1="100" y1="18" x2="100" y2="182" strokeWidth="2" />
      </svg>
    ),
  },
  History: {
    nameEn: "History",
    nameAl: "Histori",
    emoji: "🏛️",
    icon: Landmark,
    badgeStyle: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
    borderNormal: "border-amber-500/30 dark:border-amber-500/40 hover:border-amber-500/50",
    borderUrgent: "border-red-500/80 ring-2 ring-red-500/40 animate-pulse",
    gradientBg: "bg-gradient-to-br from-amber-500/[0.09] via-orange-500/[0.05] to-amber-700/[0.08]",
    glowClass: "from-amber-500/25 via-orange-500/15 to-transparent",
    watermarkColor: "text-amber-600/10 dark:text-amber-400/15",
    renderWatermark: () => (
      <svg viewBox="0 0 200 200" className="w-80 h-80 sm:w-96 sm:h-96 stroke-current fill-none">
        <polygon points="100,30 22,68 178,68" strokeWidth="2.5" />
        <rect x="26" y="70" width="148" height="10" strokeWidth="2" />
        <line x1="40" y1="82" x2="40" y2="155" strokeWidth="4" />
        <line x1="70" y1="82" x2="70" y2="155" strokeWidth="4" />
        <line x1="100" y1="82" x2="100" y2="155" strokeWidth="4" />
        <line x1="130" y1="82" x2="130" y2="155" strokeWidth="4" />
        <line x1="160" y1="82" x2="160" y2="155" strokeWidth="4" />
        <rect x="18" y="157" width="164" height="14" strokeWidth="2.5" />
      </svg>
    ),
  },
  Technology: {
    nameEn: "Technology",
    nameAl: "Teknologji",
    emoji: "⚡",
    icon: Cpu,
    badgeStyle: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
    borderNormal: "border-purple-500/30 dark:border-purple-500/40 hover:border-purple-500/50",
    borderUrgent: "border-red-500/80 ring-2 ring-red-500/40 animate-pulse",
    gradientBg: "bg-gradient-to-br from-purple-500/[0.09] via-violet-500/[0.05] to-blue-500/[0.08]",
    glowClass: "from-purple-500/25 via-violet-500/15 to-transparent",
    watermarkColor: "text-purple-600/10 dark:text-purple-400/15",
    renderWatermark: () => (
      <svg viewBox="0 0 200 200" className="w-80 h-80 sm:w-96 sm:h-96 stroke-current fill-none">
        <rect x="65" y="65" width="70" height="70" rx="10" strokeWidth="2.5" />
        <path d="M65,80 L22,80 M65,100 L18,100 M65,120 L26,120 M135,80 L178,80 M135,100 L182,100 M135,120 L174,120 M80,65 L80,22 M100,65 L100,18 M120,65 L120,26 M80,135 L80,178 M100,135 L100,182 M120,135 L120,174" strokeWidth="2" />
        <circle cx="22" cy="80" r="3.5" fill="currentColor" />
        <circle cx="178" cy="80" r="3.5" fill="currentColor" />
        <circle cx="80" cy="22" r="3.5" fill="currentColor" />
        <circle cx="120" cy="174" r="3.5" fill="currentColor" />
      </svg>
    ),
  },
  "Pop Culture": {
    nameEn: "Pop Culture",
    nameAl: "Kulturë Pop",
    emoji: "🎬",
    icon: Film,
    badgeStyle: "bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/30",
    borderNormal: "border-pink-500/30 dark:border-pink-500/40 hover:border-pink-500/50",
    borderUrgent: "border-red-500/80 ring-2 ring-red-500/40 animate-pulse",
    gradientBg: "bg-gradient-to-br from-pink-500/[0.09] via-rose-500/[0.05] to-amber-500/[0.08]",
    glowClass: "from-pink-500/25 via-rose-500/15 to-transparent",
    watermarkColor: "text-pink-600/10 dark:text-pink-400/15",
    renderWatermark: () => (
      <svg viewBox="0 0 200 200" className="w-80 h-80 sm:w-96 sm:h-96 stroke-current fill-none">
        <path d="M100,18 L122,68 L176,74 L136,112 L148,166 L100,138 L52,166 L64,112 L24,74 L78,68 Z" strokeWidth="2.5" />
        <circle cx="100" cy="100" r="28" strokeWidth="2" strokeDasharray="6 4" />
      </svg>
    ),
  },
  General: {
    nameEn: "General",
    nameAl: "Të Përgjithshme",
    emoji: "💡",
    icon: Lightbulb,
    badgeStyle: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
    borderNormal: "border-blue-500/30 dark:border-blue-500/40 hover:border-blue-500/50",
    borderUrgent: "border-red-500/80 ring-2 ring-red-500/40 animate-pulse",
    gradientBg: "bg-gradient-to-br from-blue-500/[0.09] via-indigo-500/[0.05] to-cyan-500/[0.08]",
    glowClass: "from-blue-500/25 via-indigo-500/15 to-transparent",
    watermarkColor: "text-blue-600/10 dark:text-blue-400/15",
    renderWatermark: () => (
      <svg viewBox="0 0 200 200" className="w-80 h-80 sm:w-96 sm:h-96 stroke-current fill-none">
        <path d="M100,32 C68,32 54,60 54,84 C54,106 78,122 78,142 L122,142 C122,122 146,106 146,84 C146,60 132,32 100,32 Z" strokeWidth="2" />
        <line x1="86" y1="152" x2="114" y2="152" strokeWidth="3" />
        <line x1="90" y1="162" x2="110" y2="162" strokeWidth="3" />
        <line x1="100" y1="18" x2="100" y2="8" strokeWidth="2" />
        <line x1="142" y1="36" x2="152" y2="26" strokeWidth="2" />
        <line x1="58" y1="36" x2="48" y2="26" strokeWidth="2" />
      </svg>
    ),
  },
};

export function getCategoryTheme(category?: string): CategoryTheme {
  if (!category) return CATEGORY_THEMES.General;
  const key = Object.keys(CATEGORY_THEMES).find(
    (k) => k.toLowerCase() === category.toLowerCase()
  );
  return key ? CATEGORY_THEMES[key] : CATEGORY_THEMES.General;
}
