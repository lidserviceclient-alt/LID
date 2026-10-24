export const getApiBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;

  if (!url) throw new Error("VITE_API_URL environment variable is not set");

  return url;
};
