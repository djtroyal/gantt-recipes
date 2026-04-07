import type { Recipe } from '../types/recipe';
import type { GanttLayout, BarRect, PhaseDivider } from '../types/gantt';
import { createTimeScale } from './time-scale';
import { computeSpatulaCounts } from './spatula-count';

const LABEL_WIDTH = 160;
const TOP_PADDING = 60; // space for phase headers + spatula count
const ROW_HEIGHT = 36;
const BAR_HEIGHT = 24;
const BAR_PADDING = (ROW_HEIGHT - BAR_HEIGHT) / 2;
const RIGHT_PADDING = 20;
const BOTTOM_PADDING = 65; // space for time axis + 2-row legend

export function computeGanttLayout(
  recipe: Recipe,
  containerWidth: number = 900,
  _servingsMultiplier: number = 1
): GanttLayout {
  const chartWidth = containerWidth - LABEL_WIDTH - RIGHT_PADDING;
  const chartLeft = LABEL_WIDTH;
  const chartTop = TOP_PADDING;
  const chartHeight = recipe.ingredients.length * ROW_HEIGHT;
  const totalHeight = chartTop + chartHeight + BOTTOM_PADDING;
  const totalWidth = containerWidth;

  const timeScale = createTimeScale(recipe.totalTimeMinutes, chartWidth);

  const ingredientPositions = recipe.ingredients.map((ing, i) => ({
    id: ing.id,
    name: ing.name,
    y: chartTop + i * ROW_HEIGHT + ROW_HEIGHT / 2,
    hasPrepDot: (ing.prepDotIds?.length ?? 0) > 0,
  }));

  const bars: BarRect[] = [];
  recipe.ingredients.forEach((ing, rowIndex) => {
    const y = chartTop + rowIndex * ROW_HEIGHT + BAR_PADDING;
    ing.segments.forEach((seg, segIdx) => {
      const scaledStart = seg.startMinute;
      const scaledEnd = seg.endMinute;
      const x = chartLeft + timeScale(scaledStart);
      const width = timeScale(scaledEnd) - timeScale(scaledStart);
      bars.push({
        ingredientId: ing.id,
        segmentIndex: segIdx,
        x,
        y,
        width,
        height: BAR_HEIGHT,
        zone: seg.zone,
        pattern: seg.pattern,
        actions: seg.actions.map((a) => ({
          ...a,
          pixelX: chartLeft + timeScale(a.minuteMark),
        })),
        isCriticalPath: ing.isCriticalPath ?? false,
      });
    });
  });

  const phaseDividers: PhaseDivider[] = recipe.phases.map((phase) => ({
    name: phase.name,
    x: chartLeft + timeScale(phase.startMinute),
    startX: chartLeft + timeScale(phase.startMinute),
    endX: chartLeft + timeScale(phase.endMinute),
  }));

  const spatulaCounts = computeSpatulaCounts(recipe, timeScale, chartLeft);

  return {
    bars,
    phaseDividers,
    ingredientPositions,
    spatulaCounts,
    totalWidth,
    totalHeight,
    chartLeft,
    chartTop,
    chartWidth,
    chartHeight,
    timeScale: (m: number) => chartLeft + timeScale(m),
  };
}

export { ROW_HEIGHT, BAR_HEIGHT, LABEL_WIDTH, TOP_PADDING };
