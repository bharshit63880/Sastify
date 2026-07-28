import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthShell } from "../../../components/ui/AuthShell";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { PasswordField } from "./PasswordField";
import {
  clearLoginError,
  loginAsync,
  resetLoginStatus,
  selectLoggedInUser,
  selectLoginError,
  selectLoginStatus,
} from "../AuthSlice";

export const Login = () => {
  const dispatch = useDispatch();
  const status = useSelector(selectLoginStatus);
  const error = useSelector(selectLoginError);
  const loggedInUser = useSelector(selectLoggedInUser);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onBlur" });
  const isPending = status === "pending";
  const sessionMessage = location.state?.sessionExpired ? "Your session expired. Sign in again to continue." : "";

  useEffect(() => {
    if (loggedInUser) {
      const target = location.state?.from || (loggedInUser.isAdmin ? "/admin" : "/");
      navigate(loggedInUser.isVerified ? target : "/verify-otp");
    }
  }, [location.state, loggedInUser, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Unable to sign in");
      dispatch(clearLoginError());
    }
  }, [dispatch, error]);

  useEffect(() => {
    return () => {
      dispatch(resetLoginStatus());
    };
  }, [dispatch]);

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in"
      description="Access your cart, orders, and checkout in one clean workspace."
      highlights={["Secure access to orders and saved addresses", "Your intended destination is preserved", "Theme-aware on every device"]}
    >
      <div className="space-y-6">
        {sessionMessage ? <p role="status" className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-warning">{sessionMessage}</p> : null}
        <form onSubmit={handleSubmit((data) => { if (!isPending) dispatch(loginAsync(data)); })} className="space-y-4" noValidate>
          <PasswordField
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Enter a valid email",
              },
            })}
          />
          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register("password", { required: "Password is required" })}
          />
          <Button type="submit" fullWidth disabled={isPending} aria-busy={isPending}>
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="flex items-center justify-between gap-4 text-sm">
          <Link to="/forgot-password" className="text-textSecondary hover:text-textPrimary">
            Forgot password?
          </Link>
          <Link to="/signup" className="font-semibold text-accent hover:text-textPrimary">
            Create account
          </Link>
        </div>
      </div>
    </AuthShell>
  );
};
