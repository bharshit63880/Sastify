import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiArrowRight, FiClock, FiSearch, FiTrendingUp, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Dialog } from "../../../components/ui/Dialog";
import { IconButton } from "../../../components/ui/IconButton";
import { ImageWithFallback } from "../../../components/ui/ImageWithFallback";
import { Skeleton } from "../../../components/ui/Skeleton";
import { formatPrice } from "../../../utils/currencyFormatter";
import { RECENT_SEARCH_STORAGE_KEY } from "../../../constants";
import { fetchSearchSuggestions } from "../SearchApi";
import { useAppShell } from "../../shell/AppShellContext";

const emptyResults = { products: [], categories: [], brands: [], trending: [] };
const MAX_RECENT = 6;

const readRecent = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_SEARCH_STORAGE_KEY) || "[]").slice(0, MAX_RECENT); }
  catch { return []; }
};

const saveRecent = (term) => {
  if (!term) return;
  const next = [term, ...readRecent().filter((item) => item.toLowerCase() !== term.toLowerCase())].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_SEARCH_STORAGE_KEY, JSON.stringify(next));
};

export const SearchCommand = () => {
  const navigate = useNavigate();
  const { isSearchOpen, closeOverlay } = useAppShell();
  const inputRef = useRef(null);
  const requestId = useRef(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(emptyResults);
  const [status, setStatus] = useState("idle");
  const [recent, setRecent] = useState(readRecent);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (!isSearchOpen) return undefined;
    setRecent(readRecent());
    const id = ++requestId.current;
    const timer = window.setTimeout(async () => {
      setStatus("pending");
      try {
        const data = await fetchSearchSuggestions({ query: query.trim(), limit: 6 });
        if (id === requestId.current) {
          setResults({ ...emptyResults, ...data });
          setStatus("fulfilled");
        }
      } catch {
        if (id === requestId.current) setStatus("rejected");
      }
    }, query.trim().length >= 2 ? 260 : 0);
    return () => window.clearTimeout(timer);
  }, [isSearchOpen, query]);

  useEffect(() => {
    if (!isSearchOpen) {
      requestId.current += 1;
      setQuery("");
      setResults(emptyResults);
      setActiveIndex(-1);
    }
  }, [isSearchOpen]);

  const options = useMemo(() => [
    ...results.products.map((item) => ({ type: "product", id: item._id, label: item.name || item.title, item, to: `/products/${item._id}` })),
    ...results.categories.map((item) => ({ type: "category", id: item._id, label: item.name, item, to: `/category/${item.slug}` })),
    ...results.brands.map((item) => ({ type: "brand", id: item._id, label: item.name, item, to: `/products?brand=${item._id}` })),
  ], [results]);

  const openOption = (option) => {
    if (!option) return;
    saveRecent(query.trim() || option.label);
    navigate(option.to);
    closeOverlay();
  };

  const submitSearch = () => {
    const term = query.trim();
    if (!term) return;
    saveRecent(term);
    navigate(`/search?q=${encodeURIComponent(term)}`);
    closeOverlay();
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      activeIndex >= 0 ? openOption(options[activeIndex]) : submitSearch();
    }
  };

  return (
    <Dialog open={isSearchOpen} onClose={closeOverlay} title="Search Sastify" description="Search products, categories, and brands" initialFocusRef={inputRef} fullScreenMobile>
      <div className="flex h-full max-h-[min(88vh,760px)] flex-col">
        <div className="flex items-center gap-3 border-b border-default p-4 sm:p-5">
          <FiSearch className="shrink-0 text-xl text-brand-primary" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => { setQuery(event.target.value); setActiveIndex(-1); }}
            onKeyDown={onKeyDown}
            placeholder="Search products, categories, and brands"
            className="min-w-0 flex-1 bg-transparent text-base text-text-primary outline-none placeholder:text-muted sm:text-lg"
            role="combobox"
            aria-expanded={options.length > 0}
            aria-controls="search-command-results"
            aria-activedescendant={activeIndex >= 0 ? `search-option-${activeIndex}` : undefined}
            aria-autocomplete="list"
          />
          {query ? <IconButton label="Clear search" size="sm" onClick={() => setQuery("")}><FiX /></IconButton> : null}
          <IconButton label="Close search" size="sm" onClick={closeOverlay}><FiX /></IconButton>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5" id="search-command-results" role="listbox">
          <div className="sr-only" aria-live="polite">
            {activeIndex >= 0 ? `${options[activeIndex]?.label}, ${activeIndex + 1} of ${options.length}` : `${options.length} results`}
          </div>
          {status === "pending" ? (
            <div className="space-y-3" role="status" aria-label="Loading search suggestions">
              {Array.from({ length: 5 }, (_, index) => <div className="flex gap-3 rounded-xl p-3" key={index}><Skeleton shape="rounded" className="h-14 w-14 shrink-0" /><div className="flex-1 space-y-2"><Skeleton shape="text" className="w-2/3" /><Skeleton shape="text" className="w-1/3" /></div></div>)}
            </div>
          ) : status === "rejected" ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
              <p className="font-semibold text-text-primary">Search is temporarily unavailable</p>
              <button type="button" className="text-sm font-semibold text-brand-primary" onClick={() => setQuery((value) => `${value} `)}>Try again</button>
            </div>
          ) : options.length ? (
            <div className="space-y-1">
              {options.map((option, index) => (
                <button
                  key={`${option.type}-${option.id}`}
                  id={`search-option-${index}`}
                  role="option"
                  aria-selected={activeIndex === index}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => openOption(option)}
                  className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-surface-muted aria-selected:bg-surface-muted"
                >
                  {option.type === "product" ? (
                    <ImageWithFallback src={option.item.thumbnail || option.item.images?.[0]} alt="" wrapperClassName="h-14 w-14 shrink-0 rounded-lg" className="object-cover" />
                  ) : <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-primary"><FiSearch /></span>}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-text-primary">{option.label}</span>
                    <span className="text-small">{option.type === "product" ? formatPrice(option.item.price) : option.type}</span>
                  </span>
                  <FiArrowRight className="text-muted" aria-hidden="true" />
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-7">
              {recent.length ? <TermSection icon={<FiClock />} title="Recent searches" terms={recent} onTerm={(term) => { setQuery(term); }} onClear={() => { localStorage.removeItem(RECENT_SEARCH_STORAGE_KEY); setRecent([]); }} /> : null}
              {results.trending?.length ? <TermSection icon={<FiTrendingUp />} title="Trending searches" terms={results.trending} onTerm={setQuery} /> : null}
              {!recent.length && !results.trending?.length && query.length >= 2 ? <p className="py-16 text-center text-text-secondary">No suggestions found. Press Enter to search for “{query}”.</p> : null}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

const TermSection = ({ icon, title, terms, onTerm, onClear }) => (
  <section>
    <div className="mb-3 flex items-center justify-between gap-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">{icon}{title}</h3>
      {onClear ? <button type="button" onClick={onClear} className="text-xs font-semibold text-text-secondary hover:text-text-primary">Clear</button> : null}
    </div>
    <div className="flex flex-wrap gap-2">
      {terms.map((term) => <button type="button" key={term} onClick={() => onTerm(term)} className="rounded-pill border border-default bg-surface-raised px-3 py-2 text-sm text-text-secondary hover:border-strong hover:text-text-primary">{term}</button>)}
    </div>
  </section>
);
