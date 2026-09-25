/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LeaderProfile, Operation } from './types';
import { 
  getCurrentLeader, 
  setCurrentLeaderId, 
  getStoredOperations, 
  saveStoredOperations 
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { MainMenuScreen } from './components/MainMenuScreen';
import { PendingOperationsScreen } from './components/PendingOperationsScreen';
import { NewOperationScreen } from './components/NewOperationScreen';
import { StopwatchOperationScreen } from './components/StopwatchOperationScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { DailyControlTableScreen } from './components/DailyControlTableScreen';

type ScreenState = 'menu' | 'pending' | 'new' | 'stopwatch' | 'history' | 'daily';

export default function App() {
  const [currentLeader, setCurrentLeader] = useState<LeaderProfile | null>(getCurrentLeader());
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('menu');
  const [operations, setOperations] = useState<Operation[]>(getStoredOperations());
  const [activeOperation, setActiveOperation] = useState<Operation | null>(null);

  // Sync operations from localStorage
  const refreshOperations = () => {
    setOperations(getStoredOperations());
  };

  const handleLoginSuccess = (leader: LeaderProfile) => {
    setCurrentLeader(leader);
    setCurrentScreen('menu');
    refreshOperations();
  };

  const handleLogout = () => {
    setCurrentLeaderId(null);
    setCurrentLeader(null);
    setCurrentScreen('menu');
    setActiveOperation(null);
  };

  // Launch Stopwatch Screen for an operation
  const handleStartOrResumeOperation = (op: Operation) => {
    setActiveOperation(op);
    setCurrentScreen('stopwatch');
  };

  // When a new operation is created, redirect to Pending Operations (per PDF instructions)
  const handleOperationCreated = (newOp: Operation) => {
    refreshOperations();
    setCurrentScreen('pending');
  };

  // When an operation is updated in the stopwatch
  const handleOperationUpdated = (updatedOp: Operation) => {
    setActiveOperation(updatedOp);
    refreshOperations();
  };

  // When operation finishes
  const handleFinishAndNavigateHistory = (finishedOp: Operation) => {
    refreshOperations();
    setCurrentScreen('history');
  };

  // Dynamic back action for Navbar
  const handleNavBack = () => {
    if (currentScreen === 'stopwatch') {
      setCurrentScreen('pending');
    } else {
      setCurrentScreen('menu');
    }
  };

  // Compute Page Title for Navbar
  const getPageTitle = (): string => {
    switch (currentScreen) {
      case 'menu':
        return 'Menu Principal';
      case 'pending':
        return 'Painel de Operações em Aguardo';
      case 'new':
        return 'Cadastro de Nova Operação';
      case 'stopwatch':
        return activeOperation
          ? `${activeOperation.operationCode} • Cronometragem`
          : 'Cronômetro da Operação';
      case 'history':
        return 'Histórico de Operações (Últimos 30 dias)';
      case 'daily':
        return 'Controle Diário — KPIs | Equipes Dia e Noite';
      default:
        return '';
    }
  };

  if (!currentLeader) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar
        currentLeader={currentLeader}
        onLogout={handleLogout}
        onNavigateHome={() => setCurrentScreen('menu')}
        currentPageTitle={getPageTitle()}
        showBackButton={currentScreen !== 'menu'}
        onBack={handleNavBack}
      />

      <main className="flex-1 pb-16">
        {currentScreen === 'menu' && (
          <MainMenuScreen
            currentLeader={currentLeader}
            operations={operations}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onQuickStartOperation={handleStartOrResumeOperation}
          />
        )}

        {currentScreen === 'pending' && (
          <PendingOperationsScreen
            currentLeader={currentLeader}
            operations={operations}
            onStartOrResumeOperation={handleStartOrResumeOperation}
            onNavigateNew={() => setCurrentScreen('new')}
            onBackToMenu={() => setCurrentScreen('menu')}
            onRefreshOperations={refreshOperations}
          />
        )}

        {currentScreen === 'new' && (
          <NewOperationScreen
            currentLeader={currentLeader}
            existingOperations={operations}
            onOperationCreated={handleOperationCreated}
            onCancel={() => setCurrentScreen('menu')}
          />
        )}

        {currentScreen === 'stopwatch' && activeOperation && (
          <StopwatchOperationScreen
            operation={activeOperation}
            currentLeader={currentLeader}
            onOperationUpdated={handleOperationUpdated}
            onFinishAndNavigateHistory={handleFinishAndNavigateHistory}
            onBack={() => setCurrentScreen('pending')}
          />
        )}

        {currentScreen === 'history' && (
          <HistoryScreen
            currentLeader={currentLeader}
            operations={operations}
            onBackToMenu={() => setCurrentScreen('menu')}
          />
        )}

        {currentScreen === 'daily' && (
          <DailyControlTableScreen
            currentLeader={currentLeader}
            operations={operations}
            onBackToMenu={() => setCurrentScreen('menu')}
            onRefresh={refreshOperations}
          />
        )}
      </main>

      {/* Footer bar */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            <span className="font-bold text-slate-200">PortoBalsa</span> • Sistema de Gestão e Análise de Desempenho em Operações de Embarcação
          </div>
          <div className="text-[11px] text-slate-400">
            Conceito & Especificação: Emmili Oliveira Gonçalves
          </div>
        </div>
      </footer>
    </div>
  );
}
