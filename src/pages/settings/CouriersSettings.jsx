import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Modal from "../../components/ui/Modal.jsx";
import PhoneNumberField from "../../components/ui/PhoneNumberField.jsx";
import SettingsCard from "./components/SettingsCard.jsx";
import SettingsField from "./components/SettingsField.jsx";
import SettingsStatus from "./components/SettingsStatus.jsx";
import { ListActions, SettingsList, SettingsListItem } from "./components/SettingsList.jsx";
import { useCouriers } from "./hooks/useCouriers.js";
import { formatFullName } from "./settingsUtils.js";

export default function CouriersSettings() {
  const {
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
  } = useCouriers();

  return (
    <>
      <form onSubmit={submitCourier}>
        <SettingsCard
          title="Créer un livreur"
          description="Crée un compte d’accès à l’application Delivery."
        >
          <SettingsStatus error={courierError} success={courierSuccess} />
          <div className="grid gap-4 md:grid-cols-2">
            <SettingsField id="courier-prenom" label="Prénom">
              <Input
                id="courier-prenom"
                placeholder="Prénom"
                value={courierForm.prenom}
                onChange={(e) => setCourierForm((s) => ({ ...s, prenom: e.target.value }))}
              />
            </SettingsField>
            <SettingsField id="courier-nom" label="Nom">
              <Input
                id="courier-nom"
                placeholder="Nom"
                value={courierForm.nom}
                onChange={(e) => setCourierForm((s) => ({ ...s, nom: e.target.value }))}
              />
            </SettingsField>
            <SettingsField id="courier-email" label="Email (optionnel)">
              <Input
                id="courier-email"
                placeholder="Email (optionnel)"
                type="email"
                value={courierForm.email}
                onChange={(e) => setCourierForm((s) => ({ ...s, email: e.target.value }))}
              />
            </SettingsField>
            <SettingsField label="Téléphone">
              <PhoneNumberField
                value={courierForm.telephone}
                onChange={(value) => setCourierForm((s) => ({ ...s, telephone: value }))}
                placeholder="Téléphone"
              />
            </SettingsField>
            <SettingsField id="courier-password" label="Mot de passe" hint="6 caractères minimum.">
              <Input
                id="courier-password"
                placeholder="Mot de passe (min 6)"
                type="password"
                autoComplete="new-password"
                value={courierForm.password}
                onChange={(e) => setCourierForm((s) => ({ ...s, password: e.target.value }))}
                required
              />
            </SettingsField>
          </div>
          <div className="flex justify-end border-t border-border/60 pt-4">
            <Button type="submit" className="w-full sm:w-auto" disabled={courierLoading}>
              {courierLoading ? "Création…" : "Créer le livreur"}
            </Button>
          </div>
        </SettingsCard>
      </form>

      <SettingsCard
        title="Comptes livreurs"
        description="Livreurs ayant accès à l’application Delivery."
        actions={<ListActions onRefresh={loadCouriers} loading={courierLoading} />}
      >
        <SettingsList
          items={couriers}
          loading={courierLoading}
          emptyLabel="Aucun livreur."
          renderItem={(u) => (
            <SettingsListItem
              key={u.id}
              title={formatFullName(u)}
              subtitle={u.telephone || "-"}
              actions={
                <>
                  <span className="hidden text-xs text-muted-foreground sm:inline">{u.role || "LIVREUR"}</span>
                  <Button variant="outline" size="sm" onClick={() => openEditCourier(u)}>
                    Modifier
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteCourier(u)}
                    disabled={courierDeletingId === u.id}
                  >
                    {courierDeletingId === u.id ? "Suppression…" : "Supprimer"}
                  </Button>
                </>
              }
            />
          )}
        />
      </SettingsCard>

      <Modal
        isOpen={courierModalOpen}
        onClose={closeCourierModal}
        title="Modifier un livreur"
        footer={
          <>
            <Button variant="outline" onClick={closeCourierModal} disabled={courierSaving}>
              Annuler
            </Button>
            <Button type="submit" form="courier-edit-form" disabled={courierSaving}>
              {courierSaving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </>
        }
      >
        <form id="courier-edit-form" onSubmit={submitCourierEdit} className="grid gap-3">
          <SettingsStatus error={courierError} />
          <div className="grid gap-3 sm:grid-cols-2">
            <SettingsField id="courier-edit-prenom" label="Prénom">
              <Input
                id="courier-edit-prenom"
                placeholder="Prénom"
                value={courierEditForm.prenom}
                onChange={(e) => setCourierEditForm((s) => ({ ...s, prenom: e.target.value }))}
              />
            </SettingsField>
            <SettingsField id="courier-edit-nom" label="Nom">
              <Input
                id="courier-edit-nom"
                placeholder="Nom"
                value={courierEditForm.nom}
                onChange={(e) => setCourierEditForm((s) => ({ ...s, nom: e.target.value }))}
              />
            </SettingsField>
          </div>
          <SettingsField id="courier-edit-email" label="Email (optionnel)">
            <Input
              id="courier-edit-email"
              placeholder="Email (optionnel)"
              type="email"
              value={courierEditForm.email}
              onChange={(e) => setCourierEditForm((s) => ({ ...s, email: e.target.value }))}
            />
          </SettingsField>
          <SettingsField label="Téléphone">
            <PhoneNumberField
              value={courierEditForm.telephone}
              onChange={(value) => setCourierEditForm((s) => ({ ...s, telephone: value }))}
              placeholder="Téléphone"
            />
          </SettingsField>
        </form>
      </Modal>
    </>
  );
}
