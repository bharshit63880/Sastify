import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiBell, FiBox, FiChevronLeft, FiExternalLink, FiHome, FiLogOut, FiMenu, FiPackage, FiSearch, FiSettings, FiShoppingBag, FiTag, FiUsers, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ScrollToTop } from "../components/ScrollToTop";
import { logoutAsync, selectLoggedInUser } from "../features/auth/AuthSlice";
import { fetchAllBrandsAsync } from "../features/brands/BrandSlice";
import { fetchAllCategoriesAsync } from "../features/categories/CategoriesSlice";

const navItems = [
  { label: "Overview", to: "/admin", icon: FiHome, exact: true },
  { label: "Products", to: "/admin/products", icon: FiBox },
  { label: "Orders", to: "/admin/orders", icon: FiShoppingBag },
  { label: "Customers", to: "/admin/users", icon: FiUsers },
  { label: "Inventory", to: "/admin/inventory", icon: FiPackage },
  { label: "Promotions", to: "/admin/products#promotions", icon: FiTag },
];

export const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectLoggedInUser);
  const [open, setOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => { dispatch(fetchAllCategoriesAsync()); dispatch(fetchAllBrandsAsync()); }, [dispatch]);
  React.useEffect(() => { setOpen(false); }, [location.pathname]);
  React.useEffect(() => {
    let robots = document.head.querySelector('meta[name="robots"]');
    if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.appendChild(robots); }
    robots.content = "noindex,nofollow";
  }, []);

  const logout = async () => { await dispatch(logoutAsync()); navigate("/login"); };
  const activeFor = (item) => {
    if (item.to.includes("#")) return location.pathname === item.to.split("#")[0] && location.hash === `#${item.to.split("#")[1]}`;
    if (item.exact) return location.pathname === item.to;
    if (item.to === "/admin/products") return location.pathname.startsWith(item.to) && !location.hash;
    return location.pathname.startsWith(item.to);
  };

  const sidebar = (
    <aside className={`flex h-full flex-col bg-[#151922] px-3 py-5 text-white transition-[width] ${collapsed ? "lg:w-[86px]" : "w-[272px] lg:w-[272px]"}`}>
      <div className="mb-7 flex items-center justify-between px-2">
        {!collapsed ? <Link to="/admin" className="block"><img src="/brand/sastify-logo-dark.png" alt="Sastify" className="h-12 w-auto max-w-[150px] object-contain" /><span className="mt-1 block text-xs font-medium text-white/65">Admin Console</span></Link> : <img src="/brand/sastify-app-icon.png" alt="" className="h-11 w-11 object-contain" />}
        <button type="button" onClick={() => setCollapsed((value) => !value)} className="hidden h-9 w-9 place-items-center rounded-lg text-white/65 hover:bg-white/10 hover:text-white lg:grid" aria-label="Toggle sidebar"><FiChevronLeft className={collapsed ? "rotate-180" : ""} /></button>
      </div>
      <nav className="space-y-1.5" aria-label="Admin navigation">
        {navItems.map(({ label, to, icon: Icon, ...item }) => <Link key={label} to={to} className={`flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition ${activeFor({ to, ...item }) ? "bg-[linear-gradient(135deg,#8d6a2d,#65502d)] text-white shadow-lg" : "text-white/72 hover:bg-white/[.07] hover:text-white"}`}><Icon className="shrink-0 text-lg" />{!collapsed ? <span>{label}</span> : <span className="sr-only">{label}</span>}</Link>)}
      </nav>
      <div className="mt-5 border-t border-white/10 pt-5">
        <Link to="/admin/products#settings" className="flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold text-white/72 hover:bg-white/[.07] hover:text-white"><FiSettings className="text-lg" />{!collapsed ? "Settings" : <span className="sr-only">Settings</span>}</Link>
        <Link to="/" className="flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold text-white/72 hover:bg-white/[.07] hover:text-white"><FiExternalLink className="text-lg" />{!collapsed ? "View storefront" : <span className="sr-only">View storefront</span>}</Link>
        <button type="button" onClick={logout} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-semibold text-white/72 hover:bg-white/[.07] hover:text-white"><FiLogOut className="text-lg" />{!collapsed ? "Sign out" : <span className="sr-only">Sign out</span>}</button>
      </div>
      {!collapsed ? <button type="button" onClick={() => setCollapsed(true)} className="mt-auto flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-white/70 hover:bg-white/[.07]"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#8d6a2d]"><FiChevronLeft /></span>Collapse</button> : null}
    </aside>
  );

  return <div className="min-h-screen bg-[#fbfaf7] text-[#1d2026]">
    <ScrollToTop />
    <div className="flex min-h-screen">
      <div className="sticky top-0 hidden h-screen shrink-0 lg:block">{sidebar}</div>
      <AnimatePresence>{open ? <motion.div className="fixed inset-0 z-50 bg-black/55 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}><motion.div className="h-full w-[272px]" initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} onClick={(event) => event.stopPropagation()}>{sidebar}<button type="button" className="absolute left-[286px] top-4 grid h-10 w-10 place-items-center rounded-full bg-white text-black" onClick={() => setOpen(false)}><FiX /></button></motion.div></motion.div> : null}</AnimatePresence>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-[#e5dfd5] bg-[#fbfaf7]/95 backdrop-blur-xl">
          <div className="flex min-h-[76px] items-center gap-4 px-4 sm:px-7">
            <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-[#ded7cb] lg:hidden"><FiMenu /></button>
            <div className="relative ml-auto hidden w-full max-w-[360px] md:block"><FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#777b83]" /><input aria-label="Search admin console" placeholder="Search anything..." className="h-11 w-full rounded-xl border border-[#ded7cb] bg-white pl-11 pr-4 text-sm outline-none focus:border-[#a77d32]" /></div>
            <button type="button" className="relative grid h-11 w-11 place-items-center rounded-xl text-xl"><FiBell /><span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#b88731] px-1 text-[9px] font-bold text-white">3</span></button>
            <div className="hidden items-center gap-3 sm:flex"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#efe3ca] font-bold text-[#8a662a]">{(user?.name || "A").charAt(0).toUpperCase()}</span><div><p className="text-sm font-bold">Hi, {user?.name?.split(" ")[0] || "Admin"}</p><p className="text-xs text-[#777b83]">Store administrator</p></div></div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-7 lg:py-7"><Outlet /></main>
      </div>
    </div>
  </div>;
};
