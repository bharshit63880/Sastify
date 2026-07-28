import React, { useId } from "react";
import { cn } from "../../utils/cn";

export const Input = React.forwardRef(
  (
    {
      className = "",
      wrapperClassName = "",
      label,
      hint,
      error,
      as = "input",
      rows = 4,
      children,
      leftIcon,
      rightAction,
      required = false,
      loading = false,
      id,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || `field-${generatedId.replace(/:/g, "")}`;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [props["aria-describedby"], errorId, !error && hintId].filter(Boolean).join(" ") || undefined;
    const Element = as;

    return (
      <div className={cn("flex w-full flex-col gap-2", wrapperClassName)}>
        {label ? (
          <label htmlFor={inputId} className="text-label text-secondary">
            {label}
            {required ? <span className="ml-1 text-error" aria-hidden="true">*</span> : null}
          </label>
        ) : null}
        <div className="relative">
          {leftIcon ? <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted" aria-hidden="true">{leftIcon}</span> : null}
          <Element
            ref={ref}
            id={inputId}
            rows={as === "textarea" ? rows : undefined}
            required={required}
            disabled={disabled || loading}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            aria-busy={loading || undefined}
            className={cn("input-base", leftIcon && "pl-11", (rightAction || loading) && "pr-11", className)}
            {...props}
          >
            {children}
          </Element>
          {loading ? (
            <span className="absolute inset-y-0 right-4 flex items-center" aria-hidden="true">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-primary border-r-transparent" />
            </span>
          ) : rightAction ? <span className="absolute inset-y-0 right-2 flex items-center">{rightAction}</span> : null}
        </div>
        {error ? <span id={errorId} role="alert" className="text-sm text-error">{error}</span> : null}
        {!error && hint ? <span id={hintId} className="text-sm text-muted">{hint}</span> : null}
      </div>
    );
  }
);

Input.displayName = "Input";
