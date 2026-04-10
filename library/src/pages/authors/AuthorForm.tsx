import { useState } from 'react';

export type AuthorFormData = {
  name: string;
};

export type FormErrors = Partial<AuthorFormData>;

export const EMPTY_FORM: AuthorFormData = {
  name: '',
};

interface AuthorFormProps {
  initialData: AuthorFormData;
  onSubmit: (data: { name: string }) => void;
  isSaving: boolean;
  serverError: string | null;
  submitLabel: string;
  onCancel: () => void;
}

export function AuthorForm({
  initialData,
  onSubmit,
  isSaving,
  serverError,
  submitLabel,
  onCancel
}: AuthorFormProps) {
  const [formData, setFormData] = useState<AuthorFormData>(initialData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  function handleChange(field: keyof AuthorFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function validate(data: AuthorFormData): FormErrors {
    const errors: FormErrors = {};
    if (!data.name.trim()) {
      errors.name = 'Il nome è obbligatorio';
    } else if (data.name.trim().length < 2) {
      errors.name = 'Il nome deve avere almeno 2 caratteri';
    }
    return errors;
  }

  function handleSubmit(e: any) {
    e.preventDefault();
    const errors = validate(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    onSubmit({ name: formData.name.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-md border border-gray-300 space-y-5">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Dettagli Autore</h2>

      {serverError && (
        <div className="p-3 bg-red-100 text-red-700 border border-red-400 rounded-md">
          Errore Server: {serverError}
        </div>
      )}

      <div className="flex flex-col">
        <label className="font-semibold text-gray-700 mb-1">Nome dell'autore: *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:outline-none"
        />
        {formErrors.name && <span className="text-red-500 text-sm mt-1">{formErrors.name}</span>}
      </div>

      <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}