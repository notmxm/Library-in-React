/*
 createPortal: https://react.dev/reference/react-dom/createPortal
 mi permette di scrivere del codice di un componente react dove voglio, 
 per esempio come figlio di una pagina BookDetails ma di mettere 
 fisicamente questo componente in un altro punto a mio piacere ma facendo 
 funzionare tutto cosi come se fosse davvero figlio della pagina BookDetails

*/


interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  confirmLabel = 'Elimina',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
 
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-md border border-gray-300 w-96 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">Azione irreversibile</p>

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300"
          >
            Annulla
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

