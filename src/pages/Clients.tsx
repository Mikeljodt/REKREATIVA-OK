import React, { useState } from 'react';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/modals/Modal';
import { ClientForm } from '../components/forms/ClientForm';
import { ImportExportButtons } from '../components/ImportExportButtons';
import { useStore } from '../store';
import { Trash2, UserPlus } from 'lucide-react';
import type { Client } from '../types';

export function Clients() {
  const { clients, deleteMultipleClients } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const handleOpenModal = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleSelectClient = (clientId: string) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectAll = () => {
    setSelectedClients(
      selectedClients.length === clients.length
        ? []
        : clients.map(client => client.id)
    );
  };

  const handleDeleteSelected = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    deleteMultipleClients(selectedClients);
    setSelectedClients([]);
    setShowDeleteConfirmation(false);
  };

  return (
    <Container className="py-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-glow text-blue-500">Clientes</h2>
        <p className="text-gray-400 mt-2">Gestiona tus clientes y sus máquinas asociadas.</p>
      </header>

      <Card className="p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="primary"
              onClick={handleOpenModal}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Añadir Cliente
            </Button>
            {selectedClients.length > 0 && (
              <Button
                variant="danger"
                onClick={handleDeleteSelected}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Seleccionados ({selectedClients.length})
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <ImportExportButtons type="clients" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedClients.length === clients.length && clients.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-700 text-blue-600 focus:ring-blue-500 bg-gray-800/50"
                  />
                </th>
                <th className="text-left py-3 px-4">Código</th>
                <th className="text-left py-3 px-4">Nombre Comercial</th>
                <th className="text-left py-3 px-4">Propietario</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Teléfono</th>
                <th className="text-left py-3 px-4">Dirección</th>
                <th className="text-right py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-400">
                    No hay clientes registrados
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr
                    key={client.id}
                    className={`border-b border-gray-800 transition-colors ${
                      selectedClients.includes(client.id) ? 'bg-blue-500/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(client.id)}
                        onChange={() => handleSelectClient(client.id)}
                        className="rounded border-gray-700 text-blue-600 focus:ring-blue-500 bg-gray-800/50"
                      />
                    </td>
                    <td className="py-3 px-4">{client.clientCode}</td>
                    <td className="py-3 px-4">{client.establishmentName}</td>
                    <td className="py-3 px-4">{`${client.ownerFirstName} ${client.ownerLastName}`}</td>
                    <td className="py-3 px-4">{client.email}</td>
                    <td className="py-3 px-4">{client.phone}</td>
                    <td className="py-3 px-4">
                      {client.formattedAddress ?
                        `${client.formattedAddress.street}, ${client.formattedAddress.number}, ${client.formattedAddress.city}` :
                        client.fullAddress
                      }
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(client)}
                      >
                        Editar
                      </Button>
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
        title={editingClient ? "Editar Cliente" : "Añadir Cliente"}
      >
        <ClientForm
          onClose={handleCloseModal}
          initialData={editingClient}
          isEditing={!!editingClient}
        />
      </Modal>

      <Modal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        title="Confirmar Eliminación"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            ¿Estás seguro de que deseas eliminar los {selectedClients.length} clientes seleccionados?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end space-x-4">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirmation(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </Container>
  );
}
