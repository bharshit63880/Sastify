import {
  buildRatingHistogram,
  getProductMedia,
  sortAndFilterReviews,
  validateProductSelection,
} from "./productDetailPresentation";

describe("product detail presentation", () => {
  test("deduplicates images and detects supported video media", () => {
    expect(getProductMedia({
      thumbnail: "one.jpg",
      images: ["one.jpg", "two.jpg"],
      videos: ["demo.mp4", "demo.webm"],
    })).toEqual([
      { type: "image", src: "one.jpg" },
      { type: "image", src: "two.jpg" },
      { type: "video/mp4", src: "demo.mp4", poster: "one.jpg" },
      { type: "video/webm", src: "demo.webm", poster: "one.jpg" },
    ]);
  });

  test("requires real variants and enforces backend stock", () => {
    const product = { colors: ["Black"], sizes: ["M"], stock: 2 };
    expect(validateProductSelection({ product, color: "", size: "", quantity: 3 })).toMatchObject({
      color: "Choose a color",
      size: "Choose a size",
      quantity: "Choose between 1 and 2",
    });
    expect(validateProductSelection({ product, color: "Black", size: "M", quantity: 2 })).toEqual({});
  });

  test("builds a truthful histogram and filters before sorting", () => {
    const reviews = [
      { _id: "a", rating: 5, createdAt: "2026-01-01" },
      { _id: "b", rating: 3, createdAt: "2026-02-01" },
      { _id: "c", rating: 5, createdAt: "2026-03-01" },
    ];
    expect(buildRatingHistogram(reviews)[0]).toEqual({ rating: 5, count: 2, percent: 67 });
    expect(sortAndFilterReviews(reviews, "recent", "5").map((review) => review._id)).toEqual(["c", "a"]);
  });
});
