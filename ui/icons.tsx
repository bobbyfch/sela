import React from 'react';
import {
  BookOpen,
  ChartNoAxesCombined,
  Compass,
  House,
  Settings2,
  type LucideIcon,
} from 'lucide-react';

export type TabName = 'home' | 'library' | 'browse' | 'progress' | 'settings';

const tabIcons: Record<TabName, LucideIcon> = {
  home: House,
  library: BookOpen,
  browse: Compass,
  progress: ChartNoAxesCombined,
  settings: Settings2,
};

/** Quiet outline icons keep the five primary destinations easy to scan. */
export function TabIcon({ name }: { name: TabName }) {
  const Icon = tabIcons[name];
  return (
    <Icon
      aria-hidden="true"
      className="tab-navigation-icon"
      focusable="false"
      size={21}
      strokeWidth={1.8}
    />
  );
}
