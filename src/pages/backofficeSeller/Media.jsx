import PageSEO from "@/components/PageSEO";
import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Image as ImageIcon, Search, Trash2, Upload } from 'lucide-react';
import { deleteFile, listMedia, uploadFiles } from '@/services/fileStorageService';

const folders = [
  { value: 'partners/products', label: 'Produits' },
  { value: 'partners/categories', label: 'Catégories' },
  { value: 'partners/uploads', label: 'Autres' },
];

export default function SellerMedia() {
  const inputRef = useRef(null);
  const [folder, setFolder] = useState('partners/products');
  const [filterFolder, setFilterFolder] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [mediaPage, setMediaPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingKey, setDeletingKey] = useState('');
  const [error, setError] = useState('');
  const [copiedUrl, setCopiedUrl] = useState('');

  const mediaItems = Array.isArray(mediaPage?.content) ? mediaPage.content : [];
  const isDuplicateError = (item) => `${item?.errorMessage || ''}`.toLowerCase().includes('existe déjà');

  const loadMedia = async (nextPage = page, { force = false } = {}) => {
    setLoading(true);
    setError('');
    try {
      const response = await listMedia({
        folder: filterFolder,
        q: query.trim(),
        page: nextPage,
        size: 24,
        force,
      });
      setMediaPage(response);
      setPage(response?.number ?? nextPage);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Chargement des médias impossible.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia(0);
  }, [filterFolder]);

  const upload = async (files) => {
    const selected = Array.from(files || []).filter(Boolean);
    if (!selected.length || uploading) return;
    setUploading(true);
    setError('');
    try {
      const response = await uploadFiles(selected, { folder });
      const filesResult = Array.isArray(response?.files) ? response.files : [];
      const duplicateCount = filesResult.filter(isDuplicateError).length;
      if (duplicateCount > 0 && window.confirm(`${duplicateCount} image(s) portent déjà le même nom. Voulez-vous les écraser ?`)) {
        await uploadFiles(selected, { folder, overwrite: true });
      }
      await loadMedia(0, { force: true });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Upload impossible.');
    } finally {
      setUploading(false);
    }
  };

  const copy = async (url) => {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    window.setTimeout(() => setCopiedUrl(''), 1400);
  };

  const remove = async (objectKey) => {
    if (!objectKey || deletingKey) return;
    if (!window.confirm('Supprimer définitivement ce média ?')) return;
    setDeletingKey(objectKey);
    setError('');
    try {
      await deleteFile(objectKey);
      await loadMedia(mediaItems.length === 1 && page > 0 ? page - 1 : page, { force: true });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Suppression impossible.');
    } finally {
      setDeletingKey('');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageSEO title="Médiathèque" noindex />
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Médias</h1>
          <p className="text-sm text-gray-500 mt-1">Uploadez vos images compressées et copiez les URLs pour vos imports produits.</p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-60"
        >
          <Upload size={18} />
          {uploading ? 'Upload...' : 'Uploader'}
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[220px_220px_1fr_auto]">
          <select value={folder} onChange={(event) => setFolder(event.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm">
            {folders.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <select value={filterFolder} onChange={(event) => setFilterFolder(event.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm">
            <option value="">Tous dossiers</option>
            {folders.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') loadMedia(0);
              }}
              placeholder="Rechercher un fichier"
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>
          <button onClick={() => loadMedia(0)} disabled={loading} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            {loading ? 'Chargement...' : 'Filtrer'}
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            upload(event.target.files);
            event.target.value = '';
          }}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-5 flex min-h-44 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center transition hover:bg-gray-100 disabled:opacity-60"
        >
          <ImageIcon className="mb-3 h-10 w-10 text-gray-400" />
          <span className="text-base font-semibold text-gray-900">Glissez vos images ou cliquez pour uploader</span>
          <span className="mt-1 text-sm text-gray-500">Les URLs générées sont disponibles dans la bibliothèque ci-dessous.</span>
        </button>

        {error ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {mediaItems.map((media) => (
          <div key={media.id || media.objectKey} className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
              <img src={media.url} alt={media.originalFilename || ''} className="h-full w-full object-contain" loading="lazy" />
            </div>
            <div className="min-w-0 space-y-2">
              <p className="truncate text-sm font-semibold text-gray-900">{media.originalFilename || media.storedFilename}</p>
              <p className="truncate font-mono text-xs text-gray-500">{media.objectKey}</p>
              <p className="truncate font-mono text-xs text-gray-500">{media.url}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{media.folder}</span>
                <span>{Math.round((media.size || 0) / 1024)} Ko</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => copy(media.url)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  {copiedUrl === media.url ? <Check size={16} /> : <Copy size={16} />}
                  {copiedUrl === media.url ? 'Copié' : "Copier l'URL"}
                </button>
                <button
                  onClick={() => remove(media.objectKey)}
                  disabled={deletingKey === media.objectKey}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                >
                  <Trash2 size={16} />
                  {deletingKey === media.objectKey ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && mediaItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500">
          Aucun média pour ces filtres.
        </div>
      ) : null}

      {mediaPage && mediaPage.totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {(mediaPage.number ?? 0) + 1} / {mediaPage.totalPages}</p>
          <div className="flex gap-2">
            <button disabled={loading || mediaPage.first} onClick={() => loadMedia(Math.max(0, page - 1))} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm disabled:opacity-50">
              Précédent
            </button>
            <button disabled={loading || mediaPage.last} onClick={() => loadMedia(page + 1)} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm disabled:opacity-50">
              Suivant
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
