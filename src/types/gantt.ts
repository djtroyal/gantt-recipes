import type { HeatZone, BarPattern, CookAction } from './recipe';

export interface BarRect {
  ingredientId: string;
  segmentIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  zone: HeatZone;
  pattern: BarPattern;
  actions: (CookAction & { pixelX: number })[];
  isCriticalPath: boolean;
}

export interface PhaseDivider {
  name: string;
  x: number;
  startX: number;
  endX: number;
}

export interface GanttLayout {
  bars: BarRect[];
  phaseDividers: PhaseDivider[];
  ingredientPositions: { id: string; name: string; y: number; hasPrepDot: boolean }[];
  spatulaCounts: { minute: number; x: number; count: number }[];
  totalWidth: number;
  totalHeight: number;
  chartLeft: number;
  chartTop: number;
  chartWidth: number;
  chartHeight: number;
  timeScale: (minute: number) => number;
}
