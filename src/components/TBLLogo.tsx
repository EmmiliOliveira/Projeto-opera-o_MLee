import React from 'react';

interface TBLLogoProps {
  variant?: 'full' | 'compact' | 'badge' | 'watermark';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const TBLLogo: React.FC<TBLLogoProps> = ({
  variant = 'full',
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  // Sizing maps
  const heightClasses = {
    sm: 'h-8',
    md: 'h-11',
    lg: 'h-16',
    xl: 'h-24',
  };

  // Vector mark based faithfully on the company's TBL identity + Vitória-Régia on water ripples
  const renderVectorMark = (isCompact = false) => (
    <svg
      viewBox="0 0 540 220"
      className="w-auto h-full overflow-visible select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* T deep blue gradient */}
        <linearGradient id="tbl-grad-t" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#004b87" />
          <stop offset="50%" stopColor="#0066a4" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* B vibrant royal-azure gradient */}
        <linearGradient id="tbl-grad-b" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>

        {/* L speed streaks sky cyan gradient */}
        <linearGradient id="tbl-grad-l" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="60%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>

        {/* Vitória-Régia Leaf Basin */}
        <radialGradient id="vitoria-basin" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#bef264" />
          <stop offset="45%" stopColor="#84cc16" />
          <stop offset="85%" stopColor="#4d7c0f" />
          <stop offset="100%" stopColor="#365314" />
        </radialGradient>

        {/* Vitória-Régia Rim Shadow/Texture */}
        <linearGradient id="vitoria-rim" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4d7c0f" />
          <stop offset="100%" stopColor="#1e3a1e" />
        </linearGradient>

        {/* Water Ripple Cyan Glow */}
        <linearGradient id="ripple-glow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Main slatted typography group with dynamic forward slant */}
      <g transform="skewX(-14) translate(40, 15)">
        {/* ================= BAR 1 (Top) ================= */}
        {/* T top bar */}
        <path d="M 20 10 L 155 10 L 150 26 L 15 26 Z" fill="url(#tbl-grad-t)" />
        {/* B top loop */}
        <path d="M 165 10 L 235 10 C 255 10 268 18 268 26 L 200 26 L 160 26 Z" fill="url(#tbl-grad-b)" />
        {/* L extension streak 1 */}
        <path d="M 275 10 L 375 10 L 370 20 L 275 20 Z" fill="url(#tbl-grad-l)" opacity="0.9" />

        {/* ================= BAR 2 (Upper Mid) ================= */}
        {/* T stem segment 1 */}
        <path d="M 68 34 L 108 34 L 103 50 L 63 50 Z" fill="url(#tbl-grad-t)" />
        {/* B upper loop */}
        <path d="M 157 34 L 205 34 L 268 34 C 278 40 274 50 262 50 L 153 50 Z" fill="url(#tbl-grad-b)" />
        {/* L extension streak 2 */}
        <path d="M 280 34 L 390 34 L 385 44 L 280 44 Z" fill="url(#tbl-grad-l)" opacity="0.85" />

        {/* ================= BAR 3 (Waist / Mid) ================= */}
        {/* T stem segment 2 */}
        <path d="M 61 58 L 101 58 L 96 74 L 56 74 Z" fill="url(#tbl-grad-t)" />
        {/* B middle bar */}
        <path d="M 150 58 L 245 58 C 252 64 252 70 240 74 L 146 74 Z" fill="url(#tbl-grad-b)" />
        {/* L extension streak 3 */}
        <path d="M 285 58 L 380 58 L 375 68 L 285 68 Z" fill="url(#tbl-grad-l)" opacity="0.8" />

        {/* ================= BAR 4 (Lower Mid) ================= */}
        {/* T stem segment 3 */}
        <path d="M 54 82 L 94 82 L 89 98 L 49 98 Z" fill="url(#tbl-grad-t)" />
        {/* B lower loop */}
        <path d="M 143 82 L 210 82 L 265 82 C 275 88 272 98 258 98 L 139 98 Z" fill="url(#tbl-grad-b)" />
        {/* L extension streak 4 */}
        <path d="M 290 82 L 400 82 L 395 92 L 290 92 Z" fill="url(#tbl-grad-l)" opacity="0.75" />

        {/* ================= BAR 5 (Bottom / Base) ================= */}
        {/* T bottom stem */}
        <path d="M 47 106 L 87 106 L 82 122 L 42 122 Z" fill="url(#tbl-grad-t)" />
        {/* B bottom base */}
        <path d="M 136 106 L 225 106 C 248 106 255 116 245 122 L 132 122 Z" fill="url(#tbl-grad-b)" />
        {/* L bold foot base */}
        <path d="M 255 106 L 415 106 L 405 122 L 250 122 Z" fill="url(#tbl-grad-l)" />
      </g>

      {/* ================= RIPPLES & VITÓRIA-RÉGIA ================= */}
      <g transform="translate(355, 100)">
        {/* Ripple 1 - Outer gentle wave */}
        <ellipse cx="65" cy="40" rx="88" ry="32" stroke="#38bdf8" strokeWidth="2.5" opacity="0.5" strokeDasharray="18 6 12 8" />
        
        {/* Ripple 2 - Mid wave */}
        <ellipse cx="65" cy="40" rx="76" ry="26" stroke="#0284c7" strokeWidth="2" opacity="0.7" />
        
        {/* Ripple 3 - Inner energetic wave */}
        <ellipse cx="65" cy="40" rx="64" ry="20" stroke="#00a3e0" strokeWidth="3" opacity="0.9" />

        {/* Small water swirls on the edges */}
        <path d="M -15 35 Q -3 20 20 30" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <path d="M 125 45 Q 150 55 165 42" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
        <path d="M 115 52 Q 135 62 150 54" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

        {/* Vitória-Régia 3D Pad Outer Rim */}
        <g transform="rotate(-6 65 35)">
          {/* Vertical fluted rim side wall */}
          <path
            d="M 12 30 
               C 12 18, 35 10, 65 10 
               C 95 10, 118 18, 118 30 
               L 118 42 
               C 118 54, 95 62, 65 62 
               C 35 62, 12 54, 12 42 
               Z"
            fill="url(#vitoria-rim)"
            stroke="#27401a"
            strokeWidth="1.5"
          />

          {/* Serrated fluted rim ridges */}
          <path
            d="M 16 35 L 16 43 M 24 38 L 24 47 M 35 41 L 35 52 M 50 43 L 50 55 M 65 44 L 65 56 M 80 43 L 80 55 M 95 41 L 95 52 M 106 38 L 106 47 M 114 34 L 114 42"
            stroke="#1b3013"
            strokeWidth="1.2"
            opacity="0.8"
          />

          {/* Leaf Interior Basin */}
          <ellipse
            cx="65"
            cy="28"
            rx="51"
            ry="18"
            fill="url(#vitoria-basin)"
            stroke="#558b2f"
            strokeWidth="1.5"
          />

          {/* Leaf Cleft/Notch at Top-Right */}
          <path
            d="M 85 11 Q 72 23 65 27"
            stroke="#365314"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Radial Veins radiating from center */}
          <path
            d="M 65 27 L 22 24 
               M 65 27 L 30 36 
               M 65 27 L 48 43 
               M 65 27 L 66 44 
               M 65 27 L 84 42 
               M 65 27 L 102 34 
               M 65 27 L 110 24 
               M 65 27 L 95 16 
               M 65 27 L 50 14"
            stroke="#a3e635"
            strokeWidth="1.2"
            opacity="0.65"
            strokeDasharray="2 1.5"
          />

          {/* Center heart cleft highlight */}
          <circle cx="65" cy="27" r="2.5" fill="#bef264" />
        </g>
      </g>
    </svg>
  );

