import { useEffect, useMemo, useState } from "react";
import { Edit2, Mail, Plus, RefreshCw, Search, Send, Trash2, UserPlus } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Modal from "../components/ui/Modal.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { backofficeApi } from "../services/api.js";

const formatDateTime = (value) => {
  if (!value) return "-";
  const s = `${value}`.trim();
  if (!s) return "-";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("fr-FR");
};

const toDateTimeLocalValue = (value) => {
  const s = `${value || ""}`.trim();
  if (!s) return "";
  return s.length >= 16 ? s.slice(0, 16) : s;
};

const normalizeDateTimeForApi = (value) => {
  const s = `${value || ""}`.trim();
  if (!s) return null;
  if (s.length === 16) return `${s}:00`;
  return s;
};

const mapCampaignStatus = (value) => {
  if (value === "ACTIVE") return "Active";
  if (value === "SCHEDULED") return "Planifiée";
  if (value === "FINISHED") return "Terminée";
  return value || "-";
};

const mapCampaignType = (value) => {
  if (value === "EMAIL") return "Email";
  if (value === "SMS") return "SMS";
  if (value === "SOCIAL") return "Réseaux sociaux";
  return value || "-";
};

const mapAudience = (value) => {
  if (value === "NEWSLETTER") return "Newsletter";
  if (value === "CLIENTS") return "Clients";
  if (value === "ALL") return "Tous";
  return value || "-";
};

const mapSubscriberStatus = (value) => {
  if (value === "SUBSCRIBED") return "Abonné";
  if (value === "UNSUBSCRIBED") return "Désabonné";
  return value || "-";
};

