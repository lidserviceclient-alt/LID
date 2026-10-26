import { useState } from "react";
import { backofficeApi } from "../../../services/api.js";
import { patchSettingsResolver } from "../../../resolvers/settingsResolver.js";
import { toPercentInput, toVatPercentInput } from "../settingsUtils.js";
import { useSettingsSeed } from "./useSettingsSeed.js";

const INITIAL_SHOP_FORM = {
  storeName: "",
  contactEmail: "",
  contactPhone: "",
  city: "",
  logoUrl: "",
  slogan: "",
  activitySector: "ECOMMERCE",
  shippingPolicyNote: "",
  vatPercent: "18",
  returnWindowUnit: "DAYS",
  returnWindowMin: "7",
  returnWindowMax: "7",
  customerRefundMode: "FULL_WITH_SHIPPING",
  partnerSettlementMode: "DEDUCT_SHIPPING_AND_RETURN_COST",
  returnShippingCostAmount: "0",
  partnerMarginPercent: "10",
  paymentFeePercent: "5",
  partnerPayoutWithdrawMode: "",
  returnPolicyText: ""
};

// Même mapping pour `settingsCollection().shopProfile` et `appConfig()`.
const toShopForm = (cfg) => ({
  storeName: cfg?.storeName || "",
  contactEmail: cfg?.contactEmail || "",
  contactPhone: cfg?.contactPhone || "",
  city: cfg?.city || "",
  logoUrl: cfg?.logoUrl || "",
  slogan: cfg?.slogan || "",
  activitySector: cfg?.activitySector || "ECOMMERCE",
  shippingPolicyNote: cfg?.shippingPolicyNote || "",
  vatPercent: toVatPercentInput(cfg?.vatPercent),
  returnWindowUnit: cfg?.returnWindowUnit || "DAYS",
  returnWindowMin: `${cfg?.returnWindowMin ?? 7}`,
  returnWindowMax: `${cfg?.returnWindowMax ?? 7}`,
  customerRefundMode: cfg?.customerRefundMode || "FULL_WITH_SHIPPING",
  partnerSettlementMode: cfg?.partnerSettlementMode || "DEDUCT_SHIPPING_AND_RETURN_COST",
  returnShippingCostAmount: `${cfg?.returnShippingCostAmount ?? 0}`,
  partnerMarginPercent: toPercentInput(cfg?.partnerMarginPercent, "10"),
  paymentFeePercent: toPercentInput(cfg?.paymentFeePercent, "5"),
  partnerPayoutWithdrawMode: cfg?.partnerPayoutWithdrawMode || "",
  returnPolicyText: cfg?.returnPolicyText || ""
});

/**
 * Configuration boutique (`appConfig`) partagée par les pages Boutique, Retours & commissions
 * et Livraison (note de livraison).
 *
 * L'objet est TOUJOURS envoyé en entier à `updateAppConfig` : chaque page part des dernières
 * valeurs serveur (cache de la collection, rafraîchi après chaque sauvegarde), de sorte qu'une
 * sauvegarde depuis une page n'écrase pas les champs gérés par une autre.
 */
export function useShopProfile() {
  const [shopForm, setShopForm] = useState(INITIAL_SHOP_FORM);
  const [shopLoading, setShopLoading] = useState(false);
  const [shopSaving, setShopSaving] = useState(false);
  const [shopError, setShopError] = useState("");
  const [shopSuccess, setShopSuccess] = useState("");

  useSettingsSeed("shopProfile", {
    apply: (shopProfile) => setShopForm(toShopForm(shopProfile || {})),
    setLoading: setShopLoading,
    setError: setShopError
  });

  const setField = (field) => (value) => setShopForm((s) => ({ ...s, [field]: value }));

  async function loadShopProfile() {
    try {
      setShopLoading(true);
      setShopError("");
      const cfg = await backofficeApi.appConfig();
      setShopForm(toShopForm(cfg));
      patchSettingsResolver({ shopProfile: cfg });
    } catch (err) {
      setShopError(err?.message || "Impossible de charger les informations boutique.");
    } finally {
      setShopLoading(false);
    }
  }

  const saveShopProfile = async () => {
    if (shopSaving) return;
    setShopError("");
    setShopSuccess("");
    setShopSaving(true);
    try {
      const vatPercent = Number(`${shopForm.vatPercent || ""}`.trim().replace(",", "."));
      if (!Number.isFinite(vatPercent) || vatPercent < 0) {
        throw new Error("TVA invalide.");
      }
      const returnWindowMin = Number.parseInt(`${shopForm.returnWindowMin || ""}`.trim(), 10);
      const returnWindowMax = Number.parseInt(`${shopForm.returnWindowMax || ""}`.trim(), 10);
      const returnShippingCostAmount = Number(`${shopForm.returnShippingCostAmount || ""}`.trim().replace(",", "."));
      const partnerMarginPercent = Number(`${shopForm.partnerMarginPercent || ""}`.trim().replace(",", "."));
      const paymentFeePercent = Number(`${shopForm.paymentFeePercent || ""}`.trim().replace(",", "."));
      if (!Number.isInteger(returnWindowMin) || returnWindowMin <= 0) {
        throw new Error("Intervalle retour min invalide.");
      }
      if (!Number.isInteger(returnWindowMax) || returnWindowMax < returnWindowMin) {
        throw new Error("Intervalle retour max invalide.");
      }
      if (!Number.isFinite(returnShippingCostAmount) || returnShippingCostAmount < 0) {
        throw new Error("Coût de retour invalide.");
      }
      if (!Number.isFinite(partnerMarginPercent) || partnerMarginPercent < 0) {
        throw new Error("Marge partenaire invalide.");
      }
      if (!Number.isFinite(paymentFeePercent) || paymentFeePercent < 0) {
        throw new Error("Frais de transaction invalides.");
      }
      await backofficeApi.updateAppConfig({
        storeName: shopForm.storeName,
        contactEmail: shopForm.contactEmail,
        contactPhone: shopForm.contactPhone,
        city: shopForm.city,
        logoUrl: shopForm.logoUrl || null,
        slogan: shopForm.slogan || null,
        activitySector: shopForm.activitySector || null,
        shippingPolicyNote: shopForm.shippingPolicyNote || null,
        vatPercent,
        returnWindowUnit: shopForm.returnWindowUnit || "DAYS",
        returnWindowMin,
        returnWindowMax,
        customerRefundMode: shopForm.customerRefundMode || "FULL_WITH_SHIPPING",
        partnerSettlementMode: shopForm.partnerSettlementMode || "DEDUCT_SHIPPING_AND_RETURN_COST",
        returnShippingCostAmount,
        // Fraction (0,10 = 10 %) : evite qu'une saisie de « 1 » soit lue comme 100 %
        partnerMarginPercent: partnerMarginPercent / 100,
        paymentFeePercent: paymentFeePercent / 100,
        partnerPayoutWithdrawMode: shopForm.partnerPayoutWithdrawMode || null,
        returnPolicyText: shopForm.returnPolicyText || null
      });
      setShopSuccess("Informations boutique sauvegardées.");
      await loadShopProfile();
    } catch (err) {
      setShopError(err?.message || "Impossible de sauvegarder les informations boutique.");
    } finally {
      setShopSaving(false);
    }
  };

  const submitShop = async (e) => {
    e.preventDefault();
    await saveShopProfile();
  };

  return {
    shopForm,
    setField,
    shopLoading,
    shopSaving,
    shopError,
    shopSuccess,
    loadShopProfile,
    submitShop
  };
}
