import { ArrowLeft, Smartphone, Share2, Plus, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

/**
 * Install Page - PWA Installation Instructions
 * Provides step-by-step guides for both Android and iOS
 * Fallback for users who don't see the automatic install prompt
 */
export default function Install() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-[#c9a227]/20">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-[#c9a227]/10 rounded-lg transition"
          >
            <ArrowLeft size={20} className="text-[#c9a227]" />
          </button>
          <h1 className="text-xl font-bold text-[#c9a227]">Installa Decor Carpi</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="mb-12 text-center">
          <Smartphone size={48} className="mx-auto mb-4 text-[#c9a227]" />
          <h2 className="text-2xl font-bold mb-3">Aggiungi l'app al tuo telefono</h2>
          <p className="text-gray-400">
            Installa Decor Carpi come app nativa per accesso rapido e funzionalità offline
          </p>
        </div>

        {/* Android Instructions */}
        <div className="mb-12 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#c9a227]/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-[#c9a227] mb-6 flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            Android (Chrome, Firefox, Edge)
          </h3>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#c9a227] text-black font-bold">
                  1
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Apri il browser</h4>
                <p className="text-gray-400 mb-3">
                  Accedi a <code className="bg-black/50 px-2 py-1 rounded text-[#c9a227]">decorcarpi-5jyuybvq.manus.space</code>
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#c9a227] text-black font-bold">
                  2
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Tocca il menu (⋮)</h4>
                <p className="text-gray-400">
                  Premi i tre puntini verticali in alto a destra del browser
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#c9a227] text-black font-bold">
                  3
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Seleziona "Installa app"</h4>
                <p className="text-gray-400 mb-3">
                  Cerca l'opzione "Installa app" o "Add to Home Screen"
                </p>
                <div className="bg-black/50 border border-[#c9a227]/30 rounded p-3 text-sm text-gray-300">
                  Se non vedi questa opzione, prova a cancellare la cache del browser:
                  <br />
                  Menu → Impostazioni → Cancella dati di navigazione
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#c9a227] text-black font-bold">
                  4
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Conferma il nome</h4>
                <p className="text-gray-400">
                  Apparirà una finestra di conferma. Premi "Installa" per completare
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#c9a227] text-black font-bold">
                  5
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Fatto! 🎉</h4>
                <p className="text-gray-400">
                  L'app sarà disponibile nella tua home screen e nel drawer delle app
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* iOS Instructions */}
        <div className="mb-12 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#c9a227]/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-[#c9a227] mb-6 flex items-center gap-2">
            <span className="text-2xl">🍎</span>
            iPhone & iPad (Safari)
          </h3>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#c9a227] text-black font-bold">
                  1
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Apri Safari</h4>
                <p className="text-gray-400 mb-3">
                  Accedi a <code className="bg-black/50 px-2 py-1 rounded text-[#c9a227]">decorcarpi-5jyuybvq.manus.space</code>
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#c9a227] text-black font-bold">
                  2
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Tocca Share (Condividi)</h4>
                <p className="text-gray-400">
                  Premi il pulsante Share <Share2 className="inline" size={16} /> in basso
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#c9a227] text-black font-bold">
                  3
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Scorri e seleziona "Add to Home Screen"</h4>
                <p className="text-gray-400">
                  Scorri il menu fino a trovare l'opzione <Plus className="inline" size={16} /> "Add to Home Screen"
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#c9a227] text-black font-bold">
                  4
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Personalizza il nome (opzionale)</h4>
                <p className="text-gray-400">
                  Puoi cambiare il nome dell'app o lasciare quello predefinito
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#c9a227] text-black font-bold">
                  5
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Premi "Aggiungi"</h4>
                <p className="text-gray-400">
                  Conferma aggiungendo l'app alla home screen
                </p>
              </div>
            </div>

            {/* Step 6 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#c9a227] text-black font-bold">
                  6
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Fatto! 🎉</h4>
                <p className="text-gray-400">
                  L'app sarà disponibile nella tua home screen
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#c9a227]/20 rounded-xl p-6 mb-12">
          <h3 className="text-lg font-bold text-[#c9a227] mb-4">❓ Problemi?</h3>
          <div className="space-y-4 text-sm text-gray-400">
            <div>
              <p className="font-semibold text-white mb-1">Non vedo l'opzione di installazione</p>
              <p>Assicurati di usare una versione recente del browser. Prova a cancellare la cache e ricaricare la pagina.</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">L'app non si apre</p>
              <p>Prova a disinstallare e reinstallare l'app. Se il problema persiste, contattaci.</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">Hai bisogno di aiuto?</p>
              <p>Contattaci tramite il modulo di contatto nell'app o via email a decorcarpi@gmail.com</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mb-8">
          <Button
            onClick={() => navigate('/')}
            className="bg-[#c9a227] hover:bg-[#a68a1f] text-black font-bold px-8 py-3 rounded-lg inline-flex items-center gap-2"
          >
            <Home size={18} />
            Torna alla Home
          </Button>
        </div>
      </div>
    </div>
  );
}
