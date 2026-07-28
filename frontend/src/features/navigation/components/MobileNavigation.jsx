import React from "react";
import { FiGrid, FiHeart, FiHome, FiSearch, FiShoppingCart } from "react-icons/fi";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCartItems } from "../../cart/CartSlice";
import { useAppShell } from "../../shell/AppShellContext";

export const MobileNavigation = () => {
  const location = useLocation();
  const items = useSelector(selectCartItems);
  const { activeOverlay, openOverlay } = useAppShell();
  if (["/checkout", "/login", "/signup", "/verify-otp", "/forgot-password"].some((path) => location.pathname.startsWith(path))) return null;
  const count = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const actionClass = "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-medium text-text-secondary aria-[current=page]:text-brand-primary";
  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-3 bottom-3 z-sticky flex rounded-2xl border border-glass bg-glass px-2 pb-[max(.3rem,env(safe-area-inset-bottom))] pt-1 shadow-glass backdrop-blur-2xl lg:hidden">
      <NavLink to="/" className={actionClass}><FiHome className="text-lg" />Home</NavLink>
      <button type="button" className={actionClass} onClick={() => openOverlay("mobile-menu")} aria-current={activeOverlay === "mobile-menu" ? "page" : undefined}><FiGrid className="text-lg" />Categories</button>
      <button type="button" className={actionClass} onClick={() => openOverlay("search")} aria-current={activeOverlay === "search" ? "page" : undefined}><FiSearch className="text-lg" />Search</button>
      <NavLink to="/wishlist" className={actionClass}><FiHeart className="text-lg" />Wishlist</NavLink>
      <button type="button" className={actionClass} onClick={() => openOverlay("cart")} aria-current={activeOverlay === "cart" ? "page" : undefined}>
        <FiShoppingCart className="text-lg" />Cart
        {count ? <span className="absolute right-[20%] top-0 rounded-pill bg-brand-primary px-1.5 text-[9px] font-bold text-white" aria-label={`${count} items in cart`}>{count > 99 ? "99+" : count}</span> : null}
      </button>
    </nav>
  );
};
