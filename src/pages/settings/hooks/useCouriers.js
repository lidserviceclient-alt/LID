import { useState } from "react";
import { backofficeApi } from "../../../services/api.js";
import { patchSettingsResolver } from "../../../resolvers/settingsResolver.js";
import { isValidInternationalPhone } from "../../../utils/phone.js";
import { useSettingsSeed } from "./useSettingsSeed.js";

const EMPTY_COURIER_FORM = { prenom: "", nom: "", email: "", telephone: "", password: "" };

export function useCouriers() {
  const [courierForm, setCourierForm] = useState(EMPTY_COURIER_FORM);
  const [couriers, setCouriers] = useState([]);
  const [courierLoading, setCourierLoading] = useState(false);
  const [courierError, setCourierError] = useState("");
  const [courierSuccess, setCourierSuccess] = useState("");
  const [courierModalOpen, setCourierModalOpen] = useState(false);
  const [courierEditTarget, setCourierEditTarget] = useState(null);
  const [courierEditForm, setCourierEditForm] = useState({ prenom: "", nom: "", email: "", telephone: "" });
  const [courierSaving, setCourierSaving] = useState(false);
  const [courierDeletingId, setCourierDeletingId] = useState(null);

  useSettingsSeed("couriers", {
    apply: (list) => setCouriers(Array.isArray(list) ? list : []),
    setLoading: setCourierLoading,
    setError: setCourierError
  });

  async function loadCouriers() {
    try {
      const page = await backofficeApi.users(0, 100, "LIVREUR", "");
      const next = Array.isArray(page?.content) ? page.content : [];
      setCouriers(next);
      patchSettingsResolver({ couriers: next });
    } catch {
      setCouriers([]);
    }
  }

  const submitCourier = async (e) => {
    e.preventDefault();
    if (courierLoading) return;
    setCourierError("");
    setCourierSuccess("");
    if (courierForm.telephone && !isValidInternationalPhone(courierForm.telephone)) {
      setCourierError("Numéro de téléphone invalide.");
      return;
    }
    setCourierLoading(true);
    try {
      await backofficeApi.createCourier({
        prenom: courierForm.prenom || null,
        nom: courierForm.nom || null,
        email: courierForm.email || null,
        telephone: courierForm.telephone || null,
        password: courierForm.password
      });
      setCourierSuccess("Livreur créé.");
      setCourierForm(EMPTY_COURIER_FORM);
      await loadCouriers();
    } catch (err) {
      setCourierError(err?.message || "Impossible de créer le livreur.");
    } finally {
      setCourierLoading(false);
    }
  };

  const openEditCourier = (u) => {
    setCourierError("");
    setCourierSuccess("");
    setCourierEditTarget(u);
    setCourierEditForm({
      prenom: u?.prenom || "",
      nom: u?.nom || "",
      email: u?.email || "",
      telephone: u?.telephone || ""
    });
    setCourierModalOpen(true);
  };

  const closeCourierModal = () => {
    if (courierSaving) return;
    setCourierModalOpen(false);
    setCourierEditTarget(null);
  };

  const submitCourierEdit = async (e) => {
    e.preventDefault();
    if (courierSaving) return;
    if (!courierEditTarget?.id) return;
    setCourierError("");
    setCourierSuccess("");
    if (courierEditForm.telephone && !isValidInternationalPhone(courierEditForm.telephone)) {
      setCourierError("Numéro de téléphone invalide.");
      return;
    }
    setCourierSaving(true);
    try {
      await backofficeApi.updateUser(courierEditTarget.id, {
        prenom: courierEditForm.prenom || null,
        nom: courierEditForm.nom || null,
        email: courierEditForm.email || null,
        telephone: courierEditForm.telephone || null,
        emailVerifie: true,
        role: "LIVREUR",
        avatarUrl: null,
        ville: null,
        pays: null
      });
      setCourierSuccess("Livreur mis à jour.");
      setCourierModalOpen(false);
      setCourierEditTarget(null);
      await loadCouriers();
    } catch (err) {
      setCourierError(err?.message || "Impossible de modifier le livreur.");
    } finally {
      setCourierSaving(false);
    }
  };

  const deleteCourier = async (u) => {
    if (!u?.id) return;
    if (courierDeletingId) return;
    const confirm = window.confirm("Supprimer ce compte livreur ?");
    if (!confirm) return;
    setCourierDeletingId(u.id);
    setCourierError("");
    setCourierSuccess("");
    try {
      await backofficeApi.deleteUser(u.id);
      setCourierSuccess("Livreur supprimé.");
      await loadCouriers();
    } catch (err) {
      setCourierError(err?.message || "Impossible de supprimer le livreur.");
    } finally {
      setCourierDeletingId(null);
    }
  };

  return {
    courierForm,
    setCourierForm,
    couriers,
    courierLoading,
    courierError,
    courierSuccess,
    courierModalOpen,
    courierEditForm,
    setCourierEditForm,
    courierSaving,
    courierDeletingId,
    loadCouriers,
    submitCourier,
    openEditCourier,
    closeCourierModal,
    submitCourierEdit,
    deleteCourier
  };
}
