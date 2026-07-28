import React, { useEffect, useState } from "react";
import { fetchRecentlyViewedProducts } from "../recentlyViewed";
import { ProductShelf } from "./ProductShelf";

export const RecentlyViewed = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchRecentlyViewedProducts()
      .then((items) => active && setProducts(items))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  if (!loading && !products.length) return null;
  return (
    <ProductShelf
      id="recently-viewed"
      eyebrow="Pick up where you left off"
      title="Recently viewed"
      description="Products viewed on this device."
      products={products}
      loading={loading}
    />
  );
};
