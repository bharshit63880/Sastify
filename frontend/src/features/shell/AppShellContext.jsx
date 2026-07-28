import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ShellContext = createContext(null);

export const AppShellProvider = ({ children }) => {
  const [activeOverlay, setActiveOverlay] = useState(null);
  const openOverlay = useCallback((name) => setActiveOverlay(name), []);
  const closeOverlay = useCallback(() => setActiveOverlay(null), []);
  const value = useMemo(() => ({
    activeOverlay,
    openOverlay,
    closeOverlay,
    isSearchOpen: activeOverlay === "search",
    isCartOpen: activeOverlay === "cart",
    isMobileMenuOpen: activeOverlay === "mobile-menu",
  }), [activeOverlay, closeOverlay, openOverlay]);
  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
};

export const useAppShell = () => {
  const context = useContext(ShellContext);
  if (!context) throw new Error("useAppShell must be used inside AppShellProvider");
  return context;
};
