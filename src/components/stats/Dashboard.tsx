import { useMemo } from 'react';
import { useFlightStore } from '../../stores/flightStore';
import { getRankForMileage } from '../../utils/mileage';

export default function Dashboard() {
  const { stats, flights } = useFlightStore();
  const rank = getRankForMileage(stats.totalMileage);

  // Filter flights for today
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayFlights = useMemo(
    () => flights.filter((f) => f.startedAt.startsWith(todayStr)),
    [flights, todayStr],
  );
  const todayMileage = useMemo(
    () => todayFlights.reduce((s, f) => s + f.mileageEarned, 0),
    [todayFlights],
  );
  const todayFocusMinutes = useMemo(
    () => todayFlights.reduce((s, f) => s + Math.round(f.actualDuration / 60), 0),
    [todayFlights],
  );

  // Weekly mileage: last 7 days
  const weeklyData = useMemo(() => {
    const days: { label: string; mileage: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const prefix = d.toISOString().split('T')[0];
      const total = flights
        .filter((f) => f.startedAt.startsWith(prefix))
        .reduce((s, f) => s + f.mileageEarned, 0);
      days.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        mileage: total,
      });
    }
    return days;
  }, [flights]);
  const weeklyMax = Math.max(...weeklyData.map((d) => d.mileage), 1);

  // Monthly mileage: last 4 weeks
  const monthlyData = useMemo(() => {
    const weeks: { label: string; mileage: number }[] = [];
    const now = new Date();
    for (let w = 3; w >= 0; w--) {
      const end = new Date(now);
      end.setDate(now.getDate() - now.getDay() - w * 7);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      const total = flights
        .filter((f) => {
          const fd = new Date(f.startedAt);
          return fd >= start && fd <= end;
        })
        .reduce((s, f) => s + f.mileageEarned, 0);
      weeks.push({
        label: `W${4 - w}`,
        mileage: total,
      });
    }
    return weeks;
  }, [flights]);
  const monthlyMax = Math.max(...monthlyData.map((d) => d.mileage), 1);

  // Flight history: last 30 flights
  const recentFlights = useMemo(() => flights.slice(0, 30), [flights]);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">Statistics</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        <SummaryCard label="Total Mileage" value={stats.totalMileage.toLocaleString()} />
        <SummaryCard label="Total Flights" value={String(stats.totalFlights)} />
        <SummaryCard
          label="Streak"
          value={`${stats.currentStreak}${stats.longestStreak > stats.currentStreak ? ` (${stats.longestStreak})` : ''}`}
        />
        <SummaryCard label="Rank" value={rank.name} />
      </div>

      {/* Today cards */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="Today Mileage" value={todayMileage.toLocaleString()} />
        <SummaryCard label="Today Flights" value={String(todayFlights.length)} />
        <SummaryCard label="Focus Minutes" value={String(todayFocusMinutes)} />
      </div>

      {/* Weekly bar chart */}
      <div className="rounded-xl bg-slate-800/40 border border-slate-700/40 p-4">
        <h3 className="text-sm font-bold mb-3 text-slate-300">Weekly Mileage</h3>
        <div className="flex items-end justify-between gap-1 h-24">
          {weeklyData.map((d) => (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-gradient-to-t from-blue-600 to-blue-400 transition-all"
                style={{ height: `${(d.mileage / weeklyMax) * 100}%`, minHeight: d.mileage > 0 ? '4px' : '0' }}
              />
              <span className="text-[10px] text-slate-500">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly bar chart */}
      <div className="rounded-xl bg-slate-800/40 border border-slate-700/40 p-4">
        <h3 className="text-sm font-bold mb-3 text-slate-300">Monthly Mileage</h3>
        <div className="flex items-end justify-between gap-3 h-24">
          {monthlyData.map((d) => (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-gradient-to-t from-purple-600 to-purple-400 transition-all"
                style={{ height: `${(d.mileage / monthlyMax) * 100}%`, minHeight: d.mileage > 0 ? '4px' : '0' }}
              />
              <span className="text-[10px] text-slate-500">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Flight history */}
      <div className="rounded-xl bg-slate-800/40 border border-slate-700/40 p-4">
        <h3 className="text-sm font-bold mb-3 text-slate-300">Flight History</h3>
        <div className="space-y-1">
          {recentFlights.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-4">No flights yet</p>
          )}
          {recentFlights.map((f, i) => (
            <div
              key={f.startedAt + f.flightNumber + i}
              className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-slate-700/30 text-xs"
            >
              <div className="flex items-center gap-1 w-20 shrink-0">
                <span className="text-sm">&#127758;</span>
                <span className="font-bold text-slate-200">{f.departureCity}</span>
              </div>
              <span className="text-slate-500">&#8594;</span>
              <div className="flex items-center gap-1 w-20 shrink-0">
                <span className="text-sm">&#127758;</span>
                <span className="font-bold text-slate-200">{f.arrivalCity}</span>
              </div>
              <span className="text-slate-400 font-mono text-[10px] flex-1">{f.flightNumber}</span>
              <span className="text-slate-400 font-mono w-16 text-right">
                {f.mileageEarned.toLocaleString()}
              </span>
              <span className="text-slate-500 font-mono w-12 text-right">
                {Math.round(f.actualDuration / 60)}m
              </span>
              {f.status === 'emergency_landing' && (
                <span className="text-amber-400 text-[10px]" title={f.emergencyReason}>&#9888;</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-3 text-center">
      <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-lg font-black text-white">{value}</div>
    </div>
  );
}
