import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Book, Pagination } from "../../types";
import { bookApi } from "../../api/bookApi";
import { Spinner } from "../../components/ui/Spinner";
import { Button } from "../../components/ui/Button";
import { StarRating } from "../../components/ui/StarRating";
import { Pagination as PaginationControl } from "../../components/ui/Pagination";
import { useDebounce } from "../../hooks/useDebounce";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { useQuery } from "@tanstack/react-query";

const ITEMS_PER_PAGE = 24;

export function BooksListPage() {
  const navigate = useNavigate();

  /*

    pre react-query:
    queste cose erano uno snapshot del server state,
    portandosi dietro tutti i problemi di dover gestire un server state.
    quindi boilerplate, mancanza di cache, dati vecchi, race conditions

    Quindi si usa react per la UI e il client state
    e invece reactquery per il server state.


    const [books, setBooks] = useState<Book[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  */


  // questo invece rappresenta il client state
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);
  const [page, setPage] = useState(1);

  /*
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    bookApi
      .getAll({
        page,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch || undefined,
      })
      .then((result) => {
        setBooks(result.data || []);
        setPagination(result.pagination);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {};
  }, [page, debouncedSearch]);
*/

  /*
    data è quello che bookapi.getall() mi restituisce

    isLoading è true solo la prima volta che la query viene eseguita
    e non ci sono ancora dati in cache.

    error è la risposta di errore
  */
  const {data, isLoading, error} = useQuery({
    queryKey: ["books", {page, search: debouncedSearch}],
    queryFn: () =>
      bookApi.getAll({
        page,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch || undefined,
      }),
  });

  const books = data?.data || [];
  //null per adattarlo al conditional rendering
  const pagination = data?.pagination || null;
  const errorMessage = error instanceof Error ? error.message : null

  // questo va bene perchè sto sincronizzando due client state
  // ovvero la pagina e il search
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);


  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Libri</h1>
          {pagination && (
            <p className="mt-1 text-sm text-slate-500">
              {pagination.total.toLocaleString()} libri nel catalogo
            </p>
          )}
        </div>
        <Button onClick={() => navigate("/books/new")}>Aggiungi libro</Button>
      </div>


      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="search"
          placeholder="Cerca per titolo o autore..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900
                     placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <ErrorMessage message={errorMessage} />


      {isLoading ? (
        <Spinner />
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16 text-center">
          <p className="mt-3 text-lg font-medium text-slate-700">
            Nessun libro trovato
          </p>
          {searchInput && (
            <p className="mt-1 text-sm text-slate-500">
              Nessun risultato per "{searchInput}"
            </p>
          )}
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() => navigate("/books/new")}
          >
            Aggiungi il primo libro
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <PaginationControl
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

type BookCardProps = {
  book: Book;
};

function BookCard({ book }: BookCardProps) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/books/${book.id}`)}
      className="cursor-pointer group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm
                 transition-all duration-150 hover:border-indigo-200 hover:shadow-md"
    >
      <h3 className="line-clamp-2 font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
        {book.title}
      </h3>

      <p className="mt-1 text-sm text-indigo-600 hover:underline">
        {/* 

            Event Bubbling https://shiftasia.com/community/javascript-how-event-bubbling-and-event-capturing-work/#:~:text=Event%20bubbling%20in%20Javascript%20is,triggered%20by%20their%20child%20elements.

            React event propagation (event bubbling) https://react.dev/learn/responding-to-events#event-propagation

            Syntetic event? https://react.dev/reference/react-dom/components/common#react-event-object
        
        */}
        <Link
          to={`/authors/${book.authorId}`}
          onClick={(e) => e.stopPropagation()}
          className="hover:underline"
        >
          {book.authorName}
        </Link>
      </p>

      <div className="mt-3 flex flex-col gap-1.5">
        {book.averageRating !== null && (
          <StarRating
            rating={book.averageRating}
            ratingsCount={book.ratingsCount}
          />
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
          {book.languageCode && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
              {book.languageCode}
            </span>
          )}
          {book.numPages && <span>{book.numPages} pag.</span>}
          {book.publisher && (
            <span className="truncate max-w-[200px]" title={book.publisher}>
              {book.publisher}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
