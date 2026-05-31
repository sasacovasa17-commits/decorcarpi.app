import { useState, useEffect } from "react";
import { Copy, Edit2, Trash2, Mail, Download, MessageCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface SavedProjectsProps {
  onLoadProject: (projectId: number) => void;
  onDuplicateProject: (projectId: number) => void;
}

export function SavedProjects({ onLoadProject, onDuplicateProject }: SavedProjectsProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Carica lista preventivi
  const { data: preventives } = trpc.preventive.list.useQuery();
  const deletePreventive = trpc.preventive.delete.useMutation();
  const sendEmail = trpc.preventive.sendEmail.useMutation();

  useEffect(() => {
    if (preventives) {
      setProjects(preventives);
      setLoading(false);
    }
  }, [preventives]);

  const handleDelete = async (id: number) => {
    if (confirm("Sei sicuro di voler eliminare questo preventivo?")) {
      try {
        await deletePreventive.mutateAsync({ id });
        setProjects(projects.filter(p => p.id !== id));
        alert("Preventivo eliminato");
      } catch (error) {
        alert("Errore nell'eliminazione");
      }
    }
  };

  const handleSendEmail = async (id: number, email: string) => {
    if (!email) {
      alert("Email cliente non disponibile");
      return;
    }
    try {
      await sendEmail.mutateAsync({ id, clientEmail: email });
      alert("Email inviata con successo");
    } catch (error) {
      alert("Errore nell'invio email");
    }
  };

  const handleDuplicate = (id: number) => {
    onDuplicateProject(id);
  };

  if (loading) {
    return <div className="p-4 text-center">Caricamento progetti...</div>;
  }

  if (projects.length === 0) {
    return (
      <div className="p-4 text-center" style={{ color: "#c9a227" }}>
        Nessun progetto salvato
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid rgba(201,162,39,0.3)" }}>
            <th className="p-2 text-left" style={{ color: "#c9a227" }}>
              Progetto
            </th>
            <th className="p-2 text-left" style={{ color: "#c9a227" }}>
              Cliente
            </th>
            <th className="p-2 text-left" style={{ color: "#c9a227" }}>
              Stato
            </th>
            <th className="p-2 text-left" style={{ color: "#c9a227" }}>
              Data
            </th>
            <th className="p-2 text-center" style={{ color: "#c9a227" }}>
              Azioni
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr
              key={project.id}
              style={{
                borderBottom: "1px solid rgba(201,162,39,0.2)",
                background: "rgba(201,162,39,0.05)",
              }}
            >
              <td className="p-2">{project.projectName}</td>
              <td className="p-2">{project.clientName || "-"}</td>
              <td className="p-2">
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    background:
                      project.status === "accepted"
                        ? "rgba(37, 211, 102, 0.2)"
                        : project.status === "rejected"
                        ? "rgba(239, 68, 68, 0.2)"
                        : "rgba(201,162,39,0.2)",
                    color:
                      project.status === "accepted"
                        ? "#25D366"
                        : project.status === "rejected"
                        ? "#ef4444"
                        : "#c9a227",
                  }}
                >
                  {project.status === "draft"
                    ? "Bozza"
                    : project.status === "sent"
                    ? "Inviato"
                    : project.status === "accepted"
                    ? "Accettato"
                    : "Rifiutato"}
                </span>
              </td>
              <td className="p-2">
                {new Date(project.createdAt).toLocaleDateString("it-IT")}
              </td>
              <td className="p-2">
                <div className="flex gap-1 justify-center">
                  <button
                    onClick={() => onLoadProject(project.id)}
                    title="Modifica"
                    className="p-1 rounded hover:bg-gray-700"
                    style={{ color: "#c9a227" }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDuplicate(project.id)}
                    title="Duplica"
                    className="p-1 rounded hover:bg-gray-700"
                    style={{ color: "#c9a227" }}
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => handleSendEmail(project.id, project.clientEmail)}
                    title="Invia Email"
                    className="p-1 rounded hover:bg-gray-700"
                    style={{ color: "#c9a227" }}
                  >
                    <Mail size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    title="Elimina"
                    className="p-1 rounded hover:bg-gray-700 text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
