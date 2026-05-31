import Papa from 'papaparse';

export interface AiUsageLog {
  id: number;
  sessionId: string | null;
  userId: number | null;
  modelUsed: string;
  costEstimated: number;
  status: 'success' | 'failed';
  createdAt: Date;
}

export interface AiUsageStats {
  Totale: number;
  count: number;
  byModel: Record<string, { count: number; cost: number }>;
  daily: Array<{ date: string; cost: number }>;
}

/**
 * Export usage logs to CSV format
 */
export function exportToCSV(logs: AiUsageLog[], filename = 'raport-costuri-ai.csv') {
  const data = logs.map(log => ({
    'Data': new Date(log.createdAt).toLocaleString('ro-RO'),
    'Model': log.modelUsed,
    'Cost (€)': (log.costEstimated / 100).toFixed(4),
    'Status': log.status === 'success' ? 'Successo' : 'Eșec',
    'Session ID': log.sessionId || '-',
  }));

  const csv = Papa.unparse(data);
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export stats to PDF format (using HTML table)
 */
export function exportToPDF(stats: AiUsageStats, logs: AiUsageLog[], filename = 'raport-costuri-ai.pdf') {
  const monthlyPrediction = stats.daily.length > 0
    ? (stats.Totale / stats.daily.length) * 30
    : 0;

  // Create HTML content for PDF
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Raport Costuri AI</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        h1 { color: #c9a227; border-bottom: 2px solid #c9a227; padding-bottom: 10px; }
        h2 { color: #c9a227; margin-top: 20px; }
        .stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin: 20px 0; }
        .stat-card { background: #f5f5f5; padding: 15px; border-radius: 5px; }
        .stat-value { font-size: 24px; font-weight: bold; color: #c9a227; }
        .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #c9a227; color: white; padding: 10px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        tr:nth-child(even) { background: #f9f9f9; }
        .model-stats { margin: 20px 0; }
        .model-item { background: #f5f5f5; padding: 10px; margin: 5px 0; border-radius: 3px; }
      </style>
    </head>
    <body>
      <h1>Raport Costuri AI - Decor Carpi</h1>
      <p>Generat: ${new Date().toLocaleString('ro-RO')}</p>
      
      <h2>Statistici Generale</h2>
      <div class="stats">
        <div class="stat-card">
          <div class="stat-value">€${(stats.Totale / 100).toFixed(2)}</div>
          <div class="stat-label">Cost Totale</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">€${(monthlyPrediction / 100).toFixed(2)}</div>
          <div class="stat-label">Predicție Lunară</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.count}</div>
          <div class="stat-label">Totale Generări</div>
        </div>
      </div>

      <h2>Utilizare pe Model</h2>
      <div class="model-stats">
        ${Object.entries(stats.byModel).map(([model, data]) => `
          <div class="model-item">
            <strong>${model}</strong><br>
            Generări: ${data.count} | Cost: €${(data.cost / 100).toFixed(2)} | Cost/gen: €${((data.cost / data.count) / 100).toFixed(4)}
          </div>
        `).join('')}
      </div>

      <h2>Costuri Zilnice</h2>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Cost (€)</th>
          </tr>
        </thead>
        <tbody>
          ${stats.daily.map(day => `
            <tr>
              <td>${day.date}</td>
              <td>€${(day.cost / 100).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>Detalii Generări</h2>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Model</th>
            <th>Cost (€)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${logs.map(log => `
            <tr>
              <td>${new Date(log.createdAt).toLocaleString('ro-RO')}</td>
              <td>${log.modelUsed}</td>
              <td>€${(log.costEstimated / 100).toFixed(4)}</td>
              <td>${log.status === 'success' ? 'Successo' : 'Eșec'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  // Convert HTML to PDF using print
  const printWindow = window.open('', '', 'height=600,width=800');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}

/**
 * Download file helper
 */
function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
