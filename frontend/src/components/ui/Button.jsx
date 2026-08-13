import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

const variants = {
  primary: "border border-brand-primary bg-brand-primary text-white shadow-sm hover:brightness-105",
  secondary: "border border-default bg-surface-raised text-text-primary shadow-xs hover:border-strong hover:bg-surface-muted",
  outline: "border border-strong bg-transparent text-text-primary hover:border-brand-primary hover:text-brand-primary",
  ghost: "border border-transparent bg-transparent text-text-secondary hover:bg-surface-muted hover:text-text-primary",
  danger: "border border-error bg-error text-white shadow-xs hover:brightness-105",
  glass: "border border-glass bg-glass text-text-primary shadow-glass backdrop-blur-xl hover:border-strong",
  gradient: "border border-transparent bg-brand-gradient text-white shadow-glow hover:brightness-105",
};

const sizes = {
  sm: "min-h-9 px-4 py-2 text-xs",
  md: "min-h-11 px-5 py-3 text-sm",
  lg: "min-h-[52px] px-6 py-3.5 text-base",
  icon: "h-11 w-11 p-0",
  small: "min-h-9 px-4 py-2 text-xs",
  medium: "min-h-11 px-5 py-3 text-sm",
  large: "min-h-[52px] px-6 py-3.5 text-base",
};

const Spinner = () => <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />;

export const Button = React.forwardRef(({
  className = "",
  children,
  variant = "primary",
  size = "md",
  to,
  href,
  icon,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled = false,
  loading = false,
  type = "button",
  ...props
}, ref) => {
  const reduceMotion = useReducedMotion();
  const isDisabled = disabled || loading;
  const sharedClassName = cn(
    "inline-flex min-w-0 max-w-full items-center justify-center gap-2 rounded-pill text-center font-semibold tracking-[-0.01em]",
    "transition-[color,background-color,border-color,box-shadow,filter,transform] duration-normal ease-standard",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-primary/25",
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    fullWidth && "w-full",
    isDisabled && "pointer-events-none cursor-not-allowed opacity-55",
    className
  );

  const content = (
    <>
      {loading ? <Spinner /> : (leftIcon || icon) ? <span className="shrink-0 text-base" aria-hidden="true">{leftIcon || icon}</span> : null}
      {children != null ? <span className="min-w-0 whitespace-nowrap">{children}</span> : null}
      {rightIcon ? <span className="shrink-0 text-base" aria-hidden="true">{rightIcon}</span> : null}
    </>
  );

  if (to) return <Link ref={ref} className={sharedClassName} to={to} aria-disabled={isDisabled || undefined} {...props}>{content}</Link>;
  if (href) return <a ref={ref} className={sharedClassName} href={href} aria-disabled={isDisabled || undefined} {...props}>{content}</a>;

  return (
    <motion.button
      ref={ref}
      whileTap={!isDisabled && !reduceMotion ? { scale: 0.975 } : undefined}
      transition={{ duration: 0.14 }}
      className={sharedClassName}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      type={type}
      {...props}
    >
      {content}
    </motion.button>
  );
});

Button.displayName = "Button";
