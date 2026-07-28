import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../utils/cn";

export const NeumorphicButton = React.forwardRef(
  ({ children, className = "", iconOnly = false, loading = false, disabled = false, type = "button", ...props }, ref) => {
    const reduceMotion = useReducedMotion();
    const isDisabled = disabled || loading;
    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        whileTap={!reduceMotion && !isDisabled ? { scale: 0.96 } : undefined}
        className={cn(
          "neumorphic-control inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-4 text-sm font-semibold",
          "transition-[color,transform,box-shadow,opacity] duration-fast focus-visible:outline-none",
          iconOnly && "h-11 w-11 p-0",
          isDisabled && "cursor-not-allowed opacity-50",
          className
        )}
        {...props}
      >
        {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" /> : children}
      </motion.button>
    );
  }
);

NeumorphicButton.displayName = "NeumorphicButton";
