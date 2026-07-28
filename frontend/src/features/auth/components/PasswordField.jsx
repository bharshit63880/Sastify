import React, { forwardRef, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Input } from "../../../components/ui/Input";

export const getPasswordStrength = (value = "") => {
  const checks = [value.length >= 8, /[a-z]/.test(value), /[A-Z]/.test(value), /\d/.test(value), /[^a-zA-Z0-9]/.test(value)];
  const score = checks.filter(Boolean).length;
  return { score, label: ["Very weak", "Weak", "Fair", "Good", "Strong", "Excellent"][score] };
};

export const PasswordField = forwardRef(({ label = "Password", error, showStrength = false, onChange, ...props }, ref) => {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const strength = getPasswordStrength(value);
  return (
    <div>
      <div className="relative">
        <Input ref={ref} label={label} type={visible ? "text" : "password"} error={error} onChange={(event) => { setValue(event.target.value); onChange?.(event); }} {...props} />
        <button type="button" aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} onClick={() => setVisible((current) => !current)} className="absolute right-3 top-[38px] grid h-9 w-9 place-items-center rounded-full text-text-secondary hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary">
          {visible ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
      {showStrength && value ? <div className="mt-2" aria-live="polite"><div className="grid grid-cols-5 gap-1">{[1, 2, 3, 4, 5].map((level) => <span key={level} className={`h-1.5 rounded-pill ${level <= strength.score ? "bg-brand-primary" : "bg-surface-muted"}`} />)}</div><p className="mt-1 text-xs text-text-secondary">Password strength: {strength.label}</p></div> : null}
    </div>
  );
});
