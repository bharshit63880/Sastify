import React from "react";
import { Link } from "react-router-dom";
import { getCategoryHref } from "../../../utils/categoryTree";

export const CategoryMegaMenu = ({ open, roots, onClose }) => {
  if (!open) return null;
  return (
    <div id="category-mega-menu" className="absolute inset-x-0 top-full hidden px-4 pt-3 lg:block">
      <div className="mx-auto grid max-w-[1080px] grid-cols-3 gap-6 rounded-2xl border border-glass bg-glass p-6 shadow-lg backdrop-blur-2xl xl:grid-cols-4">
        {roots.slice(0, 8).map((root) => (
          <section key={root._id}>
            <Link to={getCategoryHref(root)} onClick={onClose} className="font-semibold text-primary hover:text-brand-primary">{root.name}</Link>
            <div className="mt-2 space-y-1">
              {root.children.slice(0, 5).map((child) => <Link key={child._id} to={getCategoryHref(child)} onClick={onClose} className="block py-1 text-sm text-secondary hover:text-primary">{child.name}</Link>)}
            </div>
          </section>
        ))}
        {!roots.length ? <p className="col-span-full py-8 text-center text-secondary">Categories are loading.</p> : null}
      </div>
    </div>
  );
};
