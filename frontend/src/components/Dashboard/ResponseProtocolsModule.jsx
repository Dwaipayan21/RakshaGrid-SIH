import React, { useState } from 'react'

const initialProtocols = [
  {
    id: 'P-01',
    code: 'SOP-FL-101',
    title: 'Early Siren & Cell Warning Broadcast',
    description: 'Issue localized flood wave sirens & SMS alerts to Bhuragaon & Mayong circles.',
    status: 'COMPLETED',
    category: 'Warning',
    time: '17:35 IST',
  },
  {
    id: 'P-02',
    code: 'SOP-EV-204',
    title: 'Vulnerable Demographic Prioritization',
    description: 'Ensure Batch 1 buses transport 1,120 children and 540 elders first.',
    status: 'IN_PROGRESS',
    category: 'Evacuation',
    time: 'Active Now',
  },
  {
    id: 'P-03',
    code: 'SOP-RT-309',
    title: 'Evacuation Corridor Route Clearance',
    description: 'Deploy SDRF escorts on Jagiroad Route (12.4 km) to clear flood surge debris.',
    status: 'IN_PROGRESS',
    category: 'Logistics',
    time: 'ETA 15m',
  },
  {
    id: 'P-04',
    code: 'SOP-SH-412',
    title: 'Shelter Readiness & Supply Audit',
    description: 'Pre-position 620 free beds, water filtration & power generators at Jagiroad Camp.',
    status: 'READY',
    category: 'Shelter',
    time: 'Verified',
  },
  {
    id: 'P-05',
    code: 'SOP-MD-502',
    title: 'Post-Surge Medical & Triage Unit',
    description: 'Dispatch MMU-4 medical truck for waterborne pathogen screening post-evacuation.',
    status: 'PENDING',
    category: 'Medical',
  },
]

const ResponseProtocolsModule = ({ activeZoneName = 'Bhuragaon Circle' }) => {
  const [protocols, setProtocols] = useState(initialProtocols)
  const [isMinimized, setIsMinimized] = useState(false)

  const toggleProtocol = (id) => {
    setProtocols((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus =
            p.status === 'COMPLETED'
              ? 'PENDING'
              : p.status === 'IN_PROGRESS'
              ? 'COMPLETED'
              : p.status === 'READY'
              ? 'IN_PROGRESS'
              : 'COMPLETED'
          return { ...p, status: nextStatus }
        }
        return p
      })
    )
  }

  const completedCount = protocols.filter((p) => p.status === 'COMPLETED').length
  const progressPct = Math.round((completedCount / protocols.length) * 100)

  return (
    <div
      className={`absolute bottom-4 right-4 z-20 transition-all duration-300 pointer-events-auto ${
        isMinimized ? 'w-72' : 'w-80 md:w-96'
      }`}
      data-purpose="emergency-response-protocols-widget"
    >
      <div className="rounded-2xl bg-tactical-surface/95 backdrop-blur-md border border-tactical-border shadow-2xl overflow-hidden font-mono">
        {/* Widget Header */}
        <div className="p-3.5 bg-tactical-card border-b border-tactical-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Execution Protocols ({completedCount}/{protocols.length})
              </h3>
              <p className="text-[10px] text-slate-400">Target: {activeZoneName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              {progressPct}% Done
            </span>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 transition"
              title={isMinimized ? 'Expand Protocols' : 'Minimize Protocols'}
            >
              {isMinimized ? '▲ Expand' : '▼ Hide'}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1 overflow-hidden">
          <div
            className="bg-cyan-400 h-1 transition-all duration-500 glow-cyan"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Protocol List Body */}
        {!isMinimized && (
          <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
            {protocols.map((protocol) => {
              const isDone = protocol.status === 'COMPLETED'
              const isInProgress = protocol.status === 'IN_PROGRESS'
              const isReady = protocol.status === 'READY'

              return (
                <div
                  key={protocol.id}
                  onClick={() => toggleProtocol(protocol.id)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer ${
                    isDone
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-200'
                      : isInProgress
                      ? 'bg-amber-950/30 border-amber-500/40 text-slate-100 shadow-md'
                      : isReady
                      ? 'bg-sky-950/30 border-sky-500/40 text-slate-200'
                      : 'bg-tactical-card/70 border-tactical-border/70 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => toggleProtocol(protocol.id)}
                        className="w-3.5 h-3.5 accent-cyan-400 rounded cursor-pointer"
                      />
                      <span className="text-[10px] font-bold text-slate-400">{protocol.code}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 uppercase">
                        {protocol.category}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isInProgress
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          : isReady
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {protocol.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4
                    className={`text-xs font-bold mt-1 leading-snug ${
                      isDone ? 'line-through text-slate-400' : 'text-white'
                    }`}
                  >
                    {protocol.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                    {protocol.description}
                  </p>

                  {protocol.time && (
                    <div className="mt-1.5 text-[9px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
                      <span>Timestamp / Window:</span>
                      <span className="font-bold text-slate-200">{protocol.time}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ResponseProtocolsModule
