interface IconProps { size?: number; color?: string }

export function SliceIcon({ size = 16, color = '#374151' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 3l12 15" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <path d="M6 3c-2 3-3 7-2 11l14-11H6z" stroke={color} strokeWidth={2} strokeLinejoin="round" fill={color} fillOpacity={0.1} />
    </svg>
  );
}
