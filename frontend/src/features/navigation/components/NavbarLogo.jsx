import React from "react";
import { Link } from "react-router-dom";

export const NavbarLogo = ({ onClick }) => (
  <Link to="/" onClick={onClick} className="inline-flex items-center gap-2 rounded-pill text-[1.55rem] font-bold tracking-[-0.055em] text-primary">
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-sm font-extrabold text-white shadow-glow" aria-hidden="true">S</span>
    <span>Sastify</span>
  </Link>
);
