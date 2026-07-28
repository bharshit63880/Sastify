import React, { useEffect, useState } from "react";

export const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let ticking = false;
    const update = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
        ticking = false;
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);
  return <div className="pointer-events-none fixed inset-x-0 top-0 z-toast h-0.5 origin-left bg-brand-gradient" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />;
};
