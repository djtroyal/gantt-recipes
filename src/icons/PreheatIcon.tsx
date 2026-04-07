interface IconProps { size?: number; color?: string }

export function PreheatIcon({ size = 16, color = '#374151' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="14" width="16" height="4" rx="1" stroke={color} strokeWidth={2} />
      <path d="M8 12c0-2 1.5-2 1.5-4s-1.5-2-1.5-4" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <path d="M12 12c0-2 1.5-2 1.5-4s-1.5-2-1.5-4" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <path d="M16 12c0-2 1.5-2 1.5-4s-1.5-2-1.5-4" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}
