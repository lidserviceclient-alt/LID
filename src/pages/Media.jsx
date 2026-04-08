import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Image as ImageIcon, Search, Upload, X } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Select from "../components/ui/Select.jsx";
import { backofficeApi } from "../services/api.js";

const folderOptions = [
  { value: "products", label: "Produits" },
  { value: "categories", label: "Catégories" },
  { value: "blog", label: "Blog" },
  { value: "tickets", label: "Billetterie" },
  { value: "uploads", label: "Autres" }
];

const ownerScopeOptions = [
  { value: "LID", label: "Médias LID" },
  { value: "PARTNER", label: "Médias partenaires" }
];

export default function Media() {
  const inputRef = useRef(null);
  const [folder, setFolder] = useState("products");
  const [filterFolder, setFilterFolder] = useState("");
  const [ownerScope, setOwnerScope] = useState("LID");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [mediaPage, setMediaPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [copiedUrl, setCopiedUrl] = useState("");

  const successfulItems = useMemo(() => items.filter((item) => item?.success && item?.file?.url), [items]);
  const mediaItems = Array.isArray(mediaPage?.content) ? mediaPage.content : [];
  const isDuplicateError = (item) => `${item?.errorMessage || ""}`.toLowerCase().includes("existe déjà");

  const loadMedia = async (nextPage = page) => {
    setLoading(true);
    setError("");
    try {
      const response = await backofficeApi.listMedia({
        ownerScope,
        folder: filterFolder,
        q: query.trim(),
        page: nextPage,
        size: 24
      });
      setMediaPage(response);
      setPage(response?.number ?? nextPage);
    } catch (err) {
      setError(err?.message || "Chargement des médias impossible.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia(0);
  }, [ownerScope, filterFolder]);

  const upload = async (files) => {
    const selected = Array.from(files || []).filter(Boolean);
    if (!selected.length || uploading) return;
    setUploading(true);
    setError("");
    try {
      const response = await backofficeApi.uploadMediaBulk(selected, folder);
      let nextItems = Array.isArray(response?.files) ? response.files : [];
      const duplicateCount = nextItems.filter(isDuplicateError).length;
      if (duplicateCount > 0 && window.confirm(`${duplicateCount} image(s) portent déjà le même nom. Voulez-vous les écraser ?`)) {
        const retryResponse = await backofficeApi.uploadMediaBulk(selected, folder, { overwrite: true });
        nextItems = Array.isArray(retryResponse?.files) ? retryResponse.files : [];
      }
      setItems(nextItems);
      await loadMedia(0);
    } catch (err) {
      setError(err?.message || "Upload impossible.");
    } finally {
      setUploading(false);
    }
  };

  const copy = async (url) => {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    window.setTimeout(() => setCopiedUrl(""), 1400);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Media"
        subtitle="Uploadez des images compressées, retrouvez les médias persistés et copiez les URLs CDN dans vos imports produits."
        rightSlot={
          <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Upload..." : "Uploader"}
          </Button>
        }
      />

      <Card className="p-6 space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="max-w-sm space-y-2">
            <p className="text-sm font-medium text-foreground">Dossier cible</p>
            <Select value={folder} onChange={(e) => setFolder(e.target.value)} options={folderOptions} />
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              upload(event.target.files);
              event.target.value = "";
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex min-h-48 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 px-6 py-10 text-center transition hover:bg-muted/40 disabled:opacity-60"
        >
          <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground" />
          <span className="text-base font-semibold text-foreground">Glissez vos images ou cliquez pour uploader</span>
          <span className="mt-1 text-sm text-muted-foreground">Compression automatique, sortie URL CDN prête pour CSV.</span>
        </button>

        {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

        {items.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => {
              const file = item?.file;
              return (
                <div key={`${item?.originalFilename || "file"}-${index}`} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  {item?.success ? (
                    <>
                      <img src={file.url} alt="" className="h-40 w-full rounded-xl bg-white object-contain" loading="lazy" />
                      <div className="mt-3 space-y-1">
                        <p className="truncate text-sm font-medium text-foreground">{item.originalFilename}</p>
                        <p className="truncate font-mono text-xs text-muted-foreground">{file.url}</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((file.originalSize || 0) / 1024)} Ko {"->"} {Math.round((file.size || 0) / 1024)} Ko
                        </p>
                      </div>
                      <Button className="mt-3 w-full" variant="outline" onClick={() => copy(file.url)}>
                        {copiedUrl === file.url ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                        {copiedUrl === file.url ? "Copié" : "Copier l'URL"}
                      </Button>
                    </>
                  ) : (
                    <div className="flex min-h-48 flex-col justify-center rounded-xl bg-red-50 p-4 text-sm text-red-700">
                      <X className="mb-2 h-5 w-5" />
                      <p className="font-medium">{item?.originalFilename || "Fichier"}</p>
                      <p>{item?.errorMessage || "Upload impossible."}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}

        {successfulItems.length > 0 ? (
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="mb-2 text-sm font-medium text-foreground">URLs à coller dans un CSV</p>
            <textarea
              readOnly
              className="min-h-24 w-full rounded-lg border border-border bg-background p-3 font-mono text-xs"
              value={successfulItems.map((item) => item.file.url).join("\n")}
            />
          </div>
        ) : null}
      </Card>

      <Card className="p-6 space-y-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Bibliothèque média</h2>
            <p className="text-sm text-muted-foreground">
              Par défaut, seuls les médias LID sont affichés. Utilise le filtre pour auditer les médias partenaires.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-[180px_180px_minmax(220px,1fr)_auto] xl:min-w-[760px]">
            <Select value={ownerScope} onChange={(e) => setOwnerScope(e.target.value)} options={ownerScopeOptions} />
            <Select
              value={filterFolder}
              onChange={(e) => setFilterFolder(e.target.value)}
              options={[{ value: "", label: "Tous dossiers" }, ...folderOptions]}
            />
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") loadMedia(0);
                }}
                placeholder="Rechercher un nom ou chemin"
                className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <Button variant="outline" onClick={() => loadMedia(0)} disabled={loading}>
              {loading ? "Chargement..." : "Filtrer"}
            </Button>
          </div>
        </div>

        {mediaItems.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {mediaItems.map((media) => (
              <div key={media.id || media.objectKey} className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl bg-muted/20">
                  <img src={media.url} alt={media.originalFilename || ""} className="h-full w-full object-contain" loading="lazy" />
                </div>
                <div className="min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-foreground">{media.originalFilename || media.storedFilename}</p>
                    <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">{media.folder}</span>
                  </div>
                  <p className="truncate font-mono text-xs text-muted-foreground">{media.objectKey}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">{media.url}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{media.ownerScope === "PARTNER" ? "Partenaire" : "LID"}</span>
                    <span>{Math.round((media.size || 0) / 1024)} Ko</span>
                  </div>
                  <Button className="h-9 w-full" variant="outline" onClick={() => copy(media.url)}>
                    {copiedUrl === media.url ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copiedUrl === media.url ? "Copié" : "Copier l'URL"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground">
            {loading ? "Chargement des médias..." : "Aucun média pour ces filtres."}
          </div>
        )}

        {mediaPage && mediaPage.totalPages > 1 ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {(mediaPage.number ?? 0) + 1} / {mediaPage.totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" disabled={loading || mediaPage.first} onClick={() => loadMedia(Math.max(0, page - 1))}>
                Précédent
              </Button>
              <Button variant="outline" disabled={loading || mediaPage.last} onClick={() => loadMedia(page + 1)}>
                Suivant
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
