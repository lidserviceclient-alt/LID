import { motion } from 'framer-motion'
import { Mail, PhoneCall, ShieldAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getPublicAppConfig } from '../services/appConfig'

const MotionDiv = motion.div

export default function SupportPage() {
  const [supportEmail, setSupportEmail] = useState('support@lid.local')
  const [supportPhone, setSupportPhone] = useState('+225 01 02 03 04 05')
  const supportPhoneHref = `tel:${supportPhone.replace(/[^\d+]/g, '')}`

  useEffect(() => {
    let alive = true
    getPublicAppConfig()
      .then((cfg) => {
        if (!alive) return
        const email = cfg?.contactEmail ? `${cfg.contactEmail}` : ''
        if (email.trim()) setSupportEmail(email)
        const phone = cfg?.contactPhone ? `${cfg.contactPhone}` : ''
        if (phone.trim()) setSupportPhone(phone)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-4"
    >
      <section className="lid-card rounded-[28px] p-4">
        <h2 className="font-display text-xl font-semibold text-slate-900">Support & assistance</h2>
        <p className="mt-2 text-sm text-slate-500">
          Besoin d’aide sur une livraison ? Utilise ces raccourcis terrain.
        </p>

        <div className="mt-5 grid gap-3">
          <a
            href={supportPhoneHref}
            className="rounded-3xl bg-[var(--lid-accent)] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(106,162,0,0.22)]"
          >
            <span className="flex items-center gap-2">
              <PhoneCall size={18} />
              Appeler la hotline
            </span>
            <span className="mt-1 block text-xs font-medium text-white/70">{supportPhone}</span>
          </a>
          <a
            href={`mailto:${supportEmail}`}
            className="rounded-3xl border border-slate-200 bg-white/70 px-5 py-4 text-sm font-semibold text-slate-800"
          >
            <span className="flex items-center gap-2">
              <Mail size={18} />
              Envoyer un email
            </span>
            <span className="mt-1 block text-xs font-medium text-slate-500">{supportEmail}</span>
          </a>
        </div>
      </section>

      <section className="lid-card rounded-[28px] p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-slate-900">Raccourcis</h3>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            <ShieldAlert size={14} />
            Terrain
          </span>
        </div>
        <div className="mt-4 grid gap-3">
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-4">
            <p className="text-sm font-semibold text-slate-900">Client injoignable</p>
            <p className="mt-1 text-xs text-slate-500">
              Essaie 2 appels + un message, puis marque la livraison en échec si nécessaire.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-4">
            <p className="text-sm font-semibold text-slate-900">Adresse incorrecte</p>
            <p className="mt-1 text-xs text-slate-500">
              Ouvre la navigation GPS et valide avec le client avant de te déplacer.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-4">
            <p className="text-sm font-semibold text-slate-900">Incident colis</p>
            <p className="mt-1 text-xs text-slate-500">
              Prends une photo et contacte la hotline pour consigner l’incident.
            </p>
          </div>
        </div>
      </section>
    </MotionDiv>
  )
}
