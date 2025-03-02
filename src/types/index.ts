// Machine types
export type MachineType = 'pinball' | 'darts' | 'arcade' | 'foosball';

export interface InstallationHistory {
  id: string;
  machineId: string;
  date: string;
  location: {
    coordinates: { lat: number; lng: number };
    address: string;
    notes: string;
  };
  photos: {
    before: string[];
    after: string[];
  };
  initialCounters: {
    installation: number;
    electronic: number;
  };
  clientSignature: {
    name: string;
    position: string;
    date: string;
    signature: string;
  };
  termsAccepted: boolean;
  legalTermsAccepted: boolean;
  testResults: Array<{
    test: string;
    result: 'passed' | 'failed';
  }>;
  installedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Machine {
  id: string;
  code: string;
  type: MachineType;
  model: string;
  brand: string;
  counter: number;
  amortizationValue: number;
  amortizationProgress: number;
  registrationDate: string;
  status: 'active' | 'inactive' | 'maintenance' | 'retired';
  clientId: string | null;
  locationHistory: LocationHistory[];
  maintenanceHistory: MaintenanceRecord[];
  collectionHistory: Collection[];
  serialNumber: string;
  qrCode: string;
  clientSharePercentage: number;
  installationHistory?: InstallationHistory[];
}
