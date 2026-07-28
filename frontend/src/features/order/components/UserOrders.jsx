import React, { useEffect, useMemo, useState } from "react";
import { FiArrowRight, FiPackage, FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { EmptyState } from "../../../components/EmptyState";
import { LoadingState } from "../../../components/LoadingState";
import { Card } from "../../../components/ui/Card";
import { ImageWithFallback } from "../../../components/ui/ImageWithFallback";
import { formatPrice } from "../../../utils/currencyFormatter";
import { getOrderByUserIdAsync, selectOrderFetchStatus, selectOrders, selectOrdersErrors } from "../OrderSlice";

export const UserOrders = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);
  const status = useSelector(selectOrderFetchStatus);
  const error = useSelector(selectOrdersErrors);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  useEffect(() => { dispatch(getOrderByUserIdAsync()); }, [dispatch]);
  const statuses = useMemo(() => ["all", ...new Set(orders.map((order) => order.orderStatus).filter(Boolean))], [orders]);
  const visible = useMemo(() => orders.filter((order) => {
    const matchesStatus = filter === "all" || order.orderStatus === filter;
    const haystack = [order.orderNumber, ...(order.items || []).map((item) => item.name)].filter(Boolean).join(" ").toLowerCase();
    return matchesStatus && haystack.includes(query.trim().toLowerCase());
  }), [filter, orders, query]);

  if (status === "pending") return <LoadingState cards={3} />;
  if (status === "rejected") return <EmptyState title="We couldn't load your orders" description={error?.message || "Please try again shortly."} actionLabel="Continue shopping" actionTo="/products" />;
  if (!orders.length) return <EmptyState title="No orders yet" description="Your placed orders and delivery tracking will appear here." actionLabel="Start shopping" actionTo="/products" />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-default bg-surface p-4 sm:flex-row">
        <label className="relative flex-1"><span className="sr-only">Search orders</span><FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order number or product" className="w-full rounded-pill border border-default bg-surface-raised py-3 pl-11 pr-4 text-sm text-text-primary" /></label>
        <label><span className="sr-only">Filter by status</span><select value={filter} onChange={(event) => setFilter(event.target.value)} className="w-full rounded-pill border border-default bg-surface-raised px-4 py-3 text-sm capitalize text-text-primary sm:w-48">{statuses.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select></label>
      </div>
      {visible.map((order) => <Card key={order._id} hover={false}>
        <div className="space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div><h2 className="text-xl font-semibold text-text-primary">Order {order.orderNumber}</h2><p className="mt-1 text-sm text-text-secondary">Placed on {new Date(order.createdAt).toLocaleDateString()}</p></div><div className="flex flex-wrap gap-2"><span className="rounded-pill bg-brand-primary/10 px-3 py-1.5 text-sm capitalize text-brand-primary">{order.orderStatus?.replaceAll("_", " ")}</span><span className="rounded-pill bg-surface-muted px-3 py-1.5 text-sm capitalize text-text-secondary">{order.paymentStatus?.replaceAll("_", " ")}</span></div></div>
          <div className="space-y-3 border-y border-default py-4">{(order.items || []).slice(0, 3).map((item) => <div key={item.product} className="flex items-center gap-4 text-sm"><ImageWithFallback src={item.image} alt="" wrapperClassName="h-14 w-12 shrink-0 rounded-lg bg-surface-muted" className="object-cover" /><span className="min-w-0 flex-1 text-text-secondary">{item.name} × {item.quantity}</span><span className="font-medium text-text-primary">{formatPrice(item.totalPrice)}</span></div>)}</div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-lg font-semibold text-text-primary">Total: {formatPrice(order.pricing?.total)}</p><Link to={`/orders/${order._id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary">View details and tracking <FiArrowRight /></Link></div>
        </div>
      </Card>)}
      {!visible.length ? <div className="rounded-2xl border border-dashed border-default p-8 text-center text-text-secondary"><FiPackage className="mx-auto mb-3 text-2xl" />No orders match the current search and status filter.</div> : null}
    </div>
  );
};
