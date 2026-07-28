import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthShell } from "../../../components/ui/AuthShell";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { PasswordField } from "./PasswordField";
import {
  clearSignupError,
  resetSignupStatus,
  selectLoggedInUser,
  selectSignupError,
  selectSignupStatus,
  signupAsync,
} from "../AuthSlice";

export const Signup = () => {
  const dispatch = useDispatch();
  const status = useSelector(selectSignupStatus);
  const error = useSelector(selectSignupError);
  const loggedInUser = useSelector(selectLoggedInUser);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  useEffect(() => {
    if (loggedInUser && !loggedInUser?.isVerified) {
      navigate("/verify-otp");
    } else if (loggedInUser) {
      navigate("/");
    }
  }, [loggedInUser, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Unable to create account");
      dispatch(clearSignupError());
    }
  }, [dispatch, error]);

  useEffect(() => {
    if (status === "fulfilled") {
      toast.success("Account created. Verify your email to continue.");
    }

    return () => {
      dispatch(resetSignupStatus());
    };
  }, [dispatch, status]);

  const onSubmit = (data) => {
    if (status === "pending") return;
    const payload = { name: data.name, email: data.email, password: data.password };
    dispatch(signupAsync(payload));
  };

  return (
    <AuthShell
      eyebrow="Create account"
      title="Create your account"
      description="Set up your account for faster checkout, saved orders, and a simpler return path."
      highlights={["Saved addresses and faster checkout", "Order history and delivery tracking", "Wishlist synced to your account"]}
    >
      <div className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full name" error={errors.name?.message} {...register("name", { required: "Name is required" })} />
          <PasswordField showStrength
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i,
                message: "Enter a valid email",
              },
            })}
          />
          <PasswordField label="Confirm password" error={errors.confirmPassword?.message} {...register("confirmPassword", { required: "Confirm your password", validate: (value, values) => value === values.password || "Passwords do not match" })} />
          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              pattern: {
                value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
                message: "Use 8+ chars with upper, lower, and number",
              },
            })}
          />
          <Button type="submit" fullWidth disabled={status === "pending"}>
            {status === "pending" ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-sm text-textSecondary">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-accent hover:text-textPrimary">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};
