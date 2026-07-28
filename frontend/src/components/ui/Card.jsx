import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../utils/cn";
import { cardHover } from "./motion";

const variants = {
  default: "border border-default bg-surface shadow-sm",
  elevated: "border border-default bg-surface-raised shadow-lg",
  outlined: "border border-strong bg-transparent shadow-none",
  glass: "glass-panel glass-panel--subtle",
  interactive: "border border-default bg-surface shadow-sm hover:border-strong hover:shadow-md",
};

export const Card = ({
  as: Element = "div",
  className = "",
  children,
  hover = true,
  variant = "default",
  padding = true,
  ...props
}) => {
  const reduceMotion = useReducedMotion();
  const Component = typeof Element === "string" && motion[Element] ? motion[Element] : motion(Element);
  return (
    <Component
      initial="rest"
      animate="rest"
      whileHover={hover && !reduceMotion ? "hover" : undefined}
      variants={cardHover}
      className={cn("rounded-2xl", variants[variant] || variants.default, padding && "p-6", className)}
      {...props}
    >
      {children}
    </Component>
  );
};
