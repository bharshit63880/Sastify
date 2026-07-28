import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FiHeart, FiLogOut, FiMapPin, FiPackage, FiPlus, FiTrash2, FiUser } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { PageWrapper } from "../components/ui/PageWrapper";
import { ThemeToggle } from "../theme/ThemeToggle";
import { addAddressAsync, deleteAddressByIdAsync, selectAddressAddStatus, selectAddressDeleteStatus, selectAddressErrors, selectAddressUpdateStatus, selectAddresses, updateAddressByIdAsync } from "../features/address/AddressSlice";
import { logoutAsync, selectLoggedInUser } from "../features/auth/AuthSlice";
import { fetchRecentlyViewedProducts } from "../features/home/recentlyViewed";
import { ProductCard } from "../features/products/components/ProductCard";
import { selectUserInfo, selectUserStatus, updateUserByIdAsync } from "../features/user/UserSlice";
import { selectWishlistItems } from "../features/wishlist/WishlistSlice";

const addressDefaults = { fullName: "", line1: "", line2: "", landmark: "", city: "", state: "", postalCode: "", country: "India", phoneNumber: "", addressType: "home", isDefault: false };

export const UserProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector(selectUserInfo);
  const loggedInUser = useSelector(selectLoggedInUser);
  const user = userInfo || loggedInUser;
  const addresses = useSelector(selectAddresses);
  const wishlist = useSelector(selectWishlistItems);
  const userStatus = useSelector(selectUserStatus);
  const addressError = useSelector(selectAddressErrors);
  const addressPending = [useSelector(selectAddressAddStatus), useSelector(selectAddressUpdateStatus), useSelector(selectAddressDeleteStatus)].includes("pending");
  const [tab, setTab] = useState("overview");
  const [editingAddress, setEditingAddress] = useState(null);
  const [recent, setRecent] = useState([]);
  const { register: registerProfile, handleSubmit: submitProfile, reset: resetProfile, formState: { errors: profileErrors } } = useForm();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: addressDefaults });

  useEffect(() => { resetProfile({ name: user?.name || "", phone: user?.phone || "" }); }, [resetProfile, user]);
  useEffect(() => { fetchRecentlyViewedProducts().then(setRecent).catch(() => setRecent([])); }, []);

  const openAddress = (address = null) => {
    setEditingAddress(address || "new");
    reset(address ? { ...address, line1: address.line1 || address.street } : { ...addressDefaults, fullName: user?.name || "", phoneNumber: user?.phone || "" });
    window.setTimeout(() => document.getElementById("address-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };
  const saveAddress = async (data) => {
    if (editingAddress?._id) await dispatch(updateAddressByIdAsync({ ...data, _id: editingAddress._id })).unwrap();
    else await dispatch(addAddressAsync(data)).unwrap();
    setEditingAddress(null); reset(addressDefaults);
  };
  const removeAddress = (address) => {
    if (window.confirm(`Remove the saved ${address.addressType || address.type || "delivery"} address?`)) dispatch(deleteAddressByIdAsync(address._id));
  };
  const logout = async () => { await dispatch(logoutAsync()); navigate("/login"); };

  const tabs = [
    ["overview", "Overview", FiUser], ["addresses", "Addresses", FiMapPin], ["wishlist", "Wishlist", FiHeart], ["orders", "Orders", FiPackage],
  ];

  return (
    <PageWrapper className="py-8">
      <div className="mb-7"><p className="text-label text-brand-primary">Customer account</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.05em] text-text-primary">Welcome, {user?.name || "customer"}</h1><p className="mt-3 text-text-secondary">Manage the details and saved commerce data supported by your account.</p></div>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl border border-default bg-surface p-3 shadow-sm lg:sticky lg:top-28 lg:self-start">
          <nav aria-label="Account sections" className="flex gap-2 overflow-x-auto lg:flex-col">{tabs.map(([id, label, Icon]) => <button key={id} type="button" aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)} className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${tab === id ? "bg-brand-primary text-white" : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"}`}><Icon />{label}</button>)}</nav>
          <div className="mt-3 border-t border-default pt-3"><div className="mb-2 px-2"><ThemeToggle /></div><button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-error hover:bg-error/5"><FiLogOut />Sign out</button></div>
        </aside>
        <main>
          {tab === "overview" ? <div className="grid gap-5 md:grid-cols-2">
            <Card hover={false}><h2 className="text-2xl font-semibold text-text-primary">Profile overview</h2><form className="mt-5 space-y-4" noValidate onSubmit={submitProfile((data) => dispatch(updateUserByIdAsync({ ...data, _id: user._id })))}><Input label="Full name" error={profileErrors.name?.message} {...registerProfile("name", { required: "Name is required" })} /><Input label="Email" value={user?.email || ""} disabled /><Input label="Phone" {...registerProfile("phone")} /><Button type="submit" disabled={userStatus === "pending"}>{userStatus === "pending" ? "Saving…" : "Save profile"}</Button></form></Card>
            <div className="grid gap-5 sm:grid-cols-3 md:grid-cols-1"><Card hover={false}><p className="text-sm text-text-secondary">Saved addresses</p><p className="mt-2 text-3xl font-semibold text-text-primary">{addresses.length}</p></Card><Card hover={false}><p className="text-sm text-text-secondary">Wishlist items</p><p className="mt-2 text-3xl font-semibold text-text-primary">{wishlist.length}</p></Card><Card hover={false}><p className="text-sm text-text-secondary">Recently viewed</p><p className="mt-2 text-3xl font-semibold text-text-primary">{recent.length}</p></Card></div>
            {recent.length ? <section className="md:col-span-2"><h2 className="mb-5 text-2xl font-semibold text-text-primary">Recently viewed</h2><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{recent.slice(0, 3).map((product) => <ProductCard key={product._id} product={product} />)}</div></section> : null}
          </div> : null}
          {tab === "addresses" ? <section><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-3xl font-semibold text-text-primary">Saved addresses</h2><p className="mt-2 text-sm text-text-secondary">Default status is synchronized by the existing address API.</p></div><Button icon={<FiPlus />} onClick={() => openAddress()}>Add address</Button></div>
            {addressError ? <p role="alert" className="mt-4 rounded-xl border border-error/30 bg-error/5 p-3 text-sm text-error">{addressError.message || "Address action failed."}</p> : null}
            <div className="mt-5 grid gap-4 md:grid-cols-2">{addresses.map((address) => <article key={address._id} className="rounded-2xl border border-default bg-surface p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold capitalize text-text-primary">{address.addressType || address.type || "Address"}{address.isDefault ? <span className="ml-2 rounded-pill bg-success/10 px-2 py-1 text-xs text-success">Default</span> : null}</p><p className="mt-3 text-sm leading-6 text-text-secondary">{address.fullName || user?.name}<br />{address.line1 || address.street}{address.line2 ? `, ${address.line2}` : ""}<br />{address.city}, {address.state} - {address.postalCode}<br />{address.country} · {address.phoneNumber}</p></div><button type="button" aria-label="Delete address" onClick={() => removeAddress(address)} className="text-error"><FiTrash2 /></button></div><div className="mt-4 flex flex-wrap gap-2"><Button variant="secondary" onClick={() => openAddress(address)}>Edit</Button>{!address.isDefault ? <Button variant="ghost" disabled={addressPending} onClick={() => dispatch(updateAddressByIdAsync({ ...address, _id: address._id, isDefault: true }))}>Set default</Button> : null}</div></article>)}</div>
            {!addresses.length && !editingAddress ? <div className="mt-6 rounded-2xl border border-dashed border-default p-8 text-center text-text-secondary">No saved addresses yet.</div> : null}
            {editingAddress ? <form id="address-form" onSubmit={handleSubmit(saveAddress)} className="mt-6 grid scroll-mt-28 gap-4 rounded-2xl border border-default bg-surface p-5 md:grid-cols-2" noValidate><h3 className="text-xl font-semibold text-text-primary md:col-span-2">{editingAddress?._id ? "Edit address" : "New address"}</h3><Input label="Full name" error={errors.fullName?.message} {...register("fullName", { required: "Full name is required" })} /><Input label="Phone number" error={errors.phoneNumber?.message} {...register("phoneNumber", { required: "Phone is required" })} /><div className="md:col-span-2"><Input label="Address line 1" error={errors.line1?.message} {...register("line1", { required: "Address is required" })} /></div><Input label="Address line 2" {...register("line2")} /><Input label="Landmark" {...register("landmark")} /><Input label="City" error={errors.city?.message} {...register("city", { required: "City is required" })} /><Input label="State" error={errors.state?.message} {...register("state", { required: "State is required" })} /><Input label="Postal code" error={errors.postalCode?.message} {...register("postalCode", { required: "Postal code is required" })} /><Input label="Country" error={errors.country?.message} {...register("country", { required: "Country is required" })} /><label className="text-sm text-text-secondary">Address type<select {...register("addressType")} className="mt-2 w-full rounded-xl border border-default bg-surface-raised p-3 text-text-primary"><option value="home">Home</option><option value="office">Office</option><option value="other">Other</option></select></label><label className="flex items-center gap-2 self-end pb-3 text-sm text-text-primary"><input type="checkbox" {...register("isDefault")} />Set as default</label><div className="flex gap-3 md:col-span-2"><Button type="submit" disabled={addressPending}>{addressPending ? "Saving…" : "Save address"}</Button><Button type="button" variant="secondary" onClick={() => setEditingAddress(null)}>Cancel</Button></div></form> : null}
          </section> : null}
          {tab === "wishlist" ? <section><h2 className="text-3xl font-semibold text-text-primary">Wishlist</h2><p className="mt-3 text-text-secondary">Your saved products are available on the dedicated wishlist page.</p><Button to="/wishlist" className="mt-5">Open wishlist</Button></section> : null}
          {tab === "orders" ? <section><h2 className="text-3xl font-semibold text-text-primary">Orders</h2><p className="mt-3 text-text-secondary">Search, filter, and track orders from your order history.</p><Button to="/orders" className="mt-5">Open order history</Button></section> : null}
        </main>
      </div>
    </PageWrapper>
  );
};
