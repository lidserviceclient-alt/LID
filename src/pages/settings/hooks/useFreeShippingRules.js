import { useState } from "react";
import { backofficeApi } from "../../../services/api.js";
import { patchSettingsResolver } from "../../../resolvers/settingsResolver.js";
import { useSettingsSeed } from "./useSettingsSeed.js";

const DEFAULT_FREE_SHIPPING_FORM = {
  thresholdAmount: "10000",
  progressMessageTemplate: "Plus que {remaining} FCFA pour la livraison gratuite",
  unlockedMessage: "Livraison gratuite débloquée !",
  enabled: false
};

export function useFreeShippingRules() {
  const [freeShippingRules, setFreeShippingRules] = useState([]);
  const [freeShippingLoading, setFreeShippingLoading] = useState(false);
  const [freeShippingError, setFreeShippingError] = useState("");
  const [freeShippingSuccess, setFreeShippingSuccess] = useState("");
  const [freeShippingModalOpen, setFreeShippingModalOpen] = useState(false);
  const [freeShippingEditTarget, setFreeShippingEditTarget] = useState(null);
  const [freeShippingForm, setFreeShippingForm] = useState(DEFAULT_FREE_SHIPPING_FORM);
  const [freeShippingSaving, setFreeShippingSaving] = useState(false);
  const [freeShippingDeletingId, setFreeShippingDeletingId] = useState("");
  const [freeShippingTogglingId, setFreeShippingTogglingId] = useState("");

  useSettingsSeed("freeShippingRules", {
    apply: (list) => setFreeShippingRules(Array.isArray(list) ? list : []),
    setLoading: setFreeShippingLoading,
    setError: setFreeShippingError
  });

  async function loadFreeShippingRules() {
    try {
      setFreeShippingLoading(true);
      setFreeShippingError("");
      const list = await backofficeApi.freeShippingRules();
      const next = Array.isArray(list) ? list : [];
      setFreeShippingRules(next);
      patchSettingsResolver({ freeShippingRules: next });
    } catch (err) {
      setFreeShippingRules([]);
      setFreeShippingError(err?.message || "Impossible de charger la configuration panier.");
    } finally {
      setFreeShippingLoading(false);
    }
  }

  const openCreateFreeShipping = () => {
    setFreeShippingError("");
    setFreeShippingSuccess("");
    setFreeShippingEditTarget(null);
    setFreeShippingForm(DEFAULT_FREE_SHIPPING_FORM);
    setFreeShippingModalOpen(true);
  };

  const openEditFreeShipping = (r) => {
    setFreeShippingError("");
    setFreeShippingSuccess("");
    setFreeShippingEditTarget(r);
    setFreeShippingForm({
      thresholdAmount: `${r?.thresholdAmount ?? ""}`,
      progressMessageTemplate: r?.progressMessageTemplate || "",
      unlockedMessage: r?.unlockedMessage || "",
      enabled: Boolean(r?.enabled)
    });
    setFreeShippingModalOpen(true);
  };

  const closeFreeShippingModal = () => {
    if (freeShippingSaving) return;
    setFreeShippingModalOpen(false);
    setFreeShippingEditTarget(null);
  };

  const submitFreeShipping = async (e) => {
    e.preventDefault();
    if (freeShippingSaving) return;
    setFreeShippingError("");
    setFreeShippingSuccess("");
    setFreeShippingSaving(true);
    try {
      const threshold = Number(`${freeShippingForm.thresholdAmount || ""}`.trim().replace(/\s+/g, "").replace(",", "."));
      if (!Number.isFinite(threshold) || threshold < 0) {
        setFreeShippingError("Seuil invalide.");
        return;
      }
      const payload = {
        thresholdAmount: threshold,
        enabled: Boolean(freeShippingForm.enabled),
        progressMessageTemplate: freeShippingForm.progressMessageTemplate || null,
        unlockedMessage: freeShippingForm.unlockedMessage || null
      };
      if (freeShippingEditTarget?.id) {
        await backofficeApi.updateFreeShippingRule(freeShippingEditTarget.id, payload);
        setFreeShippingSuccess("Configuration mise à jour.");
      } else {
        await backofficeApi.createFreeShippingRule(payload);
        setFreeShippingSuccess("Configuration ajoutée.");
      }
      setFreeShippingModalOpen(false);
      setFreeShippingEditTarget(null);
      await loadFreeShippingRules();
    } catch (err) {
      setFreeShippingError(err?.message || "Impossible d’enregistrer la configuration.");
    } finally {
      setFreeShippingSaving(false);
    }
  };

  const toggleFreeShipping = async (r) => {
    if (!r?.id) return;
    if (freeShippingTogglingId) return;
    setFreeShippingError("");
    setFreeShippingSuccess("");
    setFreeShippingTogglingId(r.id);
    try {
      if (Boolean(r.enabled)) {
        await backofficeApi.disableFreeShippingRule(r.id);
        setFreeShippingSuccess("Désactivée.");
      } else {
        await backofficeApi.enableFreeShippingRule(r.id);
        setFreeShippingSuccess("Activée.");
      }
      await loadFreeShippingRules();
    } catch (err) {
      setFreeShippingError(err?.message || "Impossible de modifier l’état.");
    } finally {
      setFreeShippingTogglingId("");
    }
  };

  const deleteFreeShipping = async (r) => {
    if (!r?.id) return;
    if (freeShippingDeletingId) return;
    const confirm = window.confirm("Supprimer cette configuration ?");
    if (!confirm) return;
    setFreeShippingError("");
    setFreeShippingSuccess("");
    setFreeShippingDeletingId(r.id);
    try {
      await backofficeApi.deleteFreeShippingRule(r.id);
      setFreeShippingSuccess("Configuration supprimée.");
      await loadFreeShippingRules();
    } catch (err) {
      setFreeShippingError(err?.message || "Impossible de supprimer la configuration.");
    } finally {
      setFreeShippingDeletingId("");
    }
  };

  return {
    freeShippingRules,
    freeShippingLoading,
    freeShippingError,
    freeShippingSuccess,
    freeShippingModalOpen,
    freeShippingEditTarget,
    freeShippingForm,
    setFreeShippingForm,
    freeShippingSaving,
    freeShippingDeletingId,
    freeShippingTogglingId,
    loadFreeShippingRules,
    openCreateFreeShipping,
    openEditFreeShipping,
    closeFreeShippingModal,
    submitFreeShipping,
    toggleFreeShipping,
    deleteFreeShipping
  };
}
