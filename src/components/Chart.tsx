import React, { useState, useMemo } from 'react';
import { WeightEntry } from '../types';
import { calculateMovingAverages, formatDateShort } from '../utils/calculations';

interface ChartProps {
  entries: WeightEntry[];
  goalWeight: number;
  startWeight: number;
  timeRange: '7d' | '30d' | '90d' | 'all';
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | 'all') => void;
  showMovingAverage: boolean;
  onToggleMovingAverage: () => void;
  unit?: string;
}

export const WeightChart: React.FC<ChartProps> = ({
  entries,
  goalWeight,
  timeRange,
  onTimeRangeChange,
  showMovingAverage,
  onToggleMovingAverage,
  unit = 'kg',
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Filter entries based on time range
  const filteredData = useMemo(() => {
    if (!entries.length) return [];
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const now = new Date(sorted[sorted.length - 1].date).getTime();

    let daysToKeep = 0;
    if (timeRange === '7d') daysToKeep = 7;
    else if (timeRange === '30d') daysToKeep = 30;
    else if (timeRange === '90d') daysToKeep = 90;

    if (daysToKeep === 0) {
      return calculateMovingAverages(sorted, 7);
    }

    const cutoff = now - daysToKeep * 24 * 60 * 60 * 1000;
    const filtered = sorted.filter(e => new Date(e.date).getTime() >= cutoff);
    return calculateMovingAverages(filtered.length > 0 ? filtered : sorted, 7);
  }, [entries, timeRange]);

  // Compute SVG dimensions and scale
  const width = 860;
  const height = 320;
  const padding = { top: 30, right: 30, bottom: 40, left: 50 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const { minWeight, maxWeight, points, maPoints, goalY } = useMemo(() => {
    if (!filteredData.length) {
      return { minWeight: 70, maxWeight: 95, points: [], maPoints: [], goalY: 0 };
    }

    const allWeights = filteredData.map(d => d.weight);
    if (goalWeight) allWeights.push(goalWeight);
    if (showMovingAverage) {
      filteredData.forEach(d => {
        if (d.movingAverage) allWeights.push(d.movingAverage);
      });
    }

    const rawMin = Math.min(...allWeights);
    const rawMax = Math.max(...allWeights);

    // Padding on Y axis
    const min = Math.floor(rawMin - 1);
    const max = Math.ceil(rawMax + 1);

    const getX = (index: number) => {
      if (filteredData.length <= 1) return padding.left + chartWidth / 2;
      return padding.left + (index / (filteredData.length - 1)) * chartWidth;
    };

    const getY = (val: number) => {
      const clamped = Math.max(min, Math.min(max, val));
      const ratio = (clamped - min) / (max - min || 1);
      return padding.top + chartHeight - ratio * chartHeight;
    };

    const pts = filteredData.map((d, i) => ({
      x: getX(i),
      y: getY(d.weight),
      weight: d.weight,
      date: d.date,
      movingAverage: d.movingAverage,
    }));

    const maPts = filteredData.map((d, i) => ({
      x: getX(i),
      y: getY(d.movingAverage),
    }));

    const gY = goalWeight ? getY(goalWeight) : 0;

    return { minWeight: min, maxWeight: max, points: pts, maPoints: maPts, goalY: gY };
  }, [filteredData, goalWeight, showMovingAverage, chartWidth, chartHeight]);

  // Path generators
  const weightPathD = useMemo(() => {
    if (points.length < 2) return '';
    return points.reduce((path, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`;
    }, '');
  }, [points]);

  const areaPathD = useMemo(() => {
    if (points.length < 2) return '';
    const first = points[0];
    const last = points[points.length - 1];
    const baseline = padding.top + chartHeight;
    return `${weightPathD} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
  }, [points, weightPathD, padding.top, chartHeight]);

  const maPathD = useMemo(() => {
    if (maPoints.length < 2) return '';
    return maPoints.reduce((path, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`;
    }, '');
  }, [maPoints]);

  // Y-axis grid ticks (e.g. 4-5 ticks)
  const yTicks = useMemo(() => {
    const ticks: { value: number; y: number }[] = [];
    const count = 4;
    const step = (maxWeight - minWeight) / count;
    for (let i = 0; i <= count; i++) {
      const val = Number((minWeight + i * step).toFixed(1));
      const ratio = (val - minWeight) / (maxWeight - minWeight || 1);
      const y = padding.top + chartHeight - ratio * chartHeight;
      ticks.push({ value: val, y });
    }
    return ticks;
  }, [minWeight, maxWeight, chartHeight, padding.top]);

  // X-axis date ticks (pick 4-6 evenly spaced)
  const xTicks = useMemo(() => {
    if (!points.length) return [];
    const maxTicks = Math.min(6, points.length);
    const step = Math.floor(points.length / (maxTicks - 1)) || 1;
    const list = [];
    for (let i = 0; i < points.length; i += step) {
      list.push(points[i]);
    }
    if (list[list.length - 1] !== points[points.length - 1]) {
      list.push(points[points.length - 1]);
    }
    return list;
  }, [points]);

  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  return (
    <div className="flex flex-col bg-neutral-900 border border-neutral-800 rounded-xl p-5">
      {/* Chart Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div>
          <div className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
            Gewichtsverlauf & Trend
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-400">
            <span>Täglicher Messwert</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">7-Tage-Glättung</span>
            {goalWeight > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-neutral-300">Ziel: {goalWeight} {unit}</span>
              </>
            )}
          </div>
        </div>

        {/* Controls: Time range & MA toggle */}
        <div className="flex items-center gap-2">
          {/* Moving average toggle */}
          <button
            onClick={onToggleMovingAverage}
            className={`px-2.5 py-1 text-xs rounded-md border transition-colors whitespace-nowrap ${
              showMovingAverage
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-neutral-200'
            }`}
            title="Glättet tägliche Wasserschwankungen"
          >
            7-Tage-Schnitt
          </button>

          {/* Segmented Time Range buttons */}
          <div className="flex items-center p-0.5 bg-neutral-800 rounded-md border border-neutral-700/80">
            {(['7d', '30d', '90d', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => onTimeRangeChange(range)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  timeRange === range
                    ? 'bg-neutral-700 text-neutral-100 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {range === '7d' ? '7T' : range === '30d' ? '30T' : range === '90d' ? '90T' : 'Alle'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main SVG Area */}
      <div className="relative mt-2 w-full select-none" style={{ minHeight: '300px' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={e => {
            const svgRect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - svgRect.left) / svgRect.width) * width;
            // Find closest point
            let closestIdx = 0;
            let minDiff = Infinity;
            points.forEach((pt, idx) => {
              const diff = Math.abs(pt.x - relX);
              if (diff < minDiff) {
                minDiff = diff;
                closestIdx = idx;
              }
            });
            setHoverIndex(closestIdx);
          }}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Y-axis Horizontal Gridlines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="#262626"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={tick.y + 4}
                fill="#737373"
                fontSize="11"
                fontFamily="JetBrains Mono, monospace"
                textAnchor="end"
                className="tabular-nums"
              >
                {tick.value}
              </text>
            </g>
          ))}

          {/* Goal Weight Line */}
          {goalWeight > 0 && goalY >= padding.top && goalY <= padding.top + chartHeight && (
            <g>
              <line
                x1={padding.left}
                y1={goalY}
                x2={width - padding.right}
                y2={goalY}
                stroke="#64748b"
                strokeDasharray="4 4"
                strokeWidth="1.5"
              />
              <text
                x={width - padding.right}
                y={goalY - 6}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                textAnchor="end"
              >
                Ziel {goalWeight} {unit}
              </text>
            </g>
          )}

          {/* Area Fill */}
          {areaPathD && (
            <path d={areaPathD} fill="url(#chartGradient)" />
          )}

          {/* Moving Average Line (smoothed trend) */}
          {showMovingAverage && maPathD && (
            <path
              d={maPathD}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Raw Daily Weight Line */}
          {weightPathD && (
            <path
              d={weightPathD}
              fill="none"
              stroke={showMovingAverage ? '#525252' : '#10b981'}
              strokeWidth={showMovingAverage ? 1.5 : 2.5}
              strokeDasharray={showMovingAverage ? '2 2' : 'none'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Individual Data Points */}
          {points.length <= 35 && points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={hoverIndex === i ? 5 : 3}
              fill={hoverIndex === i ? '#ffffff' : '#10b981'}
              stroke="#171717"
              strokeWidth="2"
              className="transition-all duration-150"
            />
          ))}

          {/* Active Hover Guide and Point */}
          {activePoint && (
            <g>
              {/* Vertical crosshair */}
              <line
                x1={activePoint.x}
                y1={padding.top}
                x2={activePoint.x}
                y2={padding.top + chartHeight}
                stroke="#525252"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r={6}
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="2"
              />
              {showMovingAverage && activePoint.movingAverage && (
                <circle
                  cx={activePoint.x}
                  cy={maPoints[hoverIndex!]?.y || activePoint.y}
                  r={4}
                  fill="#34d399"
                  stroke="#0a0a0a"
                  strokeWidth="1.5"
                />
              )}
            </g>
          )}

          {/* X-axis date labels */}
          {xTicks.map((tick, i) => (
            <text
              key={i}
              x={tick.x}
              y={height - 12}
              fill="#737373"
              fontSize="11"
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
            >
              {formatDateShort(tick.date)}
            </text>
          ))}
        </svg>

        {/* Floating Tooltip HTML Overlay for crisp responsiveness */}
        {activePoint && hoverIndex !== null && (
          <div
            className="absolute pointer-events-none z-20 transform -translate-x-1/2 bg-neutral-950/95 border border-neutral-700/80 rounded-lg p-3 text-xs shadow-xl backdrop-blur-xs min-w-[140px]"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: '12px',
            }}
          >
            <div className="font-mono text-neutral-400 pb-1 border-b border-neutral-800 flex justify-between gap-3">
              <span>{new Date(activePoint.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
              <span className="text-neutral-300">Tag #{hoverIndex + 1}</span>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between gap-4 font-mono">
                <span className="text-neutral-400">Messung:</span>
                <span className="font-semibold text-white tabular-nums text-sm">
                  {activePoint.weight.toFixed(1)} {unit}
                </span>
              </div>
              {showMovingAverage && activePoint.movingAverage && (
                <div className="flex items-center justify-between gap-4 font-mono">
                  <span className="text-emerald-400">7-Tage-Ø:</span>
                  <span className="text-emerald-300 tabular-nums">
                    {activePoint.movingAverage.toFixed(1)} {unit}
                  </span>
                </div>
              )}
              {filteredData[hoverIndex - 1] && (
                <div className="flex items-center justify-between gap-4 font-mono pt-1 text-[11px] text-neutral-400">
                  <span>Delta:</span>
                  <span
                    className={`tabular-nums ${
                      activePoint.weight <= filteredData[hoverIndex - 1].weight
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {activePoint.weight - filteredData[hoverIndex - 1].weight > 0 ? '+' : ''}
                    {(activePoint.weight - filteredData[hoverIndex - 1].weight).toFixed(1)} {unit}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
