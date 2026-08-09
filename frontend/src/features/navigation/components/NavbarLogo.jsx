import React from "react";
import { Link } from "react-router-dom";

export const NavbarLogo = ({ onClick }) => (
  <Link
    to="/"
    onClick={onClick}
    aria-label="Sastify home"
    className="group inline-flex shrink-0 items-center rounded-xl border border-default bg-surface-raised p-1 shadow-sm transition duration-normal hover:-translate-y-0.5 hover:border-strong hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
  >
    <img src="/logo192.png" alt="" width="40" height="40" className="h-9 w-9 rounded-lg object-cover sm:hidden" aria-hidden="true" />
    <img src="/brand/sastify-logo-light.png" alt="Sastify" width="520" height="184" className="hidden h-10 w-auto max-w-[170px] object-contain dark:hidden sm:block lg:max-w-[188px]" />
    <img src="/brand/sastify-logo-dark.png" alt="Sastify" width="520" height="199" className="hidden h-10 w-auto max-w-[170px] object-contain sm:dark:block lg:max-w-[188px]" />
  </Link>
);
