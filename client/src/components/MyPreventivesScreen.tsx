import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { ChevronDown, Edit2, Trash2, MessageCircle, Mail, Euro } from 'lucide-react';
import { getPreventives, deletePreventive, updatePreventiveClientData, editPreventivePricing, type Preventivi } from '@/lib/preventiveStorage';
import { exportPreventiveToExcel } from '@/lib/excelExport';


export default function MyPreventivesScreen() {
  const [preventives, setPreventives] = useState<Preventivi[]>(getPreventives());
  const [sortBy, setSortBy] = useState<'recent' | 'old' | 'price'>('recent');

  // Reîncarcă preventivele din localStorage la fiecare schimbare
  useEffect(() => {
    const interval = setInterval(() => {
      setPreventives(getPreventives());
    }, 500); // Reîncarcă la fiecare 500ms
    return () => clearInterval(interval);
  }, []);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Preventivi | null>(null);
  const [showPriceDialog, setShowPriceDialog] = useState(false);
  const [priceDialogStep, setPriceDialogStep] = useState<'password' | 'subtotal' | 'others'>('password');
  const [priceDialogInput, setPriceDialogInput] = useState('');
  const [priceData, setPriceData] = useState({ subtotal: 0, others: 0 });
  const [selectedPreventiveForPrice, setSelectedPreventiveForPrice] = useState<Preventivi | null>(null);

  const formatter = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });

  const sortedPreventives = [...preventives]
    .filter(p => filterType ? p.calculator === filterType : true)
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'old') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return b.Totale - a.Totale;
    });

  const workTypes = Array.from(new Set(preventives.map(p => p.calculator).filter(Boolean)));

  const handleEdit = (Preventivi: Preventivi) => {
    setEditingId(Preventivi.id);
    setEditData({ ...Preventivi });
  };

  const handleSaveEdit = () => {
    if (editData) {
      // Salva datele clientului
      updatePreventiveClientData(editData.id, editData.clientData);
      
      // Salva descrierea și calculator
      const preventives = getPreventives();
      const updatedPreventives = preventives.map((p) => {
        if (p.id === editData.id) {
          return {
            ...p,
            description: editData.description || p.description,
            calculator: editData.calculator || p.calculator,
          };
        }
        return p;
      });
      localStorage.setItem('decorcarpi_preventivi', JSON.stringify(updatedPreventives));
      
      setPreventives(updatedPreventives);
      setEditingId(null);
      setEditData(null);
      toast.success('Preventivo aggiornato!', {
        style: { background: '#1a0a0a', color: '#4caf50', border: '1px solid rgba(76,175,80,0.3)' },
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleEditPrice = (Preventivi: Preventivi) => {
    setSelectedPreventiveForPrice(Preventivi);
    setPriceDialogStep('password');
    setPriceDialogInput('');
    setPriceData({ subtotal: Preventivi.subtotal, others: Preventivi.others });
    setShowPriceDialog(true);
  };

  const handlePriceDialogSubmit = () => {
    const MASTER_PASSWORD = 'Alexandru.07';
    
    if (priceDialogStep === 'password') {
      if (priceDialogInput !== MASTER_PASSWORD) {
        toast.error('Password non corretta!', {
          style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
        });
        return;
      }
      setPriceDialogStep('subtotal');
      setPriceDialogInput(priceData.subtotal.toString());
    } else if (priceDialogStep === 'subtotal') {
      const subtotal = parseFloat(priceDialogInput);
      if (isNaN(subtotal) || subtotal < 0) {
        toast.error('Valore non valido', {
          style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
        });
        return;
      }
      setPriceData({ ...priceData, subtotal });
      setPriceDialogStep('others');
      setPriceDialogInput(priceData.others.toString());
    } else if (priceDialogStep === 'others') {
      const others = parseFloat(priceDialogInput);
      if (isNaN(others) || others < 0) {
        toast.error('Valore non valido', {
          style: { background: '#1a0a0a', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' },
        });
        return;
      }
      
      if (selectedPreventiveForPrice && editPreventivePricing(selectedPreventiveForPrice.id, priceData.subtotal, others, selectedPreventiveForPrice.description)) {
        setPreventives(getPreventives());
        setShowPriceDialog(false);
        toast.success('Prezzo aggiornato!', {
          style: { background: '#1a0a0a', color: '#4caf50', border: '1px solid rgba(76,175,80,0.3)' },
        });
      }
    }
  };

  const handlePriceDialogCancel = () => {
    setShowPriceDialog(false);
    setSelectedPreventiveForPrice(null);
  };





  const handleWhatsApp = (Preventivi: Preventivi) => {
    const message = `Buongiorno,\n\nLe allego il preventivo richiesto per i servizi di ${Preventivi.calculator}.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDETAGLI PREVENTIVO\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nNumero: ${Preventivi.preventiveNumber}\nCliente: ${Preventivi.clientData.nome}\nIndirizzo: ${Preventivi.clientData.indirizzo}\nDescrizione: ${Preventivi.description}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nPREZZI\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSubtotale: ${formatter.format(Preventivi.subtotal)}\nIVA (0%): €0,00\nAltri Costi: ${formatter.format(Preventivi.others + 2)}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nTOTALE: ${formatter.format(Preventivi.Totale)}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nRimango a disposizione per chiarimenti o modifiche.\n\nCordiali saluti,\nDECOR CARPI`;
    const url = `https://wa.me/3343600932?text=${encodeURIComponent(message)}`;
    window.location.href = url;
  };

  const handleEmail = (Preventivi: Preventivi) => {
    const subject = `Preventivo ${Preventivi.preventiveNumber} - Decor Carpi`;
    const body = `Caro/a ${Preventivi.clientData.nome},\n\nTi allego il preventivo per i servizi di ${Preventivi.calculator}.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDETAGLI PREVENTIVO\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nNumero: ${Preventivi.preventiveNumber}\nTipo di Lavoro: ${Preventivi.calculator}\nDescrizione: ${Preventivi.description}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nPREZZI\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSubtotale: ${formatter.format(Preventivi.subtotal)}\nIVA (0%): ${formatter.format(0)}\nAltri Costi: ${formatter.format(Preventivi.others + 2)}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nTOTALE: ${formatter.format(Preventivi.subtotal + 0 + (Preventivi.others + 2))}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nIVA e materiali sono inclusi nel preventivo.\n\nRimango a tua disposizione per chiarimenti o modifiche.\n\nCordiali saluti,\n\nDECOR CARPI\nStucchi Decorativi - Vernici Specializzate\nTel: +39 334 360 0932\nEmail: decorcarpi@gmail.com\n\nP.S. Questo preventivo è valido per 30 giorni.`;
    const url = `mailto:${Preventivi.clientData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  const handleDelete = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo preventivo?')) {
      deletePreventive(id);
      setPreventives(getPreventives());
      toast.success('Preventivo eliminato!', {
        style: { background: '#1a0a0a', color: '#4caf50', border: '1px solid rgba(76,175,80,0.3)' },
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 pb-24">
      <Toaster />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 gap-2">
        <h1 className="text-3xl font-bold text-[#c9a227]">I Miei Preventivi</h1>
        <div className="flex gap-2">
          <a
            href="/create-Preventivi"
            className="bg-[#c9a227] text-[#0a0a0a] px-4 py-2 rounded font-bold hover:bg-[#d4af37] transition-all"
          >
            + Crea
          </a>
        </div>
      </div>

      {/* Sort Buttons */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['Più recenti', 'Più vecchi', 'Prezzo'].map((label, idx) => (
          <button
            key={idx}
            onClick={() => setSortBy(['recent', 'old', 'price'][idx] as any)}
            className={`px-4 py-2 rounded font-medium whitespace-nowrap transition-all ${
              sortBy === ['recent', 'old', 'price'][idx]
                ? 'bg-[#c9a227] text-[#0a0a0a]'
                : 'bg-[#1a1a1a] text-[#c9a227] border border-[#c9a227]/30 hover:border-[#c9a227]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Preventives List */}
      <div className="space-y-4">
        {sortedPreventives.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#888] text-lg">Nessun preventivo salvato</p>
            <a href="/create-Preventivi" className="text-[#c9a227] hover:underline mt-2 inline-block">
              Crea il tuo primo preventivo
            </a>
          </div>
        ) : (
          sortedPreventives.map((Preventivi) => (
            <div
              key={Preventivi.id}
              className="bg-[#1a1a1a] border border-[#c9a227]/30 rounded-lg overflow-hidden"
            >
              {/* Header - Click to expand */}
              <div
                onClick={() => setExpandedId(expandedId === Preventivi.id ? null : Preventivi.id)}
                className="p-4 cursor-pointer hover:bg-[#242424] transition-all flex justify-between items-center"
              >
                <div className="flex-1">
                  <h3 className="text-[#c9a227] font-bold text-lg">{Preventivi.calculator}</h3>
                  <p className="text-[#888] text-sm">{new Date(Preventivi.createdAt).toLocaleDateString('it-IT')}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#c9a227] font-bold text-xl">{formatter.format(Preventivi.Totale)}</p>
                  <ChevronDown
                    size={20}
                    className={`text-[#c9a227] transition-transform ${
                      expandedId === Preventivi.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === Preventivi.id && (
                <div className="bg-[#0f0f0f] p-4 border-t border-[#c9a227]/30 space-y-3">
                  {editingId === Preventivi.id && editData ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editData.clientData.nome}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            clientData: { ...editData.clientData, nome: e.target.value },
                          })
                        }
                        placeholder="Nome"
                        className="w-full bg-[#1a1a1a] text-white px-3 py-2 rounded border border-[#c9a227]/30 focus:border-[#c9a227] outline-none"
                      />
                      <input
                        type="email"
                        value={editData.clientData.email}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            clientData: { ...editData.clientData, email: e.target.value },
                          })
                        }
                        placeholder="Email"
                        className="w-full bg-[#1a1a1a] text-white px-3 py-2 rounded border border-[#c9a227]/30 focus:border-[#c9a227] outline-none"
                      />
                      <input
                        type="tel"
                        value={editData.clientData.telefono}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            clientData: { ...editData.clientData, telefono: e.target.value },
                          })
                        }
                        placeholder="Telefono"
                        className="w-full bg-[#1a1a1a] text-white px-3 py-2 rounded border border-[#c9a227]/30 focus:border-[#c9a227] outline-none"
                      />
                      <input
                        type="text"
                        value={editData.clientData.indirizzo}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            clientData: { ...editData.clientData, indirizzo: e.target.value },
                          })
                        }
                        placeholder="Indirizzo"
                        className="w-full bg-[#1a1a1a] text-white px-3 py-2 rounded border border-[#c9a227]/30 focus:border-[#c9a227] outline-none"
                      />
                      <textarea
                        value={editData.description}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Descrizione lucrare"
                        className="w-full bg-[#1a1a1a] text-white px-3 py-2 rounded border border-[#c9a227]/30 focus:border-[#c9a227] outline-none h-20 resize-none"
                      />
                      <select
                        value={editData.calculator}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            calculator: e.target.value,
                          })
                        }
                        className="w-full bg-[#1a1a1a] text-white px-3 py-2 rounded border border-[#c9a227]/30 focus:border-[#c9a227] outline-none"
                      >
                        <option value="Vernice">Vernice</option>
                        <option value="Stucchi Decorativi">Stucchi Decorativi</option>
                        <option value="Antimuffa">Antimuffa
</option>
                        <option value="Marmurino">Marmurino</option>
                        <option value="Altro">Altro</option>
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 bg-[#4caf50] text-white py-2 rounded font-medium hover:bg-[#45a049] transition-all"
                        >
                          Salva
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 bg-[#3a1a1a] text-[#ff6b6b] py-2 rounded font-medium border border-[#ff6b6b]/30 hover:border-[#ff6b6b] transition-all"
                        >
                          Annulla
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Client Info */}
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="text-[#888]">Numero:</span>{' '}
                          <span className="text-[#c9a227] font-bold">{Preventivi.preventiveNumber}</span>
                        </p>
                        <p>
                          <span className="text-[#888]">Cliente:</span>{' '}
                          <span className="text-white">{Preventivi.clientData.nome}</span>
                        </p>
                        <p>
                          <span className="text-[#888]">Email:</span>{' '}
                          <span className="text-white">{Preventivi.clientData.email}</span>
                        </p>
                        <p>
                          <span className="text-[#888]">Telefono:</span>{' '}
                          <span className="text-white">{Preventivi.clientData.telefono}</span>
                        </p>
                        <p>
                          <span className="text-[#888]">Indirizzo:</span>{' '}
                          <span className="text-white">{Preventivi.clientData.indirizzo}</span>
                        </p>
                        {Preventivi.description && (
                          <p>
                            <span className="text-[#888]">Descrizione:</span>{' '}
                            <span className="text-white">{Preventivi.description}</span>
                          </p>
                        )}
                      </div>

                      {/* Details */}
                      <div className="bg-[#1a1a1a] rounded p-3 mb-3 text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[#888]">Subtotale:</span>
                          <span className="text-white">{formatter.format(Preventivi.subtotal)}</span>
                        </div>
                        {Preventivi.others > 0 && (
                          <div className="flex justify-between">
                            <span className="text-[#888]">Altro:</span>
                            <span className="text-white">{formatter.format(Preventivi.others)}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Actions - 6 Buttons in 2 Rows */}
                  {editingId !== Preventivi.id && (
                    <div className="space-y-2">
                      {/* Row 1: WhatsApp, Email */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleWhatsApp(Preventivi); }}
                          className="flex items-center justify-center gap-2 bg-[#1a3a1a] text-[#4caf50] py-2 rounded font-medium border border-[#4caf50]/30 hover:border-[#4caf50] transition-all text-sm"
                          title="Invia su WhatsApp"
                        >
                          <MessageCircle size={16} />
                          <span className="inline">WhatsApp</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEmail(Preventivi); }}
                          className="flex items-center justify-center gap-2 bg-[#2a1a3a] text-[#b19cd9] py-2 rounded font-medium border border-[#b19cd9]/30 hover:border-[#b19cd9] transition-all text-sm"
                          title="Invia Email"
                        >
                          <Mail size={16} />
                          <span className="inline">Email</span>
                        </button>
                      </div>
                      {/* Row 2: Modifica, Prezzo */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(Preventivi); }}
                          className="flex items-center justify-center gap-2 bg-[#1a3a5f] text-[#4da6ff] py-2 rounded font-medium border border-[#4da6ff]/30 hover:border-[#4da6ff] transition-all text-sm"
                          title="Modifica dati"
                        >
                          <Edit2 size={16} />
                          <span className="inline">Modifica</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditPrice(Preventivi); }}
                          className="flex items-center justify-center gap-2 bg-[#3a3a1a] text-[#d4af37] py-2 rounded font-medium border border-[#d4af37]/30 hover:border-[#d4af37] transition-all text-sm"
                          title="Modifica prezzo"
                        >
                          <Euro size={16} />
                          <span className="inline">Prezzo</span>
                        </button>

                      </div>
                      {/* Row 3: Elimina */}
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(Preventivi.id); }}
                          className="flex items-center justify-center gap-2 bg-[#3a1a1a] text-[#ff6b6b] py-2 rounded font-medium border border-[#ff6b6b]/30 hover:border-[#ff6b6b] transition-all text-sm"
                          title="Elimina preventivo"
                        >
                          <Trash2 size={16} />
                          <span className="hidden sm:inline">Elimina</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Price Edit Dialog */}
      {showPriceDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-[#c9a227]/30 rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-[#c9a227] font-bold text-lg mb-4">
              {priceDialogStep === 'password' && 'Inserisci Password'}
              {priceDialogStep === 'subtotal' && 'Modifica Subtotale'}
              {priceDialogStep === 'others' && 'Modifica Altri Costi'}
            </h2>
            
            <input
              type={priceDialogStep === 'password' ? 'password' : 'number'}
              value={priceDialogInput}
              onChange={(e) => setPriceDialogInput(e.target.value)}
              placeholder={priceDialogStep === 'password' ? 'Password' : 'Valore'}
              className="w-full bg-[#0f0f0f] text-white px-3 py-2 rounded border border-[#c9a227]/30 focus:border-[#c9a227] outline-none mb-4"
              autoFocus
            />
            
            <div className="flex gap-2">
              <button
                onClick={handlePriceDialogSubmit}
                className="flex-1 bg-[#c9a227] text-[#0a0a0a] py-2 rounded font-bold hover:bg-[#d4af37] transition-all"
              >
                OK
              </button>
              <button
                onClick={handlePriceDialogCancel}
                className="flex-1 bg-[#3a1a1a] text-[#ff6b6b] py-2 rounded font-bold border border-[#ff6b6b]/30 hover:border-[#ff6b6b] transition-all"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
