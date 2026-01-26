import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Shield, Lock, Eye, FileText, Printer, Calendar } from "lucide-react";
import Button from "../components/ui/Button";

export default function Privacy() {
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
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg tracking-tight">LID Confidentialité</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => window.print()} className="hidden sm:flex">
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Document Title */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Politique de Confidentialité
          </h1>
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <Calendar className="h-4 w-4" />
            <span>Dernière mise à jour : 25 Janvier 2026</span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 space-y-12">
          
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">1. Introduction</h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-lg">
              Chez Life Distribution ("LID"), nous accordons une importance capitale à la confidentialité et à la sécurité des données. Cette politique détaille comment nous traitons les informations au sein de notre plateforme Backoffice, un outil exclusivement réservé à nos collaborateurs et partenaires agréés.
            </p>
          </section>

          <div className="h-px bg-slate-100" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Eye className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">2. Données Collectées</h2>
            </div>
            <p className="text-slate-600 leading-relaxed mb-4">
              Dans le cadre de l'utilisation du Backoffice, nous collectons et traitons les catégories de données suivantes :
            </p>
            <ul className="grid sm:grid-cols-2 gap-4">
              <li className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="font-semibold block text-slate-900 mb-1">Identifiants</span>
                <span className="text-sm text-slate-500">Email professionnel, identifiant unique, rôle et permissions.</span>
              </li>
              <li className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="font-semibold block text-slate-900 mb-1">Traçabilité</span>
                <span className="text-sm text-slate-500">Logs de connexion (IP, date/heure), historique des actions (audit trails).</span>
              </li>
              <li className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="font-semibold block text-slate-900 mb-1">Opérations</span>
                <span className="text-sm text-slate-500">Données relatives aux commandes, stocks et clients gérés.</span>
              </li>
              <li className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="font-semibold block text-slate-900 mb-1">Session</span>
                <span className="text-sm text-slate-500">Cookies techniques et tokens d'authentification sécurisés.</span>
              </li>
            </ul>
          </section>

          <div className="h-px bg-slate-100" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lock className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">3. Sécurité & Protection</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              La sécurité est au cœur de notre infrastructure. Nous appliquons des protocoles stricts pour garantir l'intégrité et la confidentialité de vos données :
            </p>
            <div className="space-y-3 mt-4">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 mt-2.5 rounded-full bg-green-500" />
                <p className="text-slate-600"><strong className="text-slate-900">Chiffrement :</strong> Toutes les données en transit sont chiffrées via TLS 1.3.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 mt-2.5 rounded-full bg-green-500" />
                <p className="text-slate-600"><strong className="text-slate-900">Contrôle d'accès :</strong> Authentification stricte et gestion des droits basée sur le principe du moindre privilège.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 mt-2.5 rounded-full bg-green-500" />
                <p className="text-slate-600"><strong className="text-slate-900">Surveillance :</strong> Monitoring 24/7 pour détecter et prévenir toute tentative d'intrusion.</p>
              </div>
            </div>
          </section>

          <div className="bg-slate-50 p-6 rounded-xl text-center space-y-2">
            <h3 className="font-semibold text-slate-900">Une question sur vos données ?</h3>
            <p className="text-sm text-slate-500">
              Contactez notre DPO ou le service informatique à <a href="mailto:privacy@lid-distribution.com" className="text-primary hover:underline">privacy@lid-distribution.com</a>
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
