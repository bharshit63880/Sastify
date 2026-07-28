import React from "react";
import { ProductGridSkeleton, SkeletonRegion } from "./ui/Skeleton";

export const LoadingState = ({ cards = 8, label = "Loading products" }) => (
  <SkeletonRegion label={label}>
    <ProductGridSkeleton count={cards} />
  </SkeletonRegion>
);
