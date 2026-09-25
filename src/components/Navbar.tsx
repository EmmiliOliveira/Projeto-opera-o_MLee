import React from 'react';
import { LeaderProfile } from '../types';
import { Ship, Anchor, User, LogOut, ArrowLeft } from 'lucide-react';

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
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand / Title */}
          <div className="flex items-center space-x-3">
            {showBackButton && onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors mr-1 cursor-pointer flex items-center gap-1 text-sm font-medium"
                title="Voltar"
              >
                <ArrowLeft className="w-5 h-5 text-blue-400" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
            )}

            <div 
              onClick={onNavigateHome}
              className={`flex items-center space-x-2.5 ${onNavigateHome ? 'cursor-pointer group' : ''}`}
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-inner group-hover:bg-blue-500 transition-colors">
                <Ship className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-wide text-white">PORTOBALSA</span>
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800">
                    <Anchor className="w-3 h-3 text-blue-400" /> Desempenho Fluvial
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Controle de Tempos & Ciclos de Embarcação
                </p>
              </div>
            </div>
          </div>

          {/* Center: Current view context title if present */}
          {currentPageTitle && (
            <div className="hidden lg:flex items-center px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-blue-200 font-medium">
              <span>{currentPageTitle}</span>
            </div>
          )}

          {/* Right: Leader Info & Logout */}
          {currentLeader ? (
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end gap-1.5 text-xs font-semibold text-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  <span>{currentLeader.name}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Líder • Matrícula {currentLeader.registrationNumber}
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-blue-800 border border-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                <User className="w-4 h-4 text-blue-200" />
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-red-300 hover:bg-red-950/40 border border-slate-700 hover:border-red-800 transition-colors cursor-pointer"
                title="Trocar de líder ou sair"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sair / Trocar</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Acesso Restrito ao Líder
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
