import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, Upload, X } from "lucide-react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import CategoryImageUpload from "./CategoryImageUpload.jsx";

function splitRow(line) {
  const text = `${line ?? ""}`;
  const sep = text.includes(";") ? ";" : text.includes("\t") ? "\t" : ",";
  return text.split(sep).map((v) => `${v}`.trim());
}

function buildTemplate(parentOptions) {
  const firstParentSlug = Array.isArray(parentOptions) && parentOptions.length > 0 ? parentOptions[0].slug : "";
  return `businessId;nom;slug;niveau;parentId;ordre;estActive;imageUrl
CAT-A;Catégorie A;categorie-a;PRINCIPALE;;0;true;
CAT-A-1;Sous Catégorie A;sous-categorie-a;SOUS_CATEGORIE;${firstParentSlug};0;true;`;
}

function toPayload(row) {
  const isParentCategory = row.niveau === "PRINCIPALE" && !`${row.parentId || ""}`.trim();
  return {
    businessId: row.businessId?.trim() ? row.businessId.trim() : null,
    nom: row.nom,
    slug: row.slug?.trim() ? row.slug.trim() : null,
    imageUrl: isParentCategory && row.imageUrl?.trim() ? row.imageUrl.trim() : null,
    niveau: row.niveau,
    parentId: row.parentId?.trim() ? row.parentId.trim() : null,
    ordre: Number.isFinite(Number(row.ordre)) ? Number(row.ordre) : 0,
    estActive: row.estActive === "false" ? false : Boolean(row.estActive),
  };
}

