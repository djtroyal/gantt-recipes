import { useMemo, useRef } from 'react';
import type { Recipe } from '../../types/recipe';
import { computeGanttLayout } from '../../lib/layout-engine';
import { PatternDefs } from './patterns/PatternDefs';
import { TimeAxis } from './TimeAxis';
import { IngredientAxis } from './IngredientAxis';
import { PhaseOverlay } from './PhaseOverlay';
import { BarSegmentComponent } from './BarSegmentComponent';
import { SpatulaCounter } from './SpatulaCounter';
import { ActionIcon } from './ActionIcon';
import { zoneColors } from '../../lib/color-palette';
import type { CookActionIcon } from '../../types/recipe';

interface GanttChartProps {
  recipe: Recipe;
  width?: number;
  interactive?: boolean;
  cursorMinute?: number | null;
  servingsMultiplier?: number;
}

const actionIconLegend: { icon: CookActionIcon; label: string }[] = [
  { icon: 'flip', label: 'Flip' },
  { icon: 'hands-off', label: 'Hands Off' },
  { icon: 'cover', label: 'Dome' },
  { icon: 'toss', label: 'Toss' },
  { icon: 'steam', label: 'Steam' },
  { icon: 'oil-squirt', label: 'Oil' },
  { icon: 'liquid-squirt', label: 'Liquid' },
];

export function GanttChart({
  recipe,
  width = 900,
  interactive = false,
  cursorMinute = null,
  servingsMultiplier = 1,
}: GanttChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const layout = useMemo(
    () => computeGanttLayout(recipe, width, servingsMultiplier),
    [recipe, width, servingsMultiplier]
  );

  return (
    <svg
      ref={svgRef}
      width={layout.totalWidth}
      height={layout.totalHeight}
      viewBox={`0 0 ${layout.totalWidth} ${layout.totalHeight}`}
      className="gantt-chart"
      style={{ userSelect: 'none' }}
    >
      <PatternDefs />

      {/* Phase overlay */}
      <PhaseOverlay
        phases={layout.phaseDividers}
        chartTop={layout.chartTop}
        chartBottom={layout.chartTop + layout.chartHeight}
      />

      {/* Spatula counter */}
      <SpatulaCounter counts={layout.spatulaCounts} y={layout.chartTop - 16} />

      {/* Time axis */}
      <TimeAxis
        totalMinutes={recipe.totalTimeMinutes}
        timeScale={layout.timeScale}
        y={layout.chartTop + layout.chartHeight}
        chartHeight={layout.chartHeight}
        chartTop={layout.chartTop}
      />

      {/* Ingredient labels */}
      <IngredientAxis
        ingredients={layout.ingredientPositions}
        chartLeft={layout.chartLeft}
      />

      {/* Row backgrounds */}
      {layout.ingredientPositions.map((ing, i) => (
        <rect
          key={ing.id}
          x={layout.chartLeft}
          y={layout.chartTop + i * 36}
          width={layout.chartWidth}
          height={36}
          fill={i % 2 === 0 ? '#fafafa' : '#f5f5f5'}
          opacity={0.5}
        />
      ))}

      {/* Bars */}
      {layout.bars.map((bar) => (
        <BarSegmentComponent
          key={`${bar.ingredientId}-${bar.segmentIndex}`}
          bar={bar}
        />
      ))}

      {/* "You are here" cursor */}
      {interactive && cursorMinute !== null && (
        <g className="cursor-line">
          <line
            x1={layout.timeScale(cursorMinute)}
            y1={layout.chartTop - 10}
            x2={layout.timeScale(cursorMinute)}
            y2={layout.chartTop + layout.chartHeight + 5}
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="4,2"
          />
          <text
            x={layout.timeScale(cursorMinute)}
            y={layout.chartTop - 14}
            textAnchor="middle"
            fontSize={10}
            fontWeight={600}
            fill="#ef4444"
          >
            {cursorMinute.toFixed(1)}m
          </text>
        </g>
      )}

      {/* Plate-up countdown zone */}
      {recipe.plateUpStartMinute < recipe.totalTimeMinutes && (
        <rect
          x={layout.timeScale(recipe.plateUpStartMinute)}
          y={layout.chartTop}
          width={layout.timeScale(recipe.totalTimeMinutes) - layout.timeScale(recipe.plateUpStartMinute)}
          height={layout.chartHeight}
          fill="#fef2f2"
          opacity={0.3}
          rx={2}
        />
      )}

      {/* Legend Row 1: Zones + Don't Touch */}
      <g transform={`translate(${layout.chartLeft}, ${layout.totalHeight - 36})`}>
        {(['high', 'medium', 'cool'] as const).map((zone, i) => (
          <g key={zone} transform={`translate(${i * 110}, 0)`}>
            <rect width={12} height={12} rx={2} fill={zoneColors[zone].fill} />
            <text x={16} y={10} fontSize={10} fill="#6b7280" fontFamily="system-ui, sans-serif">
              {zone === 'high' ? 'High Heat' : zone === 'medium' ? 'Medium Heat' : 'Cool Zone'}
            </text>
          </g>
        ))}
        <g transform="translate(340, 0)">
          <rect width={12} height={12} rx={2} fill="url(#hatched-medium)" stroke="#d97706" strokeWidth={0.5} />
          <text x={16} y={10} fontSize={10} fill="#6b7280" fontFamily="system-ui, sans-serif">
            Don't Touch
          </text>
        </g>
      </g>

      {/* Legend Row 2: Action Icons */}
      <g transform={`translate(${layout.chartLeft}, ${layout.totalHeight - 16})`}>
        {actionIconLegend.map((item, i) => (
          <g key={item.icon} transform={`translate(${i * 95}, 0)`}>
            <ActionIcon icon={item.icon} x={7} y={6} size={12} />
            <text x={16} y={10} fontSize={9} fill="#9ca3af" fontFamily="system-ui, sans-serif">
              {item.label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
