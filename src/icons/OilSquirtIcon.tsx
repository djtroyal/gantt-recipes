interface IconProps {
  size?: number;
  color?: string;
}

export function OilSquirtIcon({ size = 16, color = '#374151' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Bottle */}
      <path
        d="M10 3h4v3l2 2v10a2 2 0 01-2 2h-4a2 2 0 01-2-2V8l2-2V3z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* Oil drops */}
      <circle cx="12" cy="13" r="1.5" fill={color} opacity={0.6} />
      <circle cx="12" cy="17" r="1" fill={color} opacity={0.4} />
    </svg>
  );
}
