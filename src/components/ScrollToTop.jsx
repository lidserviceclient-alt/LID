import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackTrafficHit } from "@/services/traffic";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    trackTrafficHit({ path: pathname });
  }, [pathname]);

  return null;
}
