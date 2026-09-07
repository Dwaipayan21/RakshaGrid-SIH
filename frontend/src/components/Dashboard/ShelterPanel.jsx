import React from 'react'

const iconDeck = [
  {
    key: 'topo',
    label: 'Elev',
    color: 'sky',
    title: 'Corridor Topography & Surge Clearance',
    path: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
  },
  {
    key: 'convoy',
    label: 'Route',
    color: 'amber',
    title: 'Convoy Execution Segments (3 Checkpoints)',
    path: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
  },
  {
    key: 'telemetry',
    label: 'Supp',
    color: 'emerald',
    title: 'Essential On-Site Telemetry (Filtration, Power, Meds)',
    path: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  },
  {
    key: 'matrix',
    label: 'Matrix',
    color: 'purple',
    title: 'Decision Matrix & Criteria Assessment',
    path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
  {
    key: 'params',
    label: 'Config',
    color: 'slate',
    title: 'Overrides & Audit Log',
    path: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
  },
]

const colorClasses = {
  sky: 'text-sky-400 hover:border-sky-400',
  amber: 'text-amber-400 hover:border-amber-400',
  emerald: 'text-emerald-400 hover:border-emerald-400',
  purple: 'text-purple-400 hover:border-purple-400',
  slate: 'text-slate-400 hover:border-slate-300',
}

// shelter: { name, capId, tag, addressLine, capacity, occupied, batchAllocated, batchTotal,
//            batchNote, secondaryNote, transitDuration }
const defaultShelter = {
  name: 'Shelter B (Govt Higher Secondary)',
  capId: 'AS-SH-09B',
  tag: 'Available (Elevated Dry Zone)',
  addressLine: 'Ward 09 Ridge Sector, Upper Dibrugarh',
  capacity: 500,
  occupied: 300,
  batchAllocated: 200,
  batchTotal: 850,
  secondaryNote: 'Priority 1: Vulnerable elders and children evacuated in Batch 1. Secondary batch (650 evacuees) routed to Shelter C.',
  transitDuration: '15 mins (Convoy)',
}

const ShelterPanel = ({ shelter = defaultShelter, onOpenDrawer = () => {} }) => {
  const free = shelter.capacity - shelter.occupied
  const occupiedPct = Math.round((shelter.occupied / shelter.capacity) * 100)
  const freePct = 100 - occupiedPct

  return (
    <aside className="w-80 xl:w-96 flex flex-col gap-3 shrink-0 z-20" data-purpose="live-shelter-capacity-module">
      <div className="rounded-2xl bg-tactical-surface border border-tactical-border p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{shelter.tag}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">Cap-ID: {shelter.capId}</span>
          </div>
          <h2 className="text-xl font-bold text-white leading-tight">{shelter.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-1">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            <span className="truncate">{shelter.addressLine}</span>
          </p>

          <div className="mt-5 p-4 rounded-xl bg-tactical-card border border-tactical-border">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold">Live Free Beds</span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {occupiedPct}% Compound Utilized
              </span>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold font-mono text-emerald-400 tracking-tight transition-all duration-300">{free}</span>
              <span className="text-lg font-mono text-slate-400">/ {shelter.capacity}</span>
              <span className="text-xs text-slate-400 ml-auto font-medium">Beds ready now</span>
            </div>
            <div className="mt-3 w-full bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
              <div className="bg-slate-600 h-2.5 transition-all duration-500" style={{ width: `${occupiedPct}%` }} title={`${shelter.occupied} Beds Occupied`} />
              <div className="bg-emerald-500 h-2.5 glow-emerald transition-all duration-500" style={{ width: `${freePct}%` }} title={`${free} Beds Available Now`} />
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-mono text-slate-400">
              <span>{shelter.occupied} Occupied</span>
              <span className="text-emerald-400 font-semibold">{free} Free Beds</span>
            </div>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-200">Settlement A Immediate Split</span>
              <span className="text-xs font-mono text-emerald-400 font-bold">{shelter.batchAllocated} of {shelter.batchTotal}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">{shelter.secondaryNote}</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-tactical-border/70 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Transit Duration:</span>
          <span className="text-white font-bold bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">{shelter.transitDuration}</span>
        </div>
      </div>

      {/* Quick Secondary Icon Deck Navigation */}
      <div className="bg-tactical-surface border border-tactical-border p-3.5 rounded-2xl flex items-center justify-between gap-1 shadow-lg" data-purpose="secondary-action-deck">
        {iconDeck.map((icon) => (
          <button
            key={icon.key}
            onClick={() => onOpenDrawer(icon.key)}
            title={icon.title}
            className={`w-12 h-12 rounded-xl bg-tactical-card hover:bg-tactical-cardHover border border-tactical-border flex flex-col items-center justify-center transition group relative ${colorClasses[icon.color]}`}
          >
            <svg className="w-5 h-5 transition group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d={icon.path} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            <span className="text-[9px] font-mono text-slate-400 mt-0.5 group-hover:text-slate-200">{icon.label}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}

export default ShelterPanel
