// Valeurs de politique commerciale pilotees par le back-office (app-config publique), pour que les CGV, la FAQ et
// la page vendeur restent alignees avec ce que l'API applique reellement.

const NUMBER_WORDS = {
  1: "un", 2: "deux", 3: "trois", 4: "quatre", 5: "cinq", 6: "six", 7: "sept", 8: "huit", 9: "neuf", 10: "dix",
  14: "quatorze", 15: "quinze", 30: "trente",
};

/** Fenetre de retour : { count, unit: "DAYS"|"HOURS", label: "7 jours" } (7 jours par defaut, comme l'API). */
export function getReturnWindow(appConfig) {
  const unit = `${appConfig?.returnWindowUnit || "DAYS"}`.toUpperCase() === "HOURS" ? "HOURS" : "DAYS";
  const parsed = Number(appConfig?.returnWindowMax);
  const count = Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : 7;
  const noun = unit === "HOURS" ? `heure${count > 1 ? "s" : ""}` : `jour${count > 1 ? "s" : ""}`;
  return { count, unit, label: `${count} ${noun}` };
}

/** « sept (7) jours calendaires » : forme juridique utilisee dans les CGV. */
export function returnWindowLegalLabel(appConfig) {
  const { count, unit } = getReturnWindow(appConfig);
  const word = NUMBER_WORDS[count];
  const noun = unit === "HOURS" ? `heure${count > 1 ? "s" : ""}` : `jour${count > 1 ? "s" : ""} calendaire${count > 1 ? "s" : ""}`;
  return word ? `${word} (${count}) ${noun}` : `${count} ${noun}`;
}

/** Commission annoncee aux vendeurs, en pourcentage entier (10 par defaut). */
export function getPartnerCommissionPercent(appConfig) {
  const raw = Number(appConfig?.partnerMarginPercent);
  if (!Number.isFinite(raw) || raw <= 0) return 10;
  const percent = raw > 1 ? raw : raw * 100;
  return Math.round(percent * 100) / 100;
}
