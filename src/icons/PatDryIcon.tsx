interface IconProps { size?: number; color?: string }

export function PatDryIcon({ size = 16, color = '#374151' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="8" width="16" height="10" rx="2" stroke={color} strokeWidth={2} />
      <path d="M4 12h16" stroke={color} strokeWidth={1} strokeDasharray="3,2" />
      <path d="M8 5l1 3M16 5l-1 3" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}