export default function BulkCategoryImportModal({ isOpen, onClose, categories, onSubmit, isSubmitting, result }) {
  const fileRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [importText, setImportText] = useState("");

  const parentCatalog = useMemo(() => {
    const fromApi = (categories || [])
      .slice()
      .map((c) => ({
        slug: `${c.slug || ""}`.trim(),
        nom: c.nom || "",
        niveau: c.niveau || "",
      }))
      .filter((c) => c.slug);

    const fromRows = (rows || [])
      .map((r) => ({
        slug: `${r.slug || ""}`.trim(),
        nom: r.nom || "",
        niveau: r.niveau || "",
      }))
      .filter((c) => c.slug);

    const map = new Map();
    for (const item of [...fromApi, ...fromRows]) {
      if (!map.has(item.slug)) map.set(item.slug, item);
    }
    return Array.from(map.values()).sort((a, b) => `${a.nom || ""}`.localeCompare(`${b.nom || ""}`, "fr"));
  }, [categories, rows]);

  const parentBySlug = useMemo(() => {
    const map = new Map();
    for (const item of parentCatalog) {
      map.set(item.slug, item);
    }
    return map;
  }, [parentCatalog]);

  const buildParentSelectOptionsForRow = (row) => {
    const base = [{ value: "", label: "—" }];
    if (!row?.niveau || row.niveau === "PRINCIPALE") return base;
    const neededParentNiveau = row.niveau === "SOUS_CATEGORIE" ? "PRINCIPALE" : "SOUS_CATEGORIE";
    const candidates = parentCatalog.filter((c) => c.niveau === neededParentNiveau);
    for (const c of candidates) {
      base.push({ value: c.slug, label: c.nom || c.slug });
    }
    return base;
  };

  const init = () => {
    setError("");
    setImportText(buildTemplate(parentCatalog));
    setRows([
      { businessId: "", nom: "", slug: "", niveau: "PRINCIPALE", parentId: "", ordre: "0", estActive: "true", imageUrl: "" },
    ]);
  };

  useEffect(() => {
    if (isOpen) init();
  }, [isOpen]);

  const validate = (row) => {
    const errs = {};
    if (!`${row.nom || ""}`.trim()) errs.nom = "Nom requis";
    if (!`${row.niveau || ""}`.trim()) errs.niveau = "Niveau requis";
    const hasParent = `${row.parentId || ""}`.trim() !== "";
    const hasImage = `${row.imageUrl || ""}`.trim() !== "";

    if (row.niveau === "PRINCIPALE") {
      if (hasParent) errs.parentId = "Une catégorie parent ne peut pas avoir de parent";
    } else {
      if (!hasParent) errs.parentId = "Parent requis pour ce niveau";
      const parent = hasParent ? parentBySlug.get(`${row.parentId}`.trim()) : null;
      if (!parent && hasParent) {
        errs.parentId = "Parent introuvable (utilise le slug et mets le parent avant)";
      }
      if (parent && row.niveau === "SOUS_CATEGORIE" && parent.niveau !== "PRINCIPALE") {
        errs.parentId = "Le parent doit être une catégorie PRINCIPALE";
      }
      if (parent && row.niveau === "SOUS_SOUS_CATEGORIE" && parent.niveau !== "SOUS_CATEGORIE") {
        errs.parentId = "Le parent doit être une SOUS_CATEGORIE";
      }
    }

    if ((hasParent || row.niveau !== "PRINCIPALE") && hasImage) {
      errs.imageUrl = "Image autorisée uniquement pour les catégories parent";
    }
    const ordre = `${row.ordre ?? ""}`.trim() === "" ? 0 : Number(`${row.ordre}`.replace(",", "."));
    if (!Number.isFinite(ordre) || ordre < 0) errs.ordre = "Ordre invalide";
    return errs;
  };

  const validatedRows = useMemo(() => rows.map((r) => ({ ...r, _errors: validate(r) })), [rows]);

  const stats = useMemo(() => {
    const total = validatedRows.length;
    const invalid = validatedRows.filter((r) => Object.keys(r._errors || {}).length > 0).length;
    return { total, invalid, valid: total - invalid };
  }, [validatedRows]);

  const setRowField = (index, key, value) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { businessId: "", nom: "", slug: "", niveau: "PRINCIPALE", parentId: "", ordre: "0", estActive: "true", imageUrl: "" },
    ]);
  };

  const removeRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const parseTextToRows = (raw) => {
    const text = `${raw || ""}`.trim();
    if (!text) return { nextRows: [], parseError: "Colle au moins une ligne." };
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return { nextRows: [], parseError: "Colle au moins une ligne." };

    const headerCells = splitRow(lines[0]).map((h) => h.toLowerCase());
    const hasHeader = headerCells.includes("nom") || headerCells.includes("niveau");
    const colIndex = (key, fallbackIdx) => {
      const idx = headerCells.indexOf(key);
      if (idx >= 0) return idx;
      return hasHeader ? -1 : fallbackIdx;
    };

    const idxBusinessId = colIndex("businessid", -1);
    const idxNom = colIndex("nom", 0);
    const idxSlug = colIndex("slug", 1);
    const idxNiveau = colIndex("niveau", 2);
    const idxParentId = colIndex("parentid", 3);
    const idxOrdre = colIndex("ordre", 4);
    const idxActive = colIndex("estactive", 5);
    const idxImage = colIndex("imageurl", 6);
    const start = hasHeader ? 1 : 0;

    const nextRows = [];
    for (let i = start; i < lines.length; i++) {
      const cells = splitRow(lines[i]);
      nextRows.push({
        businessId: idxBusinessId >= 0 ? cells[idxBusinessId] : "",
        nom: idxNom >= 0 ? cells[idxNom] : "",
        slug: idxSlug >= 0 ? cells[idxSlug] : "",
        niveau: idxNiveau >= 0 ? cells[idxNiveau] : "PRINCIPALE",
        parentId: idxParentId >= 0 ? cells[idxParentId] : "",
        ordre: idxOrdre >= 0 ? cells[idxOrdre] : "0",
        estActive: idxActive >= 0 ? `${cells[idxActive]}`.toLowerCase() : "true",
        imageUrl: idxImage >= 0 ? cells[idxImage] : "",
      });
    }
    if (nextRows.length === 0) return { nextRows: [], parseError: "Aucune ligne trouvée." };
    return { nextRows, parseError: "" };
  };

  const importFromText = () => {
    const { nextRows, parseError } = parseTextToRows(importText);
    if (parseError) {
      setError(parseError);
      return;
    }
    setError("");
    setRows(nextRows);
  };

  const importFromFile = async (file) => {
    const text = await file.text();
    setImportText(text);
    const { nextRows, parseError } = parseTextToRows(text);
    if (parseError) {
      setError(parseError);
      return;
    }
    setError("");
    setRows(nextRows);
  };

  const canSubmit = stats.total > 0 && stats.invalid === 0 && !isSubmitting;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit(validatedRows.map((r) => toPayload(r)));
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => (isSubmitting ? null : onClose())}
        title="Ajout en masse (catégories)"
        size="full"
        footer={
          <>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Fermer
            </Button>
            <Button onClick={submit} disabled={!canSubmit}>
              {isSubmitting ? "Import..." : `Importer (${stats.valid}/${stats.total})`}
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">Importer</div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const text = buildTemplate(parentCatalog);
                      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "categories-template.csv";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Télécharger modèle
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Fichier CSV
                  </Button>
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) importFromFile(file);
                  if (e.target) e.target.value = "";
                }}
                disabled={isSubmitting}
              />
              <textarea
                className="w-full min-h-40 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                spellCheck={false}
              />
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={importFromText} disabled={isSubmitting}>
                  Appliquer dans le tableau
                </Button>
              </div>
              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50/50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Résultats</div>
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Total lignes</span>
                  <span className="font-semibold">{stats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Lignes valides</span>
                  <span className="font-semibold text-emerald-700">{stats.valid}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Lignes invalides</span>
                  <span className="font-semibold text-red-700">{stats.invalid}</span>
                </div>
              </div>
              {result ? (
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-semibold">{result.created}</span> / {result.total} catégories créées
                  </div>
                  <div className="max-h-48 overflow-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <td className="p-2">Ligne</td>
                          <td className="p-2">Nom</td>
                          <td className="p-2">Résultat</td>
                        </tr>
                      </thead>
                      <tbody>
                        {(result.results || []).map((r) => (
                          <tr key={`${r.index}-${r.name}`} className="border-t border-border">
                            <td className="p-2 font-mono text-xs">{r.index + 1}</td>
                            <td className="p-2">{r.name || "-"}</td>
                            <td className="p-2">
                              {r.success ? (
                                <span className="text-emerald-700">OK</span>
                              ) : (
                                <span className="text-red-700">{r.errorMessage || "Erreur"}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-medium">Tableau</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={init} disabled={isSubmitting}>
                Réinitialiser
              </Button>
              <Button size="sm" onClick={addRow} disabled={isSubmitting}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une ligne
              </Button>
            </div>
          </div>

          <div className="overflow-auto rounded-lg border border-border">
            <table className="min-w-[1200px] w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <td className="p-2">ID métier</td>
                  <td className="p-2">Nom</td>
                  <td className="p-2">Slug</td>
                  <td className="p-2">Niveau</td>
                  <td className="p-2">Parent</td>
                  <td className="p-2">Ordre</td>
                  <td className="p-2">Actif</td>
                  <td className="p-2">Image</td>
                  <td className="p-2 text-right">Action</td>
                </tr>
              </thead>
              <tbody>
                {validatedRows.map((row, idx) => {
                  const errs = row._errors || {};
                  return (
                    <tr key={`bulk-cat-${idx}`} className="border-t border-border align-top">
                      <td className="p-2">
                        <Input
                          value={row.businessId}
                          onChange={(e) => setRowField(idx, "businessId", e.target.value)}
                          placeholder="CAT-XXX"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={row.nom}
                          onChange={(e) => setRowField(idx, "nom", e.target.value)}
                          className={errs.nom ? "border-destructive" : ""}
                          placeholder="Nom catégorie"
                        />
                        {errs.nom ? <div className="mt-1 text-xs text-destructive">{errs.nom}</div> : null}
                      </td>
                      <td className="p-2">
                        <Input value={row.slug} onChange={(e) => setRowField(idx, "slug", e.target.value)} />
                      </td>
                      <td className="p-2">
                        <Select
                          value={row.niveau}
                          onChange={(e) => {
                            const niveau = e.target.value;
                            setRows((prev) => {
                              const next = [...prev];
                              const current = next[idx];
                              next[idx] = {
                                ...current,
                                niveau,
                                parentId: niveau === "PRINCIPALE" ? "" : current.parentId,
                                imageUrl: niveau === "PRINCIPALE" ? current.imageUrl : "",
                              };
                              return next;
                            });
                          }}
                          options={[
                            { value: "PRINCIPALE", label: "Principale" },
                            { value: "SOUS_CATEGORIE", label: "Sous-catégorie" },
                            { value: "SOUS_SOUS_CATEGORIE", label: "Sous-sous-catégorie" },
                          ]}
                          className={errs.niveau ? "border-destructive" : ""}
                        />
                        {errs.niveau ? <div className="mt-1 text-xs text-destructive">{errs.niveau}</div> : null}
                      </td>
                      <td className="p-2">
                        <Select
                          value={row.parentId}
                          onChange={(e) => {
                            const parentId = e.target.value;
                            setRows((prev) => {
                              const next = [...prev];
                              const current = next[idx];
                              next[idx] = {
                                ...current,
                                parentId,
                                niveau: parentId && current.niveau === "PRINCIPALE" ? "SOUS_CATEGORIE" : current.niveau,
                                imageUrl: parentId ? "" : current.imageUrl,
                              };
                              return next;
                            });
                          }}
                          options={buildParentSelectOptionsForRow(row)}
                          className={errs.parentId ? "border-destructive" : ""}
                          disabled={row.niveau === "PRINCIPALE"}
                        />
                        {errs.parentId ? <div className="mt-1 text-xs text-destructive">{errs.parentId}</div> : null}
                      </td>
                      <td className="p-2">
                        <Input
                          value={row.ordre}
                          onChange={(e) => setRowField(idx, "ordre", e.target.value)}
                          className={errs.ordre ? "border-destructive" : ""}
                        />
                        {errs.ordre ? <div className="mt-1 text-xs text-destructive">{errs.ordre}</div> : null}
                      </td>
                      <td className="p-2">
                        <Select
                          value={row.estActive}
                          onChange={(e) => setRowField(idx, "estActive", e.target.value)}
                          options={[
                            { value: "true", label: "Oui" },
                            { value: "false", label: "Non" },
                          ]}
                        />
                      </td>
                      <td className="p-2">
                        {row.niveau === "PRINCIPALE" && !`${row.parentId || ""}`.trim() ? (
                          <CategoryImageUpload
                            value={row.imageUrl}
                            onChange={(url) => setRowField(idx, "imageUrl", url)}
                            disabled={isSubmitting}
                          />
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">—</span>
                            {row.imageUrl ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRowField(idx, "imageUrl", "")}
                                disabled={isSubmitting}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            ) : null}
                          </div>
                        )}
                        {errs.imageUrl ? <div className="mt-1 text-xs text-destructive">{errs.imageUrl}</div> : null}
                      </td>
                      <td className="p-2 text-right">
                        <Button variant="ghost" size="sm" onClick={() => removeRow(idx)} disabled={isSubmitting || validatedRows.length <= 1}>
                          <Trash2 className="h-4 w-4 text-slate-500 hover:text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </>
  );
}
