import { runFlyingCart } from "./commerceMotion";

describe("flying cart motion", () => {
  test("skips DOM animation for reduced motion", async () => {
    document.body.innerHTML = '<button data-cart-target></button>';
    const source = document.createElement("div");
    await expect(runFlyingCart({ sourceElement: source, imageUrl: "product.jpg", reducedMotion: true })).resolves.toBe(false);
    expect(document.body.querySelectorAll("img")).toHaveLength(0);
  });

  test("falls back cleanly when the cart target is unavailable", async () => {
    document.body.innerHTML = "";
    const source = document.createElement("div");
    await expect(runFlyingCart({ sourceElement: source, imageUrl: "product.jpg" })).resolves.toBe(false);
  });

  test("animates a cloned thumbnail and removes it after completion", async () => {
    document.body.innerHTML = '<button data-cart-target></button>';
    const source = document.createElement("div");
    source.getBoundingClientRect = () => ({ left: 20, top: 200, width: 90, height: 110 });
    document.querySelector("[data-cart-target]").getBoundingClientRect = () => ({ left: 800, top: 20, width: 44, height: 44 });
    const animate = jest.fn(() => ({ finished: Promise.resolve() }));
    const originalCreate = document.createElement.bind(document);
    jest.spyOn(document, "createElement").mockImplementation((tag) => {
      const element = originalCreate(tag);
      if (tag === "img") element.animate = animate;
      return element;
    });
    await expect(runFlyingCart({ sourceElement: source, imageUrl: "product.jpg" })).resolves.toBe(true);
    expect(animate).toHaveBeenCalledTimes(1);
    expect(document.body.querySelectorAll("img")).toHaveLength(0);
    document.createElement.mockRestore();
  });
});
