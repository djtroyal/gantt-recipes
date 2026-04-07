interface SpatulaCounterProps {
  counts: { minute: number; x: number; count: number }[];
  y: number;
}

export function SpatulaCounter({ counts, y }: SpatulaCounterProps) {
  // Only show counts at whole minutes where count > 0
  const wholeCounts = counts.filter((c) => c.minute === Math.floor(c.minute) && c.count > 0);

  return (
    <g className="spatula-counter">
      {/* Label */}
      <text
        x={wholeCounts[0]?.x ? wholeCounts[0].x - 70 : 0}
        y={y}
        fontSize={9}
        fill="#9ca3af"
        fontFamily="system-ui, sans-serif"
        dominantBaseline="central"
      >
        🥄 Active
      </text>

      {wholeCounts.map((c) => {
        const isHigh = c.count >= 3;
        return (
          <g key={c.minute}>
            <circle
              cx={c.x}
              cy={y}
              r={10}
              fill={isHigh ? '#fef2f2' : '#f9fafb'}
              stroke={isHigh ? '#fca5a5' : '#e5e7eb'}
              strokeWidth={1}
            />
            <text
              x={c.x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fontWeight={isHigh ? 700 : 500}
              fill={isHigh ? '#dc2626' : '#6b7280'}
              fontFamily="system-ui, sans-serif"
            >
              {c.count}
            </text>
          </g>
        );
      })}
    </g>
  );
}
