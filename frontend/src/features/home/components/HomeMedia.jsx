import React from "react";
import { ImageWithFallback } from "../../../components/ui/ImageWithFallback";

const videoPattern = /\.(mp4|webm|ogg)(\?.*)?$/i;

export const resolveBannerMedia = (banner, fallback) => {
  const source = banner?.video || banner?.videoUrl || banner?.mediaUrl || banner?.image || fallback;
  const type = banner?.mediaType === "video" || videoPattern.test(source || "") ? "video" : "image";
  return { source, type, poster: banner?.poster || banner?.posterImage || banner?.image || fallback };
};

export const HomeMedia = ({ banner, fallback, alt, className = "", eager = false }) => {
  const media = resolveBannerMedia(banner, fallback);
  if (media.type === "video") {
    return (
      <video
        className={className}
        src={media.source}
        poster={media.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={alt}
      />
    );
  }

  return (
    <ImageWithFallback
      src={media.source}
      fallback={fallback}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      width={1600}
      height={1000}
      wrapperClassName="h-full w-full"
      className={className}
    />
  );
};
