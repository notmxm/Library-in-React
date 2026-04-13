import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { bookApi } from '../../api/bookApi';
import { BookForm, EMPTY_FORM } from './BookForm';

export function BookCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (dto: any) => bookApi.create(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      navigate(`/books/${data.id}`);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Nuovo Libro</h1>
      </div>
      <BookForm
        initialData={EMPTY_FORM}
        onSubmit={(dto) => saveMutation.mutate(dto)}
        submitLabel="Crea Libro"
      />
    </div>
  );
}
