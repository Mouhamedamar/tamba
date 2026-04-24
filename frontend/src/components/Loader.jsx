export default function Loader({ fullscreen = false }) {
  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white/70 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Chargement...</span>
        </div>
      </div>
    )
  }
  return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
