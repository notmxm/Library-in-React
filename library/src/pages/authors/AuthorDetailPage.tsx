import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { authorsApi } from "../../api/authorApi";
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

  const { data: author} = useQuery({
    queryKey: ["author", authorId],
    queryFn: () => authorsApi.getById(authorId),
  });

  const { data: books} = useQuery({
    queryKey: ["author-books", authorId],
    queryFn: () => authorsApi.getBooks(authorId),
  });


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
                {booksList.length} libri
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
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
              disabled={booksList.length > 0}
            >
              Elimina
            </Button>
          </div>
        </div>

        {booksList.length > 0 && (
          <div className="mt-4 bg-yellow-100 border border-yellow-300 p-4 text-yellow-800 rounded-md">
            L'autore ha ancora dei libri attivi.
          </div>
        )}

        <ErrorMessage message={deleteError} />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Libri di {author.name}
        </h2>

        {booksList.length === 0 ? (
          <div className="border border-gray-300 p-12 text-center bg-white rounded-md">
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
                className="border border-gray-300 bg-white p-5 hover:border-blue-500 rounded-md flex flex-col"
              >
                <h3 className="font-bold text-gray-900 text-lg">
                  {book.title}
                </h3>
                <div className="mt-4">
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
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
        confirmLabel="Sì, elimina"
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
