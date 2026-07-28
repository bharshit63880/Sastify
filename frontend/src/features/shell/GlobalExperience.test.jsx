import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { Dialog } from "../../components/ui/Dialog";
import { OfflineBanner } from "../../components/OfflineBanner";
import { ThemeProvider } from "../../theme/ThemeProvider";
import { adaptCartItem } from "../cart/cartPresentation";
import { AccountMenu } from "../navigation/components/AccountMenu";
import { AppShellProvider, useAppShell } from "./AppShellContext";

jest.mock("../../services/toastService", () => ({ appToast: { info: jest.fn() } }));

test("shell overlays are mutually exclusive", () => {
  const Harness = () => {
    const { activeOverlay, openOverlay, closeOverlay } = useAppShell();
    return <><output>{activeOverlay || "none"}</output><button onClick={() => openOverlay("search")}>Search</button><button onClick={() => openOverlay("cart")}>Cart</button><button onClick={closeOverlay}>Close</button></>;
  };
  render(<AppShellProvider><Harness /></AppShellProvider>);
  fireEvent.click(screen.getByRole("button", { name: "Search" }));
  expect(screen.getByText("search")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Cart" }));
  expect(screen.getByText("cart")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(screen.getByText("none")).toBeInTheDocument();
});

test("dialog closes on Escape and restores focus", () => {
  const onClose = jest.fn();
  const opener = document.createElement("button");
  document.body.appendChild(opener);
  opener.focus();
  const { rerender } = render(<Dialog open onClose={onClose} title="Command"><button>Inside</button></Dialog>);
  fireEvent.keyDown(document, { key: "Escape" });
  expect(onClose).toHaveBeenCalledTimes(1);
  rerender(<Dialog open={false} onClose={onClose} title="Command"><button>Inside</button></Dialog>);
  expect(opener).toHaveFocus();
  opener.remove();
});

test("cart adapter supports guest and populated server entries", () => {
  const guest = adaptCartItem({ _id: "guest-1", quantity: 2, size: "M", color: "Blue", product: { _id: "1", title: "Guest product", price: 120 } });
  const server = adaptCartItem({ _id: "server-1", quantity: 1, product: { _id: "2", name: "Server product", price: 250, brand: { name: "Brand" } } });
  expect(guest).toMatchObject({ id: "guest-1", name: "Guest product", quantity: 2, size: "M", color: "Blue" });
  expect(server).toMatchObject({ id: "server-1", name: "Server product", brand: "Brand", quantity: 1 });
});

test("account menu shows admin access only to admins", () => {
  const renderMenu = (user) => render(<MemoryRouter><ThemeProvider><AccountMenu open user={user} onClose={() => {}} onLogout={() => {}} /></ThemeProvider></MemoryRouter>);
  const regular = renderMenu({ name: "A", email: "a@example.com", isAdmin: false });
  expect(screen.queryByRole("menuitem", { name: "Admin dashboard" })).not.toBeInTheDocument();
  regular.unmount();
  renderMenu({ name: "Admin", email: "admin@example.com", isAdmin: true });
  expect(screen.getByRole("menuitem", { name: "Admin dashboard" })).toBeInTheDocument();
});

test("offline banner announces status changes", () => {
  Object.defineProperty(window.navigator, "onLine", { configurable: true, value: false });
  render(<OfflineBanner />);
  expect(screen.getByRole("status")).toHaveTextContent("offline");
  Object.defineProperty(window.navigator, "onLine", { configurable: true, value: true });
  fireEvent(window, new Event("online"));
  expect(screen.queryByText(/offline/i)).not.toBeInTheDocument();
});
