export const getAvailableWishlistItems = (items) => Array.isArray(items)
  ? items.filter((item) => item?._id && item?.product?._id)
  : [];
