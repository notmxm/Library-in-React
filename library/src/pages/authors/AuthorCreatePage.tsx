import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { authorsApi } from '../../api/authorApi';
import { AuthorForm, EMPTY_FORM } from './AuthorForm';

export function AuthorCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: (dto: { name: string }) => authorsApi.create(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      navigate(`/authors/${data.id}`);
    },
    onError: (err) => {
      setServerError(err instanceof Error ? err.message : 'Errore sconosciuto');
    }
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/authors" className="text-blue-500 mb-4 inline-block">
        Torna alla lista
      </Link>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nuovo Autore</h1>
      </div>
      <AuthorForm
        initialData={EMPTY_FORM}
        serverError={serverError}
        isSaving={saveMutation.isPending}
        onSubmit={(dto) => saveMutation.mutate(dto)}
        submitLabel="Crea autore"
        onCancel={() => navigate('/authors')}
      />
    </div>
  );
}