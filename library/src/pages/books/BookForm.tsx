import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authorsApi } from '../../api/authorApi';
import { useDebounce } from '../../hooks/useDebounce';

export type BookFormData = {
  title: string;
  authorId: string;
  isbn: string;
  isbn13: string;
  averageRating: string;
  languageCode: string;
  numPages: string;
  ratingsCount: string;
  textReviewsCount: string;
  publicationDate: string;
  publisher: string;
}

export type FormErrors = Partial<BookFormData>;

export const EMPTY_FORM: BookFormData = {
  title: '',
  authorId: '',
  isbn: '',
  isbn13: '',
  averageRating: '',
  languageCode: '',
  numPages: '',
  ratingsCount: '',
  textReviewsCount: '',
  publicationDate: '',
  publisher: '',
};

type BookFormProps = {
  initialData: BookFormData;
  initialAuthorName?: string;
  onSubmit: (data: any) => void;
  submitLabel: string;
}

export function BookForm({ 
  initialData, 
  initialAuthorName = '', 
  onSubmit, 
  submitLabel
}: BookFormProps) {
  const [formData, setFormData] = useState<BookFormData>(initialData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [authorSearch, setAuthorSearch] = useState(initialAuthorName);
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedSearch = useDebounce(authorSearch, 300);

  const { data: authorsData} = useQuery({
    queryKey: ['authors', 'search', debouncedSearch],
    queryFn: () => authorsApi.getAll({ search: debouncedSearch, limit: 5 }),
    enabled: showDropdown && debouncedSearch.length > 0,
  });

  const authors = authorsData?.data || [];

  function handleChange(field: keyof BookFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function validate(data: BookFormData): FormErrors {
    const errors: FormErrors = {};
    if (!data.title.trim()) errors.title = 'Il titolo è obbligatorio';
    if (!data.authorId) errors.authorId = 'Seleziona un autore';
    if (data.averageRating && (isNaN(Number(data.averageRating)) || Number(data.averageRating) < 0 || Number(data.averageRating) > 5)) {
      errors.averageRating = 'Il voto deve essere tra 0 e 5';
    }
    if (data.numPages && (isNaN(Number(data.numPages)) || Number(data.numPages) < 1)) {
      errors.numPages = 'Il numero di pagine deve essere un intero positivo';
    }
    return errors;
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const errors = validate(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const dto = {
      title: formData.title.trim(),
      authorId: parseInt(formData.authorId, 10),
      isbn: formData.isbn.trim() || undefined,
      isbn13: formData.isbn13.trim() || undefined,
      averageRating: formData.averageRating ? parseFloat(formData.averageRating) : undefined,
      languageCode: formData.languageCode.trim() || undefined,
      numPages: formData.numPages ? parseInt(formData.numPages, 10) : undefined,
      ratingsCount: formData.ratingsCount ? parseInt(formData.ratingsCount, 10) : undefined,
      textReviewsCount: formData.textReviewsCount ? parseInt(formData.textReviewsCount, 10) : undefined,
      publicationDate: formData.publicationDate.trim() || undefined,
      publisher: formData.publisher.trim() || undefined,
    };


    onSubmit(dto);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-md border border-gray-300 space-y-5">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Dettagli Libro</h2>

      <div className="flex flex-col">
        <label className="font-semibold text-gray-700 mb-1">Titolo libro:</label>
        <input 
          type="text" 
          value={formData.title} 
          onChange={(e) => handleChange('title', e.target.value)} 
          className="border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {formErrors.title && <span className="text-red-500 text-sm mt-1">{formErrors.title}</span>}
      </div>

      <div className="flex flex-col relative">
        <label className="font-semibold text-gray-700 mb-1">Autore:</label>
        <input
          type="text"
          value={authorSearch}
          placeholder="Cerca autore..."
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          onChange={(e) => {
            setAuthorSearch(e.target.value);
            handleChange('authorId', '');
            setShowDropdown(true);
          }}
          className="border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white w-full"
        />

        {showDropdown && authorSearch.length > 0 && (
          <div className="absolute top-18 left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto w-full">
            { authors.length > 0 ? (
              <ul>
                {authors.map((a) => (
                  <li
                    key={a.id}
                    onMouseDown={(e) => {
                      e.preventDefault(); 
                      setAuthorSearch(a.name);
                      handleChange('authorId', String(a.id));
                      setShowDropdown(false);
                    }}
                    className="p-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 border-gray-100"
                  >
                    {a.name}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-2 text-gray-500 text-sm">Nessun autore trovato.</div>
            )}
          </div>
        )}

        <input type="hidden" value={formData.authorId} />

        {formErrors.authorId && <span className="text-red-500 text-sm mt-1">{formErrors.authorId}</span>}
        <small className="mt-1 text-gray-500">
          <Link to="/authors/new" className="text-blue-600 hover:underline">Crea autore se non presente</Link>
        </small>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-1">ISBN-10:</label>
          <input type="text" value={formData.isbn} onChange={(e) => handleChange('isbn', e.target.value)} className="border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:outline-none" />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-1">ISBN-13:</label>
          <input type="text" value={formData.isbn13} onChange={(e) => handleChange('isbn13', e.target.value)} className="border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-1">Data di Pubblicazione:</label>
          <input type="date" value={formData.publicationDate} onChange={(e) => handleChange('publicationDate', e.target.value)} className="border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:outline-none" />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-1">Editore:</label>
          <input type="text" value={formData.publisher} onChange={(e) => handleChange('publisher', e.target.value)} className="border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:outline-none" />
        </div>
      </div>

      <div className="flex flex-col">
        <label className="font-semibold text-gray-700 mb-1">Lingua:</label>
        <input type="text" value={formData.languageCode} onChange={(e) => handleChange('languageCode', e.target.value)} className="border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:outline-none" />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-1">Numero Pagine:</label>
          <input type="number" min="1" value={formData.numPages} onChange={(e) => handleChange('numPages', e.target.value)} className="border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:outline-none" />
          {formErrors.numPages && <span className="text-red-500 text-sm mt-1">{formErrors.numPages}</span>}
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-1">Voto (0-5):</label>
          <input type="number" step="0.01" min="0" max="5" value={formData.averageRating} onChange={(e) => handleChange('averageRating', e.target.value)} className="border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:outline-none" />
          {formErrors.averageRating && <span className="text-red-500 text-sm mt-1">{formErrors.averageRating}</span>}
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-1">N° Votazioni:</label>
          <input type="number" min="0" value={formData.ratingsCount} onChange={(e) => handleChange('ratingsCount', e.target.value)} className="border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:outline-none" />
        </div>
      </div>

      <div className="flex flex-col w-1/3">
        <label className="font-semibold text-gray-700 mb-1">N° Recensioni Testuali:</label>
        <input type="number" min="0" value={formData.textReviewsCount} onChange={(e) => handleChange('textReviewsCount', e.target.value)} className="border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:outline-none" />
      </div>

      <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-gray-200">
        <button 
          type="button" 
          onClick={() => window.history.back()} 
          className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors"
        >
          Annulla
        </button>
        <button 
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
