import React from "react";
import { cn } from "../../utils/cn";
import { formatPrice } from "../../utils/currencyFormatter";
import { DiscountBadge } from "./Badges";

const sizes = { sm: "text-base", md: "text-xl", lg: "text-price" };

export const PriceDisplay = ({ price, originalPrice, discountPercentage, size = "md", className = "" }) => (
  <div className={cn("flex flex-wrap items-baseline gap-2", className)} aria-label={`Price ${formatPrice(price)}`}>
    <span className={cn("font-bold tracking-tight text-text-primary", sizes[size] || sizes.md)}>{formatPrice(price)}</span>
    {originalPrice > price ? <span className="text-sm text-muted line-through" aria-label={`Original price ${formatPrice(originalPrice)}`}>{formatPrice(originalPrice)}</span> : null}
    {discountPercentage > 0 ? <DiscountBadge discount={discountPercentage} /> : null}
  </div>
);
