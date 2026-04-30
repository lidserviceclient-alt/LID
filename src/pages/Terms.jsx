import PageSEO from "@/components/PageSEO";
import { motion } from "framer-motion";
import { useAppConfig } from "@/features/appConfig/useAppConfig.js";

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">{title}</h2>
    <div className="text-neutral-600 dark:text-neutral-400 space-y-4 leading-relaxed text-sm sm:text-base">
      {children}
    </div>
  </div>
);

export default function Terms() {
  const { data: appConfig } = useAppConfig();
  const legalEmail = appConfig?.contactEmail || "legal@lid.ci";

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-20 pb-16 px-4 sm:px-6 lg:px-8"><PageSEO title="Conditions générales" description="Conditions générales d'utilisation de la marketplace Lid." canonical="/terms" />
      <div className="max-w-4xl mx-auto bg-white dark:bg-neutral-900 rounded-3xl p-8 sm:p-12 border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-2">Conditions Générales</h1>
          <p className="text-neutral-500 mb-12">Dernière mise à jour : 8 Janvier 2026</p>

          <Section title="1. Introduction">
            <p>
              Bienvenue sur LID. En accédant à notre site web et en utilisant nos services, vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation (CGU) et Conditions Générales de Vente (CGV). Veuillez les lire attentivement.
            </p>
          </Section>

          <Section title="2. Commandes">
            <p>
              Toute commande passée sur LID vaut acceptation des prix et descriptions des produits disponibles à la vente. Nous nous réservons le droit d'annuler ou de refuser toute commande d'un client avec lequel il existerait un litige relatif au paiement d'une commande antérieure.
            </p>
            <p>
              Les informations contractuelles sont présentées en langue française et feront l'objet d'une confirmation au plus tard au moment de la validation de votre commande.
            </p>
          </Section>

          <Section title="3. Prix et Paiement">
            <p>
              Les prix de nos produits sont indiqués en Francs CFA (XOF) toutes taxes comprises (TTC), hors participation aux frais de traitement et d'expédition.
            </p>
            <p>
              LID se réserve le droit de modifier ses prix à tout moment, mais le produit sera facturé sur la base du tarif en vigueur au moment de la validation de la commande et sous réserve de disponibilité.
            </p>
          </Section>

          <Section title="4. Livraison">
            <p>
              Les produits sont livrés à l'adresse de livraison indiquée au cours du processus de commande. Les délais indiqués sont des délais indicatifs, correspondant aux délais moyens de traitement et de livraison.
            </p>
            <p>
              En cas de retard d'expédition, un mail vous sera adressé pour vous informer d'une éventuelle conséquence sur le délai de livraison qui vous a été indiqué.
            </p>
          </Section>

          <Section title="5. Rétractation et Retours">
            <p>
              Conformément aux dispositions légales en vigueur, vous disposez d'un délai de 14 jours à compter de la réception de vos produits pour exercer votre droit de rétractation sans avoir à justifier de motifs ni à payer de pénalité.
            </p>
            <p>
              Les retours sont à effectuer dans leur état d'origine et complets (emballage, accessoires, notice). Dans ce cadre, votre responsabilité est engagée. Tout dommage subi par le produit à cette occasion peut être de nature à faire échec au droit de rétractation.
            </p>
          </Section>

          <Section title="6. Propriété Intellectuelle">
            <p>
              Tous les éléments du site LID sont et restent la propriété intellectuelle et exclusive de LID. Nul n'est autorisé à reproduire, exploiter, rediffuser, ou utiliser à quelque titre que ce soit, même partiellement, des éléments du site qu'ils soient logiciels, visuels ou sonores.
            </p>
          </Section>

          <Section title="7. Données Personnelles">
            <p>
              LID se réserve le droit de collecter les informations nominatives et les données personnelles vous concernant. Elles sont nécessaires à la gestion de votre commande, ainsi qu'à l'amélioration des services et des informations que nous vous adressons.
            </p>
            <p>
              Pour plus d'informations, veuillez consulter notre Politique de Confidentialité.
            </p>
          </Section>

          <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800 text-center">
            <p className="text-neutral-500 text-sm">
              Pour toute question relative à ces conditions, contactez-nous à{" "}
              <a href={`mailto:${legalEmail}`} className="text-orange-600 hover:underline">
                {legalEmail}
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
