import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Select from "../../components/ui/Select.jsx";
import SettingsCard from "./components/SettingsCard.jsx";
import SettingsField, { SettingsTextarea } from "./components/SettingsField.jsx";
import SettingsStatus from "./components/SettingsStatus.jsx";
import SaveBar from "./components/SaveBar.jsx";
import { ListActions, SettingsList, SettingsListItem } from "./components/SettingsList.jsx";
import { useShippingMethods } from "./hooks/useShippingMethods.js";
import { useFreeShippingRules } from "./hooks/useFreeShippingRules.js";
import { useShopProfile } from "./hooks/useShopProfile.js";

export default function ShippingSettings() {
  return (
    <>
      <ShippingMethodsCard />
      <FreeShippingRulesCard />
      <ShippingNoteCard />
    </>
  );
}

function ShippingMethodsCard() {
  const {
    shippingMethods,
    shippingMethodsLoading,
    shippingMethodsError,
    shippingMethodsSuccess,
    shippingMethodModalOpen,
    shippingMethodEditTarget,
    shippingMethodForm,
    setShippingMethodForm,
    shippingMethodSaving,
    shippingMethodDeletingId,
    shippingMethodTogglingId,
    shippingMethodDefaultId,
    loadShippingMethods,
    openCreateShippingMethod,
    openEditShippingMethod,
    closeShippingMethodModal,
    changeShippingMethodCode,
    submitShippingMethod,
    toggleShippingMethod,
    setDefaultShippingMethod,
    deleteShippingMethod
  } = useShippingMethods();
  const setField = (field) => (e) => setShippingMethodForm((s) => ({ ...s, [field]: e.target.value }));
  const hoursUnit = shippingMethodForm.leadTimeUnit === "HOURS";

  return (
    <SettingsCard
      title="Modalités de livraison"
      description="Standard et Express : prix, délai, activation et mode proposé par défaut au client."
      actions={
        <ListActions
          onRefresh={loadShippingMethods}
          loading={shippingMethodsLoading}
          onAdd={openCreateShippingMethod}
        />
      }
    >
      <SettingsStatus error={shippingMethodsError} success={shippingMethodsSuccess} />

      <SettingsList
        items={shippingMethods}
        loading={shippingMethodsLoading}
        emptyLabel="Aucune modalité."
        renderItem={(m) => (
          <SettingsListItem
            key={m.id}
            title={m.label || m.code}
            badges={
              <>
                {m?.isDefault ? <Badge label="PAR DÉFAUT" variant="outline" /> : null}
                {m?.enabled ? <Badge label="ACTIF" variant="success" /> : <Badge label="INACTIF" variant="outline" />}
              </>
            }
            subtitle={`${m?.description || "—"} · ${Number(m?.costAmount || 0).toLocaleString()} FCFA · ${
              m?.leadTimeMin ?? 0
            }-${m?.leadTimeMax ?? 0} ${m?.leadTimeUnit === "HOURS" ? "h" : "jours"}`}
            actions={
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleShippingMethod(m)}
                  disabled={shippingMethodTogglingId === m.id}
                >
                  {m?.enabled ? "Désactiver" : "Activer"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDefaultShippingMethod(m)}
                  disabled={Boolean(m?.isDefault) || shippingMethodDefaultId === m.id}
                >
                  Définir par défaut
                </Button>
                <Button variant="outline" size="sm" onClick={() => openEditShippingMethod(m)}>
                  Modifier
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteShippingMethod(m)}
                  disabled={shippingMethodDeletingId === m.id}
                >
                  Supprimer
                </Button>
              </>
            }
          />
        )}
      />

      <Modal
        isOpen={shippingMethodModalOpen}
        onClose={closeShippingMethodModal}
        title={shippingMethodEditTarget?.id ? "Modifier une modalité de livraison" : "Ajouter une modalité de livraison"}
        footer={
          <>
            <Button variant="outline" onClick={closeShippingMethodModal} disabled={shippingMethodSaving}>
              Annuler
            </Button>
            <Button
              type="submit"
              form="shipping-method-form"
              disabled={
                shippingMethodSaving ||
                !`${shippingMethodForm.code || ""}`.trim() ||
                `${shippingMethodForm.costAmount || ""}`.trim() === ""
              }
            >
              {shippingMethodSaving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </>
        }
      >
        <form id="shipping-method-form" onSubmit={submitShippingMethod} className="grid gap-3">
          <SettingsStatus error={shippingMethodsError} />
          <SettingsField id="sm-code" label="Type de livraison">
            <Select
              id="sm-code"
              value={shippingMethodForm.code}
              onChange={(e) => changeShippingMethodCode(e.target.value)}
              options={[
                { value: "STANDARD", label: "Standard" },
                { value: "EXPRESS", label: "Express" }
              ]}
            />
          </SettingsField>
          <SettingsField id="sm-label" label="Libellé" hint="Déduit du type de livraison.">
            <Input id="sm-label" placeholder="Libellé" value={shippingMethodForm.label} disabled />
          </SettingsField>
          <SettingsField id="sm-description" label="Description">
            <Input
              id="sm-description"
              placeholder="Ex: 3-5 jours ouvrables"
              value={shippingMethodForm.description}
              onChange={setField("description")}
            />
          </SettingsField>
          <SettingsField id="sm-cost" label="Coût (FCFA)">
            <Input
              id="sm-cost"
              placeholder="Montant"
              inputMode="decimal"
              value={shippingMethodForm.costAmount}
              onChange={setField("costAmount")}
              required
            />
          </SettingsField>
          <SettingsField id="sm-unit" label="Unité du délai">
            <Select
              id="sm-unit"
              value={shippingMethodForm.leadTimeUnit}
              onChange={setField("leadTimeUnit")}
              options={[
                { value: "HOURS", label: "Délai en heures" },
                { value: "DAYS", label: "Délai en jours" }
              ]}
            />
          </SettingsField>
          <div className="grid gap-3 sm:grid-cols-2">
            <SettingsField id="sm-min" label={`Délai minimum (${hoursUnit ? "heures" : "jours"})`}>
              <Input
                id="sm-min"
                placeholder={hoursUnit ? "Minimum en heures" : "Minimum en jours"}
                inputMode="numeric"
                value={shippingMethodForm.leadTimeMin}
                onChange={setField("leadTimeMin")}
              />
            </SettingsField>
            <SettingsField id="sm-max" label={`Délai maximum (${hoursUnit ? "heures" : "jours"})`}>
              <Input
                id="sm-max"
                placeholder={hoursUnit ? "Maximum en heures" : "Maximum en jours"}
                inputMode="numeric"
                value={shippingMethodForm.leadTimeMax}
                onChange={setField("leadTimeMax")}
              />
            </SettingsField>
          </div>
          <SettingsField id="sm-sort" label="Ordre d’affichage" hint="Les plus petits nombres s’affichent en premier.">
            <Input
              id="sm-sort"
              placeholder="0, 1, 2…"
              inputMode="numeric"
              value={shippingMethodForm.sortOrder}
              onChange={setField("sortOrder")}
            />
          </SettingsField>
          <div className="grid gap-3 sm:grid-cols-2">
            <SettingsField id="sm-enabled" label="Statut">
              <Select
                id="sm-enabled"
                value={shippingMethodForm.enabled ? "true" : "false"}
                onChange={(e) => setShippingMethodForm((s) => ({ ...s, enabled: e.target.value === "true" }))}
                options={[
                  { value: "true", label: "Actif" },
                  { value: "false", label: "Désactivé" }
                ]}
              />
            </SettingsField>
            <SettingsField id="sm-default" label="Mode par défaut">
              <Select
                id="sm-default"
                value={shippingMethodForm.isDefault ? "true" : "false"}
                onChange={(e) => setShippingMethodForm((s) => ({ ...s, isDefault: e.target.value === "true" }))}
                options={[
                  { value: "true", label: "Par défaut" },
                  { value: "false", label: "Non" }
                ]}
              />
            </SettingsField>
          </div>
        </form>
      </Modal>
    </SettingsCard>
  );
}

