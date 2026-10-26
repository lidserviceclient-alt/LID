import { useState } from "react";
import { backofficeApi } from "../../../services/api.js";
import { patchSettingsResolver } from "../../../resolvers/settingsResolver.js";
import { useSettingsSeed } from "./useSettingsSeed.js";

const EMPTY_SOCIAL_FORM = { platform: "INSTAGRAM", url: "", sortOrder: "0" };

export function useSocialLinks() {
  const [socialLinks, setSocialLinks] = useState([]);
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialError, setSocialError] = useState("");
  const [socialSuccess, setSocialSuccess] = useState("");
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [socialEditTarget, setSocialEditTarget] = useState(null);
  const [socialForm, setSocialForm] = useState(EMPTY_SOCIAL_FORM);
  const [socialSaving, setSocialSaving] = useState(false);

  useSettingsSeed("socialLinks", {
    apply: (list) => setSocialLinks(Array.isArray(list) ? list : []),
    setLoading: setSocialLoading,
    setError: setSocialError
  });

  async function loadSocialLinks() {
    try {
      setSocialLoading(true);
      setSocialError("");
      const list = await backofficeApi.socialLinks();
      const next = Array.isArray(list) ? list : [];
      setSocialLinks(next);
      patchSettingsResolver({ socialLinks: next });
    } catch (err) {
      setSocialLinks([]);
      setSocialError(err?.message || "Impossible de charger les réseaux sociaux.");
    } finally {
      setSocialLoading(false);
    }
  }

  const openCreateSocial = () => {
    setSocialError("");
    setSocialSuccess("");
    setSocialEditTarget(null);
    setSocialForm(EMPTY_SOCIAL_FORM);
    setSocialModalOpen(true);
  };

  const openEditSocial = (s) => {
    setSocialError("");
    setSocialSuccess("");
    setSocialEditTarget(s);
    setSocialForm({
      platform: s?.platform || "INSTAGRAM",
      url: s?.url || "",
      sortOrder: `${s?.sortOrder ?? 0}`
    });
    setSocialModalOpen(true);
  };

  const closeSocialModal = () => {
    if (socialSaving) return;
    setSocialModalOpen(false);
    setSocialEditTarget(null);
  };

  const submitSocial = async (e) => {
    e.preventDefault();
    if (socialSaving) return;
    setSocialError("");
    setSocialSuccess("");
    setSocialSaving(true);
    try {
      const payload = {
        platform: socialForm.platform,
        url: socialForm.url,
        sortOrder: `${socialForm.sortOrder || ""}`.trim() === "" ? 0 : Number(socialForm.sortOrder)
      };
      if (socialEditTarget?.id) {
        await backofficeApi.updateSocialLink(socialEditTarget.id, payload);
        setSocialSuccess("Réseau social mis à jour.");
      } else {
        await backofficeApi.createSocialLink(payload);
        setSocialSuccess("Réseau social ajouté.");
      }
      setSocialModalOpen(false);
      setSocialEditTarget(null);
      await loadSocialLinks();
    } catch (err) {
      setSocialError(err?.message || "Impossible d’enregistrer le réseau social.");
    } finally {
      setSocialSaving(false);
    }
  };

  const deleteSocial = async (s) => {
    if (!s?.id) return;
    const confirm = window.confirm("Supprimer ce réseau social ?");
    if (!confirm) return;
    setSocialError("");
    setSocialSuccess("");
    try {
      await backofficeApi.deleteSocialLink(s.id);
      setSocialSuccess("Réseau social supprimé.");
      await loadSocialLinks();
    } catch (err) {
      setSocialError(err?.message || "Impossible de supprimer le réseau social.");
    }
  };

  return {
    socialLinks,
    socialLoading,
    socialError,
    socialSuccess,
    socialModalOpen,
    socialEditTarget,
    socialForm,
    setSocialForm,
    socialSaving,
    loadSocialLinks,
    openCreateSocial,
    openEditSocial,
    closeSocialModal,
    submitSocial,
    deleteSocial
  };
}
