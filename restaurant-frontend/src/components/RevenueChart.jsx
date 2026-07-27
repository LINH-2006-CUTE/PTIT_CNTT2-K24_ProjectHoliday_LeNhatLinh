import React from 'react';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(num)} VND`;
};

export default function RevenueChart({ data = [], title = 'Doanh thu' }) {
  if (!data || !data.length) return <div className="flex h-64 items-center justify-center text-sm text-[#6E6564]">Chưa có dữ liệu doanh thu.</div>;

  const chartData = {
    labels: data.map((item) => item.month),
    datasets: [{
      label: title,
      data: data.map((item) => Number(item.revenue) || 0),
      borderColor: '#4A121A',
      backgroundColor: 'rgba(74, 18, 26, 0.12)',
      pointBackgroundColor: '#C5A059',
      pointBorderColor: '#FFFFFF',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      borderWidth: 3,
      fill: true,
      tension: 0.38,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: { display: false },
      tooltip: {
        displayColors: false,
        backgroundColor: '#4A121A',
        titleColor: '#FFFFFF',
        bodyColor: '#C5A059',
        padding: 12,
        callbacks: { label: (context) => formatCurrency(context.parsed.y) },
      },
    },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { color: '#6E6564', font: { size: 11, weight: '600' } } },
      y: { beginAtZero: true, border: { display: false }, grid: { color: '#E8E2D9', borderDash: [4, 4] }, ticks: { color: '#6E6564', font: { size: 10 }, callback: (value) => formatCurrency(value) } },
    },
  };

  return <div className="h-72 w-full"><Line data={chartData} options={options} /></div>;
}
