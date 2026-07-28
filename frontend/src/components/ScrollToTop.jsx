import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export const ScrollToTop = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (location.hash) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView();
      return;
    }
    if (navigationType !== "POP") window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.hash, location.pathname, navigationType]);

  return null;
};
