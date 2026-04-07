import type { PhaseDivider } from '../../types/gantt';

interface PhaseOverlayProps {
  phases: PhaseDivider[];
  chartTop: number;
  chartBottom: number;
}

export function PhaseOverlay({ phases, chartBottom }: PhaseOverlayProps) {
  return (
    <g className="phase-overlay">
      {phases.map((phase, i) => (
        <g key={phase.name}>
          {/* Phase header */}
          <text
            x={(phase.startX + phase.endX) / 2}
            y={14}
            textAnchor="middle"
            fontSize={10}
            fontWeight={600}
            fill="#6b7280"
            fontFamily="system-ui, sans-serif"
            style={{ textTransform: 'uppercase', letterSpacing: 1 }}
          >
            {phase.name}
          </text>

          {/* Divider line at start (skip first) */}
          {i > 0 && (
            <line
              x1={phase.startX}
              y1={22}
              x2={phase.startX}
              y2={chartBottom}
              stroke="#d1d5db"
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          )}
        </g>
      ))}
    </g>
  );
}
