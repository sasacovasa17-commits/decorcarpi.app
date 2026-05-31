import React, { useState } from "react";
import { ArrowLeft, Upload, X, Phone } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface CustomQuoteFormScreenProps {
  onBack: () => void;
}

export function CustomQuoteFormScreen({ onBack }: CustomQuoteFormScreenProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const uploadPhotoMutation = trpc.quote.uploadPhoto.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    setPhotoUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validazione
    if (!formData.name.trim()) {
      toast.error("Inserisci il tuo nome", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Inserisci il tuo numero di telefono", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Descrivi il tuo progetto", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
      return;
    }

    if (!photoFile) {
      toast.error("Carica una Foto della stanza (obbligatoria)", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload Foto a S3
      let uploadedPhotoUrl = photoUrl;
      
      if (!photoUrl && photoFile) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64 = event.target?.result as string;
          try {
            const result = await uploadPhotoMutation.mutateAsync({
              base64,
              fileName: photoFile.name,
            });
            uploadedPhotoUrl = result.url;

            // Prepara messaggio WhatsApp con link Foto
            const message = encodeURIComponent(
              `Ciao! Ho una richiesta di preventivo personalizzato:\n\n` +
              `Nome: ${formData.name}\n` +
              `Email: ${formData.email}\n` +
              `Telefono: ${formData.phone}\n` +
              `Descrizione: ${formData.description}\n\n` +
              `Foto della stanza: ${uploadedPhotoUrl}`
            );

            // Nomero WhatsApp Decor Carpi
            const whatsappNumber = "393343600932";
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

            // Apri WhatsApp
            window.open(whatsappUrl, "_blank", "noopener,noreferrer");

            // Toast di successo
            toast.success("Richiesta inviata! Apri WhatsApp per completare.", {
              style: { background: "#1a0a0a", color: "#4caf50", border: "1px solid rgba(76,175,80,0.3)" },
            });

            // Reset form
            setFormData({ name: "", email: "", phone: "", description: "" });
            setPhotoPreview(null);
            setPhotoFile(null);
            setPhotoUrl(null);
          } catch (error) {
            console.error("Upload error:", error);
            toast.error("Errore nell'upload della Foto", {
              style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
            });
          } finally {
            setIsSubmitting(false);
          }
        };
        reader.readAsDataURL(photoFile);
      } else {
        // Se Foto già caricata
        const message = encodeURIComponent(
          `Ciao! Ho una richiesta di preventivo personalizzato:\n\n` +
          `Nome: ${formData.name}\n` +
          `Email: ${formData.email}\n` +
          `Telefono: ${formData.phone}\n` +
          `Descrizione: ${formData.description}\n\n` +
          `Foto della stanza: ${uploadedPhotoUrl}`
        );

        const whatsappNumber = "393343600932";
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

        window.open(whatsappUrl, "_blank", "noopener,noreferrer");

        toast.success("Richiesta inviata! Apri WhatsApp per completare.", {
          style: { background: "#1a0a0a", color: "#4caf50", border: "1px solid rgba(76,175,80,0.3)" },
        });

        setFormData({ name: "", email: "", phone: "", description: "" });
        setPhotoPreview(null);
        setPhotoFile(null);
        setPhotoUrl(null);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Errore nell'invio della richiesta", {
        style: { background: "#1a0a0a", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.3)" },
      });
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name.trim() && formData.phone.trim() && formData.description.trim() && photoFile;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a] border-b" style={{ borderColor: "rgba(201,162,39,0.2)" }}>
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-[#1a1a1a] rounded transition"
            style={{ color: "#c9a227" }}
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 style={{ color: "#c9a227", fontFamily: "'Playfair Display', serif", fontSize: "20px" }}>
              Richiesta Preventivo
            </h1>
            <p style={{ color: "#888", fontSize: "12px", marginTop: "2px" }}>
              Personalizzato
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Nome */}
        <div>
          <label style={{ color: "#c9a227", fontSize: "12px", fontWeight: "bold", fontFamily: "'Raleway', sans-serif" }}>
            Nome *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Il tuo nome"
            className="w-full mt-2 px-3 py-2 rounded-sm bg-[#1a1a1a] text-white border outline-none transition"
            style={{ borderColor: "rgba(201,162,39,0.3)", color: "#e8e8e8" }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(201,162,39,0.6)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(201,162,39,0.3)")}
          />
        </div>

        {/* Email */}
        <div>
          <label style={{ color: "#c9a227", fontSize: "12px", fontWeight: "bold", fontFamily: "'Raleway', sans-serif" }}>
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="La tua email"
            className="w-full mt-2 px-3 py-2 rounded-sm bg-[#1a1a1a] text-white border outline-none transition"
            style={{ borderColor: "rgba(201,162,39,0.3)", color: "#e8e8e8" }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(201,162,39,0.6)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(201,162,39,0.3)")}
          />
        </div>

        {/* Telefono */}
        <div>
          <label style={{ color: "#c9a227", fontSize: "12px", fontWeight: "bold", fontFamily: "'Raleway', sans-serif" }}>
            Telefono *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Il tuo numero di telefono"
            className="w-full mt-2 px-3 py-2 rounded-sm bg-[#1a1a1a] text-white border outline-none transition"
            style={{ borderColor: "rgba(201,162,39,0.3)", color: "#e8e8e8" }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(201,162,39,0.6)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(201,162,39,0.3)")}
          />
        </div>

        {/* Descrizione */}
        <div>
          <label style={{ color: "#c9a227", fontSize: "12px", fontWeight: "bold", fontFamily: "'Raleway', sans-serif" }}>
            Descrizione Progetto *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Descrivi il tuo progetto, le tue esigenze e le tue preferenze..."
            rows={4}
            className="w-full mt-2 px-3 py-2 rounded-sm bg-[#1a1a1a] text-white border outline-none transition resize-none"
            style={{ borderColor: "rgba(201,162,39,0.3)", color: "#e8e8e8" }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(201,162,39,0.6)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(201,162,39,0.3)")}
          />
        </div>

        {/* Foto della Stanza */}
        <div>
          <label style={{ color: "#c9a227", fontSize: "12px", fontWeight: "bold", fontFamily: "'Raleway', sans-serif" }}>
            Foto della Stanza *
          </label>
          {!photoPreview ? (
            <label className="w-full mt-2 px-4 py-6 rounded-sm border-2 border-dashed cursor-pointer hover:bg-[#1a1a1a] transition flex flex-col items-center justify-center"
              style={{ borderColor: "rgba(201,162,39,0.4)", background: "rgba(201,162,39,0.05)" }}>
              <Upload size={32} style={{ color: "#c9a227", marginBottom: "8px" }} />
              <p style={{ color: "#c9a227", fontSize: "14px", fontWeight: "bold", marginBottom: "4px" }}>
                Carica una Foto
              </p>
              <p style={{ color: "#888", fontSize: "12px" }}>
                Clicca per selezionare o trascina qui
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="mt-2 relative rounded-sm overflow-hidden" style={{ background: "rgba(201,162,39,0.1)" }}>
              <img
                src={photoPreview}
                alt="Anteprima Foto"
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute top-2 right-2 p-2 rounded-full hover:bg-red-600 transition"
                style={{ background: "rgba(255,68,68,0.8)" }}
              >
                <X size={16} style={{ color: "white" }} />
              </button>
              <p style={{ color: "#888", fontSize: "12px", padding: "8px", textAlign: "center" }}>
                Foto caricata ✓
              </p>
            </div>
          )}
        </div>

        {/* Butoane */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="flex-1 py-3 rounded-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: isFormValid && !isSubmitting ? "#c9a227" : "rgba(201,162,39,0.3)",
              color: isFormValid && !isSubmitting ? "#0a0a0a" : "#666",
              fontFamily: "'Raleway', sans-serif",
            }}
          >
            {isSubmitting ? "Invio in corso..." : "Invia Richiesta"}
          </button>
          <button
            type="button"
            onClick={() => {
              const message = encodeURIComponent(
                `Ciao! Vorrei ricevere un preventivo personalizzato per il mio progetto.`
              );
              const whatsappNumber = "393343600932";
              const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
              window.open(whatsappUrl, "_blank", "noopener,noreferrer");
            }}
            className="px-4 py-3 rounded-sm font-bold transition flex items-center justify-center gap-2"
            style={{
              background: "rgba(76,175,80,0.2)",
              color: "#4caf50",
              border: "1px solid rgba(76,175,80,0.4)",
              fontFamily: "'Raleway', sans-serif",
            }}
          >
            <Phone size={18} />
            WhatsApp
          </button>
        </div>

        {/* Note */}
        <p style={{ color: "#666", fontSize: "12px", marginTop: "16px", textAlign: "center" }}>
          * Campi obbligatori
        </p>
      </form>
    </div>
  );
}
