interface IconProps { size?: number; color?: string }

export function WhiskIcon({ size = 16, color = '#374151' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 3c-3 4-5 7-5 11a5 5 0 0010 0c0-4-2-7-5-11z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <path d="M10 12c1-2 3-2 4 0" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}
