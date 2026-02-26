import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus, Minus } from "lucide-react";
import { useAppConfig } from "@/features/appConfig/useAppConfig.js";

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className={`font-bold text-lg ${isOpen ? 'text-orange-600' : 'text-neutral-900 dark:text-white'} group-hover:text-orange-600 transition-colors`}>
          {question}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQ() {
  const { data: appConfig } = useAppConfig();
  const hubCity = appConfig?.city || "Abidjan";

  const faqs = [
    {
      category: "Commandes & Livraison",
      items: [
        {
          question: "Quels sont les délais de livraison ?",
          answer: `Nous livrons généralement sous 2 à 5 jours ouvrables à ${hubCity} et ses environs. Pour l'intérieur du pays, comptez 3 à 7 jours. Les délais peuvent varier en fonction de la disponibilité des produits.`
        },
        {
          question: "Comment suivre ma commande ?",
          answer: "Une fois votre commande expédiée, vous recevrez un email et un SMS contenant un lien de suivi. Vous pouvez également suivre votre colis depuis votre espace 'Mon Compte'."
        },
        {
          question: "Puis-je modifier ma commande après validation ?",
          answer: "Si votre commande n'a pas encore été expédiée, vous pouvez nous contacter rapidement pour la modifier. Une fois expédiée, aucune modification n'est possible."
        }
      ]
    },
    {
      category: "Retours & Remboursements",
      items: [
        {
          question: "Quelle est votre politique de retour ?",
          answer: "Vous disposez de 14 jours après réception pour retourner un article. Il doit être dans son état d'origine, non porté et avec ses étiquettes. Les frais de retour sont à votre charge sauf erreur de notre part."
        },
        {
          question: "Quand serai-je remboursé ?",
          answer: "Le remboursement est effectué sous 5 à 10 jours ouvrables après réception et vérification de votre retour, via le même moyen de paiement utilisé lors de l'achat."
        }
      ]
    },
    {
      category: "Produits & Stocks",
      items: [
        {
          question: "Les produits sont-ils authentiques ?",
          answer: "Absolument. LID s'engage à ne vendre que des produits 100% authentiques provenant directement des marques ou de distributeurs agréés."
        },
        {
          question: "Comment savoir si ma taille est disponible ?",
          answer: "Sur chaque fiche produit, les tailles disponibles sont affichées. Si une taille est grisée, elle est en rupture de stock. Vous pouvez activer une alerte pour être notifié de son retour."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">Foire Aux Questions</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Les réponses à vos questions les plus fréquentes.
          </p>
        </div>

        <div className="space-y-12">
          {faqs.map((section, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-1 bg-orange-600 rounded-full"></span>
                {section.category}
              </h2>
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                {section.items.map((item, i) => (
                  <FAQItem key={i} question={item.question} answer={item.answer} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
