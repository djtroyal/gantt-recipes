import { useMemo, useState, useRef, useCallback } from 'react';
import type { Recipe } from '../../types/recipe';
import type { BarRect } from '../../types/gantt';
import { computeGanttLayout } from '../../lib/layout-engine';
import { PatternDefs } from './patterns/PatternDefs';
import { TimeAxis } from './TimeAxis';
import { IngredientAxis } from './IngredientAxis';
import { PhaseOverlay } from './PhaseOverlay';
import { BarSegmentComponent } from './BarSegmentComponent';
import { SpatulaCounter } from './SpatulaCounter';
import { ConnectorLines } from './ConnectorLine';
import { zoneColors } from '../../lib/color-palette';

interface GanttChartProps {
  recipe: Recipe;
  width?: number;
  interactive?: boolean;
  cursorMinute?: number | null;
  onCursorChange?: (minute: number | null) => void;
  servingsMultiplier?: number;
}

export function GanttChart({
  recipe,
  width = 900,
  interactive = false,
  cursorMinute = null,
  onCursorChange,
  servingsMultiplier = 1,
}: GanttChartProps) {
  const [hoveredBar, setHoveredBar] = useState<BarRect | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const layout = useMemo(
    () => computeGanttLayout(recipe, width, servingsMultiplier),
    [recipe, width, servingsMultiplier]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!interactive || !onCursorChange || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const svgX = e.clientX - rect.left;
      const minute =
        ((svgX - layout.chartLeft) / layout.chartWidth) * recipe.totalTimeMinutes;
      if (minute >= 0 && minute <= recipe.totalTimeMinutes) {
        onCursorChange(minute);
      }
    },
    [interactive, onCursorChange, layout, recipe.totalTimeMinutes]
  );

  const handleMouseLeave = useCallback(() => {
    if (interactive && onCursorChange) onCursorChange(null);
  }, [interactive, onCursorChange]);

  return (
    <svg
      ref={svgRef}
      width={layout.totalWidth}
      height={layout.totalHeight}
      viewBox={`0 0 ${layout.totalWidth} ${layout.totalHeight}`}
      className="gantt-chart"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
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
          onHover={setHoveredBar}
        />
      ))}

      {/* Connector lines (dependencies) */}
      <ConnectorLines recipe={recipe} layout={layout} />

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

      {/* Hovered bar tooltip */}
      {hoveredBar && (
        <g className="tooltip">
          {(() => {
            const ing = recipe.ingredients.find((i) => i.id === hoveredBar.ingredientId);
            if (!ing) return null;
            const seg = ing.segments[hoveredBar.segmentIndex];
            const failureModes = ing.failureModes;
            const sensory = ing.sensoryMarkers.filter(
              (s) => s.minuteMark >= seg.startMinute && s.minuteMark <= seg.endMinute
            );
            const tipX = hoveredBar.x + hoveredBar.width / 2;
            const tipY = hoveredBar.y - 8;
            const lines: string[] = [
              `${ing.name} — ${seg.zone} zone`,
              `${seg.startMinute}–${seg.endMinute} min`,
            ];
            sensory.forEach((s) => lines.push(`${s.text}`));
            failureModes.forEach((f) => lines.push(`${f.condition}: ${f.result}`));

            return (
              <g>
                <rect
                  x={tipX - 80}
                  y={tipY - lines.length * 14 - 6}
                  width={160}
                  height={lines.length * 14 + 8}
                  fill="white"
                  stroke="#e5e7eb"
                  strokeWidth={1}
                  rx={4}
                  filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
                />
                {lines.map((line, i) => (
                  <text
                    key={i}
                    x={tipX}
                    y={tipY - (lines.length - i - 1) * 14 - 4}
                    textAnchor="middle"
                    fontSize={10}
                    fill={i === 0 ? '#374151' : '#6b7280'}
                    fontWeight={i === 0 ? 600 : 400}
                    fontFamily="system-ui, sans-serif"
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })()}
        </g>
      )}

      {/* Zone legend */}
      <g transform={`translate(${layout.chartLeft}, ${layout.totalHeight - 14})`}>
        {(['high', 'medium', 'cool'] as const).map((zone, i) => (
          <g key={zone} transform={`translate(${i * 110}, 0)`}>
            <rect width={12} height={12} rx={2} fill={zoneColors[zone].fill} />
            <text x={16} y={10} fontSize={10} fill="#6b7280" fontFamily="system-ui, sans-serif">
              {zone === 'high' ? 'High Heat' : zone === 'medium' ? 'Medium Heat' : 'Cool Zone'}
            </text>
          </g>
        ))}
        {/* Pattern legend */}
        <g transform={`translate(340, 0)`}>
          <rect width={12} height={12} rx={2} fill="#9ca3af" />
          <text x={16} y={10} fontSize={10} fill="#6b7280">Solid = Active</text>
        </g>
        <g transform={`translate(440, 0)`}>
          <rect width={12} height={12} rx={2} fill="url(#hatched-medium)" stroke="#d97706" strokeWidth={0.5} />
          <text x={16} y={10} fontSize={10} fill="#6b7280">Hatched = Hands Off</text>
        </g>
        <g transform={`translate(570, 0)`}>
          <rect width={12} height={12} rx={2} fill="url(#dotted-cool)" stroke="#2563eb" strokeWidth={0.5} />
          <text x={16} y={10} fontSize={10} fill="#6b7280">Dotted = Resting</text>
        </g>
      </g>
    </svg>
  );
}
