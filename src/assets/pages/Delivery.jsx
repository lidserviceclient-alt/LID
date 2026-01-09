import { motion } from "framer-motion";
import { Truck, Zap, Globe, MapPin, Package, Clock, CheckCircle } from "lucide-react";

const CoverageMap = () => (
  <div className="relative w-full h-[400px] bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl">
    {/* Map Background */}
    <div className="absolute inset-0 opacity-20" style={{ 
      backgroundImage: 'radial-gradient(circle at center, #333 1px, transparent 1px)', 
      backgroundSize: '24px 24px' 
    }} />
    
    {/* Cote d'Ivoire Shape Simulation (Stylized) */}
    <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[300px] h-[300px]">
            {/* Abidjan Hub */}
            <motion.div 
                className="absolute bottom-10 right-10 z-20"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ type: "spring" }}
            >
                <div className="w-4 h-4 bg-[#6aa200] rounded-full shadow-[0_0_20px_#6aa200] animate-pulse" />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white font-bold text-xs whitespace-nowrap bg-black/50 px-2 py-1 rounded">Abidjan (Hub Central)</span>
            </motion.div>

            {/* Other Cities */}
            {[
                { top: '20%', left: '30%', name: 'Bouaké' },
                { top: '40%', left: '10%', name: 'Man' },
                { top: '10%', left: '40%', name: 'Korhogo' },
                { top: '60%', left: '70%', name: 'San Pedro' },
                { top: '30%', left: '80%', name: 'Abengourou' },
            ].map((city, i) => (
                <motion.div 
                    key={i}
                    className="absolute z-10"
                    style={{ top: city.top, left: city.left }}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <div className="w-2 h-2 bg-white rounded-full" />
                    <span className="absolute top-3 left-1/2 -translate-x-1/2 text-neutral-400 text-[10px] whitespace-nowrap">{city.name}</span>
                </motion.div>
            ))}

            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                 <motion.path 
                    d="M 220 230 L 90 60" // Abidjan -> Korhogo (Approx)
                    stroke="url(#line-gradient)" 
                    strokeWidth="1" 
                    fill="none"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 1.5 }}
                 />
                 <motion.path 
                    d="M 220 230 L 90 120" // Abidjan -> Bouaké
                    stroke="url(#line-gradient)" 
                    strokeWidth="1" 
                    fill="none"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 1.2 }}
                 />
                 <motion.path 
                    d="M 220 230 L 30 120" // Abidjan -> Man
                    stroke="url(#line-gradient)" 
                    strokeWidth="1" 
                    fill="none"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 1.8 }}
                 />
                  <defs>
                    <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6aa200" stopOpacity="0" />
                        <stop offset="50%" stopColor="#6aa200" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#6aa200" stopOpacity="0" />
                    </linearGradient>
                  </defs>
            </svg>
        </div>
    </div>
  </div>
);

export default function Delivery() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white">
       <div className="max-w-5xl mx-auto space-y-16">
          
          {/* Header */}
          <div className="text-center space-y-6">
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-bold tracking-tight"
            >
                Livraison <span className="text-[#6aa200]">Rapide & Sûre</span>
            </motion.h1>
            <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
                Nous livrons vos envies partout en Côte d'Ivoire. Choisissez la méthode qui vous convient le mieux.
            </p>
          </div>

          {/* Methods Grid */}
          <div className="grid md:grid-cols-3 gap-6">
              {[
                  { 
                      title: "Standard", 
                      price: "3 250 FCFA", 
                      time: "3-5 Jours", 
                      desc: "La solution économique pour vos achats quotidiens.",
                      icon: Truck,
                      color: "bg-blue-50 text-blue-600 border-blue-200"
                  },
                  { 
                      title: "Express", 
                      price: "5 000 FCFA", 
                      time: "24-48 Heures", 
                      desc: "Pour les plus pressés. Priorité garantie.",
                      icon: Zap,
                      color: "bg-orange-50 text-orange-600 border-orange-200",
                      featured: true
                  },
                  { 
                      title: "Point Relais", 
                      price: "Gratuit", 
                      time: "2-4 Jours", 
                      desc: "Retirez votre colis près de chez vous quand vous voulez.",
                      icon: Package,
                      color: "bg-purple-50 text-purple-600 border-purple-200"
                  }
              ].map((method, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -5 }}
                    className={`p-8 rounded-3xl border ${method.featured ? 'border-[#6aa200] bg-[#6aa200]/5 ring-4 ring-[#6aa200]/10' : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50'} relative overflow-hidden group`}
                  >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${method.color} dark:bg-opacity-10`}>
                          <method.icon size={28} />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{method.title}</h3>
                      <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-3xl font-bold text-[#6aa200]">{method.price}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-neutral-500 mb-6">
                          <Clock size={16} />
                          {method.time}
                      </div>
                      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {method.desc}
                      </p>
                  </motion.div>
              ))}
          </div>

          {/* Coverage Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                  <h2 className="text-3xl font-bold">Une couverture nationale</h2>
                  <p className="text-neutral-500 text-lg leading-relaxed">
                      Notre réseau logistique s'étend sur tout le territoire ivoirien. 
                      Que vous soyez à Abidjan, Bouaké, ou San Pedro, nous vous garantissons une livraison sécurisée.
                  </p>
                  <ul className="space-y-4">
                      {[
                          "Suivi en temps réel de votre colis",
                          "Assurance incluse sur tous les envois",
                          "Service client disponible 7j/7",
                          "Possibilité de reprogrammer la livraison"
                      ].map((item, i) => (
                          <li key={i} className="flex items-center gap-3">
                              <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full text-green-600">
                                  <CheckCircle size={16} />
                              </div>
                              <span className="font-medium">{item}</span>
                          </li>
                      ))}
                  </ul>
              </div>
              <CoverageMap />
          </div>

       </div>
    </div>
  );
}