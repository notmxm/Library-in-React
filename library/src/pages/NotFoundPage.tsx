/*
    https://reactrouter.com/en/main/route/route#path
    https://reactrouter.com/en/main/hooks/use-location
 */

import { Link, useLocation } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-8xl font-black text-indigo-100 select-none">404</p>

      <div className="-mt-6 space-y-3">
        <h1 className="text-2xl font-bold text-slate-900">
          Pagina non trovata
        </h1>
        <p className="text-slate-500 max-w-md">
          La pagina 
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono text-slate-700">
            {location.pathname}
          </span> 
          non esiste o è stata spostata.
        </p>
      </div>

      <div className="mt-8 flex gap-3">
        <Link to="/books">
          <Button>Vai ai libri</Button>
        </Link>
        <Link to="/authors">
          <Button variant="secondary">Vai agli autori</Button>
        </Link>
      </div>
    </div>
  );
}
