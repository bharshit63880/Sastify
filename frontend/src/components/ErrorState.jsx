import React from "react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { cn } from "../utils/cn";

export const ErrorState = ({
  title = "Something went wrong",
  description = "We could not load this content. Please try again.",
  icon,
  actionLabel = "Try again",
  onAction,
  actionTo,
  secondaryActionLabel,
  onSecondaryAction,
  secondaryActionTo,
  compact = false,
  fullPage = false,
  className = "",
}) => (
  <Card hover={false} role="alert" className={cn("flex flex-col items-center text-center", compact ? "gap-3 px-5 py-7" : "gap-5 px-6 py-10", fullPage && "min-h-[55vh] justify-center", className)}>
    <div className={cn("flex items-center justify-center rounded-full bg-error/12 text-error", compact ? "h-12 w-12" : "h-16 w-16")}>
      {icon || <FiAlertTriangle className={compact ? "text-xl" : "text-2xl"} aria-hidden="true" />}
    </div>
    <div className="space-y-2">
      <h2 className={cn("font-semibold text-text-primary", compact ? "text-xl" : "text-2xl")}>{title}</h2>
      <p className="mx-auto max-w-lg text-body">{description}</p>
    </div>
    <div className="flex flex-wrap justify-center gap-3">
      {actionLabel ? <Button to={actionTo} onClick={onAction} leftIcon={<FiRefreshCw />}>{actionLabel}</Button> : null}
      {secondaryActionLabel ? <Button to={secondaryActionTo} onClick={onSecondaryAction} variant="secondary">{secondaryActionLabel}</Button> : null}
    </div>
  </Card>
);
