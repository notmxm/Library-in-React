import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { bookApi } from '../../api/bookApi';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { BookForm, type BookFormData } from './BookForm';

export function BookEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const bookId = parseInt(id!, 10);

  const { data: book, isLoading: isLoadingBook, error: bookError } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => bookApi.getById(bookId)
  });

  const saveMutation = useMutation({
    mutationFn: (dto: any) => bookApi.update(bookId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      navigate(`/books/${bookId}`);
    },
    onError: (err) => {
      setServerError(err instanceof Error ? err.message : 'Errore sconosciuto');
    },
  });

  // Gestione caricamento ed errori globali
  const isLoading = isLoadingBook;
  if (isLoading) return <Spinner />;

  const error = bookError;
  if (error || !book) {
    const msg = error instanceof Error ? error.message : 'Errore durante il caricamento del libro';
    return (
      <div className="space-y-4">
        <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-700">
          ← Indietro
        </button>
        <ErrorMessage message={msg} />
      </div>
    );
  }

  // Helper per formattare la data nel formato YYYY-MM-DD richiesto dall'input HTML
  function formatDateForInput(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    } catch (e) {}
    return '';
  }

  const initialFormData: BookFormData = {
    title: book.title,
    authorId: String(book.authorId),
    isbn: book.isbn ?? '',
    isbn13: book.isbn13 ?? '',
    averageRating: book.averageRating != null ? String(book.averageRating) : '',
    languageCode: book.languageCode ?? '',
    numPages: book.numPages != null ? String(book.numPages) : '',
    ratingsCount: book.ratingsCount != null ? String(book.ratingsCount) : '',
    textReviewsCount: book.textReviewsCount != null ? String(book.textReviewsCount) : '',
    publicationDate: formatDateForInput(book.publicationDate),
    publisher: book.publisher ?? '',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 text-center">Modifica {book.title}</h1>
      </div>
      <BookForm
        initialData={initialFormData}
        initialAuthorName={book.authorName}
        serverError={serverError}
        isSaving={saveMutation.isPending}
        onSubmit={(dto) => saveMutation.mutate(dto)}
        submitLabel="Salva Modifiche"
      />
    </div>
  );
}
