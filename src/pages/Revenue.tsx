import React, { useState } from 'react';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/modals/Modal';
import { CollectionForm } from '../components/forms/CollectionForm';
import { ImportExportButtons } from '../components/ImportExportButtons';
import { useStore } from '../store';
import { formatCurrency, formatDate } from '../utils/formatters';
import { generateCollectionPDF } from '../utils/pdf';
import { FileText, Receipt, Trash2 } from 'lucide-react';
import type { Collection } from '../types';

export function Revenue() {
  const { collections, machines, clients, generateDocument, deleteAllCollections } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  const handleOpenModal = () => {
    setEditingCollection(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCollection(null);
  };

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection);
    setIsModalOpen(true);
  };

  const handleDeleteSelected = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    // If all collections are selected, use deleteAllCollections
    if (selectedCollections.length === (collections?.length || 0)) {
      deleteAllCollections();
    } else {
      // Otherwise delete only selected collections
      selectedCollections.forEach(id => {
        const collection = collections?.find(c => c.id === id);
        if (collection) {
          deleteCollection(id);
        }
      });
    }
    setSelectedCollections([]);
    setShowDeleteConfirmation(false);
  };

  const handleSelectCollection = (id: string) => {
    setSelectedCollections(prev =>
      prev.includes(id)
        ? prev.filter(collectionId => collectionId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedCollections(
      selectedCollections.length === (collections?.length || 0) && (collections?.length || 0) > 0
        ? []
        : (collections || []).map(c => c.id)
    );
  };

  const handleGenerateDocument = async (collectionId: string, type: 'ticket' | 'invoice') => {
    try {
      setError(null);

      // Get collection data
      const collection = collections?.find(c => c.id === collectionId);
      if (!collection) {
        throw new Error('Recaudación no encontrada');
      }

      // Get machine and client data
      const machine = machines?.find(m => m.id === collection.machineId);
      const client = clients.find(c => c.id === collection.clientId);

      if (!machine || !client) {
        throw new Error('Datos de máquina o cliente no encontrados');
      }

      // Generate document
      const document = generateDocument(collectionId, type);
      if (!document) {
        throw new Error('Error al generar el documento');
      }

      // Generate PDF
      const pdf = await generateCollectionPDF({
        document,
        client,
        machine
      });

      // Save PDF
      pdf.save(`${document.number}.pdf`);

    } catch (error) {
      console.error('Error generating document:', error);
      setError(error instanceof Error ? error.message : 'Error al generar el documento');
    }
  };

  return (
    <Container className="py-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-glow text-blue-500">Gestión de Recaudaciones</h2>
        <p className="text-gray-400 mt-2">Gestiona las recaudaciones y el reparto de ingresos.</p>
      </header>

      {error && (
        <div className="mb-4 p-4 bg-pink-500/10 border border-pink-500 rounded-lg">
          <p className="text-pink-500">{error}</p>
        </div>
      )}

      <Card className="p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="primary"
              onClick={handleOpenModal}
            >
              Nueva Recaudación
            </Button>

            {selectedCollections.length > 0 && (
              <Button
                variant="danger"
                onClick={handleDeleteSelected}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Seleccionadas ({selectedCollections.length})
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <ImportExportButtons type="collections" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedCollections.length === (collections?.length || 0) && (collections?.length || 0) > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-700 text-blue-600 focus:ring-blue-500 bg-gray-800/50"
                  />
                </th>
                <th className="text-left py-3 px-4">Fecha</th>
                <th className="text-left py-3 px-4">Máquina</th>
                <th className="text-left py-3 px-4">Cliente</th>
                <th className="text-right py-3 px-4">Contador Anterior</th>
                <th className="text-right py-3 px-4">Contador Actual</th>
                <th className="text-right py-3 px-4">Ingresos</th>
                <th className="text-right py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(collections?.length || 0) === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-400">
                    No hay recaudaciones registradas
                  </td>
                </tr>
              ) : (
                collections?.map((collection) => {
                  const machine = machines?.find(m => m.id === collection.machineId);
                  const client = clients.find(c => c.id === collection.clientId);
                  return (
                    <tr
                      key={collection.id}
                      className={`border-b border-gray-800 transition-colors ${
                        selectedCollections.includes(collection.id) ? 'bg-blue-500/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedCollections.includes(collection.id)}
                          onChange={() => handleSelectCollection(collection.id)}
                          className="rounded border-gray-700 text-blue-600 focus:ring-blue-500 bg-gray-800/50"
                        />
                      </td>
                      <td className="py-3 px-4">{formatDate(collection.date)}</td>
                      <td className="py-3 px-4">{machine?.name || 'N/A'}</td>
                      <td className="py-3 px-4">{client?.establishmentName || 'N/A'}</td>
                      <td className="py-3 px-4 text-right">{collection.previousCounter}</td>
                      <td className="py-3 px-4 text-right">{collection.currentCounter}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(collection.totalRevenue)}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="mr-2"
                          onClick={() => handleEdit(collection)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="mr-2"
                          onClick={() => handleGenerateDocument(collection.id, 'ticket')}
                          disabled={!collection.clientId}
                        >
                          <Receipt className="h-4 w-4 mr-2" />
                          Ticket
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleGenerateDocument(collection.id, 'invoice')}
                          disabled={!collection.clientId}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Factura
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCollection ? "Editar Recaudación" : "Nueva Recaudación"}
      >
        <CollectionForm
          onClose={handleCloseModal}
          initialData={editingCollection}
          isEditing={!!editingCollection}
        />
      </Modal>

      <Modal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        title="Confirmar Eliminación"
      >
        <div className="space-y-4">
          <div className="p-4 bg-pink-500/10 border border-pink-500 rounded-lg">
            <p className="text-pink-500">
              ¿Estás seguro de que deseas eliminar {selectedCollections.length === (collections?.length || 0)
                ? 'todas las recaudaciones'
                : `las ${selectedCollections.length} recaudaciones seleccionadas`}?
              Esta acción no se puede deshacer.
            </p>
          </div>

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
