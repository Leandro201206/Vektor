import React, { useState, useMemo } from 'react';
import { WeightEntry, UserProfile } from '../types';
import { formatDate } from '../utils/calculations';
import { Plus, Search, Trash2, Edit2, Download, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';

interface EntriesViewProps {
  entries: WeightEntry[];
  profile: UserProfile;
  onOpenLogModal: (entry?: WeightEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export const EntriesView: React.FC<EntriesViewProps> = ({
  entries,
  profile,
  onOpenLogModal,
  onDeleteEntry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Compute sorted & filtered data
  const processedEntries = useMemo(() => {
    // Sort chronologically asc first to calculate relative deltas
    const sortedChronological = [...entries].sort((a, b) => a.date.localeCompare(b.date));

    const enriched = sortedChronological.map((entry, idx) => {
      const prev = sortedChronological[idx - 1];
      const dailyDelta = prev ? Number((entry.weight - prev.weight).toFixed(1)) : 0;
      const totalDelta = Number((entry.weight - profile.startWeight).toFixed(1));

      return {
        ...entry,
        dailyDelta,
        totalDelta,
      };
    });

    // Apply search filter
    const query = searchQuery.toLowerCase().trim();
    const filtered = query
      ? enriched.filter(
          e =>
            (e.notes && e.notes.toLowerCase().includes(query)) ||
            e.date.includes(query) ||
            formatDate(e.date).includes(query) ||
            String(e.weight).includes(query)
        )
      : enriched;

    // Apply sort order
    return filtered.sort((a, b) => {
      return sortOrder === 'desc'
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date);
    });
  }, [entries, searchQuery, sortOrder, profile.startWeight]);

  const handleExportCSV = () => {
    if (!entries.length) return;
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const header = 'Datum,Gewicht (kg),Bauchumfang (cm),Körperfett (%),Notizen\n';
    const rows = sorted
      .map(
        e =>
          `"${e.date}","${e.weight}","${e.waist || ''}","${e.bodyFat || ''}","${(e.notes || '').replace(/"/g, '""')}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vektor-gewichtstracker-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
      {/* Header Bar */}
      <div className="p-5 border-b border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">Einträge & Verlauf</h2>
          <div className="text-xs text-neutral-400 mt-0.5">
            {processedEntries.length} von {entries.length} Messungen angezeigt
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Suchen (Datum, Notiz)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-neutral-950 border border-neutral-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500 w-48 sm:w-56"
            />
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-xs text-neutral-300 transition-colors"
            title="Als CSV-Tabelle herunterladen"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>

          {/* New Entry CTA */}
          <button
            onClick={() => onOpenLogModal()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-semibold rounded-lg text-xs transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Neuer Eintrag
          </button>
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-x-auto">
        {processedEntries.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">
            <p className="text-sm">Keine Einträge gefunden.</p>
            <button
              onClick={() => onOpenLogModal()}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Ersten Eintrag hinzufügen
            </button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/40 text-neutral-400 font-medium select-none">
                <th
                  onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Datum</span>
                    {sortOrder === 'desc' ? (
                      <ChevronDown className="w-3 h-3 text-neutral-400" />
                    ) : (
                      <ChevronUp className="w-3 h-3 text-neutral-400" />
                    )}
                  </div>
                </th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Gewicht</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Tägliche Änderung</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Seit Start ({profile.startWeight} kg)</th>
                <th className="py-3 px-4 text-right whitespace-nowrap hidden sm:table-cell">Bauchumfang</th>
                <th className="py-3 px-4 text-right whitespace-nowrap hidden md:table-cell">Körperfett</th>
                <th className="py-3 px-4 whitespace-nowrap">Notiz</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {processedEntries.map(entry => (
                <tr
                  key={entry.id}
                  className="hover:bg-neutral-800/40 transition-colors group"
                >
                  <td className="py-3 px-4 text-neutral-300 whitespace-nowrap font-sans font-medium">
                    {formatDate(entry.date)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-white tabular-nums text-sm">
                    {entry.weight.toFixed(1)} <span className="text-xs text-neutral-400 font-normal">kg</span>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    {entry.dailyDelta === 0 ? (
                      <span className="text-neutral-400">0.0 kg</span>
                    ) : (
                      <span
                        className={entry.dailyDelta < 0 ? 'text-emerald-400' : 'text-rose-400'}
                      >
                        {entry.dailyDelta > 0 ? `+${entry.dailyDelta}` : entry.dailyDelta} kg
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    <span
                      className={entry.totalDelta <= 0 ? 'text-emerald-400' : 'text-neutral-300'}
                    >
                      {entry.totalDelta > 0 ? `+${entry.totalDelta}` : entry.totalDelta} kg
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-neutral-300 tabular-nums hidden sm:table-cell">
                    {entry.waist ? `${entry.waist} cm` : '—'}
                  </td>
                  <td className="py-3 px-4 text-right text-neutral-300 tabular-nums hidden md:table-cell">
                    {entry.bodyFat ? `${entry.bodyFat} %` : '—'}
                  </td>
                  <td className="py-3 px-4 text-neutral-300 font-sans max-w-xs truncate">
                    {entry.notes || <span className="text-neutral-400 italic">—</span>}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {deletingId === entry.id ? (
                      <div className="flex items-center justify-end gap-1 font-sans">
                        <button
                          onClick={() => {
                            onDeleteEntry(entry.id);
                            setDeletingId(null);
                          }}
                          className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-semibold"
                        >
                          Löschen
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-2 py-0.5 bg-neutral-800 text-neutral-300 hover:text-white rounded text-[11px]"
                        >
                          Abbrechen
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onOpenLogModal(entry)}
                          className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
                          title="Bearbeiten"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(entry.id)}
                          className="p-1.5 text-neutral-400 hover:text-rose-400 rounded hover:bg-neutral-800 transition-colors"
                          title="Löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
