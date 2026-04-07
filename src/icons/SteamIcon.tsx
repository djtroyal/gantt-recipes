interface IconProps {
  size?: number;
  color?: string;
}

export function SteamIcon({ size = 16, color = '#374151' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Steam squiggles */}
      <path d="M8 16c0-2 2-2 2-4s-2-2-2-4" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <path d="M12 16c0-2 2-2 2-4s-2-2-2-4" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <path d="M16 16c0-2 2-2 2-4s-2-2-2-4" stroke={color} strokeWidth={2} strokeLinecap="round" />
      {/* Surface line */}
      <line x1="4" y1="20" x2="20" y2="20" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}
