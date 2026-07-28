import React, { Suspense, lazy } from "react";
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

const QuickViewModal = lazy(() => import("../features/discovery/QuickViewModal").then((module) => ({ default: module.QuickViewModal })));

export const StorefrontShell = () => {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
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
            <AnimatePresence mode="wait" initial={false}>
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
