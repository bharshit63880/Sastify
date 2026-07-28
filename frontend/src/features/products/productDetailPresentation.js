export const getProductName = (product) => product?.name || product?.title || "Product";

export const getProductStock = (product) =>
  Math.max(0, Number(product?.stock ?? product?.stockQuantity ?? 0));

export const getProductMedia = (product) => {
  const imageUrls = [product?.thumbnail, ...(product?.images || [])].filter(Boolean);
  const uniqueImages = [...new Set(imageUrls)];
  const videoUrls = [
    ...(product?.videos || []),
    product?.video,
    product?.videoUrl,
  ].filter(Boolean);

  return [
    ...uniqueImages.map((src) => ({ type: "image", src })),
    ...[...new Set(videoUrls)].map((src) => ({
      type: /\.(mp4)(\?|$)/i.test(src) ? "video/mp4" : "video/webm",
      src,
      poster: uniqueImages[0] || "",
    })),
  ];
};
export const validateProductSelection = ({ product, color, size, quantity }) => {
  const errors = {};
  const stock = getProductStock(product);
  if (product?.colors?.length && !color) errors.color = "Choose a color";
  if (product?.sizes?.length && !size) errors.size = "Choose a size";
  if (stock < 1) errors.stock = "This product is currently out of stock";
  if (quantity < 1 || quantity > stock) errors.quantity = `Choose between 1 and ${stock}`;
  return errors;
};

export const buildRatingHistogram = (reviews = []) =>
  [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((review) => Number(review.rating) === rating).length;
    return {
      rating,
      count,
      percent: reviews.length ? Math.round((count / reviews.length) * 100) : 0,
    };
  });

export const sortAndFilterReviews = (reviews = [], sort = "recent", rating = "all") => {
  const filtered = rating === "all"
    ? [...reviews]
    : reviews.filter((review) => Number(review.rating) === Number(rating));

  return filtered.sort((a, b) => {
    if (sort === "highest") return Number(b.rating) - Number(a.rating);
    if (sort === "lowest") return Number(a.rating) - Number(b.rating);
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
};
