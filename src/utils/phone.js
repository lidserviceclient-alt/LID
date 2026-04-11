import { AsYouType, getCountryCallingCode, isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js/min";

const toFlag = (countryCode) =>
  `${countryCode || ""}`
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

export const PHONE_COUNTRIES = [
  { code: "CI", label: "Côte d’Ivoire", dialCode: `+${getCountryCallingCode("CI")}`, flag: toFlag("CI") },
  { code: "SN", label: "Sénégal", dialCode: `+${getCountryCallingCode("SN")}`, flag: toFlag("SN") },
  { code: "BJ", label: "Bénin", dialCode: `+${getCountryCallingCode("BJ")}`, flag: toFlag("BJ") },
  { code: "BF", label: "Burkina Faso", dialCode: `+${getCountryCallingCode("BF")}`, flag: toFlag("BF") },
  { code: "CM", label: "Cameroun", dialCode: `+${getCountryCallingCode("CM")}`, flag: toFlag("CM") },
  { code: "CG", label: "Congo", dialCode: `+${getCountryCallingCode("CG")}`, flag: toFlag("CG") },
  { code: "GA", label: "Gabon", dialCode: `+${getCountryCallingCode("GA")}`, flag: toFlag("GA") },
  { code: "GW", label: "Guinée-Bissau", dialCode: `+${getCountryCallingCode("GW")}`, flag: toFlag("GW") },
  { code: "ML", label: "Mali", dialCode: `+${getCountryCallingCode("ML")}`, flag: toFlag("ML") },
  { code: "TG", label: "Togo", dialCode: `+${getCountryCallingCode("TG")}`, flag: toFlag("TG") },
  { code: "NE", label: "Niger", dialCode: `+${getCountryCallingCode("NE")}`, flag: toFlag("NE") },
  { code: "FR", label: "France", dialCode: `+${getCountryCallingCode("FR")}`, flag: toFlag("FR") },
];

export function splitPhoneNumber(value, fallbackCountry = "CI") {
  const parsed = value ? parsePhoneNumberFromString(value) : null;
  const country = parsed?.country || fallbackCountry;
  const nationalDigits = parsed?.nationalNumber || "";
  return {
    country,
    nationalNumber: nationalDigits ? new AsYouType(country).input(nationalDigits) : "",
  };
}

export function buildPhoneCandidate(country, nationalNumber) {
  const digits = `${nationalNumber || ""}`.replace(/\D/g, "");
  if (!digits) return "";
  return `+${getCountryCallingCode(country)}${digits}`;
}

export function formatNationalNumber(country, value) {
  return new AsYouType(country).input(value || "");
}

export function isValidInternationalPhone(value) {
  return Boolean(value) && isValidPhoneNumber(value);
}
