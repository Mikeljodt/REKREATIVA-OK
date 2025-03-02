import React, { useState } from 'react';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/modals/Modal';
import { ExpenseForm } from '../components/forms/ExpenseForm';
import { VehicleForm } from '../components/forms/VehicleForm';
import { VehicleExpenseForm } from '../components/VehicleExpenseForm';
import { useStore } from '../store';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  AlertTriangle, 
  Car, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Receipt, 
  Settings,
  Trash2 
} from 'lucide-react';
import type { Expense, Vehicle, VehicleExpense } from '../types';

export function Expenses() {
  const { 
    expenses, 
    expenseCategories, 
    deleteExpense,
    vehicles,
    vehicleExpenses,
    maintenanceAlerts
  } = useStore();
  
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isVehicleExpenseModalOpen, setIsVehicleExpenseModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Ensure maintenanceAlerts is an array before filtering
  const pendingAlerts = (maintenanceAlerts || []).filter(alert => 
    alert.status === 'pending' || alert.status === 'overdue'
  ).length;

  // Ensure vehicleExpenses is an array before filtering
  const totalFuelExpenses = (vehicleExpenses || [])
    .filter(e => e.type === 'fuel')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalMaintenanceExpenses = (vehicleExpenses || [])
    .filter(e => e.type === 'maintenance')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <Container className="py-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-glow text-blue-500">Gastos</h2>
        <p className="text-gray-400 mt-2">
          Gestiona los gastos y costes de la empresa
        </p>
      </header>

      {/* Sección de Vehículos */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold flex items-center">
            <Car className="h-5 w-5 mr-2" />
            Vehículos
          </h3>
          <div className="flex space-x-4">
            <Button
              variant="secondary"
              onClick={() => setIsVehicleModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir Vehículo
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Gastos en Combustible</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(totalFuelExpenses)}
                </p>
              </div>
              <Receipt className="h-5 w-5 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Gastos en Mantenimiento</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(totalMaintenanceExpenses)}
                </p>
              </div>
              <Settings className="h-5 w-5 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Alertas Pendientes</p>
                <p className="text-2xl font-bold mt-1">{pendingAlerts}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            {vehicles?.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay vehículos registrados</p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={() => setIsVehicleModalOpen(true)}
                >
                  Añadir Vehículo
                </Button>
              </div>
            ) : (
              vehicles?.map((vehicle) => {
                const alerts = (maintenanceAlerts || []).filter(
                  alert => alert.vehicleId === vehicle.id && 
                  (alert.status === 'pending' || alert.status === 'overdue')
                );
                
                return (
                  <div 
                    key={vehicle.id}
                    className="bg-gray-800/50 rounded-lg p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-medium">
                          {vehicle.brand} {vehicle.model}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {vehicle.plate} • {vehicle.currentKm?.toLocaleString()} km
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setIsVehicleExpenseModalOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Añadir Gasto
                        </Button>
                      </div>
                    </div>

                    {alerts.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <h5 className="text-sm font-medium text-gray-300">
                          Mantenimientos Pendientes
                        </h5>
                        {alerts.map((alert) => (
                          <div
                            key={alert.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              alert.status === 'overdue' 
                                ? 'bg-pink-500/10 border border-pink-500'
                                : 'bg-yellow-500/10 border border-yellow-500'
                            }`}
                          >
                            <div className="flex items-center">
                              {alert.status === 'overdue' ? (
                                <AlertTriangle className="h-4 w-4 text-pink-500 mr-2" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                              )}
                              <div>
                                <p className={`text-sm ${
                                  alert.status === 'overdue' 
                                    ? 'text-pink-500'
                                    : 'text-yellow-500'
                                }`}>
                                  {alert.type === 'oil' && 'Cambio de Aceite'}
                                  {alert.type === 'filters' && 'Cambio de Filtros'}
                                  {alert.type === 'brakes' && 'Revisión de Frenos'}
                                  {alert.type === 'tires' && 'Cambio de Neumáticos'}
                                  {alert.type === 'general' && 'Revisión General'}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {alert.status === 'overdue' 
                                    ? 'Vencido'
                                    : `Próximo: ${formatDate(alert.dueDate)}`}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-400">
                              {alert.dueKm?.toLocaleString()} km
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <h5 className="text-sm font-medium text-gray-300 mb-2">
                        Últimos Gastos
                      </h5>
                      <div className="space-y-2">
                        {(vehicleExpenses || [])
                          .filter(e => e.vehicleId === vehicle.id)
                          .slice(0, 3)
                          .map((expense) => (
                            <div
                              key={expense.id}
                              className="flex items-center justify-between p-2 bg-gray-900/50 rounded-lg"
                            >
                              <div>
                                <p className="text-sm">{expense.description}</p>
                                <p className="text-xs text-gray-400">
                                  {formatDate(expense.date)}
                                </p>
                              </div>
                              <p className="font-medium">
                                {formatCurrency(expense.amount)}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Mantener el resto del código existente de Expenses */}

      <Modal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        title="Añadir Vehículo"
      >
        <VehicleForm onClose={() => setIsVehicleModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={isVehicleExpenseModalOpen && selectedVehicle !== null}
        onClose={() => {
          setIsVehicleExpenseModalOpen(false);
          setSelectedVehicle(null);
        }}
        title={`Añadir Gasto - ${selectedVehicle?.brand} ${selectedVehicle?.model}`}
      >
        <VehicleExpenseForm
          vehicleId={selectedVehicle?.id || ''}
          onClose={() => {
            setIsVehicleExpenseModalOpen(false);
            setSelectedVehicle(null);
          }}
        />
      </Modal>
    </Container>
  );
}
