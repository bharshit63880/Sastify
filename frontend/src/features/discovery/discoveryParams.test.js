import { parseDiscoveryParams, toggleArrayValue, updateDiscoveryParams } from "./discoveryParams";

describe("discovery URL parameters", () => {
  test("parses shareable filter, sort, page, and view state", () => {
    const parsed = parseDiscoveryParams(new URLSearchParams("brand=a,b&color=Blue&size=M&rating=4&inStock=true&sort=price-asc&page=3&view=list"));
    expect(parsed).toMatchObject({
      brand: ["a", "b"],
      color: ["Blue"],
      size: ["M"],
      rating: 4,
      inStock: true,
      sort: "price-asc",
      page: 3,
      view: "list",
    });
  });

  test("preserves route-owned search query while removing default parameters", () => {
    const current = new URLSearchParams("q=headphones&page=4&sort=price-desc");
    const next = updateDiscoveryParams(current, { sort: "relevance", brand: ["brand-1"] });
    expect(next.get("q")).toBe("headphones");
    expect(next.get("brand")).toBe("brand-1");
    expect(next.has("sort")).toBe(false);
    expect(next.has("page")).toBe(false);
  });

  test("toggles multi-select values without duplicates", () => {
    expect(toggleArrayValue(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleArrayValue(["a", "b"], "a")).toEqual(["b"]);
  });
});
