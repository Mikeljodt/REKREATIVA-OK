import React, { useState } from 'react';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/modals/Modal';
import { useStore } from '../store';
import { formatCurrency, formatDate } from '../utils/formatters';
import { AlertTriangle, CheckCircle2, Clock, PenTool as Tool } from 'lucide-react';

export function Maintenance() {
  const { maintenances, machines } = useStore();
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getMachineName = (machineId) => {
    const machine = machines?.find(m => m.id === machineId);
    return machine ? machine.name : 'Máquina no encontrada';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-pink-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'in-progress':
        return <Tool className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const pendingTasks = maintenances ? maintenances.filter(m => m.status === 'pending').length : 0;
  const inProgressTasks = maintenances ? maintenances.filter(m => m.status === 'in-progress').length : 0;
  const completedTasks = maintenances ? maintenances.filter(m => m.status === 'completed').length : 0;
  const highPriorityTasks = maintenances ? maintenances.filter(m => m.priority === 'high').length : 0;

  return (
    <Container className="py-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-glow text-blue-500">Mantenimiento</h2>
        <p className="text-gray-400 mt-2">Gestiona las tareas de mantenimiento y reparaciones.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {[
          { 
            title: 'Tareas Pendientes',
            value: pendingTasks,
            icon: Clock,
            color: 'text-yellow-500'
          },
          {
            title: 'En Progreso',
            value: inProgressTasks,
            icon: Tool,
            color: 'text-blue-500'
          },
          {
            title: 'Completadas',
            value: completedTasks,
            icon: CheckCircle2,
            color: 'text-green-500'
          },
          {
            title: 'Prioridad Alta',
            value: highPriorityTasks,
            icon: AlertTriangle,
            color: 'text-pink-500'
          }
        ].map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Button variant="primary">Nueva Tarea</Button>
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm">Filtrar</Button>
            <Button variant="secondary" size="sm">Exportar</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4">Estado</th>
                <th className="text-left py-3 px-4">Máquina</th>
                <th className="text-left py-3 px-4">Tipo</th>
                <th className="text-left py-3 px-4">Descripción</th>
                <th className="text-left py-3 px-4">Fecha</th>
                <th className="text-right py-3 px-4">Coste</th>
                <th className="text-center py-3 px-4">Prioridad</th>
                <th className="text-right py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(maintenances?.length === 0) ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-400">
                    No hay tareas de mantenimiento registradas
                  </td>
                </tr>
              ) : (
                maintenances?.map((maintenance) => (
                  <tr key={maintenance.id} className="border-b border-gray-800">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {getStatusIcon(maintenance.status)}
                        <span className="ml-2">{maintenance.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getMachineName(maintenance.machineId)}</td>
                    <td className="py-3 px-4">{maintenance.type}</td>
                    <td className="py-3 px-4">{maintenance.description}</td>
                    <td className="py-3 px-4">{formatDate(maintenance.date)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(maintenance.cost)}</td>
                    <td className="py-3 px-4">
                      <div className={`text-center ${getPriorityColor(maintenance.priority)}`}>
                        {maintenance.priority}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="secondary" size="sm" className="mr-2">
                        Editar
                      </Button>
                      <Button variant="danger" size="sm">
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </Container>
  );
}
