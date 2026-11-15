import Input from "../../components/ui/Input.jsx";
import SettingsCard from "./components/SettingsCard.jsx";
import SettingsField from "./components/SettingsField.jsx";
import SettingsStatus from "./components/SettingsStatus.jsx";
import SaveBar from "./components/SaveBar.jsx";
import { useShopProfile } from "./hooks/useShopProfile.js";

export default function PayoutsSettings() {
  const { shopForm, setField, shopLoading, shopSaving, shopError, shopSuccess, loadShopProfile, submitShop } =
    useShopProfile();
  const disabled = shopLoading || shopSaving;

  return (
    <form onSubmit={submitShop} className="space-y-6">
      <SettingsStatus error={shopError} success={shopSuccess} />

      <SettingsCard
        title="Commission et frais partenaires"
        description="Montants retenus sur les ventes des partenaires avant reversement."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <SettingsField
            id="partner-margin"
            label="Commission LID sur les ventes partenaires (%)"
            hint="Saisir 10 pour 10 %."
          >
            <Input
              id="partner-margin"
              placeholder="10"
              type="number"
              min="0"
              step="0.1"
              value={shopForm.partnerMarginPercent}
              onChange={(e) => setField("partnerMarginPercent")(e.target.value)}
              disabled={disabled}
            />
          </SettingsField>
          <SettingsField
            id="payment-fee"
            label="Frais de transaction déduits du partenaire (%)"
            hint="Saisir 3 pour 3 % (tarif Paiement Pro négocié : encaissement 3 %, reversement 2,5 %)."
          >
            <Input
              id="payment-fee"
              placeholder="3"
              type="number"
              min="0"
              step="0.1"
              value={shopForm.paymentFeePercent}
              onChange={(e) => setField("paymentFeePercent")(e.target.value)}
              disabled={disabled}
            />
          </SettingsField>
        </div>
      </SettingsCard>

      <SaveBar saving={shopSaving} loading={shopLoading} onRefresh={loadShopProfile} />
    </form>
  );
}
