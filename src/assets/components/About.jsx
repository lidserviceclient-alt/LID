import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { ShieldCheck, Truck, RotateCcw, Headset, Wallet, Star, ArrowRight } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Authenticité Garantie",
    description: "Chaque produit est certifié authentique par nos experts. Achetez en toute sérénité.",
    icon: <ShieldCheck className="w-8 h-8" />,
  },
  {
    title: "Livraison Express",
    description: "Expédition sous 24h et livraison suivie en temps réel partout en Côte d'Ivoire.",
    icon: <Truck className="w-8 h-8" />,
  },
  {
    title: "Retours Gratuits",
    description: "30 jours pour essayer. Retour simple, rapide et sans frais cachés.",
    icon: <RotateCcw className="w-8 h-8" />,
  },
  {
    title: "Service Premium",
    description: "Une équipe dédiée à votre écoute 7j/7 pour une expérience personnalisée.",
    icon: <Headset className="w-8 h-8" />,
  },
  {
    title: "Meilleur Tarif",
    description: "Nous vous garantissons les prix les plus compétitifs du marché.",
    icon: <Wallet className="w-8 h-8" />,
  },
  {
    title: "Excellence Client",
    description: "Rejoignez plus de 10 000 clients satisfaits qui nous font confiance.",
    icon: <Star className="w-8 h-8" />,
  },
];

export default function About() {
  return (
    <section className="w-full py-24 bg-neutral-50 dark:bg-neutral-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-[1000px] h-[1000px] rounded-full bg-orange-500/5 blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-[1000px] h-[1000px] rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-semibold tracking-wider text-orange-600 uppercase bg-orange-500/10 rounded-full"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"/>
            Pourquoi LID ?
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white mb-6 tracking-tight"
          >
            L'excellence <span className="relative whitespace-nowrap">
              <span className="relative z-10 text-orange-600">réinventée</span>
              <span className="absolute bottom-2 left-0 w-full h-3 bg-orange-200/50 dark:bg-orange-900/30 -z-0 skew-x-12 transform"/>
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed"
          >
            Nous ne vendons pas seulement des produits. Nous vous offrons une expérience d'achat fluide, sécurisée et haut de gamme.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative p-8 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-orange-500/30 transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10"
            >
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-lg group-hover:shadow-orange-500/20 group-hover:scale-110">
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3 group-hover:text-orange-600 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-base">
                {feature.description}
              </p>

              {/* Decorative corner */}
              <div className="absolute top-6 right-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                <ArrowRight className="w-5 h-5 text-orange-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
