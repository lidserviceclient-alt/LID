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

  // Codes préréglés pas encore présents dans la liste (suggestions du formulaire d'ajout).
  const usedCodes = new Set(shippingMethods.map((m) => `${m?.code ?? ""}`.trim().toUpperCase()));
  const availablePresetCodes = Object.keys(SHIPPING_METHOD_PRESETS).filter((c) => !usedCodes.has(c));
  const typedCode = `${shippingMethodForm.code || ""}`.trim().toUpperCase();
  const shippingMethodCodeError =
    !shippingMethodEditTarget?.id && typedCode && usedCodes.has(typedCode)
      ? `Une modalité avec le code ${typedCode} existe déjà.`
      : "";

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
    const firstFree = availablePresetCodes[0];
    setShippingMethodForm(
      firstFree
        ? buildShippingMethodForm(firstFree)
        : {
            code: "",
            label: "",
            description: "",
            costAmount: "",
            leadTimeUnit: "DAYS",
            leadTimeMin: "1",
            leadTimeMax: "3",
            enabled: true,
            isDefault: false,
            sortOrder: `${shippingMethods.length}`
          }
    );
    setShippingMethodModalOpen(true);
  };

  const openEditShippingMethod = (m) => {
    setShippingMethodsError("");
    setShippingMethodsSuccess("");
    setShippingMethodEditTarget(m);
    // Édition : uniquement les valeurs de la base (aucun préréglage).
    setShippingMethodForm({
      code: `${m?.code ?? ""}`,
      label: `${m?.label ?? ""}`,
      description: m?.description || "",
      costAmount: `${m?.costAmount ?? ""}`,
      leadTimeUnit: m?.leadTimeUnit || "DAYS",
      leadTimeMin: `${m?.leadTimeMin ?? 0}`,
      leadTimeMax: `${m?.leadTimeMax ?? 0}`,
      enabled: Boolean(m?.enabled),
      isDefault: Boolean(m?.isDefault),
      sortOrder: `${m?.sortOrder ?? 0}`
    });
    setShippingMethodModalOpen(true);
  };

  const closeShippingMethodModal = () => {
    if (shippingMethodSaving) return;
    setShippingMethodModalOpen(false);
    setShippingMethodEditTarget(null);
  };

  const changeShippingMethodCode = (nextCode) => {
    setShippingMethodForm((s) => {
      const preset = SHIPPING_METHOD_PRESETS[nextCode];
      // Code libre : aucun préréglage à appliquer
      if (!preset) return { ...s, code: nextCode };
      return {
        ...s,
        code: preset.code,
        label: preset.label,
        description: preset.description,
        costAmount: `${preset.costAmount}`,
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
      const code = `${shippingMethodForm.code || ""}`.trim().toUpperCase();
      const label = `${shippingMethodForm.label || ""}`.trim();
      if (!code || !label) {
        setShippingMethodsError("Code et libellé requis.");
        return;
      }
      if (shippingMethodCodeError) {
        setShippingMethodsError(shippingMethodCodeError);
        return;
      }
      const payload = {
        code,
        label,
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
    availablePresetCodes,
    shippingMethodCodeError,
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
