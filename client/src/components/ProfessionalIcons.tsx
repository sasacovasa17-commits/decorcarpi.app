/**
 * Professional Icons Component - FINAL EDITION
 * SVG icons with diplomat, bathtub, and larger lighting symbols
 * TIPO DI STANZA: 7 detailed circular icons (diplomat at Ufficio, bathtub at Bagno)
 * ILLUMINAZIONE: 4 buttons with LARGE icon + text
 * STILE: 6 text-only buttons
 */

// Room Type Icons - Exact match to reference photo
export const RoomTypeIcons = {
  soggiorno: (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Lamp on top */}
      <circle cx="30" cy="20" r="4" fill="currentColor" />
      <line x1="30" y1="24" x2="30" y2="32" />
      <rect x="25" y="32" width="10" height="6" rx="1" />
      {/* Sofa - blue fill */}
      <rect x="15" y="45" width="60" height="25" rx="3" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="2" />
      <line x1="25" y1="45" x2="25" y2="70" />
      <line x1="75" y1="45" x2="75" y2="70" />
      {/* Cushions */}
      <rect x="35" y="50" width="8" height="8" rx="1" fill="currentColor" opacity="0.2" />
      <rect x="57" y="50" width="8" height="8" rx="1" fill="currentColor" opacity="0.2" />
    </svg>
  ),
  cucina: (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Frying pan */}
      <ellipse cx="50" cy="45" rx="25" ry="18" />
      <line x1="75" y1="45" x2="85" y2="40" strokeWidth="2" />
      {/* Fried eggs */}
      <circle cx="38" cy="40" r="6" fill="currentColor" opacity="0.2" />
      <circle cx="38" cy="40" r="3" fill="currentColor" />
      <circle cx="62" cy="50" r="6" fill="currentColor" opacity="0.2" />
      <circle cx="62" cy="50" r="3" fill="currentColor" />
    </svg>
  ),
  camera: (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Bed frame */}
      <rect x="20" y="45" width="60" height="28" rx="2" />
      {/* Pillows */}
      <rect x="25" y="38" width="16" height="10" rx="2" fill="currentColor" opacity="0.2" />
      <rect x="59" y="38" width="16" height="10" rx="2" fill="currentColor" opacity="0.2" />
      {/* Mattress line */}
      <line x1="20" y1="55" x2="80" y2="55" />
      {/* Headboard */}
      <rect x="18" y="40" width="64" height="6" rx="1" fill="currentColor" opacity="0.1" />
    </svg>
  ),
  ufficio: (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Diplomat/Briefcase */}
      <rect x="25" y="35" width="50" height="35" rx="3" />
      {/* Handle */}
      <path d="M 35 35 Q 50 20 65 35" strokeWidth="2" fill="none" />
      {/* Lock/Clasp */}
      <circle cx="50" cy="55" r="2" fill="currentColor" opacity="0.5" />
      {/* Divider line */}
      <line x1="25" y1="52" x2="75" y2="52" strokeWidth="1.5" opacity="0.7" />
      {/* Details */}
      <line x1="35" y1="40" x2="35" y2="68" strokeWidth="1" opacity="0.4" />
      <line x1="65" y1="40" x2="65" y2="68" strokeWidth="1" opacity="0.4" />
    </svg>
  ),
  ingresso: (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Briefcase/Bag */}
      <rect x="25" y="35" width="50" height="35" rx="3" />
      {/* Handle */}
      <path d="M 35 35 Q 50 20 65 35" strokeWidth="2" fill="none" />
      {/* Lock */}
      <circle cx="50" cy="55" r="3" fill="currentColor" opacity="0.3" />
      {/* Divider line */}
      <line x1="25" y1="52" x2="75" y2="52" />
    </svg>
  ),
  sala: (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Plate */}
      <circle cx="50" cy="45" r="20" />
      {/* Plate inner circle */}
      <circle cx="50" cy="45" r="16" fill="currentColor" opacity="0.1" />
      {/* Fork */}
      <line x1="30" y1="30" x2="30" y2="65" strokeWidth="2" />
      <line x1="25" y1="35" x2="35" y2="35" strokeWidth="1.5" />
      <line x1="25" y1="42" x2="35" y2="42" strokeWidth="1.5" />
      <line x1="25" y1="49" x2="35" y2="49" strokeWidth="1.5" />
      {/* Knife */}
      <line x1="70" y1="30" x2="70" y2="65" strokeWidth="2" />
      <line x1="68" y1="65" x2="72" y2="65" strokeWidth="1.5" />
    </svg>
  ),
  bagno: (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Bathtub */}
      <path d="M 20 45 L 25 30 Q 25 20 35 20 L 65 20 Q 75 20 75 30 L 80 45 Q 80 55 75 60 L 25 60 Q 20 55 20 45 Z" fill="currentColor" opacity="0.1" />
      <path d="M 20 45 L 25 30 Q 25 20 35 20 L 65 20 Q 75 20 75 30 L 80 45" strokeWidth="2.5" />
      {/* Tub bottom */}
      <ellipse cx="50" cy="55" rx="28" ry="8" fill="none" strokeWidth="2" />
      {/* Water inside */}
      <path d="M 28 50 Q 50 52 72 50" strokeWidth="1.5" opacity="0.5" />
      {/* Faucet */}
      <line x1="50" y1="15" x2="50" y2="22" strokeWidth="2" />
      <circle cx="50" cy="15" r="2" fill="currentColor" />
    </svg>
  ),
};

