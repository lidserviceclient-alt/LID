import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const heroImage =
  'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80'

function ExplorePage() {
  const navigate = useNavigate()
  const sliderRef = useRef(null)
  const pointerIdRef = useRef(null)
  const startXRef = useRef(0)
  const startOffsetRef = useRef(0)
  const [offset, setOffset] = useState(0)
  const [maxOffset, setMaxOffset] = useState(0)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const updateBounds = () => {
      if (!sliderRef.current) {
        return
      }

      const containerWidth = sliderRef.current.clientWidth
      const knobSize = 52
      const sidePadding = 8
      const nextMax = Math.max(containerWidth - knobSize - sidePadding * 2, 0)
      setMaxOffset(nextMax)
      setOffset((current) => Math.min(current, nextMax))
    }

    updateBounds()
    window.addEventListener('resize', updateBounds)
    return () => window.removeEventListener('resize', updateBounds)
  }, [])

  const clamp = (value) => Math.min(Math.max(value, 0), maxOffset)

  const handlePointerDown = (event) => {
    pointerIdRef.current = event.pointerId
    startXRef.current = event.clientX
    startOffsetRef.current = offset
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (!dragging || event.pointerId !== pointerIdRef.current) {
      return
    }

    const delta = event.clientX - startXRef.current
    setOffset(clamp(startOffsetRef.current + delta))
  }

  const handlePointerEnd = (event) => {
    if (event.pointerId !== pointerIdRef.current) {
      return
    }

    setDragging(false)
    pointerIdRef.current = null

    if (offset >= maxOffset * 0.74) {
      setOffset(maxOffset)
      setTimeout(() => navigate('/login'), 120)
      return
    }

    setOffset(0)
  }

  const progress = maxOffset > 0 ? offset / maxOffset : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.34, ease: 'easeOut' }}
      className="min-h-screen px-4 py-6 sm:px-6"
    >
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[28px] lid-card sm:rounded-[34px]">
        <div className="grid min-h-[84vh] lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative">
            <img src={heroImage} alt="Delivery truck" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/20 to-black/85" />

            <div className="absolute inset-0 flex flex-col px-6 pb-8 pt-7 text-white sm:px-8">
              <div>
                <p className="font-display text-3xl font-semibold">LID</p>
                <p className="text-xs text-white/75">Smart logistics platform</p>
              </div>

              <div className="mt-auto">
                <div className="mb-5 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-white" />
                  <span className="h-2 w-9 rounded-full bg-orange-500" />
                  <span className="h-2 w-2 rounded-full bg-white/45" />
                </div>
                <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
                  Smart Shipping
                  <br />
                  Made Practical
                </h1>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
                  Pilot your deliveries with clear statuses, live progress, and fast rider actions.
                </p>
              </div>
            </div>
          </section>

          <section className="flex flex-col bg-slate-950 px-6 pb-8 pt-7 text-white sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-300">Quick Access</p>
            <h2 className="font-display mt-2 text-2xl font-semibold">Entrer dans le portail LID</h2>
            <p className="mt-2 text-sm text-slate-300">
              Glisse le bouton pour ouvrir la session livreur et afficher les operations.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <article className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4">
                <p className="text-xs text-slate-400">Livraisons actives</p>
                <p className="font-display mt-1 text-2xl font-semibold">12</p>
              </article>
              <article className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4">
                <p className="text-xs text-slate-400">Temps moyen</p>
                <p className="font-display mt-1 text-2xl font-semibold">28 min</p>
              </article>
            </div>

            <div ref={sliderRef} className="mt-auto relative h-16 rounded-full bg-slate-800 p-2 ring-1 ring-slate-700/80">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="text-base font-semibold text-slate-100">Get Started</span>
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-6 flex items-center text-2xl text-slate-500" style={{ opacity: 1 - progress * 0.55 }}>
                ››
              </div>
              <button
                type="button"
                aria-label="Slide to enter"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
                onPointerLeave={handlePointerEnd}
                className={`absolute left-2 top-2 inline-flex h-[52px] w-[52px] touch-none select-none items-center justify-center rounded-full bg-orange-500 text-lg font-bold text-white transition-transform ${
                  dragging ? 'duration-75' : 'duration-200'
                }`}
                style={{ transform: `translateX(${offset}px)` }}
              >
                ■
              </button>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  )
}

export default ExplorePage
