import React, { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Overlay } from "./Overlay";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { drawerMotion, reducedMotionVariants } from "./motion";
import { cn } from "../../utils/cn";

export const Drawer = ({ open, onClose, title, children, side = "right", className = "" }) => {
  const ref = useRef(null);
  const titleId = useId();
  const reduceMotion = useReducedMotion();
  useBodyScrollLock(open);
  useFocusTrap(ref, open);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => event.key === "Escape" && onClose?.();
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [onClose, open]);

  const directional = side === "left"
    ? { hidden: { x: "-100%" }, visible: drawerMotion.visible, exit: { x: "-100%", transition: drawerMotion.exit.transition } }
    : drawerMotion;

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-drawer">
          <Overlay onClick={onClose} />
          <motion.aside
            ref={ref}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={reduceMotion ? reducedMotionVariants : directional}
            className={cn(
              "absolute inset-y-0 flex w-full max-w-[440px] flex-col border-glass bg-glass shadow-lg backdrop-blur-2xl",
              side === "left" ? "left-0 border-r" : "right-0 border-l",
              className
            )}
          >
            <h2 id={titleId} className="sr-only">{title}</h2>
            {children}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
};
