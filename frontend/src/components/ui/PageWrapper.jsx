import React from "react";
import { cn } from "../../utils/cn";

export const PageWrapper = ({ className = "", children, contained = true, as: Element = "div", ...props }) => {
  return (
    <Element
      className={cn(
        "relative space-y-10 pb-16 pt-8 md:space-y-14 md:pt-10",
        contained && "mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    >
      {children}
    </Element>
  );
};
