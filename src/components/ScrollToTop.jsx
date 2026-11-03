import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { scrollToTopNow } from "@/utils/scrollTop";
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
    scrollToTopNow();
    trackTrafficHit({ path: pathname });
  }, [pathname]);

  return null;
}
