import React from "react";
import { FiArrowRight, FiInbox } from "react-icons/fi";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { cn } from "../utils/cn";

export const EmptyState = ({
  title,
  description,
  icon,
  actionLabel,
  actionTo,
  onAction,
  secondaryActionLabel,
  secondaryActionTo,
  onSecondaryAction,
  compact = false,
  fullPage = false,
  className = "",
}) => (
  <Card
    hover={false}
    className={cn(
      "flex flex-col items-center text-center",
      compact ? "gap-3 px-5 py-7" : "gap-5 px-6 py-10",
      fullPage && "min-h-[55vh] justify-center",
      className
    )}
  >
    <div className={cn("flex items-center justify-center rounded-full bg-brand-soft text-brand-primary", compact ? "h-12 w-12" : "h-16 w-16")}>
      {icon || <FiInbox className={compact ? "text-xl" : "text-2xl"} aria-hidden="true" />}
    </div>
    <div className="space-y-2">
      <h2 className={cn("font-semibold text-primary", compact ? "text-xl" : "text-2xl")}>{title}</h2>
      {description ? <p className="mx-auto max-w-lg text-body">{description}</p> : null}
    </div>
    {(actionLabel || secondaryActionLabel) ? (
      <div className="flex flex-wrap justify-center gap-3">
        {actionLabel ? <Button to={actionTo} onClick={onAction} rightIcon={<FiArrowRight />}>{actionLabel}</Button> : null}
        {secondaryActionLabel ? <Button to={secondaryActionTo} onClick={onSecondaryAction} variant="secondary">{secondaryActionLabel}</Button> : null}
      </div>
    ) : null}
  </Card>
);
