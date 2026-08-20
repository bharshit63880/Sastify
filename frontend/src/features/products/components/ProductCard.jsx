import React, { memo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FiEye, FiHeart, FiShoppingBag, FiStar } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "../../../components/ui/Button";
import { IconButton } from "../../../components/ui/IconButton";
import { ImageWithFallback } from "../../../components/ui/ImageWithFallback";
import { formatPrice } from "../../../utils/currencyFormatter";
import { useDiscovery } from "../../discovery/DiscoveryContext";
import { getCardImages } from "./cardPresentation";

const colorMap = {
  black: "#111827", white: "#ffffff", red: "#dc2626", blue: "#2563eb", green: "#16a34a",
  yellow: "#eab308", pink: "#ec4899", purple: "#9333ea", grey: "#6b7280", gray: "#6b7280",
  brown: "#92400e", orange: "#f97316", beige: "#d6c6a5", navy: "#172554",
};

const ProductCardComponent = ({ product, variant = "grid" }) => {
  const { openQuickView, addProductToCart, toggleWishlist } = useDiscovery();
  const reduceMotion = useReducedMotion();
  const imageRef = useRef(null);
  const [intent, setIntent] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [wishlistPulse, setWishlistPulse] = useState(0);
  const [cartBusy, setCartBusy] = useState(false);
  const isWishlisted = useSelector((state) => state.WishlistSlice.items.some((item) => String(item.product?._id || item.product) === String(product._id)));
  const { primary, secondary, fallback } = getCardImages(product);
  const label = product.name || product.title;
  const brand = product.brand?.name || product.brandName || "";
  const price = Number(product.price || 0);
  const originalPrice = Number(product.originalPrice || price);
  const discount = Number(product.discountPercent || product.discountPercentage || 0);
  const rating = Number(product.ratingAverage || product.rating || 0);
  const reviews = Number(product.ratingCount || product.reviewCount || 0);
  const stock = Number(product.stock || product.stockQuantity || 0);
  const isList = variant === "list";

  const prepareAlternate = () => {
    setIntent(true);
    if (secondary && typeof Image !== "undefined") {
      const preload = new Image();
      preload.src = secondary;
    }
  };

  const handleWishlist = async () => {
    if (wishlistBusy) return;
    setWishlistBusy(true);
    const result = await toggleWishlist(product);
    if (result.success) setWishlistPulse((value) => value + 1);
    setWishlistBusy(false);
  };

  const handleCart = async () => {
    if (cartBusy || stock <= 0) return;
    setCartBusy(true);
    await addProductToCart({ product, quantity: 1, sourceElement: imageRef.current });
    setCartBusy(false);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -7, scale: 1.008 }}
      onHoverStart={prepareAlternate}
      onFocusCapture={prepareAlternate}
      className={`group relative isolate overflow-hidden rounded-[32px] border border-white/70 bg-surface-glass shadow-[0_18px_45px_rgba(67,49,23,.12),0_4px_14px_rgba(67,49,23,.08),inset_0_1px_0_rgba(255,255,255,.9)] backdrop-blur-xl transition-[box-shadow,border-color] hover:border-brand-primary/30 hover:shadow-[0_28px_65px_rgba(67,49,23,.2),0_8px_22px_rgba(67,49,23,.1),inset_0_1px_0_rgba(255,255,255,.95)] ${isList ? "grid sm:grid-cols-[210px_1fr]" : "flex h-full flex-col"}`}
    >
      <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 z-0 h-28 w-28 rounded-full bg-brand-primary/10 blur-2xl" />
      <div ref={imageRef} className={`relative z-[1] overflow-hidden bg-surface-muted ${isList ? "min-h-56" : "m-2 mb-0 rounded-[25px]"}`}>
        <Link to={`/products/${product.slug || product._id}`} aria-label={`View ${label}`}>
          <div className={isList ? "h-full min-h-56" : "aspect-[4/3.55]"}>
            <ImageWithFallback src={primary} fallback={fallback} alt={label} width={520} height={610} wrapperClassName="h-full w-full" className={`object-cover ${!secondary && !reduceMotion ? "transition-transform duration-500 group-hover:scale-105" : ""}`} />
            {secondary && intent ? <img src={secondary} alt="" loading="lazy" aria-hidden="true" className={`absolute inset-0 h-full w-full object-cover opacity-0 ${reduceMotion ? "" : "transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100"}`} /> : null}
          </div>
        </Link>
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          <span className={`rounded-pill px-3 py-1.5 text-xs font-semibold backdrop-blur-xl ${stock > 0 ? "bg-surface-glass text-text-primary" : "bg-error text-white"}`}>{stock > 0 ? (stock <= 5 ? `Only ${stock} left` : "In stock") : "Out of stock"}</span>
          {discount > 0 ? <span className="w-fit rounded-pill bg-success px-3 py-1.5 text-xs font-bold text-white">{discount}% off</span> : null}
        </div>
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <motion.div key={wishlistPulse} animate={wishlistPulse && !reduceMotion ? { scale: [1, 1.28, .92, 1] } : undefined}>
            <IconButton label={`${isWishlisted ? "Remove" : "Add"} ${label} ${isWishlisted ? "from" : "to"} wishlist`} size="sm" variant="glass" loading={wishlistBusy} onClick={handleWishlist} className={isWishlisted ? "text-error" : ""}><FiHeart className={isWishlisted ? "fill-current" : ""} /></IconButton>
            {wishlistPulse ? <motion.span key={`ring-${wishlistPulse}`} initial={{ opacity: .7, scale: .45 }} animate={{ opacity: 0, scale: 1.8 }} className="pointer-events-none absolute inset-0 rounded-full border-2 border-error" /> : null}
          </motion.div>
          <IconButton label={`Quick view ${label}`} size="sm" variant="glass" onClick={() => openQuickView(product)}><FiEye /></IconButton>
        </div>
      </div>

      <div className="relative z-[1] flex flex-1 flex-col gap-2.5 p-4">
        {brand ? <p className="text-label line-clamp-1 text-text-secondary">{brand}</p> : null}
        <Link to={`/products/${product.slug || product._id}`} className="line-clamp-2 text-[.98rem] font-semibold leading-5 text-text-primary hover:text-brand-primary">{label}</Link>
        <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
          <span className="inline-flex items-center gap-1 font-semibold text-text-primary"><FiStar className="fill-current text-warning" />{rating.toFixed(1)}</span>
          <span aria-label={`${reviews} reviews`}>({reviews})</span>
        </div>
        {product.colors?.length ? <div className="flex items-center gap-1.5" aria-label={`Available colors: ${product.colors.join(", ")}`}>{product.colors.slice(0, 5).map((color) => <span key={color} title={color} className="h-4 w-4 rounded-full border border-strong shadow-xs" style={{ backgroundColor: colorMap[String(color).toLowerCase()] || color }} />)}{product.colors.length > 5 ? <span className="text-xs text-text-secondary">+{product.colors.length - 5}</span> : null}</div> : null}
        <div className="mt-auto flex flex-wrap items-end gap-x-3 gap-y-1">
          <strong className="text-xl tracking-[-.035em] text-text-primary">{formatPrice(price)}</strong>
          {originalPrice > price ? <span className="pb-0.5 text-sm text-text-secondary line-through">{formatPrice(originalPrice)}</span> : null}
        </div>
        <div className={`grid gap-2 ${isList ? "sm:grid-cols-2" : ""}`}>
          <Button fullWidth loading={cartBusy} disabled={stock <= 0} onClick={handleCart} icon={<FiShoppingBag />}>{stock <= 0 ? "Out of stock" : "Add to cart"}</Button>
          <Button fullWidth variant="secondary" onClick={() => openQuickView(product)} className={isList ? "" : "sm:hidden"}>Quick view</Button>
        </div>
      </div>
    </motion.article>
  );
};

export const ProductCard = memo(ProductCardComponent, (previous, next) => previous.product === next.product && previous.variant === next.variant);
