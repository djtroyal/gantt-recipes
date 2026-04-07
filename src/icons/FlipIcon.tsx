interface IconProps {
  size?: number;
  color?: string;
}

export function FlipIcon({ size = 16, color = '#374151' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M17 4l3 3-3 3"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 12C3 7.02944 7.02944 3 12 3h8"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <path
        d="M7 20l-3-3 3-3"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 12c0 4.9706-4.0294 9-9 9H4"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </svg>
  );
}
