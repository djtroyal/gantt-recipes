interface TimeAxisProps {
  totalMinutes: number;
  timeScale: (m: number) => number;
  y: number;
  chartHeight: number;
  chartTop: number;
}

export function TimeAxis({ totalMinutes, timeScale, y, chartTop }: TimeAxisProps) {
  const ticks: number[] = [];
  const step = totalMinutes <= 5 ? 0.5 : 1;
  for (let m = 0; m <= totalMinutes; m += step) {
    ticks.push(m);
  }

  return (
    <g className="time-axis">
      {/* Axis line */}
      <line
        x1={timeScale(0)}
        y1={y}
        x2={timeScale(totalMinutes)}
        y2={y}
        stroke="#d1d5db"
        strokeWidth={1}
      />

      {ticks.map((m) => {
        const x = timeScale(m);
        const isWhole = m === Math.floor(m);
        return (
          <g key={m}>
            {/* Grid line */}
            <line
              x1={x}
              y1={chartTop}
              x2={x}
              y2={y}
              stroke={isWhole ? '#e5e7eb' : '#f3f4f6'}
              strokeWidth={isWhole ? 1 : 0.5}
              strokeDasharray={isWhole ? undefined : '2,4'}
            />
            {/* Tick */}
            <line x1={x} y1={y} x2={x} y2={y + 6} stroke="#9ca3af" strokeWidth={1} />
            {/* Label */}
            {isWhole && (
              <text
                x={x}
                y={y + 20}
                textAnchor="middle"
                fontSize={11}
                fill="#6b7280"
                fontFamily="system-ui, sans-serif"
              >
                {m === 0 ? '0:00' : `${m}:00`}
              </text>
            )}
          </g>
        );
      })}

      {/* "min" label */}
      <text
        x={timeScale(totalMinutes) + 8}
        y={y + 20}
        fontSize={10}
        fill="#9ca3af"
        fontFamily="system-ui, sans-serif"
      >
        min
      </text>
    </g>
  );
}
