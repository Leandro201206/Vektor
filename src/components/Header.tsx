import React from 'react';
import { Plus, Sliders, Sun, Moon, LayoutDashboard, ChartNoAxesCombined, List } from 'lucide-react';

interface HeaderProps {
  activeView: 'dashboard' | 'entries' | 'stats';
  onSelectView: (view: 'dashboard' | 'entries' | 'stats') => void;
  onOpenLogModal: () => void;
  onOpenSettings: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onSelectView,
  onOpenLogModal,
  onOpenSettings,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <>
    <header className="border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3 lg:gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectView('dashboard')}
            className="text-lg font-bold tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400 rotate-45" />
            <span>Vektor</span>
          </button>
        </div>

        {/* Zone 2: Nav links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-medium py-1">
          <button
            onClick={() => onSelectView('dashboard')}
            className={`whitespace-nowrap pb-1 transition-colors relative ${
              activeView === 'dashboard'
                ? 'text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Dashboard
            {activeView === 'dashboard' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectView('entries')}
            className={`whitespace-nowrap pb-1 transition-colors relative ${
              activeView === 'entries'
                ? 'text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Verlauf & Einträge
            {activeView === 'entries' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectView('stats')}
            className={`whitespace-nowrap pb-1 transition-colors relative ${
              activeView === 'stats'
                ? 'text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Statistiken & Meilensteine
            {activeView === 'stats' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: Primary action & Settings */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors hidden md:inline-flex"
            title={isDarkMode ? 'Heller Modus' : 'Dunkler Modus'}
            aria-label="Theme umschalten"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors"
            title="Ziele & Profil anpassen"
            aria-label="Einstellungen"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenLogModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Eintrag erfassen</span>
            <span className="sm:hidden">Eintrag</span>
          </button>
        </div>
      </div>
    </header>
    <nav aria-label="Mobile Hauptnavigation" className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-neutral-950/95 backdrop-blur-lg border-t border-neutral-800 flex justify-around px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)] shadow-[0_-10px_30px_rgba(0,0,0,.28)]">
      {([
        { view: 'dashboard' as const, label: 'Übersicht', Icon: LayoutDashboard },
        { view: 'entries' as const, label: 'Einträge', Icon: List },
        { view: 'stats' as const, label: 'Statistiken', Icon: ChartNoAxesCombined },
      ]).map(({ view, label, Icon }) => (
        <button key={view} type="button" aria-current={activeView === view ? 'page' : undefined} onClick={() => { onSelectView(view); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`flex-1 min-h-12 flex flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold ${activeView === view ? 'text-emerald-300 bg-emerald-500/10' : 'text-neutral-400'}`}>
          <Icon className="w-5 h-5" strokeWidth={activeView === view ? 2.4 : 1.8}/>
          <span>{label}</span>
        </button>
      ))}
    </nav>
    </>
  );
};
