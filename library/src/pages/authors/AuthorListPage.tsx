
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { authorsApi } from '../../api/authorApi';
import type { Author } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Button } from '../../components/ui/Button';
import { Pagination as PaginationControl } from '../../components/ui/Pagination';

const ITEMS_PER_PAGE = 20;

export function AuthorListPage() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [page, setPage] = useState(1);


  const { data, isLoading, error } = useQuery({
    queryKey: ['authors', { page, search: debouncedSearch }],
    queryFn: () => authorsApi.getAll({ page, limit: ITEMS_PER_PAGE, search: debouncedSearch ? debouncedSearch : undefined })
  });

  const authors = data?.data || [];
  const pagination = data?.pagination || null;
  const errorMessage = error instanceof Error ? error.message :  null


  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);


  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Autori</h1>
          {pagination && (
            <p className="mt-1 text-gray-500">
              {pagination.total} autori nel catalogo
            </p>
          )}
        </div>
        <Button onClick={() => navigate('/authors/new')}>
          Nuovo Autore
        </Button>
      </div>


      <div className="mb-6">
        <input
          type="text"
          placeholder="Cerca autori"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-md focus:border-blue-500 focus:outline-none"
        />
      </div>


      <ErrorMessage message={errorMessage} />


      {isLoading ? (
        <Spinner />
      ) : authors.length === 0 ? (

        <div className="border border-dashed border-gray-300 p-16 text-center rounded-md bg-white">
          <p className="mt-3 text-lg font-bold text-gray-700">Nessun autore trovato</p>
          {debouncedSearch && (
            <p className="text-gray-500 mt-1">
              Nessun risultato per "{debouncedSearch}"
            </p>
          )}
          <div className="mt-4">
            <Button onClick={() => navigate('/authors/new')}>
              Aggiungi il primo autore
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-5">
          {authors.map((author) => (
            <AuthorCard key={author.id} author={author} />
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



interface AuthorCardProps {
  author: Author;
}


function AuthorCard({ author }: AuthorCardProps) {
  return (
    <Link
      to={`/authors/${author.id}`}
      className="border border-gray-300 bg-white p-5 rounded-md hover:border-blue-500 hover:shadow-md text-center flex flex-col items-center"
    >
      <p className="font-bold text-gray-900 text-lg">
        {author.name}
      </p>
      <p className="mt-2 text-gray-500 text-sm">
        Aggiunto il {new Date(author.createdAt).toLocaleDateString('it-IT')}
      </p>
    </Link>
  );
}
