import React from "react";
import { HeroSkeleton, ProductGridSkeleton, SkeletonRegion } from "./ui/Skeleton";

export const RouteFallback = ({ compact = false }) => (
  <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
    <SkeletonRegion label="Loading page">
      {compact ? <ProductGridSkeleton count={4} /> : <div className="space-y-8"><HeroSkeleton /><ProductGridSkeleton count={4} /></div>}
    </SkeletonRegion>
  </div>
);
