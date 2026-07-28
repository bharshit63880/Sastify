import React, { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FiArrowRight, FiCheck, FiCheckCircle, FiPackage } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/ui/Button";
import { ImageWithFallback } from "../components/ui/ImageWithFallback";
import { PageWrapper } from "../components/ui/PageWrapper";
import { CheckoutSummarySkeleton, SkeletonRegion } from "../components/ui/Skeleton";
import { formatPrice } from "../utils/currencyFormatter";
import { getOrderByIdAsync, selectOrderDetails, selectOrderFetchStatus, selectOrdersErrors } from "../features/order/OrderSlice";

const confetti = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${6 + ((index * 37) % 88)}%`,
  delay: (index % 6) * 0.08,
  color: ["bg-brand-primary", "bg-accent", "bg-success", "bg-warning"][index % 4],
}));

export const OrderSuccessPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const reducedMotion = useReducedMotion();
  const order = useSelector(selectOrderDetails);
  const status = useSelector(selectOrderFetchStatus);
  const error = useSelector(selectOrdersErrors);

  useEffect(() => { dispatch(getOrderByIdAsync(id)); }, [dispatch, id]);

  if (status === "pending" || status === "idle") return <PageWrapper className="py-10"><SkeletonRegion label="Loading order confirmation"><div className="mx-auto max-w-3xl"><CheckoutSummarySkeleton /></div></SkeletonRegion></PageWrapper>;
  if (status === "rejected" || !order?._id) return <EmptyState title="We could not load this order" description={error?.message || "Your confirmation is safe in Orders. Try opening it again."} actionLabel="View your orders" actionTo="/orders" />;

  return (
    <PageWrapper className="relative overflow-hidden py-8 sm:py-12">
      {!reducedMotion ? <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-72 overflow-hidden">{confetti.map((piece) => <motion.span key={piece.id} className={`absolute top-0 h-3 w-2 rounded-sm ${piece.color}`} style={{ left: piece.left }} initial={{ y: -20, rotate: 0, opacity: 0 }} animate={{ y: 260, rotate: 360, opacity: [0, 1, 0] }} transition={{ duration: 1.8, delay: piece.delay, ease: "easeOut" }} />)}</div> : null}
      <motion.div initial={reducedMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative mx-auto max-w-4xl">
        <section className="rounded-2xl border border-default bg-surface-glass p-6 text-center shadow-lg backdrop-blur-xl sm:p-10">
          <motion.div initial={reducedMotion ? false : { scale: 0.7 }} animate={{ scale: 1 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/10 text-4xl text-success"><FiCheckCircle /></motion.div>
          <p className="mt-6 text-label text-success">Order confirmed</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-text-primary sm:text-5xl">Thank you for your order</h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-text-secondary">Your order has been received. Its payment and shipping states below come directly from your order record.</p>
          <div className="mt-7 grid gap-3 text-left sm:grid-cols-3">
            <div className="rounded-xl bg-surface-muted p-4"><p className="text-xs text-text-secondary">Order number</p><p className="mt-1 font-semibold text-text-primary">{order.orderNumber}</p></div>
            <div className="rounded-xl bg-surface-muted p-4"><p className="text-xs text-text-secondary">Payment</p><p className="mt-1 font-semibold capitalize text-text-primary">{order.paymentStatus?.replaceAll("_", " ")}</p></div>
            <div className="rounded-xl bg-surface-muted p-4"><p className="text-xs text-text-secondary">Shipping</p><p className="mt-1 font-semibold capitalize text-text-primary">{order.orderStatus?.replaceAll("_", " ")}</p></div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-default bg-surface p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between gap-4"><div><p className="text-label text-text-secondary">Order summary</p><h2 className="mt-2 text-2xl font-semibold text-text-primary">{order.items?.length || 0} item{order.items?.length === 1 ? "" : "s"}</h2></div><FiPackage className="text-2xl text-brand-primary" /></div>
          <div className="mt-6 divide-y divide-default">
            {order.items?.map((item, index) => <article key={`${item.product}-${index}`} className="flex gap-4 py-4 first:pt-0">
              <ImageWithFallback src={item.image} alt={item.name} wrapperClassName="h-20 w-16 shrink-0 rounded-lg bg-surface-muted" className="object-cover" />
              <div className="min-w-0 flex-1"><h3 className="line-clamp-2 font-semibold text-text-primary">{item.name}</h3><p className="mt-1 text-sm text-text-secondary">Qty {item.quantity}{item.selectedVariant?.color ? ` · ${item.selectedVariant.color}` : ""}{item.selectedVariant?.size ? ` · ${item.selectedVariant.size}` : ""}</p></div>
              <strong className="text-text-primary">{formatPrice(item.totalPrice)}</strong>
            </article>)}
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-default pt-5"><span className="font-semibold text-text-primary">Order total</span><strong className="text-2xl text-text-primary">{formatPrice(order.pricing?.total)}</strong></div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center"><Button to={`/orders/${id}`} icon={<FiArrowRight />}>View order</Button><Button to="/products" variant="secondary" icon={<FiCheck />}>Continue shopping</Button></div>
        </section>
      </motion.div>
    </PageWrapper>
  );
};