export default function Marketing() {
  const [tab, setTab] = useState("campaigns"); // campaigns | newsletter

  // Campaigns
  const [campaigns, setCampaigns] = useState([]);
  const [campaignStatusFilter, setCampaignStatusFilter] = useState("");
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [campaignError, setCampaignError] = useState("");
  const [sendingId, setSendingId] = useState("");

  const [isCampaignFormOpen, setIsCampaignFormOpen] = useState(false);
  const [isCampaignDeleteOpen, setIsCampaignDeleteOpen] = useState(false);
  const [campaignSaving, setCampaignSaving] = useState(false);
  const [campaignFormError, setCampaignFormError] = useState("");
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    type: "EMAIL",
    audience: "NEWSLETTER",
    status: "ACTIVE",
    scheduledAt: "",
    subject: "",
    content: ""
  });

  // Newsletter
  const [newsletterStats, setNewsletterStats] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [subscriberStatusFilter, setSubscriberStatusFilter] = useState("");
  const [subscriberQuery, setSubscriberQuery] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterError, setNewsletterError] = useState("");
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [subscriberSaving, setSubscriberSaving] = useState(false);
  const [isSubscriberDeleteOpen, setIsSubscriberDeleteOpen] = useState(false);
  const [currentSubscriber, setCurrentSubscriber] = useState(null);

  const campaignRows = useMemo(() => {
    return (Array.isArray(campaigns) ? campaigns : []).map((c) => ({
      ...c,
      statusLabel: mapCampaignStatus(c.status),
      typeLabel: mapCampaignType(c.type),
      audienceLabel: mapAudience(c.audience),
      scheduledAtLabel: formatDateTime(c.scheduledAt),
      sentAtLabel: formatDateTime(c.sentAt),
      progress:
        Number(c.targetCount ?? 0) > 0
          ? `${new Intl.NumberFormat("fr-FR").format(Number(c.sent ?? 0))}/${new Intl.NumberFormat("fr-FR").format(
              Number(c.targetCount ?? 0)
            )}`
          : "-"
    }));
  }, [campaigns]);

  const subscriberRows = useMemo(() => {
    return (Array.isArray(subscribers) ? subscribers : []).map((s) => ({
      ...s,
      statusLabel: mapSubscriberStatus(s.status),
      createdAtLabel: formatDateTime(s.dateCreation)
    }));
  }, [subscribers]);

  async function loadCampaigns() {
    setCampaignLoading(true);
    setCampaignError("");
    try {
      const page = await backofficeApi.marketingCampaigns(0, 50, campaignStatusFilter);
      setCampaigns(Array.isArray(page?.content) ? page.content : []);
    } catch (err) {
      setCampaignError(err?.message || "Impossible de charger les campagnes.");
    } finally {
      setCampaignLoading(false);
    }
  }

  useEffect(() => {
    loadCampaigns();
  }, [campaignStatusFilter]);

  async function loadNewsletter() {
    setNewsletterLoading(true);
    setNewsletterError("");
    try {
      const [stats, page] = await Promise.all([
        backofficeApi.newsletterStats().catch(() => null),
        backofficeApi.newsletterSubscribers(0, 50, subscriberStatusFilter, subscriberQuery.trim())
      ]);
      setNewsletterStats(stats || null);
      setSubscribers(Array.isArray(page?.content) ? page.content : []);
    } catch (err) {
      setNewsletterError(err?.message || "Impossible de charger la newsletter.");
    } finally {
      setNewsletterLoading(false);
    }
  }

  useEffect(() => {
    if (tab !== "newsletter") return;
    const t = setTimeout(() => {
      loadNewsletter();
    }, 250);
    return () => clearTimeout(t);
  }, [tab, subscriberStatusFilter, subscriberQuery]);

  function openCreateCampaign(preset = {}) {
    const type = preset.type || "EMAIL";
    const audience = preset.audience || (type === "SMS" ? "CLIENTS" : type === "SOCIAL" ? "ALL" : "NEWSLETTER");
    setCurrentCampaign(null);
    setCampaignFormError("");
    setCampaignForm({
      name: preset.name || "",
      type,
      audience,
      status: preset.status || "ACTIVE",
      scheduledAt: "",
      subject: preset.subject || "",
      content: preset.content || ""
    });
    setIsCampaignFormOpen(true);
  }

  function openEditCampaign(row) {
    setCurrentCampaign(row);
    setCampaignFormError("");
    setCampaignForm({
      name: row?.name || "",
      type: row?.type || "EMAIL",
      audience: row?.audience || "NEWSLETTER",
      status: row?.status || "ACTIVE",
      scheduledAt: toDateTimeLocalValue(row?.scheduledAt),
      subject: row?.subject || "",
      content: row?.content || ""
    });
    setIsCampaignFormOpen(true);
  }

  function updateCampaignType(type) {
    setCampaignForm((p) => {
      const next = { ...p, type };
      if (type === "SMS") next.audience = "CLIENTS";
      if (type === "SOCIAL") next.audience = "ALL";
      return next;
    });
  }

  async function saveCampaign() {
    const name = (campaignForm.name || "").trim();
    if (!name) {
      setCampaignFormError("Nom obligatoire.");
      return;
    }

    const scheduledAt = normalizeDateTimeForApi(campaignForm.scheduledAt);
    if (campaignForm.status === "SCHEDULED" && !scheduledAt) {
      setCampaignFormError("Date/heure de planification obligatoire.");
      return;
    }

    const content = (campaignForm.content || "").trim();
    if (campaignForm.status === "SCHEDULED" && !content) {
      setCampaignFormError("Contenu obligatoire pour une campagne planifiée.");
      return;
    }

    const payload = {
      name,
      type: campaignForm.type,
      status: campaignForm.status,
      audience:
        campaignForm.type === "EMAIL" ? campaignForm.audience : campaignForm.type === "SMS" ? "CLIENTS" : "ALL",
      subject: campaignForm.type === "EMAIL" ? (campaignForm.subject || "").trim() || null : null,
      content: content || null,
      scheduledAt: campaignForm.status === "SCHEDULED" ? scheduledAt : null,
      openRate: currentCampaign?.openRate ?? null,
      clickRate: currentCampaign?.clickRate ?? null,
      revenue: currentCampaign?.revenue ?? null,
      budgetSpent: currentCampaign?.budgetSpent ?? null
    };

    setCampaignSaving(true);
    setCampaignFormError("");
    try {
      if (currentCampaign?.id) {
        await backofficeApi.updateMarketingCampaign(currentCampaign.id, payload);
      } else {
        await backofficeApi.createMarketingCampaign(payload);
      }
      setIsCampaignFormOpen(false);
      await loadCampaigns();
    } catch (err) {
      setCampaignFormError(err?.message || "Impossible d'enregistrer la campagne.");
    } finally {
      setCampaignSaving(false);
    }
  }

  async function deleteCampaign() {
    if (!currentCampaign?.id) return;
    setCampaignSaving(true);
    setCampaignFormError("");
    try {
      await backofficeApi.deleteMarketingCampaign(currentCampaign.id);
      setIsCampaignDeleteOpen(false);
      setCurrentCampaign(null);
      await loadCampaigns();
    } catch (err) {
      setCampaignFormError(err?.message || "Impossible de supprimer la campagne.");
    } finally {
      setCampaignSaving(false);
    }
  }

  async function sendNow(id) {
    if (!id) return;
    setCampaignError("");
    setSendingId(id);
    try {
      await backofficeApi.sendMarketingCampaign(id);
      await loadCampaigns();
    } catch (err) {
      setCampaignError(err?.message || "Impossible d'envoyer la campagne.");
    } finally {
      setSendingId("");
    }
  }

  async function addSubscriber() {
    const email = (subscriberEmail || "").trim();
    if (!email) return;
    setNewsletterError("");
    setSubscriberSaving(true);
    try {
      await backofficeApi.createNewsletterSubscriber({ email });
      setSubscriberEmail("");
      await loadNewsletter();
    } catch (err) {
      setNewsletterError(err?.message || "Impossible d'ajouter l'abonné.");
    } finally {
      setSubscriberSaving(false);
    }
  }

  async function unsubscribeSubscriber(id) {
    if (!id) return;
    setNewsletterError("");
    setSubscriberSaving(true);
    try {
      await backofficeApi.unsubscribeNewsletterSubscriber(id);
      await loadNewsletter();
    } catch (err) {
      setNewsletterError(err?.message || "Impossible de désabonner.");
    } finally {
      setSubscriberSaving(false);
    }
  }

  async function resubscribeSubscriber(email) {
    const e = (email || "").trim();
    if (!e) return;
    setNewsletterError("");
    setSubscriberSaving(true);
    try {
      await backofficeApi.createNewsletterSubscriber({ email: e });
      await loadNewsletter();
    } catch (err) {
      setNewsletterError(err?.message || "Impossible de réabonner.");
    } finally {
      setSubscriberSaving(false);
    }
  }

  async function deleteSubscriber() {
    if (!currentSubscriber?.id) return;
    setNewsletterError("");
    setSubscriberSaving(true);
    try {
      await backofficeApi.deleteNewsletterSubscriber(currentSubscriber.id);
      setIsSubscriberDeleteOpen(false);
      setCurrentSubscriber(null);
      await loadNewsletter();
    } catch (err) {
      setNewsletterError(err?.message || "Impossible de supprimer l'abonné.");
    } finally {
      setSubscriberSaving(false);
    }
  }

  const rightSlot =
    tab === "campaigns" ? (
      <div className="flex items-center gap-2">
        <Button variant="outline" className="gap-2" onClick={loadCampaigns} disabled={campaignLoading}>
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
        <Button className="gap-2" onClick={() => openCreateCampaign()}>
          <Plus className="h-4 w-4" />
          Nouvelle campagne
        </Button>
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <Button variant="outline" className="gap-2" onClick={loadNewsletter} disabled={newsletterLoading}>
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
        <Button className="gap-2" onClick={() => openCreateCampaign({ type: "EMAIL", audience: "NEWSLETTER", name: "Newsletter" })}>
          <Mail className="h-4 w-4" />
          Nouvelle newsletter
        </Button>
      </div>
    );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Marketing"
        subtitle="Automatisation multi-canaux (Email, SMS, Social) + gestion newsletter."
        rightSlot={rightSlot}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button variant={tab === "campaigns" ? "primary" : "outline"} className="gap-2" onClick={() => setTab("campaigns")}>
          <Send className="h-4 w-4" />
          Campagnes
        </Button>
        <Button variant={tab === "newsletter" ? "primary" : "outline"} className="gap-2" onClick={() => setTab("newsletter")}>
          <Mail className="h-4 w-4" />
          Newsletter
        </Button>
      </div>

      {tab === "campaigns" ? (
        <Card>
          <div className="p-4 space-y-4">
            <SectionHeader title="Campagnes" subtitle="Planifiez / envoyez sur différents canaux" />
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-56 space-y-1">
                <p className="text-xs text-muted-foreground">Filtre statut</p>
                <Select value={campaignStatusFilter} onChange={(e) => setCampaignStatusFilter(e.target.value)}>
                  <option value="">Toutes</option>
                  <option value="ACTIVE">Actives</option>
                  <option value="SCHEDULED">Planifiées</option>
                  <option value="FINISHED">Terminées</option>
                </Select>
              </div>
              <div className="flex-1" />
              {campaignError ? <div className="text-sm text-red-600">{campaignError}</div> : null}
            </div>
          </div>

          <Table>
            <THead>
              <TRow>
                <TCell>Nom</TCell>
                <TCell>Canal</TCell>
                <TCell>Audience</TCell>
                <TCell>Planifiée</TCell>
                <TCell>Statut</TCell>
                <TCell>Progression</TCell>
                <TCell className="text-right">Actions</TCell>
              </TRow>
            </THead>
            <tbody>
              {campaignLoading ? (
                <TRow>
                  <TCell className="text-muted-foreground text-sm">Chargement…</TCell>
                  <TCell />
                  <TCell />
                  <TCell />
                  <TCell />
                  <TCell />
                  <TCell />
                </TRow>
              ) : campaignRows.length === 0 ? (
                <TRow>
                  <TCell className="text-muted-foreground text-sm">Aucune campagne.</TCell>
                  <TCell />
                  <TCell />
                  <TCell />
                  <TCell />
                  <TCell />
                  <TCell />
                </TRow>
              ) : (
                campaignRows.map((c) => (
                  <TRow key={c.id} className={c.lastError ? "bg-rose-50/30 dark:bg-rose-900/10" : undefined}>
                    <TCell className="font-medium">
                      <div className="space-y-1">
                        <div>{c.name}</div>
                        {c.lastError ? <div className="text-xs text-rose-700 dark:text-rose-200 break-words">{c.lastError}</div> : null}
                      </div>
                    </TCell>
                    <TCell>{c.typeLabel}</TCell>
                    <TCell>{c.audienceLabel}</TCell>
                    <TCell>{c.status === "SCHEDULED" ? c.scheduledAtLabel : "-"}</TCell>
                    <TCell>
                      <Badge label={c.statusLabel} />
                    </TCell>
                    <TCell>{c.progress}</TCell>
                    <TCell className="text-right">
                      <div className="inline-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-2"
                          disabled={c.status === "FINISHED" || sendingId === c.id}
                          onClick={() => sendNow(c.id)}
                        >
                          <Send className="h-3.5 w-3.5" />
                          {sendingId === c.id ? "Envoi…" : "Envoyer"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-2" onClick={() => openEditCampaign(c)}>
                          <Edit2 className="h-3.5 w-3.5" />
                          Éditer
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-xs gap-2"
                          onClick={() => {
                            setCurrentCampaign(c);
                            setIsCampaignDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Supprimer
                        </Button>
                      </div>
                    </TCell>
                  </TRow>
                ))
              )}
            </tbody>
          </Table>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="space-y-3">
            <SectionHeader title="Newsletter" subtitle="Statistiques" />
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-lg border bg-muted/20">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{newsletterLoading ? "…" : `${newsletterStats?.total ?? 0}`}</p>
              </div>
              <div className="p-4 rounded-lg border bg-emerald-500/5 border-emerald-500/10">
                <p className="text-xs text-muted-foreground">Abonnés</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-200">
                  {newsletterLoading ? "…" : `${newsletterStats?.subscribed ?? 0}`}
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-slate-500/5 border-slate-500/10">
                <p className="text-xs text-muted-foreground">Désabonnés</p>
                <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">
                  {newsletterLoading ? "…" : `${newsletterStats?.unsubscribed ?? 0}`}
                </p>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <div className="p-4 space-y-4">
              <SectionHeader title="Abonnés" subtitle="Gestion newsletter" />

              <div className="flex flex-wrap items-end gap-3">
                <div className="w-56 space-y-1">
                  <p className="text-xs text-muted-foreground">Statut</p>
                  <Select value={subscriberStatusFilter} onChange={(e) => setSubscriberStatusFilter(e.target.value)}>
                    <option value="">Tous</option>
                    <option value="SUBSCRIBED">Abonnés</option>
                    <option value="UNSUBSCRIBED">Désabonnés</option>
                  </Select>
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-xs text-muted-foreground">Recherche</p>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" value={subscriberQuery} onChange={(e) => setSubscriberQuery(e.target.value)} placeholder="Email…" />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 space-y-1">
                  <p className="text-xs text-muted-foreground">Ajouter</p>
                  <Input value={subscriberEmail} onChange={(e) => setSubscriberEmail(e.target.value)} placeholder="email@exemple.com" />
                </div>
                <Button className="gap-2" onClick={addSubscriber} disabled={subscriberSaving}>
                  <UserPlus className="h-4 w-4" />
                  Ajouter
                </Button>
                {newsletterError ? <div className="text-sm text-red-600">{newsletterError}</div> : null}
              </div>
            </div>

            <Table>
              <THead>
                <TRow>
                  <TCell>Email</TCell>
                  <TCell>Statut</TCell>
                  <TCell>Source</TCell>
                  <TCell>Créé</TCell>
                  <TCell className="text-right">Actions</TCell>
                </TRow>
              </THead>
              <tbody>
                {newsletterLoading ? (
                  <TRow>
                    <TCell className="text-muted-foreground text-sm">Chargement…</TCell>
                    <TCell />
                    <TCell />
                    <TCell />
                    <TCell />
                  </TRow>
                ) : subscriberRows.length === 0 ? (
                  <TRow>
                    <TCell className="text-muted-foreground text-sm">Aucun abonné.</TCell>
                    <TCell />
                    <TCell />
                    <TCell />
                    <TCell />
                  </TRow>
                ) : (
                  subscriberRows.map((s) => (
                    <TRow key={s.id}>
                      <TCell className="font-medium">{s.email}</TCell>
                      <TCell>
                        <Badge label={s.statusLabel} variant={s.status === "SUBSCRIBED" ? "success" : "neutral"} />
                      </TCell>
                      <TCell>{s.source || "-"}</TCell>
                      <TCell>{s.createdAtLabel}</TCell>
                      <TCell className="text-right">
                        <div className="inline-flex gap-2">
                          {s.status === "SUBSCRIBED" ? (
                            <Button size="sm" variant="outline" className="h-7 text-xs" disabled={subscriberSaving} onClick={() => unsubscribeSubscriber(s.id)}>
                              Désabonner
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="h-7 text-xs" disabled={subscriberSaving} onClick={() => resubscribeSubscriber(s.email)}>
                              Réabonner
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 text-xs gap-2"
                            disabled={subscriberSaving}
                            onClick={() => {
                              setCurrentSubscriber(s);
                              setIsSubscriberDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Supprimer
                          </Button>
                        </div>
                      </TCell>
                    </TRow>
                  ))
                )}
              </tbody>
            </Table>
          </Card>
        </div>
      )}

      <Modal
        isOpen={isCampaignFormOpen}
        onClose={() => (campaignSaving ? null : setIsCampaignFormOpen(false))}
        title={currentCampaign?.id ? "Modifier campagne" : "Nouvelle campagne"}
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCampaignFormOpen(false)} disabled={campaignSaving}>
              Annuler
            </Button>
            <Button onClick={saveCampaign} disabled={campaignSaving}>
              {campaignSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <p className="text-sm font-medium">Nom</p>
            <Input value={campaignForm.name} onChange={(e) => setCampaignForm((p) => ({ ...p, name: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Canal</p>
            <Select value={campaignForm.type} onChange={(e) => updateCampaignType(e.target.value)}>
              <option value="EMAIL">Email</option>
              <option value="SMS">SMS</option>
              <option value="SOCIAL">Réseaux sociaux</option>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Audience</p>
            <Select
              value={campaignForm.type === "EMAIL" ? campaignForm.audience : campaignForm.type === "SMS" ? "CLIENTS" : "ALL"}
              disabled={campaignForm.type !== "EMAIL"}
              onChange={(e) => setCampaignForm((p) => ({ ...p, audience: e.target.value }))}
            >
              <option value="NEWSLETTER">Newsletter</option>
              <option value="CLIENTS">Clients</option>
              <option value="ALL">Tous</option>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Statut</p>
            <Select value={campaignForm.status} onChange={(e) => setCampaignForm((p) => ({ ...p, status: e.target.value }))}>
              <option value="ACTIVE">Active (brouillon)</option>
              <option value="SCHEDULED">Planifiée (automation)</option>
              <option value="FINISHED" disabled>
                Terminée
              </option>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Planifier</p>
            <Input
              type="datetime-local"
              value={campaignForm.scheduledAt}
              disabled={campaignForm.status !== "SCHEDULED"}
              onChange={(e) => setCampaignForm((p) => ({ ...p, scheduledAt: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">En statut \"Planifiée\", l'envoi est automatique.</p>
          </div>

          {campaignForm.type === "EMAIL" ? (
            <div className="space-y-2 md:col-span-2">
              <p className="text-sm font-medium">Sujet (Email)</p>
              <Input value={campaignForm.subject} onChange={(e) => setCampaignForm((p) => ({ ...p, subject: e.target.value }))} />
            </div>
          ) : null}

          <div className="space-y-2 md:col-span-2">
            <p className="text-sm font-medium">Contenu</p>
            <textarea
              rows={8}
              value={campaignForm.content}
              onChange={(e) => setCampaignForm((p) => ({ ...p, content: e.target.value }))}
              placeholder={campaignForm.type === "SMS" ? "Message SMS…" : "Message de campagne…"}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
            />
          </div>

          {campaignFormError ? (
            <div className="md:col-span-2 p-3 rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/50 text-sm text-red-700 dark:text-red-200">
              {campaignFormError}
            </div>
          ) : null}
        </div>
      </Modal>

      <Modal
        isOpen={isCampaignDeleteOpen}
        onClose={() => (campaignSaving ? null : setIsCampaignDeleteOpen(false))}
        title="Supprimer campagne"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCampaignDeleteOpen(false)} disabled={campaignSaving}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={deleteCampaign} disabled={campaignSaving}>
              {campaignSaving ? "Suppression..." : "Supprimer"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Confirmer la suppression de <span className="font-semibold text-foreground">{currentCampaign?.name || "cette campagne"}</span> ?
        </p>
        {campaignFormError ? <div className="mt-3 text-sm text-red-600">{campaignFormError}</div> : null}
      </Modal>

      <Modal
        isOpen={isSubscriberDeleteOpen}
        onClose={() => (subscriberSaving ? null : setIsSubscriberDeleteOpen(false))}
        title="Supprimer abonné"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsSubscriberDeleteOpen(false)} disabled={subscriberSaving}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={deleteSubscriber} disabled={subscriberSaving}>
              {subscriberSaving ? "Suppression..." : "Supprimer"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Confirmer la suppression de <span className="font-semibold text-foreground">{currentSubscriber?.email || "cet abonné"}</span> ?
        </p>
      </Modal>
    </div>
  );
}
