import React, { useEffect, useState } from "react";
import { FiArrowUp } from "react-icons/fi";
import { IconButton } from "./ui/IconButton";
import { useReducedMotionPreference } from "../hooks/useReducedMotionPreference";

export const BackToTop = () => {
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotionPreference();
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 650);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visible) return null;
  return <IconButton label="Back to top" variant="glass" className="fixed bottom-24 right-4 z-sticky shadow-glass lg:bottom-6" onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })}><FiArrowUp /></IconButton>;
};
