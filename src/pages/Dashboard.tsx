import React from 'react';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';
import { SternInsiderConnect } from '../components/SternInsiderConnect';
import { useStore } from '../store';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { 
  BarChart3, 
  PieChart,
  TrendingUp,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
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

export function Dashboard() {
  const { 
    dashboardMetrics, 
    machines = [], 
    maintenanceSchedules = [],
    operationalMetrics = [],
    routes = []
  } = useStore();

  // Ensure we have default values for all metrics
  const metrics = {
    totalRevenue: dashboardMetrics?.totalRevenue || 0,
    monthlyGrowth: dashboardMetrics?.monthlyGrowth || 0,
    activeMachines: dashboardMetrics?.activeMachines || 0,
    monthlyTrends: dashboardMetrics?.monthlyTrends || []
  };

  const pendingMaintenance = maintenanceSchedules.filter(m => m.status === 'pending').length;
  const criticalAlerts = maintenanceSchedules.filter(m => m.priority === 'critical').length;
  const activeRoutes = routes.filter(r => r.status === 'in-progress').length;

  const revenueChartData = {
    labels: metrics.monthlyTrends.map(t => t.month),
    datasets: [
      {
        label: 'Ingresos Mensuales',
        data: metrics.monthlyTrends.map(t => t.revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    }
  };

  return (
    <Container className="py-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-glow text-blue-500">Panel de Control</h2>
        <p className="text-gray-400 mt-2">Monitoreo en tiempo real de todas las operaciones</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Ingresos Totales</p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(metrics.totalRevenue)}
              </p>
              <p className="text-green-500 text-sm mt-1">
                +{formatPercentage(metrics.monthlyGrowth)}
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Máquinas Activas</p>
              <p className="text-2xl font-bold mt-1">
                {metrics.activeMachines}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                de {machines.length} total
              </p>
            </div>
            <PieChart className="h-5 w-5 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Eficiencia Operativa</p>
              <p className="text-2xl font-bold mt-1">
                {formatPercentage(operationalMetrics[0]?.efficiency?.oee || 0)}
              </p>
              <p className="text-yellow-500 text-sm mt-1">
                {criticalAlerts} alertas críticas
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Rutas Activas</p>
              <p className="text-2xl font-bold mt-1">{activeRoutes}</p>
              <p className="text-blue-500 text-sm mt-1">
                {pendingMaintenance} tareas pendientes
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-pink-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tendencia de Ingresos</h3>
          <div className="h-[300px]">
            <Line options={chartOptions} data={revenueChartData} />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Estado de Máquinas</h3>
          <div className="space-y-4">
            {machines.slice(0, 5).map((machine) => {
              const metrics = operationalMetrics.find(m => m.machineId === machine.id);
              const efficiency = metrics?.efficiency?.oee || 0;
              const status = efficiency > 90 ? 'success' : 
                           efficiency > 70 ? 'warning' : 'error';
              
              return (
                <div key={machine.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center">
                    {status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />}
                    {status === 'warning' && <Clock className="h-5 w-5 text-yellow-500 mr-3" />}
                    {status === 'error' && <AlertTriangle className="h-5 w-5 text-pink-500 mr-3" />}
                    <div>
                      <p className="font-medium">{machine.name}</p>
                      <p className="text-sm text-gray-400">
                        {formatPercentage(efficiency)} eficiencia
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(metrics?.transactions?.averageValue || 0)}
                    </p>
                    <p className="text-sm text-gray-400">
                      {metrics?.transactions?.total || 0} transacciones
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Alertas de Mantenimiento</h3>
          <div className="space-y-4">
            {maintenanceSchedules
              .filter(m => m.status === 'pending' && m.priority === 'critical')
              .slice(0, 4)
              .map((maintenance) => {
                const machine = machines.find(m => m.id === maintenance.machineId);
                return (
                  <div key={maintenance.id} className="p-4 bg-pink-500/10 border border-pink-500 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{machine?.name || 'Máquina sin nombre'}</p>
                        <p className="text-sm text-gray-400">{maintenance.notes}</p>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-pink-500" />
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Rutas Activas</h3>
          <div className="space-y-4">
            {routes
              .filter(r => r.status === 'in-progress')
              .slice(0, 4)
              .map((route) => (
                <div key={route.id} className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Ruta #{route.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-400">
                        {route.stops.length} paradas • {route.stops.filter(s => s.status === 'completed').length} completadas
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">
                        {new Date(route.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Conexión Stern Insider</h3>
          <SternInsiderConnect />
        </Card>
      </div>
    </Container>
  );
}
