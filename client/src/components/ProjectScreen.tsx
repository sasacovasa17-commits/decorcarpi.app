import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Download, MessageCircle, Edit2, Save, X } from "lucide-react";
import type { Language } from "@/lib/i18n";

export type ProjectItem = {
  id: string;
  type: "stucco" | "paint" | "antimold";
  model: string;
  color: string;
  room: string;
  sqm: number;
  pricePerSqm: number;
};

interface ProjectScreenProps {
  onBack: () => void;
  t: any;
}

export function ProjectScreen({ onBack, t }: ProjectScreenProps) {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [projectName, setProjectName] = useState("Progetto Nuovo");
  
  // Client data
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientCF, setClientCF] = useState("");
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number | null>(null);
  
  // Form fields - separate state per field
  const [formType, setFormType] = useState("stucco");
  const [formModel, setFormModel] = useState("");
  const [formRoom, setFormRoom] = useState("");
  const [formSqm, setFormSqm] = useState("10");
  const [formPrice, setFormPrice] = useState("8");

  const addItem = () => {
    console.log('[DEBUG] addItem called');
    console.log('[DEBUG] formModel:', formModel, 'formRoom:', formRoom);
    
    if (!formModel.trim() || !formRoom.trim()) {
      alert("Compila tutti i campi: Modello e Stanza sono obbligatori");
      return;
    }
    
    const item: ProjectItem = {
      id: Date.now().toString(),
      type: (formType as any) || "stucco",
      model: formModel,
      color: "#c9a227",
      room: formRoom,
      sqm: Number(formSqm) || 10,
      pricePerSqm: Number(formPrice) || 8,
    };
    
    console.log('[DEBUG] Adding item:', item);
    setItems([...items, item]);
    
    // Reset form
    setFormType("stucco");
    setFormModel("");
    setFormRoom("");
    setFormSqm("10");
    setFormPrice("8");
    setShowAddForm(false);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItemPrice = (id: string, newPrice: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, pricePerSqm: newPrice } : item
    ));
    setEditingItemId(null);
    setEditingPrice(null);
  };

  const totalPrice = items.reduce((sum, item) => sum + item.sqm * item.pricePerSqm, 0);
  const ivaAmount = Math.round(totalPrice * 0.22);
  const totalWithIva = totalPrice + ivaAmount;

  const exportPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      
      // Background
      doc.setFillColor(10, 10, 10);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      
      // Title
      doc.setTextColor(201, 162, 39);
      doc.setFontSize(20);
      doc.text("PREVENTIVO", pageWidth / 2, margin + 10, { align: "center" });
      
      // Client info
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      let yPos = margin + 25;
      
      doc.text(`Cliente: ${clientName}`, margin, yPos);
      yPos += 7;
      doc.text(`Indirizzo: ${clientAddress}`, margin, yPos);
      yPos += 7;
      doc.text(`Email: ${clientEmail}`, margin, yPos);
      yPos += 7;
      doc.text(`CF: ${clientCF}`, margin, yPos);
      yPos += 10;
      
      // Project name
      doc.setTextColor(201, 162, 39);
      doc.text(`Progetto: ${projectName}`, margin, yPos);
      yPos += 10;
      
      // Table header
      doc.setTextColor(201, 162, 39);
      doc.setFontSize(9);
      const colWidths = [30, 30, 20, 20, 30];
      const headers = ["Tipo", "Modello", "Stanza", "m²", "€/m²"];
      let xPos = margin;
      
      headers.forEach((header, i) => {
        doc.text(header, xPos, yPos);
        xPos += colWidths[i];
      });
      
      yPos += 7;
      
      // Table rows
      doc.setTextColor(255, 255, 255);
      items.forEach((item) => {
        xPos = margin;
        doc.text(item.type, xPos, yPos);
        xPos += colWidths[0];
        doc.text(item.model.substring(0, 15), xPos, yPos);
        xPos += colWidths[1];
        doc.text(item.room, xPos, yPos);
        xPos += colWidths[2];
        doc.text(item.sqm.toString(), xPos, yPos);
        xPos += colWidths[3];
        doc.text("€" + item.pricePerSqm, xPos, yPos);
        yPos += 7;
      });
      
      // Totales
      yPos += 5;
      doc.setTextColor(201, 162, 39);
      doc.text(`Subtotale: €${totalPrice}`, margin, yPos);
      yPos += 7;
      doc.text(`IVA 22%: €${ivaAmount}`, margin, yPos);
      yPos += 7;
      doc.setFontSize(11);
      doc.text(`TOTALE: €${totalWithIva}`, margin, yPos);
      
      // Download
      doc.save(`preventivo-${projectName}.pdf`);
    } catch (error) {
      console.error("PDF export error:", error);
      alert("Errore nella generazione del PDF");
    }
  };

  const sendWhatsApp = () => {
    const message = `Preventivo per ${clientName}:\n\n${items.map(item => `${item.model} - ${item.sqm}m² x €${item.pricePerSqm} = €${item.sqm * item.pricePerSqm}`).join("\n")}\n\nTOTALE: €${totalWithIva}`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0a0a0a", color: "#ffffff", fontFamily: "'Open Sans', sans-serif" }}>
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: "rgba(201,162,39,0.2)" }}>
        <button
          onClick={onBack}
          className="p-2 rounded hover:bg-gray-800"
          title="Înapoi"
        >
          <ArrowLeft size={20} style={{ color: "#c9a227" }} />
        </button>
        <h1 style={{ color: "#c9a227", fontFamily: "'Playfair Display', serif", fontSize: "18px" }}>
          Preventivo
        </h1>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Project name */}
        <div className="px-4 py-4 border-b" style={{ borderColor: "rgba(201,162,39,0.2)" }}>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#c9a227" }}>
            Nome Progetto
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Nome progetto..."
            className="w-full px-3 py-2 rounded-sm text-sm"
            style={{ background: "#ffffff", color: "#0a0a0a", border: "1px solid #c9a227" }}
          />
        </div>

        {/* Client data */}
        <div className="px-4 py-4 border-b" style={{ borderColor: "rgba(201,162,39,0.2)" }}>
          <h3 style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif", fontSize: "14px", marginBottom: "12px" }}>
            Dati Cliente
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nome cliente..."
              className="w-full px-3 py-2 rounded-sm text-sm"
              style={{ background: "#ffffff", color: "#0a0a0a", border: "1px solid #c9a227" }}
            />
            <input
              type="text"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              placeholder="Indirizzo..."
              className="w-full px-3 py-2 rounded-sm text-sm"
              style={{ background: "#ffffff", color: "#0a0a0a", border: "1px solid #c9a227" }}
            />
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="Email cliente..."
              className="w-full px-3 py-2 rounded-sm text-sm"
              style={{ background: "#ffffff", color: "#0a0a0a", border: "1px solid #c9a227" }}
            />
            <input
              type="text"
              value={clientCF}
              onChange={(e) => setClientCF(e.target.value)}
              placeholder="Codice Fiscale..."
              className="w-full px-3 py-2 rounded-sm text-sm"
              style={{ background: "#ffffff", color: "#0a0a0a", border: "1px solid #c9a227" }}
            />
          </div>
        </div>

        {/* Articles table */}
        {items.length > 0 && (
          <div className="px-4 py-4 border-b" style={{ borderColor: "rgba(201,162,39,0.2)" }}>
            <h3 style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif", fontSize: "14px", marginBottom: "12px" }}>
              Articoli ({items.length})
            </h3>
            <div className="space-y-2 text-xs">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-sm flex items-center justify-between"
                  style={{ background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.3)" }}
                >
                  <div className="flex-1">
                    <p style={{ color: "#c9a227", fontWeight: "bold" }}>
                      {item.model} - {item.room}
                    </p>
                    <p style={{ color: "#999" }}>
                      {item.sqm}m² × €{item.pricePerSqm}/m² = €{item.sqm * item.pricePerSqm}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {editingItemId === item.id ? (
                      <>
                        <input
                          type="number"
                          value={editingPrice || 0}
                          onChange={(e) => setEditingPrice(Number(e.target.value))}
                          className="w-16 px-2 py-1 rounded text-xs"
                          style={{ background: "#ffffff", color: "#0a0a0a" }}
                        />
                        <button
                          onClick={() => updateItemPrice(item.id, editingPrice || 8)}
                          className="p-1 rounded"
                          style={{ background: "#c9a227", color: "#0a0a0a" }}
                          title="Salva"
                        >
                          <Save size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingItemId(null);
                            setEditingPrice(null);
                          }}
                          className="p-1 rounded"
                          style={{ background: "#666", color: "#fff" }}
                          title="Annulla"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingItemId(item.id);
                            setEditingPrice(item.pricePerSqm);
                          }}
                          className="p-1 rounded"
                          style={{ background: "#c9a227", color: "#0a0a0a" }}
                          title="Modifica prezzo"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 rounded text-red-500 hover:text-red-400"
                          title="Elimina"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add button */}
        <div className="px-4 py-4 border-b" style={{ borderColor: "rgba(201,162,39,0.2)" }}>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full py-2 text-sm font-bold rounded-sm flex items-center justify-center gap-2"
            style={{ background: "#c9a227", color: "#0a0a0a" }}
          >
            <Plus size={16} />
            Aggiungi Articolo
          </button>
        </div>

        {/* Add Item Form */}
        {showAddForm && (
          <div className="px-4 py-4 border-b" style={{ borderColor: "rgba(201,162,39,0.3)", background: "#0a0a0a" }}>
            <div className="space-y-3">
              <label className="block text-sm font-semibold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>Tip Prodotto</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full px-3 py-2 rounded-sm text-sm"
                style={{ background: "#ffffff", color: "#0a0a0a", border: "1px solid #c9a227" }}
              >
                <option value="stucco">Stucco</option>
                <option value="paint">Vernice</option>
                <option value="antimold">Antimuffa</option>
              </select>
              <label className="block text-sm font-semibold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>Modello/Colore</label>
              <input
                type="text"
                placeholder="Modello/Colore"
                value={formModel}
                onChange={(e) => setFormModel(e.target.value)}
                className="w-full px-3 py-2 rounded-sm text-sm"
                style={{ background: "#ffffff", color: "#0a0a0a", border: "1px solid #c9a227" }}
              />
              <label className="block text-sm font-semibold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>Stanza</label>
              <input
                type="text"
                placeholder="Stanza"
                value={formRoom}
                onChange={(e) => setFormRoom(e.target.value)}
                className="w-full px-3 py-2 rounded-sm text-sm"
                style={{ background: "#ffffff", color: "#0a0a0a", border: "1px solid #c9a227" }}
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold mb-1" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>m²</label>
                  <input
                    type="number"
                    placeholder="m²"
                    value={formSqm}
                    onChange={(e) => setFormSqm(e.target.value)}
                    className="w-full px-3 py-2 rounded-sm text-sm"
                    style={{ background: "#ffffff", color: "#0a0a0a", border: "1px solid #c9a227" }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold mb-1" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>€/m²</label>
                  <input
                    type="number"
                    placeholder="€/m²"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-sm text-sm"
                    style={{ background: "#ffffff", color: "#0a0a0a", border: "1px solid #c9a227" }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addItem}
                  className="flex-1 py-2 text-sm font-bold rounded-sm"
                  style={{ background: "#c9a227", color: "#0a0a0a" }}
                >
                  Aggiungi
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 text-sm rounded-sm border"
                  style={{ color: "#c9a227", borderColor: "rgba(201,162,39,0.3)" }}
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 px-4 py-4 border-t space-y-3" style={{ borderColor: "rgba(201,162,39,0.2)", background: "#0a0a0a", zIndex: 10 }}>
          {items.length > 0 && (
            <div className="p-3 rounded-sm" style={{ background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.3)" }}>
              <p className="text-xs" style={{ color: "#c9a227" }}>
                Subtotale: €{totalPrice}
              </p>
              <p className="text-xs" style={{ color: "#c9a227" }}>
                IVA 22%: €{ivaAmount}
              </p>
              <p className="text-xs font-bold" style={{ color: "#c9a227" }}>
                TOTALE: €{totalWithIva}
              </p>
            </div>
          )}
          
          {items.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={exportPDF}
                className="flex-1 py-2 text-sm font-bold rounded-sm flex items-center justify-center gap-2"
                style={{ background: "#c9a227", color: "#0a0a0a" }}
              >
                <Download size={16} />
                Scarica PDF
              </button>
              <button
                onClick={sendWhatsApp}
                className="flex-1 py-2 text-sm font-bold rounded-sm flex items-center justify-center gap-2"
                style={{ background: "#25D366", color: "#ffffff" }}
              >
                <MessageCircle size={16} />
                WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
