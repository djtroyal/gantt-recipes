interface IconProps {
  size?: number;
  color?: string;
}

export function CoverDomeIcon({ size = 16, color = '#374151' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Dome */}
      <path
        d="M4 16C4 10.4772 8.47715 6 14 6h-4C5.58172 6 2 9.58172 2 14v2h20v-2c0-4.4183-3.5817-8-8-8"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Handle */}
      <circle cx="12" cy="5" r="1.5" fill={color} />
      {/* Base line */}
      <line x1="2" y1="18" x2="22" y2="18" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}
