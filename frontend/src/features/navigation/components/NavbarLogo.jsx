import React from "react";
import { Link } from "react-router-dom";

export const NavbarLogo = ({ onClick }) => (
  <Link
    to="/"
    onClick={onClick}
    aria-label="Sastify home"
    className="group inline-flex shrink-0 items-center rounded-xl bg-white p-1 shadow-sm ring-1 ring-black/10 transition duration-normal hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
  >
    <img src="/brand/sastify-app-icon.png" alt="" width="40" height="40" className="h-9 w-9 rounded-lg object-cover sm:hidden" aria-hidden="true" />
    <img src="/brand/sastify-logo.png" alt="Sastify" width="260" height="84" className="hidden h-10 w-auto max-w-[150px] object-contain sm:block lg:max-w-[168px]" />
  </Link>
);
