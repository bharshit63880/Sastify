import React from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "../../../theme/ThemeToggle";

export const AccountMenu = ({ open, user, onClose, onLogout }) => {
  if (!open) return null;
  const links = user ? [
    { label: "Account", to: "/account" },
    { label: "Orders", to: "/orders" },
    { label: "Wishlist", to: "/wishlist" },
    ...(user.isAdmin ? [{ label: "Admin dashboard", to: "/admin" }] : []),
  ] : [
    { label: "Login", to: "/login" },
    { label: "Create account", to: "/signup" },
  ];
  return (
    <div className="absolute right-0 top-[calc(100%+10px)] w-64 rounded-2xl border border-glass bg-glass p-3 shadow-lg backdrop-blur-2xl" role="menu">
      {user ? <div className="border-b border-default px-3 pb-3"><p className="truncate font-semibold text-primary">{user.name || "Your account"}</p><p className="truncate text-xs text-secondary">{user.email}</p></div> : null}
      <div className="py-2">
        {links.map((item) => <Link role="menuitem" key={item.to} to={item.to} onClick={onClose} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-secondary hover:bg-surface-muted hover:text-primary">{item.label}</Link>)}
      </div>
      <div className="border-t border-default px-2 pt-3"><p className="mb-2 px-1 text-label text-muted">Theme</p><ThemeToggle compact className="w-full justify-between" /></div>
      {user ? <button role="menuitem" type="button" onClick={onLogout} className="mt-3 w-full rounded-xl border border-error/30 px-3 py-2.5 text-left text-sm font-semibold text-error hover:bg-error/10">Logout</button> : null}
    </div>
  );
};
