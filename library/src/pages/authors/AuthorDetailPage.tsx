import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { authorsApi } from "../../api/authorApi";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import { Button } from "../../components/ui/Button";
import { ConfirmModal } from "../../components/ui/ConfirmModal";

export function AuthorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const authorId = parseInt(id!, 10);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    data: author,
    isLoading: isLoadingAuthor,
    error: errorAuthor,
  } = useQuery({
    queryKey: ["author", authorId],
    queryFn: () => authorsApi.getById(authorId),
  });

  const {
    data: books,
    isLoading: isLoadingBooks,
    error: errorBooks,
  } = useQuery({
    queryKey: ["author-books", authorId],
    queryFn: () => authorsApi.getBooks(authorId),
  });

  const isLoading = isLoadingAuthor || isLoadingBooks;
  const error = errorAuthor
    ? (errorAuthor as Error).message
    : errorBooks
      ? (errorBooks as Error).message
      : null;

  const deleteMutation = useMutation({
    mutationFn: () => authorsApi.delete(authorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] });
      queryClient.removeQueries({ queryKey: ["author", authorId] });
      navigate("/authors", { replace: true });
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

  if (error) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          Indietro
        </button>
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!author) return null;

  const booksList = books || [];

  return (
    <div className="space-y-8">
      <Link to="/authors" className="text-blue-500 mb-4 inline-block">
        Tutti gli autori
      </Link>

      <div className="border border-gray-300 bg-white p-8 rounded-md mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{author.name}</h1>
            <div className="mt-3 text-gray-500 flex gap-4">
              <span>
                {booksList.length} {booksList.length === 1 ? "libro" : "libri"}
              </span>
              <span>
                Aggiunto il{" "}
                {new Date(author.createdAt).toLocaleDateString("it-IT")}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => navigate(`/authors/${authorId}/edit`)}>
              Modifica
            </Button>
            <Button
              onClick={() => setShowDeleteModal(true)}
              disabled={booksList.length > 0}
            >
              Elimina
            </Button>
          </div>
        </div>

        {booksList.length > 0 && (
          <div className="mt-4 bg-yellow-100 border border-yellow-300 p-4 text-yellow-800 rounded-md">
            Per eliminare questo autore, devi prima eliminare tutti i suoi
            libri.
          </div>
        )}

        <ErrorMessage message={deleteError} />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Libri di {author.name}
        </h2>

        {booksList.length === 0 ? (
          <div className="border border-dashed border-gray-300 p-12 text-center bg-white rounded-md">
            <p className="text-lg text-gray-600 font-bold">
              Nessun libro ancora
            </p>
            <div className="mt-4">
              <Button onClick={() => navigate("/books/new")}>
                Aggiungi un libro
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {booksList.map((book) => (
              <Link
                key={book.id}
                to={`/books/${book.id}`}
                className="border border-gray-300 bg-white p-5 hover:border-blue-500 hover:shadow-md rounded-md flex flex-col"
              >
                <h3 className="font-bold text-gray-900 text-lg">
                  {book.title}
                </h3>
                <div className="mt-4">
                  {book.description && (
                    <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                      {book.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
                    {book.year && (
                      <span className="bg-gray-200 px-2 py-1 rounded-md text-gray-800">
                        {book.year}
                      </span>
                    )}
                    {book.isbn && <span>ISBN: {book.isbn}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title={`Eliminare ${author.name}?`}
        message="Questa azione è irreversibile."
        confirmLabel="Sì, elimina"
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
      />
    </div>
  );
}
