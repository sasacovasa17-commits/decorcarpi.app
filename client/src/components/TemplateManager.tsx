import { useState } from 'react';
import { Plus, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import type { CalculationTemplate } from '@/hooks/useCalculationTemplates';

interface TemplateManagerProps {
  templates: CalculationTemplate[];
  onSaveTemplate: (name: string, texture: string, discount: number, extraWork: number) => void;
  onLoadTemplate: (template: CalculationTemplate) => void;
  onDeleteTemplate: (id: number) => void;
  currentTexture: string;
  currentSconto: number;
  currentExtraWork: number;
}

export function TemplateManager({
  templates,
  onSaveTemplate,
  onLoadTemplate,
  onDeleteTemplate,
  currentTexture,
  currentSconto,
  currentExtraWork,
}: TemplateManagerProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const handleSave = () => {
    if (!templateName.trim()) {
      toast.error('Inserisci un nome per il template');
      return;
    }
    onSaveTemplate(templateName, currentTexture, currentSconto, currentExtraWork);
    setTemplateName('');
    setShowSaveDialog(false);
    toast.success(`Template "${templateName}" salvato!`);
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg" style={{ background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.2)' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold" style={{ color: '#c9a227' }}>Template Salvati</h3>
        <button
          onClick={() => setShowSaveDialog(!showSaveDialog)}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-all"
          style={{
            background: '#c9a227',
            color: '#0a0a0a',
          }}
        >
          <Plus size={14} />
          Salva
        </button>
      </div>

      {showSaveDialog && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nome template..."
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="flex-1 px-2 py-1 rounded text-xs"
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: '1px solid rgba(201,162,39,0.3)',
            }}
          />
          <button
            onClick={handleSave}
            className="px-2 py-1 rounded text-xs font-semibold"
            style={{ background: '#c9a227', color: '#0a0a0a' }}
          >
            Salva
          </button>
        </div>
      )}

      {templates.length > 0 ? (
        <div className="flex flex-col gap-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between p-2 rounded text-xs"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,162,39,0.2)' }}
            >
              <div className="flex-1">
                <p style={{ color: '#c9a227', fontWeight: 'bold' }}>{template.name}</p>
                <p style={{ color: '#888', fontSize: '10px' }}>
                  Sconto: {template.discount}% | Adaos: {template.extraWork}%
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onLoadTemplate(template)}
                  className="p-1 rounded transition-all hover:bg-amber-500/20"
                  title="Carica template"
                >
                  <Download size={14} style={{ color: '#c9a227' }} />
                </button>
                <button
                  onClick={() => {
                    onDeleteTemplate(template.id);
                    toast.success('Template eliminato!');
                  }}
                  className="p-1 rounded transition-all hover:bg-red-500/20"
                  title="Elimina template"
                >
                  <Trash2 size={14} style={{ color: '#ff6b6b' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: '#666', fontSize: '12px', textAlign: 'center' }}>
          Nessun template salvato
        </p>
      )}
    </div>
  );
}
