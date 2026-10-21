import React, { useState, useEffect, useMemo } from 'react';
import { WeightEntry, UserProfile } from './types';
import { defaultProfile, generateSampleEntries } from './utils/sampleData';
import { calculateOverallStats } from './utils/calculations';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { EntriesView } from './components/EntriesView';
import { StatsView } from './components/StatsView';
import { LogEntryModal } from './components/LogEntryModal';
import { SettingsModal } from './components/SettingsModal';

const STORAGE_KEY_ENTRIES = 'vektor_weight_entries_v1';
const STORAGE_KEY_PROFILE = 'vektor_user_profile_v1';
const STORAGE_KEY_THEME = 'vektor_theme_v1';

export default function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'entries' | 'stats'>('dashboard');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WeightEntry | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Profile State
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return defaultProfile;
  });

  // Entries State
  const [entries, setEntries] = useState<WeightEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ENTRIES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    // New users start with an empty, authentic history.
    return [];
  });

  // Persist profile
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  // Persist entries
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
    } catch {
      // ignore
    }
  }, [entries]);

  // Dark mode class toggle
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Compute live statistics
  const stats = useMemo(() => {
    return calculateOverallStats(entries, profile);
  }, [entries, profile]);

  // Handle saving an entry (add or edit)
  const handleSaveEntry = (newEntryData: Omit<WeightEntry, 'id' | 'timestamp'> & { id?: string }) => {
    setEntries(prev => {
      if (newEntryData.id) {
        // Edit existing
        return prev.map(e =>
          e.id === newEntryData.id
            ? {
                ...e,
                date: newEntryData.date,
                weight: newEntryData.weight,
                waist: newEntryData.waist,
                bodyFat: newEntryData.bodyFat,
                notes: newEntryData.notes,
              }
            : e
        );
      } else {
        // Check if entry for this date already exists
        const existingIdx = prev.findIndex(e => e.date === newEntryData.date);
        if (existingIdx >= 0) {
          // Update that day's entry
          const copy = [...prev];
          copy[existingIdx] = {
            ...copy[existingIdx],
            weight: newEntryData.weight,
            waist: newEntryData.waist ?? copy[existingIdx].waist,
            bodyFat: newEntryData.bodyFat ?? copy[existingIdx].bodyFat,
            notes: newEntryData.notes ?? copy[existingIdx].notes,
          };
          return copy;
        }

        // Add new
        const newEntry: WeightEntry = {
          id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          date: newEntryData.date,
          weight: newEntryData.weight,
          waist: newEntryData.waist,
          bodyFat: newEntryData.bodyFat,
          notes: newEntryData.notes,
          timestamp: new Date(newEntryData.date).getTime(),
        };
        return [...prev, newEntry];
      }
    });

    setEditingEntry(null);
  };

  // Handle deleting entry
  const handleDeleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  // Open log modal for creation or edit
  const handleOpenLogModal = (entry?: WeightEntry) => {
    setEditingEntry(entry || null);
    setIsLogModalOpen(true);
  };

  // Data management actions
  const handleLoadSampleData = () => {
    setProfile(defaultProfile);
    setEntries(generateSampleEntries());
  };

  const handleClearAllData = () => {
    setEntries([]);
  };

  const handleExportData = () => {
    const payload = {
      profile,
      entries,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vektor-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportData = (data: { profile: UserProfile; entries: WeightEntry[] }) => {
    if (data.profile) setProfile(data.profile);
    if (Array.isArray(data.entries)) setEntries(data.entries);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-neutral-800 selection:text-white">
      {/* 3-Zone Header Bar */}
      <Header
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenLogModal={() => handleOpenLogModal()}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'dashboard' && (
          <Dashboard
            entries={entries}
            profile={profile}
            stats={stats}
            onOpenLogModal={handleOpenLogModal}
            onSelectView={setActiveView}
          />
        )}

        {activeView === 'entries' && (
          <EntriesView
            entries={entries}
            profile={profile}
            onOpenLogModal={handleOpenLogModal}
            onDeleteEntry={handleDeleteEntry}
          />
        )}

        {activeView === 'stats' && (
          <StatsView
            entries={entries}
            profile={profile}
            stats={stats}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 py-6 mt-12 bg-neutral-950 text-neutral-400 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300">Vektor</span>
            <span aria-hidden="true">·</span>
            <span>Schlichter Gewichts- & Fortschrittstracker</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Alle Daten lokal im Browser gespeichert</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-neutral-200 transition-colors"
            >
              Einstellungen & Backup
            </button>
          </div>
        </div>
      </footer>

      {/* Log Entry Modal */}
      <LogEntryModal
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveEntry}
        initialEntry={editingEntry}
        latestWeight={stats.currentWeight}
        unit={profile.unit}
      />

      {/* Profile & Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onUpdateProfile={setProfile}
        onLoadSampleData={handleLoadSampleData}
        onClearAllData={handleClearAllData}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />
    </div>
  );
}
