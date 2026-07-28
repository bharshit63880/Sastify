import React from "react";
import { cn } from "../../utils/cn";

const shapeClasses = {
  text: "h-4 rounded-pill",
  circle: "aspect-square rounded-full",
  rectangle: "rounded-sm",
  rounded: "rounded-lg",
  button: "h-11 rounded-pill",
  image: "aspect-[4/5] rounded-xl",
};

export const Skeleton = ({ shape = "rounded", className = "", width, height, ...props }) => (
  <span
    className={cn("skeleton block", shapeClasses[shape] || shapeClasses.rounded, className)}
    style={{ width, height }}
    aria-hidden="true"
    {...props}
  />
);

export const ProductCardSkeleton = () => (
  <div className="space-y-4 rounded-2xl border border-default bg-surface p-4 shadow-xs">
    <Skeleton shape="image" />
    <Skeleton shape="text" className="w-2/3" />
    <Skeleton shape="text" className="w-5/6" />
    <div className="flex items-center justify-between gap-4"><Skeleton shape="text" className="h-6 w-1/3" /><Skeleton shape="button" className="w-24" /></div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: count }, (_, index) => <ProductCardSkeleton key={index} />)}
  </div>
);

export const HeroSkeleton = () => (
  <div className="grid min-h-[430px] gap-8 rounded-2xl border border-default bg-surface p-6 md:grid-cols-2 md:p-10">
    <div className="flex flex-col justify-center gap-5"><Skeleton shape="text" className="h-5 w-28" /><Skeleton shape="rounded" className="h-16 w-11/12" /><Skeleton shape="text" className="w-4/5" /><Skeleton shape="button" className="w-36" /></div>
    <Skeleton shape="rounded" className="min-h-64" />
  </div>
);

export const CartItemSkeleton = () => (
  <div className="flex gap-4 rounded-xl border border-default bg-surface p-4">
    <Skeleton shape="rounded" className="h-24 w-20 shrink-0" />
    <div className="flex flex-1 flex-col gap-3"><Skeleton shape="text" className="w-2/3" /><Skeleton shape="text" className="w-1/3" /><Skeleton shape="button" className="mt-auto w-28" /></div>
  </div>
);

export const CheckoutSummarySkeleton = () => (
  <div className="space-y-4 rounded-2xl border border-default bg-surface p-6">
    <Skeleton shape="text" className="h-6 w-1/2" />
    {Array.from({ length: 4 }, (_, index) => <div className="flex justify-between gap-6" key={index}><Skeleton shape="text" className="w-1/3" /><Skeleton shape="text" className="w-20" /></div>)}
    <Skeleton shape="button" className="w-full" />
  </div>
);

export const TableSkeleton = ({ rows = 6, columns = 4 }) => (
  <div className="overflow-hidden rounded-2xl border border-default bg-surface" role="status" aria-label="Loading table">
    {Array.from({ length: rows }, (_, row) => (
      <div className="grid gap-4 border-b border-default p-4 last:border-b-0" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }} key={row}>
        {Array.from({ length: columns }, (_, column) => <Skeleton shape="text" key={column} />)}
      </div>
    ))}
  </div>
);

export const SkeletonRegion = ({ label = "Loading content", children }) => (
  <div role="status" aria-live="polite" aria-busy="true">
    <span className="sr-only">{label}</span>
    {children}
  </div>
);
