import React, { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Overlay } from "./Overlay";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { modalMotion, reducedMotionVariants } from "./motion";
import { cn } from "../../utils/cn";

export const Dialog = ({ open, onClose, title, description, children, className = "", initialFocusRef, fullScreenMobile = false }) => {
  const ref = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  const reduceMotion = useReducedMotion();
  useBodyScrollLock(open);
  useFocusTrap(ref, open, { initialFocusRef });

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => event.key === "Escape" && onClose?.();
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-3 sm:p-6">
          <Overlay onClick={onClose} />
          <motion.section
            ref={ref}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            variants={reduceMotion ? reducedMotionVariants : modalMotion}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "relative z-10 max-h-[min(90vh,800px)] w-full max-w-3xl overflow-hidden rounded-2xl border border-glass bg-glass shadow-lg backdrop-blur-2xl",
              fullScreenMobile && "max-sm:h-full max-sm:max-h-none max-sm:rounded-none",
              className
            )}
          >
            <h2 id={titleId} className="sr-only">{title}</h2>
            {description ? <p id={descriptionId} className="sr-only">{description}</p> : null}
            {children}
          </motion.section>
        </div>
      ) : null}
    </AnimatePresence>
  );
};
