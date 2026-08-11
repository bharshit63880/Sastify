import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ProductList } from "../features/products/components/ProductList";
import { selectCategories } from "../features/categories/CategoriesSlice";
import {
  buildCategoryTree,
  getCategoryAncestors,
  getCategoryHref,
  getCategoryNode,
  getLeafCategories,
  getRootCategory,
  resolveCategoryFromSegments,
} from "../utils/categoryTree";

const emptyArray = [];

export const CategoryPage = () => {
  const { slug, parent, child, grandchild } = useParams();
  const categories = useSelector(selectCategories);
  const { roots, nodesById } = useMemo(() => buildCategoryTree(categories), [categories]);
  const category = useMemo(() => resolveCategoryFromSegments(categories, [slug, parent, child, grandchild]), [categories, slug, parent, child, grandchild]);
  const categoryNode = useMemo(() => getCategoryNode(category, nodesById), [category, nodesById]);
  const leafScope = useMemo(() => categoryNode ? getLeafCategories(categoryNode, nodesById) : emptyArray, [categoryNode, nodesById]);
  const baseFilters = useMemo(() => ({ category: leafScope.map((item) => item._id) }), [leafScope]);
  const ancestry = useMemo(() => categoryNode ? [...getCategoryAncestors(categoryNode, nodesById), categoryNode] : emptyArray, [categoryNode, nodesById]);

  const relatedCategories = useMemo(() => {
    if (!categoryNode) return roots.slice(0, 8);
    if (categoryNode.children.length) return categoryNode.children;
    const parentNode = categoryNode.parentId ? nodesById.get(String(categoryNode.parentId)) : null;
    if (parentNode?.children.length) return parentNode.children.filter((item) => String(item._id) !== String(categoryNode._id));
    const rootNode = getRootCategory(categoryNode, nodesById);
    return roots.filter((item) => String(item._id) !== String(rootNode?._id)).slice(0, 8);
  }, [categoryNode, nodesById, roots]);

  const headerContent = useMemo(() => (
    <div className="flex flex-wrap items-center gap-3">
      <span className="inline-flex rounded-full bg-[#202124] px-5 py-2.5 text-sm font-semibold text-white">All</span>
      {relatedCategories.slice(0, 8).map((item) => (
        <Link key={item._id} to={getCategoryHref(item)} className="inline-flex rounded-full border border-default bg-transparent px-5 py-2.5 text-sm font-medium text-text-primary transition hover:border-[#b38a3d] hover:text-[#9a742f]">
          {item.name}
        </Link>
      ))}
    </div>
  ), [relatedCategories]);

  return (
    <ProductList
      title={category?.name || "Category"}
      description={category?.description || ""}
      baseFilters={baseFilters}
      headerContent={headerContent}
      breadcrumbs={[
        { label: "Home", to: "/" },
        { label: "Products", to: "/products" },
        ...ancestry.map((item, index) => ({ label: item.name, to: index < ancestry.length - 1 ? getCategoryHref(item) : undefined })),
      ]}
    />
  );
};
