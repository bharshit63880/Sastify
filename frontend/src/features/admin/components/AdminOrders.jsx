import React, { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/EmptyState";
import { LoadingState } from "../../../components/LoadingState";
import { formatPrice } from "../../../utils/currencyFormatter";
import { getAllOrdersAsync, selectOrderFetchStatus, selectOrderUpdateStatus, selectOrders, selectOrdersErrors, updateOrderByIdAsync } from "../../order/OrderSlice";

const statuses = ["pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"];

export const AdminOrders = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);
  const fetchStatus = useSelector(selectOrderFetchStatus);
  const updateStatus = useSelector(selectOrderUpdateStatus);
  const error = useSelector(selectOrdersErrors);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [nextStatus, setNextStatus] = useState("");
  useEffect(() => { dispatch(getAllOrdersAsync()); }, [dispatch]);
  const visible = useMemo(() => orders.filter((order) => {
    const text = [order.orderNumber, order.addressSnapshot?.fullName, order.addressSnapshot?.phoneNumber, ...(order.items || []).map((item) => item.name)].filter(Boolean).join(" ").toLowerCase();
    return (filter === "all" || order.orderStatus === filter) && text.includes(query.trim().toLowerCase());
  }), [filter, orders, query]);
  const save = async (order) => {
    if (!nextStatus || nextStatus === order.orderStatus) { setEditing(null); return; }
    if (!window.confirm(`Change order ${order.orderNumber} status to ${nextStatus.replaceAll("_", " ")}?`)) return;
    await dispatch(updateOrderByIdAsync({ _id: order._id, orderStatus: nextStatus })).unwrap();
    setEditing(null);
  };

  if (fetchStatus === "pending") return <LoadingState cards={4} />;
  if (fetchStatus === "rejected") return <EmptyState title="Orders unavailable" description={error?.message || "Admin orders could not be loaded."} actionLabel="Return to dashboard" actionTo="/admin" />;
  return (
    <section>
      <div className="mb-6"><h1 className="text-3xl font-semibold text-text-primary">Order management</h1><p className="mt-2 text-text-secondary">Search real orders and apply supported delivery-state transitions.</p></div>
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-default bg-surface p-4 sm:flex-row"><label className="relative flex-1"><span className="sr-only">Search orders</span><FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Order, customer, phone, or product" className="w-full rounded-pill border border-default bg-surface-raised py-3 pl-11 pr-4 text-sm text-text-primary" /></label><select aria-label="Filter order status" value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-pill border border-default bg-surface-raised px-4 py-3 text-sm capitalize text-text-primary"><option value="all">All statuses</option>{statuses.map((item) => <option value={item} key={item}>{item.replaceAll("_", " ")}</option>)}</select></div>
      <div className="overflow-x-auto rounded-2xl border border-default bg-surface"><table className="min-w-[980px] w-full text-left text-sm"><thead className="border-b border-default bg-surface-muted text-text-secondary"><tr><th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Items</th><th className="p-4">Payment</th><th className="p-4">Total</th><th className="p-4">Delivery status</th><th className="p-4">Action</th></tr></thead><tbody className="divide-y divide-default">{visible.map((order) => <tr key={order._id}><td className="p-4"><p className="font-semibold text-text-primary">{order.orderNumber}</p><p className="mt-1 text-xs text-text-secondary">{new Date(order.createdAt).toLocaleString()}</p></td><td className="p-4"><p className="text-text-primary">{order.addressSnapshot?.fullName || "Unavailable"}</p><p className="mt-1 text-xs text-text-secondary">{order.addressSnapshot?.phoneNumber}</p></td><td className="p-4 text-text-secondary">{order.items?.length || 0} item{order.items?.length === 1 ? "" : "s"}</td><td className="p-4"><span className="rounded-pill bg-surface-muted px-3 py-1 capitalize text-text-primary">{order.paymentStatus?.replaceAll("_", " ")}</span></td><td className="p-4 font-semibold text-text-primary">{formatPrice(order.pricing?.total)}</td><td className="p-4">{editing === order._id ? <select aria-label={`New status for ${order.orderNumber}`} value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} className="rounded-lg border border-default bg-surface-raised p-2 text-text-primary">{statuses.map((item) => <option value={item} key={item}>{item.replaceAll("_", " ")}</option>)}</select> : <span className="capitalize text-text-primary">{order.orderStatus?.replaceAll("_", " ")}</span>}</td><td className="p-4">{editing === order._id ? <div className="flex gap-2"><Button disabled={updateStatus === "pending"} onClick={() => save(order)}>Confirm</Button><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button></div> : <Button variant="secondary" onClick={() => { setEditing(order._id); setNextStatus(order.orderStatus); }}>Update</Button>}</td></tr>)}</tbody></table></div>
      {!visible.length ? <p className="py-10 text-center text-text-secondary">No orders match the current filters.</p> : null}
    </section>
  );
};
