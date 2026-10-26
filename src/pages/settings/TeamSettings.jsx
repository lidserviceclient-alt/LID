import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Modal from "../../components/ui/Modal.jsx";
import PhoneNumberField from "../../components/ui/PhoneNumberField.jsx";
import Select from "../../components/ui/Select.jsx";
import SettingsCard from "./components/SettingsCard.jsx";
import SettingsField from "./components/SettingsField.jsx";
import SettingsStatus from "./components/SettingsStatus.jsx";
import { ListActions, SettingsList, SettingsListItem } from "./components/SettingsList.jsx";
import { useTeamMembers } from "./hooks/useTeamMembers.js";
import { formatFullName } from "./settingsUtils.js";

export default function TeamSettings() {
  const {
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
  } = useTeamMembers();

  return (
    <SettingsCard
      title="Équipe"
      description="Administrateurs (ADMIN et SUPER_ADMIN) ayant accès au back-office."
      actions={<ListActions onRefresh={loadTeamMembers} loading={teamLoading} onAdd={openCreateTeamMember} />}
    >
      <SettingsStatus error={teamError} success={teamSuccess} />

      <SettingsList
        items={teamMembers}
        loading={teamLoading}
        emptyLabel="Aucun admin."
        renderItem={(u) => (
          <SettingsListItem
            key={u.id}
            title={formatFullName(u)}
            badges={
              <Badge
                label={u?.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN"}
                variant={u?.role === "SUPER_ADMIN" ? "warning" : "outline"}
              />
            }
            subtitle={u?.email || "-"}
            actions={
              <>
                <Button variant="outline" size="sm" onClick={() => openEditTeamMember(u)}>
                  Modifier
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteTeamMember(u)}
                  disabled={teamDeletingId === u.id}
                >
                  {teamDeletingId === u.id ? "Suppression…" : "Supprimer"}
                </Button>
              </>
            }
          />
        )}
      />

      <Modal
        isOpen={teamModalOpen}
        onClose={closeTeamModal}
        title={teamEditTarget?.id ? "Modifier un membre" : "Ajouter un membre"}
        footer={
          <>
            <Button variant="outline" onClick={closeTeamModal} disabled={teamSaving}>
              Annuler
            </Button>
            <Button type="submit" form="team-member-form" disabled={teamSaving}>
              {teamSaving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </>
        }
      >
        <form id="team-member-form" onSubmit={submitTeamMember} className="grid gap-3">
          <SettingsStatus error={teamError} />
          <div className="grid gap-3 sm:grid-cols-2">
            <SettingsField id="team-prenom" label="Prénom">
              <Input
                id="team-prenom"
                placeholder="Prénom"
                value={teamForm.prenom}
                onChange={(e) => setTeamForm((s) => ({ ...s, prenom: e.target.value }))}
              />
            </SettingsField>
            <SettingsField id="team-nom" label="Nom">
              <Input
                id="team-nom"
                placeholder="Nom"
                value={teamForm.nom}
                onChange={(e) => setTeamForm((s) => ({ ...s, nom: e.target.value }))}
              />
            </SettingsField>
          </div>
          <SettingsField id="team-email" label="Email">
            <Input
              id="team-email"
              placeholder="Email"
              type="email"
              value={teamForm.email}
              onChange={(e) => setTeamForm((s) => ({ ...s, email: e.target.value }))}
              required
            />
          </SettingsField>
          <SettingsField label="Téléphone">
            <PhoneNumberField
              value={teamForm.telephone}
              onChange={(value) => setTeamForm((s) => ({ ...s, telephone: value }))}
              placeholder="Téléphone"
            />
          </SettingsField>
          <SettingsField id="team-role" label="Rôle">
            <Select
              id="team-role"
              value={teamForm.role}
              onChange={(e) => setTeamForm((s) => ({ ...s, role: e.target.value }))}
              options={[
                { value: "ADMIN", label: "ADMIN" },
                { value: "SUPER_ADMIN", label: "SUPER_ADMIN" }
              ]}
            />
          </SettingsField>
        </form>
      </Modal>
    </SettingsCard>
  );
}
