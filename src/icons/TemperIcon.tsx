interface IconProps { size?: number; color?: string }

export function TemperIcon({ size = 16, color = '#374151' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="10" y="3" width="4" height="14" rx="2" stroke={color} strokeWidth={2} />
      <circle cx="12" cy="19" r="3" stroke={color} strokeWidth={2} />
      <circle cx="12" cy="19" r="1.5" fill={color} />
      <rect x="11" y="10" width="2" height="7" rx="1" fill={color} opacity={0.4} />
      <line x1="16" y1="7" x2="18" y2="7" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <line x1="16" y1="10" x2="18" y2="10" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}
