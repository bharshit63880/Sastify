import { getAvailableWishlistItems } from "../features/wishlist/wishlistPresentation";

test("removes orphaned wishlist entries before product cards render", () => {
  const valid = { _id: "wish-1", product: { _id: "product-1" } };
  expect(getAvailableWishlistItems([valid, { _id: "wish-2", product: null }, null])).toEqual([valid]);
  expect(getAvailableWishlistItems(undefined)).toEqual([]);
});
