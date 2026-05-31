import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CostChartProps {
  data: Array<{ date: string; cost: number }>;
  title?: string;
}

export function CostChart({ data, title = 'Costuri Zilnice (€)' }: CostChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-black/30 rounded border border-gold/20">
        <p className="text-gray-400">Nu sunt date disponibile pentru grafic</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('ro-RO', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Cost Zilnic (€)',
        data: data.map(d => (d.cost / 100).toFixed(2)),
        borderColor: '#c9a227',
        backgroundColor: 'rgba(201, 162, 39, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#c9a227',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#9ca3af',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: title,
        color: '#c9a227',
        font: {
          size: 14,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#c9a227',
        bodyColor: '#fff',
        borderColor: '#c9a227',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `€${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#9ca3af',
          callback: function(value: any) {
            return '€' + value;
          },
        },
        grid: {
          color: 'rgba(201, 162, 39, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(201, 162, 39, 0.1)',
        },
      },
    },
  };

  return (
    <div className="w-full bg-black/50 p-4 rounded border border-gold/20">
      <Line data={chartData} options={options} height={300} />
    </div>
  );
}
