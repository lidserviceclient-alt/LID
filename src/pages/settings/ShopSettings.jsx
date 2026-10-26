import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import SettingsCard from "./components/SettingsCard.jsx";
import SettingsField from "./components/SettingsField.jsx";
import SettingsStatus from "./components/SettingsStatus.jsx";
import SaveBar from "./components/SaveBar.jsx";
import { useShopProfile } from "./hooks/useShopProfile.js";

export default function ShopSettings() {
  const { shopForm, setField, shopLoading, shopSaving, shopError, shopSuccess, loadShopProfile, submitShop } =
    useShopProfile();
  const disabled = shopLoading || shopSaving;

  return (
    <form onSubmit={submitShop}>
      <SettingsCard
        title="Informations boutique"
        description="Profil public de la boutique : nom, coordonnées de contact et TVA appliquée."
      >
        <SettingsStatus error={shopError} success={shopSuccess} />

        <div className="grid gap-4 md:grid-cols-2">
          <SettingsField id="shop-store-name" label="Nom de la boutique">
            <Input
              id="shop-store-name"
              placeholder="Nom de boutique"
              value={shopForm.storeName}
              onChange={(e) => setField("storeName")(e.target.value)}
              disabled={disabled}
              required
            />
          </SettingsField>
          <SettingsField id="shop-city" label="Ville">
            <Input
              id="shop-city"
              placeholder="Ville"
              value={shopForm.city}
              onChange={(e) => setField("city")(e.target.value)}
              disabled={disabled}
              required
            />
          </SettingsField>
          <SettingsField id="shop-email" label="Email de contact">
            <Input
              id="shop-email"
              placeholder="contact@exemple.com"
              type="email"
              value={shopForm.contactEmail}
              onChange={(e) => setField("contactEmail")(e.target.value)}
              disabled={disabled}
              required
            />
          </SettingsField>
          <SettingsField id="shop-phone" label="Téléphone de contact">
            <Input
              id="shop-phone"
              placeholder="Téléphone"
              type="tel"
              value={shopForm.contactPhone}
              onChange={(e) => setField("contactPhone")(e.target.value)}
              disabled={disabled}
              required
            />
          </SettingsField>
          <SettingsField id="shop-logo" label="Logo (URL)" hint="Lien public vers l’image du logo.">
            <Input
              id="shop-logo"
              placeholder="https://…"
              value={shopForm.logoUrl}
              onChange={(e) => setField("logoUrl")(e.target.value)}
              disabled={disabled}
            />
          </SettingsField>
          <SettingsField id="shop-slogan" label="Slogan">
            <Input
              id="shop-slogan"
              placeholder="Slogan"
              value={shopForm.slogan}
              onChange={(e) => setField("slogan")(e.target.value)}
              disabled={disabled}
            />
          </SettingsField>
          <SettingsField id="shop-sector" label="Secteur d’activité">
            <Select
              id="shop-sector"
              value={shopForm.activitySector}
              onChange={(e) => setField("activitySector")(e.target.value)}
              options={[{ value: "ECOMMERCE", label: "e-commerce" }]}
            />
          </SettingsField>
          <SettingsField id="shop-vat" label="TVA globale (%)" hint="Taux appliqué aux prix, ex. 18.">
            <Input
              id="shop-vat"
              placeholder="Ex: 18"
              type="number"
              min="0"
              step="0.01"
              value={shopForm.vatPercent}
              onChange={(e) => setField("vatPercent")(e.target.value)}
              disabled={disabled}
            />
          </SettingsField>
        </div>

        <SaveBar saving={shopSaving} loading={shopLoading} onRefresh={loadShopProfile} />
      </SettingsCard>
    </form>
  );
}
