"use client";

import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const features = [
  {
    image: "https://i.pinimg.com/736x/45/75/a0/4575a043bedbb332559b3ffef0b7771c.jpg", // Delivery box
    title: "Livraison Express",
    description: "Expédition en 24/48h. Gratuite dès 130 000 FCFA d'achat."
  },
  {
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80&auto=format&fit=crop", // Payment
    title: "Paiement Sécurisé",
    description: "Transactions cryptées SSL. Visa, Mastercard, Paypal."
  },
  {
    image: "https://i.pinimg.com/736x/d9/38/31/d938311c78e6423fa5027aa29c7da6fc.jpg", // Return/Box
    title: "Retours Gratuits",
    description: "Satisfait ou remboursé. 30 jours pour changer d'avis."
  },
  {
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80&auto=format&fit=crop", // Support person
    title: "Service Client 7j/7",
    description: "Une équipe dédiée à votre écoute de 9h à 20h."
  }
];

export default function Reassurance() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <div className="w-full bg-white dark:bg-neutral-950 py-16 border-y border-neutral-100 dark:border-neutral-900 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="flex items-start gap-4 group cursor-pointer"
            >
              <motion.div 
                className="relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden shadow-lg"
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.4 }}
              >
                <div className="absolute inset-0 bg-neutral-900/5 group-hover:bg-transparent transition-colors z-10" />
                <motion.img 
                  src={feature.image} 
                  alt={feature.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                />
              </motion.div>
              
              <div className="flex flex-col pt-1">
                <motion.h3 
                  className="text-lg font-bold text-neutral-900 dark:text-white mb-1"
                  whileHover={{ x: 5, color: "#ea580c" }} // orange-600
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {feature.title}
                </motion.h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