function FreeShippingRulesCard() {
  const {
    freeShippingRules,
    freeShippingLoading,
    freeShippingError,
    freeShippingSuccess,
    freeShippingModalOpen,
    freeShippingEditTarget,
    freeShippingForm,
    setFreeShippingForm,
    freeShippingSaving,
    freeShippingDeletingId,
    freeShippingTogglingId,
    loadFreeShippingRules,
    openCreateFreeShipping,
    openEditFreeShipping,
    closeFreeShippingModal,
    submitFreeShipping,
    toggleFreeShipping,
    deleteFreeShipping
  } = useFreeShippingRules();

  return (
    <SettingsCard
      title="Livraison gratuite (bandeau panier)"
      description="Seuil de commande à partir duquel la livraison est offerte, et messages affichés dans le panier."
      actions={
        <ListActions onRefresh={loadFreeShippingRules} loading={freeShippingLoading} onAdd={openCreateFreeShipping} />
      }
    >
      <SettingsStatus error={freeShippingError} success={freeShippingSuccess} />

      <SettingsList
        items={freeShippingRules}
        loading={freeShippingLoading}
        emptyLabel="Aucune configuration."
        renderItem={(r) => (
          <SettingsListItem
            key={r.id}
            title={`${Number(r?.thresholdAmount || 0).toLocaleString()} FCFA`}
            badges={r?.enabled ? <Badge label="ACTIF" variant="success" /> : <Badge label="INACTIF" variant="outline" />}
            subtitle={r?.progressMessageTemplate || "—"}
            actions={
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFreeShipping(r)}
                  disabled={freeShippingTogglingId === r.id}
                >
                  {r?.enabled ? "Désactiver" : "Activer"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => openEditFreeShipping(r)}>
                  Modifier
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteFreeShipping(r)}
                  disabled={freeShippingDeletingId === r.id}
                >
                  Supprimer
                </Button>
              </>
            }
          />
        )}
      />

      <Modal
        isOpen={freeShippingModalOpen}
        onClose={closeFreeShippingModal}
        title={freeShippingEditTarget?.id ? "Modifier la livraison gratuite" : "Ajouter une livraison gratuite"}
        footer={
          <>
            <Button variant="outline" onClick={closeFreeShippingModal} disabled={freeShippingSaving}>
              Annuler
            </Button>
            <Button
              type="submit"
              form="free-shipping-form"
              disabled={
                freeShippingSaving ||
                `${freeShippingForm.thresholdAmount || ""}`.trim() === "" ||
                !`${freeShippingForm.progressMessageTemplate || ""}`.trim()
              }
            >
              {freeShippingSaving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </>
        }
      >
        <form id="free-shipping-form" onSubmit={submitFreeShipping} className="grid gap-3">
          <SettingsStatus error={freeShippingError} />
          <SettingsField id="fs-threshold" label="Seuil de livraison gratuite (FCFA)">
            <Input
              id="fs-threshold"
              placeholder="Ex: 10000"
              inputMode="decimal"
              value={freeShippingForm.thresholdAmount}
              onChange={(e) => setFreeShippingForm((s) => ({ ...s, thresholdAmount: e.target.value }))}
              required
            />
          </SettingsField>
          <SettingsField
            id="fs-progress"
            label="Message de progression"
            hint="Variables : {remaining} = montant restant, {threshold} = seuil."
          >
            <Input
              id="fs-progress"
              placeholder="Ex: Plus que {remaining} FCFA..."
              value={freeShippingForm.progressMessageTemplate}
              onChange={(e) => setFreeShippingForm((s) => ({ ...s, progressMessageTemplate: e.target.value }))}
              required
            />
          </SettingsField>
          <SettingsField id="fs-unlocked" label="Message une fois le seuil atteint">
            <Input
              id="fs-unlocked"
              placeholder="Ex: Livraison gratuite débloquée !"
              value={freeShippingForm.unlockedMessage}
              onChange={(e) => setFreeShippingForm((s) => ({ ...s, unlockedMessage: e.target.value }))}
            />
          </SettingsField>
          <SettingsField id="fs-enabled" label="Statut">
            <Select
              id="fs-enabled"
              value={freeShippingForm.enabled ? "true" : "false"}
              onChange={(e) => setFreeShippingForm((s) => ({ ...s, enabled: e.target.value === "true" }))}
              options={[
                { value: "false", label: "Désactivé" },
                { value: "true", label: "Actif" }
              ]}
            />
          </SettingsField>
        </form>
      </Modal>
    </SettingsCard>
  );
}

function ShippingNoteCard() {
  const { shopForm, setField, shopLoading, shopSaving, shopError, shopSuccess, loadShopProfile, submitShop } =
    useShopProfile();

  return (
    <form onSubmit={submitShop}>
      <SettingsCard
        title="Note générale sur la livraison"
        description="Message affiché au client (zones desservies, horaires, conditions…)."
      >
        <SettingsStatus error={shopError} success={shopSuccess} />
        <SettingsField id="shipping-note" label="Note affichée au client">
          <SettingsTextarea
            id="shipping-note"
            placeholder="Message affiché au client"
            value={shopForm.shippingPolicyNote}
            onChange={(e) => setField("shippingPolicyNote")(e.target.value)}
            disabled={shopLoading || shopSaving}
          />
        </SettingsField>
        <SaveBar saving={shopSaving} loading={shopLoading} onRefresh={loadShopProfile} />
      </SettingsCard>
    </form>
  );
}
