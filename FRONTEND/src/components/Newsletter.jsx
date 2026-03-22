import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Mail, ArrowRight, Check } from "lucide-react";
import { subscribeNewsletter } from "../services/newsletterService";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = (email || "").trim();
    if (!value) return;

    setError("");
    setStatus("loading");
    try {
      await subscribeNewsletter(value);
      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("idle");
      setError(err?.response?.data?.message || err?.message || "Erreur lors de l'inscription.");
    }
  };

  return (
    <section className="w-full py-24 bg-white dark:bg-neutral-950 relative overflow-hidden">
      
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      {/* Decorative Lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-semibold tracking-wider text-orange-600 uppercase bg-orange-50 dark:bg-orange-500/10 rounded-full border border-orange-100 dark:border-orange-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"/>
                Newsletter
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6 tracking-tight leading-tight">
                Restez connecté à <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">l'avant-garde.</span>
              </h2>
              
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Recevez nos collections exclusives, nos guides de style et nos offres privées directement dans votre boîte mail.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-sm text-neutral-500 dark:text-neutral-500 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-neutral-400" />
                  Hebdomadaire
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-neutral-400" />
                  Contenu exclusif
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-neutral-400" />
                  Désabonnement facile
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Form Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <div className="relative p-1 rounded-3xl bg-gradient-to-b from-neutral-100 to-white dark:from-neutral-800 dark:to-neutral-900 shadow-2xl shadow-neutral-200/50 dark:shadow-black/50">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-50" />
              
              <div className="relative bg-white dark:bg-neutral-900 rounded-[22px] p-8 border border-neutral-100 dark:border-neutral-800">
                <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-6 text-orange-600">
                  <Mail className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  Abonnez-vous
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6">
                  Rejoignez +10,000 membres privilégiés.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={status === "success" || status === "loading"}
                      className="w-full h-12 pl-4 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "success" || status === "loading"}
                    className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all duration-300 ${
                      status === "success"
                        ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                        : "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-orange-600 dark:hover:bg-orange-500 hover:text-white dark:hover:text-white shadow-lg shadow-neutral-900/10 dark:shadow-white/10"
                    }`}
                  >
                    {status === "loading" ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : status === "success" ? (
                      <>
                        <Check className="w-5 h-5" />
                        Inscrit !
                      </>
                    ) : (
                      <>
                        S'inscrire
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {error ? (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  ) : null}
                </form>
                
                <p className="mt-4 text-xs text-center text-neutral-400 dark:text-neutral-600">
                  En vous inscrivant, vous acceptez notre politique de confidentialité.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
