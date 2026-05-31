/**
 * Custom SVG Icons - Design Luxos Decor Carpi
 * Iconițe originale și elegante pentru aplicație
 */

// Icon pentru Fotografia - Cameră stilizată cu linii elegante
export const IconFotografia = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    {/* Corpul camerei */}
    <rect x="3" y="6" width="18" height="12" rx="2" />
    {/* Lentila mare */}
    <circle cx="12" cy="12" r="4" />
    {/* Lentila mica (flash) */}
    <circle cx="18" cy="8" r="1.5" fill={color} />
    {/* Linii decorative */}
    <line x1="6" y1="3" x2="18" y2="3" strokeLinecap="round" />
    <line x1="5" y1="20" x2="19" y2="20" strokeLinecap="round" />
  </svg>
);

// Icon pentru Scegli Texture - Perie decorativă
export const IconTexture = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    {/* Mâner */}
    <rect x="9" y="14" width="6" height="8" rx="1" />
    {/* Perie - linii paralele */}
    <line x1="6" y1="4" x2="6" y2="12" strokeLinecap="round" />
    <line x1="9" y1="3" x2="9" y2="12" strokeLinecap="round" />
    <line x1="12" y1="2" x2="12" y2="12" strokeLinecap="round" />
    <line x1="15" y1="3" x2="15" y2="12" strokeLinecap="round" />
    <line x1="18" y1="4" x2="18" y2="12" strokeLinecap="round" />
    {/* Separator */}
    <line x1="5" y1="13" x2="19" y2="13" strokeLinecap="round" />
  </svg>
);

// Icon pentru Home - Casa cu linii geometrice
export const IconHome = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    {/* Acoperiș */}
    <path d="M3 12l9-8 9 8" strokeLinecap="round" strokeLinejoin="round" />
    {/* Corpul casei */}
    <rect x="4" y="12" width="16" height="8" rx="1" />
    {/* Ușa */}
    <rect x="10" y="14" width="4" height="6" rx="0.5" />
    {/* Fereastră */}
    <rect x="6" y="14" width="2.5" height="2.5" rx="0.5" />
    {/* Fereastră */}
    <rect x="15.5" y="14" width="2.5" height="2.5" rx="0.5" />
    {/* Linea decorativă pe acoperiș */}
    <line x1="12" y1="4" x2="12" y2="12" strokeLinecap="round" />
  </svg>
);

// Icon pentru Combina Stili - Paletă de Colori stilizată
export const IconCombina = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    {/* Paletă */}
    <path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8c0 2.2-0.9 4.2-2.3 5.6" strokeLinecap="round" />
    {/* Cercuri de Colori */}
    <circle cx="8" cy="8" r="1.5" fill={color} />
    <circle cx="14" cy="8" r="1.5" fill={color} />
    <circle cx="11" cy="14" r="1.5" fill={color} />
    <circle cx="6" cy="13" r="1.5" fill={color} />
    {/* Gol pentru deget */}
    <circle cx="18" cy="16" r="1.5" fill="none" stroke={color} />
  </svg>
);

// Icon pentru Preventivo - Document cu linii
export const IconPreventivo = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    {/* Document */}
    <rect x="4" y="2" width="14" height="20" rx="1" />
    {/* Linii text */}
    <line x1="7" y1="6" x2="15" y2="6" strokeLinecap="round" />
    <line x1="7" y1="10" x2="15" y2="10" strokeLinecap="round" />
    <line x1="7" y1="14" x2="13" y2="14" strokeLinecap="round" />
    {/* Linea decorativă */}
    <line x1="4" y1="18" x2="18" y2="18" strokeLinecap="round" />
    {/* Semnătură */}
    <path d="M6 20 Q 8 19 10 20" strokeLinecap="round" />
  </svg>
);

// Icon pentru Inspirație - Stea decorativă
export const IconIspirazione = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    {/* Stea 5 Punti */}
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
          strokeLinecap="round" strokeLinejoin="round" />
    {/* Linea decorativă */}
    <line x1="12" y1="2" x2="12" y2="22" strokeLinecap="round" opacity="0.3" />
  </svg>
);

