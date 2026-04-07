interface IconProps { size?: number; color?: string }

export function MarinateIcon({ size = 16, color = '#374151' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="5" y="6" width="14" height="14" rx="2" stroke={color} strokeWidth={2} />
      <line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={1.5} strokeDasharray="2,2" />
      <rect x="9" y="9" width="6" height="4" rx="1" fill={color} opacity={0.3} />
      <line x1="10" y1="3" x2="10" y2="6" stroke={color} strokeWidth={1.5} />
      <line x1="14" y1="3" x2="14" y2="6" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}
