import React, { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { FiCheck, FiHeart, FiMinus, FiPlus, FiShare2, FiShoppingBag, FiStar, FiTruck } from "react-icons/fi";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { EmptyState } from "../../../components/EmptyState";
import { Button } from "../../../components/ui/Button";
import { PageWrapper } from "../../../components/ui/PageWrapper";
import { Skeleton, SkeletonRegion } from "../../../components/ui/Skeleton";
import { formatPrice } from "../../../utils/currencyFormatter";
import { selectLoggedInUser } from "../../auth/AuthSlice";
import { addGuestCartItem, addToCartAsync } from "../../cart/CartSlice";
import { ProductShelf } from "../../home/components/ProductShelf";
import { fetchRecentlyViewedProducts, rememberViewedProduct } from "../../home/recentlyViewed";
import { fetchReviewsByProductIdAsync, selectReviewErrors, selectReviewFetchStatus, selectReviews } from "../../review/ReviewSlice";
import { ReviewExperience } from "../../review/components/ReviewExperience";
import { createWishlistItemAsync, deleteWishlistItemByIdAsync, selectWishlistItems } from "../../wishlist/WishlistSlice";
import { clearSelectedProduct, fetchProductByIdAsync, selectProductErrors, selectProductFetchStatus, selectSelectedProduct } from "../ProductSlice";
import { ProductGallery } from "./ProductGallery";
import { getProductMedia, getProductName, getProductStock, validateProductSelection } from "../productDetailPresentation";

const ProductDetailsSkeleton = () => (
  <PageWrapper className="py-6"><SkeletonRegion label="Loading product details"><div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]"><Skeleton className="aspect-square rounded-2xl" /><div className="space-y-5">{[32, 72, 24, 52, 120, 52].map((height, index) => <Skeleton key={index} style={{ height }} className="w-full rounded-xl" />)}</div></div></SkeletonRegion></PageWrapper>
);

const Seo = ({ product }) => {
  const location = useLocation();
  useEffect(() => {
    const name = getProductName(product);
    const title = product.seoTitle || `${name} | Sastify`;
    const description = product.seoDescription || product.shortDescription || product.description || "";
    document.title = title;
    const setMeta = (selector, attrs) => {
      let node = document.head.querySelector(selector);
      if (!node) { node = document.createElement("meta"); document.head.appendChild(node); }
      Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    };
    setMeta('meta[name="description"]', { name: "description", content: description.slice(0, 160) });
    setMeta('meta[property="og:title"]', { property: "og:title", content: title });
    setMeta('meta[property="og:description"]', { property: "og:description", content: description.slice(0, 160) });
    setMeta('meta[property="og:type"]', { property: "og:type", content: "product" });
    setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    const canonical = `${window.location.origin}${location.pathname}`;
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
    link.href = canonical;
    const data = {
      "@context": "https://schema.org", "@type": "Product", name,
      image: getProductMedia(product).filter((item) => item.type === "image").map((item) => item.src),
      description, sku: product.sku || product._id,
      brand: product.brand?.name ? { "@type": "Brand", name: product.brand.name } : undefined,
      offers: { "@type": "Offer", priceCurrency: "INR", price: product.price, availability: getProductStock(product) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: canonical },
    };
    if (Number(product.rating) > 0 && Number(product.reviewCount) > 0) data.aggregateRating = { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount };
    let script = document.getElementById("product-json-ld");
    if (!script) { script = document.createElement("script"); script.id = "product-json-ld"; script.type = "application/ld+json"; document.head.appendChild(script); }
    script.textContent = JSON.stringify(data);
    return () => script?.remove();
  }, [location.pathname, product]);
  return null;
};

