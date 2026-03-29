/*
    https://reactrouter.com/api/components/NavLink

*/

import { Link, NavLink } from "react-router-dom";

function navLinkClass({ isActive }: { isActive: boolean }): string {
  const base =
    "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150";
  return isActive
    ? `${base} bg-indigo-50 text-indigo-700 font-semibold`
    : `${base} text-slate-600 hover:bg-slate-100 hover:text-slate-900`;
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-indigo-700 hover:text-indigo-800 transition-colors"
        >
          <span>Biblioteca</span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/books" className={navLinkClass}>
            Libri
          </NavLink>
          <NavLink to="/authors" className={navLinkClass}>
            Autori
          </NavLink>
        </nav>
        
      </div>
    </header>
  );
}
