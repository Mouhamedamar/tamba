export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirmation</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200 text-sm"
            aria-label="Annuler"
            title="Annuler"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="btn-danger"
            aria-label="Confirmer la suppression"
            title="Supprimer"
          >
            Supprimer
          </button>
        </div>

      </div>
    </div>
  )
}
