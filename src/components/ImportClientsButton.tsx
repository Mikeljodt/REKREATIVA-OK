import React from 'react';
import { Button } from './ui/Button';
import { useStore, clientsToImport } from '../store';

export function ImportClientsButton() {
  const importClients = useStore((state) => state.importClients);
  
  const handleImport = () => {
    importClients(clientsToImport);
  };

  return (
    <Button 
      variant="secondary" 
      onClick={handleImport}
    >
      Importar Clientes de Ejemplo
    </Button>
  );
}
