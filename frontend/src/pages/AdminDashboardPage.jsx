import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PageWrapper } from "../components/ui/PageWrapper";
import {
  createBrand,
  createBanner,
  createCategory,
  createCoupon,
  deleteBrand,
  deleteBanner,
  deleteCategory,
  getAdminOverview,
  getAdminUsers,
  getCoupons,
  getBanners,
  updateAdminUser,
  updateCoupon,
  updateBanner,
} from "../features/admin/AdminApi";
import { fetchAllBrands } from "../features/brands/BrandApi";
import { fetchAllCategories } from "../features/categories/CategoriesApi";
import { deleteProductById, fetchProducts, undeleteProductById } from "../features/products/ProductApi";

const panelClassName = "rounded-[30px] border border-border bg-surface p-5 shadow-card sm:p-6";

const StatCard = ({ label, value }) => (
  <div className={`${panelClassName} py-5`}>
    <p className="text-sm text-textSecondary">{label}</p>
    <p className="mt-3 text-3xl font-semibold tracking-tight text-textPrimary">{value}</p>
  </div>
);

const rowActionClass =
  "inline-flex items-center justify-center rounded-full border border-border px-3.5 py-2 text-sm font-semibold text-textPrimary transition hover:bg-surface";

export const AdminDashboardPage = () => {
  const [overview, setOverview] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [loadError, setLoadError] = useState("");
  const [coupon, setCoupon] = useState({
    code: "",
    title: "",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 0,
  });
  const [banner, setBanner] = useState({ image: "", title: "", subtitle: "", ctaText: "", ctaLink: "", priority: 0, isActive: true });

  const loadDashboard = async () => {
    setLoadError("");
    const [overviewData, productData, usersData, couponsData, categoriesData, brandsData, bannersData] = await Promise.all([
      getAdminOverview(),
      fetchProducts({ admin: true, pagination: { page: 1, limit: 8 } }),
      getAdminUsers(),
      getCoupons(),
      fetchAllCategories(),
      fetchAllBrands(),
      getBanners(),
    ]);

    setOverview(overviewData);
    setProducts(productData.data || []);
    setUsers(usersData || []);
    setCoupons(couponsData || []);
    setCategoryList(categoriesData || []);
    setBrandList(brandsData || []);
    setBanners(bannersData || []);
  };

  useEffect(() => {
    loadDashboard().catch((error) => setLoadError(error?.message || "Admin data is unavailable."));
  }, []);

  const summaryCards = useMemo(
    () =>
      overview
        ? [
            { label: "Total sales", value: `Rs. ${Number(overview.totalSales || 0).toLocaleString("en-IN")}` },
            { label: "Total orders", value: Number(overview.totalOrders || 0).toLocaleString("en-IN") },
            { label: "Total users", value: Number(overview.totalUsers || 0).toLocaleString("en-IN") },
            { label: "Total products", value: Number(overview.totalProducts || 0).toLocaleString("en-IN") },
            { label: "Average order value", value: `Rs. ${Number(overview.averageOrderValue || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}` },
          ]
        : [],
    [overview]
  );

  return (
    <PageWrapper className="py-0">
      <div className="space-y-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-textPrimary">Admin dashboard</h1>
            <p className="text-sm leading-6 text-textSecondary">
              Clean control over products, categories, users, orders, and offers.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button to="/admin/products/new">Add product</Button>
            <Button to="/admin/orders" variant="secondary">
              Manage orders
            </Button>
            <Button to="/admin/users" variant="secondary">
              Manage users
            </Button>
          </div>
        </div>

        {loadError ? <p role="alert" className="rounded-xl border border-error/30 bg-error/5 p-4 text-sm text-error">{loadError}</p> : null}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map((card) => (
            <StatCard key={card.label} label={card.label} value={card.value} />
          ))}
        </div>
        {overview ? <div className="grid gap-6 xl:grid-cols-2"><section className={panelClassName}><h2 className="text-2xl font-semibold text-text-primary">Order status breakdown</h2><div className="mt-5 space-y-3">{overview.orderStatusBreakdown?.map((row) => <div key={row._id || "unknown"} className="flex items-center justify-between rounded-xl bg-surface p-4"><span className="capitalize text-text-secondary">{(row._id || "unknown").replaceAll("_", " ")}</span><strong className="text-text-primary">{row.count}</strong></div>)}</div></section><section className={panelClassName}><h2 className="text-2xl font-semibold text-text-primary">Top products</h2><div className="mt-5 space-y-3">{overview.topProducts?.map((row) => <div key={row._id} className="flex items-center justify-between rounded-xl bg-surface p-4"><div><p className="font-semibold text-text-primary">{row.name || "Deleted product"}</p><p className="text-xs text-text-secondary">{row.units} units</p></div><strong className="text-text-primary">Rs. {Number(row.revenue || 0).toLocaleString("en-IN")}</strong></div>)}</div></section></div> : null}

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className={panelClassName}>
            <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-textPrimary">Recent products</h2>
                <p className="mt-2 text-sm text-textSecondary">Edit, archive, or restore products directly from the dashboard.</p>
              </div>
              <Button to="/admin/products/new" variant="ghost">
                Create
              </Button>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-border text-textSecondary">
                  <tr>
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((product) => (
                    <tr key={product._id} className="align-top">
                      <td className="px-4 py-4">
                        <div className="max-w-[260px]">
                          <p className="font-semibold text-textPrimary">{product.name || product.title}</p>
                          <p className="mt-1 text-xs text-textSecondary">{product.slug}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-textSecondary">{product.category?.name || "Unassigned"}</td>
                      <td className="px-4 py-4 text-textPrimary">Rs. {product.price}</td>
                      <td className="px-4 py-4 text-textSecondary">{product.stock}</td>
                      <td className="px-4 py-4">
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
                            product.isDeleted
                              ? "bg-[#fff1f1] text-[#9b4242]"
                              : "bg-surface text-textPrimary",
                          ].join(" ")}
                        >
                          {product.isDeleted ? "Archived" : product.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link to={`/admin/products/${product._id}/edit`} className={rowActionClass}>
                            Edit
                          </Link>
                          {product.isDeleted ? (
                            <button
                              type="button"
                              onClick={async () => {
                                await undeleteProductById(product._id);
                                loadDashboard();
                              }}
                              className={rowActionClass}
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={async () => {
                                if (!window.confirm(`Archive ${product.name || product.title}?`)) return;
                                await deleteProductById(product._id);
                                loadDashboard();
                              }}
                              className="inline-flex items-center justify-center rounded-full border border-[#e6caca] px-3.5 py-2 text-sm font-semibold text-[#9b4242] transition hover:bg-[#fff4f4]"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={panelClassName}>
            <div className="border-b border-border pb-5">
              <h2 className="text-2xl font-semibold tracking-tight text-textPrimary">Low stock alerts</h2>
              <p className="mt-2 text-sm text-textSecondary">Products that need attention before they run out.</p>
            </div>

            <div className="mt-5 space-y-3">
              {overview?.lowStockProducts?.map((product) => (
                <div key={product._id} className="rounded-[22px] border border-border bg-surface px-4 py-4">
                  <p className="font-semibold text-textPrimary">{product.name}</p>
                  <p className="mt-1 text-sm text-textSecondary">{product.stock} left</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className={panelClassName}>
            <div className="border-b border-border pb-5">
              <h2 className="text-2xl font-semibold tracking-tight text-textPrimary">Categories & brands</h2>
              <p className="mt-2 text-sm text-textSecondary">Add new entries or remove inactive ones without leaving the dashboard.</p>
            </div>

            <div className="mt-5 grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <Input label="New category" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} />
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await createCategory({ name: categoryName });
                    setCategoryName("");
                    loadDashboard();
                  }}
                >
                  Add category
                </Button>

                <div className="space-y-2">
                  {categoryList.slice(0, 8).map((item) => (
                    <div key={item._id} className="flex items-center justify-between rounded-[20px] border border-border bg-surface px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-textPrimary">{item.name}</p>
                        <p className="mt-1 truncate text-xs text-textSecondary">{item.path || item.slug}</p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm(`Delete category ${item.name}?`)) return;
                          await deleteCategory(item._id);
                          loadDashboard();
                        }}
                        className="text-sm font-semibold text-[#9b4242]"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Input label="New brand" value={brandName} onChange={(event) => setBrandName(event.target.value)} />
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await createBrand({ name: brandName });
                    setBrandName("");
                    loadDashboard();
                  }}
                >
                  Add brand
                </Button>

                <div className="space-y-2">
                  {brandList.slice(0, 8).map((item) => (
                    <div key={item._id} className="flex items-center justify-between rounded-[20px] border border-border bg-surface px-4 py-3">
                      <p className="truncate text-sm font-semibold text-textPrimary">{item.name}</p>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm(`Delete brand ${item.name}?`)) return;
                          await deleteBrand(item._id);
                          loadDashboard();
                        }}
                        className="text-sm font-semibold text-[#9b4242]"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className={panelClassName}>
            <div className="border-b border-border pb-5">
              <h2 className="text-2xl font-semibold tracking-tight text-textPrimary">Coupons & offers</h2>
              <p className="mt-2 text-sm text-textSecondary">Create or toggle offers without breaking dashboard flow.</p>
            </div>

            <div className="mt-5 space-y-4">
              <Input
                label="Coupon code"
                value={coupon.code}
                onChange={(event) => setCoupon((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))}
              />
              <Input
                label="Coupon title"
                value={coupon.title}
                onChange={(event) => setCoupon((prev) => ({ ...prev, title: event.target.value }))}
              />
              <Input
                label="Discount type"
                value={coupon.discountType}
                onChange={(event) => setCoupon((prev) => ({ ...prev, discountType: event.target.value }))}
              />
              <Input
                type="number"
                label="Discount value"
                value={coupon.discountValue}
                onChange={(event) => setCoupon((prev) => ({ ...prev, discountValue: Number(event.target.value) }))}
              />
              <Button
                variant="secondary"
                onClick={async () => {
                  await createCoupon(coupon);
                  loadDashboard();
                }}
              >
                Create coupon
              </Button>

              <div className="space-y-2">
                {coupons.map((item) => (
                  <div key={item._id} className="flex items-center justify-between rounded-[20px] border border-border bg-surface px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-textPrimary">{item.code}</p>
                      <p className="mt-1 text-xs text-textSecondary">{item.title}</p>
                    </div>
                    <label className="flex items-center gap-3 text-sm text-textSecondary">
                      <input
                        type="checkbox"
                        checked={item.active}
                        onChange={async (event) => {
                          await updateCoupon(item._id, { active: event.target.checked });
                          loadDashboard();
                        }}
                        className="h-4 w-4 accent-primary"
                      />
                      Active
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className={panelClassName}>
          <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-textPrimary">User management</h2>
              <p className="mt-2 text-sm text-textSecondary">Update roles and control account access from one aligned table.</p>
            </div>
            <Button to="/admin/users" variant="ghost">
              View all users
            </Button>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border text-textSecondary">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Blocked</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.slice(0, 8).map((user) => (
                  <tr key={user._id}>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-semibold text-textPrimary">{user.name}</p>
                        <p className="mt-1 text-xs text-textSecondary">
                          {user.isVerified ? "Verified user" : "Pending verification"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-textSecondary">{user.email}</td>
                    <td className="px-4 py-4">
                      <select
                        className="input-base min-w-[120px]"
                        value={user.role || (user.isAdmin ? "admin" : "user")}
                        onChange={async (event) => {
                          await updateAdminUser(user._id, {
                            role: event.target.value,
                            isBlocked: user.isBlocked,
                          });
                          loadDashboard();
                        }}
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
                          user.isBlocked ? "bg-[#fff1f1] text-[#9b4242]" : "bg-surface text-textPrimary",
                        ].join(" ")}
                      >
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={async () => {
                          await updateAdminUser(user._id, {
                            isBlocked: !user.isBlocked,
                            role: user.role,
                          });
                          loadDashboard();
                        }}
                        className={rowActionClass}
                      >
                        {user.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className={panelClassName}>
          <div className="border-b border-border pb-5"><h2 className="text-2xl font-semibold text-text-primary">Homepage banners</h2><p className="mt-2 text-sm text-text-secondary">Manage only fields supported by the existing banner schema.</p></div>
          <div className="mt-5 grid gap-6 xl:grid-cols-[.8fr_1.2fr]"><div className="grid gap-4"><Input label="Image URL" value={banner.image} onChange={(event) => setBanner((value) => ({ ...value, image: event.target.value }))} /><Input label="Title" value={banner.title} onChange={(event) => setBanner((value) => ({ ...value, title: event.target.value }))} /><Input label="Subtitle" value={banner.subtitle} onChange={(event) => setBanner((value) => ({ ...value, subtitle: event.target.value }))} /><Input label="CTA text" value={banner.ctaText} onChange={(event) => setBanner((value) => ({ ...value, ctaText: event.target.value }))} /><Input label="CTA route" value={banner.ctaLink} onChange={(event) => setBanner((value) => ({ ...value, ctaLink: event.target.value }))} /><Input type="number" label="Priority" value={banner.priority} onChange={(event) => setBanner((value) => ({ ...value, priority: Number(event.target.value) }))} /><label className="flex items-center gap-2 text-sm text-text-primary"><input type="checkbox" checked={banner.isActive} onChange={(event) => setBanner((value) => ({ ...value, isActive: event.target.checked }))} />Active</label><Button disabled={!banner.image || !banner.title} onClick={async () => { await createBanner(banner); setBanner({ image: "", title: "", subtitle: "", ctaText: "", ctaLink: "", priority: 0, isActive: true }); loadDashboard(); }}>Create banner</Button></div><div className="grid gap-3 sm:grid-cols-2">{banners.map((item) => <article key={item._id} className="overflow-hidden rounded-2xl border border-default bg-surface"><img src={item.image} alt="" className="aspect-[16/7] w-full object-cover" loading="lazy" /><div className="p-4"><h3 className="font-semibold text-text-primary">{item.title}</h3><p className="mt-1 text-sm text-text-secondary">{item.subtitle}</p><div className="mt-4 flex flex-wrap gap-2"><Button variant="secondary" onClick={async () => { await updateBanner(item._id, { isActive: !item.isActive }); loadDashboard(); }}>{item.isActive ? "Deactivate" : "Activate"}</Button><Button variant="ghost" onClick={async () => { if (!window.confirm(`Delete banner ${item.title}?`)) return; await deleteBanner(item._id); loadDashboard(); }}>Delete</Button></div></div></article>)}</div></div>
        </section>
      </div>
    </PageWrapper>
  );
};
