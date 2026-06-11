import PageSEO from "@/components/PageSEO";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Server } from "lucide-react";

const PrivacyCard = ({ icon: Icon, title, children }) => (
  <div className="bg-neutral-50 dark:bg-neutral-950/50 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center text-orange-600">
        <Icon size={20} />
      </div>
      <h3 className="font-bold text-neutral-900 dark:text-white">{title}</h3>
    </div>
    <div className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed space-y-2">
      {children}
    </div>
  </div>
);

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 pt-20 pb-16 px-4 sm:px-6 lg:px-8"><PageSEO title="Confidentialité" description="Politique de confidentialité et protection de vos données personnelles sur Lid." canonical="/privacy" />
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full text-orange-600 mb-6">
            <Shield size={32} />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">Politique de Confidentialité</h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Chez LID, la protection de vos données personnelles est une priorité. Nous nous engageons à traiter vos informations avec transparence et sécurité.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <PrivacyCard icon={Eye} title="Collecte des données">
            <p>Nous collectons les informations que vous nous fournissez directement :</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Identité (nom, prénom)</li>
              <li>Coordonnées (email, téléphone, adresse)</li>
              <li>Informations de paiement (sécurisées)</li>
              <li>Historique de commandes</li>
            </ul>
          </PrivacyCard>

          <PrivacyCard icon={Server} title="Utilisation des données">
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Traiter et livrer vos commandes</li>
              <li>Vous informer du statut de livraison</li>
              <li>Améliorer votre expérience d'achat</li>
              <li>Lutter contre la fraude</li>
            </ul>
          </PrivacyCard>

          <PrivacyCard icon={Lock} title="Sécurité">
            <p>
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données contre l'accès non autorisé, la perte ou l'altération.
            </p>
            <p>
              Toutes les transactions bancaires sont cryptées via le protocole SSL.
            </p>
          </PrivacyCard>

          <PrivacyCard icon={Shield} title="Vos droits">
            <p>Conformément à la réglementation, vous disposez d'un droit :</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>D'accès à vos données</li>
              <li>De rectification</li>
              <li>D'effacement ("droit à l'oubli")</li>
              <li>De portabilité</li>
            </ul>
          </PrivacyCard>
        </div>

        {/* Cookies Section */}
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-3xl p-8 sm:p-12 border border-neutral-200 dark:border-neutral-800">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Gestion des Cookies</h2>
          <div className="prose prose-neutral dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-400">
            <p>
              Un cookie est un petit fichier texte déposé sur votre terminal lors de la visite du site. Ils ont notamment pour but de collecter des informations relatives à votre navigation et de vous adresser des services personnalisés.
            </p>
            
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mt-6 mb-3">Types de cookies utilisés</h3>
            <div className="grid sm:grid-cols-2 gap-6 mt-4">
              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white mb-2">Cookies strictement nécessaires</h4>
                <p className="text-sm">Indispensables au fonctionnement du site (panier, connexion compte).</p>
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white mb-2">Cookies analytiques</h4>
                <p className="text-sm">Nous permettent de connaître l'utilisation et les performances du site.</p>
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white mb-2">Cookies fonctionnels</h4>
                <p className="text-sm">Permettent de mémoriser vos choix et préférences.</p>
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white mb-2">Cookies publicitaires</h4>
                <p className="text-sm">Utilisés pour vous présenter des offres adaptées à vos centres d'intérêts.</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
              <p className="text-sm">
                Vous pouvez à tout moment modifier vos préférences en matière de cookies via le panneau de configuration disponible en bas de page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
