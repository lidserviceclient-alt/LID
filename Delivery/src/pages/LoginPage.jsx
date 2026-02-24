import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const heroImage =
  'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1600&q=80'

function LoginPage() {
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()
    navigate('/home')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.34, ease: 'easeOut' }}
      className="min-h-screen px-4 py-6 sm:px-6"
    >
      <div className="mx-auto grid min-h-[84vh] max-w-5xl overflow-hidden rounded-[28px] lid-card lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden lg:block">
          <img src={heroImage} alt="Delivery team" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/70" />
          <div className="absolute inset-x-8 top-8 text-white">
            <p className="font-display text-3xl font-semibold">LID</p>
            <p className="text-xs text-white/80">Portail livreur securise</p>
          </div>
          <div className="absolute inset-x-8 bottom-10 text-white">
            <h1 className="font-display text-4xl font-semibold leading-tight">Connexion livreur</h1>
            <p className="mt-3 text-sm text-white/80">Accede a tes missions, statut terrain et historique de livraisons.</p>
          </div>
        </section>

        <section className="flex flex-col justify-center bg-white px-6 py-8 sm:px-10">
          <div className="mb-8 lg:hidden">
            <p className="font-display text-3xl font-semibold text-slate-900">LID</p>
            <p className="text-xs text-slate-500">Portail livreur securise</p>
          </div>

          <h2 className="font-display text-3xl font-semibold text-slate-900">Se connecter</h2>
          <p className="mt-2 text-sm text-slate-500">Saisis tes identifiants professionnels.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email professionnel</label>
              <input
                type="email"
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-orange-400"
                placeholder="livreur@lid.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Mot de passe</label>
              <input
                type="password"
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-orange-400"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="inline-flex items-center gap-2 text-slate-500">
                <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300" />
                Rester connecte
              </label>
              <button type="button" className="font-semibold text-slate-700">
                Mot de passe oublie
              </button>
            </div>

            <button type="submit" className="w-full rounded-xl bg-slate-950 py-3 text-sm font-semibold text-white">
              Me connecter
            </button>

            <button
              type="button"
              onClick={() => navigate('/explore')}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700"
            >
              Retour Explore
            </button>
          </form>
        </section>
      </div>
    </motion.div>
  )
}

export default LoginPage
