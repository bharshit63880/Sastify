import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiHeart, FiMinus, FiPlus, FiShoppingBag, FiStar, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Dialog } from "../../components/ui/Dialog";
import { Button } from "../../components/ui/Button";
import { IconButton } from "../../components/ui/IconButton";
import { ImageWithFallback } from "../../components/ui/ImageWithFallback";
import { Skeleton } from "../../components/ui/Skeleton";
import { formatPrice } from "../../utils/currencyFormatter";
import { fetchProductById } from "../products/ProductApi";
import { useDiscovery } from "./DiscoveryContext";

export const QuickViewModal = () => {
  const navigate = useNavigate();
  const { quickViewProduct, closeQuickView, addProductToCart, toggleWishlist } = useDiscovery();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("idle");
  const [selectedImage, setSelectedImage] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [wishlistPulse, setWishlistPulse] = useState(0);
  const addButtonRef = useRef(null);

  useEffect(() => {
    if (!quickViewProduct?._id) {
      setProduct(null);
      return undefined;
    }
    let active = true;
    setStatus("pending");
    setProduct(quickViewProduct);
    fetchProductById(quickViewProduct._id)
      .then((data) => { if (active) { setProduct(data); setStatus("fulfilled"); } })
      .catch(() => { if (active) setStatus("rejected"); });
    return () => { active = false; };
  }, [quickViewProduct]);

  useEffect(() => {
    setSelectedImage(0); setSize(""); setColor(""); setQuantity(1);
  }, [quickViewProduct?._id]);

  const images = useMemo(() => (product?.images?.length ? product.images : [product?.thumbnail]).filter(Boolean), [product]);
  const stock = Number(product?.stock || product?.stockQuantity || 0);
  const label = product?.name || product?.title || "Product";

  const goToDetails = () => {
    const slug = product?.slug || product?._id;
    closeQuickView();
    navigate(`/products/${slug}`);
  };

  return (
    <Dialog open={Boolean(quickViewProduct)} onClose={closeQuickView} title={`Quick view: ${label}`} fullScreenMobile className="max-w-5xl">
      <div className="flex h-full max-h-[90vh] flex-col bg-surface max-sm:max-h-none">
        <div className="flex items-center justify-between border-b border-default px-5 py-4">
          <div><p className="text-label text-brand-primary">Quick view</p><p className="font-semibold text-text-primary">{label}</p></div>
          <IconButton label="Close quick view" onClick={closeQuickView}><FiX /></IconButton>
        </div>
        {status === "pending" && !product ? (
          <div className="grid flex-1 gap-6 overflow-y-auto p-5 md:grid-cols-2">
            <Skeleton className="min-h-[420px] rounded-2xl" />
            <div className="space-y-5"><Skeleton className="h-5 w-28" /><Skeleton className="h-12 w-4/5" /><Skeleton className="h-6 w-40" /><Skeleton className="h-28 w-full" /><Skeleton className="h-12 w-full" /></div>
          </div>
        ) : status === "rejected" && !product ? (
          <div className="flex min-h-80 flex-1 flex-col items-center justify-center gap-4 p-6 text-center" role="alert">
            <p className="text-xl font-semibold text-text-primary">Quick view is unavailable</p>
            <p className="text-small">Open the full product page or try again later.</p>
            <Button onClick={closeQuickView} variant="secondary">Close</Button>
          </div>
        ) : product ? (
          <div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[1.02fr_.98fr]">
            <div className="bg-surface-muted p-4 sm:p-6">
              <ImageWithFallback src={images[selectedImage]} alt={label} wrapperClassName="aspect-[4/4.5] rounded-2xl" className="object-cover" />
              {images.length > 1 ? <div className="mt-3 flex gap-2 overflow-x-auto">{images.slice(0, 5).map((image, index) => <button key={image} type="button" aria-label={`View image ${index + 1}`} aria-pressed={selectedImage === index} onClick={() => setSelectedImage(index)} className={`h-16 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${selectedImage === index ? "border-brand-primary" : "border-transparent"}`}><img src={image} alt="" className="h-full w-full object-cover" /></button>)}</div> : null}
            </div>
            <div className="flex flex-col gap-5 p-5 sm:p-7">
              <div>
                <p className="text-label text-text-secondary">{product.brand?.name || product.brandName || ""}</p>
                <h2 className="mt-2 text-3xl font-bold tracking-[-.04em] text-text-primary">{label}</h2>
                <div className="mt-3 flex items-center gap-2 text-sm text-text-secondary"><FiStar className="fill-current text-warning" /><span className="font-semibold text-text-primary">{Number(product.ratingAverage || product.rating || 0).toFixed(1)}</span><span>({Number(product.ratingCount || product.reviewCount || 0)} reviews)</span></div>
              </div>
              <div className="flex flex-wrap items-end gap-3"><strong className="text-3xl text-text-primary">{formatPrice(product.price)}</strong>{Number(product.originalPrice) > Number(product.price) ? <span className="text-text-secondary line-through">{formatPrice(product.originalPrice)}</span> : null}</div>
              <p className={`w-fit rounded-pill px-3 py-1.5 text-xs font-semibold ${stock > 0 ? "bg-brand-soft text-text-accent" : "bg-error/10 text-error"}`}>{stock > 0 ? `${stock} in stock` : "Out of stock"}</p>
              {product.colors?.length ? <fieldset><legend className="text-label text-text-secondary">Color</legend><div className="mt-3 flex flex-wrap gap-2">{product.colors.map((item) => <button key={item} type="button" aria-pressed={color === item} onClick={() => setColor(item)} className={`rounded-pill border px-4 py-2 text-sm ${color === item ? "border-brand-primary bg-brand-primary text-white" : "border-default bg-surface-raised text-text-primary"}`}>{item}</button>)}</div></fieldset> : null}
              {product.sizes?.length ? <fieldset><legend className="text-label text-text-secondary">Size</legend><div className="mt-3 flex flex-wrap gap-2">{product.sizes.map((item) => <button key={item} type="button" aria-pressed={size === item} onClick={() => setSize(item)} className={`min-w-11 rounded-pill border px-3 py-2 text-sm ${size === item ? "border-brand-primary bg-brand-primary text-white" : "border-default bg-surface-raised text-text-primary"}`}>{item}</button>)}</div></fieldset> : null}
              <div className="mt-auto flex items-center gap-3">
                <div className="neumorphic-control inline-flex items-center rounded-pill p-1"><IconButton label="Decrease quantity" size="sm" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><FiMinus /></IconButton><span className="min-w-8 text-center font-semibold" aria-live="polite">{quantity}</span><IconButton label="Increase quantity" size="sm" disabled={quantity >= stock} onClick={() => setQuantity((value) => Math.min(stock, value + 1))}><FiPlus /></IconButton></div>
                <IconButton key={wishlistPulse} label={`Add ${label} to wishlist`} onClick={async () => { const result = await toggleWishlist(product); if (result.success) setWishlistPulse((value) => value + 1); }} className={wishlistPulse ? "text-error" : ""}><FiHeart className={wishlistPulse ? "fill-current animate-soft-pulse" : ""} /></IconButton>
              </div>
              <Button ref={addButtonRef} fullWidth disabled={stock <= 0} onClick={() => addProductToCart({ product, quantity, size, color, sourceElement: addButtonRef.current })} icon={<FiShoppingBag />}>Add to cart</Button>
              <Button fullWidth variant="secondary" onClick={goToDetails}>View full details</Button>
            </div>
          </div>
        ) : null}
      </div>
    </Dialog>
  );
};
