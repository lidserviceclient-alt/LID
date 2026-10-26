import Toggle from "../../components/ui/Toggle.jsx";
import SettingsCard from "./components/SettingsCard.jsx";
import SettingsStatus from "./components/SettingsStatus.jsx";
import SaveBar from "./components/SaveBar.jsx";
import { SettingsList } from "./components/SettingsList.jsx";
import { useNotificationPreferences } from "./hooks/useNotificationPreferences.js";

export default function NotificationsSettings() {
  const {
    notificationPrefs,
    notificationLoading,
    notificationSaving,
    notificationError,
    notificationSuccess,
    loadNotificationPreferences,
    toggleNotificationPref,
    saveNotificationPreferences
  } = useNotificationPreferences();

  const onSubmit = (e) => {
    e.preventDefault();
    saveNotificationPreferences();
  };

  return (
    <form onSubmit={onSubmit}>
      <SettingsCard
        title="Notifications"
        description="Activez ou désactivez chaque type de notification, puis cliquez sur « Enregistrer »."
      >
        <SettingsStatus error={notificationError} success={notificationSuccess} />

        <SettingsList
          items={notificationPrefs}
          loading={notificationLoading}
          emptyLabel="Aucune préférence."
          renderItem={(p) => (
            <li key={p.key} className="rounded-lg border border-input bg-background/60 px-3 py-2.5">
              <Toggle
                label={p.label || p.key}
                checked={Boolean(p.enabled)}
                onChange={() => toggleNotificationPref(p.key)}
                disabled={notificationSaving}
              />
            </li>
          )}
        />

        <SaveBar
          saving={notificationSaving}
          loading={notificationLoading}
          onRefresh={loadNotificationPreferences}
        />
      </SettingsCard>
    </form>
  );
}
