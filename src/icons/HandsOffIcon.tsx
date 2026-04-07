interface IconProps {
  size?: number;
  color?: string;
}

export function HandsOffIcon({ size = 16, color = '#374151' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Raised hand */}
      <path
        d="M8 13V5.5a1.5 1.5 0 013 0V10h0a1.5 1.5 0 013 0v1h0a1.5 1.5 0 013 0v1.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 11.5V14c0 3.3137-2.6863 6-6 6H9.5C6.4624 20 4 17.5376 4 14.5V12a1.5 1.5 0 013 0"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* X through it */}
      <line x1="3" y1="3" x2="21" y2="21" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}
