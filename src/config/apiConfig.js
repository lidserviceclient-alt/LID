export const getApiBaseUrl = () => {
  const map = {
    "lidshopping.com": import.meta.env.VITE_API_URL_PROD,
    "www.lidshopping.com": import.meta.env.VITE_API_URL_PROD,
    "lid-shop.web.app": import.meta.env.VITE_API_URL_STAGING,
    "localhost:5173": import.meta.env.VITE_API_URL_STAGING,
  };

  const url = map[window.location.hostname];

  if (!url) throw new Error("Domain not authorized");

  return url;
};