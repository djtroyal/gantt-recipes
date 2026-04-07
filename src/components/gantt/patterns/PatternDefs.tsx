import { zoneColors } from '../../../lib/color-palette';
import type { HeatZone } from '../../../types/recipe';

const zones: HeatZone[] = ['high', 'medium', 'cool'];

export function PatternDefs() {
  return (
    <defs>
      {zones.map((zone) => {
        const c = zoneColors[zone];
        return (
          <g key={zone}>
            {/* Solid fill */}
            <pattern id={`solid-${zone}`} width="1" height="1">
              <rect width="1" height="1" fill={c.fill} />
            </pattern>

            {/* Hatched = hands off / leave it alone */}
            <pattern
              id={`hatched-${zone}`}
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="8" height="8" fill={c.light} />
              <line x1="0" y1="0" x2="0" y2="8" stroke={c.fill} strokeWidth="3" />
            </pattern>

            {/* Dotted = resting / holding */}
            <pattern
              id={`dotted-${zone}`}
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <rect width="8" height="8" fill={c.light} />
              <circle cx="4" cy="4" r="1.5" fill={c.fill} />
            </pattern>
          </g>
        );
      })}

      {/* Drop shadow for critical path */}
      <filter id="critical-glow">
        <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#dc2626" floodOpacity="0.5" />
      </filter>
    </defs>
  );
}
