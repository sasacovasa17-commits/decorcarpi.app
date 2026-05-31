import React, { useState } from "react";
import { Upload, X, Phone, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface CustomQuoteFormProps {
  onClose?: () => void;
}

export function CustomQuoteForm({ onClose }: CustomQuoteFormProps = {}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    photo: null as File | null,
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, photo: null }));
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.description) {
      toast.error("Per favore completa tutti i campi obbligatori");
      return;
    }

    setIsSubmitting(true);
    
    // Emulate form submission
    setTimeout(() => {
      const whatsappMessage = encodeURIComponent(
        `Ciao Decor Carpi! 👋\n\nVorrei richiedere un preventivo personalizzato.\n\n📋 Dettagli:\nNome: ${formData.name}\nEmail: ${formData.email}\nTelefono: ${formData.phone}\nDescrizione: ${formData.description}\n\nGrazie!`
      );
      
      const whatsappPhone = import.meta.env.VITE_WHATSAPP_PHONE || '+393XXXXXXXXX';
      window.open(`https://wa.me/${whatsappPhone}?text=${whatsappMessage}`, "_blank");
      
      toast.success("Richiesta inviata! Riceverai una risposta presto.");
      setFormData({ name: "", email: "", phone: "", description: "", photo: null });
      setPhotoPreview(null);
      setIsSubmitting(false);
      if (onClose) onClose();
    }, 500);
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-bold tracking-wide" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
        📝 Richiesta Preventivo Personalizzato
      </h3>
      <p className="text-[#aaa] text-xs leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>
        Descrivi il tuo progetto e carica una Foto della stanza. Ti contatteremo con un preventivo personalizzato.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Nome */}
        <div>
          <label className="text-[10px] font-bold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
            Nome *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Il tuo nome"
            className="w-full mt-1 px-3 py-2 rounded-sm text-xs bg-[#222] text-white border"
            style={{ borderColor: "rgba(201,162,39,0.3)" }}
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-[10px] font-bold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="La tua email"
            className="w-full mt-1 px-3 py-2 rounded-sm text-xs bg-[#222] text-white border"
            style={{ borderColor: "rgba(201,162,39,0.3)" }}
          />
        </div>

        {/* Telefono */}
        <div>
          <label className="text-[10px] font-bold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
            Telefono *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Il tuo numero di telefono"
            className="w-full mt-1 px-3 py-2 rounded-sm text-xs bg-[#222] text-white border"
            style={{ borderColor: "rgba(201,162,39,0.3)" }}
          />
        </div>

        {/* Descrizione */}
        <div>
          <label className="text-[10px] font-bold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
            Descrizione Progetto *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Descrivi il tuo progetto (tipo di lavoro, dimensioni stanza, preferenze di stile, etc.)"
            className="w-full mt-1 px-3 py-2 rounded-sm text-xs bg-[#222] text-white border"
            style={{ borderColor: "rgba(201,162,39,0.3)", minHeight: "80px", resize: "vertical" }}
          />
        </div>

        {/* Upload Foto */}
        <div>
          <label className="text-[10px] font-bold" style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}>
            Foto della Stanza
          </label>
          <div className="mt-1 relative">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              id="photo-upload"
            />
            {!photoPreview ? (
              <label
                htmlFor="photo-upload"
                className="flex items-center justify-center gap-2 p-4 rounded-sm border-2 border-dashed cursor-pointer transition-all hover:bg-[rgba(201,162,39,0.1)]"
                style={{ borderColor: "rgba(201,162,39,0.3)" }}
              >
                <Upload size={16} style={{ color: "#c9a227" }} />
                <span className="text-[10px]" style={{ color: "#888" }}>
                  Clicca per caricare una Foto
                </span>
              </label>
            ) : (
              <div className="relative">
                <img src={photoPreview} alt="Preview" className="w-full h-auto rounded-sm max-h-40 object-cover" />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-1 right-1 p-1 bg-black/70 rounded-full hover:bg-black transition"
                >
                  <X size={14} style={{ color: "#c9a227" }} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 rounded-sm font-bold text-sm transition-all disabled:opacity-50"
          style={{
            background: "#c9a227",
            color: "#000",
            fontFamily: "'Raleway', sans-serif",
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
        >
          {isSubmitting ? "Invio in corso..." : "Invia Richiesta"}
        </button>

        {/* WhatsApp Alternative */}
        <a
          href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_PHONE || '+393XXXXXXXXX'}?text=Ciao%20Decor%20Carpi%2C%20vorrei%20un%20preventivo%20personalizzato!`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 rounded-sm font-bold text-sm transition-all"
          style={{
            background: "rgba(76, 175, 80, 0.15)",
            color: "#4cb050",
            border: "1px solid rgba(76, 175, 80, 0.3)",
            fontFamily: "'Raleway', sans-serif",
          }}
        >
          <MessageCircle size={16} />
          Contatta via WhatsApp
        </a>
      </form>
    </div>
  );
}
