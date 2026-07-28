import React from "react";
import { cn } from "../../utils/cn";

const widths = {
  standard: "max-w-[1280px]",
  wide: "max-w-[1480px]",
  full: "max-w-none",
};

export const Container = ({ as: Element = "div", className = "", children, size = "standard", padded = true, ...props }) => (
  <Element
    className={cn("mx-auto w-full", widths[size] || widths.standard, padded && "px-4 sm:px-6 lg:px-8", className)}
    {...props}
  >
    {children}
  </Element>
);
