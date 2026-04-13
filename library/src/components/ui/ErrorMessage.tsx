type ErrorMessageProps = {
  message: string | null | undefined;
  title?: string;
};

//  https://react.dev/learn/conditional-rendering#conditionally-returning-nothing-with-null

export function ErrorMessage({
  message,
  title = "Si è verificato un errore",
}: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
      <svg
        className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-9a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm0-3a1 1 0 100 2 1 1 0 000-2z"
          clipRule="evenodd"
        />
      </svg>

      <div>
        <p className="text-sm font-semibold text-red-800">{title}</p>
        <p className="mt-0.5 text-sm text-red-700">{message}</p>
      </div>
    </div>
  );
}
