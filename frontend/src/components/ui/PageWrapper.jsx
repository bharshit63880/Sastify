import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../utils/cn";
import { pageTransition, reducedMotionVariants } from "./motion";

export const PageWrapper = ({ className = "", children, contained = true, as: Element = "div", ...props }) => {
  const reduceMotion = useReducedMotion();
  const Component = typeof Element === "string" && motion[Element] ? motion[Element] : motion(Element);
  return (
    <Component
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={reduceMotion ? reducedMotionVariants : pageTransition}
      className={cn(
        "relative space-y-10 pb-16 pt-8 md:space-y-14 md:pt-10",
        contained && "mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
