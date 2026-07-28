import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Container } from "./Container";

export const AuthShell = ({ eyebrow, title, description, highlights = [], children }) => {
  useEffect(() => {
    let robots = document.head.querySelector('meta[name="robots"]');
    if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.appendChild(robots); }
    robots.content = "noindex,nofollow";
  }, []);
  return (
    <div className="min-h-screen py-10">
      <Container className="flex min-h-screen items-center justify-center">
        <div className={`grid w-full overflow-hidden rounded-2xl border border-default bg-surface-glass shadow-lg backdrop-blur-xl ${highlights.length ? "max-w-5xl lg:grid-cols-[.9fr_1.1fr]" : "max-w-md"}`}>
          {highlights.length ? <aside className="hidden bg-brand-gradient p-10 text-white lg:flex lg:flex-col lg:justify-between"><Link to="/" className="text-2xl font-semibold">Sastify</Link><div><p className="text-sm uppercase tracking-[.22em] text-white/70">{eyebrow}</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.05em]">{title}</h2><p className="mt-4 leading-7 text-white/75">{description}</p><ul className="mt-8 space-y-3">{highlights.map((item) => <li key={item} className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm">{item}</li>)}</ul></div></aside> : null}
        <div className="w-full space-y-6 p-6 sm:p-8">
          <div className="space-y-4 text-center">
            <Link to="/" className="inline-flex text-2xl font-semibold tracking-[-0.04em] text-textPrimary">
              Sastify
            </Link>
            {eyebrow ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textSecondary">{eyebrow}</p>
            ) : null}
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-textPrimary sm:text-4xl">{title}</h1>
              {description ? <p className="body-copy">{description}</p> : null}
            </div>
          </div>

          <div>
            {children}
          </div>
        </div>
        </div>
      </Container>
    </div>
  );
};