export const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const product = useSelector(selectSelectedProduct);
  const productStatus = useSelector(selectProductFetchStatus);
  const productError = useSelector(selectProductErrors);
  const reviews = useSelector(selectReviews);
  const reviewStatus = useSelector(selectReviewFetchStatus);
  const reviewError = useSelector(selectReviewErrors);
  const loggedInUser = useSelector(selectLoggedInUser);
  const wishlistItems = useSelector(selectWishlistItems);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState({});
  const [shared, setShared] = useState(false);
  const [recent, setRecent] = useState([]);
  const purchaseRef = useRef(null);

  useEffect(() => {
    dispatch(fetchProductByIdAsync(id));
    dispatch(fetchReviewsByProductIdAsync(id));
    return () => dispatch(clearSelectedProduct());
  }, [dispatch, id]);

  useEffect(() => {
    if (!product?._id) return;
    rememberViewedProduct(product._id);
    fetchRecentlyViewedProducts().then((items) => setRecent(items.filter((item) => item._id !== product._id))).catch(() => setRecent([]));
    setColor(""); setSize(""); setQuantity(1); setErrors({});
  }, [product?._id]);

  const name = getProductName(product);
  const stock = getProductStock(product);
  const media = useMemo(() => getProductMedia(product), [product]);
  const isWishlisted = wishlistItems.some((item) => item.product?._id === product?._id);
  const infoGroups = [
    { title: "Specifications", items: product?.specs?.map((item) => `${item.label}: ${item.value}`) },
    { title: "Features", items: product?.highlights },
    { title: "Shipping", text: product?.shippingText },
    { title: "Returns", text: product?.returnPolicy },
    { title: "Warranty", text: product?.warranty },
  ].filter((group) => group.text || group.items?.length);

  const purchase = (buyNow = false) => {
    const nextErrors = validateProductSelection({ product, color, size, quantity });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      purchaseRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
      return;
    }
    const payload = { product: product._id, quantity, color, size };
    if (loggedInUser) dispatch(addToCartAsync(payload));
    else dispatch(addGuestCartItem({ product, quantity, color, size }));
    if (buyNow) navigate(loggedInUser ? "/checkout" : "/login", { state: { from: "/checkout" } });
  };

  const toggleWishlist = () => {
    if (!loggedInUser) return navigate("/login");
    const entry = wishlistItems.find((item) => item.product?._id === product._id);
    return entry ? dispatch(deleteWishlistItemByIdAsync(entry._id)) : dispatch(createWishlistItemAsync({ product: product._id }));
  };

  const share = async () => {
    const data = { title: name, text: product.shortDescription || product.description, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else await navigator.clipboard.writeText(data.url);
      setShared(true); window.setTimeout(() => setShared(false), 2200);
    } catch (error) {
      if (error?.name !== "AbortError") {
        await navigator.clipboard?.writeText(data.url);
        setShared(true);
      }
    }
  };

  if (productStatus === "pending" || (productStatus === "idle" && !product)) return <ProductDetailsSkeleton />;
  if (productStatus === "rejected" || !product?._id) return (
    <EmptyState
      title="Product unavailable"
      description={productError?.message || "This product may have moved or is temporarily unavailable."}
      actionLabel="Try again"
      onAction={() => dispatch(fetchProductByIdAsync(id))}
      secondaryActionLabel="Browse categories"
      secondaryActionTo="/products"
    />
  );

  const purchasePanel = (
    <div ref={purchaseRef} className="space-y-6">
      <div>
        <p className="text-label text-brand-primary">{product.brand?.name || product.brandName || "Brand"}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-text-primary sm:text-5xl">{name}</h1>
        {product.shortDescription ? <p className="mt-4 text-base leading-7 text-text-secondary">{product.shortDescription}</p> : null}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
          {Number(product.rating) > 0 ? <span className="inline-flex items-center gap-1"><FiStar className="fill-warning text-warning" /><strong className="text-text-primary">{Number(product.rating).toFixed(1)}</strong></span> : null}
          {Number(product.reviewCount || reviews.length) > 0 ? <a href="#reviews" className="underline-offset-4 hover:underline">{product.reviewCount || reviews.length} reviews</a> : null}
          <span className={stock ? "text-success" : "text-error"}>{stock ? `${stock} in stock` : "Out of stock"}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-3 border-y border-default py-5">
        <strong className="text-4xl tracking-[-0.05em] text-text-primary">{formatPrice(product.price)}</strong>
        {product.originalPrice > product.price ? <><span className="text-lg text-text-secondary line-through">{formatPrice(product.originalPrice)}</span><span className="rounded-pill bg-success/10 px-3 py-1 text-sm font-semibold text-success">{product.discountPercent || product.discountPercentage}% off</span></> : null}
      </div>
      {product.colors?.length ? <fieldset aria-describedby={errors.color ? "color-error" : undefined}><legend className="text-label text-text-secondary">Color</legend><div className="mt-3 flex flex-wrap gap-2">{product.colors.map((item) => <button key={item} type="button" aria-pressed={color === item} onClick={() => { setColor(item); setErrors((value) => ({ ...value, color: undefined })); }} className={`rounded-pill border px-4 py-2 text-sm font-semibold ${color === item ? "border-brand-primary bg-brand-primary text-white" : "border-default bg-surface-raised text-text-primary"}`}>{item}</button>)}</div>{errors.color ? <p id="color-error" role="alert" className="mt-2 text-sm text-error">{errors.color}</p> : null}</fieldset> : null}
      {product.sizes?.length ? <fieldset aria-describedby={errors.size ? "size-error" : undefined}><legend className="text-label text-text-secondary">Size</legend><div className="mt-3 flex flex-wrap gap-2">{product.sizes.map((item) => <button key={item} type="button" aria-pressed={size === item} onClick={() => { setSize(item); setErrors((value) => ({ ...value, size: undefined })); }} className={`min-w-12 rounded-pill border px-4 py-2 text-sm font-semibold ${size === item ? "border-brand-primary bg-brand-primary text-white" : "border-default bg-surface-raised text-text-primary"}`}>{item}</button>)}</div>{errors.size ? <p id="size-error" role="alert" className="mt-2 text-sm text-error">{errors.size}</p> : null}</fieldset> : null}
      <div className="flex flex-wrap items-center gap-3">
        <div className="neumorphic-control inline-flex items-center rounded-pill p-1">
          <button aria-label="Decrease quantity" type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="grid h-10 w-10 place-items-center rounded-full text-text-primary"><FiMinus /></button>
          <span className="min-w-10 text-center font-semibold text-text-primary" aria-live="polite">{quantity}</span>
          <button aria-label="Increase quantity" type="button" disabled={quantity >= stock} onClick={() => setQuantity((value) => Math.min(stock, value + 1))} className="grid h-10 w-10 place-items-center rounded-full text-text-primary disabled:opacity-40"><FiPlus /></button>
        </div>
        <Button onClick={() => purchase(false)} disabled={!stock} icon={<FiShoppingBag />} className="flex-1">Add to cart</Button>
        <Button onClick={() => purchase(true)} disabled={!stock} variant="secondary" className="flex-1">Buy now</Button>
        <Button onClick={toggleWishlist} variant="ghost" aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}><FiHeart className={isWishlisted ? "fill-error text-error" : ""} /></Button>
      </div>
      {errors.stock || errors.quantity ? <p role="alert" className="text-sm text-error">{errors.stock || errors.quantity}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {product.shippingText ? <div className="rounded-xl border border-default bg-surface-muted p-4"><FiTruck className="mb-2 text-brand-primary" /><p className="text-sm text-text-secondary">{product.shippingText}</p></div> : null}
        <button type="button" onClick={share} className="rounded-xl border border-default bg-surface-muted p-4 text-left"><FiShare2 className="mb-2 text-brand-primary" /><p className="text-sm text-text-secondary">Share this product</p></button>
      </div>
    </div>
  );

  return (
    <PageWrapper className="pb-28 pt-5 md:pb-10">
      <Seo product={product} />
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap gap-2 text-sm text-text-secondary"><Link to="/">Home</Link><span>/</span><Link to={`/category/${product.category?.slug || ""}`}>{product.category?.name || "Products"}</Link><span>/</span><span aria-current="page" className="text-text-primary">{name}</span></nav>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,.9fr)]">
        <section aria-label="Product media" className="rounded-2xl border border-default bg-surface p-3 shadow-sm sm:p-5"><ProductGallery media={media} name={name} /></section>
        <aside className="lg:sticky lg:top-28 lg:self-start"><div className="rounded-2xl border border-default bg-surface-glass p-5 shadow-md backdrop-blur-xl sm:p-7">{purchasePanel}</div></aside>
      </div>
      <section className="mt-10 rounded-2xl border border-default bg-surface p-6 sm:p-8"><h2 className="text-3xl font-semibold tracking-tight text-text-primary">Product details</h2>{product.description ? <p className="mt-5 max-w-4xl whitespace-pre-line text-base leading-8 text-text-secondary">{product.description}</p> : null}{infoGroups.length ? <div className="mt-8 grid gap-4 md:grid-cols-2">{infoGroups.map((group) => <div key={group.title} className="rounded-xl bg-surface-muted p-5"><h3 className="font-semibold text-text-primary">{group.title}</h3>{group.text ? <p className="mt-2 text-sm leading-6 text-text-secondary">{group.text}</p> : <ul className="mt-3 space-y-2">{group.items.map((item) => <li key={item} className="flex gap-2 text-sm text-text-secondary"><FiCheck className="mt-1 shrink-0 text-success" />{item}</li>)}</ul>}</div>)}</div> : null}<dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-default pt-5 text-sm">{product._id ? <div><dt className="text-text-secondary">SKU</dt><dd className="font-medium text-text-primary">{product.sku || product._id}</dd></div> : null}{product.category?.name ? <div><dt className="text-text-secondary">Category</dt><dd className="font-medium text-text-primary">{product.category.name}</dd></div> : null}</dl></section>
      <section id="reviews" className="scroll-mt-28 mt-10 rounded-2xl border border-default bg-surface p-6 sm:p-8"><h2 className="mb-8 text-3xl font-semibold tracking-tight text-text-primary">Customer reviews</h2><ReviewExperience reviews={reviews} status={reviewStatus} error={reviewError} averageRating={product.rating || product.ratingAverage} /></section>
      {product.relatedProducts?.length ? <section className="mt-12"><ProductShelf id="similar-products" eyebrow="Discover more" title="Similar products" products={product.relatedProducts} /></section> : null}
      {recent.length ? <section className="mt-12"><ProductShelf id="recently-viewed-product" eyebrow="Continue exploring" title="Recently viewed" products={recent} /></section> : null}
      <div className="fixed inset-x-0 bottom-0 z-sticky border-t border-default bg-surface-glass px-3 pb-[max(.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-[auto_1fr_1fr] items-center gap-2"><strong className="pr-2 text-lg text-text-primary">{formatPrice(product.price)}</strong><Button onClick={() => purchase(false)} disabled={!stock}>Add to cart</Button><Button onClick={() => purchase(true)} disabled={!stock} variant="secondary">Buy now</Button></div>
      </div>
      <span className="sr-only" role="status" aria-live="polite">{shared ? "Product link copied" : ""}</span>
    </PageWrapper>
  );
};
