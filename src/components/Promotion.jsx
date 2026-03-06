import React from "react";
import { Carousel, Card } from "./apple-cards-carousel";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const data = [
  {
    category: "Croissance",
    title: "Vos ventes jusqu’à +30%.",
    src: "https://i.pinimg.com/736x/31/4c/6b/314c6bafe2e1bc7614f68d078eafb5de.jpg",
  },
  {
    category: "Conversion",
    title: "Transformez plus de visiteurs.",
    src: "https://github.com/lidserviceclient-alt/imgProduits/blob/main/visitor.png?raw=true",
  },
  {
    category: "Automatisation",
    title: "Automatisez vos ventes.",
    src: "https://i.pinimg.com/1200x/3f/fb/81/3ffb813b012b9381f4e2c69731a3c150.jpg",
  },
  {
    category: "Support",
    title: "Accompagnement dédié.",
    src: "https://i.pinimg.com/736x/0f/a6/92/0fa6922a3267de2fa94d0ec3471dc4aa.jpg",
  },
  {
    category: "Visibilité",
    title: "Réseau de clients.",
    src: "https://github.com/lidserviceclient-alt/imgProduits/blob/main/network.png?raw=true",
  },
  {
    category: "Revenus",
    title: "Revenus récurrents.",
    src: "https://github.com/lidserviceclient-alt/imgProduits/blob/main/finance.png?raw=true",
  },
];

export default function Promotion({ isLogin = false, theme = "light", enableMotion = true }) {
  const cards = data.map((card, index) => (
    <Card 
      key={card.src} 
      card={card} 
      index={index} 
      className={isLogin ? "h-60 w-40 md:h-60 md:w-40" : undefined}
    />
  ));

  if (isLogin) {
    const borderColor = theme === "dark" ? "border-white/10" : "border-neutral-100";
    const titleColor = theme === "dark" ? "text-white/40" : "text-neutral-400";

    if (!enableMotion) {
      return (
        <div className={`w-full py-0 overflow-hidden border-t ${borderColor} mt-0`}>
          <h2 className={`text-xs font-bold ${titleColor} uppercase tracking-widest mb-6 px-1`}>
            Pourquoi nous choisir ?
          </h2>
          <div className="flex gap-6 overflow-x-auto no-scrollbar">
            {cards.map((card, i) => (
              <div key={i} className="shrink-0">
                {card}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className={`w-full py-0 overflow-hidden border-t ${borderColor} mt-0`}>
        <h2 className={`text-xs font-bold ${titleColor} uppercase tracking-widest mb-6 px-1`}>
          Pourquoi nous choisir ?
        </h2>
        {/* Auto-scrolling marquee */}
        <div className="flex overflow-hidden mask-linear-gradient">
          <motion.div 
            className="flex gap-6"
            animate={{ x: "-50%" }}
            transition={{ 
              repeat: Infinity, 
              duration: 40, 
              ease: "linear" 
            }}
            style={{ width: "max-content" }}
          >
            {[...cards, ...cards].map((card, i) => (
              <div key={i} className="shrink-0 transform hover:scale-105 transition-transform duration-300">
                {card}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  if (!enableMotion) {
    return (
      <div className="w-full h-full pt-0">
        <div className="max-w-7xl mb:mb-12 mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
            Devenir partenaire
          </h2>
          <p className="mt-4 mb-3 text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-4xl font-sans">
            Devenir partenaire de LID vous permet de bénéficier de toutes les fonctionnalités de l'application, de gérer vos commandes, de suivre vos livraisons et de vous assurer une satisfaction client exceptionnelle.
          </p>
        </div>
        <div className="px-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.slice(0, 4).map((card) => (
            <div key={card.src} className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <img
                src={card.src}
                alt={card.title}
                width="800"
                height="450"
                loading="lazy"
                className="w-full h-44 object-cover"
              />
              <div className="p-4">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">{card.category}</p>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{card.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full pt-0">
      <div className="max-w-7xl mb:mb-12 mx-auto px-4 md:px-8">
        <h2 className="text-3xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
          Devenir partenaire
        </h2>
        <p className="mt-4 mb-3 text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-4xl font-sans">
          Devenir partenaire de LID vous permet de bénéficier de toutes les fonctionnalités de l'application, de gérer vos commandes, de suivre vos livraisons et de vous assurer une satisfaction client exceptionnelle.
        </p>
      </div>
      <Carousel items={cards} />
    </div>
  );
}
