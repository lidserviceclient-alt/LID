import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Select from "../../components/ui/Select.jsx";
import SettingsCard from "./components/SettingsCard.jsx";
import SettingsField from "./components/SettingsField.jsx";
import SettingsStatus from "./components/SettingsStatus.jsx";
import { ListActions, SettingsList, SettingsListItem } from "./components/SettingsList.jsx";
import { useSocialLinks } from "./hooks/useSocialLinks.js";

const PLATFORM_OPTIONS = [
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "X", label: "X" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "WEBSITE", label: "Website" }
];

export default function SocialLinksSettings() {
  const {
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
  } = useSocialLinks();

  return (
    <SettingsCard
      title="Réseaux sociaux"
      description="Liens affichés dans le footer du site, dans l’ordre choisi."
      actions={<ListActions onRefresh={loadSocialLinks} loading={socialLoading} onAdd={openCreateSocial} />}
    >
      <SettingsStatus error={socialError} success={socialSuccess} />

      <SettingsList
        items={socialLinks}
        loading={socialLoading}
        emptyLabel="Aucun réseau social."
        renderItem={(s) => (
          <SettingsListItem
            key={s.id}
            title={s.platform}
            subtitle={s.url}
            actions={
              <>
                <Button variant="outline" size="sm" onClick={() => openEditSocial(s)}>
                  Modifier
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteSocial(s)}>
                  Supprimer
                </Button>
              </>
            }
          />
        )}
      />

      <Modal
        isOpen={socialModalOpen}
        onClose={closeSocialModal}
        title={socialEditTarget?.id ? "Modifier un réseau social" : "Ajouter un réseau social"}
        footer={
          <>
            <Button variant="outline" onClick={closeSocialModal} disabled={socialSaving}>
              Annuler
            </Button>
            <Button type="submit" form="social-link-form" disabled={socialSaving || !`${socialForm.url || ""}`.trim()}>
              {socialSaving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </>
        }
      >
        <form id="social-link-form" onSubmit={submitSocial} className="grid gap-3">
          <SettingsStatus error={socialError} />
          <SettingsField id="social-platform" label="Plateforme">
            <Select
              id="social-platform"
              value={socialForm.platform}
              onChange={(e) => setSocialForm((s) => ({ ...s, platform: e.target.value }))}
              options={PLATFORM_OPTIONS}
            />
          </SettingsField>
          <SettingsField id="social-url" label="URL du profil">
            <Input
              id="social-url"
              placeholder="https://…"
              value={socialForm.url}
              onChange={(e) => setSocialForm((s) => ({ ...s, url: e.target.value }))}
              required
            />
          </SettingsField>
          <SettingsField id="social-sort" label="Ordre d’affichage" hint="0, 1, 2… les plus petits en premier.">
            <Input
              id="social-sort"
              placeholder="0"
              inputMode="numeric"
              value={socialForm.sortOrder}
              onChange={(e) => setSocialForm((s) => ({ ...s, sortOrder: e.target.value }))}
            />
          </SettingsField>
        </form>
      </Modal>
    </SettingsCard>
  );
}
