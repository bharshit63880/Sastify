import React from "react";
import { cn } from "../../utils/cn";

export const GlassPanel = React.forwardRef(
  ({ as: Element = "div", variant = "subtle", className = "", children, ...props }, ref) => (
    <Element ref={ref} className={cn("glass-panel rounded-2xl", `glass-panel--${variant}`, className)} {...props}>
      {children}
    </Element>
  )
);

GlassPanel.displayName = "GlassPanel";
