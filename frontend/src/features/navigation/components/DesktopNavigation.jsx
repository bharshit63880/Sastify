import React from "react";
import { FiChevronDown } from "react-icons/fi";
import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `rounded-pill px-3 py-2 text-sm font-semibold transition-colors ${isActive ? "bg-surface-muted text-primary" : "text-secondary hover:text-primary"}`;

export const DesktopNavigation = ({ categoriesOpen, onCategoriesToggle }) => (
  <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
    <NavLink to="/" className={linkClass}>Home</NavLink>
    <NavLink to="/products" className={linkClass}>Shop</NavLink>
    <button
      type="button"
      aria-expanded={categoriesOpen}
      aria-controls="category-mega-menu"
      onClick={onCategoriesToggle}
      className="inline-flex items-center gap-1 rounded-pill px-3 py-2 text-sm font-semibold text-secondary transition-colors hover:text-primary"
    >
      Categories <FiChevronDown className={categoriesOpen ? "rotate-180" : ""} />
    </button>
  </nav>
);
