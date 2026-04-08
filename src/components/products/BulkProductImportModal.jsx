import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, Upload, X } from "lucide-react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Label from "../ui/Label.jsx";
import { backofficeApi } from "../../services/api.js";

const MAX_SECONDARY_IMAGES = 5;

function normalizeNumber(value) {
  const raw = `${value ?? ""}`.trim();
  if (!raw) return NaN;
  let s = raw.replace(/\s+/g, "");
  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");
  if (lastDot >= 0 && lastComma >= 0) {
    const decimalSep = lastDot > lastComma ? "." : ",";
    const thousandSep = decimalSep === "." ? "," : ".";
    s = s.split(thousandSep).join("");
    if (decimalSep === ",") s = s.replace(",", ".");
  } else if (lastComma >= 0) {
    const parts = s.split(",");
    if (parts.length === 2) {
      const frac = parts[1] ?? "";
      if (frac.length <= 2) s = `${parts[0].replace(/[.]/g, "")}.${frac}`;
      else s = parts.join("");
    } else {
      s = parts.join("");
    }
  } else if (lastDot >= 0) {
    const parts = s.split(".");
    if (parts.length === 2) {
      const frac = parts[1] ?? "";
      if (frac.length <= 2) s = `${parts[0].replace(/[,]/g, "")}.${frac}`;
      else s = parts.join("");
    } else {
      s = parts.join("");
    }
  }
  return Number(s);
}

function normalizeBoolean(value) {
  const raw = `${value ?? ""}`.trim().toLowerCase();
  if (!raw) return false;
  if (raw === "1" || raw === "true" || raw === "yes" || raw === "y" || raw === "oui" || raw === "vrai") return true;
  if (raw === "0" || raw === "false" || raw === "no" || raw === "n" || raw === "non" || raw === "faux") return false;
  return false;
}

function detectDelimiter(line) {
  const text = `${line ?? ""}`;
  const semi = (text.match(/;/g) || []).length;
  const tab = (text.match(/\t/g) || []).length;
  const comma = (text.match(/,/g) || []).length;
  if (semi >= tab && semi >= comma) return ";";
  if (tab >= semi && tab >= comma) return "\t";
  return ",";
}

function detectDelimiterFromRecordText(recordText) {
  const text = `${recordText ?? ""}`;
  let inQuotes = false;
  let semi = 0;
  let tab = 0;
  let comma = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (inQuotes) continue;
    if (ch === ";") semi++;
    else if (ch === "\t") tab++;
    else if (ch === ",") comma++;
  }
  if (semi >= tab && semi >= comma) return ";";
  if (tab >= semi && tab >= comma) return "\t";
  return ",";
}

function parseDelimitedRecords(raw) {
  const text = `${raw ?? ""}`;
  if (!text.trim()) return { sep: ";", records: [] };

  let firstRecordText = "";
  {
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '"') {
        if (inQuotes && text[i + 1] === '"') {
          firstRecordText += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }
      if (!inQuotes && (ch === "\n" || ch === "\r")) break;
      firstRecordText += ch;
    }
  }

  const sep = detectDelimiterFromRecordText(firstRecordText);

  const records = [];
  let row = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && ch === sep) {
      row.push(current.trim());
      current = "";
      continue;
    }

    if (!inQuotes && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(current.trim());
      current = "";
      if (row.some((v) => `${v}`.trim() !== "")) {
        records.push(row);
      }
      row = [];
      continue;
    }

    current += ch;
  }

  row.push(current.trim());
  if (row.some((v) => `${v}`.trim() !== "")) {
    records.push(row);
  }

  return { sep, records };
}

function buildTemplate(categories) {
  const firstCategory = Array.isArray(categories) && categories.length > 0
    ? (categories[0].slug || categories[0].id)
    : "categorie-exemple";
  return `referenceProduitPartenaire;name;description;categorySlug;price;stock;brand;mainImageUrl;secondaryImageUrls;isFeatured;isBestSeller
REF-001;Produit A;Description A;${firstCategory};15000;10;Marque A;https://cdn.exemple.com/prod-a-main.jpg;https://cdn.exemple.com/prod-a-1.jpg|https://cdn.exemple.com/prod-a-2.jpg;1;0
REF-002;Produit B;;${firstCategory};25000;5;Marque B;https://cdn.exemple.com/prod-b-main.jpg;;0;1`;
}

