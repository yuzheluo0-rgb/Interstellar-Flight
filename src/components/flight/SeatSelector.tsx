import { useState, useMemo, useCallback } from 'react';
import type { CabinClass } from '../../utils/mileage';

interface SeatSelectorProps {
  cabinClass: CabinClass;
  onConfirm: (seat: string) => void;
  onCancel: () => void;
}

interface SectionConf {
  key: string; name: string; rows: [number, number]; left: string[]; right: string[];
  color: string; classes: CabinClass[];
}

const LAYOUT: SectionConf[] = [
  { key: 'first', name: 'FIRST', rows: [1, 3], left: ['A','C'], right: ['D','F'], color: '#fbbf24', classes: ['legendary','captain','first'] },
  { key: 'biz', name: 'BUSINESS', rows: [4, 9], left: ['A','C'], right: ['D','F'], color: '#34d399', classes: ['business'] },
  { key: 'eco1', name: 'ECONOMY', rows: [10, 19], left: ['A','B','C'], right: ['D','E','F'], color: '#94a3b8', classes: ['economy'] },
  { key: 'eco2', name: 'ECONOMY', rows: [20, 30], left: ['A','B','C'], right: ['D','E','F'], color: '#94a3b8', classes: ['economy'] },
];

interface SeatData {
  id: string; row: number; col: string; canSelect: boolean; isWindow: boolean; isAisle: boolean;
}

