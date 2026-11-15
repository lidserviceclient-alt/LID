import { ChevronLeft, ChevronRight, Columns3, Download, List, Phone, Printer, Search } from "lucide-react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import { LaneBadge, LateBadge, ShipmentCard } from "./ShipmentBadges.jsx";
import { useLogistics } from "../../pages/logistics/LogisticsContext.jsx";
import {
  BULK_MAX,
  COLUMNS,
  PAGE_SIZES,
  PREP_HOUR_OPTIONS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  TRANSIT_HOUR_OPTIONS,
  buildQrUrl,
  courierLabel,
  formatDateTime,
  formatIdle,
  formatMoney,
  nf,
  qrValueOf,
  shipperLabel
} from "../../pages/logistics/logisticsUtils.js";

/** Filtres serveur de la liste des colis + export + bascule Liste / Colonnes. */
export function ShipmentsFilters({ allowColumns = true }) {
  const {
    qInput, setQInput, status, changeStatus, carrier, changeCarrier, carriers, courierFilter, changeCourier, couriers, counts,
    view, sort, changeSort, lateOnly, toggleLate, prepHours, setPrepHours, transitHours, setTransitHours,
    exportShipmentsCsv, exporting, exportError, pageData, showList, showColumns, hasFilter, resetFilters, history
  } = useLogistics();
  const totalElements = pageData?.totalElements || 0;
  // Dans l'historique, la sous-page elle-même n'est pas un « filtre » à réinitialiser
  const filtersActive = history ? Boolean(status || carrier || lateOnly || courierFilter || qInput) : hasFilter;

  return (
    <Card className="p-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full space-y-1 sm:w-72">
          <p className="text-xs text-muted-foreground">Recherche</p>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Commande, tracking, client, adresse, livreur…"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              aria-label="Rechercher une expédition"
            />
          </div>
        </div>
        <div className="w-full space-y-1 sm:w-40">
          <p className="text-xs text-muted-foreground">Statut</p>
          <Select value={status} onChange={(e) => changeStatus(e.target.value)} aria-label="Statut">
            <option value="">Tous</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full space-y-1 sm:w-44">
          <p className="text-xs text-muted-foreground">Transporteur</p>
          <Select value={carrier} onChange={(e) => changeCarrier(e.target.value)} aria-label="Transporteur">
            <option value="">Tous</option>
            {carriers.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full space-y-1 sm:w-60">
          <p className="text-xs text-muted-foreground">Livreur</p>
          <Select value={courierFilter} onChange={(e) => changeCourier(e.target.value)} aria-label="Livreur">
            <option value="">Tous</option>
            <option value="UNASSIGNED">Non affectés ({nf.format(Number(counts.unassigned) || 0)})</option>
            {couriers
              .filter((c) => c.email)
              .map((c) => (
                <option key={c.id} value={c.email.toLowerCase()}>
                  {courierLabel(c)} · {c.toPickup + c.inTransit} en cours{c.active ? "" : " (désactivé)"}
                </option>
              ))}
          </Select>
        </div>
        {view === "list" ? (
          <div className="w-full space-y-1 sm:w-48">
            <p className="text-xs text-muted-foreground">Tri</p>
            <Select value={sort} onChange={(e) => changeSort(e.target.value)} aria-label="Tri">
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
        ) : null}
        <label className="flex h-10 cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4" checked={lateOnly} onChange={toggleLate} />
          <span className={Number(counts.late) > 0 ? "font-medium text-rose-700" : ""}>En retard seulement ({nf.format(Number(counts.late) || 0)})</span>
        </label>
        <div className="w-full space-y-1 sm:w-28">
          <p className="text-xs text-muted-foreground">Retard dépôt</p>
          <Select value={`${prepHours}`} onChange={(e) => setPrepHours(Number(e.target.value))} aria-label="Seuil de retard au dépôt">
            {PREP_HOUR_OPTIONS.map((h) => (
              <option key={h} value={h}>
                {h} h
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full space-y-1 sm:w-28">
          <p className="text-xs text-muted-foreground">Retard en route</p>
          <Select value={`${transitHours}`} onChange={(e) => setTransitHours(Number(e.target.value))} aria-label="Seuil de retard en route">
            {TRANSIT_HOUR_OPTIONS.map((h) => (
              <option key={h} value={h}>
                {h} h
              </option>
            ))}
          </Select>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={exportShipmentsCsv} disabled={exporting || totalElements === 0} isLoading={exporting}>
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          {allowColumns ? (
            <div className="flex items-center gap-1 rounded-lg border border-border p-1" role="group" aria-label="Mode d'affichage">
              <Button variant={view === "list" ? "primary" : "ghost"} size="sm" className="gap-1" onClick={showList} aria-pressed={view === "list"}>
                <List className="h-4 w-4" /> Liste
              </Button>
              <Button variant={view === "columns" ? "primary" : "ghost"} size="sm" className="gap-1" onClick={showColumns} aria-pressed={view === "columns"}>
                <Columns3 className="h-4 w-4" /> Colonnes
              </Button>
            </div>
          ) : null}
        </div>
      </div>
      {filtersActive || exportError ? (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {filtersActive ? (
            <>
              <span>Filtres actifs.</span>
              <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
                Réinitialiser
              </Button>
            </>
          ) : null}
          {exportError ? <span className="text-red-600">{exportError}</span> : null}
        </div>
      ) : null}
    </Card>
  );
}

/** Barre de sélection : affectation en lot de la livraison à un livreur. */
function BulkBar() {
  const { checked, bulk, bulkCourier, setBulkCourier, activeCouriers, bulkAssign, resetSelection } = useLogistics();
  if (checked.size === 0 && !bulk) return null;
  return (
    <div className="space-y-2 border-b border-border bg-muted/40 px-3 py-2 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">
          {checked.size} sélectionné{checked.size > 1 ? "s" : ""}
          {checked.size >= BULK_MAX ? ` (max ${BULK_MAX})` : ""}
        </span>
        <div className="w-64">
          <Select value={bulkCourier} onChange={(e) => setBulkCourier(e.target.value)} aria-label="Livreur pour la sélection">
            <option value="">Affecter la sélection à…</option>
            {activeCouriers.map((c) => (
              <option key={c.id} value={c.email}>
                {courierLabel(c)} — {c.toPickup + c.inTransit} en cours
              </option>
            ))}
          </Select>
        </div>
        <Button size="sm" onClick={bulkAssign} disabled={!bulkCourier || checked.size === 0 || Boolean(bulk?.running)} isLoading={Boolean(bulk?.running)}>
          Affecter
        </Button>
        <Button size="sm" variant="ghost" onClick={resetSelection} disabled={Boolean(bulk?.running)}>
          Vider la sélection
        </Button>
      </div>
      {bulk ? (
        <div aria-live="polite" className="text-xs">
          {bulk.running ? (
            <span>
              Affectation à {bulk.courier} : {bulk.done}/{bulk.total}…
            </span>
          ) : (
            <span className={bulk.failures.length ? "text-amber-700" : "text-emerald-700"}>
              {bulk.ok} colis affecté{bulk.ok > 1 ? "s" : ""} à {bulk.courier}
              {bulk.failures.length ? ` · ${bulk.failures.length} échec(s) : ${bulk.failures.slice(0, 5).map((f) => `${f.ref} (${f.message})`).join(", ")}` : "."}
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}

/** Liste paginée côté serveur, sélection multiple, actions rapides par ligne. */
export function ShipmentsTable({ title }) {
  const {
    items, pageData, listLoading, listError, hasFilter, checked, toggleChecked, togglePage, allPageChecked, selectableOnPage,
    selectedId, openShipment, initPrint, openQrModal, page, setPage, size, changeSize
  } = useLogistics();
  const totalElements = pageData?.totalElements || 0;
  const totalPages = pageData?.totalPages || 0;

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-3 py-2">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">Cliquez sur une ligne pour le détail, l'historique et les actions.</p>
      </div>
      <BulkBar />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="w-10 px-3 py-2">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  aria-label="Sélectionner la page"
                  checked={allPageChecked}
                  disabled={selectableOnPage.length === 0}
                  onChange={togglePage}
                />
              </th>
              <th className="px-3 py-2">Commande / Tracking</th>
              <th className="px-3 py-2">Client / Adresse</th>
              <th className="px-3 py-2">Expéditeur / Transporteur</th>
              <th className="px-3 py-2">Livreur</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2">ETA / Coût</th>
              <th className="px-3 py-2">Dernier mouvement</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!pageData && listLoading ? (
              <tr>
                <td colSpan={9} className="px-3 py-10 text-center text-muted-foreground">
                  Chargement…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-10 text-center text-muted-foreground">
                  {listError && !pageData
                    ? "La liste n'a pas pu être chargée."
                    : hasFilter
                      ? "Aucune expédition ne correspond à ces filtres."
                      : "Aucun colis à suivre pour le moment."}
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const sh = item.shipment || {};
                const isChecked = checked.has(sh.id);
                const qr = qrValueOf(sh);
                return (
                  <tr
                    key={sh.id}
                    className={`cursor-pointer border-t border-border align-top hover:bg-muted/30 ${`${selectedId}` === `${sh.id}` ? "bg-primary/5" : ""}`}
                    onClick={() => openShipment(item)}
                  >
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        aria-label={`Sélectionner ${sh.orderId || sh.id}`}
                        checked={isChecked}
                        disabled={sh.status === "LIVREE" || (!isChecked && checked.size >= BULK_MAX)}
                        onChange={() => toggleChecked(item)}
                      />
                    </td>
                    <td className="max-w-[11rem] px-3 py-2">
                      <p className="whitespace-nowrap font-semibold text-foreground">{sh.orderId || `#${sh.id}`}</p>
                      <p className="break-all font-mono text-[11px] text-muted-foreground">{sh.trackingId || "-"}</p>
                    </td>
                    <td className="max-w-[16rem] px-3 py-2">
                      <p className="truncate text-foreground">{sh.customerName || "-"}</p>
                      <p className="whitespace-normal break-words text-xs text-muted-foreground">{sh.customerAddress || "Adresse non renseignée"}</p>
                    </td>
                    <td className="max-w-[10rem] px-3 py-2">
                      <p className="truncate">{shipperLabel(sh)}</p>
                      <p className="truncate text-xs text-muted-foreground">{sh.carrier || "-"}</p>
                    </td>
                    <td className="max-w-[10rem] truncate px-3 py-2">
                      {sh.courierName || sh.courierUser || <span className="text-muted-foreground">Non affecté</span>}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap items-center gap-1">
                        <LaneBadge lane={item.lane} status={sh.status} />
                        {sh.failedAttempts ? (
                          <span className="text-[11px] text-muted-foreground" title="Échecs de livraison">
                            ×{sh.failedAttempts}
                          </span>
                        ) : null}
                        {sh.codeLocked ? <span className="text-[11px] font-semibold text-rose-700">Code verrouillé</span> : null}
                        {sh.awaitsWarehouseReceipt ? (
                          <span className="text-[11px] font-semibold text-amber-700" title="Option B : collecte vers l'entrepôt LID, à réceptionner avant la livraison au client">
                            Collecte → entrepôt
                          </span>
                        ) : sh.logisticsMode === "VIA_WAREHOUSE" && sh.warehouseReceivedAt ? (
                          <span className="text-[11px] text-muted-foreground" title="Option B : colis reçu à l'entrepôt LID">
                            Reçu entrepôt
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <p>{formatDateTime(sh.eta)}</p>
                      <p className="text-xs text-muted-foreground">{formatMoney(sh.cost)}</p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className={item.late ? "font-medium text-rose-700" : "text-muted-foreground"}>{formatIdle(item.idleMinutes)}</span>
                        {item.late ? <LateBadge /> : null}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-2 py-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {sh.customerPhone ? (
                          <a
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary hover:bg-muted"
                            href={`tel:${sh.customerPhone}`}
                            aria-label={`Appeler le client ${sh.customerName || ""}`}
                            title={`Appeler ${sh.customerPhone}`}
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                        ) : null}
                        <Button variant="outline" size="sm" onClick={() => initPrint(sh.id)} title="Imprimer Facture" aria-label="Imprimer la facture">
                          <Printer className="h-4 w-4" />
                        </Button>
                        {qr ? (
                          <button
                            type="button"
                            onClick={() => openQrModal(qr, sh.orderId)}
                            className="rounded-md border border-border bg-white p-1 hover:bg-muted/30"
                            title="Voir QR Code"
                          >
                            <img src={buildQrUrl(qr, 84)} alt={`QR ${sh.orderId}`} className="h-7 w-7" referrerPolicy="no-referrer" />
                          </button>
                        ) : (
                          <div className="h-9 w-9" />
                        )}
                        <Button size="sm" variant={sh.status === "ECHEC" ? "primary" : "outline"} onClick={() => openShipment(item)}>
                          {sh.status === "ECHEC" ? "Gérer" : sh.status !== "LIVREE" && !sh.courierUser ? "Affecter" : "Détail"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground">
        <span>
          {totalElements > 0
            ? `${nf.format(page * size + 1)}–${nf.format(page * size + items.length)} sur ${nf.format(totalElements)} expéditions`
            : "0 expédition"}
          {listLoading && pageData ? " · actualisation…" : ""}
        </span>
        <div className="flex items-center gap-2">
          <Select value={`${size}`} onChange={(e) => changeSize(Number(e.target.value))} aria-label="Expéditions par page" className="h-8 w-24 py-1 text-xs">
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </Select>
          <Button size="sm" variant="outline" disabled={page <= 0 || listLoading} onClick={() => setPage((p) => Math.max(0, p - 1))} aria-label="Page précédente">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>
            Page {totalPages === 0 ? 0 : page + 1} / {totalPages}
          </span>
          <Button size="sm" variant="outline" disabled={page + 1 >= totalPages || listLoading} onClick={() => setPage((p) => p + 1)} aria-label="Page suivante">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

/** Vue colonnes : aperçu des premiers colis de chaque colonne du suivi. */
export function ShipmentsColumns() {
  const { colData, colLoading, openShipment, showTab } = useLogistics();
  return (
    <div className="grid gap-3 lg:grid-cols-5">
      {COLUMNS.map((col) => {
        const data = colData[col.key];
        const list = data?.content || [];
        const total = data?.totalElements ?? 0;
        return (
          <section key={col.key} className={`rounded-xl border border-t-4 ${col.tone} p-2.5`} aria-label={col.label}>
            <h3 className="mb-2 flex items-center justify-between text-sm font-semibold text-foreground">
              {col.label}
              <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">{nf.format(total)}</span>
            </h3>
            <div className="space-y-2">
              {!data && colLoading ? (
                <p className="text-xs text-muted-foreground">Chargement…</p>
              ) : list.length === 0 ? (
                <p className="text-xs text-muted-foreground">Aucun colis.</p>
              ) : (
                list.map((item) => <ShipmentCard key={item.shipment?.id} item={item} onOpen={() => openShipment(item)} />)
              )}
            </div>
            {total > list.length ? (
              <button type="button" className="mt-2 w-full text-center text-xs font-medium text-primary hover:underline" onClick={() => showTab(col.key)}>
                Voir tous ({nf.format(total)})
              </button>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
