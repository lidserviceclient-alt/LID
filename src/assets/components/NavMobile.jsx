import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Heart, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../provider/CartContext";

export default function NavMobile() {
  const location = useLocation();
  const { cartCount } = useCart();
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (cartCount > 0) {
      setBump(true);
      const timer = setTimeout(() => setBump(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  const navItems = [
    { icon: ShoppingBag, label: "Boutique", path: "/shop" },
    { icon: Heart, label: "Favoris", path: "/wishlist" },
    { icon: null, label: "Home", path: "/", isLogo: true },
    { icon: ShoppingCart, label: "Panier", path: "/cart" },
    { icon: User, label: "Compte", path: "/login" },
  ];

  return (
    <div className="w-full relative pointer-events-none">
       {/* Container for the nav items */}
       <div className="pointer-events-auto rounded-t-[40px] w-full bg-white/90 dark:bg-neutral-950/90 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-800 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] pb-safe pt-2">
          <div className="flex items-end justify-between px-2 max-w-md mx-auto relative z-10">
            {navItems.map((item, index) => {
               const isActive = location.pathname === item.path;
               
               // Center Logo Button
               if (item.isLogo) {
                   return (
                      <div key={index} className="relative -top-8 flex-shrink-0 mx-2">
                          <Link to={item.path} className="flex flex-col items-center justify-center group">
                              <div className={cn(
                                  "w-16 h-16 rounded-full bg-[#6aa200] shadow-[0_8px_20px_rgba(106,162,0,0.4)] flex items-center justify-center border-[6px] border-white dark:border-neutral-950 transform transition-all duration-300 ease-out z-20",
                                  isActive ? "scale-110 shadow-[0_12px_24px_rgba(106,162,0,0.5)]" : "group-active:scale-95"
                              )}>
                                  <motion.img 
                                    src="/imgs/lid-green.png" 
                                    alt="Home" 
                                    className="w-8 h-8 object-contain brightness-0 invert" 
                                    whileHover={{ rotate: 10, scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                  />
                              </div>
                              <span className={cn(
                                "absolute -bottom-6 text-[10px] font-bold text-[#6aa200] transition-all duration-300 whitespace-nowrap",
                                isActive ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                              )}>
                                Accueil
                              </span>
                          </Link>
                          
                          {/* Decorative curve behind the button (optional, handled by border trick usually) */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-transparent rounded-full border-[6px] border-transparent shadow-none pointer-events-none" />
                      </div>
                   );
               }

               // Standard Icons
               const Icon = item.icon;
               return (
                   <Link 
                      key={index} 
                      to={item.path} 
                      className={cn(
                          "flex flex-col items-center justify-center w-16 h-14 gap-1 transition-all duration-300 relative group",
                          isActive ? "text-[#6aa200]" : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                      )}
                   >
                      <div className="relative">
                        <Icon 
                          size={24} 
                          strokeWidth={isActive ? 2.5 : 2} 
                          className={cn(
                            "transition-all duration-300", 
                            isActive ? "-translate-y-1" : "group-hover:scale-110"
                          )} 
                        />
                        {/* Notification Dot for Cart */}
                        {item.path === "/cart" && cartCount > 0 && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: bump ? 1.5 : 1 }}
                            className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-neutral-950 flex items-center justify-center z-10"
                          >
                            {cartCount}
                          </motion.span>
                        )}
                      </div>
                      
                      <span className={cn(
                        "text-[10px] font-medium transition-all duration-300 absolute bottom-1", 
                        isActive ? "opacity-100 translate-y-0 font-bold" : "opacity-0 translate-y-2"
                      )}>
                          {item.label}
                      </span>
                      
                      {/* Active Indicator Dot */}
                      {isActive && (
                          <motion.div 
                              layoutId="nav-indicator"
                              className="absolute -bottom-1 w-1 h-1 bg-[#6aa200] rounded-full"
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                      )}
                   </Link>
               );
            })}
          </div>
       </div>
    </div>
  );
}
