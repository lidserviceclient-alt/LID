import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

function HomePage() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.34, ease: 'easeOut' }}
      className="min-h-screen px-4 py-6 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="lid-card rounded-3xl p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">LID Operations</p>
              <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                Tableau de bord livraison
              </h1>
              <p className="mt-2 text-sm text-slate-500">Suivi en temps reel des courses, statuts et activite terrain.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate('/explore')}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Explore
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
              >
                Connexion
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Courses en cours</p>
              <p className="font-display mt-1 text-2xl font-semibold">12</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Taux de reussite</p>
              <p className="font-display mt-1 text-2xl font-semibold">97.4%</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Revenu journalier</p>
              <p className="font-display mt-1 text-2xl font-semibold">$245.00</p>
            </article>
            <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs text-emerald-700">Statut flotte</p>
              <p className="font-display mt-1 text-2xl font-semibold text-emerald-800">Operationnel</p>
            </article>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6">
            <article className="lid-card rounded-3xl p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">Suivi en cours</h2>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">In Transit</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Tracking ID</p>
                <p className="font-display text-xl font-semibold">PAQ-327-P21</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs text-slate-500">Depart</p>
                    <p className="text-sm font-semibold text-slate-800">15, Idumota RD</p>
                  </div>
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs text-slate-500">Destination</p>
                    <p className="text-sm font-semibold text-slate-800">21, Ikeja Lagos</p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                    <span>Received</span>
                    <span>In Transit</span>
                    <span>Delivered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full border-2 border-slate-900 bg-white" />
                    <span className="h-[2px] flex-1 bg-slate-900" />
                    <span className="h-3 w-3 rounded-full border-2 border-slate-900 bg-white" />
                    <span className="h-[2px] flex-1 bg-slate-300" />
                    <span className="h-3 w-3 rounded-full bg-slate-300" />
                  </div>
                </div>
              </div>
            </article>

            <article className="lid-card rounded-3xl p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">Activites recentes</h2>
                <button className="text-xs font-semibold text-slate-500">Voir tout</button>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">PAQ-401-A36</p>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Completed</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">iPhone 17 Pro Max 256G</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">PAQ-412-C11</p>
                    <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">In Transit</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">Samsung 75\" OLED Display</p>
                </div>
              </div>
            </article>
          </section>

          <aside className="space-y-6">
            <article className="lid-card rounded-3xl p-5 sm:p-6">
              <h2 className="font-display text-xl font-semibold">Delivery Details</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-slate-500">Receiver</span><span className="font-semibold">John Doe</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-500">Address</span><span className="font-semibold">12, Palm Groove</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-500">Contact</span><span className="font-semibold">+234 - 123 - 201 - 419</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-500">Item</span><span className="font-semibold">Samsung 75\" OLED</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-500">Note</span><span className="font-semibold text-red-500">Fragile</span></div>
              </div>
              <button className="mt-4 w-full rounded-xl bg-slate-950 py-3 text-sm font-semibold text-white">Track Shipping</button>
            </article>

            <article className="lid-card rounded-3xl p-5 sm:p-6">
              <h2 className="font-display text-xl font-semibold">Historique</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="grid grid-cols-[70px_1fr] gap-3"><span className="font-semibold text-slate-900">9:30</span><p>Le colis est arrive au centre de tri local.</p></div>
                <div className="grid grid-cols-[70px_1fr] gap-3"><span className="font-semibold text-slate-900">12:00</span><p>Le colis est sorti en livraison. ETA: 26 Jan.</p></div>
                <div className="grid grid-cols-[70px_1fr] gap-3"><span className="font-semibold text-slate-900">15:45</span><p>Le colis est en traitement au hub regional.</p></div>
              </div>
            </article>
          </aside>
        </main>
      </div>
    </motion.div>
  )
}

export default HomePage
