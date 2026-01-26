import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Gavel, AlertTriangle, CheckCircle, FileCheck, Calendar, ShieldAlert } from "lucide-react";
import Button from "../components/ui/Button";

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-5xl">
          <Link 
            to="/login" 
            className="group flex items-center text-sm font-medium text-slate-600 hover:text-primary transition-colors"
          >
            <div className="p-1 rounded-full group-hover:bg-slate-100 mr-2 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </div>
            Retour à la connexion
          </Link>
          <div className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg tracking-tight">LID Conditions</span>
          </div>
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Document Title */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Conditions d'Utilisation
          </h1>
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <Calendar className="h-4 w-4" />
            <span>Version 2.0 • Applicable dès le 25 Janvier 2026</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileCheck className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">1. Acceptation</h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-lg">
                L'accès à ce Backoffice est strictement réservé au personnel autorisé de Life Distribution. En vous connectant, vous reconnaissez avoir lu, compris et accepté sans réserve les présentes conditions d'utilisation ainsi que la charte informatique de l'entreprise.
              </p>
            </section>

            <div className="h-px bg-slate-100 my-8" />

            <div className="grid md:grid-cols-2 gap-6">
              {/* Interdictions */}
              <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="font-bold text-red-900">Interdictions Strictes</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "Partage de compte ou de mot de passe.",
                    "Exportation de données clients non autorisée.",
                    "Accès via réseau public sans VPN.",
                    "Installation de logiciels tiers."
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bonnes pratiques */}
              <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-emerald-900">Bonnes Pratiques</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "Verrouillage de session automatique.",
                    "Signalement d'activité suspecte.",
                    "Mots de passe complexes (12+ chars).",
                    "Mise à jour régulière des accès."
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-emerald-800">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="h-px bg-slate-100 my-8" />

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">2. Responsabilité & Sanctions</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Chaque utilisateur est responsable de l'ensemble des actions effectuées depuis son compte. Tout manquement aux règles de sécurité ou tentative d'accès non autorisé pourra entraîner :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600 mt-2">
                <li>La suspension immédiate des accès.</li>
                <li>Des sanctions disciplinaires pouvant aller jusqu'au licenciement.</li>
                <li>Des poursuites pénales en cas de vol de données ou sabotage.</li>
              </ul>
            </section>
          </div>

          <div className="text-center">
            <p className="text-slate-500 text-sm">
              En continuant à utiliser ce service, vous confirmez votre accord avec ces conditions.
            </p>
          </div>

        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-500 text-sm pb-8">
          <p>© {new Date().getFullYear()} Life Distribution. Tous droits réservés.</p>
        </footer>
      </main>
    </div>
  );
}
