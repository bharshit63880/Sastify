import React from "react";
import { FiStar } from "react-icons/fi";
import { cn } from "../../utils/cn";

const tones = {
  rating: "bg-warning/15 text-warning",
  stock: "bg-info/12 text-info",
  discount: "bg-success/14 text-success",
  success: "bg-success/14 text-success",
  warning: "bg-warning/15 text-warning",
  error: "bg-error/14 text-error",
  neutral: "bg-surface-muted text-text-secondary",
};

export const Badge = ({ variant = "neutral", className = "", children, ...props }) => (
  <span className={cn("inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-semibold", tones[variant] || tones.neutral, className)} {...props}>
    {children}
  </span>
);

export const RatingBadge = ({ rating, ...props }) => <Badge variant="rating" {...props}><FiStar className="fill-current" aria-hidden="true" />{rating}</Badge>;
export const StockBadge = ({ inStock = true, children, ...props }) => <Badge variant={inStock ? "stock" : "error"} {...props}>{children || (inStock ? "In stock" : "Out of stock")}</Badge>;
export const DiscountBadge = ({ discount, children, ...props }) => <Badge variant="discount" {...props}>{children || `${discount}% off`}</Badge>;
export const SuccessBadge = (props) => <Badge variant="success" {...props} />;
export const WarningBadge = (props) => <Badge variant="warning" {...props} />;
export const ErrorBadge = (props) => <Badge variant="error" {...props} />;
