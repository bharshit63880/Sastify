import React, { Suspense, lazy, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AppErrorBoundary } from "../components/AppErrorBoundary";
import { BackToTop } from "../components/BackToTop";
import { OfflineBanner } from "../components/OfflineBanner";
import { RouteFallback } from "../components/RouteFallback";
import { ScrollProgress } from "../components/ScrollProgress";
import { CartDrawer } from "../features/cart/components/CartDrawer";
import { Footer } from "../features/footer/Footer";
import { MobileNavigation } from "../features/navigation/components/MobileNavigation";
import { Navbar } from "../features/navigation/components/Navbar";
import { SearchCommand } from "../features/search/components/SearchCommand";
import { AppShellProvider } from "../features/shell/AppShellContext";
import { pageTransition, reducedMotionVariants } from "../components/ui/motion";
import { ScrollToTop } from "../components/ScrollToTop";
import { DiscoveryProvider } from "../features/discovery/DiscoveryContext";
import { useDispatch } from "react-redux";
import { fetchAllBrandsAsync } from "../features/brands/BrandSlice";
import { fetchAllCategoriesAsync } from "../features/categories/CategoriesSlice";
import { fetchStorefrontOverviewAsync } from "../features/storefront/StorefrontSlice";

const QuickViewModal = lazy(() => import("../features/discovery/QuickViewModal").then((module) => ({ default: module.QuickViewModal })));

export const StorefrontShell = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    const privateRoute = ["/account", "/checkout", "/orders", "/wishlist", "/order-success"].some((path) => location.pathname.startsWith(path));
    let robots = document.head.querySelector('meta[name="robots"]');
    if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.appendChild(robots); }
    robots.content = privateRoute ? "noindex,nofollow" : "index,follow";
  }, [location.pathname]);
  useEffect(() => {
    dispatch(fetchAllCategoriesAsync());
    dispatch(fetchAllBrandsAsync());
    dispatch(fetchStorefrontOverviewAsync());
  }, [dispatch]);
  return (
    <AppShellProvider>
      <DiscoveryProvider>
      <div className="relative min-h-screen overflow-x-hidden bg-page pb-20 lg:pb-0">
        <ScrollToTop />
        <ScrollProgress />
        <OfflineBanner />
        <Navbar />
        <main className="relative min-h-[70vh]" id="main-content">
          <AppErrorBoundary>
            <AnimatePresence mode="sync" initial={false}>
              <motion.div key={location.pathname} variants={reduceMotion ? reducedMotionVariants : pageTransition} initial="hidden" animate="visible" exit="exit">
                <Suspense fallback={<RouteFallback />}>
                  <Outlet />
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </AppErrorBoundary>
        </main>
        <Footer />
        <MobileNavigation />
        <CartDrawer />
        <SearchCommand />
        <Suspense fallback={null}><QuickViewModal /></Suspense>
        <BackToTop />
      </div>
      </DiscoveryProvider>
    </AppShellProvider>
  );
};
