import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductList } from "../features/products/components/ProductList";

export const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const baseFilters = useMemo(() => ({ search: query }), [query]);

  return (
    <ProductList
      title={query ? `Search results for “${query}”` : "Search products and categories"}
      description={query ? "Refine the current search with filters and sorting." : "Enter a search term from the global search command."}
      baseFilters={baseFilters}
      breadcrumbs={[{ label: "Home", to: "/" }, { label: "Search" }]}
    />
  );
};
