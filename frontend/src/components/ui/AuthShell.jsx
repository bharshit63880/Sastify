import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Container } from "./Container";

const BrandLogo = () => (
  <Link to="/" aria-label="Sastify home" className="mx-auto inline-flex w-fit">
    <img
      src="/brand/sastify-logo-light.png"
      alt="Sastify"
      width="520"
      height="190"
      className="h-14 w-auto max-w-[190px] object-contain sm:h-16 sm:max-w-[210px]"
    />
  </Link>
);

export const AuthShell = ({ eyebrow, title, description, children }) => {
  useEffect(() => {
    let robots = document.head.querySelector('meta[name="robots"]');
    if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.appendChild(robots); }
    robots.content = "noindex,nofollow";
  }, []);
  return (
    <div className="relative min-h-screen overflow-hidden px-3 py-8 sm:px-5 sm:py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="absolute -left-16 top-[12%] h-52 w-52 rounded-full bg-brand-primary/15 blur-2xl sm:h-72 sm:w-72" />
        <span className="absolute -right-20 top-[28%] h-64 w-64 rounded-full bg-[#e2bd73]/20 blur-3xl sm:h-80 sm:w-80" />
        <span className="absolute bottom-[7%] left-[20%] h-44 w-44 rounded-full bg-brand-accent/10 blur-2xl" />
      </div>
      <Container className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center sm:min-h-[calc(100vh-6rem)]">
        <div className="relative w-full max-w-xl">
          <span aria-hidden="true" className="absolute -left-5 -top-5 h-20 w-20 rounded-full border border-white/60 bg-[linear-gradient(145deg,rgba(255,255,255,.8),rgba(206,169,94,.28))] shadow-[0_18px_45px_rgba(139,100,35,.18)] backdrop-blur-xl sm:-left-12 sm:-top-10 sm:h-32 sm:w-32" />
          <span aria-hidden="true" className="absolute -bottom-7 -right-4 h-24 w-24 rounded-full border border-white/60 bg-[linear-gradient(145deg,rgba(226,189,115,.35),rgba(255,255,255,.72))] shadow-[0_22px_55px_rgba(139,100,35,.2)] backdrop-blur-xl sm:-right-14 sm:h-36 sm:w-36" />
          <span aria-hidden="true" className="absolute -right-4 top-16 h-9 w-9 rounded-full bg-brand-primary/35 shadow-[0_10px_24px_rgba(139,100,35,.28)] sm:-right-10 sm:h-14 sm:w-14" />
          <div className="relative w-full overflow-hidden rounded-[32px] border border-white/75 bg-surface-glass shadow-[0_32px_90px_rgba(76,55,23,.18),0_8px_28px_rgba(76,55,23,.1),inset_0_1px_0_rgba(255,255,255,.9)] backdrop-blur-2xl sm:rounded-[40px]">
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent" aria-hidden="true" />
            <div className="w-full space-y-7 p-6 sm:p-10 md:p-12">
          <div className="space-y-4 text-center">
            <BrandLogo />
            {eyebrow ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textSecondary">{eyebrow}</p>
            ) : null}
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-textPrimary sm:text-4xl">{title}</h1>
              {description ? <p className="body-copy">{description}</p> : null}
            </div>
          </div>

          <div className="mx-auto w-full max-w-md">
            {children}
          </div>
        </div>
          </div>
        </div>
      </Container>
    </div>
  );
};
