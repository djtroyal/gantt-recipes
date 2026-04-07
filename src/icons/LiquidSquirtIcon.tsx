interface IconProps {
  size?: number;
  color?: string;
}

export function LiquidSquirtIcon({ size = 16, color = '#374151' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Squeeze bottle shape */}
      <path
        d="M9 3h6l-1 4h-4L9 3z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path
        d="M10 7v3a5 5 0 005 5h0a5 5 0 005-5V7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        transform="translate(-5, 0)"
      />
      {/* Liquid drops */}
      <path
        d="M12 18l-1 3M12 18l1 3"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}
