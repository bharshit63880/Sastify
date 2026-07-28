import React, { useMemo, useState } from "react";
import { FiImage, FiStar } from "react-icons/fi";
import { ImageWithFallback } from "../../../components/ui/ImageWithFallback";
import { buildRatingHistogram, sortAndFilterReviews } from "../../products/productDetailPresentation";

export const ReviewExperience = ({ reviews, status, error, averageRating = 0 }) => {
  const [sort, setSort] = useState("recent");
  const [rating, setRating] = useState("all");
  const histogram = useMemo(() => buildRatingHistogram(reviews), [reviews]);
  const visible = useMemo(() => sortAndFilterReviews(reviews, sort, rating), [rating, reviews, sort]);

  if (status === "pending") {
    return <div role="status" className="grid gap-4 md:grid-cols-[260px_1fr]"><div className="skeleton h-64 rounded-2xl" /><div className="space-y-3">{[1, 2, 3].map((key) => <div key={key} className="skeleton h-32 rounded-2xl" />)}</div></div>;
  }
  if (status === "rejected") return <div role="alert" className="rounded-2xl border border-error/30 bg-error/5 p-5 text-sm text-error">{error?.message || "Reviews could not be loaded."}</div>;

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <div>
        <p className="text-5xl font-semibold tracking-[-0.05em] text-text-primary">{Number(averageRating || 0).toFixed(1)}</p>
        <p className="mt-2 text-sm text-text-secondary">{reviews.length} customer review{reviews.length === 1 ? "" : "s"}</p>
        <div className="mt-6 space-y-2">
          {histogram.map((row) => (
            <button key={row.rating} type="button" onClick={() => setRating(String(row.rating))} className="grid w-full grid-cols-[44px_1fr_34px] items-center gap-2 text-xs text-text-secondary">
              <span>{row.rating} star</span><span className="h-2 overflow-hidden rounded-pill bg-surface-muted"><span className="block h-full rounded-pill bg-warning" style={{ width: `${row.percent}%` }} /></span><span>{row.count}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-5 flex flex-wrap gap-3">
          <select aria-label="Filter reviews by rating" value={rating} onChange={(event) => setRating(event.target.value)} className="rounded-pill border border-default bg-surface-raised px-4 py-2 text-sm text-text-primary">
            <option value="all">All ratings</option>{[5, 4, 3, 2, 1].map((value) => <option value={value} key={value}>{value} stars</option>)}
          </select>
          <select aria-label="Sort reviews" value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-pill border border-default bg-surface-raised px-4 py-2 text-sm text-text-primary">
            <option value="recent">Most recent</option><option value="highest">Highest rated</option><option value="lowest">Lowest rated</option>
          </select>
        </div>
        {visible.length ? <div className="space-y-3">{visible.map((review) => (
          <article key={review._id} className="rounded-2xl border border-default bg-surface-raised p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><h3 className="font-semibold text-text-primary">{review.user?.name || "Customer"}</h3>{review.createdAt ? <time className="text-xs text-text-secondary" dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString()}</time> : null}</div>
              <span aria-label={`${review.rating} out of 5 stars`} className="inline-flex items-center gap-1 rounded-pill bg-warning/10 px-3 py-1 text-sm font-semibold text-text-primary"><FiStar className="fill-warning text-warning" />{review.rating}</span>
            </div>
            {review.title ? <h4 className="mt-4 font-semibold text-text-primary">{review.title}</h4> : null}
            <p className="mt-2 text-sm leading-7 text-text-secondary">{review.comment}</p>
            {review.images?.length ? <div className="mt-4 flex gap-2 overflow-x-auto" aria-label="Customer images">{review.images.map((src, index) => <ImageWithFallback key={src} src={src} alt={`Review image ${index + 1}`} wrapperClassName="h-20 w-20 shrink-0 rounded-lg" className="object-cover" />)}</div> : null}
          </article>
        ))}</div> : <div className="rounded-2xl border border-dashed border-default p-8 text-center text-sm text-text-secondary"><FiImage className="mx-auto mb-3 text-2xl" />{reviews.length ? "No reviews match this filter." : "No customer reviews yet."}</div>}
      </div>
    </div>
  );
};
