import React, { useMemo } from "react";
import { FiMinus, FiPlus, FiShoppingBag, FiTrash2, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Drawer } from "../../../components/ui/Drawer";
import { IconButton } from "../../../components/ui/IconButton";
import { ImageWithFallback } from "../../../components/ui/ImageWithFallback";
import { CartItemSkeleton, SkeletonRegion } from "../../../components/ui/Skeleton";
import { DEFAULT_SHIPPING_CHARGE, FREE_SHIPPING_THRESHOLD } from "../../../constants";
import { formatPrice } from "../../../utils/currencyFormatter";
import { selectLoggedInUser } from "../../auth/AuthSlice";
import { useAppShell } from "../../shell/AppShellContext";
import {
  deleteCartItemByIdAsync,
  removeGuestCartItem,
  selectCartErrors,
  selectCartItems,
  selectCartStatus,
  selectIsGuestCart,
  updateCartItemByIdAsync,
  updateGuestCartItem,
} from "../CartSlice";
import { adaptCartItem } from "../cartPresentation";

export const CartDrawer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isCartOpen, closeOverlay } = useAppShell();
  const items = useSelector(selectCartItems);
  const status = useSelector(selectCartStatus);
  const error = useSelector(selectCartErrors);
  const isGuestCart = useSelector(selectIsGuestCart);
  const loggedInUser = useSelector(selectLoggedInUser);
  const adapted = useMemo(() => items.map(adaptCartItem), [items]);
  const subtotal = useMemo(() => adapted.reduce((sum, item) => sum + item.price * item.quantity, 0), [adapted]);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_CHARGE;
  const isPending = status === "pending";

  const updateQuantity = (item, next) => {
    if (next < 1 || next > item.stock || isPending) return;
    if (isGuestCart && !loggedInUser) dispatch(updateGuestCartItem({ id: item.id, quantity: next }));
    else dispatch(updateCartItemByIdAsync({ _id: item.id, quantity: next }));
  };

  const remove = (id) => {
    if (isPending) return;
    if (isGuestCart && !loggedInUser) dispatch(removeGuestCartItem(id));
    else dispatch(deleteCartItemByIdAsync(id));
  };

  const go = (path) => {
    closeOverlay();
    navigate(path);
  };

  return (
    <Drawer open={isCartOpen} onClose={closeOverlay} title="Shopping cart">
      <div className="flex items-center justify-between border-b border-default px-5 py-4">
        <div>
          <p className="text-label text-brand-primary">Your bag</p>
          <h2 className="text-xl font-semibold text-text-primary">Shopping cart</h2>
        </div>
        <IconButton label="Close cart" onClick={closeOverlay}><FiX /></IconButton>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
        {isPending && !adapted.length ? (
          <SkeletonRegion label="Loading cart"><div className="space-y-3">{[0, 1, 2].map((key) => <CartItemSkeleton key={key} />)}</div></SkeletonRegion>
        ) : error && !adapted.length ? (
          <div role="alert" className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
            <p className="font-semibold text-text-primary">We couldn’t load your cart</p>
            <p className="text-small">{error.message || "Please try again shortly."}</p>
          </div>
        ) : !adapted.length ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-2xl text-brand-primary"><FiShoppingBag /></span>
            <div><p className="text-xl font-semibold text-text-primary">Your cart is empty</p><p className="mt-1 text-small">Browse categories and add something you’ll enjoy using.</p></div>
            <Button onClick={() => go("/products")}>Start shopping</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {adapted.map((item) => (
              <article key={item.id} className="grid grid-cols-[84px_1fr] gap-3 rounded-xl border border-default bg-surface p-3">
                <button type="button" onClick={() => go(`/products/${item.slug}`)} className="self-start overflow-hidden rounded-lg">
                  <ImageWithFallback src={item.image} alt={item.name} wrapperClassName="aspect-[4/5]" className="object-cover" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-start gap-2">
                    <button type="button" onClick={() => go(`/products/${item.slug}`)} className="min-w-0 flex-1 text-left">
                      <span className="line-clamp-2 text-sm font-semibold text-text-primary">{item.name}</span>
                      {item.brand ? <span className="mt-0.5 block text-xs text-text-secondary">{item.brand}</span> : null}
                    </button>
                    <IconButton label={`Remove ${item.name}`} size="sm" onClick={() => remove(item.id)} disabled={isPending} className="text-error"><FiTrash2 /></IconButton>
                  </div>
                  {(item.size || item.color) ? <p className="mt-2 text-xs text-text-secondary">{[item.color && `Color: ${item.color}`, item.size && `Size: ${item.size}`].filter(Boolean).join(" · ")}</p> : null}
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="neumorphic-control inline-flex items-center rounded-pill p-1">
                      <IconButton label={`Decrease ${item.name} quantity`} size="sm" onClick={() => updateQuantity(item, item.quantity - 1)} disabled={isPending}><FiMinus /></IconButton>
                      <span className="min-w-8 text-center text-sm font-semibold text-text-primary" aria-live="polite">{item.quantity}</span>
                      <IconButton label={`Increase ${item.name} quantity`} size="sm" onClick={() => updateQuantity(item, item.quantity + 1)} disabled={isPending || item.quantity >= item.stock}><FiPlus /></IconButton>
                    </div>
                    <strong className="text-sm text-text-primary">{formatPrice(item.price * item.quantity)}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {adapted.length ? (
        <div className="border-t border-default bg-surface-glass p-5">
          <div className="mb-4 space-y-2 text-sm">
            <div className="flex justify-between text-text-secondary"><span>Subtotal</span><strong className="text-text-primary">{formatPrice(subtotal)}</strong></div>
            <div className="flex justify-between text-text-secondary"><span>Shipping</span><span>{shipping ? formatPrice(shipping) : "Free"}</span></div>
          </div>
          <div className="grid gap-2">
            <Button fullWidth onClick={() => go(loggedInUser ? "/checkout" : "/login")}>Checkout</Button>
            <Button fullWidth variant="secondary" onClick={() => go("/cart")}>View full cart</Button>
            <button type="button" onClick={closeOverlay} className="py-2 text-sm font-semibold text-text-secondary hover:text-text-primary">Continue shopping</button>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
};
