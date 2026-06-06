import { useMemo } from 'react';
import type { CabinClass, FlightType, FlightStatus } from '../../utils/mileage';
import { getRankForMileage } from '../../utils/mileage';

interface FlightSummaryProps {
  flightNumber: string;
  departureCity: string;
  arrivalCity: string;
  flightType: FlightType;
  cabinClass: CabinClass;
  plannedDuration: number;
  actualDuration: number;
  mileageEarned: number;
  totalMileage: number;
  status: FlightStatus;
  onClose: () => void;
}

const CABIN_LABELS: Record<CabinClass, string> = {
  economy: 'ECONOMY',
  business: 'BUSINESS',
  first: 'FIRST CLASS',
  captain: 'CAPTAIN',
  legendary: 'LEGENDARY',
};

const TYPE_LABELS: Record<FlightType, string> = {
  deep_work: 'DEEP WORK',
  study: 'STUDY',
  creative: 'CREATIVE',
  reading: 'READING',
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function FlightSummary({
  flightNumber,
  departureCity,
  arrivalCity,
  flightType,
  cabinClass,
  plannedDuration,
  actualDuration,
  mileageEarned,
  totalMileage,
  status,
  onClose,
}: FlightSummaryProps) {
  const bars = useMemo(
    () => Array.from({ length: 48 }, () => Math.floor(Math.random() * 28) + 6),
    [],
  );
  const bookingRef = useMemo(
    () => 'AETH' + Math.random().toString(36).substring(2, 7).toUpperCase(),
    [],
  );
  const today = useMemo(
    () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    [],
  );

  const prevTotal = totalMileage - mileageEarned;
  const prevRank = getRankForMileage(prevTotal);
  const newRank = getRankForMileage(totalMileage);
  const promoted = prevRank.level < newRank.level;

  const isCompleted = status === 'completed';

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
      <div className="w-[380px] rounded-2xl shadow-2xl overflow-hidden">
        {/* Status banner */}
        <div className={`px-5 py-2.5 text-center text-sm font-bold tracking-wider ${
          isCompleted
            ? 'bg-emerald-600 text-white'
            : 'bg-amber-500 text-slate-900'
        }`}>
          {isCompleted ? '&#10003; FLIGHT COMPLETED' : '&#9888; EMERGENCY LANDING'}
        </div>

        {/* Summary body */}
        <div className="bg-slate-800/90 backdrop-blur-sm px-5 py-4 text-white">
          {/* Route display */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="flex flex-col items-center">
              <span className="text-lg">&#127758;</span>
              <span className="text-sm font-bold">{departureCity}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] font-mono text-slate-400">{flightNumber}</span>
              <div className="flex items-center gap-1 text-slate-500">
                <span className="block w-1.5 h-px bg-slate-500" />
                <span className="block w-5 h-px bg-slate-500" />
                <span className="text-xs">&#9992;</span>
                <span className="block w-5 h-px bg-slate-500" />
                <span className="block w-1.5 h-px bg-slate-500" />
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {formatDuration(actualDuration)} / {formatDuration(plannedDuration)}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg">&#127759;</span>
              <span className="text-sm font-bold">{arrivalCity}</span>
            </div>
          </div>

          {/* Dashed tear line */}
          <div className="relative my-3">
            <div className="border-t border-dashed border-slate-600" />
            <div className="absolute -left-[10px] -top-[8px] w-4 h-4 rounded-full bg-black/60" />
            <div className="absolute -right-[10px] -top-[8px] w-4 h-4 rounded-full bg-black/60" />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 text-[11px] mb-3">
            <div className="bg-slate-700/50 rounded-lg p-2.5 text-center">
              <div className="text-[9px] text-slate-400 uppercase tracking-wider">Flight Time</div>
              <div className="font-bold text-white">{formatDuration(actualDuration)}</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-2.5 text-center">
              <div className="text-[9px] text-slate-400 uppercase tracking-wider">Mileage</div>
              <div className="font-bold text-emerald-400">
                +{mileageEarned.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-2.5 text-center">
              <div className="text-[9px] text-slate-400 uppercase tracking-wider">Cabin</div>
              <div className="font-bold text-white">{CABIN_LABELS[cabinClass]}</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-2.5 text-center">
              <div className="text-[9px] text-slate-400 uppercase tracking-wider">Type</div>
              <div className="font-bold text-white">{TYPE_LABELS[flightType]}</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-2.5 text-center">
              <div className="text-[9px] text-slate-400 uppercase tracking-wider">Date</div>
              <div className="font-bold text-white">{today}</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-2.5 text-center">
              <div className="text-[9px] text-slate-400 uppercase tracking-wider">Rank</div>
              <div className="font-bold text-white">{newRank.nameEn.toUpperCase()}</div>
            </div>
          </div>

          {/* Promotion banner */}
          {promoted && (
            <div className="mb-3 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-center">
              <span className="text-amber-400 text-xs font-bold">
                &#11088; PROMOTED! {prevRank.nameEn.toUpperCase()} &rarr; {newRank.nameEn.toUpperCase()}
              </span>
            </div>
          )}

          {/* Barcode */}
          <div className="flex items-end justify-center gap-px mb-1">
            {bars.map((h, i) => (
              <div
                key={i}
                className="w-[3px] bg-slate-300 rounded-t"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
          <div className="text-center text-[9px] font-mono tracking-[3px] text-slate-500 mb-3">
            {bookingRef}
          </div>

          {/* Total mileage */}
          <div className="text-center">
            <span className="text-[10px] text-slate-400">TOTAL MILEAGE</span>
            <div className="text-2xl font-black tracking-tight text-white">
              {totalMileage.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 transition-colors border-t border-slate-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
