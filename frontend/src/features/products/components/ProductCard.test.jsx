import { getCardImages } from "./cardPresentation";

describe("ProductCard visual behavior", () => {
  test("uses a distinct second product image for hover crossfade", () => {
    expect(getCardImages({ thumbnail: "one.jpg", images: ["one.jpg", "two.jpg"] })).toEqual({
      primary: "one.jpg",
      secondary: "two.jpg",
    });
  });

  test("falls back to primary-image zoom when no alternate exists", () => {
    expect(getCardImages({ thumbnail: "one.jpg", images: ["one.jpg"] })).toEqual({
      primary: "one.jpg",
      secondary: null,
    });
  });
});
