import React, { useEffect, useMemo, useState } from "react";
import { FiChevronRight, FiFilter, FiGrid, FiList, FiRotateCcw, FiSliders, FiX } from "react-icons/fi";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "../../../components/ui/Button";
import { Drawer } from "../../../components/ui/Drawer";
import { IconButton } from "../../../components/ui/IconButton";
import { ProductGridSkeleton } from "../../../components/ui/Skeleton";
import { ITEMS_PER_PAGE } from "../../../constants";
import {
  parseDiscoveryParams,
  toggleArrayValue,
  updateDiscoveryParams,
} from "../../discovery/discoveryParams";
import { selectBrands } from "../../brands/BrandSlice";
import { selectCategories } from "../../categories/CategoriesSlice";
import { fetchProducts } from "../ProductApi";
import { ProductCard } from "./ProductCard";

const sortOptions = [
  ["relevance", "Featured"],
  ["newest", "Newest"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
  ["rating", "Best rated"],
  ["discount", "Biggest discount"],
  ["sales", "Best sellers"],
];
const EMPTY_BASE_FILTERS = Object.freeze({});

const CheckList = ({ legend, items, selected, onToggle, getLabel = (item) => item.name }) => {
  if (!items.length) return null;
  return (
    <fieldset className="space-y-3">
      <legend className="text-label text-text-secondary">{legend}</legend>
      <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
        {items.map((item) => {
          const value = String(item._id || item.value || item);
          const label = getLabel(item);
          return (
            <label key={value} className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm text-text-primary transition hover:bg-surface-muted">
              <input type="checkbox" checked={selected.includes(value)} onChange={() => onToggle(value)} className="h-4 w-4 rounded border-default accent-brand-primary" />
              <span className="min-w-0 flex-1 truncate">{label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};

const ChoiceButtons = ({ legend, values, active, onChange, suffix = "" }) => (
  <fieldset>
    <legend className="text-label text-text-secondary">{legend}</legend>
    <div className="mt-3 flex flex-wrap gap-2">
      {values.map((value) => <button key={value} type="button" aria-pressed={active === value} onClick={() => onChange(active === value ? 0 : value)} className={`rounded-pill border px-3 py-2 text-sm font-medium ${active === value ? "border-brand-primary bg-brand-primary text-white" : "border-default bg-surface-raised text-text-primary hover:border-strong"}`}>{value}{suffix}</button>)}
    </div>
  </fieldset>
);

const FilterPanel = ({ filters, apply, categories, brands, colors, sizes, lockedCategoryIds, onClose }) => {
  const categorySelection = lockedCategoryIds.length ? lockedCategoryIds : filters.category;
  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between border-b border-default pb-4">
        <div><p className="text-label text-brand-primary">Refine</p><h2 className="mt-1 text-xl font-semibold text-text-primary">Filters</h2></div>
        {onClose ? <IconButton label="Close filters" onClick={onClose}><FiX /></IconButton> : <FiSliders className="text-text-secondary" />}
      </div>
      {lockedCategoryIds.length ? <p className="rounded-xl border border-default bg-surface-muted p-3 text-sm leading-6 text-text-secondary">This category page keeps its current category scope.</p> : <CheckList legend="Category" items={categories} selected={categorySelection} onToggle={(value) => apply({ category: toggleArrayValue(filters.category, value) })} />}
      <CheckList legend="Brand" items={brands} selected={filters.brand} onToggle={(value) => apply({ brand: toggleArrayValue(filters.brand, value) })} />
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm text-text-secondary">Minimum price<input type="number" min="0" value={filters.minPrice || ""} onChange={(event) => apply({ minPrice: Number(event.target.value) || "" })} className="input-base mt-2" /></label>
        <label className="text-sm text-text-secondary">Maximum price<input type="number" min="0" value={filters.maxPrice || ""} onChange={(event) => apply({ maxPrice: Number(event.target.value) || "" })} className="input-base mt-2" /></label>
      </div>
      <ChoiceButtons legend="Minimum rating" values={[4, 3, 2]} active={filters.rating} onChange={(rating) => apply({ rating })} suffix="+ stars" />
      <ChoiceButtons legend="Minimum discount" values={[10, 25, 40]} active={filters.discount} onChange={(discount) => apply({ discount })} suffix="%+" />
      <CheckList legend="Color" items={colors.map((value) => ({ value }))} selected={filters.color} onToggle={(value) => apply({ color: toggleArrayValue(filters.color, value) })} getLabel={(item) => item.value} />
      <CheckList legend="Size" items={sizes.map((value) => ({ value }))} selected={filters.size} onToggle={(value) => apply({ size: toggleArrayValue(filters.size, value) })} getLabel={(item) => item.value} />
      {[["inStock", "In stock only"], ["trending", "Trending only"], ["bestseller", "Best sellers only"]].map(([key, label]) => (
        <label key={key} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-default bg-surface-raised px-3 text-sm font-medium text-text-primary">
          <input type="checkbox" checked={filters[key]} onChange={(event) => apply({ [key]: event.target.checked })} className="h-4 w-4 accent-brand-primary" />{label}
        </label>
      ))}
    </div>
  );
};

export const ProductList = ({
  title = "All products",
  description = "Explore the current catalogue.",
  baseFilters: incomingBaseFilters,
  headerContent = null,
  breadcrumbs = [{ label: "Home", to: "/" }, { label: "Products" }],
}) => {
  const allBrands = useSelector(selectBrands);
  const categories = useSelector(selectCategories);
  const baseFilters = useMemo(() => incomingBaseFilters || EMPTY_BASE_FILTERS, [incomingBaseFilters]);
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseDiscoveryParams(searchParams), [searchParams]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [status, setStatus] = useState("idle");
  const [retryKey, setRetryKey] = useState(0);
  const lockedCategoryIds = useMemo(() => Array.isArray(baseFilters.category) ? baseFilters.category.map(String) : [], [baseFilters.category]);
  const effectiveCategories = lockedCategoryIds.length ? lockedCategoryIds : filters.category;
  const invalidPrice = filters.minPrice && filters.maxPrice && filters.minPrice > filters.maxPrice;

  const apply = (updates, options) => setSearchParams((current) => updateDiscoveryParams(current, updates, options), { replace: false });
  const request = useMemo(() => ({
    ...baseFilters,
    category: effectiveCategories,
    brand: filters.brand,
    color: filters.color,
    size: filters.size,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    rating: filters.rating || undefined,
    discount: filters.discount || undefined,
    inStock: filters.inStock || undefined,
    trending: filters.trending || undefined,
    bestseller: filters.bestseller || undefined,
    sort: filters.sort,
    pagination: { page: filters.page, limit: ITEMS_PER_PAGE },
  }), [baseFilters, effectiveCategories, filters]);

  useEffect(() => {
    let active = true;
    if (invalidPrice) {
      setProducts([]); setTotalResults(0); setStatus("invalid");
      return () => { active = false; };
    }
    setStatus("pending");
    fetchProducts(request)
      .then((response) => { if (active) { setProducts(Array.isArray(response.data) ? response.data : []); setTotalResults(Number(response.totalResults || 0)); setStatus("fulfilled"); } })
      .catch(() => { if (active) { setProducts([]); setTotalResults(0); setStatus("rejected"); } });
    return () => { active = false; };
  }, [invalidPrice, request, retryKey]);

  const colors = useMemo(() => [...new Set(products.flatMap((product) => product.colors || []))].sort(), [products]);
  const sizes = useMemo(() => [...new Set(products.flatMap((product) => product.sizes || []))].sort(), [products]);
  const totalPages = Math.max(1, Math.ceil(totalResults / ITEMS_PER_PAGE));

  const chips = useMemo(() => {
    const result = [];
    if (!lockedCategoryIds.length) filters.category.forEach((id) => result.push({ key: "category", value: id, label: categories.find((item) => String(item._id) === id)?.name || "Category" }));
    filters.brand.forEach((id) => result.push({ key: "brand", value: id, label: allBrands.find((item) => String(item._id) === id)?.name || "Brand" }));
    filters.color.forEach((value) => result.push({ key: "color", value, label: value }));
    filters.size.forEach((value) => result.push({ key: "size", value, label: `Size ${value}` }));
    if (filters.minPrice) result.push({ key: "minPrice", label: `From ${formatNumber(filters.minPrice)}` });
    if (filters.maxPrice) result.push({ key: "maxPrice", label: `Up to ${formatNumber(filters.maxPrice)}` });
    if (filters.rating) result.push({ key: "rating", label: `${filters.rating}+ stars` });
    if (filters.discount) result.push({ key: "discount", label: `${filters.discount}%+ off` });
    if (filters.inStock) result.push({ key: "inStock", label: "In stock" });
    if (filters.trending) result.push({ key: "trending", label: "Trending" });
    if (filters.bestseller) result.push({ key: "bestseller", label: "Best sellers" });
    return result;
  }, [allBrands, categories, filters, lockedCategoryIds.length]);

  const removeChip = (chip) => {
    if (["category", "brand", "color", "size"].includes(chip.key)) apply({ [chip.key]: filters[chip.key].filter((value) => value !== chip.value) });
    else apply({ [chip.key]: "" });
  };
  const clearFilters = () => apply({ category: [], brand: [], color: [], size: [], minPrice: "", maxPrice: "", rating: "", discount: "", inStock: false, trending: false, bestseller: false });

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-20 pt-7 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
        {breadcrumbs.map((item, index) => <React.Fragment key={`${item.label}-${index}`}>{index ? <FiChevronRight aria-hidden="true" /> : null}{item.to ? <Link to={item.to} className="hover:text-text-primary">{item.label}</Link> : <span aria-current="page" className="text-text-primary">{item.label}</span>}</React.Fragment>)}
      </nav>
      <header className="rounded-[34px] border border-default bg-surface p-6 shadow-md sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl"><p className="text-label text-brand-primary">Product discovery</p><h1 className="mt-3 text-page-title text-text-primary">{title}</h1>{description ? <p className="mt-4 body-copy">{description}</p> : null}</div>
          <div className="flex flex-wrap items-center gap-3"><span className="rounded-pill border border-default bg-surface-muted px-4 py-2 text-sm font-semibold text-text-primary" aria-live="polite">{status === "pending" ? "Updatingâ€¦" : `${totalResults} results`}</span><Button variant="secondary" icon={<FiFilter />} className="xl:hidden" onClick={() => setMobileFiltersOpen(true)}>Filters{chips.length ? ` (${chips.length})` : ""}</Button></div>
        </div>
        {headerContent ? <div className="mt-7 border-t border-default pt-7">{headerContent}</div> : null}
      </header>

      <div className="mt-7 grid gap-7 xl:grid-cols-[292px_minmax(0,1fr)]">
        <aside className="hidden xl:block"><div className="sticky top-28 rounded-[28px] border border-default bg-surface p-5 shadow-sm"><FilterPanel filters={filters} apply={apply} categories={categories} brands={allBrands} colors={colors} sizes={sizes} lockedCategoryIds={lockedCategoryIds} /></div></aside>
        <section className="min-w-0" aria-label="Product results">
          <div className="mb-6 rounded-[26px] border border-default bg-surface p-4 shadow-xs">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                {chips.length ? chips.map((chip) => <button key={`${chip.key}-${chip.value || chip.label}`} type="button" onClick={() => removeChip(chip)} className="inline-flex items-center gap-2 rounded-pill border border-default bg-surface-muted px-3 py-2 text-sm text-text-primary hover:border-strong">{chip.label}<FiX aria-hidden="true" /></button>) : <span className="py-2 text-sm text-text-secondary">No filters applied</span>}
                {chips.length ? <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary"><FiRotateCcw />Clear all</button> : null}
              </div>
              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor="discovery-sort">Sort products</label>
                <select id="discovery-sort" value={filters.sort} onChange={(event) => apply({ sort: event.target.value })} className="input-base min-w-48 py-2.5">{sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                <div className="inline-flex rounded-pill border border-default bg-surface-muted p-1" aria-label="Product view">
                  <IconButton label="Grid view" size="sm" aria-pressed={filters.view === "grid"} onClick={() => apply({ view: "grid" }, { resetPage: false })} className={filters.view === "grid" ? "bg-surface-raised text-brand-primary shadow-xs" : ""}><FiGrid /></IconButton>
                  <IconButton label="List view" size="sm" aria-pressed={filters.view === "list"} onClick={() => apply({ view: "list" }, { resetPage: false })} className={filters.view === "list" ? "bg-surface-raised text-brand-primary shadow-xs" : ""}><FiList /></IconButton>
                </div>
              </div>
            </div>
          </div>

          {status === "pending" ? <ProductGridSkeleton count={8} /> : status === "rejected" ? (
            <div className="rounded-[30px] border border-error/30 bg-surface p-10 text-center" role="alert"><h2 className="text-2xl font-semibold text-text-primary">Products could not be loaded</h2><p className="mt-3 text-text-secondary">Check the connection and try again.</p><Button className="mt-6" onClick={() => setRetryKey((value) => value + 1)}>Try again</Button></div>
          ) : status === "invalid" ? (
            <div className="rounded-[30px] border border-warning/30 bg-surface p-10 text-center" role="alert"><h2 className="text-2xl font-semibold text-text-primary">Price range needs attention</h2><p className="mt-3 text-text-secondary">Minimum price cannot be higher than maximum price.</p><Button className="mt-6" variant="secondary" onClick={() => apply({ minPrice: "", maxPrice: "" })}>Clear price range</Button></div>
          ) : products.length ? (
            <>
              <div className={filters.view === "list" ? "grid gap-5" : "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"}>{products.map((product) => <ProductCard key={product._id} product={product} variant={filters.view} />)}</div>
              {totalPages > 1 ? <nav aria-label="Product pages" className="mt-9 flex flex-wrap items-center justify-center gap-2"><Button variant="secondary" disabled={filters.page <= 1} onClick={() => apply({ page: filters.page - 1 }, { resetPage: false })}>Previous</Button><span className="px-3 text-sm text-text-secondary">Page {filters.page} of {totalPages}</span><Button variant="secondary" disabled={filters.page >= totalPages} onClick={() => apply({ page: filters.page + 1 }, { resetPage: false })}>Next</Button></nav> : null}
            </>
          ) : (
            <div className="rounded-[30px] border border-default bg-surface p-10 text-center"><h2 className="text-2xl font-semibold text-text-primary">No products found</h2><p className="mt-3 text-text-secondary">Try removing a filter or checking the search spelling.</p>{chips.length ? <Button className="mt-6" onClick={clearFilters}>Clear filters</Button> : null}</div>
          )}
        </section>
      </div>

      <Drawer open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)} title="Product filters" className="max-w-md"><div className="h-full overflow-y-auto bg-surface p-5"><FilterPanel filters={filters} apply={apply} categories={categories} brands={allBrands} colors={colors} sizes={sizes} lockedCategoryIds={lockedCategoryIds} onClose={() => setMobileFiltersOpen(false)} /></div></Drawer>
    </div>
  );
};

const formatNumber = (value) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
