import React, { useState, useEffect } from 'react';
import { UserProfile, WeightEntry } from '../types';
import { X, Sliders, Download, Upload, RotateCcw, AlertTriangle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
  onLoadSampleData: () => void;
  onClearAllData: () => void;
  onExportData: () => void;
  onImportData: (data: { profile: UserProfile; entries: WeightEntry[] }) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onLoadSampleData,
  onClearAllData,
  onExportData,
  onImportData,
}) => {
  const [startWeight, setStartWeight] = useState(String(profile.startWeight));
  const [goalWeight, setGoalWeight] = useState(String(profile.goalWeight));
  const [height, setHeight] = useState(String(profile.height));
  const [startDate, setStartDate] = useState(profile.startDate);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importError, setImportError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setStartWeight(String(profile.startWeight));
    setGoalWeight(String(profile.goalWeight));
    setHeight(String(profile.height));
    setStartDate(profile.startDate);
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startWeight.trim() || !goalWeight.trim() || !height.trim() ||
      Number(startWeight) <= 20 || Number(goalWeight) <= 20 || Number(height) <= 0) return;
    onUpdateProfile({
      ...profile,
      startWeight: Number(startWeight),
      goalWeight: Number(goalWeight),
      height: Number(height),
      startDate,
    });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError('');
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profile && Array.isArray(parsed.entries)) {
          onImportData(parsed);
          onClose();
        } else {
          setImportError('Ungültiges Datenformat in der Datei.');
        }
      } catch {
        setImportError('Konnte Datei nicht parsen. Bitte gültiges JSON wählen.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full p-6 shadow-2xl relative text-neutral-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-neutral-300" />
            <h3 className="font-semibold text-lg text-white">Ziele & Profileinstellungen</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Startgewicht (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={startWeight}
                onChange={e => setStartWeight(e.target.value)}
                onFocus={e => e.currentTarget.select()}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Zielgewicht (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={goalWeight}
                onChange={e => setGoalWeight(e.target.value)}
                onFocus={e => e.currentTarget.select()}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Körpergröße (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={e => setHeight(e.target.value)}
                onFocus={e => e.currentTarget.select()}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">Wichtig für exakte BMI-Berechnung</span>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Startdatum
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
            >
              Einstellungen speichern
            </button>
          </div>
        </form>

        {/* Data & Backup section */}
        <div className="mt-8 pt-6 border-t border-neutral-800 space-y-4">
          <div className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
            Datensicherung & Verwaltung
          </div>

          {importError && (
            <div className="p-2.5 bg-rose-950/60 border border-rose-800 rounded text-xs text-rose-300">
              {importError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={onExportData}
              className="flex items-center justify-center gap-2 p-2.5 bg-neutral-800 hover:bg-neutral-700/80 rounded-lg text-neutral-200 border border-neutral-700 transition-colors"
            >
              <Download className="w-4 h-4 text-neutral-400" />
              <span>Backup herunterladen</span>
            </button>

            <label className="flex items-center justify-center gap-2 p-2.5 bg-neutral-800 hover:bg-neutral-700/80 rounded-lg text-neutral-200 border border-neutral-700 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-neutral-400" />
              <span>Backup einspielen</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                onLoadSampleData();
                onClose();
              }}
              className="text-xs text-neutral-400 hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Musterdaten (60 Tage Verlauf) laden
            </button>

            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-xs text-rose-400/80 hover:text-rose-400 transition-colors"
              >
                Alle Daten löschen
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-rose-300 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-400" /> Sicher?
                </span>
                <button
                  onClick={() => {
                    onClearAllData();
                    setShowClearConfirm(false);
                    onClose();
                  }}
                  className="px-2 py-1 text-xs bg-rose-700 hover:bg-rose-600 text-white rounded font-medium"
                >
                  Ja, leeren
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-1 text-xs bg-neutral-800 text-neutral-300 rounded"
                >
                  Nein
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
