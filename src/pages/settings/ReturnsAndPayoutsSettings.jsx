import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import SettingsCard from "./components/SettingsCard.jsx";
import SettingsField, { SettingsTextarea } from "./components/SettingsField.jsx";
import SettingsStatus from "./components/SettingsStatus.jsx";
import SaveBar from "./components/SaveBar.jsx";
import { useShopProfile } from "./hooks/useShopProfile.js";
import { formatRefundPolicyLabel, formatReturnWindowLabel } from "./settingsUtils.js";

export default function ReturnsAndPayoutsSettings() {
  const { shopForm, setField, shopLoading, shopSaving, shopError, shopSuccess, loadShopProfile, submitShop } =
    useShopProfile();
  const disabled = shopLoading || shopSaving;
  const returnCost = Number(shopForm.returnShippingCostAmount);
  const unitWord = shopForm.returnWindowUnit === "HOURS" ? "heures" : "jours";

  const summary = `${formatReturnWindowLabel(
    shopForm.returnWindowUnit,
    shopForm.returnWindowMin,
    shopForm.returnWindowMax
  )} · ${formatRefundPolicyLabel(shopForm.customerRefundMode)}${
    Number.isFinite(returnCost) && returnCost > 0 ? ` · coût de retour ${returnCost.toLocaleString()} FCFA` : ""
  }`;

  return (
    <form onSubmit={submitShop} className="space-y-6">
      <SettingsStatus error={shopError} success={shopSuccess} />

      <SettingsCard title="Modalités de retour" description={summary}>
        <div className="grid gap-4 md:grid-cols-2">
          <SettingsField id="return-unit" label="Unité du délai de retour">
            <Select
              id="return-unit"
              value={shopForm.returnWindowUnit}
              onChange={(e) => setField("returnWindowUnit")(e.target.value)}
              options={[
                { value: "DAYS", label: "Retour en jours" },
                { value: "HOURS", label: "Retour en heures" }
              ]}
              disabled={disabled}
            />
          </SettingsField>
          <SettingsField
            id="return-cost"
            label="Coût du retour produit (FCFA)"
            hint="0 = retour gratuit pour le client."
          >
            <Input
              id="return-cost"
              placeholder="Montant en FCFA"
              type="number"
              min="0"
              step="0.01"
              value={shopForm.returnShippingCostAmount}
              onChange={(e) => setField("returnShippingCostAmount")(e.target.value)}
              disabled={disabled}
            />
          </SettingsField>
          <SettingsField id="return-min" label={`Délai de retour minimum (${unitWord})`}>
            <Input
              id="return-min"
              placeholder={shopForm.returnWindowUnit === "HOURS" ? "Minimum en heures" : "Minimum en jours"}
              type="number"
              min="1"
              step="1"
              value={shopForm.returnWindowMin}
              onChange={(e) => setField("returnWindowMin")(e.target.value)}
              disabled={disabled}
            />
          </SettingsField>
          <SettingsField
            id="return-max"
            label={`Délai de retour maximum (${unitWord})`}
            hint="Doit être supérieur ou égal au minimum."
          >
            <Input
              id="return-max"
              placeholder={shopForm.returnWindowUnit === "HOURS" ? "Maximum en heures" : "Maximum en jours"}
              type="number"
              min="1"
              step="1"
              value={shopForm.returnWindowMax}
              onChange={(e) => setField("returnWindowMax")(e.target.value)}
              disabled={disabled}
            />
          </SettingsField>
          <SettingsField id="return-refund-mode" label="Mode de remboursement client" className="md:col-span-2">
            <Select
              id="return-refund-mode"
              value={shopForm.customerRefundMode}
              onChange={(e) => setField("customerRefundMode")(e.target.value)}
              options={[
                { value: "FULL_WITH_SHIPPING", label: "Remboursement total (commande + livraison)" },
                { value: "ORDER_ONLY", label: "Remboursement de la commande uniquement" }
              ]}
              disabled={disabled}
            />
          </SettingsField>
          <SettingsField
            id="return-policy-text"
            label="Politique de retour affichée au client"
            className="md:col-span-2"
          >
            <SettingsTextarea
              id="return-policy-text"
              placeholder="Politique de retour affichée au client"
              value={shopForm.returnPolicyText}
              onChange={(e) => setField("returnPolicyText")(e.target.value)}
              disabled={disabled}
            />
          </SettingsField>
        </div>
      </SettingsCard>

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
            hint="Saisir 5 pour 5 %."
          >
            <Input
              id="payment-fee"
              placeholder="5"
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
