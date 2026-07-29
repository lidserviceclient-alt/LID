const mkCategory = (id, nom, slug, parentId, niveau, extra = {}) => ({
  id,
  parentId,
  parentName: null,
  nom,
  slug,
  imageUrl: null,
  niveau,
  ordre: 0,
  estActive: true,
  isFeatured: false,
  dateCreation: "2026-01-01T00:00:00",
  dateMiseAJour: null,
  ...extra,
});

/**
 * Fictitious catalog categories used only as a staging fallback when the
 * staging database has no seeded categories yet (see useCatalogCategories).
 * Shaped exactly like the real /api/v1/catalog/categories response so it
 * flows through buildCategoryTree and the univers grouping unchanged.
 */
export const MOCK_CATEGORIES = [
  mkCategory("mock-3", "Technologie", "TECHNOLOGIE", null, "PRINCIPALE", {
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  }),
  mkCategory("mock-7", "4G/5G", "4G_5G", "mock-3", "SOUS_CATEGORIE"),
  mkCategory("mock-70", "Orange", "ORANGE_MOBILE", "mock-7", "SOUS_SOUS_CATEGORIE"),
  mkCategory("mock-71", "MTN", "MTN_MOBILE", "mock-7", "SOUS_SOUS_CATEGORIE"),
  mkCategory("mock-72", "Ordinateurs", "ORDINATEURS", "mock-3", "SOUS_CATEGORIE"),
  mkCategory("mock-73", "Portables", "PORTABLES", "mock-72", "SOUS_SOUS_CATEGORIE"),
  mkCategory("mock-74", "Fixes", "FIXES", "mock-72", "SOUS_SOUS_CATEGORIE"),

  mkCategory("mock-4", "Boissons", "BOISSONS", null, "PRINCIPALE", {
    imageUrl: "https://images.unsplash.com/photo-1497534446932-c925b458314e",
  }),
  mkCategory("mock-8", "Alcool", "ALCOOL", "mock-4", "SOUS_CATEGORIE"),
  mkCategory("mock-11", "Rhum", "RHUM", "mock-8", "SOUS_SOUS_CATEGORIE"),
  mkCategory("mock-80", "Whisky", "WHISKY", "mock-8", "SOUS_SOUS_CATEGORIE"),
  mkCategory("mock-9", "Jus", "JUS", "mock-4", "SOUS_CATEGORIE"),
  mkCategory("mock-90", "Orange", "JUS_ORANGE", "mock-9", "SOUS_SOUS_CATEGORIE"),

  mkCategory("mock-5", "Alimentation", "ALIMENTATION", null, "PRINCIPALE", {
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e",
  }),
  mkCategory("mock-12", "Fruits Sec", "FRUITS_SEC", "mock-5", "SOUS_CATEGORIE"),
  mkCategory("mock-120", "Amandes", "AMANDES", "mock-12", "SOUS_SOUS_CATEGORIE"),
  mkCategory("mock-121", "Noix de cajou", "NOIX_CAJOU", "mock-12", "SOUS_SOUS_CATEGORIE"),
  mkCategory("mock-13", "Épicerie", "EPICERIE", "mock-5", "SOUS_CATEGORIE"),
  mkCategory("mock-130", "Riz", "RIZ", "mock-13", "SOUS_SOUS_CATEGORIE"),

  mkCategory("mock-6", "Vêtements", "VETEMENT", null, "PRINCIPALE", {
    imageUrl: "https://images.unsplash.com/photo-1521334884684-d80222895322",
  }),
  mkCategory("mock-60", "Homme", "HOMME", "mock-6", "SOUS_CATEGORIE"),
  mkCategory("mock-600", "T-shirts", "TSHIRTS", "mock-60", "SOUS_SOUS_CATEGORIE"),
  mkCategory("mock-601", "Pantalons", "PANTALONS", "mock-60", "SOUS_SOUS_CATEGORIE"),
  mkCategory("mock-61", "Femme", "FEMME", "mock-6", "SOUS_CATEGORIE"),
  mkCategory("mock-610", "Robes", "ROBES", "mock-61", "SOUS_SOUS_CATEGORIE"),

  mkCategory("mock-100", "Maison", "MAISON", null, "PRINCIPALE", {
    imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858",
  }),
  mkCategory("mock-101", "Décoration", "DECORATION", "mock-100", "SOUS_CATEGORIE"),
  mkCategory("mock-1010", "Coussins", "COUSSINS", "mock-101", "SOUS_SOUS_CATEGORIE"),
  mkCategory("mock-1011", "Luminaires", "LUMINAIRES", "mock-101", "SOUS_SOUS_CATEGORIE"),
  mkCategory("mock-102", "Cuisine", "CUISINE", "mock-100", "SOUS_CATEGORIE"),
  mkCategory("mock-1020", "Ustensiles", "USTENSILES", "mock-102", "SOUS_SOUS_CATEGORIE"),
];
