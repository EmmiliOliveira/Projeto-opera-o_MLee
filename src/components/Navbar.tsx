import React from 'react';
import { LeaderProfile } from '../types';
import { AppLogo } from './AppLogo';
import { User, LogOut, ArrowLeft } from 'lucide-react';

interface NavbarProps {
  currentLeader: LeaderProfile | null;
  onLogout: () => void;
  onNavigateHome?: () => void;
  currentPageTitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLeader,
  onLogout,
  onNavigateHome,
  currentPageTitle,
  showBackButton,
  onBack,
}) => {
  return (
    <header className="bg-gradient-to-r from-[#001f3f] via-[#002f5e] to-[#001c38] border-b border-sky-500/20 text-white sticky top-0 z-40 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand / Title */}
          <div className="flex items-center space-x-3">
            {showBackButton && onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-lg text-sky-200 hover:text-white hover:bg-white/10 transition-colors mr-1 cursor-pointer flex items-center gap-1 text-sm font-medium"
                title="Voltar"
              >
                <ArrowLeft className="w-5 h-5 text-sky-400" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
            )}

            <div 
              onClick={onNavigateHome}
              className={`${onNavigateHome ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''}`}
            >
              <AppLogo variant="navbar" />
            </div>
          </div>

          {/* Center: Current view context title if present */}
          {currentPageTitle && (
            <div className="hidden lg:flex items-center px-3 py-1 rounded-full bg-sky-950/60 border border-sky-500/30 text-xs text-sky-200 font-medium">
              <span>{currentPageTitle}</span>
            </div>
          )}

          {/* Right: Leader Info & Logout */}
          {currentLeader ? (
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end gap-1.5 text-xs font-semibold text-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse shadow-sm shadow-emerald-400/50"></span>
                  <span>{currentLeader.name}</span>
                </div>
                <div className="text-[11px] text-sky-200/80">
                  Líder TBL • Matrícula {currentLeader.registrationNumber}
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#003865] to-[#0284c7] border border-sky-400/40 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                <User className="w-4 h-4 text-sky-100" />
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-red-300 hover:bg-red-950/40 border border-white/10 hover:border-red-500/40 transition-colors cursor-pointer"
                title="Trocar de líder ou sair"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sair / Trocar</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-sky-200/70 font-medium">
              Acesso Operacional TBL
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
