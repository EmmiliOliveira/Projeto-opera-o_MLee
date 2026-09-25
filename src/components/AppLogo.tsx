import React from 'react';
import TBLLogo from './TBLLogo';
import appIconImg from '../assets/images/tbl_app_icon_1790343397478.jpg';

interface AppLogoProps {
  variant?: 'navbar' | 'hero' | 'card' | 'icon-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  variant = 'hero',
  size = 'md',
  className = '',
  showTagline = true,
}) => {
  // If navbar: compact, high-contrast, integrated branding
  if (variant === 'navbar') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* App Emblem with Vitória-Régia & Nautical Waves */}
        <div className="relative group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003865] via-[#0284c7] to-[#0ea5e9] p-[2px] shadow-md shadow-sky-950/30 transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#001f3d] rounded-[10px] overflow-hidden flex items-center justify-center relative">
              {/* App Icon Image with fallback */}
              <img
                src={appIconImg}
                alt="TBL PortoBalsa"
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              />
              {/* Subtle inner gloss highlight */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
            </div>
          </div>
          {/* Subtle green indicator dot representing the Vitória-Régia leaf vitality */}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-sm" title="Sistema Fluvial Operacional" />
        </div>

        {/* Brand & App Title */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-extrabold text-base tracking-wider text-white">
              TBL
            </span>
            <span className="text-sky-400 font-bold text-base tracking-wide">
              PORTO<span className="text-white">BALSA</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-sky-200/90 font-medium tracking-wider uppercase">
              Operações Fluviais
            </span>
            <span className="text-emerald-400 text-[9px] font-bold">·</span>
            <span className="text-[10px] text-emerald-300 font-medium">
              Ciclos & Tempo
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Icon only
  if (variant === 'icon-only') {
    const sizeClasses = {
      sm: 'w-8 h-8 rounded-lg',
      md: 'w-12 h-12 rounded-xl',
      lg: 'w-16 h-16 rounded-2xl',
      xl: 'w-24 h-24 rounded-3xl',
    };

    return (
      <div className={`relative ${sizeClasses[size]} overflow-hidden shadow-lg border-2 border-sky-400/40 bg-[#002244] p-0.5 ${className}`}>
        <img
          src={appIconImg}
          alt="TBL App Icon"
          className="w-full h-full object-cover rounded-[inherit]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#002244]/40 via-transparent to-white/15 pointer-events-none" />
      </div>
    );
  }

  // Hero Presentation (ideal for Login, Splash, About modal)
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Visual Badge Card */}
      <div className="relative mb-3 flex flex-col items-center">
        {/* Subtle Water Ripples background decoration */}
        <div className="absolute -inset-4 bg-gradient-to-r from-sky-400/10 via-emerald-400/10 to-sky-400/10 rounded-full blur-xl pointer-events-none" />

        {/* Primary TBL Vector Brand Mark */}
        <div className="relative bg-white/95 backdrop-blur-sm px-6 py-3.5 rounded-2xl border border-sky-100 shadow-xl shadow-sky-900/10 hover:shadow-sky-900/15 transition-shadow">
          <TBLLogo variant="full" size="md" showSubtitle={false} />
        </div>

        {/* Floating App Badge Pill */}
        <div className="mt-2.5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-md border border-sky-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="tracking-wide">
            PORTOBALSA <span className="text-sky-300 font-normal">| Gestão Fluvial</span>
          </span>
        </div>
      </div>

      {showTagline && (
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Monitoramento em tempo real de ciclos de embarque e desembarque fluvial de carretas e frotas
        </p>
      )}
    </div>
  );
};

export default AppLogo;
