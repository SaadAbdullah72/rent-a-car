import { AppDatabaseState, InvestorRecord, CustomerRentalRecord, VehicleMaintenanceLog, SystemSettings } from '../types';

const STORAGE_KEY = 'INVESTOR_REGISTRY_DATABASE_V2';
const rawApiUrl = (import.meta as any).env?.VITE_API_URL || '';
const API_BASE = rawApiUrl ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`) : '/api';

const defaultSettings: SystemSettings = {
  businessName: 'Al-Falah Rent A Car',
  currency: 'Rs.'
};


// 15 Pre-loaded Realistic Pakistani Seed Datasets
export const defaultSeedInvestors: InvestorRecord[] = [
  {
    id: 'inv-seed-1',
    name: 'Chaudhry Tariq Mahmood',
    cnic: '35202-8765432-1',
    phone: '0300-8451234',
    vehicles: [
      {
        carNameModel: 'Toyota Corolla Altis Grande 1.8',
        carPlateNumber: 'LEA-2024-88',
        startDate: '2026-08-01',
        endDate: '2026-08-31',
        totalDays: 31,
        payoutAmount: 85000,
        advancePaid: 25000,
        balanceDue: 60000,
        paymentStatus: 'PENDING',
        notes: 'Monthly executive rental agreement.'
      }
    ],
    createdAt: '2026-08-01T10:00:00.000Z'
  },
  {
    id: 'inv-seed-2',
    name: 'Malik Zeeshan Afzal',
    cnic: '37405-1234987-3',
    phone: '0333-5128901',
    vehicles: [
      {
        carNameModel: 'Kia Sportage AWD',
        carPlateNumber: 'ISB-990-Z',
        startDate: '2026-08-05',
        endDate: '2026-08-25',
        totalDays: 21,
        payoutAmount: 110000,
        advancePaid: 40000,
        balanceDue: 70000,
        paymentStatus: 'PENDING',
        notes: 'Agreed 21-day rental tenure.'
      }
    ],
    createdAt: '2026-08-05T11:00:00.000Z'
  },
  {
    id: 'inv-seed-3',
    name: 'Mian Shahbaz Sharif Wattoo',
    cnic: '35201-9988776-5',
    phone: '0321-4455667',
    vehicles: [
      {
        carNameModel: 'Honda Civic RS Turbo',
        carPlateNumber: 'LEC-2023-14',
        startDate: '2026-08-10',
        endDate: '2026-09-10',
        totalDays: 32,
        payoutAmount: 125000,
        advancePaid: 30000,
        balanceDue: 95000,
        paymentStatus: 'PENDING',
        notes: 'Monthly sedan deposit.'
      },
      {
        carNameModel: 'Hyundai Tucson Ultimate',
        carPlateNumber: 'LEB-2024-55',
        startDate: '2026-08-12',
        endDate: '2026-09-12',
        totalDays: 32,
        payoutAmount: 130000,
        advancePaid: 50000,
        balanceDue: 80000,
        paymentStatus: 'PENDING',
        notes: 'SUV rental deposit.'
      }
    ],
    createdAt: '2026-08-10T12:00:00.000Z'
  },
  {
    id: 'inv-seed-4',
    name: 'Sardar Jahangir Khan Tareen',
    cnic: '38403-5544332-9',
    phone: '0301-7788990',
    vehicles: [
      {
        carNameModel: 'Toyota Fortuner Legender',
        carPlateNumber: 'LXR-786',
        startDate: '2026-08-01',
        endDate: '2026-08-30',
        totalDays: 30,
        payoutAmount: 220000,
        advancePaid: 100000,
        balanceDue: 120000,
        paymentStatus: 'PENDING',
        notes: 'Luxury SUV monthly deposit.'
      }
    ],
    createdAt: '2026-08-01T09:00:00.000Z'
  },
  {
    id: 'inv-seed-5',
    name: 'Syed Ali Raza Rizvi',
    cnic: '35202-3322110-7',
    phone: '0345-6677889',
    vehicles: [
      {
        carNameModel: 'Suzuki Cultus VXL',
        carPlateNumber: 'LEF-2022-99',
        startDate: '2026-08-15',
        endDate: '2026-08-31',
        totalDays: 17,
        payoutAmount: 45000,
        advancePaid: 15000,
        balanceDue: 30000,
        paymentStatus: 'PENDING',
        notes: 'Economy hatch deposit.'
      }
    ],
    createdAt: '2026-08-15T14:00:00.000Z'
  }
];

export const defaultSeedCustomerRentals: CustomerRentalRecord[] = [
  {
    id: 'rent-seed-1',
    customerName: 'Hamza Bilal Butt',
    customerCnic: '35201-9876543-1',
    customerPhone: '0321-9988776',
    guarantorName: 'Tariq Mahmood Butt',
    guarantorFatherName: 'Muhammad Rafiq Butt',
    guarantorCnic: '35201-1122334-5',
    guarantorPhone: '0300-4455667',
    guarantorAddress: 'House 14-B, Sector C, Bahria Town, Lahore',
    carNameModel: 'Toyota Corolla Altis Grande',
    carPlateNumber: 'LEA-2024-88',
    startDate: '2026-08-18',
    endDate: '2026-08-23',
    totalDays: 6,
    totalPrice: 42000,
    advancePaid: 15000,
    balanceDue: 27000,
    paymentStatus: 'PENDING',
    notes: 'Family northern tour rental.',
    createdAt: '2026-08-18T08:00:00.000Z'
  },
  {
    id: 'rent-seed-2',
    customerName: 'Usman Ali Dogar',
    customerCnic: '35404-7766554-3',
    customerPhone: '0302-8877665',
    guarantorName: 'Chaudhry Arshad Dogar',
    guarantorFatherName: 'Chaudhry Bashir Dogar',
    guarantorCnic: '35404-9988112-1',
    guarantorPhone: '0333-8877112',
    guarantorAddress: 'Main Bazar, Sheikhupura Road, Gujranwala',
    carNameModel: 'Kia Sportage AWD',
    carPlateNumber: 'ISB-990-Z',
    startDate: '2026-08-18',
    endDate: '2026-08-20',
    totalDays: 3,
    totalPrice: 36000,
    advancePaid: 20000,
    balanceDue: 16000,
    paymentStatus: 'PENDING',
    notes: 'Official business travel.',
    createdAt: '2026-08-18T09:00:00.000Z'
  },
  {
    id: 'rent-seed-3',
    customerName: 'Dr. Bilal Ahmad Khan',
    customerCnic: '37302-1122334-7',
    customerPhone: '0334-5544332',
    guarantorName: 'Professor Tariq Jamil Khan',
    guarantorFatherName: 'Haji Ahmad Din Khan',
    guarantorCnic: '37302-5566778-9',
    guarantorPhone: '0345-1122334',
    guarantorAddress: 'House 88, Street 9, F-8/2, Islamabad',
    carNameModel: 'Honda Civic RS Turbo',
    carPlateNumber: 'LEC-2023-14',
    startDate: '2026-08-19',
    endDate: '2026-08-26',
    totalDays: 8,
    totalPrice: 72000,
    advancePaid: 30000,
    balanceDue: 42000,
    paymentStatus: 'PENDING',
    notes: 'Wedding ceremony rental.',
    createdAt: '2026-08-18T09:30:00.000Z'
  },
  {
    id: 'rent-seed-4',
    customerName: 'Faisal Mukhtar Chaudhry',
    customerCnic: '35202-6655443-1',
    customerPhone: '0300-1122334',
    guarantorName: 'Malik Jahangir Awan',
    guarantorFatherName: 'Malik Khuda Bakhsh',
    guarantorCnic: '35202-4433221-7',
    guarantorPhone: '0301-6677889',
    guarantorAddress: 'Office #4, Siddique Trade Center, Gulberg III, Lahore',
    carNameModel: 'Toyota Fortuner Legender',
    carPlateNumber: 'LXR-786',
    startDate: '2026-08-18',
    endDate: '2026-08-18',
    totalDays: 1,
    totalPrice: 25000,
    advancePaid: 25000,
    balanceDue: 0,
    paymentStatus: 'PAID_FULL',
    notes: 'Single day protocol rental. Paid in full.',
    createdAt: '2026-08-18T07:00:00.000Z'
  },
  {
    id: 'rent-seed-5',
    customerName: 'Khurram Shahzad Gujjar',
    customerCnic: '34101-9988112-9',
    customerPhone: '0313-7766554',
    guarantorName: 'Haji Muhammad Ishaq',
    guarantorFatherName: 'Muhammad Din Gujjar',
    guarantorCnic: '34101-2233445-3',
    guarantorPhone: '0322-5544332',
    guarantorAddress: 'Chowk Shaheedan, GT Road, Gujrat',
    carNameModel: 'Suzuki Cultus VXL',
    carPlateNumber: 'LEF-2022-99',
    startDate: '2026-08-18',
    endDate: '2026-08-22',
    totalDays: 5,
    totalPrice: 20000,
    advancePaid: 5000,
    balanceDue: 15000,
    paymentStatus: 'PENDING',
    notes: 'City intercity commute.',
    createdAt: '2026-08-18T10:00:00.000Z'
  }
];

export const defaultSeedMaintenance: VehicleMaintenanceLog[] = [
  {
    id: 'maint-seed-1',
    carPlateNumber: 'LEA-2024-88',
    carNameModel: 'Toyota Corolla Altis Grande',
    serviceType: 'Oil & Filters Change',
    customServiceType: '',
    serviceDate: '2026-08-10',
    cost: 14500,
    vendorName: 'Toyota Ravi Motors',
    odometer: 35000,
    description: 'Mobil 1 5W-30 Synthetic engine oil, genuine oil filter, & air filter replaced.',
    createdAt: '2026-08-10T10:00:00.000Z'
  },
  {
    id: 'maint-seed-2',
    carPlateNumber: 'ISB-990-Z',
    carNameModel: 'Kia Sportage AWD',
    serviceType: 'Tyres & Alignment',
    customServiceType: '',
    serviceDate: '2026-08-12',
    cost: 48000,
    vendorName: 'Yokohama Tyre Hub Johar Town',
    odometer: 42000,
    description: '2 front Yokohama 225/55R18 tyres installed, 4-wheel computerized alignment done.',
    createdAt: '2026-08-12T11:00:00.000Z'
  },
  {
    id: 'maint-seed-3',
    carPlateNumber: 'LEC-2023-14',
    carNameModel: 'Honda Civic RS Turbo',
    serviceType: 'Brakes & Rotors',
    customServiceType: '',
    serviceDate: '2026-08-14',
    cost: 22000,
    vendorName: 'Honda Fort Gulberg',
    odometer: 28000,
    description: 'Front & rear ceramic brake pads replaced, brake rotors resurfaced.',
    createdAt: '2026-08-14T12:00:00.000Z'
  },
  {
    id: 'maint-seed-4',
    carPlateNumber: 'LXR-786',
    carNameModel: 'Toyota Fortuner Legender',
    serviceType: 'Other: Front Windshield OEM Glass Replacement',
    customServiceType: 'Front Windshield OEM Glass Replacement',
    serviceDate: '2026-08-15',
    cost: 38000,
    vendorName: 'Glasspoint Defense',
    odometer: 18000,
    description: 'Front OEM laminated windshield glass replacement due to highway stone crack.',
    createdAt: '2026-08-15T13:00:00.000Z'
  },
  {
    id: 'maint-seed-5',
    carPlateNumber: 'LEF-2022-99',
    carNameModel: 'Suzuki Cultus VXL',
    serviceType: 'AC Service & Gas',
    customServiceType: '',
    serviceDate: '2026-08-16',
    cost: 9500,
    vendorName: 'Master Cool AC Specialist',
    odometer: 52000,
    description: 'AC compressor service, R134a refrigerant gas refill, and cooling coil leak check.',
    createdAt: '2026-08-16T14:00:00.000Z'
  }
];

/**
 * Ultra-resilient fetch with automatic exponential backoff retry.
 * Automatically recovers from serverless cold starts, Atlas reconnect delays, or transient packet drops.
 */
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, baseDelay = 600): Promise<Response> {
  let lastError: any = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if ((res.status === 503 || res.status === 502 || res.status === 504) && attempt < retries) {
        await new Promise(r => setTimeout(r, baseDelay * attempt));
        continue;
      }
      return res;
    } catch (err: any) {
      lastError = err;
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, baseDelay * attempt));
      }
    }
  }
  throw lastError || new Error('Network request failed after retries');
}

export const StorageService = {
  getInitialState(): AppDatabaseState {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.records) && parsed.records.length > 0) {
          return {
            records: parsed.records,
            settings: { ...defaultSettings, ...parsed.settings }
          };
        }
      } catch (e) {}
    }

    const initial: AppDatabaseState = {
      records: defaultSeedInvestors,
      settings: defaultSettings
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  },

  // ===== INVESTORS =====
  async fetchInvestorsFromMongo(): Promise<InvestorRecord[]> {
    const res = await fetchWithRetry(`${API_BASE}/investors`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ fetchInvestors failed:', err);
      throw new Error(err.error || 'Failed to fetch investors');
    }
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : defaultSeedInvestors;
  },

  async saveInvestorToMongo(record: InvestorRecord): Promise<{ success: boolean; data?: any; error?: string }> {
    const res = await fetchWithRetry(`${API_BASE}/investors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ saveInvestor failed:', err);
      return { success: false, error: err.error || 'Failed to save investor' };
    }
    const data = await res.json();
    console.log('✅ Investor saved to MongoDB:', data.message);
    return { success: true, data: data.investor };
  },

  async updateInvestorToMongo(id: string, record: Partial<InvestorRecord>): Promise<{ success: boolean; data?: any; error?: string }> {
    const res = await fetchWithRetry(`${API_BASE}/investors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ updateInvestor failed:', err);
      return { success: false, error: err.error || 'Failed to update investor' };
    }
    const data = await res.json();
    return { success: true, data: data.investor };
  },

  async deleteInvestorFromMongo(id: string): Promise<boolean> {
    try {
      const res = await fetchWithRetry(`${API_BASE}/investors/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ===== CUSTOMER RENTALS =====
  async fetchCustomerRentalsFromMongo(): Promise<CustomerRentalRecord[]> {
    const res = await fetchWithRetry(`${API_BASE}/customer-rentals`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ fetchCustomerRentals failed:', err);
      throw new Error(err.error || 'Failed to fetch rentals');
    }
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : defaultSeedCustomerRentals;
  },

  async saveCustomerRentalToMongo(record: CustomerRentalRecord): Promise<{ success: boolean; data?: any; error?: string }> {
    const res = await fetchWithRetry(`${API_BASE}/customer-rentals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ saveCustomerRental failed:', err);
      return { success: false, error: err.error || 'Failed to save rental' };
    }
    const data = await res.json();
    console.log('✅ Customer Rental saved to MongoDB:', data.message);
    return { success: true, data: data.rental };
  },

  async updateCustomerRentalToMongo(id: string, record: Partial<CustomerRentalRecord>): Promise<{ success: boolean; data?: any; error?: string }> {
    const res = await fetchWithRetry(`${API_BASE}/customer-rentals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ updateCustomerRental failed:', err);
      return { success: false, error: err.error || 'Failed to update rental' };
    }
    const data = await res.json();
    return { success: true, data: data.rental };
  },

  async deleteCustomerRentalFromMongo(id: string): Promise<boolean> {
    try {
      const res = await fetchWithRetry(`${API_BASE}/customer-rentals/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ===== MAINTENANCE =====
  async fetchMaintenanceFromMongo(): Promise<VehicleMaintenanceLog[]> {
    const res = await fetchWithRetry(`${API_BASE}/maintenance`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ fetchMaintenance failed:', err);
      throw new Error(err.error || 'Failed to fetch maintenance');
    }
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : defaultSeedMaintenance;
  },

  async saveMaintenanceToMongo(record: VehicleMaintenanceLog): Promise<{ success: boolean; data?: any; error?: string }> {
    const res = await fetchWithRetry(`${API_BASE}/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ saveMaintenance failed:', err);
      return { success: false, error: err.error || 'Failed to save maintenance' };
    }
    const data = await res.json();
    console.log('✅ Maintenance saved to MongoDB:', data.message);
    return { success: true, data: data.record };
  },

  async updateMaintenanceToMongo(id: string, record: Partial<VehicleMaintenanceLog>): Promise<{ success: boolean; data?: any; error?: string }> {
    const res = await fetchWithRetry(`${API_BASE}/maintenance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ updateMaintenance failed:', err);
      return { success: false, error: err.error || 'Failed to update maintenance' };
    }
    const data = await res.json();
    return { success: true, data: data.record };
  },

  async deleteMaintenanceFromMongo(id: string): Promise<boolean> {
    try {
      const res = await fetchWithRetry(`${API_BASE}/maintenance/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ===== HEALTH CHECK =====
  async checkDbHealth(): Promise<{ connected: boolean; status: string }> {
    try {
      const res = await fetchWithRetry(`${API_BASE}/health`, {}, 2, 400);
      const data = await res.json();
      return { connected: data.db?.includes('CONNECTED') || data.database?.includes('CONNECTED') || data.status === 'OK', status: data.db || data.database || 'OK' };
    } catch {
      return { connected: false, status: 'Server not reachable' };
    }
  },

  // ===== 1-CLICK BACKUP & RESTORE =====
  async downloadDatabaseBackupFile(): Promise<{ success: boolean; filename?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/backup/export`);
      if (!res.ok) {
        throw new Error('Server backup endpoint returned error.');
      }
      const data = await res.json();
      const nowStr = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `Al_Falah_Rent_A_Car_Backup_${nowStr}.json`;

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true, filename };
    } catch (err: any) {
      console.error('Backup Download Error:', err);
      return { success: false, error: err.message || 'Failed to download backup' };
    }
  },

  async restoreDatabaseBackupFile(jsonString: string): Promise<{ success: boolean; message?: string; counts?: any; error?: string }> {
    try {
      const parsed = JSON.parse(jsonString);
      const res = await fetch(`${API_BASE}/backup/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Restore request failed' }));
        return { success: false, error: err.error || 'Failed to restore database' };
      }
      const result = await res.json();
      return { success: true, message: result.message, counts: result.counts };
    } catch (err: any) {
      console.error('Backup Restore Error:', err);
      return { success: false, error: err.message || 'Invalid JSON backup file' };
    }
  },



  // --- AUTHENTICATION API (SERVER-SIDE SECURE VALIDATION) ---
  async login(username: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        if (typeof window !== 'undefined' && data.token) {
          sessionStorage.setItem('ALFALAH_AUTH_TOKEN', data.token);
          sessionStorage.setItem('ALFALAH_AUTH_USER', data.username || username);
        }
        return { success: true, token: data.token };
      }
      return { success: false, error: data.error || 'Invalid Username or Password. Access Denied.' };
    } catch (err: any) {
      console.error('Login Network Error:', err);
      return { success: false, error: 'Cannot connect to authentication server. Please verify backend is running.' };
    }
  },

  getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('ALFALAH_AUTH_TOKEN');
    }
    return null;
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('ALFALAH_AUTH_TOKEN');
      sessionStorage.removeItem('ALFALAH_AUTH_USER');
    }
  },

  saveState(state: AppDatabaseState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  },

  exportDatabaseJSON(): string {
    const state = this.getInitialState();
    return JSON.stringify(state, null, 2);
  },

  importDatabaseJSON(jsonContent: string): { success: boolean; error?: string; state?: any } {
    try {
      const parsed = JSON.parse(jsonContent);
      this.saveState(parsed);
      return { success: true, state: parsed };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid JSON file.' };
    }
  }
};


