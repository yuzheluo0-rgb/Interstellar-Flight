import { useMemo } from 'react';
import { useFlightStore } from '../../stores/flightStore';
import { getCityById } from '../../data/routes';
import { getCabinClassForMileage, type CabinClass } from '../../utils/mileage';

const CABIN: Record<CabinClass, string> = {
  economy: 'ECONOMY',
  business: 'BUSINESS',
  first: 'FIRST',
  captain: 'CAPTAIN',
  legendary: 'LEGENDARY',
};

function MiniBarcode() {
  const bars = useMemo(
    () =>
      Array.from({ length: 35 }, () => ({
        w: Math.random() > 0.7 ? 0.25 : 0.12,
        h: 0.35 + Math.random() * 0.65,
      })),
    [],
  );
  return (
    <div className="flex items-end gap-[0.5px] h-6">
      {bars.map((b, i) => (
        <div
          key={i}
          className="bg-[#1a2744]/60 rounded-[0.5px]"
          style={{ width: `${b.w * 3}px`, height: `${b.h * 100}%` }}
        />
      ))}
    </div>
  );
}

export default function FloatWidget() {
  const { currentFlight, elapsedSeconds, stats } = useFlightStore();

  if (!currentFlight) {
    return (
      <div
        className="w-full h-full flex items-center justify-center rounded-2xl border border-white/20"
        style={{ background: 'rgba(245,243,238,0.92)', backdropFilter: 'blur(20px)' }}
      >
        <span className="text-[#1a2744]/25 text-[10px] font-medium">待机中...</span>
      </div>
    );
  }

  const from = getCityById(currentFlight.departureCity);
  const to = getCityById(currentFlight.arrivalCity);
  const cabin = getCabinClassForMileage(stats.totalMileage);
  const totalSec = currentFlight.plannedDuration;
  const pct = Math.min(100, Math.round((elapsedSeconds / totalSec) * 100));
  const rem = Math.max(0, totalSec - elapsedSeconds);
  const rm = Math.floor(rem / 60);
  const rs = rem % 60;

  return (
    <div
      className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/25 [-webkit-app-region:drag] select-none"
      style={{
        background: 'linear-gradient(135deg,rgba(245,243,238,0.96),rgba(236,233,225,0.94))',
        backdropFilter: 'blur(24px)',
      }}
    >
      <div className="px-4 pt-3 pb-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-[#1a2744] flex items-center justify-center">
              <span className="text-white text-[7px]">✈</span>
            </div>
            <span className="text-[7px] font-bold tracking-[0.15em] text-[#1a2744]/50">
              AETHERVAST
            </span>
          </div>
          <span className="text-[6px] tracking-[0.12em] text-[#c4a04a] font-bold uppercase">
            {CABIN[cabin]}
          </span>
        </div>

        {/* Route */}
        <div className="flex items-center mb-2">
          <div className="flex-1">
            <div className="text-[18px] font-bold tracking-tight text-[#1a2744] leading-none">
              {from?.code}
            </div>
            <div className="text-[7px] text-[#1a2744]/35 mt-0.5">{from?.name}</div>
          </div>
          <div className="flex flex-col items-center px-3">
            <div className="text-[6px] tracking-[0.1em] text-[#1a2744]/25 mb-0.5 font-mono">
              {currentFlight.flightNumber}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full border border-[#1a2744]/20" />
              <div className="w-8 h-[0.5px] bg-[#1a2744]/10" />
              <span className="text-[#c4a04a] text-[8px]">✈</span>
              <div className="w-8 h-[0.5px] bg-[#1a2744]/10" />
              <div className="w-1 h-1 rounded-full bg-[#1a2744]/30" />
            </div>
          </div>
          <div className="flex-1 text-right">
            <div className="text-[18px] font-bold tracking-tight text-[#1a2744] leading-none">
              {to?.code}
            </div>
            <div className="text-[7px] text-[#1a2744]/35 mt-0.5">{to?.name}</div>
          </div>
        </div>

        {/* Info row */}
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <span className="text-[6px] tracking-[0.1em] text-[#1a2744]/25 uppercase">Gate A12</span>
            <span className="text-[6px] tracking-[0.1em] text-[#1a2744]/25 uppercase">Seat 8A</span>
          </div>
          <div className="text-[10px] font-mono font-medium text-[#1a2744]/50 tabular-nums">
            {String(rm).padStart(2, '0')}:{String(rs).padStart(2, '0')}
          </div>
        </div>

        {/* Barcode */}
        <div className="mt-2">
          <MiniBarcode />
        </div>
      </div>

      {/* Progress bar footer */}
      <div className="px-4 pb-2.5">
        <div className="w-full h-2 bg-[#1a2744]/6 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg,#c4a04a 0%,#d4b86a 40%,#1a2744 100%)',
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[6px] text-[#1a2744]/20 uppercase tracking-wider">{from?.name}</span>
          <span className="text-[6px] text-[#1a2744]/20 uppercase tracking-wider">{to?.name}</span>
        </div>
      </div>
    </div>
  );
}
