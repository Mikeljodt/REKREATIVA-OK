import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useStore } from '../store';
import { formatDate } from '../utils/formatters';
import { AlertTriangle, CheckCircle2, Clock, PenTool as Tool } from 'lucide-react';
import type { MaintenanceSchedule } from '../types';

interface MaintenanceSchedulerProps {
  machineId: string;
}

export function MaintenanceScheduler({ machineId }: MaintenanceSchedulerProps) {
  const { 
    maintenanceSchedules, 
    createMaintenanceSchedule,
    updateMaintenanceStatus,
    generatePredictiveMaintenance
  } = useStore();

  const [showPredictive, setShowPredictive] = useState(false);

  const machineSchedules = maintenanceSchedules
    .filter(s => s.machineId === machineId)
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const handleGeneratePredictive = () => {
    const predictions = generatePredictiveMaintenance(machineId);
    setShowPredictive(true);
  };

  const getPriorityColor = (priority: MaintenanceSchedule['priority']) => {
    switch (priority) {
      case 'critical':
        return 'text-pink-500';
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
    }
  };

  const getStatusIcon = (status: MaintenanceSchedule['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'in-progress':
        return <Tool className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="primary" onClick={handleGeneratePredictive}>
          Generar Mantenimiento Predictivo
        </Button>
        <Button variant="secondary">
          Exportar Calendario
        </Button>
      </div>

      {showPredictive && (
        <Card className="p-6 border-2 border-yellow-500/50">
          <h3 className="text-lg font-semibold mb-4">
            Predicciones de Mantenimiento
          </h3>
          <div className="space-y-4">
            {machineSchedules
              .filter(s => s.type === 'predictive')
              .map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(schedule.status)}
                    <div>
                      <p className="font-medium">
                        Mantenimiento Predictivo
                      </p>
                      <p className="text-sm text-gray-400">
                        {schedule.notes}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${getPriorityColor(schedule.priority)}`}>
                      {schedule.priority}
                    </p>
                    <p className="text-sm text-gray-400">
                      {formatDate(schedule.scheduledDate)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Calendario de Mantenimiento
        </h3>
        <div className="space-y-4">
          {machineSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                {getStatusIcon(schedule.status)}
                <div>
                  <p className="font-medium">
                    {schedule.type === 'preventive' ? 'Mantenimiento Preventivo' :
                     schedule.type === 'corrective' ? 'Mantenimiento Correctivo' :
                     'Mantenimiento Predictivo'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {schedule.notes}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium ${getPriorityColor(schedule.priority)}`}>
                  {schedule.priority}
                </p>
                <p className="text-sm text-gray-400">
                  {formatDate(schedule.scheduledDate)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Repuestos Necesarios
        </h3>
        <div className="space-y-4">
          {machineSchedules
            .filter(s => s.status !== 'completed' && s.requiredParts.length > 0)
            .map((schedule) => (
              <div
                key={schedule.id}
                className="p-4 bg-gray-800/50 rounded-lg"
              >
                <p className="font-medium mb-2">
                  Mantenimiento del {formatDate(schedule.scheduledDate)}
                </p>
                <div className="space-y-2">
                  {schedule.requiredParts.map((part) => (
                    <div
                      key={part.partId}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">
                        {part.partId} x{part.quantity}
                      </span>
                      {part.available ? (
                        <span className="text-sm text-green-500">
                          En stock
                        </span>
                      ) : (
                        <span className="text-sm text-pink-500">
                          No disponible
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
