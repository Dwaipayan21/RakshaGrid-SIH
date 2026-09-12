import React, { useState } from 'react'

const TopNav = ({ theme = 'dark', onToggleTheme = () => {} }) => {
  const isLight = theme === 'light'
  const [selectedHazard, setSelectedHazard] = useState('Flood')

  return (
    <header className="h-16 border-b border-tactical-border bg-tactical-surface/90 backdrop-blur-md px-6 flex items-center justify-between z-30 shrink-0 transition-colors duration-300">
      {/* Brand & Mission Context */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-tactical-border/60 border border-tactical-neon/30 flex items-center justify-center text-tactical-neon shadow-[0_0_12px_rgba(0,240,255,0.25)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-wider text-white text-base">RAKSHAGRID</span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                CORE v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">
              Tactical Relocation Feasibility
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-tactical-border hidden md:block" />

        {/* Live Location & Surge Alert Indicator */}
        <div className="hidden lg:flex items-center space-x-3 text-xs">
          <div className="relative">
            <label htmlFor="hazard-type" className="sr-only">
              Hazard type
            </label>
            <select
              id="hazard-type"
              value={selectedHazard}
              onChange={(event) => setSelectedHazard(event.target.value)}
              className="appearance-none rounded bg-tactical-card border border-tactical-border pl-2.5 pr-7 py-1 text-slate-200 font-semibold tracking-wide cursor-pointer focus:outline-none focus:border-cyan-400"
            >
              <option>Flood</option>
              <option>Earthquake</option>
              <option>Landslide</option>
              <option>Cyclone</option>
            </select>
            <svg
              className="pointer-events-none absolute right-2 top-1/2 w-3 h-3 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>

          <div className="flex items-center space-x-2 px-2.5 py-1 rounded bg-tactical-card border border-tactical-border">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-red-400 font-semibold tracking-wide uppercase">
              Red Alert: Morigaon Sector
            </span>
          </div>
        </div>
      </div>

      {/* Right Header Utilities, Theme Switcher & Commander Status */}
      <div className="flex items-center space-x-4">
        {/* Theme Mode Toggle Button */}
        <button
          onClick={onToggleTheme}
          title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-tactical-card hover:bg-tactical-cardHover border border-tactical-border transition shadow-md active:scale-95 group"
        >
          {isLight ? (
            <>
              {/* Moon Icon for switching to dark mode */}
              <svg className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span className="text-xs font-mono font-bold text-slate-200">Light Mode</span>
            </>
          ) : (
            <>
              {/* Sun Icon for switching to light mode */}
              <svg className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span className="text-xs font-mono font-bold text-slate-200">Dark Mode</span>
            </>
          )}
        </button>

        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-mono font-medium text-emerald-400 uppercase tracking-wide">
            Feasibility 94.8% Opt.
          </span>
        </div>

        <div className="flex items-center space-x-3 pl-2 border-l border-tactical-border">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-200">Capt. R. Sharma</div>
            <div className="text-[10px] text-slate-400 font-mono">Lead Incident Cmdr</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center font-bold text-xs text-slate-200 ring-2 ring-emerald-500/20">
            RS
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopNav
