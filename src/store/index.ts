import { create } from 'zustand';
import { Client, Machine, MaintenanceAlert } from '../types';

interface StoreState {
  clients: Client[];
  machines: Machine[];
  maintenanceAlerts: MaintenanceAlert[];
  addClient: (client: Omit<Client, 'id' | 'clientCode' | 'createdAt' | 'updatedAt'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  deleteMultipleClients: (ids: string[]) => void;
  initializeClients: (clients: Client[]) => void;
  addMachine: (machine: Omit<Machine, 'id' | 'locationHistory' | 'maintenanceHistory' | 'collectionHistory'>) => void;
  updateMachine: (id: string, machine: Partial<Machine>) => void;
  deleteMachine: (id: string) => void;
  deleteMultipleMachines: (ids: string[]) => void;
  initializeMachines: (machines: Machine[]) => void;
  addMaintenanceAlert: (alert: MaintenanceAlert) => void;
  updateMaintenanceAlert: (id: string, alert: Partial<MaintenanceAlert>) => void;
  deleteMaintenanceAlert: (id: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  clients: [],
  machines: [],
  maintenanceAlerts: [],
  addClient: (client) => set((state) => ({
    clients: [...state.clients, { ...client, id: Date.now().toString(), clientCode: `CLIENT-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() }],
  })),
  updateClient: (id, client) => set((state) => ({
    clients: state.clients.map((c) => (c.id === id ? { ...c, ...client, updatedAt: new Date() } : c)),
  })),
  deleteClient: (id) => set((state) => ({
    clients: state.clients.filter((c) => c.id !== id),
  })),
  deleteMultipleClients: (ids) => set((state) => ({
    clients: state.clients.filter((c) => !ids.includes(c.id)),
  })),
  initializeClients: (clients) => set(() => ({
    clients,
  })),
  addMachine: (machine) => set((state) => ({
    machines: [...state.machines, { ...machine, id: Date.now().toString(), locationHistory: [], maintenanceHistory: [], collectionHistory: [] }],
  })),
  updateMachine: (id, machine) => set((state) => ({
    machines: state.machines.map((m) => (m.id === id ? { ...m, ...machine, updatedAt: new Date() } : m)),
  })),
  deleteMachine: (id) => set((state) => ({
    machines: state.machines.filter((m) => m.id !== id),
  })),
  deleteMultipleMachines: (ids) => set((state) => ({
    machines: state.machines.filter((m) => !ids.includes(m.id)),
  })),
  initializeMachines: (machines) => set(() => ({
    machines,
  })),
  addMaintenanceAlert: (alert) => set((state) => ({
    maintenanceAlerts: [...state.maintenanceAlerts, { ...alert, id: Date.now().toString() }],
  })),
  updateMaintenanceAlert: (id, alert) => set((state) => ({
    maintenanceAlerts: state.maintenanceAlerts.map((a) => (a.id === id ? { ...a, ...alert } : a)),
  })),
  deleteMaintenanceAlert: (id) => set((state) => ({
    maintenanceAlerts: state.maintenanceAlerts.filter((a) => a.id !== id),
  })),
}));

const clients: Client[] = [
  {
    id: '1',
    clientCode: 'CLIENT-1',
    establishmentName: 'Client 1',
    ownerFirstName: 'John',
    ownerLastName: 'Doe',
    ownerFiscalAddress: '123 Main St, Springfield, IL, 62701',
    documentType: 'nif',
    documentNumber: '12345678A',
    documentCountry: 'España',
    fullAddress: '123 Main St, Springfield, IL, 62701',
    coordinates: { latitude: 39.7817, longitude: -89.6501 },
    formattedAddress: {
      street: '123 Main St',
      number: '',
      postalCode: '62701',
      city: 'Springfield',
      province: 'IL',
      country: 'USA'
    },
    phone: '+34123456789',
    email: 'john.doe@example.com',
    businessHours: {
      standardHours: { open: '09:00', close: '20:00' },
      closedDay: null,
      closedDayReason: 'Descanso semanal'
    },
    contractSigned: false
  },
  {
    id: '2',
    clientCode: 'CLIENT-2',
    establishmentName: 'Client 2',
    ownerFirstName: 'Jane',
    ownerLastName: 'Smith',
    ownerFiscalAddress: '456 Elm St, Metropolis, NY, 10001',
    documentType: 'cif',
    documentNumber: '87654321B',
    documentCountry: 'España',
    fullAddress: '456 Elm St, Metropolis, NY, 10001',
    coordinates: { latitude: 40.7128, longitude: -74.0060 },
    formattedAddress: {
      street: '456 Elm St',
      number: '',
      postalCode: '10001',
      city: 'Metropolis',
      province: 'NY',
      country: 'USA'
    },
    phone: '+34987654321',
    email: 'jane.smith@example.com',
    businessHours: {
      standardHours: { open: '10:00', close: '21:00' },
      closedDay: 'sunday',
      closedDayReason: 'Descanso semanal'
    },
    contractSigned: true
  },
  {
    id: '3',
    clientCode: 'CLIENT-3',
    establishmentName: 'Client 3',
    ownerFirstName: 'Alice',
    ownerLastName: 'Johnson',
    ownerFiscalAddress: '789 Oak St, Gotham, CA, 90210',
    documentType: 'nie',
    documentNumber: '55555555C',
    documentCountry: 'España',
    fullAddress: '789 Oak St, Gotham, CA, 90210',
    coordinates: { latitude: 34.0522, longitude: -118.2437 },
    formattedAddress: {
      street: '789 Oak St',
      number: '',
      postalCode: '90210',
      city: 'Gotham',
      province: 'CA',
      country: 'USA'
    },
    phone: '+34555555555',
    email: 'alice.johnson@example.com',
    businessHours: {
      standardHours: { open: '08:00', close: '19:00' },
      closedDay: 'saturday',
      closedDayReason: 'Descanso semanal'
    },
    contractSigned: false
  },
  {
    id: '4',
    clientCode: 'CLIENT-4',
    establishmentName: 'Client 4',
    ownerFirstName: 'Bob',
    ownerLastName: 'Brown',
    ownerFiscalAddress: '101 Pine St, Smallville, KS, 67101',
    documentType: 'passport',
    documentNumber: '123456789',
    documentCountry: 'España',
    fullAddress: '101 Pine St, Smallville, KS, 67101',
    coordinates: { latitude: 37.6892, longitude: -97.3364 },
    formattedAddress: {
      street: '101 Pine St',
      number: '',
      postalCode: '67101',
      city: 'Smallville',
      province: 'KS',
      country: 'USA'
    },
    phone: '+34111111111',
    email: 'bob.brown@example.com',
    businessHours: {
      standardHours: { open: '09:00', close: '20:00' },
      closedDay: null,
      closedDayReason: 'Descanso semanal'
    },
    contractSigned: true
  },
  {
    id: '5',
    clientCode: 'CLIENT-5',
    establishmentName: 'Client 5',
    ownerFirstName: 'Charlie',
    ownerLastName: 'Davis',
    ownerFiscalAddress: '222 Cedar St, Central City, OR, 97301',
    documentType: 'other',
    documentNumber: '987654321',
    documentCountry: 'España',
    fullAddress: '222 Cedar St, Central City, OR, 97301',
    coordinates: { latitude: 44.0521, longitude: -123.0868 },
    formattedAddress: {
      street: '222 Cedar St',
      number: '',
      postalCode: '97301',
      city: 'Central City',
      province: 'OR',
      country: 'USA'
    },
    phone: '+34222222222',
    email: 'charlie.davis@example.com',
    businessHours: {
      standardHours: { open: '10:00', close: '21:00' },
      closedDay: 'sunday',
      closedDayReason: 'Descanso semanal'
    },
    contractSigned: false
  },
  {
    id: '6',
    clientCode: 'CLIENT-6',
    establishmentName: 'Client 6',
    ownerFirstName: 'David',
    ownerLastName: 'Evans',
    ownerFiscalAddress: '333 Maple St, Metropolis, NY, 10001',
    documentType: 'nif',
    documentNumber: '11111111A',
    documentCountry: 'España',
    fullAddress: '333 Maple St, Metropolis, NY, 10001',
    coordinates: { latitude: 40.7128, longitude: -74.0060 },
    formattedAddress: {
      street: '333 Maple St',
      number: '',
      postalCode: '10001',
      city: 'Metropolis',
      province: 'NY',
      country: 'USA'
    },
    phone: '+34333333333',
    email: 'david.evans@example.com',
    businessHours: {
      standardHours: { open: '08:00', close: '19:00' },
      closedDay: 'saturday',
      closedDayReason: 'Descanso semanal'
    },
    contractSigned: true
  },
  {
    id: '7',
    clientCode: 'CLIENT-7',
    establishmentName: 'Client 7',
    ownerFirstName: 'Eve',
    ownerLastName: 'Foster',
    ownerFiscalAddress: '444 Birch St, Gotham, CA, 90210',
    documentType: 'cif',
    documentNumber: '22222222B',
    documentCountry: 'España',
    fullAddress: '444 Birch St, Gotham, CA, 90210',
    coordinates: { latitude: 34.0522, longitude: -118.2437 },
    formattedAddress: {
      street: '444 Birch St',
      number: '',
      postalCode: '90210',
      city: 'Gotham',
      province: 'CA',
      country: 'USA'
    },
    phone: '+34444444444',
    email: 'eve.foster@example.com',
    businessHours: {
      standardHours: { open: '09:00', close: '20:00' },
      closedDay: null,
      closedDayReason: 'Descanso semanal'
    },
    contractSigned: false
  },
  {
    id: '8',
    clientCode: 'CLIENT-8',
    establishmentName: 'Client 8',
    ownerFirstName: 'Frank',
    ownerLastName: 'Gates',
    ownerFiscalAddress: '555 Cedar St, Smallville, KS, 67101',
    documentType: 'nie',
    documentNumber: '33333333C',
    documentCountry: 'España',
    fullAddress: '555 Cedar St, Smallville, KS, 67101',
    coordinates: { latitude: 37.6892, longitude: -97.3364 },
    formattedAddress: {
      street: '555 Cedar St',
      number: '',
      postalCode: '67101',
      city: 'Smallville',
      province: 'KS',
      country: 'USA'
    },
    phone: '+34555555555',
    email: 'frank.gates@example.com',
    businessHours: {
      standardHours: { open: '10:00', close: '21:00' },
      closedDay: 'sunday',
      closedDayReason: 'Descanso semanal'
    },
    contractSigned: true
  },
  {
    id: '9',
    clientCode: 'CLIENT-9',
    establishmentName: 'Client 9',
    ownerFirstName: 'Grace',
    ownerLastName: 'Hill',
    ownerFiscalAddress: '666 Pine St, Central City, OR, 97301',
    documentType: 'passport',
    documentNumber: '444444444',
    documentCountry: 'España',
    fullAddress: '666 Pine St, Central City, OR, 97301',
    coordinates: { latitude: 44.0521, longitude: -123.0868 },
    formattedAddress: {
      street: '666 Pine St',
      number: '',
      postalCode: '97301',
      city: 'Central City',
      province: 'OR',
      country: 'USA'
    },
    phone: '+34666666666',
    email: 'grace.hill@example.com',
    businessHours: {
      standardHours: { open: '08:00', close: '19:00' },
      closedDay: 'saturday',
      closedDayReason: 'Descanso semanal'
    },
    contractSigned: false
  },
  {
    id: '10',
    clientCode: 'CLIENT-10',
    establishmentName: 'Client 10',
    ownerFirstName: 'Hannah',
    ownerLastName: 'Ivy',
    ownerFiscalAddress: '777 Oak St, Metropolis, NY, 10001',
    documentType: 'other',
    documentNumber: '555555555',
    documentCountry: 'España',
    fullAddress: '777 Oak St, Metropolis, NY, 10001',
    coordinates: { latitude: 40.7128, longitude: -74.0060 },
    formattedAddress: {
      street: '777 Oak St',
      number: '',
      postalCode: '10001',
      city: 'Metropolis',
      province: 'NY',
      country: 'USA'
    },
    phone: '+34777777777',
    email: 'hannah.ivy@example.com',
    businessHours: {
      standardHours: { open: '09:00', close: '20:00' },
      closedDay: null,
      closedDayReason: 'Descanso semanal'
    },
    contractSigned: true
  }
];

// Initialize the store with the clients
useStore.getState().initializeClients(clients);

// Initialize the store with 15 sample machines
const sampleMachines: Machine[] = [
  {
    id: '1',
    code: 'M001',
    type: 'pinball',
    model: 'Pinball 1',
    brand: 'Brand A',
    counter: 0,
    amortizationValue: 1000,
    registrationDate: new Date().toISOString().split('T')[0],
    status: 'active',
    serialNumber: 'S001',
    clientSharePercentage: 50,
    locationHistory: [],
    maintenanceHistory: [],
    collectionHistory: []
  },
  {
    id: '2',
    code: 'M002',
    type: 'darts',
    model: 'Darts 1',
    brand: 'Brand B',
    counter: 0,
    amortizationValue: 800,
    registrationDate: new Date().toISOString().split('T')[0],
    status: 'active',
    serialNumber: 'S002',
    clientSharePercentage: 50,
    locationHistory: [],
    maintenanceHistory: [],
    collectionHistory: []
  },
  {
    id: '3',
    code: 'M003',
    type: 'arcade',
    model: 'Arcade 1',
    brand: 'Brand C',
    counter: 0,
    amortizationValue: 1200,
    registrationDate: new Date().toISOString().split('T')[0],
    status: 'active',
    serialNumber: 'S003',
    clientSharePercentage: 50,
    locationHistory: [],
    maintenanceHistory: [],
    collectionHistory: []
  },
  {
    id: '4',
    code: 'M004',
    type: 'foosball',
    model: 'Foosball 1',
    brand: 'Brand D',
    counter: 0,
    amortizationValue: 900,
    registrationDate: new Date().toISOString().split('T')[0],
    status: 'active',
    serialNumber: 'S004',
    clientSharePercentage: 50,
    locationHistory: [],
    maintenanceHistory: [],
    collectionHistory: []
  },
  {
    id: '5',
    code: 'M005',
    type: 'pinball',
    model: 'Pinball 2',
    brand: 'Brand E',
    counter: 0,
    amortizationValue: 1100,
    registrationDate: new Date().toISOString().split('T')[0],
    status: 'active',
    serialNumber: 'S005',
    clientSharePercentage: 50,
    locationHistory: [],
    maintenanceHistory: [],
    collectionHistory: []
  },
  {
    id: '6',
    code: 'M006',
    type: 'darts',
    model: 'Darts 2',
    brand: 'Brand F',
    counter: 0,
    amortizationValue: 850,
    registrationDate: new Date().toISOString().split('T')[0],
    status: 'active',
    serialNumber: 'S006',
    clientSharePercentage: 50,
    locationHistory: [],
    maintenanceHistory: [],
    collectionHistory: []
  },
  {
    id: '7',
    code: 'M007',
    type: 'arcade',
    model: 'Arcade 2',
    brand: 'Brand G',
    counter: 0,
    amortizationValue: 1250,
    registrationDate: new Date().toISOString().split('T')[0],
    status: 'active',
    serialNumber: 'S007',
    clientSharePercentage: 50,
    locationHistory: [],
    maintenanceHistory: [],
    collectionHistory: []
  },
  {
    id: '8',
    code: 'M008',
    type: 'foosball',
    model: 'Foosball 2',
    brand: 'Brand H',
    counter: 0,
    amortizationValue: 950,
    registrationDate: new Date().toISOString().split('T')[0],
    status: 'active',
    serialNumber: 'S008',
    clientSharePercentage: 50,
    locationHistory: [],
    maintenanceHistory: [],
    collectionHistory: []
  },
  {
    id: '9',
    code: 'M009',
    type: 'pinball',
    model: 'Pinball 3',
    brand: 'Brand I',
    counter: 0,
    amortizationValue: 1050,
    registrationDate: new Date().toISOString().split('T')[0],
    status: 'active',
    serialNumber: 'S009',
    clientSharePercentage: 50,
    locationHistory: [],
    maintenanceHistory: [],
    collectionHistory: []
  },
  {
    id: '10',
    code: 'M010',
    type: 'darts',
    model: 'Darts 3',
    brand: 'Brand J',
    counter: 0,
    amortizationValue: 875,
    registrationDate: new Date().toISOString().split('T')[0],
    status: 'active',
    serialNumber: 'S010',
    clientSharePercentage: 50,
    locationHistory: [],
    maintenanceHistory: [],
    collectionHistory: []
  },
  {
    id: '11',
    code: 'M011',
    type: 'arcade',
    model: 'Arcade 3',
    brand: 'Brand K',
    counter: 0,
    amortizationValue: 1275,
    registrationDate: new Date().toISOString().split('T')[0],
    status: 'active',
    serialNumber: 'S011',
    clientSharePercentage: 50,
    locationHistory: [],
    maintenanceHistory: [],
    collectionHistory: []
  },
  {
    id: '12',
    code: 'M012',
    type: 'foosball',
    model: 'Foosball 3',
    brand: 'Brand L',
    counter: 0,
    amortizationValue: 975,
    registrationDate: new Date().toISOString().split('T')[0],
    status: 'active',
    serialNumber: 'S012',
    clientSharePercentage: 50,
    locationHistory: [],
    maintenanceHistory: [],
    collectionHistory: []
  },
  {
    id: '13',
    code: 'M013',
    type: 'pinball',
    model: 'Pinball 4',
    brand: 'Brand M',
    counter: 0,
    amortizationValue: 1150,
    registrationDate: new Date().toISOString().split('T')[0],
    status: 'active',
    serialNumber: 'S013',
    clientSharePercentage: 50,
    locationHistory: [],
    maintenanceHistory: [],
    collectionHistory: []
  },
  {
    id: '14',
    code: 'M014',
    type: 'darts',
    model: 'Darts 4',
    brand: 'Brand N',
    counter: 0,
    amortizationValue: 900,
    registrationDate: new Date().toISOString().split('T')[0],
    status: 'active',
    serialNumber: 'S014',
    clientSharePercentage: 50,
    locationHistory: [],
    maintenanceHistory: [],
    collectionHistory: []
  },
  {
    id: '15',
    code: 'M015',
    type: 'arcade',
    model: 'Arcade 4',
    brand: 'Brand O',
    counter: 0,
    amortizationValue: 1300,
    registrationDate: new Date().toISOString().split('T')[0],
    status: 'active',
    serialNumber: 'S015',
    clientSharePercentage: 50,
    locationHistory: [],
    maintenanceHistory: [],
    collectionHistory: []
  }
];

// Initialize the store with the sample machines
useStore.getState().initializeMachines(sampleMachines);
