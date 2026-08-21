export type PaymentStatusType = 'PENDING' | 'PAID_FULL';

export interface CustomerRentalRecord {
  id?: string;
  _id?: string;
  customerName: string;
  customerCnic: string;
  customerPhone?: string;
  guarantorName?: string;
  guarantorFatherName?: string;
  guarantorCnic?: string;
  guarantorPhone?: string;
  guarantorAddress?: string;
  carNameModel: string; // e.g. "Toyota Corolla Altis Grande"
  carPlateNumber: string; // e.g. "LEA-2024-88"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number; // Computed automatically
  totalPrice: number; // Total Rent Charged (Rs.)
  advancePaid: number; // Advance Amount Paid (Rs.)
  balanceDue: number; // Computed: Total Price - Advance Paid (Rs.)
  paymentStatus?: PaymentStatusType; // 'PENDING' | 'PAID_FULL'
  
  // Meter Readings & Vehicle Return Settlement
  startOdometer?: number; // Starting Odometer KM at dispatch
  endOdometer?: number; // Final Odometer KM at return
  totalKmDriven?: number; // endOdometer - startOdometer
  allowedKmThreshold?: number; // Daily or total allowed KM limit (e.g. 200 KM/day)
  extraKmRate?: number; // Surcharge per excess KM (e.g. Rs. 25/KM)
  extraKmDriven?: number; // KM driven beyond allowed threshold
  extraKmCharges?: number; // Extra KM Surcharge Amount (Rs.)
  otherCharges?: number; // Late fee, damage, or fuel fee (Rs.)
  isReturned?: boolean; // Whether car has been returned / submitted
  returnDate?: string; // Actual return date (YYYY-MM-DD)
  returnNotes?: string; // Condition inspection remarks
  
  notes?: string;
  createdAt?: string;
}

export interface VehicleItem {
  id?: string;
  _id?: string;
  carNameModel: string;
  carPlateNumber: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  payoutAmount: number;
  advancePaid?: number; // Advance paid to investor (Rs.)
  balanceDue?: number; // Remaining due to investor (Rs.)
  paymentStatus?: PaymentStatusType; // 'PENDING' | 'PAID_FULL'
  notes?: string;
}

export interface InvestorRecord {
  id?: string;
  _id?: string;
  name: string;
  cnic: string; // Unique National Identity Card Number
  phone?: string;
  vehicles: VehicleItem[]; // Array of deposited vehicles
  createdAt?: string;
}

export interface SystemSettings {
  businessName: string;
  currency: string;
}

export interface AppDatabaseState {
  records: InvestorRecord[];
  settings: SystemSettings;
}


export interface VehicleMaintenanceLog {
  id?: string;
  _id?: string;
  carPlateNumber: string;
  carNameModel: string;
  serviceType: string; // e.g. "Oil & Filters Change" or "Other"
  customServiceType?: string; // If serviceType === "Other"
  serviceDate: string; // YYYY-MM-DD
  cost: number; // Expense in Rs.
  vendorName?: string; // Workshop / Mechanic
  odometer?: number; // Odometer reading KM
  description?: string; // Notes & work details
  createdAt?: string;
}

export type ActiveTab = 
  | 'investor-register' 
  | 'investor-directory' 
  | 'customer-register' 
  | 'customer-directory' 
  | 'maintenance-register' 
  | 'maintenance-directory' 
  | 'agenda'
  | 'vehicle-360'
  | 'investor-profile'
  | 'customer-profile'
  | 'financial-reports'
  | 'register' 
  | 'directory' 
  | 'dashboard' 
  | 'cars' 
  | 'investors' 
  | 'clients' 
  | 'bookings' 
  | 'maintenance' 
  | 'locator' 
  | 'accounts' 
  | 'backup';




// Backward compatibility types for legacy components
export type OwnershipType = 'INVESTOR' | 'COMPANY';
export type CarStatus = 'AVAILABLE' | 'ON_RENT' | 'MAINTENANCE' | 'RETURNED_TO_INVESTOR';
export type CarCategory = string;
export type PayoutType = 'FIXED_MONTHLY' | 'PERCENTAGE' | 'PER_DAY';
export type FuelType = string;
export type TransmissionType = string;
export type BookingStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PAID' | 'PARTIAL' | 'DUE' | 'REFUNDED';
export type FuelLevel = string;
export type ServiceType = string;

export interface BankDetails {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban?: string;
}

export interface Investor {
  id: string;
  cnic: string;
  name: string;
  phone: string;
  altPhone?: string;
  address: string;
  bankDetails: BankDetails;
  agreementStartDate: string;
  agreementEndDate: string;
  payoutType: PayoutType;
  payoutAmount: number;
  payoutDueDay: number;
  totalPaid: number;
  notes?: string;
  createdAt: string;
}

export interface Car {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  color: string;
  category: CarCategory;
  engineNumber: string;
  chassisNumber: string;
  currentOdometer: number;
  dailyRate: number;
  monthlyRate: number;
  ownership: OwnershipType;
  investorId?: string;
  status: CarStatus;
  currentBookingId?: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  image?: string;
  notes?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  cnic: string;
  name: string;
  phone: string;
  altPhone?: string;
  licenseNumber: string;
  licenseExpiry?: string;
  address: string;
  guarantorName?: string;
  guarantorFatherName?: string;
  guarantorPhone?: string;
  guarantorCnic?: string;
  guarantorAddress?: string;
  securityDepositHeld: number;
  totalRentalsCount: number;
  notes?: string;
  createdAt: string;
}

export interface ExtraCharges {
  lateFee: number;
  damageFee: number;
  fuelFee: number;
  extraKmFee: number;
  description?: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  carId: string;
  clientId: string;
  startDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  rateType: 'DAILY' | 'MONTHLY' | 'CUSTOM';
  ratePerUnit: number;
  totalDays: number;
  totalEstimatedRent: number;
  advancePaid: number;
  securityDeposit: number;
  startOdometer: number;
  endOdometer?: number;
  startFuelLevel: FuelLevel;
  endFuelLevel?: FuelLevel;
  destination: string;
  status: BookingStatus;
  extraCharges: ExtraCharges;
  discount: number;
  finalTotalAmount?: number;
  finalBalancePaid?: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
}

export interface MaintenanceRecord {
  id: string;
  carId: string;
  serviceDate: string;
  serviceType: ServiceType;
  description: string;
  cost: number;
  odometer: number;
  nextServiceOdometer?: number;
  nextServiceDate?: string;
  vendorName: string;
  invoiceNumber?: string;
  createdAt: string;
}

export interface InvestorPayout {
  id: string;
  investorId: string;
  payoutDate: string;
  periodMonth: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface CompanySettings {
  businessName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  currency: string;
  termsAndConditions: string[];
  cloudDbConfig?: {
    enabled: boolean;
    endpoint: string;
    apiKey: string;
    lastSyncTime?: string;
  };
}

export interface DatabaseState {
  investors: Investor[];
  cars: Car[];
  clients: Client[];
  bookings: Booking[];
  maintenanceRecords: MaintenanceRecord[];
  investorPayouts: InvestorPayout[];
  settings: CompanySettings;
  version: string;
  lastBackupDate?: string;
}


