import React, { Suspense, lazy, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { RouteFallback } from "./components/RouteFallback";
import { selectIsAuthChecked, selectLoggedInUser } from "./features/auth/AuthSlice";
import { Protected } from "./features/auth/components/Protected";
import { fetchAllBrandsAsync } from "./features/brands/BrandSlice";
import { fetchAllCategoriesAsync } from "./features/categories/CategoriesSlice";
import { hydrateGuestCart, selectCartItems, selectIsGuestCart, syncGuestCartAsync } from "./features/cart/CartSlice";
import { fetchStorefrontOverviewAsync } from "./features/storefront/StorefrontSlice";
import { useAuthCheck } from "./hooks/useAuth/useAuthCheck";
import { useFetchLoggedInUserDetails } from "./hooks/useAuth/useFetchLoggedInUserDetails";
import { AdminLayout } from "./layout/AdminLayout";
import { RootLayout } from "./layout/RootLayout";

const lazyNamed = (loader, name) => lazy(() => loader().then((module) => ({ default: module[name] })));
const HomePage = lazyNamed(() => import("./pages/HomePage"), "HomePage");
const ProductsPage = lazyNamed(() => import("./pages/ProductsPage"), "ProductsPage");
const SearchResultsPage = lazyNamed(() => import("./pages/SearchResultsPage"), "SearchResultsPage");
const CategoryPage = lazyNamed(() => import("./pages/CategoryPage"), "CategoryPage");
const ProductDetailsPage = lazyNamed(() => import("./pages/ProductDetailsPage"), "ProductDetailsPage");
const CartPage = lazyNamed(() => import("./pages/CartPage"), "CartPage");
const CheckoutPage = lazyNamed(() => import("./pages/CheckoutPage"), "CheckoutPage");
const OrderSuccessPage = lazyNamed(() => import("./pages/OrderSuccessPage"), "OrderSuccessPage");
const UserOrdersPage = lazyNamed(() => import("./pages/UserOrdersPage"), "UserOrdersPage");
const OrderDetailsPage = lazyNamed(() => import("./pages/OrderDetailsPage"), "OrderDetailsPage");
const UserProfilePage = lazyNamed(() => import("./pages/UserProfilePage"), "UserProfilePage");
const WishlistPage = lazyNamed(() => import("./pages/WishlistPage"), "WishlistPage");
const LoginPage = lazyNamed(() => import("./pages/LoginPage"), "LoginPage");
const SignupPage = lazyNamed(() => import("./pages/SignupPage"), "SignupPage");
const OtpVerificationPage = lazyNamed(() => import("./pages/OtpVerificationPage"), "OtpVerificationPage");
const ForgotPasswordPage = lazyNamed(() => import("./pages/ForgotPasswordPage"), "ForgotPasswordPage");
const ResetPasswordPage = lazyNamed(() => import("./pages/ResetPasswordPage"), "ResetPasswordPage");
const AdminDashboardPage = lazyNamed(() => import("./pages/AdminDashboardPage"), "AdminDashboardPage");
const AdminOrdersPage = lazyNamed(() => import("./pages/AdminOrdersPage"), "AdminOrdersPage");
const AdminUsersPage = lazyNamed(() => import("./pages/AdminUsersPage"), "AdminUsersPage");
const AddProductPage = lazyNamed(() => import("./pages/AddProductPage"), "AddProductPage");
const ProductUpdatePage = lazyNamed(() => import("./pages/ProductUpdatePage"), "ProductUpdatePage");
const NotFoundPage = lazyNamed(() => import("./pages/NotFoundPage"), "NotFoundPage");

const LazyRoute = ({ children, compact = false }) => (
  <AppErrorBoundary><Suspense fallback={<RouteFallback compact={compact} />}>{children}</Suspense></AppErrorBoundary>
);

const router = createBrowserRouter(createRoutesFromElements(
  <>
    <Route path="/signup" element={<LazyRoute compact><SignupPage /></LazyRoute>} />
    <Route path="/login" element={<LazyRoute compact><LoginPage /></LazyRoute>} />
    <Route path="/verify-otp" element={<LazyRoute compact><OtpVerificationPage /></LazyRoute>} />
    <Route path="/forgot-password" element={<LazyRoute compact><ForgotPasswordPage /></LazyRoute>} />
    <Route path="/reset-password/:userId/:passwordResetToken" element={<LazyRoute compact><ResetPasswordPage /></LazyRoute>} />
    <Route element={<RootLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/search" element={<SearchResultsPage />} />
      <Route path="/category/:slug" element={<CategoryPage />} />
      <Route path="/category/:parent/:child" element={<CategoryPage />} />
      <Route path="/category/:parent/:child/:grandchild" element={<CategoryPage />} />
      <Route path="/products/:id" element={<ProductDetailsPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<Protected><CheckoutPage /></Protected>} />
      <Route path="/order-success/:id" element={<Protected><OrderSuccessPage /></Protected>} />
      <Route path="/orders" element={<Protected><UserOrdersPage /></Protected>} />
      <Route path="/orders/:id" element={<Protected><OrderDetailsPage /></Protected>} />
      <Route path="/account" element={<Protected><UserProfilePage /></Protected>} />
      <Route path="/wishlist" element={<Protected><WishlistPage /></Protected>} />
    </Route>
    <Route path="/admin" element={<Protected adminOnly><AdminLayout /></Protected>}>
      <Route index element={<LazyRoute compact><AdminDashboardPage /></LazyRoute>} />
      <Route path="orders" element={<LazyRoute compact><AdminOrdersPage /></LazyRoute>} />
      <Route path="users" element={<LazyRoute compact><AdminUsersPage /></LazyRoute>} />
      <Route path="products/new" element={<LazyRoute compact><AddProductPage /></LazyRoute>} />
      <Route path="products/:id/edit" element={<LazyRoute compact><ProductUpdatePage /></LazyRoute>} />
    </Route>
    <Route path="*" element={<LazyRoute compact><NotFoundPage /></LazyRoute>} />
  </>
));

function App() {
  const dispatch = useDispatch();
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const loggedInUser = useSelector(selectLoggedInUser);
  const cartItems = useSelector(selectCartItems);
  const isGuestCart = useSelector(selectIsGuestCart);

  useAuthCheck();
  useFetchLoggedInUserDetails(loggedInUser);

  useEffect(() => {
    dispatch(fetchAllCategoriesAsync());
    dispatch(fetchAllBrandsAsync());
    dispatch(fetchStorefrontOverviewAsync());
    dispatch(hydrateGuestCart());
  }, [dispatch]);

  useEffect(() => {
    if (loggedInUser?.isVerified && isGuestCart && cartItems.length) dispatch(syncGuestCartAsync(cartItems));
  }, [cartItems, dispatch, isGuestCart, loggedInUser]);

  return isAuthChecked ? <RouterProvider router={router} /> : <RouteFallback compact />;
}

export default App;
