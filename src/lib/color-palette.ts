import type { HeatZone } from '../types/recipe';

export const zoneColors: Record<HeatZone, { fill: string; light: string; stroke: string; print: string }> = {
  high: { fill: '#f87171', light: '#fecaca', stroke: '#dc2626', print: '#555' },
  medium: { fill: '#fbbf24', light: '#fde68a', stroke: '#d97706', print: '#999' },
  cool: { fill: '#60a5fa', light: '#bfdbfe', stroke: '#2563eb', print: '#ccc' },
};

export const zoneLabels: Record<HeatZone, string> = {
  high: 'High Heat',
  medium: 'Medium Heat',
  cool: 'Cool Zone',
};
