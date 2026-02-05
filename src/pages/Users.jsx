import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit2, Trash2, AlertCircle } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Modal from "../components/ui/Modal.jsx";
import Label from "../components/ui/Label.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
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

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return `${value}`;
  return new Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "short", day: "2-digit" }).format(date);
};

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

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
      const page = await backofficeApi.users(0, 200, roleFilter, query);
      setUsers(Array.isArray(page?.content) ? page.content : []);
    } catch (e) {
      setError(e?.message || "Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      load();
    }, 350);
    return () => clearTimeout(t);
  }, [query, roleFilter]);

  const rows = useMemo(() => {
    return (users || []).map((u) => {
      const name = `${u?.prenom || ""} ${u?.nom || ""}`.trim() || "-";
      const auths = Array.isArray(u?.authentifications) ? u.authentifications : [];
      const providers = [...new Set(auths.map((a) => a?.fournisseur).filter(Boolean))].join(", ") || "-";
      return {
        ...u,
        displayName: name,
        providers
      };
    });
  }, [users]);

  const openCreate = () => {
    setCurrentUser(null);
    setFormData({
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
    setIsFormOpen(true);
  };

  const openEdit = (u) => {
    navigate(`/users/${u.id}`);
  };

  const openDelete = (u) => {
    setCurrentUser(u);
    setIsDeleteOpen(true);
  };

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

      const created = await backofficeApi.createUser(payload);
      setIsFormOpen(false);
      await load();
      if (created?.id) {
        navigate(`/users/${created.id}`);
      }
    } catch (err) {
      setError(err?.message || "Impossible d'enregistrer l'utilisateur.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!currentUser?.id) return;
    setSaving(true);
    setError("");
    try {
      await backofficeApi.deleteUser(currentUser.id);
      setIsDeleteOpen(false);
      setCurrentUser(null);
      await load();
    } catch (err) {
      setError(err?.message || "Impossible de supprimer l'utilisateur.");
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
        title="Utilisateurs"
        subtitle="Gestion de tous les comptes (sans mots de passe)."
        rightSlot={
          <Button onClick={openCreate} type="button">
            <Plus className="mr-2 h-4 w-4" />
            Nouvel utilisateur
          </Button>
        }
      />

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b bg-muted/30 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher (nom, prénom, email)..."
              className="pl-9 bg-background"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-56">
            <Select
              className="bg-background"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[{ value: "", label: "Tous rôles" }, ...roles]}
            />
          </div>
        </div>

        <Table>
          <THead>
            <TRow>
              <TCell>Utilisateur</TCell>
              <TCell>Rôle</TCell>
              <TCell>Vérifié</TCell>
              <TCell>Auth</TCell>
              <TCell>Ville</TCell>
              <TCell>Créé</TCell>
              <TCell className="text-right">Actions</TCell>
            </TRow>
          </THead>
          <tbody>
            {loading ? (
              <TRow>
                <TCell className="text-muted-foreground">Chargement…</TCell>
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
              </TRow>
            ) : rows.length === 0 ? (
              <TRow>
                <TCell className="text-muted-foreground">Aucun utilisateur.</TCell>
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
              </TRow>
            ) : (
              rows.map((u) => (
                <TRow key={u.id} className="group hover:bg-muted/50 transition-colors">
                  <TCell>
                    <div>
                      <div className="font-semibold text-foreground">{u.displayName}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                      <div className="text-xs text-muted-foreground font-mono">{u.id}</div>
                    </div>
                  </TCell>
                  <TCell>
                    <Badge label={u.role || "-"} variant="outline" />
                  </TCell>
                  <TCell>
                    <Badge label={u.emailVerifie ? "Oui" : "Non"} variant={u.emailVerifie ? "success" : "warning"} />
                  </TCell>
                  <TCell>{u.providers}</TCell>
                  <TCell>{[u.ville, u.pays].filter(Boolean).join(", ") || "-"}</TCell>
                  <TCell>{formatDate(u.dateCreation)}</TCell>
                  <TCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" type="button" onClick={() => openEdit(u)}>
                        <Edit2 className="h-4 w-4 text-slate-500 hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="sm" type="button" onClick={() => openDelete(u)}>
                        <Trash2 className="h-4 w-4 text-slate-500 hover:text-destructive" />
                      </Button>
                    </div>
                  </TCell>
                </TRow>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      <Modal
        isOpen={isFormOpen}
        onClose={() => (saving ? null : setIsFormOpen(false))}
        title="Créer utilisateur"
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button type="button" onClick={submit} disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
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
              <Label htmlFor="prenom">Prénom</Label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) => setFormData((p) => ({ ...p, prenom: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData((p) => ({ ...p, nom: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                options={roles}
              />
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
              <Input
                id="telephone"
                value={formData.telephone}
                onChange={(e) => setFormData((p) => ({ ...p, telephone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ville">Ville</Label>
              <Input
                id="ville"
                value={formData.ville}
                onChange={(e) => setFormData((p) => ({ ...p, ville: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pays">Pays</Label>
              <Input
                id="pays"
                value={formData.pays}
                onChange={(e) => setFormData((p) => ({ ...p, pays: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                value={formData.avatarUrl}
                onChange={(e) => setFormData((p) => ({ ...p, avatarUrl: e.target.value }))}
              />
            </div>
          </div>
        </form>
      </Modal>

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
          <div className="font-semibold text-foreground">
            Supprimer {currentUser?.email || "cet utilisateur"} ?
          </div>
          <div>Cette action est irréversible.</div>
        </div>
      </Modal>
    </div>
  );
}
