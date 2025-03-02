import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Modal } from '../modals/Modal';
import { DocumentPreview } from '../documents/DocumentPreview';
import { useStore } from '../../store';
import { validateCollection } from '../../utils/validation';
import { formatCurrency } from '../../utils/formatters';
import { generateCollectionPDF } from '../../utils/pdf';
import { shareDocument } from '../../utils/share';
import { AlertTriangle, Plus, Trash2, Wifi } from 'lucide-react';
import type { Collection, Machine, CollectionDocument } from '../../types';

interface MachineCollection {
  machineId: string;
  previousCounter: number;
  currentCounter: number;
  onlineFee: number;
  adjustment: number;
  clientPercentage: number;
}

interface CollectionFormProps {
  onClose: () => void;
  initialData?: Partial<Collection>;
  isEditing?: boolean;
}

export function CollectionForm({ onClose, initialData, isEditing = false }: CollectionFormProps) {
  const { machines, clients, addCollection, updateCollection, generateDocument } = useStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [newCollectionId, setNewCollectionId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    machines: [] as MachineCollection[]
  });

  const availableMachines = machines.filter(m => 
    m.clientId === formData.clientId && 
    !formData.machines.find(mc => mc.machineId === m.id)
  );

  const handleAddMachine = () => {
    setFormData(prev => ({
      ...prev,
      machines: [
        ...prev.machines,
        {
          machineId: '',
          previousCounter: 0,
          currentCounter: 0,
          onlineFee: 0,
          adjustment: 0,
          clientPercentage: 50
        }
      ]
    }));
  };

  const handleRemoveMachine = (index: number) => {
    setFormData(prev => ({
      ...prev,
      machines: prev.machines.filter((_, i) => i !== index)
    }));
  };

  const handleMachineChange = (index: number, field: keyof MachineCollection, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      machines: prev.machines.map((machine, i) => 
        i === index
          ? { ...machine, [field]: value }
          : machine
      )
    }));
  };

  const calculateMachineRevenue = (machine: MachineCollection) => {
    // Calculate base revenue from counters
    const baseRevenue = machine.currentCounter - machine.previousCounter;
    
    // Add any manual adjustments
    const adjustedRevenue = baseRevenue + (machine.adjustment || 0);
    
    // Calculate online fees if any
    const onlineFee = machine.onlineFee || 0;
    
    // Calculate revenue after deducting online fees
    const revenueAfterFees = adjustedRevenue - onlineFee;
    
    // Get client percentage (either 40% or 50%)
    const clientPercentage = machine.clientPercentage || 50;
    
    // Calculate shares
    const clientShare = revenueAfterFees * (clientPercentage / 100);
    const operatorShare = revenueAfterFees * ((100 - clientPercentage) / 100);
    
    // Add online fees to operator's share (operator always keeps online fees)
    const finalOperatorShare = operatorShare + onlineFee;

    return {
      baseRevenue,
      adjustedRevenue,
      onlineFee,
      revenueAfterFees,
      clientShare,
      operatorShare: finalOperatorShare,
      clientPercentage
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.clientId) {
      setErrors({ clientId: 'Debes seleccionar un cliente' });
      return;
    }

    if (formData.machines.length === 0) {
      setErrors({ machines: 'Debes añadir al menos una máquina' });
      return;
    }

    const machineErrors: Record<string, string> = {};
    formData.machines.forEach((machine, index) => {
      if (!machine.machineId) {
        machineErrors[`machine-${index}`] = 'Debes seleccionar una máquina';
      }
      if (machine.currentCounter <= machine.previousCounter) {
        machineErrors[`counter-${index}`] = 'El contador actual debe ser mayor que el anterior';
      }
    });

    if (Object.keys(machineErrors).length > 0) {
      setErrors(machineErrors);
      return;
    }

    try {
      const collectionIds = await Promise.all(
        formData.machines.map(machine => {
          const revenue = calculateMachineRevenue(machine);
          return addCollection({
            machineId: machine.machineId,
            date: formData.date,
            previousCounter: machine.previousCounter,
            currentCounter: machine.currentCounter,
            clientPercentage: machine.clientPercentage,
            onlineFee: machine.onlineFee,
            adjustment: machine.adjustment,
            totalRevenue: revenue.totalRevenue,
            clientShare: revenue.clientShare,
            operatorShare: revenue.operatorShare
          });
        })
      );

      if (collectionIds.length > 0) {
        setNewCollectionId(collectionIds[0]);
        setShowDocumentModal(true);
      }
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Error al crear las recaudaciones'
      });
    }
  };

  const getMachineName = (machineId: string) => {
    const machine = machines.find(m => m.id === machineId);
    return machine ? `${machine.name} - ${machine.type}` : '';
  };

  const handleGenerateDocument = async (type: 'ticket' | 'invoice') => {
    if (!newCollectionId) return;
    
    try {
      // Generate the document
      const document = generateDocument(newCollectionId, type);
      if (!document) {
        throw new Error('Error al generar el documento');
      }

      // Get collection data
      const collection = collections.find(c => c.id === newCollectionId);
      if (!collection) {
        throw new Error('Recaudación no encontrada');
      }

      // Get machine and client data
      const machine = machines.find(m => m.id === collection.machineId);
      const client = clients.find(c => c.id === collection.clientId);
      
      if (!machine || !client) {
        throw new Error('Datos de máquina o cliente no encontrados');
      }

      // Generate PDF
      const pdf = await generateCollectionPDF({
        document,
        client,
        machine
      });

      // Save PDF
      pdf.save(`${document.number}.pdf`);

      // Close document modal and show preview
      setCurrentDocument(document);
      setShowDocumentModal(false);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating document:', error);
      // You might want to show this error to the user
    }
  };

  const handleShareDocument = async (method: 'email' | 'whatsapp' | 'telegram') => {
    if (!currentDocument) return;

    try {
      await shareDocument(currentDocument, method);
      // Log successful share
      logDocumentShare(currentDocument.number, method);
    } catch (error) {
      console.error('Error sharing document:', error);
    }
  };

  const handleDownloadDocument = async () => {
    if (!currentDocument || !newCollectionId) return;
    
    try {
      const collection = collections.find(c => c.id === newCollectionId);
      if (!collection) return;

      const machine = machines.find(m => m.id === collection.machineId);
      const client = clients.find(c => c.id === collection.clientId);
      
      if (!machine || !client) return;

      const pdf = await generateCollectionPDF({
        document: currentDocument,
        client,
        machine
      });

      pdf.save(`${currentDocument.number}.pdf`);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400">
            Cliente
          </label>
          <select
            value={formData.clientId}
            onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
            className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          >
            <option value="">Selecciona un cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.establishmentName}
              </option>
            ))}
          </select>
          {errors.clientId && (
            <p className="mt-1 text-sm text-pink-500">{errors.clientId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">
            Fecha de Recaudación
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          />
        </div>

        <div className="border-t border-gray-800 pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Máquinas</h3>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddMachine}
              disabled={!formData.clientId || availableMachines.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir Máquina
            </Button>
          </div>

          {formData.machines.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No hay máquinas añadidas
            </div>
          ) : (
            <div className="space-y-4">
              {formData.machines.map((machine, index) => {
                const selectedMachine = machines.find(m => m.id === machine.machineId);
                const revenue = machine.machineId ? calculateMachineRevenue(machine) : null;
                
                return (
                  <div key={index} className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">Máquina {index + 1}</h4>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRemoveMachine(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400">
                          Seleccionar Máquina
                        </label>
                        <select
                          value={machine.machineId}
                          onChange={(e) => handleMachineChange(index, 'machineId', e.target.value)}
                          className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
                        >
                          <option value="">Selecciona una máquina</option>
                          {availableMachines.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} - {m.type}
                            </option>
                          ))}
                          {machine.machineId && !availableMachines.find(m => m.id === machine.machineId) && (
                            <option value={machine.machineId}>
                              {getMachineName(machine.machineId)}
                            </option>
                          )}
                        </select>
                        {errors[`machine-${index}`] && (
                          <p className="mt-1 text-sm text-pink-500">{errors[`machine-${index}`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400">
                          Contador Anterior
                        </label>
                        <input
                          type="number"
                          value={machine.previousCounter}
                          onChange={(e) => handleMachineChange(index, 'previousCounter', Number(e.target.value))}
                          min="0"
                          className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400">
                          Contador Actual
                        </label>
                        <input
                          type="number"
                          value={machine.currentCounter}
                          onChange={(e) => handleMachineChange(index, 'currentCounter', Number(e.target.value))}
                          min="0"
                          className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
                        />
                        {errors[`counter-${index}`] && (
                          <p className="mt-1 text-sm text-pink-500">{errors[`counter-${index}`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400">
                          <div className="flex items-center">
                            <Wifi className="h-4 w-4 mr-1" />
                            Tarifa Online
                          </div>
                        </label>
                        <input
                          type="number"
                          value={machine.onlineFee}
                          onChange={(e) => handleMachineChange(index, 'onlineFee', Number(e.target.value))}
                          min="0"
                          step="0.01"
                          className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400">
                          Ajuste Manual
                        </label>
                        <input
                          type="number"
                          value={machine.adjustment}
                          onChange={(e) => handleMachineChange(index, 'adjustment', Number(e.target.value))}
                          className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400">
                          Porcentaje Cliente
                        </label>
                        <select
                          value={machine.clientPercentage}
                          onChange={(e) => handleMachineChange(index, 'clientPercentage', Number(e.target.value))}
                          className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
                        >
                          <option value={50}>50% Cliente / 50% Operador</option>
                          <option value={40}>40% Cliente / 60% Operador</option>
                        </select>
                      </div>
                    </div>

                    {revenue && (
                      <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
                        <h5 className="font-medium mb-2">Resumen de la Recaudación</h5>
                        <div className="space-y-4">
                          {/* Base Revenue */}
                          <div className="grid grid-cols-2 gap-4 text-sm border-b border-gray-800 pb-2">
                            <div>
                              <span className="block text-gray-400">Total Partidas</span>
                              <span className="block">{machine.currentCounter - machine.previousCounter}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400">Recaudación Base</span>
                              <span className="block">{formatCurrency(revenue.baseRevenue)}</span>
                            </div>
                          </div>

                          {/* Adjustments */}
                          {(machine.adjustment !== 0 || machine.onlineFee > 0) && (
                            <div className="grid grid-cols-2 gap-4 text-sm border-b border-gray-800 pb-2">
                              {machine.adjustment !== 0 && (
                                <div>
                                  <span className="block text-gray-400">Ajuste Manual</span>
                                  <span className={machine.adjustment > 0 ? 'text-green-500' : 'text-pink-500'}>
                                    {machine.adjustment > 0 ? '+' : ''}{formatCurrency(machine.adjustment)}
                                  </span>
                                </div>
                              )}
                              {machine.onlineFee > 0 && (
                                <div>
                                  <div className="flex items-center text-gray-400">
                                    <Wifi className="h-4 w-4 mr-1" />
                                    <span>Tarifa Online</span>
                                  </div>
                                  <span className="block text-yellow-500">-{formatCurrency(revenue.onlineFee)}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Final Distribution */}
                          <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                            <div>
                              <span className="block text-gray-400">Parte Cliente ({revenue.clientPercentage}%)</span>
                              <span className="block text-lg font-medium">{formatCurrency(revenue.clientShare)}</span>
                              <span className="block text-xs text-gray-500">
                                {revenue.clientPercentage}% de {formatCurrency(revenue.revenueAfterFees)}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400">Parte Operador</span>
                              <span className="block text-lg font-medium">{formatCurrency(revenue.operatorShare)}</span>
                              <span className="block text-xs text-gray-500">
                                {100 - revenue.clientPercentage}% de {formatCurrency(revenue.revenueAfterFees)}
                                {revenue.onlineFee > 0 && (
                                  <> + {formatCurrency(revenue.onlineFee)} (tarifa online)</>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {errors.submit && (
        <div className="p-4 bg-pink-500/10 border border-pink-500 rounded-lg">
          <p className="text-pink-500">{errors.submit}</p>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          variant="primary"
          disabled={!formData.clientId || formData.machines.length === 0}
        >
          {isEditing ? 'Actualizar' : 'Registrar'} Recaudación
        </Button>
      </div>

      <Modal
        isOpen={showDocumentModal}
        onClose={() => {
          setShowDocumentModal(false);
          onClose();
        }}
        title="Generar Documentos"
      >
        <div className="space-y-6">
          <p className="text-gray-300">
            Se han registrado {formData.machines.length} recaudaciones. ¿Qué tipo de documento deseas generar?
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleGenerateDocument('ticket')}
              className="p-6 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-500/10 transition-colors"
            >
              <h3 className="text-lg font-semibold mb-2">Ticket Simple</h3>
              <p className="text-sm text-gray-400">
                Documento básico con el desglose de la recaudación
              </p>
            </button>

            <button
              onClick={() => handleGenerateDocument('invoice')}
              className="p-6 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-500/10 transition-colors"
            >
              <h3 className="text-lg font-semibold mb-2">Factura con IVA</h3>
              <p className="text-sm text-gray-400">
                Factura oficial con IVA del 21% y todos los detalles fiscales
              </p>
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Vista Previa del Documento"
      >
        {currentDocument && (
          <DocumentPreview
            document={currentDocument}
            onClose={() => setShowPreview(false)}
            onShare={handleShareDocument}
            onDownload={handleDownloadDocument}
          />
        )}
      </Modal>
    </form>
  );
}
