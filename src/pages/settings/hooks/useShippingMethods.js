import { useState } from "react";
import { backofficeApi } from "../../../services/api.js";
import { patchSettingsResolver } from "../../../resolvers/settingsResolver.js";
import { SHIPPING_METHOD_PRESETS, buildShippingMethodForm } from "../settingsUtils.js";
import { useSettingsSeed } from "./useSettingsSeed.js";

export function useShippingMethods() {
  const [shippingMethods, setShippingMethods] = useState([]);
  const [shippingMethodsLoading, setShippingMethodsLoading] = useState(false);
  const [shippingMethodsError, setShippingMethodsError] = useState("");
  const [shippingMethodsSuccess, setShippingMethodsSuccess] = useState("");
  const [shippingMethodModalOpen, setShippingMethodModalOpen] = useState(false);
  const [shippingMethodEditTarget, setShippingMethodEditTarget] = useState(null);
  const [shippingMethodForm, setShippingMethodForm] = useState(() => buildShippingMethodForm("STANDARD"));
  const [shippingMethodSaving, setShippingMethodSaving] = useState(false);
  const [shippingMethodDeletingId, setShippingMethodDeletingId] = useState("");
  const [shippingMethodTogglingId, setShippingMethodTogglingId] = useState("");
  const [shippingMethodDefaultId, setShippingMethodDefaultId] = useState("");

  useSettingsSeed("shippingMethods", {
    apply: (list) => setShippingMethods(Array.isArray(list) ? list : []),
    setLoading: setShippingMethodsLoading,
    setError: setShippingMethodsError
  });

  async function loadShippingMethods() {
    try {
      setShippingMethodsLoading(true);
      setShippingMethodsError("");
      const list = await backofficeApi.shippingMethods();
      const next = Array.isArray(list) ? list : [];
      setShippingMethods(next);
      patchSettingsResolver({ shippingMethods: next });
    } catch (err) {
      setShippingMethods([]);
      setShippingMethodsError(err?.message || "Impossible de charger les modalités de livraison.");
    } finally {
      setShippingMethodsLoading(false);
    }
  }

  const openCreateShippingMethod = () => {
    setShippingMethodsError("");
    setShippingMethodsSuccess("");
    setShippingMethodEditTarget(null);
    setShippingMethodForm(buildShippingMethodForm("STANDARD"));
    setShippingMethodModalOpen(true);
  };

  const openEditShippingMethod = (m) => {
    setShippingMethodsError("");
    setShippingMethodsSuccess("");
    setShippingMethodEditTarget(m);
    setShippingMethodForm(buildShippingMethodForm(m?.code || "STANDARD", {
      description: m?.description || "",
      costAmount: `${m?.costAmount ?? ""}`,
      leadTimeUnit: m?.leadTimeUnit || SHIPPING_METHOD_PRESETS[m?.code || "STANDARD"]?.leadTimeUnit || "DAYS",
      leadTimeMin: `${m?.leadTimeMin ?? SHIPPING_METHOD_PRESETS[m?.code || "STANDARD"]?.leadTimeMin ?? 0}`,
      leadTimeMax: `${m?.leadTimeMax ?? SHIPPING_METHOD_PRESETS[m?.code || "STANDARD"]?.leadTimeMax ?? 0}`,
      enabled: Boolean(m?.enabled),
      isDefault: Boolean(m?.isDefault),
      sortOrder: `${m?.sortOrder ?? SHIPPING_METHOD_PRESETS[m?.code || "STANDARD"]?.sortOrder ?? 0}`
    }));
    setShippingMethodModalOpen(true);
  };

  const closeShippingMethodModal = () => {
    if (shippingMethodSaving) return;
    setShippingMethodModalOpen(false);
    setShippingMethodEditTarget(null);
  };

  const changeShippingMethodCode = (nextCode) => {
    setShippingMethodForm((s) => {
      const preset = SHIPPING_METHOD_PRESETS[nextCode] || SHIPPING_METHOD_PRESETS.STANDARD;
      return {
        ...s,
        code: preset.code,
        label: preset.label,
        description: s.description === s.label || s.description === SHIPPING_METHOD_PRESETS[s.code]?.description
          ? preset.description
          : s.description,
        leadTimeUnit: preset.leadTimeUnit,
        leadTimeMin: `${preset.leadTimeMin}`,
        leadTimeMax: `${preset.leadTimeMax}`,
        sortOrder: `${preset.sortOrder}`
      };
    });
  };

  const submitShippingMethod = async (e) => {
    e.preventDefault();
    if (shippingMethodSaving) return;
    setShippingMethodsError("");
    setShippingMethodsSuccess("");
    setShippingMethodSaving(true);
    try {
      const cost = Number(`${shippingMethodForm.costAmount || ""}`.trim().replace(/\s+/g, "").replace(",", "."));
      if (!Number.isFinite(cost) || cost < 0) {
        setShippingMethodsError("Coût invalide.");
        return;
      }
      const leadTimeMin = Number(`${shippingMethodForm.leadTimeMin || ""}`.trim());
      const leadTimeMax = Number(`${shippingMethodForm.leadTimeMax || ""}`.trim());
      if (!Number.isInteger(leadTimeMin) || leadTimeMin < 0) {
        setShippingMethodsError("Délai minimum invalide.");
        return;
      }
      if (!Number.isInteger(leadTimeMax) || leadTimeMax < leadTimeMin) {
        setShippingMethodsError("Délai maximum invalide.");
        return;
      }
      const sortOrder = `${shippingMethodForm.sortOrder || ""}`.trim() === "" ? 0 : Number(shippingMethodForm.sortOrder);
      const preset = SHIPPING_METHOD_PRESETS[shippingMethodForm.code] || SHIPPING_METHOD_PRESETS.STANDARD;
      const payload = {
        code: preset.code,
        label: preset.label,
        description: `${shippingMethodForm.description || ""}`.trim() || null,
        costAmount: cost,
        leadTimeUnit: shippingMethodForm.leadTimeUnit || "DAYS",
        leadTimeMin,
        leadTimeMax,
        enabled: Boolean(shippingMethodForm.enabled),
        isDefault: Boolean(shippingMethodForm.isDefault),
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0
      };
      if (shippingMethodEditTarget?.id) {
        await backofficeApi.updateShippingMethod(shippingMethodEditTarget.id, payload);
        setShippingMethodsSuccess("Modalité mise à jour.");
      } else {
        await backofficeApi.createShippingMethod(payload);
        setShippingMethodsSuccess("Modalité ajoutée.");
      }
      setShippingMethodModalOpen(false);
      setShippingMethodEditTarget(null);
      await loadShippingMethods();
    } catch (err) {
      setShippingMethodsError(err?.message || "Impossible d’enregistrer la modalité.");
    } finally {
      setShippingMethodSaving(false);
    }
  };

  const toggleShippingMethod = async (m) => {
    if (!m?.id) return;
    if (shippingMethodTogglingId) return;
    setShippingMethodsError("");
    setShippingMethodsSuccess("");
    setShippingMethodTogglingId(m.id);
    try {
      if (Boolean(m.enabled)) {
        await backofficeApi.disableShippingMethod(m.id);
        setShippingMethodsSuccess("Désactivée.");
      } else {
        await backofficeApi.enableShippingMethod(m.id);
        setShippingMethodsSuccess("Activée.");
      }
      await loadShippingMethods();
    } catch (err) {
      setShippingMethodsError(err?.message || "Impossible de modifier l’état.");
    } finally {
      setShippingMethodTogglingId("");
    }
  };

  const setDefaultShippingMethod = async (m) => {
    if (!m?.id) return;
    if (shippingMethodDefaultId) return;
    setShippingMethodsError("");
    setShippingMethodsSuccess("");
    setShippingMethodDefaultId(m.id);
    try {
      await backofficeApi.setDefaultShippingMethod(m.id);
      setShippingMethodsSuccess("Par défaut mis à jour.");
      await loadShippingMethods();
    } catch (err) {
      setShippingMethodsError(err?.message || "Impossible de définir par défaut.");
    } finally {
      setShippingMethodDefaultId("");
    }
  };

  const deleteShippingMethod = async (m) => {
    if (!m?.id) return;
    if (shippingMethodDeletingId) return;
    const confirm = window.confirm("Supprimer cette modalité de livraison ?");
    if (!confirm) return;
    setShippingMethodsError("");
    setShippingMethodsSuccess("");
    setShippingMethodDeletingId(m.id);
    try {
      await backofficeApi.deleteShippingMethod(m.id);
      setShippingMethodsSuccess("Modalité supprimée.");
      await loadShippingMethods();
    } catch (err) {
      setShippingMethodsError(err?.message || "Impossible de supprimer la modalité.");
    } finally {
      setShippingMethodDeletingId("");
    }
  };

  return {
    shippingMethods,
    shippingMethodsLoading,
    shippingMethodsError,
    shippingMethodsSuccess,
    shippingMethodModalOpen,
    shippingMethodEditTarget,
    shippingMethodForm,
    setShippingMethodForm,
    shippingMethodSaving,
    shippingMethodDeletingId,
    shippingMethodTogglingId,
    shippingMethodDefaultId,
    loadShippingMethods,
    openCreateShippingMethod,
    openEditShippingMethod,
    closeShippingMethodModal,
    changeShippingMethodCode,
    submitShippingMethod,
    toggleShippingMethod,
    setDefaultShippingMethod,
    deleteShippingMethod
  };
}
