import React from 'react'

// activeKey: null | 'topo' | 'convoy' | 'telemetry' | 'matrix' | 'params'
// Pass the title + body content per key from the parent, or extend this file
// with the real per-drawer content as you build each one out.
const Drawer = ({ activeKey, onClose, title, children }) => {
  const isOpen = Boolean(activeKey)

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      <div
        className={`fixed right-0 top-0 bottom-0 w-full max-w-lg bg-tactical-surface border-l border-tactical-border z-[9999] p-6 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  )
}

export default Drawer
