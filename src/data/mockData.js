export const kpiData = [
  {
    label: "Chiffre d'affaires (MTD)",
    value: "128,4 M FCFA",
    trend: "+12,4%",
    trendDirection: "up",
    hint: "Objectif mensuel 150 M"
  },
  {
    label: "Commandes",
    value: "2 418",
    trend: "+6,2%",
    trendDirection: "up",
    hint: "Panier moyen 53 100"
  },
  {
    label: "Taux de conversion",
    value: "3,48%",
    trend: "-0,4%",
    trendDirection: "down",
    hint: "Session moy. 4m 12s"
  },
  {
    label: "SLA expedition",
    value: "93%",
    trend: "+1,2%",
    trendDirection: "up",
    hint: "48h target"
  }
];

export const orderPipeline = [
  { label: "Nouvelles", value: 128, color: "bg-teal-500" },
  { label: "En preparation", value: 86, color: "bg-amber-500" },
  { label: "Expediees", value: 214, color: "bg-emerald-500" },
  { label: "Retours", value: 12, color: "bg-rose-500" }
];

export const recentOrders = [
  {
    id: "LID-89421",
    customer: "Aminata K.",
    channel: "Mobile",
    amount: "128 000 FCFA",
    status: "En preparation",
    date: "Il y a 12 min"
  },
  {
    id: "LID-89417",
    customer: "Jean M.",
    channel: "Web",
    amount: "54 500 FCFA",
    status: "Expediee",
    date: "Il y a 30 min"
  },
  {
    id: "LID-89411",
    customer: "Celine A.",
    channel: "Marketplace",
    amount: "212 000 FCFA",
    status: "Nouvelle",
    date: "Il y a 1h"
  },
  {
    id: "LID-89406",
    customer: "Oumar S.",
    channel: "Web",
    amount: "32 000 FCFA",
    status: "Livree",
    date: "Il y a 2h"
  }
];

export const lowStock = [
  {
    name: "Sneakers AeroPulse",
    sku: "AP-42-RED",
    stock: 8,
    threshold: 20,
    supplier: "Pulse Factory"
  },
  {
    name: "Veste Ventix",
    sku: "VX-11-BLK",
    stock: 12,
    threshold: 30,
    supplier: "Ventix Labs"
  },
  {
    name: "Sac Comet",
    sku: "CM-88-GRY",
    stock: 6,
    threshold: 15,
    supplier: "Comet Goods"
  }
];

export const topProducts = [
  {
    name: "Sneakers AeroPulse",
    category: "Chaussures",
    revenue: "28,4 M",
    delta: "+18%"
  },
  {
    name: "Hoodie Nebula",
    category: "Streetwear",
    revenue: "19,7 M",
    delta: "+9%"
  },
  {
    name: "Montre Orbis",
    category: "Accessoires",
    revenue: "14,3 M",
    delta: "+6%"
  }
];

export const orderTable = [
  {
    id: "LID-89421",
    customer: "Aminata Kone",
    items: 3,
    channel: "Mobile",
    total: "128 000 FCFA",
    status: "En preparation",
    date: "25 janv. 2026"
  },
  {
    id: "LID-89418",
    customer: "Mamadou Diop",
    items: 1,
    channel: "Web",
    total: "42 000 FCFA",
    status: "Livree",
    date: "25 janv. 2026"
  },
  {
    id: "LID-89412",
    customer: "Sarah NDri",
    items: 4,
    channel: "Marketplace",
    total: "210 500 FCFA",
    status: "Nouvelle",
    date: "25 janv. 2026"
  },
  {
    id: "LID-89407",
    customer: "Gael Kouassi",
    items: 2,
    channel: "Web",
    total: "68 900 FCFA",
    status: "Expediee",
    date: "24 janv. 2026"
  },
  {
    id: "LID-89395",
    customer: "Salif Traore",
    items: 5,
    channel: "Mobile",
    total: "134 200 FCFA",
    status: "Retournee",
    date: "24 janv. 2026"
  }
];

export const products = [
  {
    id: "PRD-112",
    name: "Sneakers AeroPulse",
    category: "Chaussures",
    price: "85 000 FCFA",
    stock: 54,
    status: "Actif"
  },
  {
    id: "PRD-109",
    name: "Hoodie Nebula",
    category: "Streetwear",
    price: "45 000 FCFA",
    stock: 120,
    status: "Actif"
  },
  {
    id: "PRD-104",
    name: "Sac Comet",
    category: "Accessoires",
    price: "64 500 FCFA",
    stock: 18,
    status: "Faible"
  },
  {
    id: "PRD-099",
    name: "Montre Orbis",
    category: "Accessoires",
    price: "125 000 FCFA",
    stock: 33,
    status: "Actif"
  }
];

export const customers = [
  {
    id: "CUS-3421",
    name: "Aminata Kone",
    tier: "Gold",
    orders: 12,
    spent: "850 000 FCFA",
    lastOrder: "25 janv. 2026"
  },
  {
    id: "CUS-3398",
    name: "Jean MBaye",
    tier: "Silver",
    orders: 8,
    spent: "410 000 FCFA",
    lastOrder: "24 janv. 2026"
  },
  {
    id: "CUS-3310",
    name: "Celine Ahou",
    tier: "Platinum",
    orders: 18,
    spent: "1,45 M FCFA",
    lastOrder: "23 janv. 2026"
  },
  {
    id: "CUS-3204",
    name: "Oumar Soro",
    tier: "Bronze",
    orders: 4,
    spent: "120 000 FCFA",
    lastOrder: "22 janv. 2026"
  }
];

export const analyticsSeries = [18, 22, 26, 21, 28, 32, 30, 36, 33, 38, 41, 44];

export const channelMix = [
  { label: "Web", value: 48, color: "#0ea5a3" },
  { label: "Mobile", value: 32, color: "#f97316" },
  { label: "Marketplace", value: 20, color: "#38bdf8" }
];

export const teamActivity = [
  {
    name: "Mariam NGuessan",
    role: "Ops Lead",
    action: "a valide 12 expeditions",
    time: "Il y a 20 min"
  },
  {
    name: "Boris Toure",
    role: "Category Manager",
    action: "a lance la promo Janv.",
    time: "Il y a 1h"
  },
  {
    name: "Ange Kassi",
    role: "Customer Care",
    action: "a repondu a 24 tickets",
    time: "Il y a 2h"
  }
];
