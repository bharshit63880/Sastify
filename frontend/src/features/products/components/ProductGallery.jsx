import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiX, FiZoomIn } from "react-icons/fi";
import { IconButton } from "../../../components/ui/IconButton";
import { ImageWithFallback } from "../../../components/ui/ImageWithFallback";
import { useBodyScrollLock } from "../../../hooks/useBodyScrollLock";
import { useFocusTrap } from "../../../hooks/useFocusTrap";

const Media = ({ item, name, eager = false, zoomed = false }) => {
  if (item?.type?.startsWith("video")) {
    return (
      <video
        className="h-full w-full object-contain"
        controls
        muted
        loop
        playsInline
        poster={item.poster}
        preload="metadata"
      >
        <source src={item.src} type={item.type} />
        {item.poster ? <img src={item.poster} alt={name} /> : null}
      </video>
    );
  }

  return (
    <ImageWithFallback
      src={item?.src}
      alt={name}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      wrapperClassName="h-full w-full"
      className={`object-contain transition-transform duration-500 ${zoomed ? "scale-[1.7]" : "scale-100"}`}
    />
  );
};

export const ProductGallery = ({ media, name }) => {
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const dialogRef = useRef(null);
  const startX = useRef(null);
  const items = media.length ? media : [{ type: "image", src: "" }];

  const move = useCallback((direction) => {
    setZoomed(false);
    setActive((current) => (current + direction + items.length) % items.length);
  }, [items.length]);

  useBodyScrollLock(fullscreen);
  useFocusTrap(dialogRef, fullscreen);

  useEffect(() => {
    if (!fullscreen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setFullscreen(false);
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, move]);

  const stage = (isDialog = false) => (
    <div
      className={`relative overflow-hidden ${isDialog ? "h-[min(78vh,760px)]" : "aspect-square rounded-2xl bg-surface-raised"}`}
      onTouchStart={(event) => { startX.current = event.touches[0].clientX; }}
      onTouchEnd={(event) => {
        if (startX.current == null) return;
        const delta = event.changedTouches[0].clientX - startX.current;
        if (Math.abs(delta) > 45) move(delta > 0 ? -1 : 1);
        startX.current = null;
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${active}-${isDialog}`}
          className="h-full w-full cursor-zoom-in p-4 sm:p-8"
          initial={reducedMotion ? false : { opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, x: -18 }}
          transition={{ duration: 0.22 }}
          onClick={() => items[active]?.type === "image" && setZoomed((value) => !value)}
        >
          <Media item={items[active]} name={`${name}, view ${active + 1}`} eager={active === 0} zoomed={zoomed} />
        </motion.div>
      </AnimatePresence>
      {items.length > 1 ? (
        <>
          <IconButton label="Previous image" onClick={() => move(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-surface-glass"><FiChevronLeft /></IconButton>
          <IconButton label="Next image" onClick={() => move(1)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-surface-glass"><FiChevronRight /></IconButton>
        </>
      ) : null}
      {!isDialog ? (
        <div className="absolute right-3 top-3 flex gap-2">
          {items[active]?.type === "image" ? <IconButton label={zoomed ? "Reset image zoom" : "Zoom image"} onClick={() => setZoomed((value) => !value)} className="bg-surface-glass"><FiZoomIn /></IconButton> : null}
          <IconButton label="Open fullscreen gallery" onClick={() => setFullscreen(true)} className="bg-surface-glass"><FiMaximize2 /></IconButton>
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-[76px_1fr]">
        <div className="order-2 flex gap-2 overflow-x-auto pb-1 sm:order-1 sm:flex-col sm:overflow-y-auto">
          {items.map((item, index) => (
            <button
              key={`${item.src}-${index}`}
              type="button"
              aria-label={`Show ${item.type.startsWith("video") ? "video" : "image"} ${index + 1}`}
              aria-current={active === index}
              onClick={() => { setActive(index); setZoomed(false); }}
              className={`h-[72px] w-[64px] shrink-0 overflow-hidden rounded-lg border-2 bg-surface-raised p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${active === index ? "border-brand-primary" : "border-default"}`}
            >
              {item.type.startsWith("video") ? <span className="grid h-full place-items-center text-xs font-semibold text-text-primary">Video</span> : <Media item={item} name="" />}
            </button>
          ))}
        </div>
        <div className="order-1 sm:order-2">{stage()}</div>
      </div>

      <AnimatePresence>
        {fullscreen ? (
          <motion.div className="fixed inset-0 z-modal grid place-items-center bg-black/90 p-3 sm:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={`${name} fullscreen gallery`} className="relative w-full max-w-6xl">
              <IconButton label="Close fullscreen gallery" onClick={() => setFullscreen(false)} className="absolute right-3 top-3 z-10 border-white/20 bg-black/50 text-white"><FiX /></IconButton>
              {stage(true)}
              <p className="mt-3 text-center text-sm text-white/70">{active + 1} / {items.length}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};
