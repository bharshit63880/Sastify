import React, { useRef } from "react";

export const OtpInput = ({ value, onChange, length = 4, disabled = false, error }) => {
  const refs = useRef([]);
  const digits = Array.from({ length }, (_, index) => value[index] || "");
  const update = (index, next) => {
    const copy = [...digits];
    copy[index] = next.replace(/\D/g, "").slice(-1);
    onChange(copy.join(""));
    if (copy[index] && index < length - 1) refs.current[index + 1]?.focus();
  };
  const paste = (event) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    event.preventDefault();
    onChange(pasted);
    refs.current[Math.min(pasted.length, length) - 1]?.focus();
  };
  return (
    <div>
      <div className="flex justify-center gap-2" onPaste={paste} role="group" aria-label={`${length}-digit verification code`}>
        {digits.map((digit, index) => <input key={index} ref={(node) => { refs.current[index] = node; }} value={digit} disabled={disabled} autoFocus={index === 0} inputMode="numeric" autoComplete={index === 0 ? "one-time-code" : "off"} aria-label={`Digit ${index + 1}`} aria-invalid={Boolean(error)} onChange={(event) => update(index, event.target.value)} onKeyDown={(event) => { if (event.key === "Backspace" && !digit && index > 0) refs.current[index - 1]?.focus(); if (event.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus(); if (event.key === "ArrowRight" && index < length - 1) refs.current[index + 1]?.focus(); }} className="h-14 w-12 rounded-xl border border-default bg-surface-raised text-center text-xl font-semibold text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 disabled:opacity-50" />)}
      </div>
      {error ? <p role="alert" className="mt-2 text-center text-sm text-error">{error}</p> : null}
    </div>
  );
};
