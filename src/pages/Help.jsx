import PageSEO from "@/components/PageSEO";
import { motion } from "framer-motion";
import { Search, Book, Shield, FileText, MessageCircle, Truck, RefreshCcw, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

export default function Help() {
  const categories = [
    {
      icon: Truck,
      title: "Livraison & Suivi",
      desc: "Suivre mon colis, délais et tarifs",
      link: "/faq#delivery"
    },
    {
      icon: RefreshCcw,
      title: "Retours & Remboursements",
      desc: "Politique de retour, échanges",
      link: "/faq#returns"
    },
    {
      icon: CreditCard,
      title: "Paiement",
      desc: "Moyens de paiement, factures",
      link: "/faq#payment"
    },
    {
      icon: Book,
      title: "Guide des tailles",
      desc: "Trouver ma taille idéale",
      link: "/faq#sizes"
    }
  ];

  const legalLinks = [
    { icon: FileText, title: "Conditions Générales d'Utilisation", link: "/terms" },
    { icon: Shield, title: "Politique de Confidentialité", link: "/privacy" },
    { icon: MessageCircle, title: "Contactez-nous", link: "/contact" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-20 pb-10 px-4 sm:px-6 lg:px-8"><PageSEO title="Centre d'aide" description="Besoin d'aide ? Retrouvez tous nos guides pour profiter pleinement de Lid." canonical="/help" />
      {/* Hero Search */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-neutral-900 dark:text-white mb-6"
        >
          Comment pouvons-nous vous aider ?
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative max-w-xl mx-auto"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Rechercher une réponse..." 
            className="w-full pl-12 pr-4 py-4 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg shadow-neutral-200/50 dark:shadow-black/20 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
          />
        </motion.div>
      </div>

      {/* Quick Categories */}
      <div className="max-w-6xl mx-auto mb-20">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-8">Thèmes fréquents</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
            >
              <Link 
                to={cat.link}
                className="block p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:shadow-lg hover:border-orange-500/30 transition-all group"
              >
                <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-neutral-600 dark:text-neutral-300 group-hover:bg-orange-600 group-hover:text-white transition-colors mb-4">
                  <cat.icon size={24} />
                </div>
                <h3 className="font-bold text-neutral-900 dark:text-white mb-1 group-hover:text-orange-600 transition-colors">{cat.title}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{cat.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legal & Support */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-8">Documentation & Légal</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {legalLinks.map((item, idx) => (
            <Link 
              key={idx} 
              to={item.link}
              className="flex flex-col items-center text-center p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <item.icon className="w-8 h-8 text-neutral-400 mb-3" />
              <span className="font-medium text-neutral-900 dark:text-white">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
