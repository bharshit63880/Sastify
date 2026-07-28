import React, { useEffect, useState } from "react";
import { FiImage } from "react-icons/fi";
import { cn } from "../../utils/cn";
import { useReducedMotionPreference } from "../../hooks/useReducedMotionPreference";

export const ImageWithFallback = ({
  src,
  alt,
  className = "",
  wrapperClassName = "",
  fallback,
  aspectRatio,
  width,
  height,
  loading = "lazy",
  decoding = "async",
  fadeIn = true,
  onLoad,
  onError,
  ...props
}) => {
  const [status, setStatus] = useState(src ? "loading" : "error");
  const reduceMotion = useReducedMotionPreference();

  useEffect(() => setStatus(src ? "loading" : "error"), [src]);

  return (
    <span
      className={cn("relative block overflow-hidden bg-surface-muted", wrapperClassName)}
      style={aspectRatio ? { aspectRatio } : undefined}
      aria-busy={status === "loading" || undefined}
    >
      {status === "loading" ? <span className="skeleton absolute inset-0" aria-hidden="true" /> : null}
      {status !== "error" ? (
        <img
          src={src}
          alt={alt || ""}
          width={width}
          height={height}
          loading={loading}
          decoding={decoding}
          className={cn(
            "h-full w-full object-cover",
            fadeIn && !reduceMotion && "transition-opacity duration-normal",
            status === "loaded" ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={(event) => { setStatus("loaded"); onLoad?.(event); }}
          onError={(event) => { setStatus("error"); onError?.(event); }}
          {...props}
        />
      ) : fallback ? (
        typeof fallback === "string" ? <img src={fallback} alt={alt || ""} className={cn("h-full w-full object-cover", className)} /> : fallback
      ) : (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-brand-soft text-muted" role="img" aria-label={alt ? `Image unavailable: ${alt}` : "Image unavailable"}>
          <FiImage className="text-2xl" aria-hidden="true" />
          <span className="text-small">Image unavailable</span>
        </span>
      )}
    </span>
  );
};
