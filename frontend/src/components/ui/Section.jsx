import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../utils/cn";
import { fadeUp, reducedMotionVariants, staggerContainer, viewportOnce } from "./motion";

export const Section = ({ className = "", children, as: Element = "section", ...props }) => {
  const reduceMotion = useReducedMotion();
  const Component = typeof Element === "string" && motion[Element] ? motion[Element] : motion(Element);
  return (
    <Component
      variants={reduceMotion ? reducedMotionVariants : staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className={cn("relative py-10 md:py-12", className)}
      {...props}
    >
      {children}
    </Component>
  );
};

export const SectionIntro = ({ eyebrow, title, description, action }) => (
  <motion.div variants={fadeUp} className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div className="max-w-3xl space-y-3">
      {eyebrow ? <span className="text-label inline-flex rounded-pill border border-default bg-surface-raised px-3.5 py-1.5 text-secondary shadow-xs">{eyebrow}</span> : null}
      <h2 className="section-title text-primary">{title}</h2>
      {description ? <p className="body-copy max-w-2xl">{description}</p> : null}
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </motion.div>
);
