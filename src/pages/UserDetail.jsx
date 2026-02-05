import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertCircle, Trash2 } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Label from "../components/ui/Label.jsx";
import Badge from "../components/ui/Badge.jsx";
import Modal from "../components/ui/Modal.jsx";
import { backofficeApi } from "../services/api.js";

const roles = [
  { value: "CLIENT", label: "Client" },
  { value: "PARTENAIRE", label: "Partenaire" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "IT", label: "IT" },
  { value: "SUSPENDU", label: "Suspendu" },
  { value: "SUPPRIME", label: "Supprimé" }
];

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return `${value}`;
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(d);
};

export default function UserDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formData, setFormData] = useState({
    avatarUrl: "",
    prenom: "",
    nom: "",
    email: "",
    emailVerifie: false,
    role: "CLIENT",
    telephone: "",
    ville: "",
    pays: ""
  });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const u = await backofficeApi.user(id);
      setUser(u || null);
      setFormData({
        avatarUrl: u?.avatarUrl || "",
        prenom: u?.prenom || "",
        nom: u?.nom || "",
        email: u?.email || "",
        emailVerifie: !!u?.emailVerifie,
        role: u?.role || "CLIENT",
        telephone: u?.telephone || "",
        ville: u?.ville || "",
        pays: u?.pays || ""
      });
    } catch (e) {
      setError(e?.message || "Impossible de charger l'utilisateur.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  const authProviders = useMemo(() => {
    const auths = Array.isArray(user?.authentifications) ? user.authentifications : [];
    return auths.map((a) => ({
      key: `${a.fournisseur}-${a.identifiantFournisseur}`,
      fournisseur: a.fournisseur,
      identifiant: a.identifiantFournisseur,
      date: a.dateCreation
    }));
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        avatarUrl: formData.avatarUrl || null,
        prenom: formData.prenom || null,
        nom: formData.nom || null,
        email: formData.email,
        emailVerifie: !!formData.emailVerifie,
        role: formData.role,
        telephone: formData.telephone || null,
        ville: formData.ville || null,
        pays: formData.pays || null
      };
      const updated = await backofficeApi.updateUser(id, payload);
      setUser(updated || null);
    } catch (err) {
      setError(err?.message || "Impossible de sauvegarder.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    setError("");
    try {
      await backofficeApi.deleteUser(id);
      setIsDeleteOpen(false);
      navigate("/users");
    } catch (err) {
      setError(err?.message || "Impossible de supprimer.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive border border-destructive/20">
          <p className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        </div>
      )}

      <SectionHeader
        title={loading ? "Utilisateur" : `${formData.prenom || ""} ${formData.nom || ""}`.trim() || "Utilisateur"}
        subtitle={loading ? "" : user?.email || ""}
        rightSlot={
          <div className="flex gap-2">
            <Button variant="outline" type="button" onClick={() => navigate("/users")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <Button variant="destructive" type="button" onClick={() => setIsDeleteOpen(true)} disabled={loading}>
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input id="prenom" value={formData.prenom} onChange={(e) => setFormData((p) => ({ ...p, prenom: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" value={formData.nom} onChange={(e) => setFormData((p) => ({ ...p, nom: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select id="role" value={formData.role} onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))} options={roles} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailVerifie">Email vérifié</Label>
                <Select
                  id="emailVerifie"
                  value={formData.emailVerifie ? "true" : "false"}
                  onChange={(e) => setFormData((p) => ({ ...p, emailVerifie: e.target.value === "true" }))}
                  options={[
                    { value: "false", label: "Non" },
                    { value: "true", label: "Oui" }
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input id="telephone" value={formData.telephone} onChange={(e) => setFormData((p) => ({ ...p, telephone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ville">Ville</Label>
                <Input id="ville" value={formData.ville} onChange={(e) => setFormData((p) => ({ ...p, ville: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pays">Pays</Label>
                <Input id="pays" value={formData.pays} onChange={(e) => setFormData((p) => ({ ...p, pays: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input id="avatarUrl" value={formData.avatarUrl} onChange={(e) => setFormData((p) => ({ ...p, avatarUrl: e.target.value }))} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={load} disabled={loading || saving}>
                Recharger
              </Button>
              <Button type="submit" disabled={loading || saving}>
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="space-y-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Infos</div>
            <div className="mt-2 space-y-1 text-sm">
              <div>
                <span className="text-muted-foreground">ID:</span>{" "}
                <span className="font-mono text-xs">{user?.id || "-"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Créé:</span> {formatDateTime(user?.dateCreation)}
              </div>
              <div>
                <span className="text-muted-foreground">Mis à jour:</span> {formatDateTime(user?.dateMiseAJour)}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Authentification</div>
            <div className="mt-2 space-y-2">
              {authProviders.length === 0 ? (
                <div className="text-sm text-muted-foreground">Aucun provider lié.</div>
              ) : (
                authProviders.map((a) => (
                  <div key={a.key} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between">
                      <Badge label={a.fournisseur} variant="outline" />
                      <div className="text-xs text-muted-foreground">{formatDateTime(a.date)}</div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground break-all">{a.identifiant}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => (saving ? null : setIsDeleteOpen(false))}
        title="Supprimer utilisateur"
        size="sm"
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setIsDeleteOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button variant="destructive" type="button" onClick={remove} disabled={saving}>
              Supprimer
            </Button>
          </>
        }
      >
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="font-semibold text-foreground">Supprimer {user?.email || "cet utilisateur"} ?</div>
          <div>Cette action est irréversible.</div>
        </div>
      </Modal>
    </div>
  );
}

