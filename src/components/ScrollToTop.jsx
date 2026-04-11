import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackTrafficHit } from "@/services/traffic";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === "undefined" || !window.history) return undefined;
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    trackTrafficHit({ path: pathname });
  }, [pathname]);

  return null;
}
