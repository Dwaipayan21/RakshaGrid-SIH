import React from 'react';

const DisasterAreaStatusLegend = () => {
  return (
    <div
      className="disaster-area-status-card absolute bottom-4 right-4 z-[1000] max-w-[210px] sm:max-w-[230px] rounded-xl p-3 font-mono text-xs select-none pointer-events-auto transition-all duration-300"
    >
      {/* Legend Header */}
      <div className="flex items-center justify-between border-b border-slate-700/40 dark:border-slate-700/60 pb-1.5 mb-2">
        <span className="legend-title-text font-bold tracking-wider text-[11px] uppercase text-cyan-400">
          AREA STATUS
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
      </div>

      {/* Status Items */}
      <div className="space-y-2">
        {/* RED */}
        <div className="flex items-start space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 mt-0.5 shadow-sm shadow-red-500/50" />
          <div className="leading-tight">
            <div className="font-bold text-[11px] text-red-500 dark:text-red-400 tracking-tight">
              HIGH RISK / DANGER
            </div>
            <div className="legend-subtext text-[10px] text-slate-400 font-sans">
              Hazardous area
            </div>
          </div>
        </div>

        {/* ORANGE */}
        <div className="flex items-start space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 mt-0.5 shadow-sm shadow-amber-500/50" />
          <div className="leading-tight">
            <div className="font-bold text-[11px] text-amber-600 dark:text-amber-400 tracking-tight">
              AT RISK
            </div>
            <div className="legend-subtext text-[10px] text-slate-400 font-sans">
              May be affected
            </div>
          </div>
        </div>

        {/* GREEN */}
        <div className="flex items-start space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-0.5 shadow-sm shadow-emerald-500/50" />
          <div className="leading-tight">
            <div className="font-bold text-[11px] text-emerald-600 dark:text-emerald-400 tracking-tight">
              SAFE ZONE
            </div>
            <div className="legend-subtext text-[10px] text-slate-400 font-sans">
              Relatively safe
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisasterAreaStatusLegend;
