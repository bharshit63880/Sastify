import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../utils/cn";

export const Overlay = ({ className = "", onClick, ...props }) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      className={cn("fixed inset-0 bg-overlay backdrop-blur-sm", className)}
      onClick={onClick}
      {...props}
    />
  );
};
