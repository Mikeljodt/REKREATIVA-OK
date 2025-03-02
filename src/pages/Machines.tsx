import React, { useState } from 'react';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/modals/Modal';
import { MachineForm } from '../components/forms/MachineForm';
import { InstallationForm } from '../components/forms/InstallationForm';
import { ImportExportButtons } from '../components/ImportExportButtons';
import { useStore } from '../store';
import { Gamepad2, PenTool as Tool, QrCode, ArrowRightLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export function Machines() {
  const { machines, clients } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [transferMachine, setTransferMachine] = useState(null);

  const handleOpenModal = () => {
    setEditingMachine(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMachine(null);
  };

  const handleEdit = (machine) => {
    setEditingMachine(machine);
    setIsModalOpen(true);
  };

  const handleShowQR = (machine) => {
    setSelectedMachine(machine);
    setShowQRModal(true);
  };

  const handleTransfer = (machine) => {
    setTransferMachine(machine);
    setIsTransferModalOpen(true);
  };

  const getClientName = (clientId) => {
    if (!clientId) return 'Sin asignar';
    const client = clients.find(c => c.id === clientId);
    return client ? client.establishmentName : 'Cliente no encontrado';
  };

  return (
    <Container className="py-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-glow text-blue-500">Máquinas</h2>
        <p className="text-gray-400 mt-2">Gestiona tus máquinas arcade y su ubicación.</p>
      </header>

      <Card className="p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <Button
              variant="primary"
              onClick={handleOpenModal}
            >
              <Gamepad2 className="h-4 w-4 mr-2" />
              Añadir Máquina
            </Button>

            <Button
              variant="secondary"
              onClick={() => setIsInstallModalOpen(true)}
            >
              <Tool className="h-4 w-4 mr-2" />
              Instalar Máquina
            </Button>
          </div>
          <ImportExportButtons type="machines" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4">Código</th>
                <th className="text-left py-3 px-4">Tipo</th>
                <th className="text-left py-3 px-4">Modelo</th>
                <th className="text-left py-3 px-4">Cliente Asignado</th>
                <th className="text-left py-3 px-4">Estado</th>
                <th className="text-right py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {machines && machines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-400">
                    No hay máquinas registradas
                  </td>
                </tr>
              ) : (
                machines && machines.map((machine) => (
                  <tr key={machine.id} className="border-b border-gray-800">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono">{machine.code}</span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleShowQR(machine)}
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="py-3 px-4">{machine.type}</td>
                    <td className="py-3 px-4">{machine.model}</td>
                    <td className="py-3 px-4">
                      <span className={`${
                        machine.clientId ? 'text-green-500' : 'text-gray-400'
                      }`}>
                        {getClientName(machine.clientId)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        machine.status === 'active'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        {machine.status === 'active' ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(machine)}
                      >
                        Editar
                      </Button>
                      {machine.clientId ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="ml-2"
                          onClick={() => handleTransfer(machine)}
                        >
                          <ArrowRightLeft className="h-4 w-4 mr-2" />
                          Trasladar
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          className="ml-2"
                          onClick={() => setIsInstallModalOpen(true)}
                        >
                          Instalar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingMachine ? "Editar Máquina" : "Añadir Máquina"}
      >
        <MachineForm
          onClose={handleCloseModal}
          initialData={editingMachine}
          isEditing={!!editingMachine}
        />
      </Modal>

      <Modal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        title="Instalar Máquina"
      >
        <InstallationForm
          onClose={() => setIsInstallModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Trasladar Máquina"
      >
        <InstallationForm
          onClose={() => setIsTransferModalOpen(false)}
          initialData={{
            machineId: transferMachine?.id,
            clientId: transferMachine?.clientId
          }}
          isTransfer={true}
        />
      </Modal>

      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="Código QR de la Máquina"
      >
        {selectedMachine && (
          <div className="text-center space-y-4">
            <div className="bg-white p-4 rounded-lg inline-block">
              <QRCodeSVG
                value={selectedMachine.qrCode}
                size={200}
                level="H"
                includeMargin
              />
            </div>
            <div>
              <p className="font-medium">Código: {selectedMachine.code}</p>
              <p className="text-sm text-gray-400">
                {selectedMachine.model} - {selectedMachine.type}
              </p>
            </div>
            <p className="text-sm text-gray-400">
              Escanea este código QR para acceder directamente al formulario de recaudación
            </p>
          </div>
        )}
      </Modal>
    </Container>
  );
}
