import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, Truck, MapPin, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

// Mock Map Component
const DeliveryMap = ({ status }) => {
  // 0: Order Placed, 1: Prepared, 2: Shipped, 3: Out for Delivery, 4: Delivered
  const progress = {
    "pending": 0,
    "processing": 25,
    "shipped": 50,
    "out_for_delivery": 75,
    "delivered": 100
  }[status] || 0;

  return (
    <div className="relative w-full h-[300px] md:h-[400px] bg-neutral-100 dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
      {/* Map Background Pattern */}
      <div className="absolute inset-0 opacity-10 dark:opacity-20" 
           style={{ backgroundImage: 'radial-gradient(#888 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {/* Stylized Route Path */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <motion.path
          d="M 50 200 Q 200 100 400 200 T 800 200"
          fill="none"
          stroke="#e5e5e5"
          strokeWidth="4"
          className="dark:stroke-neutral-800"
        />
        <motion.path
          d="M 50 200 Q 200 100 400 200 T 800 200"
          fill="none"
          stroke="#6aa200"
          strokeWidth="4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress / 100 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </svg>

      {/* Animated Landmarks */}
      {[
        { x: "10%", y: "50%", label: "Entrepôt", icon: Package },
        { x: "50%", y: "50%", label: "Centre de Tri", icon: Truck },
        { x: "90%", y: "50%", label: "Destination", icon: MapPin }
      ].map((point, i) => (
        <motion.div
          key={i}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
          style={{ left: point.x, top: point.y }}
        >
          <div className={`p-2 rounded-full ${i * 50 <= progress ? 'bg-[#6aa200] text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400'} transition-colors duration-500`}>
            <point.icon size={20} />
          </div>
          <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">{point.label}</span>
        </motion.div>
      ))}

      {/* Moving Truck */}
      <motion.div
        className="absolute top-1/2 left-[10%] -translate-y-1/2 -translate-x-1/2 z-10"
        animate={{ 
          left: `${10 + (progress * 0.8)}%`,
          y: progress === 50 ? -50 : 0 // Simple mock curve follow effect
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      >
        <div className="relative">
          <div className="bg-white dark:bg-neutral-950 p-2 rounded-full shadow-xl border border-neutral-200 dark:border-neutral-800 text-[#6aa200]">
            <Truck size={24} fill="currentColor" className="text-[#6aa200]" />
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#6aa200]/20 rounded-full animate-ping" />
        </div>
      </motion.div>
    </div>
  );
};

export default function OrderTracking() {
  const [orderId, setOrderId] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = (e) => {
    e.preventDefault();
    if (!orderId) {
      toast.error("Veuillez entrer un numéro de commande");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTrackingData({
        id: orderId,
        status: "shipped", // processing, shipped, out_for_delivery, delivered
        eta: "12 Jan 2026",
        location: "En transit - Abidjan Nord",
        timeline: [
          { status: "Commande confirmée", date: "08 Jan, 10:30", done: true },
          { status: "Préparation en cours", date: "08 Jan, 14:00", done: true },
          { status: "Expédié", date: "09 Jan, 09:15", done: true },
          { status: "En livraison", date: "Estimé 12 Jan", done: false },
          { status: "Livré", date: "-", done: false },
        ]
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold tracking-tight"
          >
            Suivre ma <span className="text-[#6aa200]">Commande</span>
          </motion.h1>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
            Entrez votre numéro de commande pour suivre son parcours en temps réel sur notre carte interactive.
          </p>
        </div>

        {/* Search Input */}
        <motion.form 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleTrack}
          className="relative max-w-lg mx-auto"
        >
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#6aa200] transition-colors" />
            <input
              type="text"
              placeholder="Ex: LID-7829-XJ"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-transparent focus:border-[#6aa200] focus:ring-2 focus:ring-[#6aa200]/20 outline-none transition-all text-lg font-medium"
            />
            <button 
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-[#6aa200] text-white font-bold hover:bg-[#5a8a00] transition-colors disabled:opacity-50"
            >
              {isLoading ? "..." : "Suivre"}
            </button>
          </div>
        </motion.form>

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {trackingData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Status Card */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-neutral-50 dark:bg-neutral-900/50 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Statut Actuel</h3>
                    <p className="text-2xl font-bold mt-1 flex items-center gap-2">
                      <Truck className="text-[#6aa200]" />
                      {trackingData.status === 'shipped' && "En Transit vers le Hub"}
                    </p>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Estimation</h3>
                    <p className="text-4xl font-bold mt-1">{trackingData.eta}</p>
                  </div>
                </div>

                <div className="bg-[#6aa200] p-6 rounded-2xl text-white flex flex-col justify-between relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-sm font-medium text-white/80 uppercase tracking-wider">Dernière étape</h3>
                    <p className="text-xl font-bold mt-1">{trackingData.location}</p>
                  </div>
                  <div className="relative z-10 mt-4">
                     <button className="flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all">
                        Détails complets <ArrowRight size={16} />
                     </button>
                  </div>
                  <Package className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 rotate-12" />
                </div>
              </div>

              {/* Interactive Map */}
              <DeliveryMap status={trackingData.status} />

              {/* Timeline */}
              <div className="bg-neutral-50 dark:bg-neutral-900/50 p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                <h3 className="text-xl font-bold mb-6">Historique</h3>
                <div className="space-y-8 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-200 dark:before:bg-neutral-800">
                  {trackingData.timeline.map((step, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative pl-12"
                    >
                      <div className={`absolute left-0 top-1 w-7 h-7 rounded-full border-4 flex items-center justify-center bg-white dark:bg-neutral-950 ${step.done ? 'border-[#6aa200] text-[#6aa200]' : 'border-neutral-300 dark:border-neutral-700 text-neutral-300'}`}>
                        {step.done && <div className="w-2 h-2 rounded-full bg-[#6aa200]" />}
                      </div>
                      <div>
                        <h4 className={`font-bold ${step.done ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>
                          {step.status}
                        </h4>
                        <p className="text-sm text-neutral-500">{step.date}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}