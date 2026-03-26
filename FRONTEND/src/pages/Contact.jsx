import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAppConfig } from "@/features/appConfig/useAppConfig.js";
import { useState } from "react";
import { sendContactMessage } from "@/services/contactService.js";
import { useNavigate } from "react-router-dom";

export default function Contact() {
  const navigate = useNavigate();
  const { data: appConfig } = useAppConfig();
  const contactEmail = appConfig?.contactEmail || "contact@lid.ci";
  const city = appConfig?.city || "Abidjan";
  const contactPhone = appConfig?.contactPhone || "+225 07 00 00 00 00";
  const [sending, setSending] = useState(false);
  const contactPhoneHref = `tel:${contactPhone.replace(/[^\d+]/g, "")}`;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const form = e.currentTarget;
      const data = new FormData(form);
      const payload = {
        lastName: `${data.get("lastName") || ""}`.trim(),
        firstName: `${data.get("firstName") || ""}`.trim(),
        email: `${data.get("email") || ""}`.trim(),
        subject: `${data.get("subject") || ""}`.trim(),
        message: `${data.get("message") || ""}`.trim()
      };

      await sendContactMessage(payload);
      toast.success("Message envoyé !", {
        description: "Nous vous répondrons dans les plus brefs délais."
      });
      form.reset();
    } catch (err) {
      toast.error("Envoi impossible", {
        description: err?.message || "Merci de réessayer."
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
          Contactez-nous
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Une question ? Une suggestion ? Notre équipe est là pour vous aider.
        </p>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Contact Info Side */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          {/* Info Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 mb-4">
                <Phone size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2 dark:text-white">Téléphone</h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-1">Lun-Ven de 8h à 18h</p>
              <a href={contactPhoneHref} className="text-neutral-900 dark:text-white font-medium hover:text-orange-600 transition-colors">
                {contactPhone}
              </a>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                <Mail size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2 dark:text-white">Email</h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-1">Réponse sous 24h</p>
              <a href={`mailto:${contactEmail}`} className="text-neutral-900 dark:text-white font-medium hover:text-orange-600 transition-colors">
                {contactEmail}
              </a>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 mb-4">
                <MapPin size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2 dark:text-white">Siège Social</h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                {city}
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 mb-4">
                <MessageSquare size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2 dark:text-white">Live Chat</h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-1">Disponible 7j/7</p>
              <button className="text-orange-600 font-bold text-sm hover:underline">
                Démarrer une discussion
              </button>
            </div>
          </div>

          {/* FAQ Teaser */}
          <div className="bg-neutral-900 dark:bg-white rounded-2xl p-8 text-white dark:text-neutral-900 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Une question fréquente ?</h3>
              <p className="text-neutral-300 dark:text-neutral-600 mb-6 max-w-sm">
                Consultez notre foire aux questions pour trouver des réponses immédiates.
              </p>
              <button 
              onClick={() => navigate("/faq")}
              className="px-6 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-full font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                Voir la FAQ
              </button>
            </div>
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-xl shadow-neutral-200/50 dark:shadow-black/20"
        >
          <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
            <Send className="w-6 h-6 text-orange-600" />
            Envoyez-nous un message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-900 dark:text-white">Nom</label>
                <input 
                  type="text" 
                  required
                  name="lastName"
                  placeholder="Votre nom"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-transparent focus:bg-white dark:focus:bg-neutral-900 focus:border-orange-500 ring-2 ring-transparent focus:ring-orange-500/20 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-900 dark:text-white">Prénom</label>
                <input 
                  type="text" 
                  required
                  name="firstName"
                  placeholder="Votre prénom"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-transparent focus:bg-white dark:focus:bg-neutral-900 focus:border-orange-500 ring-2 ring-transparent focus:ring-orange-500/20 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-900 dark:text-white">Email</label>
              <input 
                type="email" 
                required
                name="email"
                placeholder="vous@exemple.com"
                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-transparent focus:bg-white dark:focus:bg-neutral-900 focus:border-orange-500 ring-2 ring-transparent focus:ring-orange-500/20 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-900 dark:text-white">Sujet</label>
              <select
                name="subject"
                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-transparent focus:bg-white dark:focus:bg-neutral-900 focus:border-orange-500 ring-2 ring-transparent focus:ring-orange-500/20 transition-all outline-none"
              >
                <option value="Question sur une commande">Question sur une commande</option>
                <option value="Problème technique">Problème technique</option>
                <option value="Retour ou remboursement">Retour ou remboursement</option>
                <option value="Partenariat">Partenariat</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-900 dark:text-white">Message</label>
              <textarea 
                required
                rows={5}
                name="message"
                placeholder="Comment pouvons-nous vous aider ?"
                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-transparent focus:bg-white dark:focus:bg-neutral-900 focus:border-orange-500 ring-2 ring-transparent focus:ring-orange-500/20 transition-all outline-none resize-none"
              />
            </div>

            <button 
              type="submit"
              disabled={sending}
              className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 hover:shadow-orange-600/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {sending ? "Envoi…" : "Envoyer le message"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