// Lighting Icons - LARGER symbols
export const LightingIcons = {
  naturale: (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Sun - LARGER */}
      <circle cx="50" cy="40" r="15" fill="currentColor" opacity="0.2" />
      <circle cx="50" cy="40" r="15" strokeWidth="2.5" />
      {/* Sun rays - LARGER */}
      <line x1="50" y1="10" x2="50" y2="0" strokeWidth="3" opacity="0.8" />
      <line x1="50" y1="70" x2="50" y2="80" strokeWidth="3" opacity="0.8" />
      <line x1="20" y1="40" x2="8" y2="40" strokeWidth="3" opacity="0.8" />
      <line x1="80" y1="40" x2="92" y2="40" strokeWidth="3" opacity="0.8" />
    </svg>
  ),
  calda: (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Candle - LARGER */}
      <rect x="43" y="28" width="14" height="40" rx="2" strokeWidth="2.5" />
      {/* Flame - LARGER */}
      <path d="M 45 26 Q 42 15 50 8 Q 58 15 55 26 Z" fill="currentColor" opacity="0.3" strokeWidth="2" />
      <path d="M 45 26 Q 42 15 50 8 Q 58 15 55 26 Z" strokeWidth="2.5" />
      {/* Glow - LARGER */}
      <circle cx="50" cy="50" r="18" fill="currentColor" opacity="0.15" />
    </svg>
  ),
  fredda: (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Snowflake - LARGER */}
      <circle cx="50" cy="45" r="14" fill="none" strokeWidth="2.5" />
      <line x1="50" y1="25" x2="50" y2="65" strokeWidth="2.5" />
      <line x1="28" y1="45" x2="72" y2="45" strokeWidth="2.5" />
      <line x1="33" y1="32" x2="67" y2="58" strokeWidth="2.5" />
      <line x1="67" y1="32" x2="33" y2="58" strokeWidth="2.5" />
      {/* Snowflake points - LARGER */}
      <line x1="42" y1="30" x2="35" y2="22" strokeWidth="2" opacity="0.8" />
      <line x1="58" y1="30" x2="65" y2="22" strokeWidth="2" opacity="0.8" />
    </svg>
  ),
  mista: (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Light bulb - LARGER */}
      <circle cx="50" cy="40" r="14" fill="currentColor" opacity="0.15" />
      <circle cx="50" cy="40" r="14" strokeWidth="2.5" />
      {/* Bulb base - LARGER */}
      <rect x="46" y="54" width="8" height="10" rx="1" strokeWidth="2" />
      {/* Filament - LARGER */}
      <path d="M 47 54 Q 50 48 53 54" fill="none" strokeWidth="2" />
      {/* Light rays - LARGER */}
      <line x1="50" y1="12" x2="50" y2="2" strokeWidth="3" opacity="0.8" />
      <line x1="50" y1="68" x2="50" y2="78" strokeWidth="3" opacity="0.8" />
      <line x1="78" y1="40" x2="88" y2="40" strokeWidth="3" opacity="0.8" />
      <line x1="22" y1="40" x2="12" y2="40" strokeWidth="3" opacity="0.8" />
    </svg>
  ),
};

// Style Icons - Text only (no icons needed)
export const StyleIcons = {
  moderno: null,
  classico: null,
  minimalista: null,
  industriale: null,
  rustico: null,
  lusso: null,
};

// Icon wrapper component
interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function RoomIcon({ id, size = 24, color = "currentColor", className = "" }: IconProps & { id: keyof typeof RoomTypeIcons }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ color }}
    >
      {RoomTypeIcons[id]}
    </svg>
  );
}

export function LightingIcon({ id, size = 24, color = "currentColor", className = "" }: IconProps & { id: keyof typeof LightingIcons }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ color }}
    >
      {LightingIcons[id]}
    </svg>
  );
}

export function StyleIcon({ id, size = 24, color = "currentColor", className = "" }: IconProps & { id: keyof typeof StyleIcons }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ color }}
    >
      {StyleIcons[id]}
    </svg>
  );
}
