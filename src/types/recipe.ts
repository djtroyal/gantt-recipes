export type HeatZone = 'high' | 'medium' | 'cool';

export type BarPattern = 'solid' | 'hatched' | 'dotted';

export type CookActionIcon =
  | 'hands-off'
  | 'flip'
  | 'cover'
  | 'toss'
  | 'steam'
  | 'oil-squirt'
  | 'liquid-squirt';

export type PrepIconType =
  | 'whisk'
  | 'marinate'
  | 'temper'
  | 'slice'
  | 'pat-dry'
  | 'preheat';

export type PrepTiming = 'night-before' | 'day-of' | 'last-30-seconds';

export interface CookAction {
  minuteMark: number;
  icon: CookActionIcon;
  note?: string;
}

export interface BarSegment {
  startMinute: number;
  endMinute: number;
  zone: HeatZone;
  pattern: BarPattern;
  actions: CookAction[];
}

export interface SensoryMarker {
  minuteMark: number;
  text: string;
}

export interface FailureMode {
  condition: string;
  result: string;
}

export interface PrepTask {
  id: string;
  timing: PrepTiming;
  icon: PrepIconType;
  description: string;
  ingredientIds: string[];
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  quantityPerServing?: number;
  unit?: string;
  segments: BarSegment[];
  dependsOn?: string[];
  sensoryMarkers: SensoryMarker[];
  failureModes: FailureMode[];
  isCriticalPath?: boolean;
  prepDotIds?: string[];
}

export interface Phase {
  id: string;
  name: string;
  startMinute: number;
  endMinute: number;
}

export interface GriddlePlacement {
  ingredientId: string;
  zone: HeatZone;
  startMinute: number;
  endMinute: number;
  position?: { x: number; y: number };
}

export interface Recipe {
  id: string;
  slug: string;
  title: string;
  description: string;
  totalTimeMinutes: number;
  defaultServings: number;
  tags: string[];
  phases: Phase[];
  ingredients: Ingredient[];
  prepTasks: PrepTask[];
  griddlePlacements: GriddlePlacement[];
  plateUpStartMinute: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
