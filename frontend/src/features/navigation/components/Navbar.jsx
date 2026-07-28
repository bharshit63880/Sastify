import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FiHeart, FiMenu, FiSearch, FiShoppingCart, FiUser } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Container } from "../../../components/ui/Container";
import { IconButton } from "../../../components/ui/IconButton";
import { ThemeToggle } from "../../../theme/ThemeToggle";
import { buildCategoryTree } from "../../../utils/categoryTree";
import { logoutAsync, selectLoggedInUser } from "../../auth/AuthSlice";
import { selectCartItems } from "../../cart/CartSlice";
import { selectWishlistItems } from "../../wishlist/WishlistSlice";
import { selectCategories } from "../../categories/CategoriesSlice";
import { useAppShell } from "../../shell/AppShellContext";
import { AccountMenu } from "./AccountMenu";
import { CategoryMegaMenu } from "./CategoryMegaMenu";
import { DesktopNavigation } from "./DesktopNavigation";
import { MobileMenu } from "./MobileMenu";
import { NavbarLogo } from "./NavbarLogo";

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { openOverlay, closeOverlay } = useAppShell();
  const user = useSelector(selectLoggedInUser);
  const items = useSelector(selectCartItems);
  const categories = useSelector(selectCategories);
  const wishlistItems = useSelector(selectWishlistItems);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const accountRef = useRef(null);
  const roots = useMemo(() => buildCategoryTree(categories).roots, [categories]);
  const count = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  useEffect(() => {
    setCategoriesOpen(false);
    setAccountOpen(false);
    closeOverlay();
  }, [closeOverlay, location.pathname, location.search]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { setScrolled(window.scrollY > 16); ticking = false; });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") { setCategoriesOpen(false); setAccountOpen(false); }
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
      if (!typing && (event.key === "/" || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k"))) {
        event.preventDefault();
        setCategoriesOpen(false); setAccountOpen(false); openOverlay("search");
      }
    };
    const outside = (event) => accountRef.current && !accountRef.current.contains(event.target) && setAccountOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", outside);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", outside); };
  }, [openOverlay]);

  const openGlobal = (name) => {
    setCategoriesOpen(false);
    setAccountOpen(false);
    openOverlay(name);
  };
  const protectedGo = (path) => navigate(user ? path : "/login", { state: user ? undefined : { from: path } });
  const logout = async () => { setAccountOpen(false); closeOverlay(); await dispatch(logoutAsync()); navigate("/login"); };

  return (
    <>
      <header className="sticky top-0 z-sticky px-3 pt-3">
        <Container className="relative">
          <motion.div layout className={`relative flex items-center gap-2 rounded-2xl border px-3 transition-[padding,background-color,border-color,box-shadow] duration-normal sm:px-4 ${scrolled || location.pathname !== "/" ? "border-glass bg-glass py-2 shadow-glass backdrop-blur-2xl" : "border-transparent bg-page/70 py-3 backdrop-blur-lg"}`}>
            <IconButton label="Open navigation menu" className="lg:hidden" onClick={() => openGlobal("mobile-menu")}><FiMenu /></IconButton>
            <NavbarLogo />
            <div className="ml-4"><DesktopNavigation categoriesOpen={categoriesOpen} onCategoriesToggle={() => { setAccountOpen(false); closeOverlay(); setCategoriesOpen((value) => !value); }} /></div>
            <div className="ml-auto flex items-center gap-1.5">
              <button type="button" onClick={() => openGlobal("search")} className="hidden min-w-52 items-center gap-3 rounded-pill border border-default bg-surface-raised px-4 py-2.5 text-left text-sm text-secondary shadow-xs md:flex" aria-label="Open search">
                <FiSearch /><span className="flex-1">Search Sastify</span><kbd className="rounded-md border border-default px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>
              </button>
              <ThemeToggle compact className="hidden xl:inline-flex" />
              <IconButton label="Open search" className="md:hidden" onClick={() => openGlobal("search")}><FiSearch /></IconButton>
              <IconButton label={`Open wishlist${wishlistItems.length ? `, ${wishlistItems.length} items` : ""}`} className="relative hidden sm:inline-flex" onClick={() => protectedGo("/wishlist")}><FiHeart />{wishlistItems.length ? <motion.span key={wishlistItems.length} initial={{ scale: .5 }} animate={{ scale: 1 }} className="absolute -right-1 -top-1 min-w-5 rounded-pill bg-error px-1 text-[10px] font-bold text-white">{wishlistItems.length > 99 ? "99+" : wishlistItems.length}</motion.span> : null}</IconButton>
              <IconButton data-cart-target label={`Open cart${count ? `, ${count} items` : ""}`} variant="glass" onClick={() => openGlobal("cart")} className="relative">
                <FiShoppingCart />
                {count ? <motion.span key={count} initial={{ scale: .6 }} animate={{ scale: 1 }} className="absolute -right-1 -top-1 min-w-5 rounded-pill bg-brand-primary px-1 text-[10px] font-bold text-white">{count > 99 ? "99+" : count}</motion.span> : null}
              </IconButton>
              <div className="relative hidden sm:block" ref={accountRef}>
                <IconButton label={user ? "Open account menu" : "Sign in options"} onClick={() => { setCategoriesOpen(false); closeOverlay(); setAccountOpen((value) => !value); }} aria-expanded={accountOpen}><FiUser /></IconButton>
                <AccountMenu open={accountOpen} user={user} onClose={() => setAccountOpen(false)} onLogout={logout} />
              </div>
            </div>
            <CategoryMegaMenu open={categoriesOpen} roots={roots} onClose={() => setCategoriesOpen(false)} />
          </motion.div>
        </Container>
      </header>
      <MobileMenu roots={roots} user={user} onLogout={logout} />
    </>
  );
};
