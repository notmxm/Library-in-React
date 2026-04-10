import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { bookApi } from '../../api/bookApi';
import { authorsApi } from '../../api/authorApi';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { BookForm, EMPTY_FORM } from './BookForm';

export function BookCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: authorsData, isLoading: isLoadingAuthors, error: authorsError } = useQuery({
    queryKey: ['authors', 'all'],
    queryFn: () => authorsApi.getAll({ limit: "1000" })
  });

  const saveMutation = useMutation({
    mutationFn: (dto: any) => bookApi.create(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      navigate(`/books/${data.id}`);
    },
    onError: (err) => {
      setServerError(err instanceof Error ? err.message : 'Errore sconosciuto');
    },
  });

  if (isLoadingAuthors) return <Spinner />;

  if (authorsError) {
    const msg = authorsError instanceof Error ? authorsError.message : 'Errore caricamento autori';
    return <ErrorMessage message={msg} />;
  }

  const authors = authorsData?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Nuovo Libro</h1>
      </div>
      <BookForm
        initialData={EMPTY_FORM}
        authors={authors}
        serverError={serverError}
        isSaving={saveMutation.isPending}
        onSubmit={(dto) => saveMutation.mutate(dto)}
        submitLabel="Crea Libro"
      />
    </div>
  );
}
