import { useState } from "react";
import { backofficeApi } from "../../../services/api.js";
import { patchSettingsResolver } from "../../../resolvers/settingsResolver.js";
import { isValidInternationalPhone } from "../../../utils/phone.js";
import { useSettingsSeed } from "./useSettingsSeed.js";

const EMPTY_TEAM_FORM = { prenom: "", nom: "", email: "", telephone: "", role: "ADMIN" };

export function useTeamMembers() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState("");
  const [teamSuccess, setTeamSuccess] = useState("");
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [teamSaving, setTeamSaving] = useState(false);
  const [teamDeletingId, setTeamDeletingId] = useState(null);
  const [teamEditTarget, setTeamEditTarget] = useState(null);
  const [teamForm, setTeamForm] = useState(EMPTY_TEAM_FORM);

  useSettingsSeed("teamMembers", {
    apply: (list) => setTeamMembers(Array.isArray(list) ? list : []),
    setLoading: setTeamLoading,
    setError: setTeamError
  });

  async function loadTeamMembers() {
    try {
      setTeamLoading(true);
      setTeamError("");
      const [adminsPage, superAdminsPage] = await Promise.all([
        backofficeApi.users(0, 200, "ADMIN", ""),
        backofficeApi.users(0, 200, "SUPER_ADMIN", "")
      ]);
      const raw = [
        ...(Array.isArray(adminsPage?.content) ? adminsPage.content : []),
        ...(Array.isArray(superAdminsPage?.content) ? superAdminsPage.content : [])
      ];
      const byId = new Map();
      for (const u of raw) {
        if (u?.id) byId.set(u.id, u);
      }
      const merged = Array.from(byId.values()).sort((a, b) => {
        const roleA = String(a?.role || "");
        const roleB = String(b?.role || "");
        if (roleA !== roleB) return roleA.localeCompare(roleB);
        const nameA = `${a?.prenom || ""} ${a?.nom || ""}`.trim().toLowerCase();
        const nameB = `${b?.prenom || ""} ${b?.nom || ""}`.trim().toLowerCase();
        return nameA.localeCompare(nameB);
      });
      setTeamMembers(merged);
      patchSettingsResolver({ teamMembers: merged });
    } catch (err) {
      setTeamMembers([]);
      setTeamError(err?.message || "Impossible de charger l’équipe.");
    } finally {
      setTeamLoading(false);
    }
  }

  const openCreateTeamMember = () => {
    setTeamError("");
    setTeamSuccess("");
    setTeamEditTarget(null);
    setTeamForm(EMPTY_TEAM_FORM);
    setTeamModalOpen(true);
  };

  const openEditTeamMember = (u) => {
    setTeamError("");
    setTeamSuccess("");
    setTeamEditTarget(u);
    setTeamForm({
      prenom: u?.prenom || "",
      nom: u?.nom || "",
      email: u?.email || "",
      telephone: u?.telephone || "",
      role: u?.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN"
    });
    setTeamModalOpen(true);
  };

  const closeTeamModal = () => {
    if (teamSaving) return;
    setTeamModalOpen(false);
    setTeamEditTarget(null);
  };

  const submitTeamMember = async (e) => {
    e.preventDefault();
    if (teamSaving) return;
    setTeamError("");
    setTeamSuccess("");
    if (teamForm.telephone && !isValidInternationalPhone(teamForm.telephone)) {
      setTeamError("Numéro de téléphone invalide.");
      return;
    }
    setTeamSaving(true);
    try {
      const payload = {
        prenom: teamForm.prenom || null,
        nom: teamForm.nom || null,
        email: teamForm.email,
        telephone: teamForm.telephone || null,
        emailVerifie: true,
        role: teamForm.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN",
        avatarUrl: null,
        ville: null,
        pays: null
      };

      if (teamEditTarget?.id) {
        await backofficeApi.updateUser(teamEditTarget.id, payload);
        setTeamSuccess("Membre mis à jour.");
      } else {
        await backofficeApi.createUser(payload);
        setTeamSuccess("Membre créé.");
      }
      setTeamModalOpen(false);
      setTeamEditTarget(null);
      await loadTeamMembers();
    } catch (err) {
      setTeamError(err?.message || "Impossible d’enregistrer le membre.");
    } finally {
      setTeamSaving(false);
    }
  };

  const deleteTeamMember = async (u) => {
    if (!u?.id) return;
    if (teamDeletingId) return;
    const confirm = window.confirm("Supprimer ce membre de l’équipe ?");
    if (!confirm) return;
    setTeamDeletingId(u.id);
    setTeamError("");
    setTeamSuccess("");
    try {
      await backofficeApi.deleteUser(u.id);
      setTeamSuccess("Membre supprimé.");
      await loadTeamMembers();
    } catch (err) {
      setTeamError(err?.message || "Impossible de supprimer le membre.");
    } finally {
      setTeamDeletingId(null);
    }
  };

  return {
    teamMembers,
    teamLoading,
    teamError,
    teamSuccess,
    teamModalOpen,
    teamSaving,
    teamDeletingId,
    teamEditTarget,
    teamForm,
    setTeamForm,
    loadTeamMembers,
    openCreateTeamMember,
    openEditTeamMember,
    closeTeamModal,
    submitTeamMember,
    deleteTeamMember
  };
}
