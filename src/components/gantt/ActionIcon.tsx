import type { CookActionIcon } from '../../types/recipe';

interface ActionIconProps {
  icon: CookActionIcon;
  x: number;
  y: number;
  size?: number;
}

// Inline SVG icons rendered directly in the chart SVG coordinate system
export function ActionIcon({ icon, x, y, size = 14 }: ActionIconProps) {
  const half = size / 2;
  const color = '#1f2937';

  return (
    <g transform={`translate(${x - half}, ${y - half})`} opacity={0.85}>
      <title>{iconLabels[icon]}</title>
      {renderIcon(icon, size, color)}
    </g>
  );
}

const iconLabels: Record<CookActionIcon, string> = {
  'hands-off': 'Hands off — leave it alone',
  flip: 'Flip',
  cover: 'Cover with dome',
  toss: 'Toss / stir',
  steam: 'Steam burst',
  'oil-squirt': 'Add oil',
  'liquid-squirt': 'Add liquid',
};

function renderIcon(icon: CookActionIcon, s: number, c: string) {
  // All icons drawn in a [0, s] × [0, s] box
  switch (icon) {
    case 'flip':
      return (
        <g>
          <path
            d={`M${s * 0.7} ${s * 0.2} l${s * 0.15} ${s * 0.15} l-${s * 0.15} ${s * 0.15}`}
            stroke={c} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round"
          />
          <path
            d={`M${s * 0.15} ${s * 0.5} C${s * 0.15} ${s * 0.15} ${s * 0.85} ${s * 0.15} ${s * 0.85} ${s * 0.35}`}
            stroke={c} strokeWidth={1.5} fill="none" strokeLinecap="round"
          />
        </g>
      );
    case 'hands-off':
      return (
        <g>
          <circle cx={s / 2} cy={s / 2} r={s * 0.38} stroke={c} strokeWidth={1.5} fill="none" />
          <line x1={s * 0.25} y1={s * 0.25} x2={s * 0.75} y2={s * 0.75} stroke={c} strokeWidth={1.5} strokeLinecap="round" />
        </g>
      );
    case 'cover':
      return (
        <g>
          <path
            d={`M${s * 0.15} ${s * 0.7} Q${s * 0.15} ${s * 0.2} ${s / 2} ${s * 0.2} Q${s * 0.85} ${s * 0.2} ${s * 0.85} ${s * 0.7}`}
            stroke={c} strokeWidth={1.5} fill="none" strokeLinecap="round"
          />
          <line x1={s * 0.1} y1={s * 0.75} x2={s * 0.9} y2={s * 0.75} stroke={c} strokeWidth={1.5} strokeLinecap="round" />
          <circle cx={s / 2} cy={s * 0.18} r={s * 0.06} fill={c} />
        </g>
      );
    case 'toss':
      return (
        <g>
          <path
            d={`M${s * 0.2} ${s * 0.8} Q${s * 0.4} ${s * 0.3} ${s * 0.8} ${s * 0.2}`}
            stroke={c} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeDasharray="2,2"
          />
          <circle cx={s * 0.65} cy={s * 0.35} r={s * 0.06} fill={c} />
          <circle cx={s * 0.8} cy={s * 0.22} r={s * 0.05} fill={c} />
        </g>
      );
    case 'steam':
      return (
        <g>
          <path d={`M${s * 0.3} ${s * 0.8} c0-${s * 0.15} ${s * 0.1}-${s * 0.15} ${s * 0.1}-${s * 0.3} s-${s * 0.1}-${s * 0.15}-${s * 0.1}-${s * 0.3}`} stroke={c} strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <path d={`M${s * 0.5} ${s * 0.8} c0-${s * 0.15} ${s * 0.1}-${s * 0.15} ${s * 0.1}-${s * 0.3} s-${s * 0.1}-${s * 0.15}-${s * 0.1}-${s * 0.3}`} stroke={c} strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <path d={`M${s * 0.7} ${s * 0.8} c0-${s * 0.15} ${s * 0.1}-${s * 0.15} ${s * 0.1}-${s * 0.3} s-${s * 0.1}-${s * 0.15}-${s * 0.1}-${s * 0.3}`} stroke={c} strokeWidth={1.2} fill="none" strokeLinecap="round" />
        </g>
      );
    case 'oil-squirt':
      return (
        <g>
          <path
            d={`M${s / 2} ${s * 0.15} L${s * 0.65} ${s * 0.5} A${s * 0.2} ${s * 0.2} 0 1 1 ${s * 0.35} ${s * 0.5} Z`}
            stroke={c} strokeWidth={1.2} fill={c} fillOpacity={0.2}
          />
        </g>
      );
    case 'liquid-squirt':
      return (
        <g>
          <path
            d={`M${s / 2} ${s * 0.15} L${s * 0.65} ${s * 0.5} A${s * 0.2} ${s * 0.2} 0 1 1 ${s * 0.35} ${s * 0.5} Z`}
            stroke={c} strokeWidth={1.2} fill={c} fillOpacity={0.15}
          />
          <line x1={s / 2} y1={s * 0.7} x2={s * 0.45} y2={s * 0.85} stroke={c} strokeWidth={1} strokeLinecap="round" />
          <line x1={s / 2} y1={s * 0.7} x2={s * 0.55} y2={s * 0.85} stroke={c} strokeWidth={1} strokeLinecap="round" />
        </g>
      );
  }
}
