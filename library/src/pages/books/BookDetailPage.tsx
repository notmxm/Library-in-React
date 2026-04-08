import { useState} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { bookApi } from "../../api/bookApi";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { Button } from "../../components/ui/Button";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { StarRating } from "../../components/ui/StarRating";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const bookId = parseInt(id!, 10);

  /*
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  */

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  /*
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    bookApi
      .getById(bookId)
      .then((data) => {
        setBook(data);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {};
  }, [bookId]);
  */

  const {data: book, isLoading, error} = useQuery({
    queryKey: ["book", bookId],
    queryFn: () => bookApi.getById(bookId)
  });

  const errorMessage = error instanceof Error ? error.message : null;

  /*
  async function handleDelete() {
    setIsDeleting(true);
    try {
      await bookApi.delete(bookId);
      navigate("/books", { replace: true });
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error ? err.message : "Errore durante l'eliminazione",
      );
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  }
  */

  const deleteMutation = useMutation({
    mutationFn: () => bookApi.delete(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["books"]});
      queryClient.removeQueries({queryKey: ["book", bookId]});
      navigate("/books", {replace: true});
    },
    onError: (err) => {
      setDeleteError(err instanceof Error ? err.message : "Errore durante eliminazione");
      setShowDeleteModal(false);
    }
  })


  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          Indietro
        </button>
        <ErrorMessage message={errorMessage} />
      </div>
    );
  }

  if (!book) return null;

  type DetailItem = { label: string; value: React.ReactNode };

  const details: (DetailItem | null)[] = [
    {
      label: "Autore",
      value: (
        <Link
          to={`/authors/${book.authorId}`}
          className="text-indigo-600 hover:underline font-medium"
        >
          {book.authorName}
        </Link>
      ),
    },
    book.isbn ? { label: "ISBN-10", value: book.isbn } : null,
    book.isbn13 ? { label: "ISBN-13", value: book.isbn13 } : null,
    book.languageCode
      ? { label: "Lingua", value: book.languageCode.toUpperCase() }
      : null,
    book.numPages
      ? { label: "Pagine", value: book.numPages.toLocaleString("it-IT") }
      : null,
    book.publisher ? { label: "Editore", value: book.publisher } : null,
    book.publicationDate
      ? { label: "Pubblicazione", value: book.publicationDate }
      : null,
    book.ratingsCount
      ? {
          label: "Votazioni",
          value: book.ratingsCount.toLocaleString("it-IT"),
        }
      : null,
    book.textReviewsCount
      ? {
          label: "Recensioni",
          value: book.textReviewsCount.toLocaleString("it-IT"),
        }
      : null,
    {
      label: "Aggiunto il",
      value: new Date(book.createdAt).toLocaleDateString("it-IT", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    },
    {
      label: "Aggiornato il",
      value: new Date(book.updatedAt).toLocaleDateString("it-IT", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    },
  ];

  const filteredDetails = details.filter(Boolean) as DetailItem[];

  return (
    <div className="space-y-8">
      <Link
        to="/books"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600"
      >
        Tutti i libri
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-8 text-white">
          <div className="flex flex-col gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-tight">
                {book.title}
              </h1>
              <Link
                to={`/authors/${book.authorId}`}
                className="mt-2 inline-block text-indigo-200 hover:text-white transition-colors"
              >
                {book.authorName}
              </Link>
              {book.averageRating !== null && (
                <div className="mt-3">
                  <StarRating rating={book.averageRating} />
                </div>
              )}
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/books/${bookId}/edit`)}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Modifica
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                Elimina
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8">
          <ErrorMessage message={deleteError} />

          <dl className="grid grid-cols-1 gap-x-6 gap-y-4">
            {filteredDetails.map(({ label, value }) => (
              <div
                key={label}
                className="border-b border-slate-100 pb-4 last:border-0"
              >
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {label}
                </dt>
                <dd className="mt-1 text-sm text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title={`Eliminare "${book.title}"?`}
        message="Questa azione è irreversibile."
        confirmLabel="Sì, elimina"
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
