import type { BarRect } from '../../types/gantt';
import { zoneColors } from '../../lib/color-palette';
import { ActionIcon } from './ActionIcon';

interface BarSegmentProps {
  bar: BarRect;
  onHover?: (bar: BarRect | null) => void;
}

export function BarSegmentComponent({ bar, onHover }: BarSegmentProps) {
  const patternId = `${bar.pattern}-${bar.zone}`;
  const c = zoneColors[bar.zone];

  return (
    <g
      className="bar-segment"
      onMouseEnter={() => onHover?.(bar)}
      onMouseLeave={() => onHover?.(null)}
    >
      <rect
        x={bar.x}
        y={bar.y}
        width={Math.max(bar.width, 1)}
        height={bar.height}
        fill={`url(#${patternId})`}
        stroke={c.stroke}
        strokeWidth={bar.isCriticalPath ? 2.5 : 1}
        rx={3}
        ry={3}
        filter={bar.isCriticalPath ? 'url(#critical-glow)' : undefined}
      />

      {/* Action icons on the bar */}
      {bar.actions.map((action, i) => (
        <ActionIcon
          key={i}
          icon={action.icon}
          x={action.pixelX}
          y={bar.y + bar.height / 2}
          size={14}
        />
      ))}
    </g>
  );
}
