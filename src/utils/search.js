const stripDiacritics = (value) => {
  try {
    return `${value}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  } catch {
    return `${value}`;
  }
};

export const normalizeText = (value) => {
  if (value === null || value === undefined) return "";
  return stripDiacritics(`${value}`).toLowerCase();
};

export const isRegexQuery = (query) => {
  const q = `${query || ""}`.trim();
  if (!q) return false;
  if (q.startsWith("re:")) return true;
  return q.startsWith("/") && q.lastIndexOf("/") > 0;
};

export const compileRegex = (query) => {
  const q = `${query || ""}`.trim();
  if (!q) return null;
  if (q.startsWith("re:")) {
    return new RegExp(q.slice(3), "i");
  }
  if (q.startsWith("/") && q.lastIndexOf("/") > 0) {
    const lastSlash = q.lastIndexOf("/");
    const pattern = q.slice(1, lastSlash);
    const flags = q.slice(lastSlash + 1) || "i";
    return new RegExp(pattern, flags.includes("i") ? flags : `${flags}i`);
  }
  return null;
};

export const fuzzyScore = (query, haystack) => {
  const q = normalizeText(query).trim();
  const h = normalizeText(haystack);
  if (!q || !h) return 0;
  if (h === q) return 1000;
  const idx = h.indexOf(q);
  if (idx >= 0) {
    const startBonus = Math.max(0, 80 - idx);
    const lenBonus = Math.min(80, q.length * 3);
    return 700 + startBonus + lenBonus;
  }

  let qi = 0;
  let score = 0;
  let streak = 0;
  for (let hi = 0; hi < h.length && qi < q.length; hi++) {
    if (h[hi] === q[qi]) {
      qi++;
      streak++;
      score += 10 + Math.min(20, streak * 2);
    } else {
      streak = 0;
    }
  }
  if (qi < q.length) return 0;
  score += Math.max(0, 120 - (h.length - q.length));
  return Math.min(650, score);
};

export const tokenize = (value) => {
  return normalizeText(value).split(/[^a-z0-9]+/).filter(Boolean);
};

export const matchScore = (query, haystack) => {
  const q = `${query || ""}`.trim();
  if (!q) return 0;
  let regex = null;
  if (isRegexQuery(q)) {
    try {
      regex = compileRegex(q);
    } catch {
      return 0;
    }
  }
  const h = `${haystack || ""}`;
  if (regex) return regex.test(h) ? 900 : 0;

  const tokens = tokenize(q);
  if (tokens.length <= 1) return fuzzyScore(q, h);

  let total = 0;
  for (const t of tokens) {
    const s = fuzzyScore(t, h);
    if (s <= 0) return 0;
    total += s;
  }
  return Math.min(800, Math.round(total / tokens.length));
};

