import { getProductVisualSource } from "./ProductVisual";

export const getCardImages = (product) => {
  const primary = getProductVisualSource(product);
  const images = product?.images?.filter(Boolean) || [];
  const secondary = images.find((image) => image !== primary && image !== product?.thumbnail) || null;
  return { primary, secondary };
};