// Icon pentru Impostazioni - Roată dințată elegantă
export const IconImpostazioni = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    {/* Cercul central */}
    <circle cx="12" cy="12" r="3" />
    {/* Roată dințată - 8 dinți */}
    <circle cx="12" cy="12" r="8" />
    {/* Dinți */}
    <line x1="12" y1="2" x2="12" y2="4" strokeLinecap="round" strokeWidth="1.5" />
    <line x1="12" y1="20" x2="12" y2="22" strokeLinecap="round" strokeWidth="1.5" />
    <line x1="22" y1="12" x2="20" y2="12" strokeLinecap="round" strokeWidth="1.5" />
    <line x1="4" y1="12" x2="2" y2="12" strokeLinecap="round" strokeWidth="1.5" />
    {/* Dinți diagonali */}
    <line x1="18.66" y1="5.34" x2="17.24" y2="6.76" strokeLinecap="round" strokeWidth="1.5" />
    <line x1="6.76" y1="17.24" x2="5.34" y2="18.66" strokeLinecap="round" strokeWidth="1.5" />
    <line x1="18.66" y1="18.66" x2="17.24" y2="17.24" strokeLinecap="round" strokeWidth="1.5" />
    <line x1="6.76" y1="6.76" x2="5.34" y2="5.34" strokeLinecap="round" strokeWidth="1.5" />
  </svg>
);

// Icon pentru Contact - Telefon stilizat
export const IconContact = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    {/* Telefon */}
    <rect x="5" y="2" width="14" height="20" rx="2" />
    {/* Ecran */}
    <rect x="6" y="3" width="12" height="14" rx="1" />
    {/* Buton home */}
    <circle cx="12" cy="19" r="1" fill={color} />
    {/* Linii decorative pe ecran */}
    <line x1="8" y1="6" x2="16" y2="6" strokeLinecap="round" opacity="0.5" />
    <line x1="8" y1="9" x2="16" y2="9" strokeLinecap="round" opacity="0.5" />
    <line x1="8" y1="12" x2="14" y2="12" strokeLinecap="round" opacity="0.5" />
  </svg>
);

// Icon pentru Progetto - Stivă de forme geometrice
export const IconProgetto = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    {/* Stivă 1 - sus */}
    <rect x="4" y="4" width="10" height="5" rx="0.5" />
    {/* Stivă 2 - mijloc */}
    <rect x="6" y="10" width="10" height="5" rx="0.5" />
    {/* Stivă 3 - jos */}
    <rect x="8" y="16" width="10" height="4" rx="0.5" />
    {/* Linii de legătură */}
    <line x1="9" y1="9" x2="11" y2="10" strokeLinecap="round" opacity="0.5" />
    <line x1="11" y1="15" x2="13" y2="16" strokeLinecap="round" opacity="0.5" />
  </svg>
);

// Icon pentru Calcolo - Ruletă elegantă
export const IconCalcolo = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    {/* Ruletă - cerc exterior */}
    <circle cx="12" cy="12" r="9" />
    {/* Cerc interior */}
    <circle cx="12" cy="12" r="6" />
    {/* Marcaje pe ruletă */}
    <line x1="12" y1="3" x2="12" y2="5" strokeLinecap="round" strokeWidth="2" />
    <line x1="12" y1="19" x2="12" y2="21" strokeLinecap="round" strokeWidth="2" />
    <line x1="21" y1="12" x2="19" y2="12" strokeLinecap="round" strokeWidth="2" />
    <line x1="5" y1="12" x2="3" y2="12" strokeLinecap="round" strokeWidth="2" />
    {/* Marcaje diagonale */}
    <line x1="17.66" y1="6.34" x2="16.24" y2="7.76" strokeLinecap="round" />
    <line x1="6.34" y1="17.66" x2="7.76" y2="16.24" strokeLinecap="round" />
    {/* Indicator */}
    <circle cx="12" cy="12" r="2" fill={color} />
  </svg>
);
