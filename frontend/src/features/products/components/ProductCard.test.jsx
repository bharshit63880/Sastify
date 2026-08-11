import { getCardImages } from "./cardPresentation";

describe("ProductCard visual behavior", () => {
  test("uses a distinct second product image for hover crossfade", () => {
    expect(getCardImages({ thumbnail: "one.jpg", images: ["one.jpg", "two.jpg"] })).toEqual({
      primary: "one.jpg",
      secondary: "two.jpg",
      fallback: "two.jpg",
    });
  });

  test("falls back to primary-image zoom when no alternate exists", () => {
    const result = getCardImages({ name: "Running shoe", thumbnail: "one.jpg", images: ["one.jpg"] });
    expect(result.primary).toBe("one.jpg");
    expect(result.secondary).toBeNull();
    expect(result.fallback).toContain("images.unsplash.com");
  });
});
