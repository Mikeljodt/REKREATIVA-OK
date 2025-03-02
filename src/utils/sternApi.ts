import type { Machine, Collection } from '../types';

interface SternMachineData {
  serialNumber: string;
  model: string;
  location: string;
  lastConnection: string;
  earnings: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  gameStats: {
    totalGames: number;
    averageGameTime: number;
    popularity: number;
  };
  settings: {
    pricing: {
      credits: number;
      amount: number;
      currency: string;
    };
    difficulty: string;
    ballSaveTime: number;
  };
  health: {
    status: 'online' | 'offline' | 'warning' | 'error';
    lastMaintenance: string;
    warnings: string[];
    errors: string[];
  };
}

export class SternInsiderAPI {
  private apiKey: string;
  private baseUrl = 'https://insider.sternpinball.com/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Stern API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getMachineData(serialNumber: string): Promise<SternMachineData> {
    return this.request<SternMachineData>(`/machines/${serialNumber}`);
  }

  async syncMachineData(machine: Machine): Promise<Partial<Machine>> {
    if (!machine.serialNumber) {
      throw new Error('Machine serial number is required for Stern sync');
    }

    const sternData = await this.getMachineData(machine.serialNumber);

    return {
      counter: sternData.gameStats.totalGames,
      status: sternData.health.status === 'online' ? 'active' : 'maintenance',
      lastConnection: sternData.lastConnection,
      gameStats: {
        totalGames: sternData.gameStats.totalGames,
        averageGameTime: sternData.gameStats.averageGameTime,
        popularity: sternData.gameStats.popularity
      },
      health: {
        status: sternData.health.status,
        warnings: sternData.health.warnings,
        errors: sternData.health.errors
      },
      settings: sternData.settings
    };
  }

  async getEarningsData(serialNumber: string): Promise<Collection> {
    const sternData = await this.getMachineData(serialNumber);
    
    return {
      id: crypto.randomUUID(),
      machineId: '', // To be filled by the caller
      clientId: '', // To be filled by the caller
      date: new Date().toISOString(),
      previousCounter: 0, // To be calculated by the caller
      currentCounter: sternData.gameStats.totalGames,
      totalRevenue: sternData.earnings.total,
      clientShare: 0, // To be calculated by the caller
      operatorShare: 0, // To be calculated by the caller
      clientPercentage: 50, // Default value
      adjustment: 0,
      invoiceNumber: '',
      invoiceGenerated: false,
      collectedBy: 'Stern Insider Connect',
      paymentMethod: 'other'
    };
  }
}
