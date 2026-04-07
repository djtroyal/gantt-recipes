interface IconProps {
  size?: number;
  color?: string;
}

export function TossIcon({ size = 16, color = '#374151' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Spatula base */}
      <path
        d="M4 18l4-4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Toss arc */}
      <path
        d="M8 14c2-4 4-6 8-8"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="2,2"
      />
      {/* Flying bits */}
      <circle cx="14" cy="7" r="1.5" fill={color} />
      <circle cx="17" cy="5" r="1" fill={color} />
      <circle cx="11" cy="9" r="1" fill={color} />
    </svg>
  );
}
