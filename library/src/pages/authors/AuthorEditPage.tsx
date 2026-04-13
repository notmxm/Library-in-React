import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authorsApi } from '../../api/authorApi';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { AuthorForm, type AuthorFormData } from './AuthorForm';

export function AuthorEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const authorId = parseInt(id!, 10);

  const { data: author, isLoading, error: loadError } = useQuery({
    queryKey: ['author', authorId],
    queryFn: () => authorsApi.getById(authorId)
  });

  const saveMutation = useMutation({
    mutationFn: (dto: { name: string }) => authorsApi.update(authorId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      queryClient.invalidateQueries({ queryKey: ['author', authorId] });
      navigate(`/authors/${authorId}`);
    },
  });

  if (isLoading) return <Spinner />;

  if (loadError || !author) {
    const msg = loadError instanceof Error ? loadError.message : 'Errore durante il caricamento dell autore';
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <button onClick={() => navigate(-1)} className="text-blue-500"> Indietro</button>
        <ErrorMessage message={msg} />
      </div>
    );
  }

  const initialFormData: AuthorFormData = {
    name: author.name
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to={`/authors/${authorId}`} className="text-blue-500 mb-4 inline-block">
        Torna al dettaglio
      </Link>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Modifica Autore</h1>
      </div>
      <AuthorForm
        initialData={initialFormData}
        onSubmit={(dto) => saveMutation.mutate(dto)}
        submitLabel="Salva modifiche"
      />
    </div>
  );
}