import React, { useState } from "react";
import { FiChevronDown, FiHeart, FiPackage, FiShoppingCart, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Drawer } from "../../../components/ui/Drawer";
import { IconButton } from "../../../components/ui/IconButton";
import { ThemeToggle } from "../../../theme/ThemeToggle";
import { getCategoryHref } from "../../../utils/categoryTree";
import { useAppShell } from "../../shell/AppShellContext";
import { NavbarLogo } from "./NavbarLogo";

export const MobileMenu = ({ roots, user, onLogout }) => {
  const { isMobileMenuOpen, closeOverlay, openOverlay } = useAppShell();
  const [expanded, setExpanded] = useState("");
  const closeAnd = (callback) => { closeOverlay(); callback?.(); };
  return (
    <Drawer open={isMobileMenuOpen} onClose={closeOverlay} title="Navigation menu" side="left" className="max-w-[360px]">
      <div className="flex items-center justify-between border-b border-default p-4"><NavbarLogo onClick={closeOverlay} /><IconButton label="Close menu" onClick={closeOverlay}><FiX /></IconButton></div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <nav aria-label="Mobile navigation" className="space-y-1">
          <Link to="/" onClick={closeOverlay} className="block rounded-xl px-3 py-3 font-semibold text-primary hover:bg-surface-muted">Home</Link>
          <Link to="/products" onClick={closeOverlay} className="block rounded-xl px-3 py-3 font-semibold text-primary hover:bg-surface-muted">Shop all</Link>
          <button type="button" onClick={() => closeAnd(() => openOverlay("search"))} className="block w-full rounded-xl px-3 py-3 text-left font-semibold text-primary hover:bg-surface-muted">Search</button>
        </nav>
        <div className="my-5 border-t border-default pt-4">
          <p className="mb-2 px-3 text-label text-muted">Categories</p>
          {roots.map((root) => {
            const open = expanded === String(root._id);
            return <div key={root._id}>
              <div className="flex items-center">
                <Link to={getCategoryHref(root)} onClick={closeOverlay} className="min-w-0 flex-1 rounded-xl px-3 py-2.5 font-medium text-primary hover:bg-surface-muted">{root.name}</Link>
                {root.children.length ? <IconButton label={`${open ? "Collapse" : "Expand"} ${root.name}`} size="sm" aria-expanded={open} onClick={() => setExpanded(open ? "" : String(root._id))}><FiChevronDown className={open ? "rotate-180" : ""} /></IconButton> : null}
              </div>
              {open ? <div className="ml-4 border-l border-default pl-2">{root.children.map((child) => <Link key={child._id} to={getCategoryHref(child)} onClick={closeOverlay} className="block rounded-lg px-3 py-2 text-sm text-secondary hover:text-primary">{child.name}</Link>)}</div> : null}
            </div>;
          })}
        </div>
        <div className="grid gap-2 border-t border-default pt-4">
          <Link to={user ? "/orders" : "/login"} onClick={closeOverlay} className="flex items-center gap-3 rounded-xl px-3 py-3 text-secondary hover:bg-surface-muted hover:text-primary"><FiPackage />Orders</Link>
          <Link to={user ? "/wishlist" : "/login"} onClick={closeOverlay} className="flex items-center gap-3 rounded-xl px-3 py-3 text-secondary hover:bg-surface-muted hover:text-primary"><FiHeart />Wishlist</Link>
          <button type="button" onClick={() => closeAnd(() => openOverlay("cart"))} className="flex items-center gap-3 rounded-xl px-3 py-3 text-secondary hover:bg-surface-muted hover:text-primary"><FiShoppingCart />Cart</button>
          <Link to={user ? "/account" : "/login"} onClick={closeOverlay} className="rounded-xl px-3 py-3 text-secondary hover:bg-surface-muted hover:text-primary">{user ? "Account" : "Login"}</Link>
          {!user ? <Link to="/signup" onClick={closeOverlay} className="rounded-xl px-3 py-3 text-secondary hover:bg-surface-muted hover:text-primary">Create account</Link> : null}
          {user?.isAdmin ? <Link to="/admin" onClick={closeOverlay} className="rounded-xl px-3 py-3 text-secondary hover:bg-surface-muted hover:text-primary">Admin dashboard</Link> : null}
          {user ? <button type="button" onClick={onLogout} className="rounded-xl px-3 py-3 text-left font-semibold text-error hover:bg-error/10">Logout</button> : null}
        </div>
      </div>
      <div className="border-t border-default p-4"><p className="mb-2 text-label text-muted">Appearance</p><ThemeToggle className="w-full justify-between" /></div>
    </Drawer>
  );
};
