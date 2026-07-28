import React from "react";
import { FiHeart, FiShoppingBag, FiTrash2 } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/ui/Button";
import { PageWrapper } from "../components/ui/PageWrapper";
import { ProductCardSkeleton, SkeletonRegion } from "../components/ui/Skeleton";
import { addToCartAsync, selectCartItemAddStatus } from "../features/cart/CartSlice";
import { ProductCard } from "../features/products/components/ProductCard";
import { deleteWishlistItemByIdAsync, selectWishlistErrors, selectWishlistFetchStatus, selectWishlistItemDeleteStatus, selectWishlistItems } from "../features/wishlist/WishlistSlice";

export const WishlistPage = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectWishlistItems);
  const status = useSelector(selectWishlistFetchStatus);
  const removeStatus = useSelector(selectWishlistItemDeleteStatus);
  const cartStatus = useSelector(selectCartItemAddStatus);
  const error = useSelector(selectWishlistErrors);
  const pending = removeStatus === "pending" || cartStatus === "pending";

  return (
    <PageWrapper className="py-8">
      <div className="mb-7"><p className="text-label text-brand-primary">Saved collection</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.05em] text-text-primary">Wishlist</h1><p className="mt-3 text-text-secondary">Move available products into your cart or remove them from your shortlist.</p></div>
      {error ? <p role="alert" className="mb-5 rounded-xl border border-error/30 bg-error/5 p-3 text-sm text-error">{error.message || "Wishlist could not be updated."}</p> : null}
      {status === "pending" ? <SkeletonRegion label="Loading wishlist"><div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((key) => <ProductCardSkeleton key={key} />)}</div></SkeletonRegion> : items.length ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">{items.map((item) => {
          const stock = Number(item.product?.stock ?? item.product?.stockQuantity ?? 0);
          return <article key={item._id} className="min-w-0"><ProductCard product={item.product} /><div className="mt-3 grid gap-2 rounded-xl border border-default bg-surface p-3"><Button disabled={!stock || pending} icon={<FiShoppingBag />} onClick={() => dispatch(addToCartAsync({ product: item.product._id, quantity: 1, color: "", size: "" }))}>{stock ? "Move to cart" : "Out of stock"}</Button><Button disabled={pending} variant="ghost" icon={<FiTrash2 />} onClick={() => dispatch(deleteWishlistItemByIdAsync(item._id))}>Remove</Button></div></article>;
        })}</div>
      ) : <EmptyState icon={<FiHeart />} title="Your wishlist is empty" description="Save products here to compare them later and keep your shortlist organized." actionLabel="Explore products" actionTo="/products" />}
    </PageWrapper>
  );
};
