import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { appToast } from "../../services/toastService";
import { selectLoggedInUser } from "../auth/AuthSlice";
import { addGuestCartItem, addToCartAsync } from "../cart/CartSlice";
import { useAppShell } from "../shell/AppShellContext";
import {
  createWishlistItemAsync,
  deleteWishlistItemByIdAsync,
  selectWishlistItems,
} from "../wishlist/WishlistSlice";
import { runFlyingCart } from "./commerceMotion";

const DiscoveryContext = createContext(null);

export const DiscoveryProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { openOverlay, closeOverlay } = useAppShell();
  const loggedInUser = useSelector(selectLoggedInUser);
  const wishlistItems = useSelector(selectWishlistItems);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const pendingWishlist = useRef(new Set());
  const cartFlightPending = useRef(false);

  const openQuickView = useCallback((product) => {
    closeOverlay();
    setQuickViewProduct(product);
  }, [closeOverlay]);
  const closeQuickView = useCallback(() => setQuickViewProduct(null), []);

  const toggleWishlist = useCallback(async (product) => {
    if (!loggedInUser) {
      navigate("/login", { state: { from: window.location.pathname + window.location.search } });
      return { success: false, requiresAuth: true };
    }
    const productId = String(product?._id || "");
    if (!productId || pendingWishlist.current.has(productId)) return { success: false, busy: true };
    pendingWishlist.current.add(productId);
    const existing = wishlistItems.find((item) => String(item.product?._id || item.product) === productId);
    try {
      if (existing) await dispatch(deleteWishlistItemByIdAsync(existing._id)).unwrap();
      else await dispatch(createWishlistItemAsync({ product: productId })).unwrap();
      window.dispatchEvent(new CustomEvent("sastify:wishlist-success", { detail: { productId, saved: !existing } }));
      return { success: true, saved: !existing };
    } catch (error) {
      appToast.error(error?.message || "Wishlist could not be updated.");
      return { success: false, saved: Boolean(existing) };
    } finally {
      pendingWishlist.current.delete(productId);
    }
  }, [dispatch, loggedInUser, navigate, wishlistItems]);

  const addProductToCart = useCallback(async ({ product, quantity = 1, size = "", color = "", sourceElement }) => {
    if (!product?._id || cartFlightPending.current) return { success: false, busy: true };
    cartFlightPending.current = true;
    try {
      if (loggedInUser) {
        await dispatch(addToCartAsync({ product: product._id, quantity, size, color })).unwrap();
      } else {
        dispatch(addGuestCartItem({ product, quantity, size, color }));
      }
      closeQuickView();
      const imageUrl = product.thumbnail || product.images?.[0] || "";
      await runFlyingCart({ sourceElement, imageUrl, reducedMotion: Boolean(reduceMotion) });
      window.dispatchEvent(new CustomEvent("sastify:cart-success", { detail: { productId: product._id } }));
      openOverlay("cart");
      return { success: true };
    } catch (error) {
      appToast.error(error?.message || "This product could not be added to the cart.");
      return { success: false };
    } finally {
      cartFlightPending.current = false;
    }
  }, [closeQuickView, dispatch, loggedInUser, openOverlay, reduceMotion]);

  const value = useMemo(() => ({
    quickViewProduct,
    openQuickView,
    closeQuickView,
    toggleWishlist,
    addProductToCart,
  }), [addProductToCart, closeQuickView, openQuickView, quickViewProduct, toggleWishlist]);

  return <DiscoveryContext.Provider value={value}>{children}</DiscoveryContext.Provider>;
};

export const useDiscovery = () => {
  const context = useContext(DiscoveryContext);
  if (!context) throw new Error("useDiscovery must be used inside DiscoveryProvider");
  return context;
};
