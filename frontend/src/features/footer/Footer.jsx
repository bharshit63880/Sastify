import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Container } from "../../components/ui/Container";
import { selectCategories } from "../categories/CategoriesSlice";
import { buildCategoryTree, getCategoryHref } from "../../utils/categoryTree";

const groups = [
  { title: "Shop", links: [{ label: "All products", to: "/products" }, { label: "Search", to: "/search" }, { label: "Cart", to: "/cart" }] },
  { title: "Account", links: [{ label: "Your account", to: "/account" }, { label: "Orders", to: "/orders" }, { label: "Wishlist", to: "/wishlist" }] },
  { title: "Access", links: [{ label: "Sign in", to: "/login" }, { label: "Create account", to: "/signup" }] },
];

export const Footer = () => {
  const categories = useSelector(selectCategories);
  const roots = buildCategoryTree(categories).roots.slice(0, 5);
  const allGroups = roots.length ? [...groups.slice(0, 1), { title: "Categories", links: roots.map((item) => ({ label: item.name, to: getCategoryHref(item) })) }, ...groups.slice(1)] : groups;
  return (
    <footer className="mt-16 border-t border-default bg-page-secondary/70">
      <Container className="py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_2fr]">
          <div className="max-w-md">
            <Link to="/" className="text-3xl font-bold tracking-[-0.055em] text-text-primary">Sastify</Link>
            <p className="mt-4 text-body">A faster, clearer way to discover products across fashion, technology, home, and everyday essentials.</p>
            <p className="mt-5 text-small">Payments and delivery options are shown accurately during checkout.</p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {allGroups.map((group) => (
              <section key={group.title}>
                <h2 className="text-label text-muted">{group.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((item) => <li key={`${group.title}-${item.to}-${item.label}`}><Link to={item.to} className="text-sm text-text-secondary transition-colors hover:text-text-primary">{item.label}</Link></li>)}
                </ul>
              </section>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-default pt-6 text-small sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Sastify. All rights reserved.</p>
          <p>Built for accessible, responsive shopping.</p>
        </div>
      </Container>
    </footer>
  );
};