export default function SeatSelector({ cabinClass, onConfirm, onCancel }: SeatSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const { seatMap, selectedData } = useMemo(() => {
    const map = new Map<string, SeatData & { occupied: boolean }>();
    let selData: (SeatData & { occupied: boolean }) | null = null;

    // Deterministic pseudo-random from seat ID
    const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h % 100) / 100; };

    for (const sec of LAYOUT) {
      const allCols = [...sec.left, ...sec.right];
      for (let r = sec.rows[0]; r <= sec.rows[1]; r++) {
        for (const c of allCols) {
          const id = r + c;
          const colIdx = allCols.indexOf(c);
          const isWindow = colIdx === 0 || colIdx === allCols.length - 1;
          const isAisle = colIdx === sec.left.length - 1 || colIdx === sec.left.length;
          const occupied = false;
          const sd = { id, row: r, col: c, canSelect: !occupied, isWindow, isAisle, occupied };
          map.set(id, sd);
          if (id === selected) selData = sd;
        }
      }
    }
    return { seatMap: map, selectedData: selData };
  }, [cabinClass, selected]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const id = (e.target as HTMLElement).dataset.seatId;
    if (!id) return;
    const sd = seatMap.get(id);
    if (sd && sd.canSelect) setSelected(id);
  }, [seatMap]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-[60]" onClick={onCancel}>
      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col" style={{ width: 460, maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        <div className="px-5 py-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>&#9992;</span>
              <span className="text-sm font-bold text-white">SELECT SEAT</span>
            </div>
            <div className="flex gap-3 text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><b className="w-3 h-3 rounded-sm inline-block bg-sky-600/60"/>窗</span>
              <span className="flex items-center gap-1"><b className="w-3 h-3 rounded-sm inline-block bg-slate-600"/>中</span>
              <span className="flex items-center gap-1"><b className="w-3 h-3 rounded-sm inline-block bg-slate-800"/>占</span>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-3 py-2" style={{ maxHeight: 'calc(90vh - 130px)' }}>
          {LAYOUT.map(sec => {
            return (
              <div key={sec.key} className="mb-3">
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sec.color }}/>
                  <span className="text-[10px] font-bold text-slate-300">{sec.name}</span>
                  <span className="text-[8px] text-slate-600">ROW {sec.rows[0]}-{sec.rows[1]}</span>
                </div>
                <div onClick={handleClick} className="flex flex-col items-center gap-px">
                  {Array.from({ length: sec.rows[1] - sec.rows[0] + 1 }, (_, ri) => {
                    const row = sec.rows[0] + ri;
                    return (
                      <div key={row} className="flex items-center gap-1">
                        <span className="text-[7px] text-slate-600 w-4 text-right font-mono">{row}</span>
                        <div className="flex gap-px">
                          {sec.left.map(c => {
                            const id = row + c;
                            const sd = seatMap.get(id);
                            if (!sd) return <div key={id} className="w-6 h-6"/>;
                            const sel = selected === id;
                            return (
                              <div key={id} data-seat-id={id}
                                className="w-6 h-6 flex items-center justify-center text-[7px] font-bold rounded-sm select-none transition-colors"
                                style={{
                                  cursor: sd.canSelect ? 'pointer' : 'default',
                                  backgroundColor: sel ? 'rgba(251,191,36,0.35)' : sd.canSelect ? sd.isWindow ? 'rgba(14,165,233,0.25)' : sd.isAisle ? 'rgba(100,116,139,0.5)' : 'rgba(100,116,139,0.3)' : sd.occupied ? 'rgba(30,41,59,0.5)' : 'rgba(30,41,59,0.3)',
                                  border: sel ? '1px solid rgba(251,191,36,0.7)' : sd.canSelect ? sd.isWindow ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(148,163,184,0.25)' : '1px solid rgba(51,65,85,0.3)',
                                  color: sel ? '#fcd34d' : sd.canSelect ? sd.isWindow ? '#bae6fd' : '#cbd5e1' : '#475569',
                                  boxShadow: sel ? '0 0 6px rgba(251,191,36,0.3)' : 'none',
                                  transform: sel ? 'scale(1.12)' : 'none',
                                }}
                              >{c}</div>
                            );
                          })}
                        </div>
                        <div className="w-2 flex flex-col items-center gap-px">
                          <span className="w-px h-px bg-slate-700 rounded-full"/>
                          <span className="w-px h-px bg-slate-700 rounded-full"/>
                        </div>
                        <div className="flex gap-px">
                          {sec.right.map(c => {
                            const id = row + c;
                            const sd = seatMap.get(id);
                            if (!sd) return <div key={id} className="w-6 h-6"/>;
                            const sel = selected === id;
                            return (
                              <div key={id} data-seat-id={id}
                                className="w-6 h-6 flex items-center justify-center text-[7px] font-bold rounded-sm select-none transition-colors"
                                style={{
                                  cursor: sd.canSelect ? 'pointer' : 'default',
                                  backgroundColor: sel ? 'rgba(251,191,36,0.35)' : sd.canSelect ? sd.isWindow ? 'rgba(14,165,233,0.25)' : sd.isAisle ? 'rgba(100,116,139,0.5)' : 'rgba(100,116,139,0.3)' : sd.occupied ? 'rgba(30,41,59,0.5)' : 'rgba(30,41,59,0.3)',
                                  border: sel ? '1px solid rgba(251,191,36,0.7)' : sd.canSelect ? sd.isWindow ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(148,163,184,0.25)' : '1px solid rgba(51,65,85,0.3)',
                                  color: sel ? '#fcd34d' : sd.canSelect ? sd.isWindow ? '#bae6fd' : '#cbd5e1' : '#475569',
                                  boxShadow: sel ? '0 0 6px rgba(251,191,36,0.3)' : 'none',
                                  transform: sel ? 'scale(1.12)' : 'none',
                                }}
                              >{c}</div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between bg-slate-800/50">
          <div>
            {selectedData ? (
              <span className="text-sm font-bold text-amber-400">{selectedData.id} <span className="text-[10px] text-slate-500 font-normal ml-1">{selectedData.isWindow ? '靠窗' : selectedData.isAisle ? '过道' : '中间'}</span></span>
            ) : (
              <span className="text-[10px] text-slate-500">选择座位</span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-400 hover:bg-slate-700">返回</button>
            <button onClick={() => selectedData && onConfirm(selectedData.id)} disabled={!selectedData}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500">确认</button>
          </div>
        </div>
      </div>
    </div>
  );
}
