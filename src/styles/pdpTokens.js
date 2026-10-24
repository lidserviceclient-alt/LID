// Design tokens pour le gabarit PDP pixel-perfect (/pdp-showcase).
// Reflète 1:1 les classes Tailwind `pdp-*` déclarées dans tailwind.config.js.
export const pdpColors = {
  red: "#E1251B",
  ink: "#1A1A1A",
  black: "#000000",
  gray700: "#505259",
  gray500: "#888B94",
  graySep: "rgba(0,0,0,.6)",
  surface: "#F5F6FA",
  surface2: "#F5F7FA",
  line: "#E0E1E5",
  line2: "#E5E7EB",
  green: "#008011",
  orange: "#D4801F",
  violet: "#6D28D9",
  white: "#FFFFFF",
};

export const pdpRadius = {
  cta: 4,
  card: 8,
  thumb: 4,
  pill: "50%",
};

export const pdpShadow = {
  headerScrolled: "0 2px 8px rgba(0,0,0,.06)",
  stickyBar: "0 -2px 12px rgba(0,0,0,.08)",
  floatingRail: "0 2px 8px rgba(0,0,0,.08)",
};

export const pdpType = {
  h1: "text-[24px] font-bold leading-[32px]",
  sectionTitle: "text-[24px] font-semibold leading-[32px]",
  blockSubtitle: "text-[22px] font-semibold",
  brand: "text-[20px] font-bold leading-[26px]",
  priceMain: "text-[32px] font-bold leading-[32px]",
  cta: "text-[18px] font-bold",
  body: "text-[16px] leading-[22px]",
  secondary: "text-[14px] leading-[20px]",
  micro: "text-[12px] font-medium",
};

export const CONTAINER_MAX = 1228;
