import { useEffect, useState } from "react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Modal from "../components/ui/Modal.jsx";
import Badge from "../components/ui/Badge.jsx";
import { backofficeApi } from "../services/api.js";
import { useSettingsResolver } from "../resolvers/settingsResolver.js";

export default function Settings() {
  const settingsEntry = useSettingsResolver();
  const [shopForm, setShopForm] = useState({
    storeName: "",
    contactEmail: "",
    contactPhone: "",
    city: "",
    logoUrl: "",
    slogan: "",
    activitySector: "ECOMMERCE"
  });
  const [shopLoading, setShopLoading] = useState(false);
  const [shopSaving, setShopSaving] = useState(false);
  const [shopError, setShopError] = useState("");
  const [shopSuccess, setShopSuccess] = useState("");
  const [socialLinks, setSocialLinks] = useState([]);
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialError, setSocialError] = useState("");
  const [socialSuccess, setSocialSuccess] = useState("");
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [socialEditTarget, setSocialEditTarget] = useState(null);
  const [socialForm, setSocialForm] = useState({ platform: "INSTAGRAM", url: "", sortOrder: "0" });
  const [socialSaving, setSocialSaving] = useState(false);

  const [freeShippingRules, setFreeShippingRules] = useState([]);
  const [freeShippingLoading, setFreeShippingLoading] = useState(false);
  const [freeShippingError, setFreeShippingError] = useState("");
  const [freeShippingSuccess, setFreeShippingSuccess] = useState("");
  const [freeShippingModalOpen, setFreeShippingModalOpen] = useState(false);
  const [freeShippingEditTarget, setFreeShippingEditTarget] = useState(null);
  const [freeShippingForm, setFreeShippingForm] = useState({
    thresholdAmount: "10000",
    progressMessageTemplate: "Plus que {remaining} FCFA pour la livraison gratuite",
    unlockedMessage: "Livraison gratuite débloquée !",
    enabled: false
  });
  const [freeShippingSaving, setFreeShippingSaving] = useState(false);
  const [freeShippingDeletingId, setFreeShippingDeletingId] = useState("");
  const [freeShippingTogglingId, setFreeShippingTogglingId] = useState("");

  const [shippingMethods, setShippingMethods] = useState([]);
  const [shippingMethodsLoading, setShippingMethodsLoading] = useState(false);
  const [shippingMethodsError, setShippingMethodsError] = useState("");
  const [shippingMethodsSuccess, setShippingMethodsSuccess] = useState("");
  const [shippingMethodModalOpen, setShippingMethodModalOpen] = useState(false);
  const [shippingMethodEditTarget, setShippingMethodEditTarget] = useState(null);
  const [shippingMethodForm, setShippingMethodForm] = useState({
    code: "STANDARD",
    label: "Standard",
    description: "3-5 jours ouvrables",
    costAmount: "3250",
    enabled: true,
    isDefault: true,
    sortOrder: "0"
  });
  const [shippingMethodSaving, setShippingMethodSaving] = useState(false);
  const [shippingMethodDeletingId, setShippingMethodDeletingId] = useState("");
  const [shippingMethodTogglingId, setShippingMethodTogglingId] = useState("");
  const [shippingMethodDefaultId, setShippingMethodDefaultId] = useState("");

  const [courierForm, setCourierForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    password: ""
  });
  const [couriers, setCouriers] = useState([]);
  const [courierLoading, setCourierLoading] = useState(false);
  const [courierError, setCourierError] = useState("");
  const [courierSuccess, setCourierSuccess] = useState("");
  const [courierModalOpen, setCourierModalOpen] = useState(false);
  const [courierEditTarget, setCourierEditTarget] = useState(null);
  const [courierEditForm, setCourierEditForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: ""
  });
  const [courierSaving, setCourierSaving] = useState(false);
  const [courierDeletingId, setCourierDeletingId] = useState(null);

  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState("");
  const [teamSuccess, setTeamSuccess] = useState("");
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [teamSaving, setTeamSaving] = useState(false);
  const [teamDeletingId, setTeamDeletingId] = useState(null);
  const [teamEditTarget, setTeamEditTarget] = useState(null);
  const [teamForm, setTeamForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    role: "ADMIN"
  });

  const [securitySettings, setSecuritySettings] = useState({ admin2faEnabled: true });
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securityExporting, setSecurityExporting] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [securityError, setSecurityError] = useState("");
  const [securityLastExportAt, setSecurityLastExportAt] = useState(() => {
    try {
      const raw = localStorage.getItem("lid_backoffice_security_last_export_at");
      return raw ? raw : "";
    } catch {
      return "";
    }
  });

  const [integrations, setIntegrations] = useState({
    paydunyaConnected: false,
    paydunyaMode: "test",
    paydunyaPublicKey: "",
    sendinblueConnected: false,
    slackConnected: false,
    googleAnalyticsConnected: false,
    googleAnalyticsMeasurementId: ""
  });
  const [integrationsLoading, setIntegrationsLoading] = useState(false);
  const [integrationsSaving, setIntegrationsSaving] = useState(false);
  const [integrationsError, setIntegrationsError] = useState("");
  const [integrationsSuccess, setIntegrationsSuccess] = useState("");
  const [integrationModalOpen, setIntegrationModalOpen] = useState(false);
  const [integrationTarget, setIntegrationTarget] = useState("");
  const [paydunyaForm, setPaydunyaForm] = useState({
    mode: "test",
    publicKey: "",
    privateKey: "",
    masterKey: "",
    token: ""
  });
  const [sendinblueForm, setSendinblueForm] = useState({ apiKey: "" });
  const [slackForm, setSlackForm] = useState({ webhookUrl: "" });
  const [googleAnalyticsForm, setGoogleAnalyticsForm] = useState({ measurementId: "" });

  const [notificationPrefs, setNotificationPrefs] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationSaving, setNotificationSaving] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [notificationSuccess, setNotificationSuccess] = useState("");

  function applySettingsCollection(data) {
    const shopProfile = data?.shopProfile || {};
    setShopForm({
      storeName: shopProfile?.storeName || "",
      contactEmail: shopProfile?.contactEmail || "",
      contactPhone: shopProfile?.contactPhone || "",
      city: shopProfile?.city || "",
      logoUrl: shopProfile?.logoUrl || "",
      slogan: shopProfile?.slogan || "",
      activitySector: shopProfile?.activitySector || "ECOMMERCE"
    });
    setSocialLinks(Array.isArray(data?.socialLinks) ? data.socialLinks : []);
    setFreeShippingRules(Array.isArray(data?.freeShippingRules) ? data.freeShippingRules : []);
    setShippingMethods(Array.isArray(data?.shippingMethods) ? data.shippingMethods : []);
    setCouriers(Array.isArray(data?.couriers) ? data.couriers : []);
    setTeamMembers(Array.isArray(data?.teamMembers) ? data.teamMembers : []);
    setSecuritySettings(data?.security || { admin2faEnabled: true });
    setIntegrations(
      data?.integrations || {
        paydunyaConnected: false,
        paydunyaMode: "test",
        paydunyaPublicKey: "",
        sendinblueConnected: false,
        slackConnected: false,
        googleAnalyticsConnected: false,
        googleAnalyticsMeasurementId: ""
      }
    );
    setNotificationPrefs(Array.isArray(data?.notificationPreferences) ? data.notificationPreferences : []);
  }

  async function loadSettingsCollection() {
    setShopLoading(true);
    setSocialLoading(true);
    setFreeShippingLoading(true);
    setShippingMethodsLoading(true);
    setCourierLoading(true);
    setTeamLoading(true);
    setSecurityLoading(true);
    setIntegrationsLoading(true);
    setNotificationLoading(true);
    setShopError("");
    setSocialError("");
    setFreeShippingError("");
    setShippingMethodsError("");
    setCourierError("");
    setTeamError("");
    setSecurityError("");
    setIntegrationsError("");
    setNotificationError("");
    try {
      const data = await backofficeApi.settingsCollection();
      applySettingsCollection(data);
    } catch (err) {
      const message = err?.message || "Impossible de charger les paramètres.";
      setShopError(message);
      setSocialError(message);
      setFreeShippingError(message);
      setShippingMethodsError(message);
      setCourierError(message);
      setTeamError(message);
      setSecurityError(message);
      setIntegrationsError(message);
      setNotificationError(message);
    } finally {
      setShopLoading(false);
      setSocialLoading(false);
      setFreeShippingLoading(false);
      setShippingMethodsLoading(false);
      setCourierLoading(false);
      setTeamLoading(false);
      setSecurityLoading(false);
      setIntegrationsLoading(false);
      setNotificationLoading(false);
    }
  }

  async function loadCouriers() {
    try {
      const page = await backofficeApi.users(0, 100, "LIVREUR", "");
      setCouriers(Array.isArray(page?.content) ? page.content : []);
    } catch {
      setCouriers([]);
    }
  }

  async function loadShopProfile() {
    try {
      setShopLoading(true);
      setShopError("");
      const cfg = await backofficeApi.appConfig();
      setShopForm({
        storeName: cfg?.storeName || "",
        contactEmail: cfg?.contactEmail || "",
        contactPhone: cfg?.contactPhone || "",
        city: cfg?.city || "",
        logoUrl: cfg?.logoUrl || "",
        slogan: cfg?.slogan || "",
        activitySector: cfg?.activitySector || "ECOMMERCE"
      });
    } catch (err) {
      setShopError(err?.message || "Impossible de charger les informations boutique.");
    } finally {
      setShopLoading(false);
    }
  }

  async function loadSocialLinks() {
    try {
      setSocialLoading(true);
      setSocialError("");
      const list = await backofficeApi.socialLinks();
      setSocialLinks(Array.isArray(list) ? list : []);
    } catch (err) {
      setSocialLinks([]);
      setSocialError(err?.message || "Impossible de charger les réseaux sociaux.");
    } finally {
      setSocialLoading(false);
    }
  }

  async function loadFreeShippingRules() {
    try {
      setFreeShippingLoading(true);
      setFreeShippingError("");
      const list = await backofficeApi.freeShippingRules();
      setFreeShippingRules(Array.isArray(list) ? list : []);
    } catch (err) {
      setFreeShippingRules([]);
      setFreeShippingError(err?.message || "Impossible de charger la configuration panier.");
    } finally {
      setFreeShippingLoading(false);
    }
  }

  async function loadShippingMethods() {
    try {
      setShippingMethodsLoading(true);
      setShippingMethodsError("");
      const list = await backofficeApi.shippingMethods();
      setShippingMethods(Array.isArray(list) ? list : []);
    } catch (err) {
      setShippingMethods([]);
      setShippingMethodsError(err?.message || "Impossible de charger les modalités de livraison.");
    } finally {
      setShippingMethodsLoading(false);
    }
  }

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
    } catch (err) {
      setTeamMembers([]);
      setTeamError(err?.message || "Impossible de charger l’équipe.");
    } finally {
      setTeamLoading(false);
    }
  }

  async function loadSecuritySettings() {
    try {
      setSecurityLoading(true);
      setSecurityError("");
      const s = await backofficeApi.securitySettings();
      setSecuritySettings({ admin2faEnabled: Boolean(s?.admin2faEnabled) });
    } catch (err) {
      setSecurityError(err?.message || "Impossible de charger la sécurité.");
    } finally {
      setSecurityLoading(false);
    }
  }

  async function loadIntegrations() {
    try {
      setIntegrationsLoading(true);
      setIntegrationsError("");
      const cfg = await backofficeApi.integrations();
      setIntegrations({
        paydunyaConnected: Boolean(cfg?.paydunyaConnected),
        paydunyaMode: cfg?.paydunyaMode || "test",
        paydunyaPublicKey: cfg?.paydunyaPublicKey || "",
        sendinblueConnected: Boolean(cfg?.sendinblueConnected),
        slackConnected: Boolean(cfg?.slackConnected),
        googleAnalyticsConnected: Boolean(cfg?.googleAnalyticsConnected),
        googleAnalyticsMeasurementId: cfg?.googleAnalyticsMeasurementId || ""
      });
    } catch (err) {
      setIntegrationsError(err?.message || "Impossible de charger les intégrations.");
    } finally {
      setIntegrationsLoading(false);
    }
  }

  async function loadNotificationPreferences() {
    try {
      setNotificationLoading(true);
      setNotificationError("");
      const list = await backofficeApi.notificationPreferences();
      setNotificationPrefs(Array.isArray(list) ? list : []);
    } catch (err) {
      setNotificationPrefs([]);
      setNotificationError(err?.message || "Impossible de charger les notifications.");
    } finally {
      setNotificationLoading(false);
    }
  }

  const openIntegration = (target) => {
    setIntegrationsError("");
    setIntegrationsSuccess("");
    setIntegrationTarget(target);
    if (target === "PAYDUNYA") {
      setPaydunyaForm({
        mode: integrations?.paydunyaMode || "test",
        publicKey: integrations?.paydunyaPublicKey || "",
        privateKey: "",
        masterKey: "",
        token: ""
      });
    }
    if (target === "SENDINBLUE") {
      setSendinblueForm({ apiKey: "" });
    }
    if (target === "SLACK") {
      setSlackForm({ webhookUrl: "" });
    }
    if (target === "GOOGLE_ANALYTICS") {
      setGoogleAnalyticsForm({ measurementId: integrations?.googleAnalyticsMeasurementId || "" });
    }
    setIntegrationModalOpen(true);
  };

  const closeIntegrationModal = () => {
    if (integrationsSaving) return;
    setIntegrationModalOpen(false);
    setIntegrationTarget("");
  };

  const disconnectIntegration = async (target) => {
    if (integrationsSaving) return;
    const confirm = window.confirm("Déconnecter ce service ?");
    if (!confirm) return;
    setIntegrationsError("");
    setIntegrationsSuccess("");
    setIntegrationsSaving(true);
    try {
      const payload = {};
      if (target === "PAYDUNYA") payload.paydunyaDisconnect = true;
      if (target === "SENDINBLUE") payload.sendinblueDisconnect = true;
      if (target === "SLACK") payload.slackDisconnect = true;
      if (target === "GOOGLE_ANALYTICS") payload.googleAnalyticsDisconnect = true;
      await backofficeApi.updateIntegrations(payload);
      setIntegrationsSuccess("Intégration mise à jour.");
      await loadIntegrations();
    } catch (err) {
      setIntegrationsError(err?.message || "Impossible de mettre à jour l’intégration.");
    } finally {
      setIntegrationsSaving(false);
    }
  };

  const submitIntegration = async (e) => {
    e.preventDefault();
    if (integrationsSaving) return;
    setIntegrationsError("");
    setIntegrationsSuccess("");
    setIntegrationsSaving(true);
    try {
      const payload = {};
      if (integrationTarget === "PAYDUNYA") {
        payload.paydunyaMode = paydunyaForm.mode;
        payload.paydunyaPublicKey = paydunyaForm.publicKey;
        payload.paydunyaPrivateKey = paydunyaForm.privateKey;
        payload.paydunyaMasterKey = paydunyaForm.masterKey;
        payload.paydunyaToken = paydunyaForm.token;
      }
      if (integrationTarget === "SENDINBLUE") {
        payload.sendinblueApiKey = sendinblueForm.apiKey;
      }
      if (integrationTarget === "SLACK") {
        payload.slackWebhookUrl = slackForm.webhookUrl;
      }
      if (integrationTarget === "GOOGLE_ANALYTICS") {
        payload.googleAnalyticsMeasurementId = googleAnalyticsForm.measurementId;
      }

      await backofficeApi.updateIntegrations(payload);
      setIntegrationsSuccess("Intégration sauvegardée.");
      setIntegrationModalOpen(false);
      setIntegrationTarget("");
      await loadIntegrations();
    } catch (err) {
      setIntegrationsError(err?.message || "Impossible de sauvegarder l’intégration.");
    } finally {
      setIntegrationsSaving(false);
    }
  };

  useEffect(() => {
    if (!settingsEntry.loaded && !settingsEntry.loading && !settingsEntry.data) return;
    setShopLoading(settingsEntry.loading);
    setSocialLoading(settingsEntry.loading);
    setFreeShippingLoading(settingsEntry.loading);
    setShippingMethodsLoading(settingsEntry.loading);
    setCourierLoading(settingsEntry.loading);
    setTeamLoading(settingsEntry.loading);
    setSecurityLoading(settingsEntry.loading);
    setIntegrationsLoading(settingsEntry.loading);
    setNotificationLoading(settingsEntry.loading);

    if (settingsEntry.error) {
      setShopError(settingsEntry.error);
      setSocialError(settingsEntry.error);
      setFreeShippingError(settingsEntry.error);
      setShippingMethodsError(settingsEntry.error);
      setCourierError(settingsEntry.error);
      setTeamError(settingsEntry.error);
      setSecurityError(settingsEntry.error);
      setIntegrationsError(settingsEntry.error);
      setNotificationError(settingsEntry.error);
      return;
    }

    if (settingsEntry.data) {
      applySettingsCollection(settingsEntry.data);
    }
  }, [settingsEntry.data, settingsEntry.error, settingsEntry.loading, settingsEntry.loaded]);

  const toggleNotificationPref = (key) => {
    setNotificationPrefs((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      return list.map((p) => (p?.key === key ? { ...p, enabled: !Boolean(p.enabled) } : p));
    });
  };

  const saveNotificationPreferences = async () => {
    if (notificationSaving) return;
    setNotificationSaving(true);
    setNotificationError("");
    setNotificationSuccess("");
    try {
      const items = (notificationPrefs || [])
        .filter((p) => p?.key)
        .map((p) => ({ key: p.key, enabled: Boolean(p.enabled) }));
      const updated = await backofficeApi.updateNotificationPreferences({ items });
      setNotificationPrefs(Array.isArray(updated) ? updated : []);
      setNotificationSuccess("Notifications sauvegardées.");
    } catch (err) {
      setNotificationError(err?.message || "Impossible de sauvegarder les notifications.");
    } finally {
      setNotificationSaving(false);
    }
  };

  const submitShop = async (e) => {
    e.preventDefault();
    if (shopSaving) return;
    setShopError("");
    setShopSuccess("");
    setShopSaving(true);
    try {
      await backofficeApi.updateAppConfig({
        storeName: shopForm.storeName,
        contactEmail: shopForm.contactEmail,
        contactPhone: shopForm.contactPhone,
        city: shopForm.city,
        logoUrl: shopForm.logoUrl || null,
        slogan: shopForm.slogan || null,
        activitySector: shopForm.activitySector || null
      });
      setShopSuccess("Informations boutique sauvegardées.");
      await loadShopProfile();
    } catch (err) {
      setShopError(err?.message || "Impossible de sauvegarder les informations boutique.");
    } finally {
      setShopSaving(false);
    }
  };

  const openCreateSocial = () => {
    setSocialError("");
    setSocialSuccess("");
    setSocialEditTarget(null);
    setSocialForm({ platform: "INSTAGRAM", url: "", sortOrder: "0" });
    setSocialModalOpen(true);
  };

  const openEditSocial = (s) => {
    setSocialError("");
    setSocialSuccess("");
    setSocialEditTarget(s);
    setSocialForm({
      platform: s?.platform || "INSTAGRAM",
      url: s?.url || "",
      sortOrder: `${s?.sortOrder ?? 0}`
    });
    setSocialModalOpen(true);
  };

  const closeSocialModal = () => {
    if (socialSaving) return;
    setSocialModalOpen(false);
    setSocialEditTarget(null);
  };

  const submitSocial = async (e) => {
    e.preventDefault();
    if (socialSaving) return;
    setSocialError("");
    setSocialSuccess("");
    setSocialSaving(true);
    try {
      const payload = {
        platform: socialForm.platform,
        url: socialForm.url,
        sortOrder: `${socialForm.sortOrder || ""}`.trim() === "" ? 0 : Number(socialForm.sortOrder)
      };
      if (socialEditTarget?.id) {
        await backofficeApi.updateSocialLink(socialEditTarget.id, payload);
        setSocialSuccess("Réseau social mis à jour.");
      } else {
        await backofficeApi.createSocialLink(payload);
        setSocialSuccess("Réseau social ajouté.");
      }
      setSocialModalOpen(false);
      setSocialEditTarget(null);
      await loadSocialLinks();
    } catch (err) {
      setSocialError(err?.message || "Impossible d’enregistrer le réseau social.");
    } finally {
      setSocialSaving(false);
    }
  };

  const deleteSocial = async (s) => {
    if (!s?.id) return;
    const confirm = window.confirm("Supprimer ce réseau social ?");
    if (!confirm) return;
    setSocialError("");
    setSocialSuccess("");
    try {
      await backofficeApi.deleteSocialLink(s.id);
      setSocialSuccess("Réseau social supprimé.");
      await loadSocialLinks();
    } catch (err) {
      setSocialError(err?.message || "Impossible de supprimer le réseau social.");
    }
  };

  const openCreateFreeShipping = () => {
    setFreeShippingError("");
    setFreeShippingSuccess("");
    setFreeShippingEditTarget(null);
    setFreeShippingForm({
      thresholdAmount: "10000",
      progressMessageTemplate: "Plus que {remaining} FCFA pour la livraison gratuite",
      unlockedMessage: "Livraison gratuite débloquée !",
      enabled: false
    });
    setFreeShippingModalOpen(true);
  };

  const openEditFreeShipping = (r) => {
    setFreeShippingError("");
    setFreeShippingSuccess("");
    setFreeShippingEditTarget(r);
    setFreeShippingForm({
      thresholdAmount: `${r?.thresholdAmount ?? ""}`,
      progressMessageTemplate: r?.progressMessageTemplate || "",
      unlockedMessage: r?.unlockedMessage || "",
      enabled: Boolean(r?.enabled)
    });
    setFreeShippingModalOpen(true);
  };

  const closeFreeShippingModal = () => {
    if (freeShippingSaving) return;
    setFreeShippingModalOpen(false);
    setFreeShippingEditTarget(null);
  };

  const submitFreeShipping = async (e) => {
    e.preventDefault();
    if (freeShippingSaving) return;
    setFreeShippingError("");
    setFreeShippingSuccess("");
    setFreeShippingSaving(true);
    try {
      const threshold = Number(`${freeShippingForm.thresholdAmount || ""}`.trim().replace(/\s+/g, "").replace(",", "."));
      if (!Number.isFinite(threshold) || threshold < 0) {
        setFreeShippingError("Seuil invalide.");
        return;
      }
      const payload = {
        thresholdAmount: threshold,
        enabled: Boolean(freeShippingForm.enabled),
        progressMessageTemplate: freeShippingForm.progressMessageTemplate || null,
        unlockedMessage: freeShippingForm.unlockedMessage || null
      };
      if (freeShippingEditTarget?.id) {
        await backofficeApi.updateFreeShippingRule(freeShippingEditTarget.id, payload);
        setFreeShippingSuccess("Configuration mise à jour.");
      } else {
        await backofficeApi.createFreeShippingRule(payload);
        setFreeShippingSuccess("Configuration ajoutée.");
      }
      setFreeShippingModalOpen(false);
      setFreeShippingEditTarget(null);
      await loadFreeShippingRules();
    } catch (err) {
      setFreeShippingError(err?.message || "Impossible d’enregistrer la configuration.");
    } finally {
      setFreeShippingSaving(false);
    }
  };

  const toggleFreeShipping = async (r) => {
    if (!r?.id) return;
    if (freeShippingTogglingId) return;
    setFreeShippingError("");
    setFreeShippingSuccess("");
    setFreeShippingTogglingId(r.id);
    try {
      if (Boolean(r.enabled)) {
        await backofficeApi.disableFreeShippingRule(r.id);
        setFreeShippingSuccess("Désactivée.");
      } else {
        await backofficeApi.enableFreeShippingRule(r.id);
        setFreeShippingSuccess("Activée.");
      }
      await loadFreeShippingRules();
    } catch (err) {
      setFreeShippingError(err?.message || "Impossible de modifier l’état.");
    } finally {
      setFreeShippingTogglingId("");
    }
  };

  const deleteFreeShipping = async (r) => {
    if (!r?.id) return;
    if (freeShippingDeletingId) return;
    const confirm = window.confirm("Supprimer cette configuration ?");
    if (!confirm) return;
    setFreeShippingError("");
    setFreeShippingSuccess("");
    setFreeShippingDeletingId(r.id);
    try {
      await backofficeApi.deleteFreeShippingRule(r.id);
      setFreeShippingSuccess("Configuration supprimée.");
      await loadFreeShippingRules();
    } catch (err) {
      setFreeShippingError(err?.message || "Impossible de supprimer la configuration.");
    } finally {
      setFreeShippingDeletingId("");
    }
  };

  const openCreateShippingMethod = () => {
    setShippingMethodsError("");
    setShippingMethodsSuccess("");
    setShippingMethodEditTarget(null);
    setShippingMethodForm({
      code: "STANDARD",
      label: "Standard",
      description: "3-5 jours ouvrables",
      costAmount: "3250",
      enabled: true,
      isDefault: true,
      sortOrder: "0"
    });
    setShippingMethodModalOpen(true);
  };

  const openEditShippingMethod = (m) => {
    setShippingMethodsError("");
    setShippingMethodsSuccess("");
    setShippingMethodEditTarget(m);
    setShippingMethodForm({
      code: m?.code || "",
      label: m?.label || "",
      description: m?.description || "",
      costAmount: `${m?.costAmount ?? ""}`,
      enabled: Boolean(m?.enabled),
      isDefault: Boolean(m?.isDefault),
      sortOrder: `${m?.sortOrder ?? 0}`
    });
    setShippingMethodModalOpen(true);
  };

  const closeShippingMethodModal = () => {
    if (shippingMethodSaving) return;
    setShippingMethodModalOpen(false);
    setShippingMethodEditTarget(null);
  };

  const submitShippingMethod = async (e) => {
    e.preventDefault();
    if (shippingMethodSaving) return;
    setShippingMethodsError("");
    setShippingMethodsSuccess("");
    setShippingMethodSaving(true);
    try {
      const cost = Number(`${shippingMethodForm.costAmount || ""}`.trim().replace(/\s+/g, "").replace(",", "."));
      if (!Number.isFinite(cost) || cost < 0) {
        setShippingMethodsError("Coût invalide.");
        return;
      }
      const sortOrder = `${shippingMethodForm.sortOrder || ""}`.trim() === "" ? 0 : Number(shippingMethodForm.sortOrder);
      const payload = {
        code: `${shippingMethodForm.code || ""}`.trim(),
        label: `${shippingMethodForm.label || ""}`.trim(),
        description: `${shippingMethodForm.description || ""}`.trim() || null,
        costAmount: cost,
        enabled: Boolean(shippingMethodForm.enabled),
        isDefault: Boolean(shippingMethodForm.isDefault),
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0
      };
      if (shippingMethodEditTarget?.id) {
        await backofficeApi.updateShippingMethod(shippingMethodEditTarget.id, payload);
        setShippingMethodsSuccess("Modalité mise à jour.");
      } else {
        await backofficeApi.createShippingMethod(payload);
        setShippingMethodsSuccess("Modalité ajoutée.");
      }
      setShippingMethodModalOpen(false);
      setShippingMethodEditTarget(null);
      await loadShippingMethods();
    } catch (err) {
      setShippingMethodsError(err?.message || "Impossible d’enregistrer la modalité.");
    } finally {
      setShippingMethodSaving(false);
    }
  };

  const toggleShippingMethod = async (m) => {
    if (!m?.id) return;
    if (shippingMethodTogglingId) return;
    setShippingMethodsError("");
    setShippingMethodsSuccess("");
    setShippingMethodTogglingId(m.id);
    try {
      if (Boolean(m.enabled)) {
        await backofficeApi.disableShippingMethod(m.id);
        setShippingMethodsSuccess("Désactivée.");
      } else {
        await backofficeApi.enableShippingMethod(m.id);
        setShippingMethodsSuccess("Activée.");
      }
      await loadShippingMethods();
    } catch (err) {
      setShippingMethodsError(err?.message || "Impossible de modifier l’état.");
    } finally {
      setShippingMethodTogglingId("");
    }
  };

  const setDefaultShippingMethod = async (m) => {
    if (!m?.id) return;
    if (shippingMethodDefaultId) return;
    setShippingMethodsError("");
    setShippingMethodsSuccess("");
    setShippingMethodDefaultId(m.id);
    try {
      await backofficeApi.setDefaultShippingMethod(m.id);
      setShippingMethodsSuccess("Par défaut mis à jour.");
      await loadShippingMethods();
    } catch (err) {
      setShippingMethodsError(err?.message || "Impossible de définir par défaut.");
    } finally {
      setShippingMethodDefaultId("");
    }
  };

  const deleteShippingMethod = async (m) => {
    if (!m?.id) return;
    if (shippingMethodDeletingId) return;
    const confirm = window.confirm("Supprimer cette modalité de livraison ?");
    if (!confirm) return;
    setShippingMethodsError("");
    setShippingMethodsSuccess("");
    setShippingMethodDeletingId(m.id);
    try {
      await backofficeApi.deleteShippingMethod(m.id);
      setShippingMethodsSuccess("Modalité supprimée.");
      await loadShippingMethods();
    } catch (err) {
      setShippingMethodsError(err?.message || "Impossible de supprimer la modalité.");
    } finally {
      setShippingMethodDeletingId("");
    }
  };

  const submitCourier = async (e) => {
    e.preventDefault();
    if (courierLoading) return;
    setCourierError("");
    setCourierSuccess("");
    setCourierLoading(true);
    try {
      await backofficeApi.createCourier({
        prenom: courierForm.prenom || null,
        nom: courierForm.nom || null,
        email: courierForm.email,
        telephone: courierForm.telephone || null,
        password: courierForm.password
      });
      setCourierSuccess("Livreur créé.");
      setCourierForm({ prenom: "", nom: "", email: "", telephone: "", password: "" });
      await loadCouriers();
    } catch (err) {
      setCourierError(err?.message || "Impossible de créer le livreur.");
    } finally {
      setCourierLoading(false);
    }
  };

  const openEditCourier = (u) => {
    setCourierError("");
    setCourierSuccess("");
    setCourierEditTarget(u);
    setCourierEditForm({
      prenom: u?.prenom || "",
      nom: u?.nom || "",
      email: u?.email || "",
      telephone: u?.telephone || ""
    });
    setCourierModalOpen(true);
  };

  const closeCourierModal = () => {
    if (courierSaving) return;
    setCourierModalOpen(false);
    setCourierEditTarget(null);
  };

  const submitCourierEdit = async (e) => {
    e.preventDefault();
    if (courierSaving) return;
    if (!courierEditTarget?.id) return;
    setCourierError("");
    setCourierSuccess("");
    setCourierSaving(true);
    try {
      await backofficeApi.updateUser(courierEditTarget.id, {
        prenom: courierEditForm.prenom || null,
        nom: courierEditForm.nom || null,
        email: courierEditForm.email,
        telephone: courierEditForm.telephone || null,
        emailVerifie: true,
        role: "LIVREUR",
        avatarUrl: null,
        ville: null,
        pays: null
      });
      setCourierSuccess("Livreur mis à jour.");
      setCourierModalOpen(false);
      setCourierEditTarget(null);
      await loadCouriers();
    } catch (err) {
      setCourierError(err?.message || "Impossible de modifier le livreur.");
    } finally {
      setCourierSaving(false);
    }
  };

  const deleteCourier = async (u) => {
    if (!u?.id) return;
    if (courierDeletingId) return;
    const confirm = window.confirm("Supprimer ce compte livreur ?");
    if (!confirm) return;
    setCourierDeletingId(u.id);
    setCourierError("");
    setCourierSuccess("");
    try {
      await backofficeApi.deleteUser(u.id);
      setCourierSuccess("Livreur supprimé.");
      await loadCouriers();
    } catch (err) {
      setCourierError(err?.message || "Impossible de supprimer le livreur.");
    } finally {
      setCourierDeletingId(null);
    }
  };

  const openCreateTeamMember = () => {
    setTeamError("");
    setTeamSuccess("");
    setTeamEditTarget(null);
    setTeamForm({ prenom: "", nom: "", email: "", telephone: "", role: "ADMIN" });
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

  const formatLastExport = (value) => {
    if (!value) return "Aucun export";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "Aucun export";
    return `Dernier export ${new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    }).format(d)}`;
  };

  const openSecurityModal = () => {
    setSecurityError("");
    setSecurityModalOpen(true);
  };

  const closeSecurityModal = () => {
    if (securitySaving) return;
    setSecurityModalOpen(false);
  };

  const saveSecuritySettings = async () => {
    if (securitySaving) return;
    setSecuritySaving(true);
    setSecurityError("");
    try {
      const updated = await backofficeApi.updateSecuritySettings({
        admin2faEnabled: Boolean(securitySettings?.admin2faEnabled)
      });
      setSecuritySettings({ admin2faEnabled: Boolean(updated?.admin2faEnabled) });
      setSecurityModalOpen(false);
    } catch (err) {
      setSecurityError(err?.message || "Impossible d’enregistrer la sécurité.");
    } finally {
      setSecuritySaving(false);
    }
  };

  const exportSecurityActivity = async () => {
    if (securityExporting) return;
    setSecurityExporting(true);
    setSecurityError("");
    try {
      const blob = await backofficeApi.securityActivityExportCsv(500);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "security-activity.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      const now = new Date().toISOString();
      setSecurityLastExportAt(now);
      try {
        localStorage.setItem("lid_backoffice_security_last_export_at", now);
      } catch {}
    } catch (err) {
      setSecurityError(err?.message || "Impossible d'exporter les logs.");
    } finally {
      setSecurityExporting(false);
    }
  };

  const canSaveIntegration = (() => {
    if (!integrationTarget) return false;
    if (integrationTarget === "PAYDUNYA") {
      if (integrations?.paydunyaConnected) return Boolean(`${paydunyaForm.mode || ""}`.trim());
      return Boolean(
        `${paydunyaForm.masterKey || ""}`.trim() &&
          `${paydunyaForm.privateKey || ""}`.trim() &&
          `${paydunyaForm.token || ""}`.trim()
      );
    }
    if (integrationTarget === "SENDINBLUE") {
      if (integrations?.sendinblueConnected) return true;
      return Boolean(`${sendinblueForm.apiKey || ""}`.trim());
    }
    if (integrationTarget === "SLACK") {
      if (integrations?.slackConnected) return true;
      return Boolean(`${slackForm.webhookUrl || ""}`.trim());
    }
    if (integrationTarget === "GOOGLE_ANALYTICS") {
      if (integrations?.googleAnalyticsConnected) return true;
      return Boolean(`${googleAnalyticsForm.measurementId || ""}`.trim());
    }
    return false;
  })();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Paramètres"
        subtitle="Gérez les profils, la sécurité et les intégrations."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <SectionHeader title="Informations boutique" subtitle="Profil public" />
          {shopError ? <div className="text-sm text-red-600">{shopError}</div> : null}
          {shopSuccess ? <div className="text-sm text-emerald-700">{shopSuccess}</div> : null}

          <form onSubmit={submitShop} className="grid gap-3">
            <Input
              placeholder="Nom de boutique"
              value={shopForm.storeName}
              onChange={(e) => setShopForm((s) => ({ ...s, storeName: e.target.value }))}
              disabled={shopLoading || shopSaving}
              required
            />
            <Input
              placeholder="Email"
              type="email"
              value={shopForm.contactEmail}
              onChange={(e) => setShopForm((s) => ({ ...s, contactEmail: e.target.value }))}
              disabled={shopLoading || shopSaving}
              required
            />
            <Input
              placeholder="Téléphone"
              type="tel"
              value={shopForm.contactPhone}
              onChange={(e) => setShopForm((s) => ({ ...s, contactPhone: e.target.value }))}
              disabled={shopLoading || shopSaving}
              required
            />
            <Input
              placeholder="Ville"
              value={shopForm.city}
              onChange={(e) => setShopForm((s) => ({ ...s, city: e.target.value }))}
              disabled={shopLoading || shopSaving}
              required
            />
            <Input
              placeholder="Logo (URL)"
              value={shopForm.logoUrl}
              onChange={(e) => setShopForm((s) => ({ ...s, logoUrl: e.target.value }))}
              disabled={shopLoading || shopSaving}
            />
            <Input
              placeholder="Slogan"
              value={shopForm.slogan}
              onChange={(e) => setShopForm((s) => ({ ...s, slogan: e.target.value }))}
              disabled={shopLoading || shopSaving}
            />
            <Select
              value={shopForm.activitySector}
              onChange={(e) => setShopForm((s) => ({ ...s, activitySector: e.target.value }))}
              options={[{ value: "ECOMMERCE", label: "e-commerce" }]}
            />
            <div className="flex items-center gap-2">
              <Button className="w-fit" disabled={shopLoading || shopSaving}>
                {shopSaving ? "Sauvegarde…" : "Sauvegarder"}
              </Button>
              <Button type="button" variant="outline" onClick={loadShopProfile} disabled={shopLoading || shopSaving}>
                {shopLoading ? "Chargement…" : "Actualiser"}
              </Button>
            </div>
          </form>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-semibold text-foreground">Réseaux sociaux</div>
                <div className="text-xs text-muted-foreground">Affichés dans le footer du site.</div>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={loadSocialLinks} disabled={socialLoading}>
                  {socialLoading ? "Chargement…" : "Actualiser"}
                </Button>
                <Button type="button" size="sm" onClick={openCreateSocial}>
                  Ajouter
                </Button>
              </div>
            </div>

            {socialError ? <div className="text-sm text-red-600">{socialError}</div> : null}
            {socialSuccess ? <div className="text-sm text-emerald-700">{socialSuccess}</div> : null}

            {socialLinks.length === 0 ? (
              <div className="text-sm text-muted-foreground">{socialLoading ? "Chargement…" : "Aucun réseau social."}</div>
            ) : (
              <div className="space-y-2">
                {socialLinks.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-input bg-background/60 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground">{s.platform}</div>
                      <div className="text-xs text-muted-foreground truncate">{s.url}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditSocial(s)}>
                        Modifier
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteSocial(s)}>
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-semibold text-foreground">Bandeau panier</div>
                <div className="text-xs text-muted-foreground">Livraison gratuite (seuil, texte, activation).</div>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={loadFreeShippingRules} disabled={freeShippingLoading}>
                  {freeShippingLoading ? "Chargement…" : "Actualiser"}
                </Button>
                <Button type="button" size="sm" onClick={openCreateFreeShipping}>
                  Ajouter
                </Button>
              </div>
            </div>

            {freeShippingError ? <div className="text-sm text-red-600">{freeShippingError}</div> : null}
            {freeShippingSuccess ? <div className="text-sm text-emerald-700">{freeShippingSuccess}</div> : null}

            {freeShippingRules.length === 0 ? (
              <div className="text-sm text-muted-foreground">{freeShippingLoading ? "Chargement…" : "Aucune configuration."}</div>
            ) : (
              <div className="space-y-2">
                {freeShippingRules.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-input bg-background/60 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-foreground">{Number(r?.thresholdAmount || 0).toLocaleString()} FCFA</div>
                        {r?.enabled ? <Badge label="ACTIF" variant="success" /> : <Badge label="INACTIF" variant="outline" />}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {r?.progressMessageTemplate || "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-semibold text-foreground">Modalités de livraison</div>
                <div className="text-xs text-muted-foreground">Standard, Express, prix, libellés, activation.</div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={loadShippingMethods}
                  disabled={shippingMethodsLoading}
                >
                  {shippingMethodsLoading ? "Chargement…" : "Actualiser"}
                </Button>
                <Button type="button" size="sm" onClick={openCreateShippingMethod}>
                  Ajouter
                </Button>
              </div>
            </div>

            {shippingMethodsError ? <div className="text-sm text-red-600">{shippingMethodsError}</div> : null}
            {shippingMethodsSuccess ? <div className="text-sm text-emerald-700">{shippingMethodsSuccess}</div> : null}

            {shippingMethods.length === 0 ? (
              <div className="text-sm text-muted-foreground">{shippingMethodsLoading ? "Chargement…" : "Aucune modalité."}</div>
            ) : (
              <div className="space-y-2">
                {shippingMethods.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-input bg-background/60 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-foreground">{m.label || m.code}</div>
                        {m?.isDefault ? <Badge label="PAR DÉFAUT" variant="outline" /> : null}
                        {m?.enabled ? <Badge label="ACTIF" variant="success" /> : <Badge label="INACTIF" variant="outline" />}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {m?.description || "—"} · {Number(m?.costAmount || 0).toLocaleString()} FCFA
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                        disabled={shippingMethodDefaultId === m.id}
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionHeader title="Sécurité" subtitle="Accès & rôles" />
          {securityError ? <div className="text-sm text-red-600">{securityError}</div> : null}
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Authentification double facteur</p>
                <p className="text-xs text-muted-foreground">
                  {securityLoading ? "Chargement…" : securitySettings?.admin2faEnabled ? "Activée pour les admins" : "Désactivée"}
                </p>
              </div>
              <Button variant="outline" onClick={openSecurityModal} disabled={securityLoading}>
                Configurer
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Logs d'activité</p>
                <p className="text-xs text-muted-foreground">{formatLastExport(securityLastExportAt)}</p>
              </div>
              <Button variant="outline" onClick={exportSecurityActivity} disabled={securityExporting}>
                {securityExporting ? "Export…" : "Exporter"}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-4 lg:col-span-2">
          <SectionHeader title="Livreurs" subtitle="Créer et gérer l’accès Delivery." />

          {courierError ? <div className="text-sm text-red-600">{courierError}</div> : null}
          {courierSuccess ? <div className="text-sm text-emerald-700">{courierSuccess}</div> : null}

          <form onSubmit={submitCourier} className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="Prénom"
              value={courierForm.prenom}
              onChange={(e) => setCourierForm((s) => ({ ...s, prenom: e.target.value }))}
            />
            <Input
              placeholder="Nom"
              value={courierForm.nom}
              onChange={(e) => setCourierForm((s) => ({ ...s, nom: e.target.value }))}
            />
            <Input
              placeholder="Email"
              type="email"
              value={courierForm.email}
              onChange={(e) => setCourierForm((s) => ({ ...s, email: e.target.value }))}
              required
            />
            <Input
              placeholder="Téléphone"
              value={courierForm.telephone}
              onChange={(e) => setCourierForm((s) => ({ ...s, telephone: e.target.value }))}
            />
            <Input
              placeholder="Mot de passe (min 6)"
              type="password"
              autoComplete="new-password"
              value={courierForm.password}
              onChange={(e) => setCourierForm((s) => ({ ...s, password: e.target.value }))}
              required
            />
            <div className="flex items-center gap-2 md:col-span-2">
              <Button className="w-fit" disabled={courierLoading}>
                {courierLoading ? "Création…" : "Créer le livreur"}
              </Button>
              <Button type="button" variant="outline" onClick={loadCouriers} disabled={courierLoading}>
                Actualiser
              </Button>
            </div>
          </form>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="font-semibold text-foreground">Comptes livreurs</div>
            {couriers.length === 0 ? (
              <div>Aucun livreur.</div>
            ) : (
              couriers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-input bg-background/60 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground">
                      {`${u?.prenom || ""} ${u?.nom || ""}`.trim() || "-"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:block text-xs text-muted-foreground">{u.telephone || "-"}</div>
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
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionHeader title="Équipe" subtitle="Collaborateurs" />
          {teamError ? <div className="text-sm text-red-600">{teamError}</div> : null}
          {teamSuccess ? <div className="text-sm text-emerald-700">{teamSuccess}</div> : null}

          <div className="flex items-center gap-2">
            <Button className="w-fit" onClick={openCreateTeamMember}>
              Ajouter
            </Button>
            <Button type="button" variant="outline" onClick={loadTeamMembers} disabled={teamLoading}>
              {teamLoading ? "Chargement…" : "Actualiser"}
            </Button>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="font-semibold text-foreground">Admins</div>
            {teamMembers.length === 0 ? (
              <div>{teamLoading ? "Chargement…" : "Aucun admin."}</div>
            ) : (
              teamMembers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-input bg-background/60 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-foreground truncate">
                        {`${u?.prenom || ""} ${u?.nom || ""}`.trim() || "-"}
                      </div>
                      <Badge
                        label={u?.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN"}
                        variant={u?.role === "SUPER_ADMIN" ? "warning" : "outline"}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{u?.email || "-"}</div>
                  </div>

                  <div className="flex items-center gap-2">
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
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionHeader title="Intégrations" subtitle="Services connectés" />
          {integrationsError ? <div className="text-sm text-red-600">{integrationsError}</div> : null}
          {integrationsSuccess ? <div className="text-sm text-emerald-700">{integrationsSuccess}</div> : null}
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-foreground">Paydunya</div>
                <div className="text-xs text-muted-foreground">
                  {integrationsLoading ? "Chargement…" : integrations.paydunyaConnected ? `Connecté (${integrations.paydunyaMode || "test"})` : "Non connecté"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {integrations.paydunyaConnected ? <Badge label="Connecté" variant="success" /> : <Badge label="Non connecté" variant="outline" />}
                <Button variant="outline" size="sm" onClick={() => openIntegration("PAYDUNYA")} disabled={integrationsLoading || integrationsSaving}>
                  {integrations.paydunyaConnected ? "Modifier" : "Connecter"}
                </Button>
                {integrations.paydunyaConnected ? (
                  <Button variant="destructive" size="sm" onClick={() => disconnectIntegration("PAYDUNYA")} disabled={integrationsLoading || integrationsSaving}>
                    Déconnecter
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-foreground">Sendinblue</div>
                <div className="text-xs text-muted-foreground">
                  {integrationsLoading ? "Chargement…" : integrations.sendinblueConnected ? "Connecté" : "Non connecté"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {integrations.sendinblueConnected ? <Badge label="Connecté" variant="success" /> : <Badge label="Non connecté" variant="outline" />}
                <Button variant="outline" size="sm" onClick={() => openIntegration("SENDINBLUE")} disabled={integrationsLoading || integrationsSaving}>
                  {integrations.sendinblueConnected ? "Modifier" : "Connecter"}
                </Button>
                {integrations.sendinblueConnected ? (
                  <Button variant="destructive" size="sm" onClick={() => disconnectIntegration("SENDINBLUE")} disabled={integrationsLoading || integrationsSaving}>
                    Déconnecter
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-foreground">Slack</div>
                <div className="text-xs text-muted-foreground">
                  {integrationsLoading ? "Chargement…" : integrations.slackConnected ? "Connecté" : "Non connecté"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {integrations.slackConnected ? <Badge label="Connecté" variant="success" /> : <Badge label="Non connecté" variant="outline" />}
                <Button variant="outline" size="sm" onClick={() => openIntegration("SLACK")} disabled={integrationsLoading || integrationsSaving}>
                  {integrations.slackConnected ? "Modifier" : "Connecter"}
                </Button>
                {integrations.slackConnected ? (
                  <Button variant="destructive" size="sm" onClick={() => disconnectIntegration("SLACK")} disabled={integrationsLoading || integrationsSaving}>
                    Déconnecter
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-foreground">Google Analytics</div>
                <div className="text-xs text-muted-foreground">
                  {integrationsLoading ? "Chargement…" : integrations.googleAnalyticsConnected ? "Connecté" : "Non connecté"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {integrations.googleAnalyticsConnected ? <Badge label="Connecté" variant="success" /> : <Badge label="Non connecté" variant="outline" />}
                <Button variant="outline" size="sm" onClick={() => openIntegration("GOOGLE_ANALYTICS")} disabled={integrationsLoading || integrationsSaving}>
                  {integrations.googleAnalyticsConnected ? "Modifier" : "Connecter"}
                </Button>
                {integrations.googleAnalyticsConnected ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => disconnectIntegration("GOOGLE_ANALYTICS")}
                    disabled={integrationsLoading || integrationsSaving}
                  >
                    Déconnecter
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionHeader title="Notifications" subtitle="Préférés" />
          {notificationError ? <div className="text-sm text-red-600">{notificationError}</div> : null}
          {notificationSuccess ? <div className="text-sm text-emerald-700">{notificationSuccess}</div> : null}
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between gap-2">
              <Button variant="outline" size="sm" onClick={loadNotificationPreferences} disabled={notificationLoading || notificationSaving}>
                {notificationLoading ? "Chargement…" : "Actualiser"}
              </Button>
              <Button size="sm" onClick={saveNotificationPreferences} disabled={notificationLoading || notificationSaving}>
                {notificationSaving ? "Sauvegarde…" : "Sauvegarder"}
              </Button>
            </div>

            {notificationPrefs.length === 0 ? (
              <div>{notificationLoading ? "Chargement…" : "Aucune préférence."}</div>
            ) : (
              <div className="space-y-2">
                {notificationPrefs.map((p) => (
                  <label
                    key={p.key}
                    className="flex items-center justify-between cursor-pointer hover:text-foreground"
                  >
                    <span>{p.label || p.key}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(p.enabled)}
                      onChange={() => toggleNotificationPref(p.key)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                    />
                  </label>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <Modal
        isOpen={integrationModalOpen}
        onClose={closeIntegrationModal}
        title={
          integrationTarget === "PAYDUNYA"
            ? "Connexion Paydunya"
            : integrationTarget === "SENDINBLUE"
              ? "Connexion Sendinblue"
              : integrationTarget === "SLACK"
                ? "Connexion Slack"
                : "Connexion Google Analytics"
        }
        footer={
          <>
            <Button variant="outline" onClick={closeIntegrationModal} disabled={integrationsSaving}>
              Annuler
            </Button>
            <Button onClick={submitIntegration} disabled={integrationsSaving || !canSaveIntegration}>
              {integrationsSaving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </>
        }
      >
        <form onSubmit={submitIntegration} className="grid gap-3">
          {integrationTarget === "PAYDUNYA" ? (
            <>
              <Select
                value={paydunyaForm.mode}
                onChange={(e) => setPaydunyaForm((s) => ({ ...s, mode: e.target.value }))}
                options={[
                  { value: "test", label: "test" },
                  { value: "live", label: "live" }
                ]}
              />
              <Input
                placeholder="Public key"
                value={paydunyaForm.publicKey}
                onChange={(e) => setPaydunyaForm((s) => ({ ...s, publicKey: e.target.value }))}
              />
              <Input
                placeholder="Private key"
                type="password"
                autoComplete="new-password"
                value={paydunyaForm.privateKey}
                onChange={(e) => setPaydunyaForm((s) => ({ ...s, privateKey: e.target.value }))}
              />
              <Input
                placeholder="Master key"
                type="password"
                autoComplete="new-password"
                value={paydunyaForm.masterKey}
                onChange={(e) => setPaydunyaForm((s) => ({ ...s, masterKey: e.target.value }))}
              />
              <Input
                placeholder="Token"
                type="password"
                autoComplete="new-password"
                value={paydunyaForm.token}
                onChange={(e) => setPaydunyaForm((s) => ({ ...s, token: e.target.value }))}
              />
            </>
          ) : null}

          {integrationTarget === "SENDINBLUE" ? (
            <Input
              placeholder="API key"
              type="password"
              autoComplete="new-password"
              value={sendinblueForm.apiKey}
              onChange={(e) => setSendinblueForm({ apiKey: e.target.value })}
            />
          ) : null}

          {integrationTarget === "SLACK" ? (
            <Input
              placeholder="Webhook URL"
              value={slackForm.webhookUrl}
              onChange={(e) => setSlackForm({ webhookUrl: e.target.value })}
            />
          ) : null}

          {integrationTarget === "GOOGLE_ANALYTICS" ? (
            <Input
              placeholder="Measurement ID (ex: G-XXXXXXX)"
              value={googleAnalyticsForm.measurementId}
              onChange={(e) => setGoogleAnalyticsForm({ measurementId: e.target.value })}
            />
          ) : null}
        </form>
      </Modal>

      <Modal
        isOpen={socialModalOpen}
        onClose={closeSocialModal}
        title={socialEditTarget?.id ? "Modifier un réseau social" : "Ajouter un réseau social"}
        footer={
          <>
            <Button variant="outline" onClick={closeSocialModal} disabled={socialSaving}>
              Annuler
            </Button>
            <Button onClick={submitSocial} disabled={socialSaving || !`${socialForm.url || ""}`.trim()}>
              {socialSaving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </>
        }
      >
        <form onSubmit={submitSocial} className="grid gap-3">
          <Select
            value={socialForm.platform}
            onChange={(e) => setSocialForm((s) => ({ ...s, platform: e.target.value }))}
            options={[
              { value: "INSTAGRAM", label: "Instagram" },
              { value: "FACEBOOK", label: "Facebook" },
              { value: "X", label: "X" },
              { value: "LINKEDIN", label: "LinkedIn" },
              { value: "TIKTOK", label: "TikTok" },
              { value: "YOUTUBE", label: "YouTube" },
              { value: "WHATSAPP", label: "WhatsApp" },
              { value: "WEBSITE", label: "Website" }
            ]}
          />
          <Input
            placeholder="URL"
            value={socialForm.url}
            onChange={(e) => setSocialForm((s) => ({ ...s, url: e.target.value }))}
            required
          />
          <Input
            placeholder="Ordre (0, 1, 2…)"
            value={socialForm.sortOrder}
            onChange={(e) => setSocialForm((s) => ({ ...s, sortOrder: e.target.value }))}
          />
        </form>
      </Modal>

      <Modal
        isOpen={freeShippingModalOpen}
        onClose={closeFreeShippingModal}
        title={freeShippingEditTarget?.id ? "Modifier bandeau panier" : "Ajouter bandeau panier"}
        footer={
          <>
            <Button variant="outline" onClick={closeFreeShippingModal} disabled={freeShippingSaving}>
              Annuler
            </Button>
            <Button
              onClick={submitFreeShipping}
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
        <form onSubmit={submitFreeShipping} className="grid gap-3">
          <Input
            placeholder="Seuil livraison gratuite (FCFA)"
            value={freeShippingForm.thresholdAmount}
            onChange={(e) => setFreeShippingForm((s) => ({ ...s, thresholdAmount: e.target.value }))}
            required
          />
          <Input
            placeholder="Texte progression (ex: Plus que {remaining} FCFA...)"
            value={freeShippingForm.progressMessageTemplate}
            onChange={(e) => setFreeShippingForm((s) => ({ ...s, progressMessageTemplate: e.target.value }))}
            required
          />
          <Input
            placeholder="Texte débloqué (ex: Livraison gratuite débloquée !)"
            value={freeShippingForm.unlockedMessage}
            onChange={(e) => setFreeShippingForm((s) => ({ ...s, unlockedMessage: e.target.value }))}
          />
          <Select
            value={freeShippingForm.enabled ? "true" : "false"}
            onChange={(e) => setFreeShippingForm((s) => ({ ...s, enabled: e.target.value === "true" }))}
            options={[
              { value: "false", label: "Désactivé" },
              { value: "true", label: "Actif" }
            ]}
          />
          <div className="text-xs text-muted-foreground">
            Variables: {"{remaining}"} = montant restant, {"{threshold}"} = seuil.
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={shippingMethodModalOpen}
        onClose={closeShippingMethodModal}
        title={shippingMethodEditTarget?.id ? "Modifier modalité de livraison" : "Ajouter modalité de livraison"}
        footer={
          <>
            <Button variant="outline" onClick={closeShippingMethodModal} disabled={shippingMethodSaving}>
              Annuler
            </Button>
            <Button
              onClick={submitShippingMethod}
              disabled={
                shippingMethodSaving ||
                !`${shippingMethodForm.code || ""}`.trim() ||
                !`${shippingMethodForm.label || ""}`.trim() ||
                `${shippingMethodForm.costAmount || ""}`.trim() === ""
              }
            >
              {shippingMethodSaving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </>
        }
      >
        <form onSubmit={submitShippingMethod} className="grid gap-3">
          <Input
            placeholder="Code (ex: STANDARD, EXPRESS)"
            value={shippingMethodForm.code}
            onChange={(e) => setShippingMethodForm((s) => ({ ...s, code: e.target.value }))}
            required
          />
          <Input
            placeholder="Libellé (ex: Standard)"
            value={shippingMethodForm.label}
            onChange={(e) => setShippingMethodForm((s) => ({ ...s, label: e.target.value }))}
            required
          />
          <Input
            placeholder="Description (ex: 3-5 jours ouvrables)"
            value={shippingMethodForm.description}
            onChange={(e) => setShippingMethodForm((s) => ({ ...s, description: e.target.value }))}
          />
          <Input
            placeholder="Coût (FCFA)"
            value={shippingMethodForm.costAmount}
            onChange={(e) => setShippingMethodForm((s) => ({ ...s, costAmount: e.target.value }))}
            required
          />
          <Input
            placeholder="Ordre (0, 1, 2…)"
            value={shippingMethodForm.sortOrder}
            onChange={(e) => setShippingMethodForm((s) => ({ ...s, sortOrder: e.target.value }))}
          />
          <Select
            value={shippingMethodForm.enabled ? "true" : "false"}
            onChange={(e) => setShippingMethodForm((s) => ({ ...s, enabled: e.target.value === "true" }))}
            options={[
              { value: "true", label: "Actif" },
              { value: "false", label: "Désactivé" }
            ]}
          />
          <Select
            value={shippingMethodForm.isDefault ? "true" : "false"}
            onChange={(e) => setShippingMethodForm((s) => ({ ...s, isDefault: e.target.value === "true" }))}
            options={[
              { value: "true", label: "Par défaut" },
              { value: "false", label: "Non" }
            ]}
          />
        </form>
      </Modal>

      <Modal
        isOpen={courierModalOpen}
        onClose={closeCourierModal}
        title="Modifier un livreur"
        footer={
          <>
            <Button variant="outline" onClick={closeCourierModal} disabled={courierSaving}>
              Annuler
            </Button>
            <Button onClick={submitCourierEdit} disabled={courierSaving}>
              {courierSaving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </>
        }
      >
        <form onSubmit={submitCourierEdit} className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Prénom"
              value={courierEditForm.prenom}
              onChange={(e) => setCourierEditForm((s) => ({ ...s, prenom: e.target.value }))}
            />
            <Input
              placeholder="Nom"
              value={courierEditForm.nom}
              onChange={(e) => setCourierEditForm((s) => ({ ...s, nom: e.target.value }))}
            />
          </div>

          <Input
            placeholder="Email"
            type="email"
            value={courierEditForm.email}
            onChange={(e) => setCourierEditForm((s) => ({ ...s, email: e.target.value }))}
            required
          />

          <Input
            placeholder="Téléphone"
            value={courierEditForm.telephone}
            onChange={(e) => setCourierEditForm((s) => ({ ...s, telephone: e.target.value }))}
          />
        </form>
      </Modal>

      <Modal
        isOpen={teamModalOpen}
        onClose={closeTeamModal}
        title={teamEditTarget?.id ? "Modifier un membre" : "Ajouter un membre"}
        footer={
          <>
            <Button variant="outline" onClick={closeTeamModal} disabled={teamSaving}>
              Annuler
            </Button>
            <Button onClick={submitTeamMember} disabled={teamSaving}>
              {teamSaving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </>
        }
      >
        <form onSubmit={submitTeamMember} className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Prénom"
              value={teamForm.prenom}
              onChange={(e) => setTeamForm((s) => ({ ...s, prenom: e.target.value }))}
            />
            <Input
              placeholder="Nom"
              value={teamForm.nom}
              onChange={(e) => setTeamForm((s) => ({ ...s, nom: e.target.value }))}
            />
          </div>

          <Input
            placeholder="Email"
            type="email"
            value={teamForm.email}
            onChange={(e) => setTeamForm((s) => ({ ...s, email: e.target.value }))}
            required
          />

          <Input
            placeholder="Téléphone"
            value={teamForm.telephone}
            onChange={(e) => setTeamForm((s) => ({ ...s, telephone: e.target.value }))}
          />

          <Select
            value={teamForm.role}
            onChange={(e) => setTeamForm((s) => ({ ...s, role: e.target.value }))}
            options={[
              { value: "ADMIN", label: "ADMIN" },
              { value: "SUPER_ADMIN", label: "SUPER_ADMIN" }
            ]}
          />
        </form>
      </Modal>

      <Modal
        isOpen={securityModalOpen}
        onClose={closeSecurityModal}
        title="Sécurité"
        footer={
          <>
            <Button variant="outline" onClick={closeSecurityModal} disabled={securitySaving}>
              Annuler
            </Button>
            <Button onClick={saveSecuritySettings} disabled={securitySaving}>
              {securitySaving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-foreground">2FA Admin</div>
              <div className="text-muted-foreground">Code email à la connexion pour ADMIN/SUPER_ADMIN.</div>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
              checked={Boolean(securitySettings?.admin2faEnabled)}
              onChange={(e) => setSecuritySettings({ admin2faEnabled: e.target.checked })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
