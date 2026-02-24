import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, PackageX, FileText, CheckCircle, ArrowRight, Minus, Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { createReturnRequest, getReturnOrder } from "@/services/returnsService";
import { resolveBackendAssetUrl } from "@/services/categoryService";

const steps = [
  { id: 1, title: "Identification", icon: FileText },
  { id: 2, title: "Produits", icon: PackageX },
  { id: 3, title: "Raison", icon: RefreshCw },
  { id: 4, title: "Confirmation", icon: CheckCircle },
];

export default function Returns() {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [formData, setFormData] = useState({
    orderId: "",
    email: "",
    reason: "",
    details: ""
  });
  const [orderPreview, setOrderPreview] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  useEffect(() => {
    const orderFromUrl = `${searchParams.get("order") || searchParams.get("orderNumber") || ""}`.trim();
    const emailFromUrl = `${searchParams.get("email") || ""}`.trim();
    if (!orderFromUrl && !emailFromUrl) return;

    setFormData((prev) => ({
      ...prev,
      orderId: orderFromUrl || prev.orderId,
      email: emailFromUrl || prev.email
    }));
  }, [searchParams]);

  const loadOrderPreview = async () => {
    const orderNumber = (formData.orderId || "").trim();
    const email = (formData.email || "").trim();

    if (!orderNumber || !email) {
      toast.error("Veuillez remplir tous les champs");
      return false;
    }

    setIsLoadingOrder(true);
    try {
      const data = await getReturnOrder(orderNumber, email);
      const rawItems = Array.isArray(data?.items) ? data.items : [];
      const items = rawItems.filter((it) => it && it.articleId);

      setOrderPreview(data || null);
      setOrderItems(items);
      setSelectedItems({});

      if (items.length === 0) {
        toast.error("Aucun article trouvé pour cette commande");
        return false;
      }

      return true;
    } catch (err) {
      toast.error(
        err?.response?.data?.errorMessage ||
          err?.response?.data?.message ||
          err?.message ||
          "Impossible de retrouver la commande."
      );
      setOrderPreview(null);
      setOrderItems([]);
      setSelectedItems({});
      return false;
    } finally {
      setIsLoadingOrder(false);
    }
  };

  const toggleItem = (articleId, maxQty) => {
    const key = `${articleId}`;
    const max = Math.max(1, Math.trunc(Number(maxQty) || 1));
    setSelectedItems((prev) => {
      const next = { ...(prev || {}) };
      if (next[key]) {
        delete next[key];
        return next;
      }
      next[key] = 1;
      if (next[key] > max) next[key] = max;
      return next;
    });
  };

  const setItemQuantity = (articleId, quantity, maxQty) => {
    const key = `${articleId}`;
    const max = Math.max(1, Math.trunc(Number(maxQty) || 1));
    const q = Math.max(1, Math.min(max, Math.trunc(Number(quantity) || 1)));
    setSelectedItems((prev) => ({ ...(prev || {}), [key]: q }));
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      const ok = await loadOrderPreview();
      if (!ok) return;
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      const selectedCount = Object.keys(selectedItems || {}).length;
      if (selectedCount === 0) {
        toast.error("Veuillez selectionner au moins un produit");
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleSubmit = async () => {
    const orderNumber = (formData.orderId || "").trim();
    const email = (formData.email || "").trim();
    const reason = (formData.reason || "").trim();
    const details = (formData.details || "").trim();
    const items = Object.entries(selectedItems || {})
      .map(([articleId, quantity]) => ({
        articleId: Number(articleId),
        quantity: Number(quantity),
      }))
      .filter(
        (it) =>
          Number.isFinite(it.articleId) &&
          it.articleId > 0 &&
          Number.isFinite(it.quantity) &&
          it.quantity > 0
      );

    if (!orderNumber || !email) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    if (items.length === 0) {
      toast.error("Veuillez selectionner au moins un produit");
      setCurrentStep(2);
      return;
    }
    if (!reason) {
      toast.error("Veuillez sélectionner un motif");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createReturnRequest({
        orderNumber,
        email,
        reason,
        details: details || null,
        items
      });
      setRequestId(res?.id ?? null);
      toast.success("Demande de retour enregistrée !");
      setCurrentStep(4);
    } catch (err) {
      toast.error(
        err?.response?.data?.errorMessage ||
          err?.response?.data?.message ||
          err?.message ||
          "Impossible d'enregistrer la demande."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Centre de <span className="text-[#6aa200]">Retours</span></h1>
          <p className="text-neutral-500 max-w-lg mx-auto">
            Nous voulons que vous soyez entièrement satisfait. Suivez les étapes ci-dessous pour effectuer un retour simple et rapide.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex justify-between items-center mb-12 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-neutral-100 dark:bg-neutral-900 -z-10" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#6aa200] -z-10 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }} 
          />
          
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-white dark:bg-neutral-950 px-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                ${currentStep >= step.id ? 'bg-[#6aa200] border-[#6aa200] text-white' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400'}`}
              >
                <step.icon size={18} />
              </div>
              <span className={`text-xs font-bold uppercase tracking-wide ${currentStep >= step.id ? 'text-[#6aa200]' : 'text-neutral-400'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* Form Container */}
        <motion.div 
          layout
          className="bg-neutral-50 dark:bg-neutral-900/50 p-6 md:p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl shadow-neutral-100/50 dark:shadow-none"
        >
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold">Retrouver votre commande</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-500">Numéro de commande</label>
                    <input 
                      type="text" 
                      placeholder="Ex: ORD-12"
                      value={formData.orderId}
                      onChange={(e) => setFormData({...formData, orderId: e.target.value})}
                      className="w-full p-4 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:border-[#6aa200] outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-500">Email utilisé</label>
                    <input 
                      type="email" 
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full p-4 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:border-[#6aa200] outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold">Sélection des produits</h2>

                {orderPreview?.orderNumber && (
                  <p className="text-sm text-neutral-500">
                    Commande :{" "}
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {orderPreview.orderNumber}
                    </span>
                  </p>
                )}

                {isLoadingOrder && (
                  <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-900/40 text-neutral-600 dark:text-neutral-300 text-sm">
                    Chargement des articles...
                  </div>
                )}

                {!isLoadingOrder && orderItems.length === 0 && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl text-yellow-700 dark:text-yellow-500 text-sm">
                    Aucun article trouvé pour cette commande.
                  </div>
                )}

                {!isLoadingOrder && orderItems.length > 0 && (
                  <div className="space-y-3">
                    {orderItems.map((it) => {
                      const articleId = it?.articleId;
                      const key = `${articleId}`;
                      const maxQty = Math.max(0, Math.trunc(Number(it?.quantity) || 0));
                      const selectedQty = Math.trunc(Number(selectedItems?.[key] || 0));
                      const checked = selectedQty > 0;
                      const image = resolveBackendAssetUrl(it?.imageUrl);
                      const disabled = !articleId || maxQty <= 0;

                      return (
                        <div
                          key={key}
                          className={`flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl bg-white dark:bg-neutral-950 border transition-colors ${
                            checked
                              ? "border-[#6aa200]"
                              : "border-neutral-200 dark:border-neutral-800"
                          } ${disabled ? "opacity-70" : "hover:border-[#6aa200]"} `}
                        >
                          <div className="w-16 h-16 rounded-lg bg-neutral-100 dark:bg-neutral-900 overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-800">
                            {image ? (
                              <img
                                src={image}
                                alt={it?.articleName || "Produit"}
                                className="w-full h-full object-cover"
                              />
                            ) : null}
                          </div>

                          <div className="flex-1">
                            <h3 className="font-bold">{it?.articleName || "Produit"}</h3>
                            <p className="text-sm text-neutral-500">Qté commandée : {maxQty}</p>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-4">
                            {checked && (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setItemQuantity(articleId, selectedQty - 1, maxQty)}
                                  disabled={disabled || selectedQty <= 1}
                                  className="w-9 h-9 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-center disabled:opacity-40"
                                >
                                  <Minus size={16} />
                                </button>
                                <input
                                  type="number"
                                  min={1}
                                  max={maxQty}
                                  value={selectedQty}
                                  onChange={(e) => setItemQuantity(articleId, e.target.value, maxQty)}
                                  disabled={disabled}
                                  className="w-16 text-center p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => setItemQuantity(articleId, selectedQty + 1, maxQty)}
                                  disabled={disabled || selectedQty >= maxQty}
                                  className="w-9 h-9 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-center disabled:opacity-40"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            )}

                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleItem(articleId, maxQty)}
                              disabled={disabled}
                              className="w-6 h-6 rounded border-neutral-300 text-[#6aa200] focus:ring-[#6aa200]"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold">Motif du retour</h2>
                <div className="space-y-4">
                  {['Taille incorrecte', 'Produit endommagé', 'Ne correspond pas à la photo', 'Changé d\'avis'].map((reason) => (
                    <label key={reason} className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900">
                      <input 
                        type="radio" 
                        name="reason" 
                        value={reason}
                        checked={formData.reason === reason}
                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                        className="text-[#6aa200] focus:ring-[#6aa200]" 
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                  <textarea 
                    placeholder="Détails supplémentaires (optionnel)"
                    className="w-full p-4 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:border-[#6aa200] outline-none min-h-[100px]"
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-8"
              >
                <div className="w-20 h-20 bg-[#6aa200]/10 text-[#6aa200] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={40} />
                </div>
                <h2 className="text-3xl font-bold">Demande Envoyée !</h2>
                <p className="text-neutral-500">
                  Votre demande de retour a bien été prise en compte{requestId ? ` (N° ${requestId})` : ""}. Vous recevrez par email votre étiquette de retour sous 24h.
                </p>
                <Link to="/" className="inline-block mt-8 px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 transition-opacity">
                  Retour à l'accueil
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800">
              <button 
                onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
                disabled={currentStep === 1 || isSubmitting || isLoadingOrder}
                className="px-6 py-2 rounded-lg font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30"
              >
                Précédent
              </button>
              <button 
                onClick={currentStep === 3 ? handleSubmit : handleNext}
                disabled={isSubmitting || isLoadingOrder}
                className="flex items-center gap-2 px-8 py-3 bg-[#6aa200] text-white rounded-xl font-bold hover:bg-[#5a8a00] transition-colors"
              >
                {currentStep === 3 ? (isSubmitting ? "Envoi..." : "Confirmer") : (isLoadingOrder ? "Chargement..." : "Suivant")}
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
