import { useMemo } from 'react';
import type { CabinClass, FlightType } from '../../utils/mileage';
import { getRatingForDuration } from '../../utils/mileage';
import { getCityById } from '../../data/routes';

interface BoardingPassProps {
  flightNumber: string;
  departureCity: string;
  arrivalCity: string;
  cabinClass: CabinClass;
  flightType: FlightType;
  plannedDuration: number;
  estimatedMileage: number;
  streak: number;
  totalMileage: number;
  seatNumber: string;
  onConfirm: () => void;
  onCancel: () => void;
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

export default function BoardingPass({
  flightNumber,
  departureCity,
  arrivalCity,
  cabinClass,
  flightType,
  plannedDuration,
  estimatedMileage,
  streak,
  totalMileage,
  seatNumber,
  onConfirm,
  onCancel,
}: BoardingPassProps) {
  const gate = useMemo(
    () => 'G' + String(Math.floor(Math.random() * 60) + 1).padStart(2, '0'),
    [],
  );
  const zone = useMemo(
    () => (['A', 'B', 'C', 'D'] as const)[Math.floor(Math.random() * 4)],
    [],
  );
  const bars = useMemo(
    () => Array.from({ length: 60 }, () => Math.floor(Math.random() * 32) + 8),
    [],
  );
  const bookingRef = useMemo(
    () => 'AETH' + Math.random().toString(36).substring(2, 7).toUpperCase(),
    [],
  );
  const boardingTime = useMemo(() => {
    const d = new Date();
    return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  }, []);
  const today = useMemo(() => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }, []);
  const rating = getRatingForDuration(plannedDuration / 60);
  const dep = getCityById(departureCity);
  const arr = getCityById(arrivalCity);
  const depCode = dep?.code || departureCity;
  const arrCode = arr?.code || arrivalCity;
  const depName = dep?.name || departureCity;
  const arrName = arr?.name || arrivalCity;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
      <div className="w-[380px] rounded-2xl shadow-2xl overflow-hidden">
        {/* Cream boarding pass body */}
        <div className="bg-amber-50 p-5 pb-4 text-slate-900">
          {/* Header: airline + cabin badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">&#9992;</span>
              <span className="text-sm font-bold tracking-widest text-blue-900">
                AETHERVAST AIRLINES
              </span>
            </div>
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider bg-blue-900 text-amber-50 rounded-full">
              {CABIN_LABELS[cabinClass]}
            </span>
          </div>

          {/* Route: departure -> arrival */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex flex-col items-center">
              <span className="text-[28px] font-black tracking-tight text-blue-900">{depCode}</span>
              <span className="text-[9px] text-slate-500 mt-0.5">{depName}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] font-mono text-blue-700/70">{flightNumber}</span>
              <div className="flex items-center gap-1 text-blue-400">
                <span className="block w-2 h-[2px] bg-blue-400 rounded-full" />
                <span className="block w-6 h-[2px] bg-blue-400 rounded-full" />
                <span className="text-sm">&#9992;</span>
                <span className="block w-6 h-[2px] bg-blue-400 rounded-full" />
                <span className="block w-2 h-[2px] bg-blue-400 rounded-full" />
              </div>
              <span className="text-[10px] font-mono text-blue-700/70">{formatDuration(plannedDuration)}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[28px] font-black tracking-tight text-blue-900">{arrCode}</span>
              <span className="text-[9px] text-slate-500 mt-0.5">{arrName}</span>
            </div>
          </div>

          {/* Dashed tear line with half-circle cutouts */}
          <div className="relative my-4">
            <div className="border-t-2 border-dashed border-slate-300" />
            <div className="absolute -left-[10px] -top-[10px] w-5 h-5 rounded-full bg-black/60" />
            <div className="absolute -right-[10px] -top-[10px] w-5 h-5 rounded-full bg-black/60" />
          </div>

          {/* Info grid: 3×2 */}
          <div className="grid grid-cols-3 gap-x-3 gap-y-3 text-[11px] mb-4">
            <div className="bg-white/60 rounded-lg p-2">
              <div className="text-[8px] font-semibold text-slate-400 tracking-wider uppercase">Seat</div>
              <div className="font-bold text-slate-800 text-sm">{seatNumber}</div>
            </div>
            <div className="bg-white/60 rounded-lg p-2">
              <div className="text-[8px] font-semibold text-slate-400 tracking-wider uppercase">Gate</div>
              <div className="font-bold text-slate-800 text-sm">{gate}</div>
            </div>
            <div className="bg-white/60 rounded-lg p-2">
              <div className="text-[8px] font-semibold text-slate-400 tracking-wider uppercase">Zone</div>
              <div className="font-bold text-slate-800 text-sm">{zone}</div>
            </div>
            <div className="bg-white/60 rounded-lg p-2">
              <div className="text-[8px] font-semibold text-slate-400 tracking-wider uppercase">Date</div>
              <div className="font-bold text-slate-800 text-sm">{today}</div>
            </div>
            <div className="bg-white/60 rounded-lg p-2">
              <div className="text-[8px] font-semibold text-slate-400 tracking-wider uppercase">Boarding</div>
              <div className="font-bold text-slate-800 text-sm">{boardingTime}</div>
            </div>
            <div className="bg-white/60 rounded-lg p-2">
              <div className="text-[8px] font-semibold text-slate-400 tracking-wider uppercase">Type</div>
              <div className="font-bold text-slate-800 text-sm">{TYPE_LABELS[flightType]}</div>
            </div>
          </div>

          {/* Mileage + Rank */}
          <div className="flex items-center justify-between bg-white/50 rounded-xl px-4 py-2.5 mb-3">
            <div className="flex items-center gap-3 text-[10px]">
              <span className="text-amber-600 font-bold">&#9733; {estimatedMileage.toLocaleString()} miles</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">Streak <span className="font-bold text-orange-500">{streak}</span></span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">Total <span className="font-bold text-slate-700">{totalMileage.toLocaleString()}</span></span>
            </div>
            <span className="text-sm">{rating.icon} <span className="text-[9px] text-slate-500">{rating.label}</span></span>
          </div>

          {/* Barcode */}
          <div className="flex items-end justify-center gap-px mb-1">
            {bars.map((h, i) => (
              <div
                key={i}
                className="w-[3px] bg-slate-800 rounded-t"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
          <div className="text-center text-[10px] font-mono tracking-[4px] text-slate-500">
            {bookingRef}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 bg-white px-5 py-3.5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-blue-900 text-sm font-bold text-amber-50 hover:bg-blue-800 transition-colors"
          >
            Confirm Flight
          </button>
        </div>
      </div>
    </div>
  );
}
