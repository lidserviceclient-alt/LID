function MobileShell({ children }) {
  return (
    <div className="relative w-[360px] max-w-full aspect-[9/19.5] rounded-[2.5rem] bg-black shadow-2xl overflow-hidden border border-zinc-700/60">
      <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-black/90 to-black/40 z-20 pointer-events-none" />
      <div className="relative z-10 flex flex-col h-full">{children}</div>
    </div>
  )
}

export default MobileShell