function parseSecondaryImageUrls(raw) {
  const text = `${raw ?? ""}`.trim();
  if (!text) return [];
  return text
    .split(/[|,;]/)
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function toBulkPayload(row) {
  const price = normalizeNumber(row.price);
  const vatRaw = `${row.vat ?? ""}`.trim();
  const vat = vatRaw === "" ? undefined : normalizeNumber(vatRaw);
  const mainImageUrl = `${row.mainImageUrl || ""}`.trim();
  const secondaryImageUrls = parseSecondaryImageUrls(row.secondaryImageUrls);
  return {
    referenceProduitPartenaire: row.referenceProduitPartenaire,
    ean: `${row.ean || ""}`.trim() || undefined,
    description: `${row.description || ""}`.trim() || undefined,
    name: row.name,
    price: Number.isFinite(price) ? price : undefined,
    vat: Number.isFinite(vat) ? vat : undefined,
    status: `${row.status || ""}`.trim().toUpperCase() || undefined,
    categorySlug: row.categoryId || undefined,
    category: row.categoryId || undefined,
    stock: Number.isFinite(Number(row.stock)) ? Math.trunc(Number(row.stock)) : 0,
    brand: row.brand || undefined,
    mainImageUrl: mainImageUrl || undefined,
    secondaryImageUrls: secondaryImageUrls.length ? secondaryImageUrls : undefined,
    isFeatured: Boolean(row.isFeatured),
    isBestSeller: Boolean(row.isBestSeller),
  };
}

export default function BulkProductImportModal({
  isOpen,
  onClose,
  categories,
  onSubmit,
  isSubmitting,
  result,
}) {
  const fileRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [importText, setImportText] = useState("");
  const [imageRowIndex, setImageRowIndex] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const bulkMainImageInputRef = useRef(null);
  const bulkSecondaryImagesInputRef = useRef(null);

  const categoryOptions = useMemo(() => {
    const opts = [{ value: "", label: "—" }];
    for (const c of categories || []) {
      opts.push({
        value: c.slug || c.id,
        label: c.nom
      });
    }
    return opts;
  }, [categories]);

  const init = () => {
    setError("");
    setImportText(buildTemplate(categories));
    setRows([
      {
        referenceProduitPartenaire: "",
        ean: "",
        name: "",
        description: "",
        price: "",
        vat: "",
        status: "ACTIVE",
        categoryId: "",
        stock: "0",
        brand: "",
        mainImageUrl: "",
        secondaryImageUrls: "",
        isFeatured: false,
        isBestSeller: false,
      },
    ]);
    setImageRowIndex(null);
  };

  useEffect(() => {
    if (isOpen) {
      init();
    }
  }, [isOpen]);

  const validate = (row) => {
    const errs = {};
    if (!`${row.referenceProduitPartenaire || ""}`.trim()) errs.referenceProduitPartenaire = "Référence requise";
    if (!`${row.name || ""}`.trim()) errs.name = "Nom requis";
    if (!`${row.categoryId || ""}`.trim()) errs.categoryId = "Catégorie requise";
    const price = normalizeNumber(row.price);
    if (!Number.isFinite(price)) errs.price = "Prix invalide";
    const stock = `${row.stock ?? ""}`.trim() === "" ? 0 : normalizeNumber(row.stock);
    if (!Number.isFinite(stock) || stock < 0) errs.stock = "Stock invalide";
    const vatRaw = `${row.vat ?? ""}`.trim();
    if (vatRaw !== "") {
      const vat = normalizeNumber(vatRaw);
      if (!Number.isFinite(vat) || vat < 0) errs.vat = "TVA invalide";
    }
    const statusRaw = `${row.status || ""}`.trim();
    if (statusRaw && !["ACTIVE", "DRAFT", "ARCHIVED"].includes(statusRaw.toUpperCase())) {
      errs.status = "Statut invalide";
    }
    if (parseSecondaryImageUrls(row.secondaryImageUrls).length > MAX_SECONDARY_IMAGES) {
      errs.secondaryImageUrls = `Maximum ${MAX_SECONDARY_IMAGES} images secondaires`;
    }
    return errs;
  };

  const validatedRows = useMemo(() => {
    return rows.map((r) => ({ ...r, _errors: validate(r) }));
  }, [rows]);

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
      {
        referenceProduitPartenaire: "",
        ean: "",
        name: "",
        description: "",
        price: "",
        vat: "",
        status: "ACTIVE",
        categoryId: "",
        stock: "0",
        brand: "",
        mainImageUrl: "",
        secondaryImageUrls: "",
        isFeatured: false,
        isBestSeller: false,
      },
    ]);
  };

  const removeRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const parseTextToRows = (raw) => {
    const text = `${raw || ""}`.trim();
    if (!text) return { nextRows: [], parseError: "Colle au moins une ligne." };

    const { records } = parseDelimitedRecords(text);
    if (!records.length) return { nextRows: [], parseError: "Colle au moins une ligne." };

    const headerCells = (records[0] || []).map((h) => `${h}`.toLowerCase());
    const hasHeader =
      headerCells.includes("name") ||
      headerCells.includes("referenceproduitpartenaire") ||
      headerCells.includes("price") ||
      headerCells.includes("category");

    const colIndexAny = (keys, fallbackIdx) => {
      for (const key of keys) {
        const idx = headerCells.indexOf(key);
        if (idx >= 0) return idx;
      }
      return hasHeader ? -1 : fallbackIdx;
    };

    const idxRef = colIndexAny(["referenceproduitpartenaire"], 0);
    const idxEan = colIndexAny(["ean"], -1);
    const idxName = colIndexAny(["name"], 1);
    const idxDescription = colIndexAny(["description", "desc"], 2);
    const idxPrice = colIndexAny(["price"], 4);
    const idxVat = colIndexAny(["vat", "tva"], -1);
    const idxStatus = colIndexAny(["status", "statut"], -1);
    const idxCategory = colIndexAny(["categoryslug", "category"], 3);
    const idxCategories = colIndexAny(["categories", "categoryids", "category_ids"], -1);
    const idxStock = colIndexAny(["stock"], 5);
    const idxBrand = colIndexAny(["brand", "marque"], 6);
    const idxMainImage = colIndexAny(["mainimageurl", "main_image_url", "mainimage", "img", "image", "imageurl", "image_url"], 7);
    const idxSecondaryImages = colIndexAny(["secondaryimageurls", "secondary_image_urls", "secondaryimages", "images"], 8);
    const idxFeatured = colIndexAny(["isfeatured", "featured", "mis_en_avant", "misenavant"], 9);
    const idxBestSeller = colIndexAny(["isbestseller", "bestseller", "best_seller", "meilleur_vente", "meilleurvente"], 10);
    const start = hasHeader ? 1 : 0;
    if (hasHeader) {
      const missing = [];
      if (idxRef < 0) missing.push("referenceProduitPartenaire");
      if (idxName < 0) missing.push("name");
      if (idxPrice < 0) missing.push("price");
      if (missing.length) {
        return { nextRows: [], parseError: `Colonnes manquantes: ${missing.join(", ")}.` };
      }
    }

    const normalizeCategory = (value) => {
      const v = `${value || ""}`.trim();
      if (!v) return "";
      const byId = (categories || []).find((c) => `${c.id}` === v);
      if (byId) return byId.slug || byId.id;
      const low = v.toLowerCase();
      const bySlug = (categories || []).find((c) => `${c.slug || ""}`.toLowerCase() === low);
      if (bySlug) return bySlug.slug || bySlug.id;
      const byName = (categories || []).find((c) => `${c.nom || ""}`.toLowerCase() === low);
      if (byName) return byName.slug || byName.id;
      return v;
    };

    const nextRows = [];
    for (let i = start; i < records.length; i++) {
      const cells = records[i] || [];
      const ref = idxRef >= 0 ? cells[idxRef] : "";
      const ean = idxEan >= 0 ? cells[idxEan] : "";
      const name = idxName >= 0 ? cells[idxName] : "";
      const description = idxDescription >= 0 ? cells[idxDescription] : "";
      const priceRaw = idxPrice >= 0 ? cells[idxPrice] : "";
      const vatRaw = idxVat >= 0 ? cells[idxVat] : "";
      const statusRaw = idxStatus >= 0 ? cells[idxStatus] : "";
      const catRaw = idxCategory >= 0 ? cells[idxCategory] : "";
      const categoriesRaw = idxCategories >= 0 ? cells[idxCategories] : "";
      const stockRaw = idxStock >= 0 ? cells[idxStock] : "";
      const brand = idxBrand >= 0 ? cells[idxBrand] : "";
      const mainImageUrl = idxMainImage >= 0 ? cells[idxMainImage] : "";
      const secondaryImageUrls = idxSecondaryImages >= 0 ? cells[idxSecondaryImages] : "";
      const featuredRaw = idxFeatured >= 0 ? cells[idxFeatured] : "";
      const bestSellerRaw = idxBestSeller >= 0 ? cells[idxBestSeller] : "";

      const categoryKey = `${catRaw || ""}`.trim()
        ? catRaw
        : `${categoriesRaw || ""}`.split(/[|,;]/)[0] || "";

      nextRows.push({
        referenceProduitPartenaire: ref,
        ean,
        name,
        description,
        price: priceRaw,
        vat: vatRaw,
        status: statusRaw || "ACTIVE",
        categoryId: normalizeCategory(categoryKey),
        stock: stockRaw === "" ? "0" : stockRaw,
        brand,
        mainImageUrl,
        secondaryImageUrls,
        isFeatured: normalizeBoolean(featuredRaw),
        isBestSeller: normalizeBoolean(bestSellerRaw),
      });
    }
    if (nextRows.length === 0) return { nextRows: [], parseError: "Aucune ligne produit trouvée." };
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
    const payload = validatedRows.map((r) => toBulkPayload(r));
    onSubmit(payload);
  };

  const uploadMainImageForRow = async (file) => {
    if (!file || typeof imageRowIndex !== "number" || uploadingImage) return;
    setUploadingImage(true);
    setError("");
    try {
      let res;
      try {
        res = await backofficeApi.uploadMedia(file, "products");
      } catch (err) {
        const message = err?.message || "";
        if (!message.toLowerCase().includes("existe déjà") || !window.confirm(`${message}\n\nVoulez-vous écraser cette image ?`)) {
          throw err;
        }
        res = await backofficeApi.uploadMedia(file, "products", { overwrite: true });
      }
      const url = `${res?.url || ""}`.trim();
      if (!url) throw new Error("Upload terminé, mais URL manquante.");
      setRowField(imageRowIndex, "mainImageUrl", url);
    } catch (err) {
      setError(err?.message || "Upload de l'image impossible.");
    } finally {
      setUploadingImage(false);
    }
  };

  const uploadSecondaryImagesForRow = async (files) => {
    if (typeof imageRowIndex !== "number" || uploadingImage) return;
    const selected = Array.from(files || []).filter(Boolean);
    if (!selected.length) return;
    setUploadingImage(true);
    setError("");
    try {
      let res = await backofficeApi.uploadMediaBulk(selected, "products");
      const duplicateCount = (Array.isArray(res?.files) ? res.files : [])
        .filter((item) => `${item?.errorMessage || ""}`.toLowerCase().includes("existe déjà")).length;
      if (duplicateCount > 0 && window.confirm(`${duplicateCount} image(s) portent déjà le même nom. Voulez-vous les écraser ?`)) {
        res = await backofficeApi.uploadMediaBulk(selected, "products", { overwrite: true });
      }
      const urls = (Array.isArray(res?.files) ? res.files : [])
        .filter((item) => item?.success && item?.file?.url)
        .map((item) => item.file.url);
      if (!urls.length) throw new Error("Aucune image n'a été uploadée.");
      const current = parseSecondaryImageUrls(rows[imageRowIndex]?.secondaryImageUrls);
      setRowField(imageRowIndex, "secondaryImageUrls", [...current, ...urls].join("|"));
    } catch (err) {
      setError(err?.message || "Upload des images impossible.");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => (isSubmitting ? null : onClose())}
        title="Ajout en masse"
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
                      const text = buildTemplate(categories);
                      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "produits-template.csv";
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
              <div className="text-xs text-muted-foreground">
                - Séparateur colonnes: ; (CSV). Valeurs avec ; à entourer de guillemets.
                - Prix/TVA acceptent 15000, 15 000, 15.000, 15000,50.
                - Catégorie: utiliser l’ID, le slug ou le nom (une seule catégorie).
                - Images secondaires: séparer les URLs avec `|` (ou `,` / `;`).
                - EAN: généré automatiquement si vide.
              </div>
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
                    <span className="font-semibold">{result.created}</span> / {result.total} produits créés
                  </div>
                  <div className="max-h-48 overflow-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <td className="p-2">Ligne</td>
                          <td className="p-2">Référence</td>
                          <td className="p-2">Nom</td>
                          <td className="p-2">Résultat</td>
                        </tr>
                      </thead>
                      <tbody>
                        {(result.results || []).map((r) => (
                          <tr key={`${r.index}-${r.reference}`} className="border-t border-border">
                            <td className="p-2 font-mono text-xs">{r.index + 1}</td>
                            <td className="p-2">{r.reference || "-"}</td>
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
            <table className="min-w-[1350px] w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <td className="p-2">Référence</td>
                  <td className="p-2">Nom</td>
                  <td className="p-2">Description</td>
                  <td className="p-2">Catégorie</td>
                  <td className="p-2">Prix</td>
                  <td className="p-2">Stock</td>
                  <td className="p-2">Marque</td>
                  <td className="p-2 text-center">En phare</td>
                  <td className="p-2 text-center">Best seller</td>
                  <td className="p-2">Image</td>
                  <td className="p-2 text-right">Action</td>
                </tr>
              </thead>
              <tbody>
                {validatedRows.map((row, idx) => {
                  const errs = row._errors || {};
                  return (
                    <tr key={`bulk-row-${idx}`} className="border-t border-border align-top">
                      <td className="p-2">
                        <Input
                          value={row.referenceProduitPartenaire}
                          onChange={(e) => setRowField(idx, "referenceProduitPartenaire", e.target.value)}
                          className={errs.referenceProduitPartenaire ? "border-destructive" : ""}
                          placeholder="REF-001"
                        />
                        {errs.referenceProduitPartenaire ? (
                          <div className="mt-1 text-xs text-destructive">{errs.referenceProduitPartenaire}</div>
                        ) : null}
                      </td>
                      <td className="p-2">
                        <Input
                          value={row.name}
                          onChange={(e) => setRowField(idx, "name", e.target.value)}
                          className={errs.name ? "border-destructive" : ""}
                          placeholder="Nom du produit"
                        />
                        {errs.name ? <div className="mt-1 text-xs text-destructive">{errs.name}</div> : null}
                      </td>
                      <td className="p-2">
                        <Input
                          value={row.description}
                          onChange={(e) => setRowField(idx, "description", e.target.value)}
                          placeholder="Description"
                        />
                      </td>
                      <td className="p-2">
                        <Select
                          value={row.categoryId}
                          onChange={(e) => setRowField(idx, "categoryId", e.target.value)}
                          options={categoryOptions}
                          className={errs.categoryId ? "border-destructive" : ""}
                        />
                        {errs.categoryId ? <div className="mt-1 text-xs text-destructive">{errs.categoryId}</div> : null}
                      </td>
                      <td className="p-2">
                        <Input
                          type="text"
                          value={row.price}
                          onChange={(e) => setRowField(idx, "price", e.target.value)}
                          className={errs.price ? "border-destructive" : ""}
                          placeholder="15000"
                        />
                        {errs.price ? <div className="mt-1 text-xs text-destructive">{errs.price}</div> : null}
                      </td>
                      <td className="p-2">
                        <Input
                          type="text"
                          value={row.stock}
                          onChange={(e) => setRowField(idx, "stock", e.target.value)}
                          className={errs.stock ? "border-destructive" : ""}
                          placeholder="0"
                        />
                        {errs.stock ? <div className="mt-1 text-xs text-destructive">{errs.stock}</div> : null}
                      </td>
                      <td className="p-2">
                        <Input
                          value={row.brand}
                          onChange={(e) => setRowField(idx, "brand", e.target.value)}
                          placeholder="Marque"
                        />
                      </td>
                      <td className="p-2">
                        <div className="flex justify-center pt-2">
                          <input
                            type="checkbox"
                            checked={Boolean(row.isFeatured)}
                            onChange={(e) => setRowField(idx, "isFeatured", e.target.checked)}
                            disabled={isSubmitting}
                            aria-label="Produit en phare"
                          />
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex justify-center pt-2">
                          <input
                            type="checkbox"
                            checked={Boolean(row.isBestSeller)}
                            onChange={(e) => setRowField(idx, "isBestSeller", e.target.checked)}
                            disabled={isSubmitting}
                            aria-label="Best seller"
                          />
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {row.mainImageUrl ? (
                            <img src={row.mainImageUrl} alt="" className="h-9 w-9 rounded object-cover border border-border" />
                          ) : (
                            <div className="h-9 w-9 rounded border border-dashed border-border bg-muted/30" />
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setImageRowIndex(idx)}
                            disabled={isSubmitting}
                          >
                            {row.mainImageUrl ? "Changer" : "Lien"}
                          </Button>
                          {row.mainImageUrl ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setRowField(idx, "mainImageUrl", "");
                                setRowField(idx, "secondaryImageUrls", "");
                              }}
                              disabled={isSubmitting}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          ) : null}
                        </div>
                      </td>
                      <td className="p-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRow(idx)}
                          disabled={isSubmitting || validatedRows.length <= 1}
                        >
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

      <Modal
        isOpen={typeof imageRowIndex === "number"}
        onClose={() => setImageRowIndex(null)}
        title="Image produit"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setImageRowIndex(null)}>
              Fermer
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Lien de l'image principale</Label>
            <div className="flex gap-2">
              <Input
                type="url"
                value={typeof imageRowIndex === "number" ? rows[imageRowIndex]?.mainImageUrl : ""}
                onChange={(e) => {
                  if (typeof imageRowIndex !== "number") return;
                  setRowField(imageRowIndex, "mainImageUrl", e.target.value);
                }}
                placeholder="https://cdn.exemple.com/image.jpg"
              />
              <Button type="button" variant="outline" onClick={() => bulkMainImageInputRef.current?.click()} disabled={uploadingImage}>
                <Upload className="mr-2 h-4 w-4" />
                {uploadingImage ? "Upload..." : "Uploader"}
              </Button>
              <input
                ref={bulkMainImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  uploadMainImageForRow(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Collez une URL ou uploadez une image compressée par le backend.</p>
          </div>
          <div className="space-y-2">
            <Label>Images secondaires</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={typeof imageRowIndex === "number" ? rows[imageRowIndex]?.secondaryImageUrls : ""}
                onChange={(e) => {
                  if (typeof imageRowIndex !== "number") return;
                  setRowField(imageRowIndex, "secondaryImageUrls", e.target.value);
                }}
                placeholder="https://cdn.exemple.com/a.jpg|https://cdn.exemple.com/b.jpg"
              />
              <Button type="button" variant="outline" onClick={() => bulkSecondaryImagesInputRef.current?.click()} disabled={uploadingImage}>
                Ajouter
              </Button>
              <input
                ref={bulkSecondaryImagesInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  uploadSecondaryImagesForRow(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Séparez chaque URL avec `|` (max {MAX_SECONDARY_IMAGES}).</p>
            {typeof imageRowIndex === "number" &&
            (validatedRows[imageRowIndex]?._errors?.secondaryImageUrls) ? (
              <div className="mt-1 text-xs text-destructive">
                {validatedRows[imageRowIndex]._errors.secondaryImageUrls}
              </div>
            ) : null}
          </div>
        </div>
      </Modal>
    </>
  );
}
