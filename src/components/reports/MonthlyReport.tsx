import React from 'react';
import { Card } from '../ui/Card';
import { Line } from 'react-chartjs-2';
import { useStore } from '../../store';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyReportProps {
  month: string;
}

export function MonthlyReport({ month }: MonthlyReportProps) {
  const { generateMonthlyReport, clients, machines } = useStore();
  const report = generateMonthlyReport(month);

  const trendData = {
    labels: report.trends.map(t => new Date(t.date).getDate()),
    datasets: [
      {
        label: 'Ingresos Diarios',
        data: report.trends.map(t => t.revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Tendencia de Ingresos'
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Resumen Económico</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Ingresos Totales</p>
              <p className="text-2xl font-bold">{formatCurrency(report.totalRevenue)}</p>
              <p className={`text-sm ${report.comparison.revenueChange >= 0 ? 'text-green-500' : 'text-pink-500'}`}>
                {formatPercentage(report.comparison.revenueChange)} vs mes anterior
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">IVA Total</p>
              <p className="text-xl font-bold">{formatCurrency(report.vatAmount)}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Parte Clientes</p>
                <p className="text-lg font-bold">{formatCurrency(report.clientShares)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Parte Operador</p>
                <p className="text-lg font-bold">{formatCurrency(report.operatorShares)}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Clientes</h3>
          <div className="space-y-4">
            {report.topClients.map(client => {
              const clientData = clients.find(c => c.id === client.clientId);
              return (
                <div key={client.clientId} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{clientData?.establishmentName}</p>
                    <p className="text-sm text-gray-400">{formatPercentage(client.share)} del total</p>
                  </div>
                  <p className="font-bold">{formatCurrency(client.revenue)}</p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Máquinas</h3>
          <div className="space-y-4">
            {report.topMachines.map(machine => {
              const machineData = machines.find(m => m.id === machine.machineId);
              return (
                <div key={machine.machineId} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{machineData?.name}</p>
                    <p className="text-sm text-gray-400">{machine.plays} partidas</p>
                  </div>
                  <p className="font-bold">{formatCurrency(machine.revenue)}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tendencias del Mes</h3>
        <div className="h-[300px]">
          <Line options={options} data={trendData} />
        </div>
      </Card>
    </div>
  );
}
