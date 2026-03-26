import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPinned, Package, ShieldCheck, Sparkles } from 'lucide-react'

const MotionDiv = motion.div

const FEATURES = [
  {
    title: 'Missions',
    Icon: Package,
    description: 'Liste claire par statut (à récupérer, en cours, livrées).',
  },
  {
    title: 'Carte live',
    Icon: MapPinned,
    description: 'Position GPS + destination + itinéraire (si disponible).',
  },
  {
    title: 'Validation',
    Icon: ShieldCheck,
    description: 'Mets à jour le statut en 1 tap (EN_COURS, LIVRÉE, ÉCHEC).',
  },
]

export default function ExplorePage() {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-dvh bg-noise"
    >
      <div className="mx-auto min-h-dvh max-w-[430px] px-4 pb-safe pt-safe">
        <header className="pt-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[11px] font-bold text-slate-700">
            <Sparkles size={14} className="text-[var(--lid-accent)]" />
            Expérience mobile LID
          </div>
          <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight text-slate-950">Delivery app</h1>
          <p className="mt-2 text-sm text-slate-600">
            Une interface terrain : rapide, lisible, pensée pour les tournées.
          </p>
        </header>

        <section className="mt-6 lid-card rounded-[32px] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">LID</p>
              <p className="font-display mt-1 text-xl font-semibold text-slate-900">Pilote tes livraisons</p>
              <p className="mt-1 text-xs text-slate-500">Connecté au backoffice pour suivre l’activité.</p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--lid-accent-soft)] text-[var(--lid-accent)]">
              <MapPinned size={20} />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-slate-200 bg-white/70 p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white">
                    <feature.Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{feature.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-3">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 rounded-3xl bg-[var(--lid-accent)] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(106,162,0,0.22)]"
          >
            Se connecter
            <ArrowRight size={18} />
          </Link>
          <p className="text-center text-xs text-slate-500">
            Astuce : active la localisation pour profiter de la carte live.
          </p>
        </div>
      </div>
    </MotionDiv>
  )
}
