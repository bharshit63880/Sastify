import React from "react";
import { Button } from "./Button";
import { NeumorphicButton } from "./NeumorphicButton";
import { cn } from "../../utils/cn";

const sizeClasses = { sm: "h-9 w-9", md: "h-11 w-11", lg: "h-[52px] w-[52px]" };

export const IconButton = React.forwardRef(
  ({ label, children, size = "md", variant = "ghost", className = "", loading = false, ...props }, ref) => {
    if (process.env.NODE_ENV !== "production" && !label) {
      console.warn("IconButton requires a label for accessibility.");
    }
    if (variant === "neumorphic") {
      return (
        <NeumorphicButton
          ref={ref}
          iconOnly
          loading={loading}
          aria-label={label || "Icon action"}
          title={label}
          className={cn(sizeClasses[size], className)}
          {...props}
        >
          {children}
        </NeumorphicButton>
      );
    }
    return (
      <Button
        ref={ref}
        variant={variant === "glass" ? "glass" : "ghost"}
        size="icon"
        loading={loading}
        aria-label={label || "Icon action"}
        title={label}
        className={cn(sizeClasses[size], className)}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";
