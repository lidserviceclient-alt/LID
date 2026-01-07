import React from "react";
import { Carousel, Card } from "./apple-cards-carousel";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const data = [
  {
    category: "Croissance",
    title: "Boostez vos ventes.",
    src: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=800&auto=format&fit=crop",
  },
  {
    category: "Productivité",
    title: "Gérez tout simplement.",
    src: "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=800&auto=format&fit=crop",
  },
  {
    category: "Innovation",
    title: "Outils de pointe.",
    src: "https://images.unsplash.com/photo-1713869791518-a770879e60dc?q=80&w=800&auto=format&fit=crop",
  },
  {
    category: "Support",
    title: "Accompagnement dédié.",
    src: "https://images.unsplash.com/photo-1599202860130-f600f4948364?q=80&w=800&auto=format&fit=crop",
  },
  {
    category: "Réseau",
    title: "Une communauté active.",
    src: "https://images.unsplash.com/photo-1602081957921-9137a5d6eaee?q=80&w=800&auto=format&fit=crop",
  },
  {
    category: "Carrière",
    title: "Rejoignez l'équipe.",
    src: "https://images.unsplash.com/photo-1511984804822-e16ba72f5848?q=80&w=800&auto=format&fit=crop",
  },
];

export default function Promotion({ isLogin = false, theme = "light" }) {
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
