import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthShell } from "../../../components/ui/AuthShell";
import { Button } from "../../../components/ui/Button";
import { OtpInput } from "./OtpInput";
import {
  clearOtpVerificationError,
  clearResendOtpError,
  clearResendOtpSuccessMessage,
  logoutAsync,
  resendOtpAsync,
  resetOtpVerificationStatus,
  resetResendOtpStatus,
  selectLoggedInUser,
  selectOtpVerificationError,
  selectOtpVerificationStatus,
  selectResendOtpError,
  selectResendOtpStatus,
  selectResendOtpSuccessMessage,
  verifyOtpAsync,
} from "../AuthSlice";

export const OtpVerfication = () => {
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const dispatch = useDispatch();
  const loggedInUser = useSelector(selectLoggedInUser);
  const navigate = useNavigate();
  const resendOtpStatus = useSelector(selectResendOtpStatus);
  const resendOtpError = useSelector(selectResendOtpError);
  const resendOtpSuccessMessage = useSelector(selectResendOtpSuccessMessage);
  const otpVerificationStatus = useSelector(selectOtpVerificationStatus);
  const otpVerificationError = useSelector(selectOtpVerificationError);
  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  const shouldShowOtpForm = useMemo(
    () =>
      resendOtpStatus === "fulfilled" ||
      otpVerificationStatus === "pending" ||
      Boolean(resendOtpSuccessMessage),
    [otpVerificationStatus, resendOtpStatus, resendOtpSuccessMessage]
  );

  useEffect(() => {
    if (!loggedInUser) {
      navigate("/login");
      return;
    }

    if (loggedInUser.isVerified) {
      navigate("/");
    }
  }, [loggedInUser, navigate]);

  useEffect(() => {
    if (resendOtpError) {
      toast.error(resendOtpError.message || "Unable to send OTP");
    }
    return () => {
      dispatch(clearResendOtpError());
    };
  }, [dispatch, resendOtpError]);

  useEffect(() => {
    if (resendOtpSuccessMessage) {
      toast.success(resendOtpSuccessMessage.message || "OTP sent successfully");
    }
    return () => {
      dispatch(clearResendOtpSuccessMessage());
    };
  }, [dispatch, resendOtpSuccessMessage]);

  useEffect(() => {
    if (otpVerificationError) {
      toast.error(otpVerificationError.message || "OTP verification failed");
    }
    return () => {
      dispatch(clearOtpVerificationError());
    };
  }, [dispatch, otpVerificationError]);

  useEffect(() => {
    if (otpVerificationStatus === "fulfilled") {
      toast.success("Email verified successfully");
      dispatch(resetResendOtpStatus());
      navigate("/");
    }

    return () => {
      dispatch(resetOtpVerificationStatus());
    };
  }, [dispatch, navigate, otpVerificationStatus]);

  const handleSendOtp = () => {
    if (!loggedInUser?._id) {
      return;
    }

    dispatch(resendOtpAsync({ user: loggedInUser._id }));
    setSeconds(30);
  };

  const handleVerifyOtp = (event) => {
    event.preventDefault();
    if (!loggedInUser?._id) {
      return;
    }

    if (!/^\d{4}$/.test(otp)) { setOtpError("Enter the complete 4-digit code"); return; }
    setOtpError("");
    dispatch(verifyOtpAsync({ otp, userId: loggedInUser._id }));
  };

  const handleLogout = async () => {
    await dispatch(logoutAsync());
    navigate("/login");
  };

  return (
    <AuthShell
      eyebrow="Email verification required"
      title="Verify your email"
      description="Enter the one-time password sent to your inbox to activate your account."
      highlights={["Paste the complete code at once", "Keyboard-friendly digit navigation", "Accessible resend countdown"]}
    >
      <div className="space-y-6">
        <div className="rounded-[24px] border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-textSecondary">Registered email</p>
          <p className="mt-2 text-sm font-semibold text-textPrimary">{loggedInUser?.email}</p>
        </div>

        {shouldShowOtpForm ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <OtpInput value={otp} onChange={(value) => { setOtp(value); setOtpError(""); }} error={otpError} disabled={otpVerificationStatus === "pending"} />
            <Button type="submit" fullWidth disabled={otpVerificationStatus === "pending"}>
              {otpVerificationStatus === "pending" ? "Verifying..." : "Verify email"}
            </Button>
            <Button type="button" variant="secondary" fullWidth onClick={handleSendOtp} disabled={resendOtpStatus === "pending" || seconds > 0}>
              {resendOtpStatus === "pending" ? "Sending..." : seconds > 0 ? `Resend in ${seconds}s` : "Resend OTP"}
            </Button>
          </form>
        ) : (
          <Button fullWidth onClick={handleSendOtp} disabled={resendOtpStatus === "pending"}>
            {resendOtpStatus === "pending" ? "Sending..." : "Get OTP"}
          </Button>
        )}

        <div className="space-y-2">
          <p className="text-sm text-textSecondary">Need a different account?</p>
          <button type="button" onClick={handleLogout} className="text-sm font-semibold text-text-primary">
            Sign out and use another email
          </button>
        </div>
        <span className="sr-only" role="status" aria-live="polite">{seconds > 0 ? `You can resend the code in ${seconds} seconds` : ""}</span>
      </div>
    </AuthShell>
  );
};
