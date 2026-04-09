import { useMemo, useRef, useState, useCallback } from 'react';
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

interface EditableGanttChartProps {
  recipe: Recipe;
  width?: number;
  onSegmentUpdate: (ingredientId: string, segmentIndex: number, updates: { startMinute?: number; endMinute?: number }) => void;
}

interface DragState {
  ingredientId: string;
  segmentIndex: number;
  type: 'move' | 'resize-start' | 'resize-end';
  startX: number;
  origStart: number;
  origEnd: number;
}

const HANDLE_WIDTH = 6;
const SNAP = 0.25; // snap to quarter-minutes

function snapTo(value: number, step: number): number {
  return Math.round(value / step) * step;
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

export function EditableGanttChart({
  recipe,
  width = 900,
  onSegmentUpdate,
}: EditableGanttChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [preview, setPreview] = useState<{ ingredientId: string; segmentIndex: number; startMinute: number; endMinute: number } | null>(null);

  const layout = useMemo(
    () => computeGanttLayout(recipe, width, 1),
    [recipe, width]
  );

  const pixelsPerMinute = layout.chartWidth / recipe.totalTimeMinutes;

  const pixelToMinute = useCallback(
    (deltaPixels: number) => deltaPixels / pixelsPerMinute,
    [pixelsPerMinute]
  );

  const getSvgX = useCallback((clientX: number) => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    return clientX - rect.left;
  }, []);

  const handlePointerDown = useCallback((
    e: React.PointerEvent,
    ingredientId: string,
    segmentIndex: number,
    type: DragState['type'],
    origStart: number,
    origEnd: number,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as SVGElement).setPointerCapture(e.pointerId);
    setDrag({
      ingredientId,
      segmentIndex,
      type,
      startX: getSvgX(e.clientX),
      origStart,
      origEnd,
    });
    setPreview({ ingredientId, segmentIndex, startMinute: origStart, endMinute: origEnd });
  }, [getSvgX]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag) return;
    const currentX = getSvgX(e.clientX);
    const deltaMinutes = pixelToMinute(currentX - drag.startX);

    let newStart = drag.origStart;
    let newEnd = drag.origEnd;

    if (drag.type === 'move') {
      const duration = drag.origEnd - drag.origStart;
      newStart = snapTo(Math.max(0, drag.origStart + deltaMinutes), SNAP);
      newEnd = newStart + duration;
      if (newEnd > recipe.totalTimeMinutes) {
        newEnd = recipe.totalTimeMinutes;
        newStart = newEnd - duration;
      }
    } else if (drag.type === 'resize-start') {
      newStart = snapTo(Math.max(0, Math.min(drag.origEnd - SNAP, drag.origStart + deltaMinutes)), SNAP);
      newEnd = drag.origEnd;
    } else if (drag.type === 'resize-end') {
      newStart = drag.origStart;
      newEnd = snapTo(Math.max(drag.origStart + SNAP, Math.min(recipe.totalTimeMinutes, drag.origEnd + deltaMinutes)), SNAP);
    }

    setPreview({ ingredientId: drag.ingredientId, segmentIndex: drag.segmentIndex, startMinute: newStart, endMinute: newEnd });
  }, [drag, getSvgX, pixelToMinute, recipe.totalTimeMinutes]);

  const handlePointerUp = useCallback(() => {
    if (!drag || !preview) {
      setDrag(null);
      setPreview(null);
      return;
    }
    // Commit the change
    onSegmentUpdate(drag.ingredientId, drag.segmentIndex, {
      startMinute: preview.startMinute,
      endMinute: preview.endMinute,
    });
    setDrag(null);
    setPreview(null);
  }, [drag, preview, onSegmentUpdate]);

  // Build bars with optional preview override
  const displayBars = useMemo(() => {
    if (!preview) return layout.bars;
    return layout.bars.map((bar) => {
      if (bar.ingredientId === preview.ingredientId && bar.segmentIndex === preview.segmentIndex) {
        const x = layout.chartLeft + (preview.startMinute / recipe.totalTimeMinutes) * layout.chartWidth;
        const w = ((preview.endMinute - preview.startMinute) / recipe.totalTimeMinutes) * layout.chartWidth;
        return { ...bar, x, width: w };
      }
      return bar;
    });
  }, [layout, preview, recipe.totalTimeMinutes]);

  return (
    <svg
      ref={svgRef}
      width={layout.totalWidth}
      height={layout.totalHeight}
      viewBox={`0 0 ${layout.totalWidth} ${layout.totalHeight}`}
      className="gantt-chart"
      style={{ userSelect: 'none' }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
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
      {displayBars.map((bar) => (
        <BarSegmentComponent
          key={`${bar.ingredientId}-${bar.segmentIndex}`}
          bar={bar}
        />
      ))}

      {/* Invisible drag handles on top of each bar */}
      {displayBars.map((bar) => {
        const seg = recipe.ingredients
          .find((i) => i.id === bar.ingredientId)
          ?.segments[bar.segmentIndex];
        if (!seg) return null;

        const isActive = drag?.ingredientId === bar.ingredientId && drag?.segmentIndex === bar.segmentIndex;
        const origStart = preview && preview.ingredientId === bar.ingredientId && preview.segmentIndex === bar.segmentIndex
          ? preview.startMinute : seg.startMinute;
        const origEnd = preview && preview.ingredientId === bar.ingredientId && preview.segmentIndex === bar.segmentIndex
          ? preview.endMinute : seg.endMinute;

        return (
          <g key={`handle-${bar.ingredientId}-${bar.segmentIndex}`}>
            {/* Active highlight */}
            {isActive && (
              <rect
                x={bar.x - 1}
                y={bar.y - 1}
                width={bar.width + 2}
                height={bar.height + 2}
                fill="none"
                stroke="#3b82f6"
                strokeWidth={2}
                rx={4}
                ry={4}
              />
            )}

            {/* Full bar area — move handle */}
            <rect
              x={bar.x + HANDLE_WIDTH}
              y={bar.y}
              width={Math.max(0, bar.width - HANDLE_WIDTH * 2)}
              height={bar.height}
              fill="transparent"
              style={{ cursor: drag ? 'grabbing' : 'grab' }}
              onPointerDown={(e) => handlePointerDown(e, bar.ingredientId, bar.segmentIndex, 'move', seg.startMinute, seg.endMinute)}
            />

            {/* Left edge — resize start */}
            <rect
              x={bar.x}
              y={bar.y}
              width={HANDLE_WIDTH}
              height={bar.height}
              fill="transparent"
              style={{ cursor: 'ew-resize' }}
              onPointerDown={(e) => handlePointerDown(e, bar.ingredientId, bar.segmentIndex, 'resize-start', seg.startMinute, seg.endMinute)}
            />

            {/* Right edge — resize end */}
            <rect
              x={bar.x + bar.width - HANDLE_WIDTH}
              y={bar.y}
              width={HANDLE_WIDTH}
              height={bar.height}
              fill="transparent"
              style={{ cursor: 'ew-resize' }}
              onPointerDown={(e) => handlePointerDown(e, bar.ingredientId, bar.segmentIndex, 'resize-end', seg.startMinute, seg.endMinute)}
            />

            {/* Time tooltip during drag */}
            {isActive && preview && (
              <g>
                <rect
                  x={bar.x + bar.width / 2 - 32}
                  y={bar.y - 20}
                  width={64}
                  height={16}
                  rx={3}
                  fill="#1f2937"
                  opacity={0.9}
                />
                <text
                  x={bar.x + bar.width / 2}
                  y={bar.y - 10}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={600}
                  fill="#ffffff"
                  fontFamily="system-ui, sans-serif"
                >
                  {origStart.toFixed(1)}–{origEnd.toFixed(1)}m
                </text>
              </g>
            )}
          </g>
        );
      })}

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
