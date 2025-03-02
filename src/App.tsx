import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Machines } from './pages/Machines';
import { Revenue } from './pages/Revenue';
import { Expenses } from './pages/Expenses';
import { Maintenance } from './pages/Maintenance';
import { Locations } from './pages/Locations';
import { Settings } from './pages/Settings';

function App() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pl-64">
        <Routes>
          <Route path="/" element={<Navigate to="/panel" replace />} />
          <Route path="/panel" element={<Dashboard />} />
          <Route path="/clientes" element={<Clients />} />
          <Route path="/maquinas" element={<Machines />} />
          <Route path="/ingresos" element={<Revenue />} />
          <Route path="/gastos" element={<Expenses />} />
          <Route path="/mantenimiento" element={<Maintenance />} />
          <Route path="/ubicaciones" element={<Locations />} />
          <Route path="/ajustes" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
