import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { bookApi } from "../../api/bookApi";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { ConfirmModal } from "../../components/ui/ConfirmModal";

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const bookId = parseInt(id!, 10);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    data: book,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["book", bookId],
    queryFn: () => bookApi.getById(bookId),
  });

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : null;

  const deleteMutation = useMutation({
    mutationFn: () => bookApi.delete(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.removeQueries({ queryKey: ["book", bookId] });
      navigate("/books", { replace: true });
    },
    onError: (err) => {
      setDeleteError(
        err instanceof Error ? err.message : "Errore durante l'eliminazione",
      );
      setShowDeleteModal(false);
    },
  });

  const isDeleting = deleteMutation.isPending;

  if (isLoading) return <Spinner />;

  if (errorMessage) {
    return (
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-700 underline mb-4"
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
          label: "votazioni",
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
    <div className="p-8">
      <Link
        to="/books"
        className="text-indigo-600 hover:underline mb-6 inline-block"
      >
        Torna ai libri
      </Link>

      <div className="bg-white border border-gray-300 p-6 shadow-sm">
        <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {book.title}
            </h1>
            {book.averageRating !== null && (
              <div className="mt-2 text-gray-600 text-sm">
                Valutazione media: {book.averageRating} / 5
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/books/${bookId}/edit`)}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200"
            >
              Modifica
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white font-semibold hover:bg-red-700"
            >
              Elimina
            </button>
          </div>
        </div>

        {deleteError && (
          <div className="mb-6">
            <ErrorMessage message={deleteError} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {filteredDetails.map(({ label, value }) => (
            <div key={label} className="border-b border-gray-100 pb-2">
              <div className="text-sm uppercase font-bold text-gray-500 mb-1">
                {label}
              </div>
              <div className="text-gray-900 font-medium">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title={`Eliminare "${book.title}"?`}
        message="Questa azione è irreversibile. Il libro verrà eliminato definitivamente."
        confirmLabel="Sì, elimina"
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
      />
    </div>
  );
}
