import React from 'react'

const ActionBar = ({ onSendAlert = () => {}, onAuthorizeDispatch = () => {} }) => {
  return (
    <footer className="h-20 bg-tactical-surface/95 border-t border-tactical-border px-6 flex items-center justify-between shrink-0 z-30 shadow-2xl backdrop-blur-md">
      <div className="flex items-center space-x-4">
        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-white tracking-wide">Ready for Immediate Tactical Authorization</span>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded">GREEN-GO</span>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Batch 1 Allocation: <span className="text-slate-200 font-semibold">5 State Transport Heavy Buses, 2 Escort 4x4s</span> (200 Evacuees)
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={onSendAlert}
          className="px-4 py-2.5 rounded-xl border border-slate-700 bg-tactical-card hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-xs flex items-center space-x-2 transition shadow-md active:scale-95"
        >
          <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <span>Send Push Alert to Citizen View</span>
        </button>

        <button
          onClick={onAuthorizeDispatch}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs tracking-wider uppercase flex items-center space-x-2.5 shadow-lg glow-emerald transition transform active:scale-95 border border-emerald-400/40"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <span>Authorize Evacuation & Dispatch Convoy</span>
        </button>
      </div>
    </footer>
  )
}

export default ActionBar
