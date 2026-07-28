import { resolveBannerMedia } from "./components/HomeMedia";

jest.mock("../products/ProductApi", () => ({
  fetchProductById: jest.fn(),
}));

const { fetchProductById } = require("../products/ProductApi");
const {
  fetchRecentlyViewedProducts,
  rememberViewedProduct,
  RECENTLY_VIEWED_STORAGE_KEY,
} = require("./recentlyViewed");

describe("homepage experience helpers", () => {
  beforeEach(() => {
    window.localStorage.clear();
    fetchProductById.mockReset();
  });

  test("resolves current image banners and future video media", () => {
    expect(resolveBannerMedia({ image: "hero.jpg" }, "fallback.jpg")).toMatchObject({
      source: "hero.jpg",
      type: "image",
    });
    expect(resolveBannerMedia({ image: "hero.mp4" }, "fallback.jpg")).toMatchObject({
      source: "hero.mp4",
      type: "video",
    });
    expect(resolveBannerMedia({ videoUrl: "admin-video.webm", image: "poster.jpg" }, "fallback.jpg")).toEqual({
      source: "admin-video.webm",
      type: "video",
      poster: "poster.jpg",
    });
  });

  test("stores only unique product IDs in newest-first order", () => {
    rememberViewedProduct("product-1");
    rememberViewedProduct("product-2");
    rememberViewedProduct("product-1");
    expect(JSON.parse(window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY))).toEqual([
      "product-1",
      "product-2",
    ]);
  });

  test("skips unavailable recently viewed products", async () => {
    window.localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(["available", "deleted"]));
    fetchProductById
      .mockResolvedValueOnce({ _id: "available", name: "Available" })
      .mockRejectedValueOnce(new Error("Not found"));
    await expect(fetchRecentlyViewedProducts()).resolves.toEqual([
      { _id: "available", name: "Available" },
    ]);
  });
});
