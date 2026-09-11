import React, { useState } from 'react'

const TopNav = ({ theme = 'dark', onToggleTheme = () => {} }) => {
  const isLight = theme === 'light'

  const [showLogin, setShowLogin] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showHazards, setShowHazards] = useState(false)
  const [selectedHazard, setSelectedHazard] = useState(null)

  const hazards = ['Flood', 'Earthquake', 'Landslide', 'Cyclone']

  const users = [
    { name: 'Dwaipayan Barui', role: ' District Disaster Management Officer', initials: 'RS' },
    { name: 'Bidisha Barui', role: 'National Disaster Response Officer', initials: 'AD' },
    { name: 'Soumya Barui', role: 'State Disaster Management Officer', initials: 'VS' },
    { name: 'Trishnika Barui', role: 'National Disaster Management Officer', initials: 'PB' },
    { name: 'Rajashree Barui', role: 'Municipal Corporation Officer', initials: 'AM' },
  ]

  const handleUserSelect = (user) => {
    setSelectedUser(user)
    setShowLogin(false)
  }

  const handleHazardSelect = (hazard) => {
    setSelectedHazard(hazard)
    setShowHazards(false)
  }

  return (
    <header className="h-16 border-b border-tactical-border bg-tactical-surface/90 backdrop-blur-md px-6 flex items-center justify-between z-[2000] shrink-0 transition-colors duration-300">
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
          <div className="relative z-[60]">
            <button
              onClick={() => {
                setShowHazards(!showHazards)
                setShowLogin(false)
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-tactical-card hover:bg-tactical-cardHover border border-tactical-border transition"
              aria-expanded={showHazards}
              aria-haspopup="menu"
            >
              <span className="text-xs font-mono font-bold text-slate-200">
                {selectedHazard || 'Hazards'}
              </span>
              <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showHazards ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>

            {showHazards && (
              <div className="absolute left-0 top-full mt-2 w-44 rounded-xl bg-tactical-surface border border-tactical-border shadow-2xl overflow-hidden z-[100]" role="menu">
                <div className="px-3 py-2 border-b border-tactical-border">
                  <p className="text-[10px] text-slate-500 font-mono tracking-widest">Select Hazard</p>
                </div>

                {hazards.map((hazard) => (
                  <button
                    key={hazard}
                    onClick={() => handleHazardSelect(hazard)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-left text-xs text-slate-300 hover:bg-tactical-cardHover hover:text-white transition"
                    role="menuitem"
                  >
                    <span>{hazard}</span>
                    {selectedHazard === hazard && <span className="text-emerald-400">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 px-2.5 py-1 rounded bg-tactical-card border border-tactical-border">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-red-400 font-semibold tracking-wide">
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

        <div className="relative pl-2 border-l border-tactical-border">
          <button
            onClick={() => setShowLogin(!showLogin)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-tactical-card hover:bg-tactical-cardHover border border-tactical-border transition"
            aria-expanded={showLogin}
            aria-haspopup="menu"
          >
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 19a4 4 0 00-8 0m4-8a3 3 0 100-6 3 3 0 000 6zm5 2v6m3-3h-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            <span className="text-xs font-mono font-bold text-slate-200">Login</span>
            <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showLogin ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>

          {showLogin && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-tactical-surface border border-tactical-border shadow-2xl overflow-hidden z-50" role="menu">
              <div className="px-4 py-3 border-b border-tactical-border">
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Login As</p>
              </div>

              {users.map((user) => (
                <button
                  key={user.name}
                  onClick={() => handleUserSelect(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-tactical-cardHover transition"
                  role="menuitem"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-300">
                    {user.initials}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-200">{user.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{user.role}</div>
                  </div>
                  {selectedUser?.name === user.name && <span className="text-emerald-400 text-xs">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default TopNav