  if (variant === 'badge') {
    return (
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 via-[#003865] to-[#001d36] p-2 border border-sky-500/30 shadow-lg shadow-sky-950/40 ${className}`}>
        {/* Water ripple subtle background glow */}
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-sky-400/20 rounded-full blur-xl" />
          <div className="absolute -left-4 -top-4 w-16 h-16 bg-blue-600/20 rounded-full blur-lg" />
        </div>
        <div className={`${heightClasses[size]} w-auto relative z-10 flex items-center`}>
          {renderVectorMark(true)}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div className={`${heightClasses[size]} w-auto flex items-center`}>
          {renderVectorMark(true)}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center select-none text-center ${className}`}>
      <div className={`${heightClasses[size]} w-auto flex items-center justify-center`}>
        {renderVectorMark(false)}
      </div>
      {showSubtitle && (
        <div className="flex items-center justify-center gap-2 mt-1.5 px-1">
          <div className="h-[2px] w-6 bg-gradient-to-r from-blue-700 to-sky-400 rounded-full" />
          <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-slate-600 uppercase">
            Transportes & Logística Fluvial
          </span>
          <span className="text-sky-500 text-[10px] hidden sm:inline">●</span>
          <span className="text-[10px] sm:text-[11px] font-medium text-sky-600 tracking-wider hidden sm:inline">
            PortoBalsa
          </span>
        </div>
      )}
    </div>
  );
};

export default TBLLogo;
