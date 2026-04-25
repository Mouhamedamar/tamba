import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

export default function InstallPWA() {
  const [prompt, setPrompt] = useState(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setShow(false)
    setPrompt(null)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3">
        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="font-black text-sm">TP</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Installer l app</p>
          <p className="text-gray-400 text-xs mt-0.5">Ajouter Tamba Politique sur votre ecran d accueil</p>
          <div className="flex gap-2 mt-3">
            <button onClick={handleInstall}
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
              <Download size={13} /> Installer
            </button>
            <button onClick={() => setShow(false)}
              className="text-gray-400 hover:text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
              Plus tard
            </button>
          </div>
        </div>
        <button onClick={() => setShow(false)} className="text-gray-500 hover:text-white flex-shrink-0">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
