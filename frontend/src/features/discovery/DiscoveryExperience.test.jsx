import React, { useRef, useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import authReducer from "../auth/AuthSlice";
import cartReducer from "../cart/CartSlice";
import wishlistReducer from "../wishlist/WishlistSlice";
import { AppShellProvider, useAppShell } from "../shell/AppShellContext";
import { DiscoveryProvider, useDiscovery } from "./DiscoveryContext";
import { QuickViewModal } from "./QuickViewModal";

jest.mock("../auth/AuthApi", () => ({
  checkAuth: jest.fn(), forgotPassword: jest.fn(), login: jest.fn(), logout: jest.fn(),
  resendOtp: jest.fn(), resetPassword: jest.fn(), signup: jest.fn(), verifyOtp: jest.fn(),
}));
jest.mock("../cart/CartApi", () => ({ addToCart: jest.fn() }));
jest.mock("../wishlist/WishlistApi", () => ({
  createWishlistItem: jest.fn(),
  deleteWishlistItemById: jest.fn(),
  fetchWishlistByUserId: jest.fn(),
  updateWishlistItemById: jest.fn(),
}));
jest.mock("../products/ProductApi", () => ({ fetchProductById: jest.fn() }));

const { addToCart } = require("../cart/CartApi");
const { createWishlistItem } = require("../wishlist/WishlistApi");
const { fetchProductById } = require("../products/ProductApi");

const product = { _id: "p1", slug: "product-one", name: "Product One", price: 100, stock: 4, thumbnail: "product.jpg", images: ["product.jpg"] };

const Harness = () => {
  const { addProductToCart, toggleWishlist, openQuickView } = useDiscovery();
  const { activeOverlay } = useAppShell();
  const [wishlistResult, setWishlistResult] = useState("");
  const quickRef = useRef(null);
  return (
    <>
      <button ref={quickRef} onClick={() => openQuickView(product)}>Open quick view</button>
      <button onClick={() => addProductToCart({ product })}>Add product</button>
      <button onClick={async () => setWishlistResult(String((await toggleWishlist(product)).success))}>Toggle wishlist</button>
      <output aria-label="overlay">{activeOverlay || "none"}</output>
      <output aria-label="wishlist result">{wishlistResult}</output>
    </>
  );
};

const makeStore = (user = null) => {
  const auth = authReducer(undefined, { type: "@@init" });
  const cart = cartReducer(undefined, { type: "@@init" });
  const wishlist = wishlistReducer(undefined, { type: "@@init" });
  return configureStore({
    reducer: { AuthSlice: authReducer, CartSlice: cartReducer, WishlistSlice: wishlistReducer },
    preloadedState: { AuthSlice: { ...auth, loggedInUser: user, isAuthChecked: true }, CartSlice: cart, WishlistSlice: wishlist },
  });
};

const renderExperience = (store) => render(
  <Provider store={store}>
    <MemoryRouter>
      <AppShellProvider>
        <DiscoveryProvider>
          <Harness />
          <QuickViewModal />
        </DiscoveryProvider>
      </AppShellProvider>
    </MemoryRouter>
  </Provider>
);

describe("discovery commerce behavior", () => {
  beforeEach(() => {
    addToCart.mockReset();
    createWishlistItem.mockReset();
    fetchProductById.mockReset();
    window.localStorage.clear();
  });

  test("guest add-to-cart succeeds and opens the existing cart overlay", async () => {
    const store = makeStore();
    renderExperience(store);
    fireEvent.click(screen.getByRole("button", { name: "Add product" }));
    await waitFor(() => expect(screen.getByLabelText("overlay")).toHaveTextContent("cart"));
    expect(store.getState().CartSlice.items[0].product._id).toBe("p1");
  });

  test("authenticated add-to-cart waits for API success", async () => {
    addToCart.mockResolvedValue({ _id: "cart-1", product, quantity: 1 });
    const store = makeStore({ _id: "u1", isVerified: true });
    renderExperience(store);
    fireEvent.click(screen.getByRole("button", { name: "Add product" }));
    await waitFor(() => expect(addToCart).toHaveBeenCalledWith(expect.objectContaining({ product: "p1" })));
    await waitFor(() => expect(screen.getByLabelText("overlay")).toHaveTextContent("cart"));
  });

  test("wishlist animation state is reported only after API success and remains unchanged on failure", async () => {
    createWishlistItem.mockResolvedValueOnce({ _id: "w1", product });
    const successStore = makeStore({ _id: "u1" });
    const success = renderExperience(successStore);
    fireEvent.click(screen.getByRole("button", { name: "Toggle wishlist" }));
    await waitFor(() => expect(screen.getByLabelText("wishlist result")).toHaveTextContent("true"));
    success.unmount();

    createWishlistItem.mockRejectedValueOnce(new Error("failed"));
    renderExperience(makeStore({ _id: "u1" }));
    fireEvent.click(screen.getByRole("button", { name: "Toggle wishlist" }));
    await waitFor(() => expect(screen.getByLabelText("wishlist result")).toHaveTextContent("false"));
  });

  test("quick view closes with Escape and restores focus to its trigger", async () => {
    fetchProductById.mockResolvedValue(product);
    renderExperience(makeStore());
    const trigger = screen.getByRole("button", { name: "Open quick view" });
    trigger.focus();
    fireEvent.click(trigger);
    expect(await screen.findByRole("dialog", { name: "Quick view: Product One" })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Quick view: Product One" })).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
});
