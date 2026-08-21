import React, { useState, useEffect, useMemo } from 'react';
import { InvestorRecord, VehicleItem, CustomerRentalRecord, VehicleMaintenanceLog, ActiveTab } from './types';
import { StorageService, defaultSeedInvestors, defaultSeedCustomerRentals, defaultSeedMaintenance } from './services/storage';

const SERVICE_OPTIONS = [
  'Oil & Filters Change',
  'Tyres & Alignment',
  'Brakes & Rotors',
  'AC Service & Gas',
  'Engine Repair',
  'Body & Paint / Denting',
  'Suspension & Shocks',
  'Battery Replacement',
  'General Tuning & Inspection',
  'Other Repair (Custom Detail)'
];

export function App() {
  const [investorRecords, setInvestorRecords] = useState<InvestorRecord[]>(defaultSeedInvestors);
  const [customerRentals, setCustomerRentals] = useState<CustomerRentalRecord[]>(defaultSeedCustomerRentals);
  const [maintenanceLogs, setMaintenanceLogs] = useState<VehicleMaintenanceLog[]>(defaultSeedMaintenance);

  const [activeTab, setActiveTab] = useState<ActiveTab>('investor-register');
  const [dbConnected, setDbConnected] = useState<boolean>(false);

  // --- AUTHENTICATION & LANDING PAGE STATE ---
  const [viewMode, setViewMode] = useState<'landing' | 'authenticated'>('landing');
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  // Check if session token exists on load
  useEffect(() => {
    const token = StorageService.getAuthToken();
    if (token) {
      setViewMode('authenticated');
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputUser = loginUsername.trim();
    const inputPass = loginPassword.trim();

    if (!inputUser || !inputPass) {
      setLoginError('Please enter both Username and Password.');
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await StorageService.login(inputUser, inputPass);
      if (res.success) {
        setViewMode('authenticated');
        setShowLoginModal(false);
        setLoginError('');
        setLoginPassword('');
        showNotification('Administrator Authentication Verified! Al-Falah Portal Unlocked.', 'success');
      } else {
        setLoginError(res.error || 'Invalid Username or Password. Access Denied.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please check backend connection.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    StorageService.logout();
    setViewMode('landing');
    showNotification('System Locked. Returned to Executive Landing Page.', 'success');
  };

  const todayIso = new Date().toISOString().split('T')[0];

  // Strict Auto-Formatting Helpers for CNIC (XXXXX-XXXXXXX-X) & Phone (XXXX-XXXXXXX)
  const formatCnicInput = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 13);
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  };

  const formatPhoneInput = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 4) return digits;
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  };



  // --- FORM STATE 1: INVESTOR INTAKE FORM ---
  const [invName, setInvName] = useState('');
  const [invCnic, setInvCnic] = useState('');
  const [invPhone, setInvPhone] = useState('');
  const [invVehicles, setInvVehicles] = useState<VehicleItem[]>([
    {
      carNameModel: '',
      carPlateNumber: '',
      startDate: todayIso,
      endDate: todayIso,
      totalDays: 1,
      payoutAmount: 0,
      advancePaid: 0,
      balanceDue: 0,
      paymentStatus: 'PENDING',
      notes: ''
    }
  ]);

  // --- FORM STATE 2: CUSTOMER RENTAL FORM ---
  const [custName, setCustName] = useState('');
  const [custCnic, setCustCnic] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custCarNameModel, setCustCarNameModel] = useState('');
  const [custCarPlateNumber, setCustCarPlateNumber] = useState('');
  const [custCarSearchQuery, setCustCarSearchQuery] = useState('');
  const [custCarAvailabilityFilter, setCustCarAvailabilityFilter] = useState<'all' | 'available' | 'rented'>('all');
  const [custStartDate, setCustStartDate] = useState(todayIso);
  const [custEndDate, setCustEndDate] = useState(todayIso);
  const [custTotalPrice, setCustTotalPrice] = useState('');
  const [custAdvancePaid, setCustAdvancePaid] = useState('');
  const [custNotes, setCustNotes] = useState('');

  // --- FORM STATE 3: MAINTENANCE LOG FORM ---
  const [maintSelectedPlate, setMaintSelectedPlate] = useState('');
  const [maintCarNameModel, setMaintCarNameModel] = useState('');
  const [maintServiceType, setMaintServiceType] = useState('Oil & Filters Change');
  const [maintCustomServiceType, setMaintCustomServiceType] = useState('');
  const [maintServiceDate, setMaintServiceDate] = useState(todayIso);
  const [maintCost, setMaintCost] = useState('');
  const [maintVendorName, setMaintVendorName] = useState('');
  const [maintOdometer, setMaintOdometer] = useState('');
  const [maintDescription, setMaintDescription] = useState('');

  // --- 360 DEGREE VEHICLE LOOKUP STATE ---
  const [selectedLookupPlate, setSelectedLookupPlate] = useState('');

  // --- INDIVIDUAL ACCOUNT PROFILE SELECTION STATE ---
  const [selectedInvestorProfileId, setSelectedInvestorProfileId] = useState('');
  const [selectedCustomerProfileId, setSelectedCustomerProfileId] = useState('');

  // --- AGENDA FILTER TIME FRAME ---
  const [agendaTimeframe, setAgendaTimeframe] = useState<'today' | '2days' | '5days' | 'week' | 'all'>('today');

  // --- EDIT MODAL STATE ---
  const [editingModal, setEditingModal] = useState<{
    type: 'investor' | 'customer' | 'maintenance';
    data: any;
  } | null>(null);

  // --- FORMAL REGISTRATION SUCCESS POPUP MODAL STATE ---
  const [showSuccessModal, setShowSuccessModal] = useState<{
    title: string;
    subtitle: string;
    targetTab: ActiveTab;
    details: { label: string; value: string }[];
  } | null>(null);


  // --- SAVING STATE (button spinner) ---
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // --- DATABASE BACKUP & DISASTER RECOVERY STATE ---
  const [showBackupModal, setShowBackupModal] = useState<boolean>(false);
  const [backupRestoreLoading, setBackupRestoreLoading] = useState<boolean>(false);

  // Search Terms
  const [invSearchTerm, setInvSearchTerm] = useState('');
  const [custSearchTerm, setCustSearchTerm] = useState('');
  const [maintSearchTerm, setMaintSearchTerm] = useState('');

  // --- PWA DESKTOP APP INSTALL STATE ---
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false);

  // Notification Banner
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // PWA Desktop App Install Event Listener
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const handleInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      showNotification('Al-Falah Rent A Car desktop app shortcut installed on your PC!', 'success');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstallDesktopApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        showNotification('App installed successfully! Desktop shortcut created on your PC.', 'success');
      }
      setDeferredPrompt(null);
    } else {
      showNotification('Click the (💻 / ⊕ Install App) icon in your browser address bar at the top-right to install!', 'success');
    }
  };

  // Helper for Auto-Days calculation
  const calculateDays = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 1;
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 1;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 1 : diffDays + 1;
  };

  // Customer Auto Balance Due
  const calculatedCustBalance = useMemo(() => {
    const total = parseFloat(custTotalPrice) || 0;
    const adv = parseFloat(custAdvancePaid) || 0;
    return Math.max(0, total - adv);
  }, [custTotalPrice, custAdvancePaid]);

  const calculatedCustDays = useMemo(() => {
    return calculateDays(custStartDate, custEndDate);
  }, [custStartDate, custEndDate]);

  // Aggregate List of All Fleet Vehicles (Unique by Plate Number)
  const allFleetVehicles = useMemo(() => {
    const map = new Map<string, { plate: string; model: string }>();

    investorRecords.forEach(inv => {
      if (inv.vehicles) {
        inv.vehicles.forEach(v => {
          if (v.carPlateNumber) {
            const cleanPlate = v.carPlateNumber.trim().toUpperCase();
            map.set(cleanPlate, { plate: cleanPlate, model: v.carNameModel });
          }
        });
      }
    });

    customerRentals.forEach(cr => {
      if (cr.carPlateNumber) {
        const cleanPlate = cr.carPlateNumber.trim().toUpperCase();
        if (!map.has(cleanPlate)) {
          map.set(cleanPlate, { plate: cleanPlate, model: cr.carNameModel });
        }
      }
    });

    return Array.from(map.values());
  }, [investorRecords, customerRentals]);

  // List of All Active Vehicles Registered by Investors Only with Live Availability Status
  const investorFleetVehicles = useMemo(() => {
    const list: {
      plate: string;
      model: string;
      investorName: string;
      investorCnic: string;
      investorPhone: string;
      isCurrentlyRented: boolean;
      currentRentalCustomer: string | null;
      currentRentalDates: string | null;
    }[] = [];

    investorRecords.forEach(inv => {
      if (inv.vehicles && Array.isArray(inv.vehicles)) {
        inv.vehicles.forEach(v => {
          if (v.carPlateNumber) {
            const cleanPlate = v.carPlateNumber.trim().toUpperCase();
            
            // Check if this vehicle is currently rented today
            const activeRentals = customerRentals.filter(
              r => r.carPlateNumber?.trim().toUpperCase() === cleanPlate
            );
            const activeNow = activeRentals.find(r => {
              if (!r.startDate || !r.endDate) return false;
              return todayIso >= r.startDate && todayIso <= r.endDate;
            });

            list.push({
              plate: cleanPlate,
              model: v.carNameModel || 'Vehicle',
              investorName: inv.name,
              investorCnic: inv.cnic,
              investorPhone: inv.phone || '',
              isCurrentlyRented: !!activeNow,
              currentRentalCustomer: activeNow ? activeNow.customerName : null,
              currentRentalDates: activeNow ? `${activeNow.startDate} to ${activeNow.endDate}` : null
            });
          }
        });
      }
    });
    return list;
  }, [investorRecords, customerRentals, todayIso]);

  // Live Filtered Search for Customer Vehicle Picker
  const filteredInvestorFleet = useMemo(() => {
    const q = custCarSearchQuery.toLowerCase().trim();
    return investorFleetVehicles.filter(v => {
      // 1. Availability filter
      if (custCarAvailabilityFilter === 'available' && v.isCurrentlyRented) return false;
      if (custCarAvailabilityFilter === 'rented' && !v.isCurrentlyRented) return false;

      // 2. Query search
      if (!q) return true;
      return (
        v.plate.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.investorName.toLowerCase().includes(q) ||
        v.investorCnic.toLowerCase().includes(q)
      );
    });
  }, [investorFleetVehicles, custCarSearchQuery, custCarAvailabilityFilter]);

  const handleSelectInvestorCarForRental = (plate: string) => {
    setCustCarPlateNumber(plate);
    const found = investorFleetVehicles.find(v => v.plate === plate);
    if (found) {
      setCustCarNameModel(found.model);
    } else {
      setCustCarNameModel('');
    }
  };

  // Load Data on Mount — also pre-warms the Vercel serverless function
  useEffect(() => {
    async function loadData() {
      try {
        const [invData, custData, maintData] = await Promise.all([
          StorageService.fetchInvestorsFromMongo(),
          StorageService.fetchCustomerRentalsFromMongo(),
          StorageService.fetchMaintenanceFromMongo()
        ]);

        if (invData && invData.length > 0) setInvestorRecords(invData);
        if (custData && custData.length > 0) setCustomerRentals(custData);
        if (maintData && maintData.length > 0) setMaintenanceLogs(maintData);

        setDbConnected(true);
      } catch (e) {
        setDbConnected(false);
        StorageService.checkDbHealth().catch(() => {});
      }
    }
    loadData();

    // Auto-Heartbeat & Instant Reconnect when window regains focus or comes online
    const monitorInterval = setInterval(async () => {
      const health = await StorageService.checkDbHealth();
      setDbConnected(health.connected);
    }, 25000);

    const onReconnected = async () => {
      const health = await StorageService.checkDbHealth();
      setDbConnected(health.connected);
      if (health.connected) {
        refreshAllData();
      }
    };

    window.addEventListener('online', onReconnected);
    window.addEventListener('focus', onReconnected);

    return () => {
      clearInterval(monitorInterval);
      window.removeEventListener('online', onReconnected);
      window.removeEventListener('focus', onReconnected);
    };
  }, []);


  // Refresh All Data from MongoDB
  const refreshAllData = async () => {
    try {
      const [invData, custData, maintData] = await Promise.all([
        StorageService.fetchInvestorsFromMongo(),
        StorageService.fetchCustomerRentalsFromMongo(),
        StorageService.fetchMaintenanceFromMongo()
      ]);

      if (invData) setInvestorRecords(invData);
      if (custData) setCustomerRentals(custData);
      if (maintData) setMaintenanceLogs(maintData);
    } catch (e) {}
  };

  // --- INVESTOR FORM HANDLERS ---
  const handleAddInvVehicle = () => {
    setInvVehicles([
      ...invVehicles,
      {
        carNameModel: '',
        carPlateNumber: '',
        startDate: todayIso,
        endDate: todayIso,
        totalDays: 1,
        payoutAmount: 0,
        advancePaid: 0,
        balanceDue: 0,
        paymentStatus: 'PENDING',
        notes: ''
      }
    ]);
  };

  const handleRemoveInvVehicle = (index: number) => {
    if (invVehicles.length === 1) {
      showNotification('At least one vehicle details must be provided.', 'error');
      return;
    }
    setInvVehicles(invVehicles.filter((_, i) => i !== index));
  };

  const handleInvVehicleChange = (index: number, field: keyof VehicleItem, value: any) => {
    const updated = [...invVehicles];
    const item = { ...updated[index], [field]: value };
    
    if (field === 'startDate' || field === 'endDate') {
      const s = field === 'startDate' ? value : item.startDate;
      const e = field === 'endDate' ? value : item.endDate;
      item.totalDays = calculateDays(s, e);
    }

    if (field === 'payoutAmount' || field === 'advancePaid') {
      const payout = field === 'payoutAmount' ? parseFloat(value) || 0 : item.payoutAmount;
      const adv = field === 'advancePaid' ? parseFloat(value) || 0 : (item.advancePaid || 0);
      item.balanceDue = Math.max(0, payout - adv);
    }

    updated[index] = item;
    setInvVehicles(updated);
  };

  const handleInvestorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invName.trim() || !invCnic.trim()) {
      showNotification('Please enter Investor Name and CNIC.', 'error');
      return;
    }

    for (let i = 0; i < invVehicles.length; i++) {
      const v = invVehicles[i];
      if (!v.carNameModel.trim() || !v.carPlateNumber.trim()) {
        showNotification(`Please fill in Vehicle Name and Plate Number for Vehicle #${i + 1}.`, 'error');
        return;
      }
    }

    const cleanedVehicles: VehicleItem[] = invVehicles.map(v => {
      const payout = parseFloat(String(v.payoutAmount)) || 0;
      const adv = parseFloat(String(v.advancePaid)) || 0;
      const bal = Math.max(0, payout - adv);
      return {
        carNameModel: v.carNameModel.trim(),
        carPlateNumber: v.carPlateNumber.trim().toUpperCase(),
        startDate: v.startDate,
        endDate: v.endDate,
        totalDays: calculateDays(v.startDate, v.endDate),
        payoutAmount: payout,
        advancePaid: adv,
        balanceDue: bal,
        paymentStatus: v.paymentStatus || 'PENDING',
        notes: (v.notes || '').trim()
      };
    });

    const record: InvestorRecord = {
      id: `rec-${Date.now()}`,
      name: invName.trim(),
      cnic: invCnic.trim(),
      phone: invPhone.trim(),
      vehicles: cleanedVehicles,
      createdAt: new Date().toISOString()
    };

    setIsSaving(true);
    try {
      // 1. Save to MongoDB Cloud first
      const result = await StorageService.saveInvestorToMongo(record);

      if (result.success) {
        const savedRecord = result.data || record;
        setInvestorRecords(prev => [savedRecord, ...prev]);

        // 2. Clear form only on successful database write
        setInvName('');
        setInvCnic('');
        setInvPhone('');
        setInvVehicles([{
          carNameModel: '', carPlateNumber: '', startDate: todayIso, endDate: todayIso,
          totalDays: 1, payoutAmount: 0, advancePaid: 0, balanceDue: 0, paymentStatus: 'PENDING', notes: ''
        }]);

        // 3. Show verified database success popup
        setShowSuccessModal({
          title: 'New Investor Registered in Database!',
          subtitle: 'Investor record and fleet deposit have been verified and saved to MongoDB Cloud.',
          targetTab: 'investor-directory',
          details: [
            { label: 'Investor Name', value: record.name },
            { label: 'CNIC Number', value: record.cnic },
            { label: 'Contact Phone', value: record.phone || 'N/A' },
            { label: 'Registered Vehicles', value: `${record.vehicles.length} Vehicle(s) (${record.vehicles.map(v => `${v.carNameModel} [${v.carPlateNumber}]`).join(', ')})` },
            { label: 'Database Status', value: 'Saved & Verified in MongoDB' }
          ]
        });

        showNotification('New Investor successfully saved to Cloud Database!', 'success');
        refreshAllData().catch(() => {});
      } else {
        showNotification(`Database Error: Could not save Investor. ${result.error || 'Check database connection.'}`, 'error');
      }
    } catch (err: any) {
      showNotification(`Network/Server Error: ${err.message || 'Failed to connect to database.'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Investor Vehicle Payment Status (PENDING <-> PAID FULL)
  const handleToggleInvestorPaymentStatus = async (investorId: string, vehicleIdx: number) => {
    const inv = investorRecords.find(r => (r._id || r.id) === investorId);
    if (!inv) return;

    const updatedVehicles = [...inv.vehicles];
    const current = updatedVehicles[vehicleIdx];
    const newStatus = current.paymentStatus === 'PAID_FULL' ? 'PENDING' : 'PAID_FULL';

    updatedVehicles[vehicleIdx] = {
      ...current,
      paymentStatus: newStatus,
      balanceDue: newStatus === 'PAID_FULL' ? 0 : Math.max(0, current.payoutAmount - (current.advancePaid || 0))
    };

    const updatedInv = { ...inv, vehicles: updatedVehicles };
    const res = await StorageService.updateInvestorToMongo(investorId, updatedInv);
    if (res.success) {
      await refreshAllData();
      showNotification(`Payment status for ${current.carPlateNumber} marked as ${newStatus === 'PAID_FULL' ? 'PAID IN FULL' : 'PENDING'} in Database.`, 'success');
    } else {
      showNotification(`Database Error: Failed to update payment status. ${res.error || ''}`, 'error');
    }
  };

  const handleDeleteInvestor = async (id: string, name: string) => {
    if (window.confirm(`Delete investor record for "${name}" from MongoDB Cloud?`)) {
      if (id) {
        const success = await StorageService.deleteInvestorFromMongo(id);
        if (success) {
          await refreshAllData();
          showNotification(`Investor record "${name}" deleted from Database.`, 'success');
        } else {
          showNotification(`Database Error: Failed to delete investor "${name}".`, 'error');
        }
      }
    }
  };

  // --- CUSTOMER RENTAL HANDLERS ---
  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!custName.trim() || !custCnic.trim()) {
      showNotification('Please fill in Customer Name and CNIC.', 'error');
      return;
    }

    if (!custCarPlateNumber.trim() || !custCarNameModel.trim()) {
      showNotification('Please select a registered vehicle from the Investor Fleet.', 'error');
      return;
    }

    const isCarInInvestorFleet = investorFleetVehicles.some(
      v => v.plate.toUpperCase() === custCarPlateNumber.trim().toUpperCase()
    );

    if (!isCarInInvestorFleet && investorFleetVehicles.length > 0) {
      showNotification(`Vehicle [${custCarPlateNumber}] is not registered by any Investor! Please select a vehicle from the Investor Fleet.`, 'error');
      return;
    }

    const numTotal = parseFloat(custTotalPrice) || 0;
    const numAdv = parseFloat(custAdvancePaid) || 0;
    const numBal = Math.max(0, numTotal - numAdv);

    const record: CustomerRentalRecord = {
      id: `rent-${Date.now()}`,
      customerName: custName.trim(),
      customerCnic: custCnic.trim(),
      customerPhone: custPhone.trim(),
      carNameModel: custCarNameModel.trim(),
      carPlateNumber: custCarPlateNumber.trim().toUpperCase(),
      startDate: custStartDate,
      endDate: custEndDate,
      totalDays: calculatedCustDays,
      totalPrice: numTotal,
      advancePaid: numAdv,
      balanceDue: numBal,
      paymentStatus: numBal === 0 && numTotal > 0 ? 'PAID_FULL' : 'PENDING',
      notes: custNotes.trim(),
      createdAt: new Date().toISOString()
    };

    setIsSaving(true);
    try {
      // 1. Save to MongoDB Cloud first
      const result = await StorageService.saveCustomerRentalToMongo(record);

      if (result.success) {
        const savedRental = result.data || record;
        setCustomerRentals(prev => [savedRental, ...prev]);

        // 2. Clear form only on success
        setCustName(''); setCustCnic(''); setCustPhone('');
        setCustCarNameModel(''); setCustCarPlateNumber('');
        setCustStartDate(todayIso); setCustEndDate(todayIso);
        setCustTotalPrice(''); setCustAdvancePaid(''); setCustNotes('');

        // 3. Show verified database success popup
        setShowSuccessModal({
          title: 'Customer Rental Booking Saved in Database!',
          subtitle: 'Vehicle rental agreement and customer balance ledger have been verified and saved to MongoDB Cloud.',
          targetTab: 'customer-directory',
          details: [
            { label: 'Customer Name', value: record.customerName },
            { label: 'CNIC Number', value: record.customerCnic },
            { label: 'Vehicle Rented', value: `${record.carNameModel} [${record.carPlateNumber}]` },
            { label: 'Total Rent / Balance Due', value: `Rs. ${record.totalPrice.toLocaleString()} (Due: Rs. ${record.balanceDue.toLocaleString()})` },
            { label: 'Database Status', value: 'Saved & Verified in MongoDB' }
          ]
        });

        showNotification('Customer Booking recorded successfully in Cloud Database!', 'success');
        refreshAllData().catch(() => {});
      } else {
        showNotification(`Database Error: Could not save Booking. ${result.error || 'Check database connection.'}`, 'error');
      }
    } catch (err: any) {
      showNotification(`Network/Server Error: ${err.message || 'Failed to connect to database.'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Customer Rental Payment Status (PENDING <-> PAID FULL)
  const handleToggleCustomerPaymentStatus = async (rentalId: string) => {
    const rent = customerRentals.find(r => (r._id || r.id) === rentalId);
    if (!rent) return;

    const newStatus = rent.paymentStatus === 'PAID_FULL' ? 'PENDING' : 'PAID_FULL';
    const updatedRent: CustomerRentalRecord = {
      ...rent,
      paymentStatus: newStatus,
      balanceDue: newStatus === 'PAID_FULL' ? 0 : Math.max(0, rent.totalPrice - rent.advancePaid)
    };

    const res = await StorageService.updateCustomerRentalToMongo(rentalId, updatedRent);
    if (res.success) {
      await refreshAllData();
      showNotification(`Payment status for customer ${rent.customerName} marked as ${newStatus === 'PAID_FULL' ? 'PAID IN FULL' : 'PENDING'} in Database.`, 'success');
    } else {
      showNotification(`Database Error: Failed to update payment status. ${res.error || ''}`, 'error');
    }
  };

  const handleDeleteCustomerRental = async (id: string, name: string, plate: string) => {
    if (window.confirm(`Delete customer rental booking for "${name}" (${plate})?`)) {
      if (id) {
        const success = await StorageService.deleteCustomerRentalFromMongo(id);
        if (success) {
          await refreshAllData();
          showNotification(`Customer rental record for "${name}" deleted from Database.`, 'success');
        } else {
          showNotification(`Database Error: Failed to delete rental record for "${name}".`, 'error');
        }
      }
    }
  };

  // --- MAINTENANCE HANDLERS ---
  const handleSelectVehicleForMaint = (plate: string) => {
    const found = allFleetVehicles.find(v => v.plate === plate);
    setMaintSelectedPlate(plate);
    if (found) {
      setMaintCarNameModel(found.model);
    }
  };

  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!maintSelectedPlate.trim()) {
      showNotification('Please select or enter a Vehicle Plate Number.', 'error');
      return;
    }

    if (maintServiceType === 'Other Repair (Custom Detail)' && !maintCustomServiceType.trim()) {
      showNotification('Please enter the custom repair detail for "Other Repair".', 'error');
      return;
    }

    const finalServiceType = maintServiceType === 'Other Repair (Custom Detail)' 
      ? `Other: ${maintCustomServiceType.trim()}`
      : maintServiceType;

    const log: VehicleMaintenanceLog = {
      id: `maint-${Date.now()}`,
      carPlateNumber: maintSelectedPlate.trim().toUpperCase(),
      carNameModel: maintCarNameModel.trim() || 'Vehicle',
      serviceType: finalServiceType,
      customServiceType: maintCustomServiceType.trim(),
      serviceDate: maintServiceDate,
      cost: parseFloat(maintCost) || 0,
      vendorName: maintVendorName.trim(),
      odometer: parseFloat(maintOdometer) || 0,
      description: maintDescription.trim(),
      createdAt: new Date().toISOString()
    };

    setIsSaving(true);
    try {
      // 1. Save to MongoDB Cloud first
      const result = await StorageService.saveMaintenanceToMongo(log);

      if (result.success) {
        const savedLog = result.data || log;
        setMaintenanceLogs(prev => [savedLog, ...prev]);

        // 2. Clear form only on success
        setMaintSelectedPlate(''); setMaintCarNameModel('');
        setMaintServiceType('Oil & Filters Change'); setMaintCustomServiceType('');
        setMaintServiceDate(todayIso); setMaintCost('');
        setMaintVendorName(''); setMaintOdometer(''); setMaintDescription('');

        // 3. Show verified database success popup
        setShowSuccessModal({
          title: 'Vehicle Maintenance Log Saved in Database!',
          subtitle: 'Maintenance expense and service details have been verified and saved to MongoDB Cloud.',
          targetTab: 'maintenance-directory',
          details: [
            { label: 'Vehicle Plate', value: log.carPlateNumber },
            { label: 'Service Category', value: log.serviceType },
            { label: 'Total Expense Cost', value: `Rs. ${log.cost.toLocaleString()}` },
            { label: 'Workshop Vendor', value: log.vendorName || 'N/A' },
            { label: 'Database Status', value: 'Saved & Verified in MongoDB' }
          ]
        });

        showNotification('Maintenance log successfully saved to Cloud Database!', 'success');
        refreshAllData().catch(() => {});
      } else {
        showNotification(`Database Error: Could not save Maintenance Log. ${result.error || 'Check database connection.'}`, 'error');
      }
    } catch (err: any) {
      showNotification(`Network/Server Error: ${err.message || 'Failed to connect to database.'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };


  const handleDeleteMaintenanceLog = async (id: string, plate: string, service: string) => {
    if (window.confirm(`Delete maintenance log for "${plate}" (${service})?`)) {
      if (id) {
        const success = await StorageService.deleteMaintenanceFromMongo(id);
        if (success) {
          await refreshAllData();
          showNotification(`Maintenance log for "${plate}" deleted from Database.`, 'success');
        } else {
          showNotification(`Database Error: Failed to delete maintenance log.`, 'error');
        }
      }
    }
  };

  // --- EDIT MODAL SAVE HANDLER ---
  const handleSaveEditModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModal) return;

    const { type, data } = editingModal;
    const id = data._id || data.id;

    setIsSaving(true);
    try {
      const syncPromise =
        type === 'investor'    ? StorageService.updateInvestorToMongo(id, data) :
        type === 'customer'    ? StorageService.updateCustomerRentalToMongo(id, data) :
                                 StorageService.updateMaintenanceToMongo(id, data);

      const result = await syncPromise;

      if (result.success) {
        // Close modal on verified success
        setEditingModal(null);

        // Update local state
        if (type === 'investor') {
          setInvestorRecords(prev => prev.map(r => (r._id || r.id) === id ? { ...r, ...data } : r));
          showNotification(`Investor "${data.name}" updated successfully in Database!`, 'success');
        } else if (type === 'customer') {
          setCustomerRentals(prev => prev.map(r => (r._id || r.id) === id ? { ...r, ...data } : r));
          showNotification(`Customer Rental for "${data.customerName}" updated successfully in Database!`, 'success');
        } else if (type === 'maintenance') {
          setMaintenanceLogs(prev => prev.map(r => (r._id || r.id) === id ? { ...r, ...data } : r));
          showNotification(`Maintenance record for "${data.carPlateNumber}" updated successfully in Database!`, 'success');
        }

        await refreshAllData();
      } else {
        showNotification(`Database Error: Could not update record. ${result.error || 'Check database connection.'}`, 'error');
      }
    } catch (err: any) {
      showNotification(`Network/Server Error: ${err.message || 'Failed to save changes to database.'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // --- DATABASE BACKUP & RESTORE HANDLERS ---
  const handleExportBackup = async () => {
    showNotification('Preparing full database backup...', 'success');
    const res = await StorageService.downloadDatabaseBackupFile();
    if (res.success) {
      showNotification(`Database Backup Exported: ${res.filename}`, 'success');
    } else {
      showNotification(`Failed to export backup: ${res.error}`, 'error');
    }
  };

  const handleRestoreFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmRestore = window.confirm(
      `WARNING: Restoring from backup file "${file.name}" will overwrite current MongoDB records with this backup file data. Are you sure you want to proceed?`
    );
    if (!confirmRestore) {
      e.target.value = '';
      return;
    }

    try {
      setBackupRestoreLoading(true);
      const text = await file.text();
      const res = await StorageService.restoreDatabaseBackupFile(text);
      if (res.success) {
        await refreshAllData();
        setShowBackupModal(false);
        showNotification(
          `Database Restored Successfully! (${res.counts?.investors || 0} Investors, ${res.counts?.customerRentals || 0} Rentals, ${res.counts?.maintenanceLogs || 0} Maintenance Logs)`,
          'success'
        );
      } else {
        showNotification(`Restore Error: ${res.error}`, 'error');
      }
    } catch (err: any) {
      showNotification(`Failed to read backup file: ${err.message}`, 'error');
    } finally {
      setBackupRestoreLoading(false);
      e.target.value = '';
    }
  };

  // --- FILTERED DIRECTORIES ---

  const filteredInvestors = useMemo(() => {
    const q = invSearchTerm.toLowerCase().trim();
    if (!q) return investorRecords;
    return investorRecords.filter(r => 
      r.name.toLowerCase().includes(q) || 
      r.cnic.toLowerCase().includes(q) ||
      (r.vehicles && r.vehicles.some(v => v.carNameModel.toLowerCase().includes(q) || v.carPlateNumber.toLowerCase().includes(q)))
    );
  }, [investorRecords, invSearchTerm]);

  const filteredCustomerRentals = useMemo(() => {
    const q = custSearchTerm.toLowerCase().trim();
    if (!q) return customerRentals;
    return customerRentals.filter(r =>
      r.customerName.toLowerCase().includes(q) ||
      r.customerCnic.toLowerCase().includes(q) ||
      r.carPlateNumber.toLowerCase().includes(q) ||
      r.carNameModel.toLowerCase().includes(q)
    );
  }, [customerRentals, custSearchTerm]);

  const filteredMaintenanceLogs = useMemo(() => {
    const q = maintSearchTerm.toLowerCase().trim();
    if (!q) return maintenanceLogs;
    return maintenanceLogs.filter(m =>
      m.carPlateNumber.toLowerCase().includes(q) ||
      m.carNameModel.toLowerCase().includes(q) ||
      m.serviceType.toLowerCase().includes(q) ||
      (m.vendorName && m.vendorName.toLowerCase().includes(q)) ||
      (m.description && m.description.toLowerCase().includes(q))
    );
  }, [maintenanceLogs, maintSearchTerm]);

  // --- AGENDA CALCULATIONS (DUE PAYABLES & RECEIVABLES) ---
  const agendaData = useMemo(() => {
    // Local date calculation without timezone skew
    const parseYMD = (dateStr: string) => {
      if (!dateStr) return null;
      const parts = dateStr.split('-');
      if (parts.length !== 3) return new Date(dateStr);
      const [y, m, d] = parts.map(Number);
      return new Date(y, m - 1, d, 0, 0, 0, 0);
    };

    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    let maxDays = 0;
    if (agendaTimeframe === 'today') maxDays = 0;
    if (agendaTimeframe === '2days') maxDays = 2;
    if (agendaTimeframe === '5days') maxDays = 5;
    if (agendaTimeframe === 'week') maxDays = 7;
    if (agendaTimeframe === 'all') maxDays = 999999;

    const maxDate = new Date(todayMidnight);
    maxDate.setDate(maxDate.getDate() + maxDays);
    maxDate.setHours(23, 59, 59, 999);

    // Payables to Investors (Agreement end date or pending payment due within range)
    const payables: {
      type: 'PAYABLE_INVESTOR';
      name: string;
      cnic: string;
      phone: string;
      carPlate: string;
      carModel: string;
      dueDate: string;
      amountDue: number;
      advancePaid: number;
      status: string;
    }[] = [];

    investorRecords.forEach(inv => {
      if (inv.vehicles) {
        inv.vehicles.forEach(v => {
          // SKIP PAID_FULL — they have no balance due, don't show in ledger
          if (v.paymentStatus === 'PAID_FULL') return;
          const bal = v.balanceDue !== undefined ? v.balanceDue : Math.max(0, v.payoutAmount - (v.advancePaid || 0));
          if (bal <= 0) return; // no balance due, skip

          const endDateObj = parseYMD(v.endDate);
          // If timeframe is 'all' OR due date is on/before maxDate (due today, overdue, or in window)
          if (agendaTimeframe === 'all' || (endDateObj && endDateObj <= maxDate)) {
            payables.push({
              type: 'PAYABLE_INVESTOR',
              name: inv.name,
              cnic: inv.cnic,
              phone: inv.phone || 'N/A',
              carPlate: v.carPlateNumber,
              carModel: v.carNameModel,
              dueDate: v.endDate,
              amountDue: bal,
              advancePaid: v.advancePaid || 0,
              status: v.paymentStatus || 'PENDING'
            });
          }
        });
      }
    });

    // Receivables from Customers (Rental end date or pending balance due within range)
    const receivables: {
      type: 'RECEIVABLE_CUSTOMER';
      name: string;
      cnic: string;
      phone: string;
      carPlate: string;
      carModel: string;
      dueDate: string;
      amountDue: number;
      advancePaid: number;
      status: string;
    }[] = [];

    customerRentals.forEach(cr => {
      // SKIP PAID_FULL — they have no balance due, don't show in ledger
      if (cr.paymentStatus === 'PAID_FULL') return;
      const bal = cr.balanceDue !== undefined ? cr.balanceDue : Math.max(0, cr.totalPrice - cr.advancePaid);
      if (bal <= 0) return; // no balance due, skip

      const endDateObj = parseYMD(cr.endDate);
      // If timeframe is 'all' OR return date is on/before maxDate (due today, overdue, or in window)
      if (agendaTimeframe === 'all' || (endDateObj && endDateObj <= maxDate)) {
        receivables.push({
          type: 'RECEIVABLE_CUSTOMER',
          name: cr.customerName,
          cnic: cr.customerCnic,
          phone: cr.customerPhone || 'N/A',
          carPlate: cr.carPlateNumber,
          carModel: cr.carNameModel,
          dueDate: cr.endDate,
          amountDue: bal,
          advancePaid: cr.advancePaid || 0,
          status: cr.paymentStatus || 'PENDING'
        });
      }
    });

    return { payables, receivables };
  }, [investorRecords, customerRentals, agendaTimeframe]);


  // --- 360-DEGREE VEHICLE PROFILE DATA ---
  const lookupVehicleProfile = useMemo(() => {
    if (!selectedLookupPlate) return null;
    const cleanPlate = selectedLookupPlate.trim().toUpperCase();

    // 1. Owner Investor
    let ownerInvestor: { investor: InvestorRecord; vehicle: VehicleItem } | null = null;
    for (const inv of investorRecords) {
      if (inv.vehicles) {
        const v = inv.vehicles.find(item => item.carPlateNumber.trim().toUpperCase() === cleanPlate);
        if (v) {
          ownerInvestor = { investor: inv, vehicle: v };
          break;
        }
      }
    }

    // 2. Customer Rental History
    const rentals = customerRentals.filter(cr => cr.carPlateNumber.trim().toUpperCase() === cleanPlate);

    // 3. Maintenance Timeline
    const maints = maintenanceLogs.filter(m => m.carPlateNumber.trim().toUpperCase() === cleanPlate);

    // 4. Financial Cashflow Calculation
    const totalRentCollected = rentals.reduce((s, r) => s + (r.totalPrice || 0), 0);
    const investorPayout = ownerInvestor ? (ownerInvestor.vehicle.payoutAmount || 0) : 0;
    const totalMaintenanceCost = maints.reduce((s, m) => s + (m.cost || 0), 0);
    const netProfit = totalRentCollected - (investorPayout + totalMaintenanceCost);

    return {
      plate: cleanPlate,
      ownerInvestor,
      rentals,
      maints,
      totalRentCollected,
      investorPayout,
      totalMaintenanceCost,
      netProfit
    };
  }, [selectedLookupPlate, investorRecords, customerRentals, maintenanceLogs]);

  // --- INDIVIDUAL ACCOUNT PROFILES ---
  const selectedInvestorProfile = useMemo(() => {
    if (!selectedInvestorProfileId) return null;
    return investorRecords.find(r => (r._id || r.id) === selectedInvestorProfileId) || null;
  }, [selectedInvestorProfileId, investorRecords]);

  const selectedCustomerProfile = useMemo(() => {
    if (!selectedCustomerProfileId) return null;
    return customerRentals.find(r => (r._id || r.id) === selectedCustomerProfileId) || null;
  }, [selectedCustomerProfileId, customerRentals]);

  // Aggregate Summaries
  const totalInvestorVehicles = useMemo(() => {
    return filteredInvestors.reduce((sum, r) => sum + (r.vehicles ? r.vehicles.length : 0), 0);
  }, [filteredInvestors]);

  const totalInvestorPayoutSum = useMemo(() => {
    return filteredInvestors.reduce((sum, r) => {
      const vSum = r.vehicles ? r.vehicles.reduce((vs, v) => vs + (v.payoutAmount || 0), 0) : 0;
      return sum + vSum;
    }, 0);
  }, [filteredInvestors]);

  const totalCustomerRevenueSum = useMemo(() => {
    return filteredCustomerRentals.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
  }, [filteredCustomerRentals]);

  const totalCustomerBalanceDueSum = useMemo(() => {
    return filteredCustomerRentals
      .filter(r => r.paymentStatus !== 'PAID_FULL')
      .reduce((sum, r) => sum + (r.balanceDue || 0), 0);
  }, [filteredCustomerRentals]);

  const totalMaintenanceExpenseSum = useMemo(() => {
    return filteredMaintenanceLogs.reduce((sum, m) => sum + (m.cost || 0), 0);
  }, [filteredMaintenanceLogs]);

  return (
    <div className="relative min-h-screen text-slate-900 font-serif antialiased p-4 md:p-8">
      {/* Executive Rent-A-Car Atmosphere */}
      <div className="luxury-bg-wrapper" />
      <div className="luxury-bg-overlay" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-6 font-serif">

        {/* Global Notification Banner */}
        {notification && (
          <div className={`p-4 rounded-xl border text-xs font-bold font-serif ${
            notification.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}>
            {notification.message}
          </div>
        )}

        {/* VIEW MODE 1: EXECUTIVE LANDING PAGE - NO WHITE CARDS, DIRECT ON 8K BG IMAGE */}
        {viewMode === 'landing' && (
          <div className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-6 animate-fade-in font-serif px-4 py-12">
            
            {/* Crystal Clear 3D Brand App Icon */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 to-amber-200/30 rounded-3xl blur-lg opacity-70 group-hover:opacity-100 transition duration-500"></div>
              <img
                src="/app-icon.png"
                alt="Al-Falah Luxury App Icon"
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl shadow-2xl border border-amber-400/40 object-cover transform transition duration-300 hover:scale-105"
              />
            </div>

            <div className="space-y-4 max-w-3xl font-serif">
              <div className="text-xs uppercase tracking-widest text-slate-300 font-bold font-serif bg-slate-950/60 px-4 py-1.5 rounded-full inline-block border border-slate-700/60 backdrop-blur-md">
                Al-Falah Rent A Car Portal
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight font-serif drop-shadow-2xl">
                Al-Falah Rent A Car Software
              </h1>
              
              <p className="text-base sm:text-lg text-slate-200 font-serif leading-relaxed max-w-2xl mx-auto drop-shadow-lg font-medium">
                Enterprise Fleet Intake, Customer Bookings, Maintenance Logs & Complete Financial Ledger Accounting
              </p>
            </div>

            <div className="pt-2 font-serif">
              <button
                onClick={() => setShowLoginModal(true)}
                className="btn-executive px-10 py-4 bg-slate-900/90 text-white border border-slate-700 font-bold text-base rounded-xl hover:bg-slate-900 transition duration-200 font-serif shadow-2xl backdrop-blur-md"
              >
                Access System Management Portal
              </button>
            </div>

          </div>
        )}

        {/* ADMIN LOGIN SECURITY MODAL */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm font-serif animate-fade-in">
            <div className="bg-white border border-slate-300 w-full max-w-md p-6 rounded-xl shadow-2xl space-y-6 font-serif">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between font-serif">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-serif">
                    System Administrator Login
                  </h3>
                  <p className="text-xs text-slate-500 font-serif">
                    Enter your verified administrator credentials to unlock portal.
                  </p>
                </div>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-xs border border-slate-200 px-2 py-1 rounded font-serif"
                >
                  ✕
                </button>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg font-serif">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-serif">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 font-serif">
                    Admin Username *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter admin username"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full custom-input font-bold font-serif"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 font-serif">
                    Admin Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full custom-input font-bold font-serif"
                  />
                </div>


                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 font-serif">
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded hover:bg-slate-200 font-serif"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded hover:bg-slate-800 font-serif shadow-sm"
                  >
                    Unlock Portal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW MODE 2: AUTHENTICATED SYSTEM PORTAL */}
        {viewMode === 'authenticated' && (
          <>
            {/* Top Header Banner */}
            <header className="glass-panel p-6 rounded-xl font-serif">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 font-serif">
                <div className="flex items-center gap-4">
                  <img
                    src="/app-icon.png"
                    alt="Al-Falah App Icon"
                    className="w-14 h-14 rounded-xl shadow-md border border-amber-400/30 object-cover shrink-0"
                  />
                  <div>
                    <div className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-0.5 font-serif">
                      Al-Falah Rent A Car System
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 font-serif">
                      Al-Falah Rent A Car - Enterprise Fleet, Rentals & Financial Ledger Portal
                    </h1>
                    <p className="text-xs text-slate-600 mt-0.5 font-serif">
                      Full Financial Accounting, Multi-Vehicle Intake, Customer Rentals, Maintenance Logs & 360° History
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start md:self-center font-serif">
                  <button
                    onClick={handleExportBackup}
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded font-serif shadow-xs transition"
                  >
                    Export Backup File
                  </button>

                  <button
                    onClick={() => setShowBackupModal(true)}
                    className="px-3 py-1.5 bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs rounded font-serif shadow-xs transition"
                  >
                    Database Backup & Restore
                  </button>

                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200 font-bold text-xs rounded font-serif transition"
                  >
                    Lock System / Logout
                  </button>
                </div>
              </div>


              {/* Navigation Bar - 6 MAIN TABS */}
              <nav className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-200 text-xs font-serif">
                
                {/* Investor Fleet Module */}
                <div className="flex items-center gap-1 bg-[#faf9f5] p-1 border border-slate-300 rounded-lg font-serif">
                  <button
                    onClick={() => setActiveTab('investor-register')}
                    className={`nav-tab-btn px-3 py-1.5 rounded font-bold transition font-serif ${
                      activeTab === 'investor-register' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    + Register Investor
                  </button>

                  <button
                    onClick={() => setActiveTab('investor-directory')}
                    className={`nav-tab-btn px-3 py-1.5 rounded font-bold transition font-serif ${
                      activeTab === 'investor-directory' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    Investor Directory ({investorRecords.length})
                  </button>
                </div>

                <div className="h-6 w-px bg-slate-300 hidden sm:block" />

                {/* Customer Rentals Module */}
                <div className="flex items-center gap-1 bg-[#faf9f5] p-1 border border-slate-300 rounded-lg font-serif">
                  <button
                    onClick={() => setActiveTab('customer-register')}
                    className={`nav-tab-btn px-3 py-1.5 rounded font-bold transition font-serif ${
                      activeTab === 'customer-register' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    + Rent Out Car
                  </button>

                  <button
                    onClick={() => setActiveTab('customer-directory')}
                    className={`nav-tab-btn px-3 py-1.5 rounded font-bold transition font-serif ${
                      activeTab === 'customer-directory' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    Customer Directory ({customerRentals.length})
                  </button>
                </div>

                <div className="h-6 w-px bg-slate-300 hidden sm:block" />

                {/* Vehicle Maintenance Module */}
                <div className="flex items-center gap-1 bg-[#faf9f5] p-1 border border-slate-300 rounded-lg font-serif">
                  <button
                    onClick={() => setActiveTab('maintenance-register')}
                    className={`nav-tab-btn px-3 py-1.5 rounded font-bold transition font-serif ${
                      activeTab === 'maintenance-register' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    + Log Maintenance
                  </button>

                  <button
                    onClick={() => setActiveTab('maintenance-directory')}
                    className={`nav-tab-btn px-3 py-1.5 rounded font-bold transition font-serif ${
                      activeTab === 'maintenance-directory' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    Maintenance Directory ({maintenanceLogs.length})
                  </button>
                </div>

                <div className="h-6 w-px bg-slate-300 hidden sm:block" />

                {/* Advanced Dashboards: Agenda & 360 Vehicle Search & Accounts */}
                <button
                  onClick={() => setActiveTab('agenda')}
                  className={`nav-tab-btn px-3 py-1.5 rounded-lg border font-bold transition font-serif ${
                    activeTab === 'agenda' ? 'bg-amber-900 text-white border-amber-900' : 'bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100'
                  }`}
                >
                  Financial Payment Agenda
                </button>

                <button
                  onClick={() => setActiveTab('vehicle-360')}
                  className={`nav-tab-btn px-3 py-1.5 rounded-lg border font-bold transition font-serif ${
                    activeTab === 'vehicle-360' ? 'bg-indigo-900 text-white border-indigo-900' : 'bg-indigo-50 border-indigo-300 text-indigo-950 hover:bg-indigo-100'
                  }`}
                >
                  360° Vehicle History Search
                </button>

                <button
                  onClick={() => setActiveTab('investor-profile')}
                  className={`nav-tab-btn px-3 py-1.5 rounded-lg border font-bold transition font-serif ${
                    activeTab === 'investor-profile' || activeTab === 'customer-profile' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 border-slate-300 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Account Profile Ledgers
                </button>

              </nav>
            </header>



        {/* Global Notification Banner */}
        {notification && (
          <div className={`p-4 rounded-xl border text-xs font-bold font-serif ${
            notification.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}>
            {notification.message}
          </div>
        )}

        {/* TAB 1: INVESTOR INTAKE FORM */}
        {activeTab === 'investor-register' && (
          <main className="glass-panel p-6 rounded-xl space-y-6 font-serif animate-fade-in">
            <div className="border-b border-slate-200 pb-3 font-serif">
              <h2 className="text-lg font-bold text-slate-900 font-serif">
                1. Register Investor & Deposited Vehicles (Fleet Intake)
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 font-serif">
                Enter investor credentials, deposited vehicles, agreement dates, total agreed payout, advance amount paid, and remaining due.
              </p>
            </div>

            <form onSubmit={handleInvestorSubmit} className="space-y-6 text-xs font-serif">
              
              {/* Investor Personal Details */}
              <div className="p-5 bg-slate-50 border border-slate-300 rounded-xl shadow-sm space-y-4 font-serif">
                <div className="flex items-center gap-2.5 border-b border-slate-200 pb-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-[11px] shadow-sm">
                    A
                  </span>
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide font-serif">
                    Investor Identification Credentials
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-serif">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 font-serif">
                      Investor Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chaudhry Tariq Mahmood"
                      value={invName}
                      onChange={(e) => setInvName(e.target.value)}
                      className="w-full custom-input font-bold font-serif"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1 font-serif">
                      Investor CNIC Number * (Unique Key)
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={15}
                      placeholder="e.g. 35202-8765432-1"
                      value={invCnic}
                      onChange={(e) => setInvCnic(formatCnicInput(e.target.value))}
                      className="w-full custom-input font-bold font-serif"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1 font-serif">
                      Contact Phone Number
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="e.g. 0300-8451234"
                      value={invPhone}
                      onChange={(e) => setInvPhone(formatPhoneInput(e.target.value))}
                      className="w-full custom-input font-bold font-serif"
                    />
                  </div>

                </div>
              </div>

              {/* Multi-Vehicle Array */}
              <div className="p-5 bg-slate-50 border border-slate-300 rounded-xl shadow-sm space-y-5 font-serif">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 font-serif">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-[11px] shadow-sm">
                      B
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide font-serif">
                      Deposited Vehicles ({invVehicles.length} Vehicle{invVehicles.length > 1 ? 's' : ''})
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddInvVehicle}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs shadow-sm transition font-serif flex items-center gap-1.5"
                  >
                    <span>+</span> Add Another Vehicle
                  </button>
                </div>

                {invVehicles.map((v, index) => (
                  <div key={index} className="p-5 bg-white border-2 border-indigo-200/90 rounded-xl shadow-sm space-y-4 font-serif hover:border-indigo-300 transition-all">
                    <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5 font-serif">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-900 text-white font-bold text-[11px] uppercase tracking-wider">
                          Vehicle #{index + 1}
                        </span>
                        <span className="font-bold text-slate-800 text-xs uppercase font-serif">
                          Entry Details & Financials
                        </span>
                      </div>

                      {invVehicles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveInvVehicle(index)}
                          className="text-xs font-bold text-rose-800 hover:bg-rose-100 bg-rose-50 px-3 py-1 border border-rose-200 rounded-md font-serif transition"
                        >
                          Remove Vehicle #{index + 1}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-serif">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1 font-serif">
                          Vehicle Make & Model Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Toyota Corolla Altis Grande"
                          value={v.carNameModel}
                          onChange={(e) => handleInvVehicleChange(index, 'carNameModel', e.target.value)}
                          className="w-full custom-input font-bold font-serif"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1 font-serif">
                          Vehicle Plate / Registration Number *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. LEA-2024-88"
                          value={v.carPlateNumber}
                          onChange={(e) => handleInvVehicleChange(index, 'carPlateNumber', e.target.value)}
                          className="w-full custom-input font-bold uppercase font-serif"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 font-serif">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1 font-serif">
                          Agreement Start Date (Calendar) *
                        </label>
                        <input
                          type="date"
                          required
                          value={v.startDate}
                          onChange={(e) => handleInvVehicleChange(index, 'startDate', e.target.value)}
                          className="w-full custom-input font-bold font-serif"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1 font-serif">
                          Agreement End Date (Calendar) *
                        </label>
                        <input
                          type="date"
                          required
                          value={v.endDate}
                          onChange={(e) => handleInvVehicleChange(index, 'endDate', e.target.value)}
                          className="w-full custom-input font-bold font-serif"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1 font-serif">
                          Auto Duration (Days)
                        </label>
                        <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-950 font-bold text-xs text-center font-serif shadow-inner">
                          {v.totalDays} Day{v.totalDays > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    {/* Investor Payout & Advance Accounting */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 font-serif">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1 font-serif">
                          Total Agreed Payout (Rs.) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          required
                          placeholder="e.g. 85000"
                          value={v.payoutAmount}
                          onChange={(e) => handleInvVehicleChange(index, 'payoutAmount', e.target.value)}
                          className="w-full custom-input font-bold font-serif text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1 font-serif">
                          Advance Amount Given to Investor (Rs.)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="e.g. 20000 (0 if none)"
                          value={v.advancePaid || 0}
                          onChange={(e) => handleInvVehicleChange(index, 'advancePaid', e.target.value)}
                          className="w-full custom-input font-bold font-serif text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1 font-serif">
                          Remaining Left Due to Investor (Rs.)
                        </label>
                        <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-950 font-bold text-sm text-center font-serif shadow-inner">
                          Rs. {(v.balanceDue !== undefined ? v.balanceDue : Math.max(0, (v.payoutAmount || 0) - (v.advancePaid || 0))).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1 font-serif">
                        Vehicle Remarks / Condition Notes
                      </label>
                      <input
                        type="text"
                        placeholder="Condition or special agreement terms..."
                        value={v.notes || ''}
                        onChange={(e) => handleInvVehicleChange(index, 'notes', e.target.value)}
                        className="w-full custom-input font-serif"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 font-serif">
                <button
                  type="button"
                  onClick={handleAddInvVehicle}
                  className="px-4 py-2 bg-[#faf9f5] border border-slate-300 text-slate-900 hover:bg-slate-100 rounded font-bold text-xs transition font-serif"
                >
                  + Add Another Vehicle To This Investor
                </button>

                <button
                  type="submit"
                  className="px-8 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition active:scale-95 font-serif"
                >
                  Register Investor
                </button>

              </div>

            </form>
          </main>
        )}

        {/* TAB 2: INVESTOR DIRECTORY */}
        {activeTab === 'investor-directory' && (
          <main className="glass-panel p-6 rounded-xl space-y-6 font-serif animate-fade-in">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 font-serif">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-serif">
                  2. Investor Fleet Records Directory & Financial Ledger
                </h2>
                <p className="text-xs text-slate-600 mt-0.5 font-serif">
                  Complete database ledger of all registered investors, advance payouts given, left due balances, and payment status.
                </p>
              </div>

              <div className="w-full md:w-80 font-serif">
                <input
                  type="text"
                  placeholder="Search by CNIC, Investor Name, or Plate..."
                  value={invSearchTerm}
                  onChange={(e) => setInvSearchTerm(e.target.value)}
                  className="w-full custom-input font-bold font-serif"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-serif">
              <div className="p-4 bg-[#faf9f5] border border-slate-200 rounded-lg font-serif">
                <div className="text-xs text-slate-500 font-bold uppercase font-serif">Total Registered Investors</div>
                <div className="text-2xl font-bold text-slate-900 mt-1 font-serif">{filteredInvestors.length} Investors</div>
              </div>

              <div className="p-4 bg-[#faf9f5] border border-slate-200 rounded-lg font-serif">
                <div className="text-xs text-slate-500 font-bold uppercase font-serif">Total Deposited Vehicles</div>
                <div className="text-2xl font-bold text-slate-900 mt-1 font-serif">{totalInvestorVehicles} Vehicles</div>
              </div>

              <div className="p-4 bg-[#faf9f5] border border-slate-200 rounded-lg flex items-center justify-between font-serif">
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase font-serif">Total Agreed Payout</div>
                  <div className="text-xl font-bold text-slate-900 mt-1 font-serif">
                    Rs. {totalInvestorPayoutSum.toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('investor-register')}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 font-serif"
                >
                  + Add New
                </button>
              </div>
            </div>

            {filteredInvestors.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs bg-[#faf9f5] border border-slate-200 rounded-lg font-bold font-serif">
                No investor records found. Click "+ Register Investor" to add one.
              </div>
            ) : (
              <div className="space-y-4 font-serif">
                {filteredInvestors.map((rec) => {
                  const recId = rec._id || rec.id || '';
                  const totalPayout = rec.vehicles 
                    ? rec.vehicles.reduce((sum, v) => sum + (v.payoutAmount || 0), 0)
                    : 0;

                  return (
                    <div 
                      key={recId}
                      className="bg-[#faf9f5] border border-slate-300 rounded-xl p-5 space-y-4 font-serif shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 font-serif">
                        <div>
                          <div className="flex items-center gap-3 flex-wrap font-serif">
                            <h3 className="text-base font-bold text-slate-900 font-serif">{rec.name}</h3>
                            <span className="px-2.5 py-0.5 rounded bg-white border border-slate-300 text-slate-900 font-bold text-xs font-mono">
                              CNIC: {rec.cnic}
                            </span>
                            {rec.phone && (
                              <span className="text-xs text-slate-600 font-serif font-bold">
                                Phone: {rec.phone}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center font-serif">
                          <button
                            onClick={() => {
                              setSelectedInvestorProfileId(recId);
                              setActiveTab('investor-profile');
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded transition font-serif"
                          >
                            View Account Profile
                          </button>

                          <button
                            onClick={() => setEditingModal({ type: 'investor', data: JSON.parse(JSON.stringify(rec)) })}
                            className="px-3 py-1.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded transition font-serif"
                          >
                            Edit Record
                          </button>

                          <button
                            onClick={() => handleDeleteInvestor(recId, rec.name)}
                            className="px-3 py-1.5 text-xs font-bold text-rose-800 hover:bg-rose-100 bg-rose-50 border border-rose-200 rounded transition font-serif"
                          >
                            Delete Record
                          </button>
                        </div>
                      </div>

                      {/* Vehicles Table for Investor */}
                      <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white font-serif">
                        <table className="w-full text-left text-xs text-slate-900 border-collapse font-serif">
                          <thead className="bg-[#faf9f5] border-b border-slate-300 font-bold text-slate-700 font-serif">
                            <tr>
                              <th className="p-2.5 border-r border-slate-200">#</th>
                              <th className="p-2.5 border-r border-slate-200">Vehicle Name & Model</th>
                              <th className="p-2.5 border-r border-slate-200">Plate Number</th>
                              <th className="p-2.5 border-r border-slate-200">Agreement Period</th>
                              <th className="p-2.5 border-r border-slate-200">Total Payout</th>
                              <th className="p-2.5 border-r border-slate-200">Advance Paid</th>
                              <th className="p-2.5 border-r border-slate-200">Left Due</th>
                              <th className="p-2.5 border-r border-slate-200">Status</th>
                              <th className="p-2.5 text-center">Payment Toggle</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 font-serif">
                            {rec.vehicles && rec.vehicles.map((veh, vIdx) => {
                              const adv = veh.advancePaid || 0;
                              const bal = veh.paymentStatus === 'PAID_FULL' ? 0 : (veh.balanceDue !== undefined ? veh.balanceDue : Math.max(0, veh.payoutAmount - adv));
                              const isPaid = veh.paymentStatus === 'PAID_FULL';

                              return (
                                <tr key={vIdx} className="hover:bg-slate-50 transition font-serif">
                                  <td className="p-2.5 border-r border-slate-200 font-bold text-slate-500 text-center font-serif">
                                    {vIdx + 1}
                                  </td>
                                  <td className="p-2.5 border-r border-slate-200 font-bold text-slate-900 font-serif">
                                    {veh.carNameModel}
                                  </td>
                                  <td className="p-2.5 border-r border-slate-200 font-bold uppercase font-mono font-serif">
                                    <button
                                      onClick={() => {
                                        setSelectedLookupPlate(veh.carPlateNumber);
                                        setActiveTab('vehicle-360');
                                      }}
                                      className="underline hover:text-indigo-800 text-left font-serif"
                                    >
                                      {veh.carPlateNumber}
                                    </button>
                                  </td>
                                  <td className="p-2.5 border-r border-slate-200 text-[11px] font-serif">
                                    {veh.startDate} to {veh.endDate} ({veh.totalDays} Days)
                                  </td>
                                  <td className="p-2.5 border-r border-slate-200 font-bold text-slate-900 font-serif">
                                    Rs. {(veh.payoutAmount || 0).toLocaleString()}
                                  </td>
                                  <td className="p-2.5 border-r border-slate-200 font-bold text-emerald-800 font-serif">
                                    Rs. {adv.toLocaleString()}
                                  </td>
                                  <td className="p-2.5 border-r border-slate-200 font-bold text-rose-800 font-serif">
                                    Rs. {bal.toLocaleString()}
                                  </td>
                                  <td className="p-2.5 border-r border-slate-200 font-serif">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-serif ${
                                      isPaid ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                                    }`}>
                                      {isPaid ? 'PAID IN FULL' : 'PENDING DUE'}
                                    </span>
                                  </td>
                                  <td className="p-2.5 text-center font-serif">
                                    <button
                                      onClick={() => handleToggleInvestorPaymentStatus(recId, vIdx)}
                                      className={`px-2.5 py-1 text-[11px] font-bold rounded transition font-serif ${
                                        isPaid ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-emerald-800 hover:bg-emerald-900 text-white'
                                      }`}
                                    >
                                      {isPaid ? 'Paid' : 'Mark Paid'}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </main>
        )}

        {/* TAB 3: CUSTOMER RENTAL FORM */}
        {activeTab === 'customer-register' && (
          <main className="glass-panel p-6 rounded-xl space-y-6 font-serif animate-fade-in">
            <div className="border-b border-slate-200 pb-3 font-serif">
              <h2 className="text-lg font-bold text-slate-900 font-serif">
                3. Book Vehicle Rental for Customer
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 font-serif">
                Enter customer credentials, vehicle rented, rental start/end dates, total price, advance payment received, and balance due.
              </p>
            </div>

            <form onSubmit={handleCustomerSubmit} className="space-y-6 text-xs font-serif">
              
              {/* Section A: Customer Identification */}
              <div className="p-5 bg-slate-50 border border-slate-300 rounded-xl shadow-sm space-y-4 font-serif">
                <div className="flex items-center gap-2.5 border-b border-slate-200 pb-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-[11px] shadow-sm">
                    A
                  </span>
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide font-serif">
                    Customer Identification & Contact
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-serif">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 font-serif">
                      Customer Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hamza Bilal Butt"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full custom-input font-bold font-serif"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1 font-serif">
                      Customer CNIC Number *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={15}
                      placeholder="e.g. 35201-9876543-1"
                      value={custCnic}
                      onChange={(e) => setCustCnic(formatCnicInput(e.target.value))}
                      className="w-full custom-input font-bold font-serif"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1 font-serif">
                      Customer Phone Number
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="e.g. 0321-9988776"
                      value={custPhone}
                      onChange={(e) => setCustPhone(formatPhoneInput(e.target.value))}
                      className="w-full custom-input font-bold font-serif"
                    />
                  </div>

                </div>
              </div>

              {/* Section B: Searchable Investor Fleet Vehicle Picker */}
              <div className="p-5 bg-slate-50 border border-slate-300 rounded-xl shadow-sm space-y-4 font-serif">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 font-serif">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-[11px] shadow-sm">
                      B
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide font-serif">
                      Select Vehicle from Investor Fleet (Mandatory)
                    </h3>
                  </div>

                  <span className="px-2.5 py-0.5 rounded bg-slate-900 text-white font-bold text-[11px] font-serif">
                    {investorFleetVehicles.length} Registered Fleet Vehicle{investorFleetVehicles.length === 1 ? '' : 's'}
                  </span>
                </div>

                {investorFleetVehicles.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-serif space-y-1">
                    <div className="font-bold text-xs text-amber-900">
                      No Vehicles Registered in Investor Fleet
                    </div>
                    <p className="text-amber-800 text-[11px]">
                      To allocate a vehicle to a customer booking, please register the investor and vehicle details first under the Investor Registration tab.
                    </p>
                  </div>
                ) : custCarPlateNumber ? (
                  /* --- 1. SELECTED VEHICLE DISPLAY CARD --- */
                  (() => {
                    const found = investorFleetVehicles.find(v => v.plate === custCarPlateNumber);
                    return (
                      <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 font-serif shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-0.5 bg-slate-800 border border-slate-700 text-emerald-400 font-mono font-bold text-xs rounded tracking-wider">
                              {custCarPlateNumber}
                            </span>
                            <span className="font-bold text-white text-sm">
                              {custCarNameModel || found?.model}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setCustCarPlateNumber('');
                              setCustCarNameModel('');
                            }}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
                          >
                            Change Vehicle
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                          <div className="p-2.5 bg-slate-800/80 border border-slate-700/60 rounded-lg">
                            <span className="text-slate-400 font-medium block text-[11px]">Assigned Investor:</span>
                            <span className="font-bold text-white">{found?.investorName || 'Registered Investor'}</span>
                          </div>
                          <div className="p-2.5 bg-slate-800/80 border border-slate-700/60 rounded-lg">
                            <span className="text-slate-400 font-medium block text-[11px]">Investor CNIC:</span>
                            <span className="font-bold text-white">{found?.investorCnic || 'N/A'}</span>
                          </div>
                          <div className="p-2.5 bg-slate-800/80 border border-slate-700/60 rounded-lg">
                            <span className="text-slate-400 font-medium block text-[11px]">Fleet Status:</span>
                            {found?.isCurrentlyRented ? (
                              <span className="font-bold text-amber-400">
                                Active Rental ({found.currentRentalCustomer})
                              </span>
                            ) : (
                              <span className="font-bold text-emerald-400">
                                Available for Booking
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  /* --- 2. SEARCH & VEHICLE PICKER INTERFACE --- */
                  <div className="space-y-3 font-serif">
                    {/* Search Input & Quick Filter Pills */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Search vehicle by plate, model, or investor name..."
                          value={custCarSearchQuery}
                          onChange={(e) => setCustCarSearchQuery(e.target.value)}
                          className="w-full custom-input font-serif font-medium text-xs pl-3 pr-8"
                        />
                        {custCarSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setCustCarSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 font-bold text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Filter Buttons */}
                      <div className="flex items-center gap-1 text-xs">
                        <button
                          type="button"
                          onClick={() => setCustCarAvailabilityFilter('all')}
                          className={`px-3 py-1.5 rounded-lg font-semibold transition text-xs ${
                            custCarAvailabilityFilter === 'all'
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          All ({investorFleetVehicles.length})
                        </button>

                        <button
                          type="button"
                          onClick={() => setCustCarAvailabilityFilter('available')}
                          className={`px-3 py-1.5 rounded-lg font-semibold transition text-xs ${
                            custCarAvailabilityFilter === 'available'
                              ? 'bg-emerald-800 text-white shadow-xs'
                              : 'bg-white border border-slate-300 text-emerald-800 hover:bg-emerald-50'
                          }`}
                        >
                          Available ({investorFleetVehicles.filter(v => !v.isCurrentlyRented).length})
                        </button>

                        <button
                          type="button"
                          onClick={() => setCustCarAvailabilityFilter('rented')}
                          className={`px-3 py-1.5 rounded-lg font-semibold transition text-xs ${
                            custCarAvailabilityFilter === 'rented'
                              ? 'bg-amber-800 text-white shadow-xs'
                              : 'bg-white border border-slate-300 text-amber-800 hover:bg-amber-50'
                          }`}
                        >
                          On Rent ({investorFleetVehicles.filter(v => v.isCurrentlyRented).length})
                        </button>
                      </div>
                    </div>

                    {/* Scrollable Vehicle Cards List */}
                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {filteredInvestorFleet.length === 0 ? (
                        <div className="p-4 bg-white border border-slate-200 rounded-xl text-center text-slate-500 font-serif text-xs">
                          No registered vehicles match "{custCarSearchQuery}".
                        </div>
                      ) : (
                        filteredInvestorFleet.map((v, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white border border-slate-200 hover:border-slate-400 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded bg-slate-900 text-white font-mono font-semibold text-xs tracking-wider">
                                  {v.plate}
                                </span>
                                <span className="font-bold text-slate-900 text-xs">
                                  {v.model}
                                </span>
                                {v.isCurrentlyRented ? (
                                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">
                                    On Rental
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                                    Available
                                  </span>
                                )}
                              </div>

                              <div className="text-slate-600 text-[11px] flex flex-wrap items-center gap-x-3">
                                <span>
                                  <strong className="text-slate-700">Investor:</strong> {v.investorName} ({v.investorCnic})
                                </span>
                                {v.isCurrentlyRented && (
                                  <span className="text-amber-800 font-medium">
                                    Rented to {v.currentRentalCustomer} ({v.currentRentalDates})
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSelectInvestorCarForRental(v.plate)}
                              className="self-start sm:self-center px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition shadow-xs shrink-0"
                            >
                              Select Vehicle
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Section C: Rental Period & Duration */}
              <div className="p-5 bg-slate-50 border border-slate-300 rounded-xl shadow-sm space-y-4 font-serif">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 font-serif">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-[11px] shadow-sm">
                      C
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide font-serif">
                      Rental Period & Duration
                    </h3>
                  </div>

                  <span className="px-3 py-1 bg-indigo-900 text-white rounded-lg text-xs font-bold font-serif shadow-sm">
                    Auto Duration: {calculatedCustDays} Day{calculatedCustDays > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-serif">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 font-serif">
                      Rental Start Date (Calendar) *
                    </label>
                    <input
                      type="date"
                      required
                      value={custStartDate}
                      onChange={(e) => setCustStartDate(e.target.value)}
                      className="w-full custom-input font-bold font-serif"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1 font-serif">
                      Rental End Date (Calendar) *
                    </label>
                    <input
                      type="date"
                      required
                      value={custEndDate}
                      onChange={(e) => setCustEndDate(e.target.value)}
                      className="w-full custom-input font-bold font-serif"
                    />
                  </div>
                </div>
              </div>

              {/* Section D: Rental Charges & Payment Accounting */}
              <div className="p-5 bg-slate-50 border border-slate-300 rounded-xl shadow-sm space-y-4 font-serif">
                <div className="flex items-center gap-2.5 border-b border-slate-200 pb-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-[11px] shadow-sm">
                    D
                  </span>
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide font-serif">
                    Rental Charges & Payment Accounting (Rs.)
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-serif">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 font-serif">
                      Total Rental Price Charged (Rs.) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      placeholder="e.g. 35000"
                      value={custTotalPrice}
                      onChange={(e) => setCustTotalPrice(e.target.value)}
                      className="w-full custom-input font-bold text-base text-slate-900 font-serif"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1 font-serif">
                      Advance Amount Paid by Customer (Rs.)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="e.g. 15000 (0 if none)"
                      value={custAdvancePaid}
                      onChange={(e) => setCustAdvancePaid(e.target.value)}
                      className="w-full custom-input font-bold text-base text-slate-900 font-serif"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1 font-serif">
                      Auto Balance Due from Customer (Rs.)
                    </label>
                    <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-950 font-bold text-base text-center font-serif shadow-inner">
                      Rs. {calculatedCustBalance.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 font-serif">
                    Rental Condition Notes / Agreement Remarks
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Daily limit 250km, fuel returned full..."
                    value={custNotes}
                    onChange={(e) => setCustNotes(e.target.value)}
                    className="w-full custom-input font-serif"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end pt-2 font-serif">
                <button
                  type="submit"
                  className="px-8 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition active:scale-95 font-serif"
                >
                  Confirm Rental Booking
                </button>

              </div>

            </form>
          </main>
        )}

        {/* TAB 4: CUSTOMER DIRECTORY */}
        {activeTab === 'customer-directory' && (
          <main className="glass-panel p-6 rounded-xl space-y-6 font-serif animate-fade-in">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 font-serif">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-serif">
                  4. Customer Rental Bookings Directory & Financial Ledger
                </h2>
                <p className="text-xs text-slate-600 mt-0.5 font-serif">
                  Complete database ledger of customer bookings, advance payments received, balance dues, and payment toggles.
                </p>
              </div>

              <div className="w-full md:w-80 font-serif">
                <input
                  type="text"
                  placeholder="Search by Customer Name, CNIC, or Plate..."
                  value={custSearchTerm}
                  onChange={(e) => setCustSearchTerm(e.target.value)}
                  className="w-full custom-input font-bold font-serif"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-serif">
              <div className="p-4 bg-[#faf9f5] border border-slate-200 rounded-lg font-serif">
                <div className="text-xs text-slate-500 font-bold uppercase font-serif">Total Customer Rentals</div>
                <div className="text-2xl font-bold text-slate-900 mt-1 font-serif">{filteredCustomerRentals.length} Bookings</div>
              </div>

              <div className="p-4 bg-[#faf9f5] border border-slate-200 rounded-lg font-serif">
                <div className="text-xs text-slate-500 font-bold uppercase font-serif">Total Charged Revenue</div>
                <div className="text-2xl font-bold text-slate-900 mt-1 font-serif">
                  Rs. {totalCustomerRevenueSum.toLocaleString()}
                </div>
              </div>

              <div className="p-4 bg-[#faf9f5] border border-slate-200 rounded-lg flex items-center justify-between font-serif">
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase font-serif">Outstanding Balance Dues</div>
                  <div className="text-xl font-bold text-rose-800 mt-1 font-serif">
                    Rs. {totalCustomerBalanceDueSum.toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('customer-register')}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 font-serif"
                >
                  + Add New
                </button>
              </div>
            </div>

            {filteredCustomerRentals.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs bg-[#faf9f5] border border-slate-200 rounded-lg font-bold font-serif">
                No customer rental bookings found matching your search. Click "+ Rent Out Car" to create one.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-lg font-serif">
                <table className="w-full text-left text-xs text-slate-900 border-collapse font-serif">
                  <thead className="bg-[#faf9f5] border-b border-slate-300 font-bold text-slate-700 font-serif">
                    <tr>
                      <th className="p-3 border-r border-slate-200">#</th>
                      <th className="p-3 border-r border-slate-200">Customer Name</th>
                      <th className="p-3 border-r border-slate-200">CNIC Number</th>
                      <th className="p-3 border-r border-slate-200">Vehicle Rented</th>
                      <th className="p-3 border-r border-slate-200">Plate Number</th>
                      <th className="p-3 border-r border-slate-200">Rental Period</th>
                      <th className="p-3 border-r border-slate-200">Total Price</th>
                      <th className="p-3 border-r border-slate-200">Advance Paid</th>
                      <th className="p-3 border-r border-slate-200">Balance Due</th>
                      <th className="p-3 border-r border-slate-200">Status</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-serif">
                    {filteredCustomerRentals.map((r, index) => {
                      const rId = r._id || r.id || '';
                      const isPaid = r.paymentStatus === 'PAID_FULL';
                      const bal = isPaid ? 0 : (r.balanceDue !== undefined ? r.balanceDue : Math.max(0, r.totalPrice - r.advancePaid));

                      return (
                        <tr key={rId} className="hover:bg-slate-50 transition font-serif">
                          <td className="p-3 border-r border-slate-200 font-bold text-slate-500 text-center font-serif">
                            {index + 1}
                          </td>
                          <td className="p-3 border-r border-slate-200 font-bold text-slate-900 font-serif">
                            <button
                              onClick={() => {
                                setSelectedCustomerProfileId(rId);
                                setActiveTab('customer-profile');
                              }}
                              className="underline hover:text-indigo-900 font-serif text-left"
                            >
                              {r.customerName}
                            </button>
                          </td>
                          <td className="p-3 border-r border-slate-200 font-bold font-mono font-serif">
                            {r.customerCnic}
                          </td>
                          <td className="p-3 border-r border-slate-200 font-bold font-serif">
                            {r.carNameModel}
                          </td>
                          <td className="p-3 border-r border-slate-200 font-bold uppercase font-mono font-serif">
                            <button
                              onClick={() => {
                                setSelectedLookupPlate(r.carPlateNumber);
                                setActiveTab('vehicle-360');
                              }}
                              className="underline hover:text-indigo-800 font-serif text-left"
                            >
                              {r.carPlateNumber}
                            </button>
                          </td>
                          <td className="p-3 border-r border-slate-200 text-[11px] font-serif">
                            {r.startDate} to {r.endDate} ({r.totalDays} Days)
                          </td>
                          <td className="p-3 border-r border-slate-200 font-bold text-slate-900 font-serif">
                            Rs. {(r.totalPrice || 0).toLocaleString()}
                          </td>
                          <td className="p-3 border-r border-slate-200 font-bold text-emerald-800 font-serif">
                            Rs. {(r.advancePaid || 0).toLocaleString()}
                          </td>
                          <td className="p-3 border-r border-slate-200 font-bold text-rose-800 font-serif">
                            Rs. {bal.toLocaleString()}
                          </td>
                          <td className="p-3 border-r border-slate-200 font-serif">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-serif ${
                              isPaid ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}>
                              {isPaid ? 'PAID IN FULL' : 'PENDING DUE'}
                            </span>
                          </td>
                          <td className="p-3 text-center space-x-1 font-serif">
                            <button
                              onClick={() => handleToggleCustomerPaymentStatus(rId)}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded transition font-serif ${
                                isPaid ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-emerald-800 text-white hover:bg-emerald-900'
                              }`}
                            >
                              {isPaid ? 'Paid' : 'Mark Paid'}
                            </button>

                            <button
                              onClick={() => setEditingModal({ type: 'customer', data: JSON.parse(JSON.stringify(r)) })}
                              className="px-2 py-1 text-[11px] font-bold bg-white border border-slate-300 hover:bg-slate-100 text-slate-900 rounded font-serif"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDeleteCustomerRental(rId, r.customerName, r.carPlateNumber)}
                              className="px-2 py-1 text-[11px] font-bold text-rose-800 hover:bg-rose-100 bg-rose-50 border border-rose-200 rounded transition font-serif"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </main>
        )}

        {/* TAB 5: LOG MAINTENANCE FORM */}
        {activeTab === 'maintenance-register' && (
          <main className="glass-panel p-6 rounded-xl space-y-6 font-serif animate-fade-in">
            <div className="border-b border-slate-200 pb-3 font-serif">
              <h2 className="text-lg font-bold text-slate-900 font-serif">
                5. Log Vehicle Maintenance & Repair Expense
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 font-serif">
                Select any registered fleet vehicle, choose predefined maintenance category (or specify custom details under Other), date, and cost incurred.
              </p>
            </div>

            <form onSubmit={handleMaintenanceSubmit} className="space-y-6 text-xs font-serif">
              
              {/* Section A: Select Fleet Vehicle */}
              <div className="p-5 bg-slate-50 border border-slate-300 rounded-xl shadow-sm space-y-4 font-serif">
                <div className="flex items-center gap-2.5 border-b border-slate-200 pb-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-[11px] shadow-sm">
                    A
                  </span>
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide font-serif">
                    Select Fleet Vehicle
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-serif">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 font-serif">
                      Select Registered Vehicle *
                    </label>
                    <select
                      value={maintSelectedPlate}
                      onChange={(e) => handleSelectVehicleForMaint(e.target.value)}
                      className="w-full custom-input font-bold uppercase font-serif"
                    >
                      <option value="">-- Choose Vehicle from Fleet --</option>
                      {allFleetVehicles.map((v, i) => (
                        <option key={i} value={v.plate}>
                          {v.plate} - {v.model}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1 font-serif">
                      Vehicle Plate Number (Or Enter Manual) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. LEA-2024-88"
                      value={maintSelectedPlate}
                      onChange={(e) => setMaintSelectedPlate(e.target.value.toUpperCase())}
                      className="w-full custom-input font-bold uppercase font-serif"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 font-serif">
                    Vehicle Make & Model Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Toyota Corolla Altis Grande"
                    value={maintCarNameModel}
                    onChange={(e) => setMaintCarNameModel(e.target.value)}
                    className="w-full custom-input font-bold font-serif"
                  />
                </div>
              </div>

              {/* Section B: Service Category & Repair Specifications */}
              <div className="p-5 bg-slate-50 border border-slate-300 rounded-xl shadow-sm space-y-4 font-serif">
                <div className="flex items-center gap-2.5 border-b border-slate-200 pb-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-[11px] shadow-sm">
                    B
                  </span>
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide font-serif">
                    Service Category & Repair Specifications
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-serif">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 font-serif">
                      Maintenance / Service Type *
                    </label>
                    <select
                      value={maintServiceType}
                      onChange={(e) => setMaintServiceType(e.target.value)}
                      className="w-full custom-input font-bold font-serif"
                    >
                      {SERVICE_OPTIONS.map((opt, idx) => (
                        <option key={idx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1 font-serif">
                      Service Date (Calendar) *
                    </label>
                    <input
                      type="date"
                      required
                      value={maintServiceDate}
                      onChange={(e) => setMaintServiceDate(e.target.value)}
                      className="w-full custom-input font-bold font-serif"
                    />
                  </div>
                </div>

                {maintServiceType === 'Other Repair (Custom Detail)' && (
                  <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-2 font-serif shadow-sm">
                    <label className="block text-amber-950 font-bold font-serif text-xs">
                      Specify Custom Repair Detail * (Describe work done)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Front Windshield Replacement / Radiator Flush..."
                      value={maintCustomServiceType}
                      onChange={(e) => setMaintCustomServiceType(e.target.value)}
                      className="w-full custom-input font-bold font-serif bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Section C: Maintenance Expense & Workshop Details */}
              <div className="p-5 bg-slate-50 border border-slate-300 rounded-xl shadow-sm space-y-4 font-serif">
                <div className="flex items-center gap-2.5 border-b border-slate-200 pb-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-[11px] shadow-sm">
                    C
                  </span>
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide font-serif">
                    Maintenance Expense & Workshop Details (Rs.)
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-serif">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 font-serif">
                      Total Cost / Kharcha (Rs.) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      placeholder="e.g. 18500"
                      value={maintCost}
                      onChange={(e) => setMaintCost(e.target.value)}
                      className="w-full custom-input font-bold text-base text-slate-900 font-serif"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1 font-serif">
                      Workshop / Mechanic Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Toyota Ravi Motors"
                      value={maintVendorName}
                      onChange={(e) => setMaintVendorName(e.target.value)}
                      className="w-full custom-input font-serif"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1 font-serif">
                      Odometer Reading (KM - Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 45000"
                      value={maintOdometer}
                      onChange={(e) => setMaintOdometer(e.target.value)}
                      className="w-full custom-input font-serif"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 font-serif">
                    Full Work Details & Remarks (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Details of parts changed, oil grade used, mechanic contact, warranty..."
                    value={maintDescription}
                    onChange={(e) => setMaintDescription(e.target.value)}
                    className="w-full custom-input font-serif"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end pt-2 font-serif">
                <button
                  type="submit"
                  className="px-8 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition active:scale-95 font-serif"
                >
                  Save Maintenance Log
                </button>

              </div>

            </form>
          </main>
        )}

        {/* TAB 6: MAINTENANCE DIRECTORY */}
        {activeTab === 'maintenance-directory' && (
          <main className="glass-panel p-6 rounded-xl space-y-6 font-serif animate-fade-in">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 font-serif">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-serif">
                  6. Vehicle Maintenance & Repairs Directory
                </h2>
                <p className="text-xs text-slate-600 mt-0.5 font-serif">
                  Complete database ledger of all maintenance logs, service categories, workshop receipts, and costs incurred.
                </p>
              </div>

              <div className="w-full md:w-80 font-serif">
                <input
                  type="text"
                  placeholder="Search by Plate, Service Type, or Vendor..."
                  value={maintSearchTerm}
                  onChange={(e) => setMaintSearchTerm(e.target.value)}
                  className="w-full custom-input font-bold font-serif"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-serif">
              <div className="p-4 bg-[#faf9f5] border border-slate-200 rounded-lg font-serif">
                <div className="text-xs text-slate-500 font-bold uppercase font-serif">Total Maintenance Logs</div>
                <div className="text-2xl font-bold text-slate-900 mt-1 font-serif">{filteredMaintenanceLogs.length} Records</div>
              </div>

              <div className="p-4 bg-[#faf9f5] border border-slate-200 rounded-lg font-serif">
                <div className="text-xs text-slate-500 font-bold uppercase font-serif">Total Maintenance Expenses</div>
                <div className="text-2xl font-bold text-slate-900 mt-1 font-serif">
                  Rs. {totalMaintenanceExpenseSum.toLocaleString()}
                </div>
              </div>

              <div className="p-4 bg-[#faf9f5] border border-slate-200 rounded-lg flex items-center justify-between font-serif">
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase font-serif">Fleet Maintenance Status</div>
                  <div className="text-xs font-bold text-emerald-800 mt-1 font-serif">
                    All logs synced to MongoDB Cloud
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('maintenance-register')}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 font-serif"
                >
                  + Log Maintenance
                </button>
              </div>
            </div>

            {filteredMaintenanceLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs bg-[#faf9f5] border border-slate-200 rounded-lg font-bold font-serif">
                No maintenance records found matching your search. Click "+ Log Maintenance" to record one.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-lg font-serif">
                <table className="w-full text-left text-xs text-slate-900 border-collapse font-serif">
                  <thead className="bg-[#faf9f5] border-b border-slate-300 font-bold text-slate-700 font-serif">
                    <tr>
                      <th className="p-3 border-r border-slate-200">#</th>
                      <th className="p-3 border-r border-slate-200">Vehicle Plate</th>
                      <th className="p-3 border-r border-slate-200">Make & Model</th>
                      <th className="p-3 border-r border-slate-200">Service Category</th>
                      <th className="p-3 border-r border-slate-200">Service Date</th>
                      <th className="p-3 border-r border-slate-200">Workshop / Vendor</th>
                      <th className="p-3 border-r border-slate-200">Cost (Rs.)</th>
                      <th className="p-3 border-r border-slate-200">Details</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-serif">
                    {filteredMaintenanceLogs.map((m, index) => {
                      const mId = m._id || m.id || '';
                      return (
                        <tr key={mId} className="hover:bg-slate-50 transition font-serif">
                          <td className="p-3 border-r border-slate-200 font-bold text-slate-500 text-center font-serif">
                            {index + 1}
                          </td>
                          <td className="p-3 border-r border-slate-200 font-bold uppercase font-mono font-serif">
                            <button
                              onClick={() => {
                                setSelectedLookupPlate(m.carPlateNumber);
                                setActiveTab('vehicle-360');
                              }}
                              className="underline hover:text-indigo-800 font-serif text-left"
                            >
                              {m.carPlateNumber}
                            </button>
                          </td>
                          <td className="p-3 border-r border-slate-200 font-bold text-slate-900 font-serif">
                            {m.carNameModel}
                          </td>
                          <td className="p-3 border-r border-slate-200 font-bold text-slate-800 font-serif">
                            {m.serviceType}
                          </td>
                          <td className="p-3 border-r border-slate-200 text-[11px] font-serif">
                            {m.serviceDate}
                          </td>
                          <td className="p-3 border-r border-slate-200 font-serif">
                            {m.vendorName || '—'}
                          </td>
                          <td className="p-3 border-r border-slate-200 font-bold text-rose-900 font-serif">
                            Rs. {(m.cost || 0).toLocaleString()}
                          </td>
                          <td className="p-3 border-r border-slate-200 text-slate-600 font-serif max-w-xs truncate">
                            {m.description || '—'}
                          </td>
                          <td className="p-3 text-center space-x-1 font-serif">
                            <button
                              onClick={() => setEditingModal({ type: 'maintenance', data: JSON.parse(JSON.stringify(m)) })}
                              className="px-2 py-1 text-[11px] font-bold bg-white border border-slate-300 hover:bg-slate-100 text-slate-900 rounded font-serif"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDeleteMaintenanceLog(mId, m.carPlateNumber, m.serviceType)}
                              className="px-2 py-1 text-[11px] font-bold text-rose-800 hover:bg-rose-100 bg-rose-50 border border-rose-200 rounded transition font-serif"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </main>
        )}

        {/* TAB 7: FINANCIAL PAYMENT AGENDA (TODAY / NEXT 2 DAYS / NEXT 3-5 DAYS / THIS WEEK) */}
        {activeTab === 'agenda' && (
          <main className="glass-panel p-6 rounded-xl space-y-6 font-serif animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 font-serif">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-serif">
                  Financial Payment Agenda & Collection Schedule
                </h2>
                <p className="text-xs text-slate-600 mt-0.5 font-serif">
                  Filter upcoming due payments: Who to PAY (Investors) and Who to COLLECT FROM (Customers) with dates and contact numbers.
                </p>
              </div>

              {/* Timeframe Filter Buttons */}
              <div className="flex items-center gap-1.5 bg-[#faf9f5] p-1 border border-slate-300 rounded-lg text-xs font-serif">
                <button
                  onClick={() => setAgendaTimeframe('today')}
                  className={`px-3 py-1.5 rounded font-bold font-serif ${
                    agendaTimeframe === 'today' ? 'bg-amber-900 text-white' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Due Today
                </button>
                <button
                  onClick={() => setAgendaTimeframe('2days')}
                  className={`px-3 py-1.5 rounded font-bold font-serif ${
                    agendaTimeframe === '2days' ? 'bg-amber-900 text-white' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Next 2 Days
                </button>
                <button
                  onClick={() => setAgendaTimeframe('5days')}
                  className={`px-3 py-1.5 rounded font-bold font-serif ${
                    agendaTimeframe === '5days' ? 'bg-amber-900 text-white' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Next 3-5 Days
                </button>
                <button
                  onClick={() => setAgendaTimeframe('week')}
                  className={`px-3 py-1.5 rounded font-bold font-serif ${
                    agendaTimeframe === 'week' ? 'bg-amber-900 text-white' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setAgendaTimeframe('all')}
                  className={`px-3 py-1.5 rounded font-bold font-serif ${
                    agendaTimeframe === 'all' ? 'bg-amber-900 text-white' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  All Pending Dues
                </button>
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-serif">
              
              {/* PAYABLES TO INVESTORS */}
              <div className="p-4 bg-[#faf9f5] border border-slate-300 rounded-xl space-y-4 font-serif">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 font-serif">
                  <h3 className="font-bold text-rose-900 text-xs uppercase tracking-wide font-serif">
                    Payments Due to Investors (Payables)
                  </h3>
                  <span className="px-2.5 py-0.5 bg-rose-100 border border-rose-300 text-rose-900 font-bold text-xs rounded font-serif">
                    {agendaData.payables.length} Items Due
                  </span>
                </div>

                {agendaData.payables.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 font-serif">
                    No investor payouts due for the selected timeframe.
                  </div>
                ) : (
                  <div className="space-y-3 font-serif">
                    {agendaData.payables.map((p, idx) => (
                      <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5 font-serif shadow-xs">
                        <div className="flex items-center justify-between font-serif">
                          <span className="font-bold text-slate-900 text-sm font-serif">{p.name}</span>
                          <span className="text-xs font-bold text-rose-900 font-serif">
                            Rs. {p.amountDue.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-600 font-serif">
                          <span>CNIC: {p.cnic} | Phone: {p.phone}</span>
                          <span className="font-bold text-slate-700 font-serif">Due: {p.dueDate}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-serif">
                          Vehicle: <strong className="text-slate-800">{p.carModel}</strong> ({p.carPlate}) | Advance Paid: Rs. {p.advancePaid.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RECEIVABLES FROM CUSTOMERS */}
              <div className="p-4 bg-[#faf9f5] border border-slate-300 rounded-xl space-y-4 font-serif">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 font-serif">
                  <h3 className="font-bold text-emerald-900 text-xs uppercase tracking-wide font-serif">
                    Collections Due from Customers (Receivables)
                  </h3>
                  <span className="px-2.5 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs rounded font-serif">
                    {agendaData.receivables.length} Items Due
                  </span>
                </div>

                {agendaData.receivables.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 font-serif">
                    No customer collections due for the selected timeframe.
                  </div>
                ) : (
                  <div className="space-y-3 font-serif">
                    {agendaData.receivables.map((r, idx) => (
                      <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5 font-serif shadow-xs">
                        <div className="flex items-center justify-between font-serif">
                          <span className="font-bold text-slate-900 text-sm font-serif">{r.name}</span>
                          <span className="text-xs font-bold text-emerald-900 font-serif">
                            Rs. {r.amountDue.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-600 font-serif">
                          <span>CNIC: {r.cnic} | Phone: {r.phone}</span>
                          <span className="font-bold text-slate-700 font-serif">Return Date: {r.dueDate}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-serif">
                          Vehicle: <strong className="text-slate-800">{r.carModel}</strong> ({r.carPlate}) | Advance Recv: Rs. {r.advancePaid.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </main>
        )}

        {/* TAB 8: 360-DEGREE VEHICLE HISTORY SEARCH */}
        {activeTab === 'vehicle-360' && (
          <main className="glass-panel p-6 rounded-xl space-y-6 font-serif animate-fade-in">
            <div className="border-b border-slate-200 pb-3 font-serif">
              <h2 className="text-lg font-bold text-slate-900 font-serif">
                360° Vehicle Profile, History & Financial Profitability Search
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 font-serif">
                Select or type any vehicle plate number to view full owner investor details, customer rental history, repair logs, and net cashflow profitability.
              </p>
            </div>


            {/* Vehicle Selector */}
            <div className="p-4 bg-[#faf9f5] border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 font-serif">
              <div>
                <label className="block text-slate-700 font-bold mb-1 font-serif">
                  Select Registered Fleet Vehicle *
                </label>
                <select
                  value={selectedLookupPlate}
                  onChange={(e) => setSelectedLookupPlate(e.target.value)}
                  className="w-full custom-input font-bold uppercase font-serif"
                >
                  <option value="">-- Choose Vehicle Plate --</option>
                  {allFleetVehicles.map((v, i) => (
                    <option key={i} value={v.plate}>
                      {v.plate} - {v.model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 font-serif">
                  Or Type Vehicle Registration Plate Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. LEA-2024-88"
                  value={selectedLookupPlate}
                  onChange={(e) => setSelectedLookupPlate(e.target.value.toUpperCase())}
                  className="w-full custom-input font-bold uppercase font-serif"
                />
              </div>
            </div>

            {/* Vehicle 360 Profile Dashboard View */}
            {!lookupVehicleProfile || !lookupVehicleProfile.plate ? (
              <div className="p-12 text-center text-slate-500 text-xs bg-[#faf9f5] border border-slate-200 rounded-lg font-bold font-serif">
                Please select or type a Vehicle Plate Number above to load full history.
              </div>
            ) : (
              <div className="space-y-6 font-serif">
                
                {/* Header Card & Cashflow Summary */}
                <div className="p-5 bg-slate-900 text-white rounded-xl space-y-3 font-serif shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-serif">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-slate-300 font-bold font-serif">Vehicle 360 Profile</div>
                      <h3 className="text-2xl font-bold font-mono font-serif mt-0.5">{lookupVehicleProfile.plate}</h3>
                      {lookupVehicleProfile.ownerInvestor && (
                        <p className="text-xs text-slate-300 font-serif">
                          Model: {lookupVehicleProfile.ownerInvestor.vehicle.carNameModel}
                        </p>
                      )}
                    </div>

                    {/* Net Cashflow Card */}
                    <div className="p-3 bg-white/10 border border-white/20 rounded-lg text-right font-serif">
                      <div className="text-[10px] uppercase tracking-wider text-slate-300 font-bold font-serif">Net Profit / Cashflow</div>
                      <div className={`text-xl font-bold font-serif ${lookupVehicleProfile.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        Rs. {lookupVehicleProfile.netProfit.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/10 text-xs font-serif">
                    <div>Rent Collected: <strong className="text-emerald-300">Rs. {lookupVehicleProfile.totalRentCollected.toLocaleString()}</strong></div>
                    <div>Investor Payout: <strong className="text-amber-300">Rs. {lookupVehicleProfile.investorPayout.toLocaleString()}</strong></div>
                    <div>Repairs & Maintenance: <strong className="text-rose-300">Rs. {lookupVehicleProfile.totalMaintenanceCost.toLocaleString()}</strong></div>
                  </div>
                </div>

                {/* Section A: Owner Investor Details */}
                <div className="p-4 bg-[#faf9f5] border border-slate-300 rounded-xl space-y-2 font-serif">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide border-b border-slate-200 pb-2 font-serif">
                    A. Owner / Depositing Investor Information
                  </h4>

                  {lookupVehicleProfile.ownerInvestor ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-serif pt-1">
                      <div>
                        <span className="text-slate-500 font-serif">Investor Name:</span>{' '}
                        <strong className="text-slate-900 font-serif">{lookupVehicleProfile.ownerInvestor.investor.name}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-serif">CNIC:</span>{' '}
                        <strong className="font-mono font-serif">{lookupVehicleProfile.ownerInvestor.investor.cnic}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-serif">Phone:</span>{' '}
                        <strong className="font-serif">{lookupVehicleProfile.ownerInvestor.investor.phone || 'N/A'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-serif">Agreed Payout:</span>{' '}
                        <strong className="text-slate-900 font-serif">Rs. {lookupVehicleProfile.ownerInvestor.vehicle.payoutAmount.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-serif">Tenure:</span>{' '}
                        <strong className="font-serif">{lookupVehicleProfile.ownerInvestor.vehicle.startDate} to {lookupVehicleProfile.ownerInvestor.vehicle.endDate}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-serif">Duration:</span>{' '}
                        <strong className="font-serif">{lookupVehicleProfile.ownerInvestor.vehicle.totalDays} Days</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 font-serif">Company Owned or No Investor Record Found.</div>
                  )}
                </div>

                {/* Section B: Customer Rental History */}
                <div className="p-4 bg-[#faf9f5] border border-slate-300 rounded-xl space-y-3 font-serif">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide border-b border-slate-200 pb-2 font-serif">
                    B. Customer Rental Booking History ({lookupVehicleProfile.rentals.length} Rentals)
                  </h4>

                  {lookupVehicleProfile.rentals.length === 0 ? (
                    <div className="text-xs text-slate-500 font-serif">No customer rental history recorded for this vehicle.</div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white font-serif">
                      <table className="w-full text-left text-xs border-collapse font-serif">
                        <thead className="bg-[#faf9f5] border-b border-slate-300 font-bold font-serif">
                          <tr>
                            <th className="p-2.5">Customer</th>
                            <th className="p-2.5">CNIC</th>
                            <th className="p-2.5">Rental Period</th>
                            <th className="p-2.5">Rent Charged</th>
                            <th className="p-2.5">Advance</th>
                            <th className="p-2.5">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-serif">
                          {lookupVehicleProfile.rentals.map((r, idx) => (
                            <tr key={idx} className="font-serif">
                              <td className="p-2.5 font-bold font-serif">{r.customerName}</td>
                              <td className="p-2.5 font-mono font-serif">{r.customerCnic}</td>
                              <td className="p-2.5 font-serif">{r.startDate} to {r.endDate} ({r.totalDays} Days)</td>
                              <td className="p-2.5 font-bold font-serif">Rs. {r.totalPrice.toLocaleString()}</td>
                              <td className="p-2.5 text-emerald-800 font-serif">Rs. {r.advancePaid.toLocaleString()}</td>
                              <td className="p-2.5 text-rose-800 font-serif">Rs. {r.balanceDue.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Section C: Maintenance History */}
                <div className="p-4 bg-[#faf9f5] border border-slate-300 rounded-xl space-y-3 font-serif">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide border-b border-slate-200 pb-2 font-serif">
                    C. Maintenance & Repairs Timeline ({lookupVehicleProfile.maints.length} Logs)
                  </h4>

                  {lookupVehicleProfile.maints.length === 0 ? (
                    <div className="text-xs text-slate-500 font-serif">No maintenance records logged for this vehicle.</div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white font-serif">
                      <table className="w-full text-left text-xs border-collapse font-serif">
                        <thead className="bg-[#faf9f5] border-b border-slate-300 font-bold font-serif">
                          <tr>
                            <th className="p-2.5">Date</th>
                            <th className="p-2.5">Service Category</th>
                            <th className="p-2.5">Workshop / Vendor</th>
                            <th className="p-2.5">Cost</th>
                            <th className="p-2.5">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-serif">
                          {lookupVehicleProfile.maints.map((m, idx) => (
                            <tr key={idx} className="font-serif">
                              <td className="p-2.5 font-serif">{m.serviceDate}</td>
                              <td className="p-2.5 font-bold font-serif">{m.serviceType}</td>
                              <td className="p-2.5 font-serif">{m.vendorName || '—'}</td>
                              <td className="p-2.5 font-bold text-rose-900 font-serif">Rs. {m.cost.toLocaleString()}</td>
                              <td className="p-2.5 font-serif">{m.description || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}
          </main>
        )}

        {/* TAB 9: INDIVIDUAL INVESTOR & CUSTOMER ACCOUNT PROFILES */}
        {activeTab === 'investor-profile' && (
          <main className="glass-panel p-6 rounded-xl space-y-6 font-serif animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 font-serif">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-serif">
                  Separate Investor Account Profile Ledger
                </h2>
                <p className="text-xs text-slate-600 mt-0.5 font-serif">
                  Dedicated single-account view showing complete investor details, deposited vehicles, and financial payout ledger.
                </p>
              </div>


              <div className="flex items-center gap-2 font-serif">
                <button
                  onClick={() => setActiveTab('investor-profile')}
                  className={`px-3 py-1.5 rounded text-xs font-bold font-serif ${
                    (activeTab as string) === 'investor-profile' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  Investor Profile
                </button>
                <button
                  onClick={() => setActiveTab('customer-profile')}
                  className={`px-3 py-1.5 rounded text-xs font-bold font-serif ${
                    (activeTab as string) === 'customer-profile' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  Customer Profile
                </button>
              </div>
            </div>

            {/* Investor Selector */}
            <div className="p-4 bg-[#faf9f5] border border-slate-200 rounded-lg font-serif">
              <label className="block text-slate-700 font-bold mb-1 font-serif">
                Select Investor to Open Account Ledger *
              </label>
              <select
                value={selectedInvestorProfileId}
                onChange={(e) => setSelectedInvestorProfileId(e.target.value)}
                className="w-full custom-input font-bold font-serif"
              >
                <option value="">-- Choose Investor Account --</option>
                {investorRecords.map((inv) => (
                  <option key={inv._id || inv.id} value={inv._id || inv.id}>
                    {inv.name} (CNIC: {inv.cnic})
                  </option>
                ))}
              </select>
            </div>

            {/* Account Card */}
            {!selectedInvestorProfile ? (
              <div className="p-12 text-center text-slate-500 text-xs bg-[#faf9f5] border border-slate-200 rounded-lg font-bold font-serif">
                Please select an Investor Account above to view their dedicated profile ledger.
              </div>
            ) : (
              <div className="p-6 bg-[#faf9f5] border border-slate-300 rounded-xl space-y-6 font-serif">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 font-serif">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 font-serif">{selectedInvestorProfile.name}</h3>
                    <div className="text-xs text-slate-600 space-x-3 mt-1 font-serif">
                      <span>CNIC: <strong>{selectedInvestorProfile.cnic}</strong></span>
                      <span>Phone: <strong>{selectedInvestorProfile.phone || 'N/A'}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingModal({ type: 'investor', data: JSON.parse(JSON.stringify(selectedInvestorProfile)) })}
                    className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded hover:bg-slate-800 font-serif"
                  >
                    Edit Account Profile
                  </button>
                </div>

                <div className="space-y-3 font-serif">
                  <h4 className="font-bold text-xs uppercase tracking-wide text-slate-700 font-serif">
                    Deposited Vehicle Fleet ({selectedInvestorProfile.vehicles ? selectedInvestorProfile.vehicles.length : 0} Vehicles)
                  </h4>

                  <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white font-serif">
                    <table className="w-full text-left text-xs border-collapse font-serif">
                      <thead className="bg-[#faf9f5] border-b border-slate-300 font-bold font-serif">
                        <tr>
                          <th className="p-2.5">Vehicle</th>
                          <th className="p-2.5">Plate</th>
                          <th className="p-2.5">Period</th>
                          <th className="p-2.5">Payout</th>
                          <th className="p-2.5">Advance</th>
                          <th className="p-2.5">Left Due</th>
                          <th className="p-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-serif">
                        {selectedInvestorProfile.vehicles && selectedInvestorProfile.vehicles.map((v, i) => (
                          <tr key={i} className="font-serif">
                            <td className="p-2.5 font-bold font-serif">{v.carNameModel}</td>
                            <td className="p-2.5 font-mono font-bold uppercase font-serif">{v.carPlateNumber}</td>
                            <td className="p-2.5 font-serif">{v.startDate} to {v.endDate}</td>
                            <td className="p-2.5 font-bold font-serif">Rs. {v.payoutAmount.toLocaleString()}</td>
                            <td className="p-2.5 text-emerald-800 font-bold font-serif">Rs. {(v.advancePaid || 0).toLocaleString()}</td>
                            <td className="p-2.5 text-rose-800 font-bold font-serif">Rs. {(v.balanceDue !== undefined ? v.balanceDue : Math.max(0, v.payoutAmount - (v.advancePaid || 0))).toLocaleString()}</td>
                            <td className="p-2.5 font-serif">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-serif ${
                                v.paymentStatus === 'PAID_FULL' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}>
                                {v.paymentStatus === 'PAID_FULL' ? 'PAID IN FULL' : 'PENDING DUE'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </main>
        )}

        {/* TAB 10: INDIVIDUAL CUSTOMER ACCOUNT PROFILE */}
        {activeTab === 'customer-profile' && (
          <main className="glass-panel p-6 rounded-xl space-y-6 font-serif animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 font-serif">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-serif">
                  Separate Customer Account Profile Ledger
                </h2>
                <p className="text-xs text-slate-600 mt-0.5 font-serif">
                  Dedicated single-account view showing complete customer details, rental history, and balance dues.
                </p>
              </div>


              <div className="flex items-center gap-2 font-serif">
                <button
                  onClick={() => setActiveTab('investor-profile')}
                  className={`px-3 py-1.5 rounded text-xs font-bold font-serif ${
                    (activeTab as string) === 'investor-profile' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  Investor Profile
                </button>
                <button
                  onClick={() => setActiveTab('customer-profile')}
                  className={`px-3 py-1.5 rounded text-xs font-bold font-serif ${
                    (activeTab as string) === 'customer-profile' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  Customer Profile
                </button>
              </div>
            </div>


            {/* Customer Selector */}
            <div className="p-4 bg-[#faf9f5] border border-slate-200 rounded-lg font-serif">
              <label className="block text-slate-700 font-bold mb-1 font-serif">
                Select Customer to Open Account Ledger *
              </label>
              <select
                value={selectedCustomerProfileId}
                onChange={(e) => setSelectedCustomerProfileId(e.target.value)}
                className="w-full custom-input font-bold font-serif"
              >
                <option value="">-- Choose Customer Account --</option>
                {customerRentals.map((cust) => (
                  <option key={cust._id || cust.id} value={cust._id || cust.id}>
                    {cust.customerName} (CNIC: {cust.customerCnic}) - {cust.carPlateNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Profile Card */}
            {!selectedCustomerProfile ? (
              <div className="p-12 text-center text-slate-500 text-xs bg-[#faf9f5] border border-slate-200 rounded-lg font-bold font-serif">
                Please select a Customer Account above to view their dedicated profile ledger.
              </div>
            ) : (
              <div className="p-6 bg-[#faf9f5] border border-slate-300 rounded-xl space-y-6 font-serif">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 font-serif">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 font-serif">{selectedCustomerProfile.customerName}</h3>
                    <div className="text-xs text-slate-600 space-x-3 mt-1 font-serif">
                      <span>CNIC: <strong>{selectedCustomerProfile.customerCnic}</strong></span>
                      <span>Phone: <strong>{selectedCustomerProfile.customerPhone || 'N/A'}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingModal({ type: 'customer', data: JSON.parse(JSON.stringify(selectedCustomerProfile)) })}
                    className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded hover:bg-slate-800 font-serif"
                  >
                    Edit Customer Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-serif">
                  <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-2 font-serif">
                    <div className="font-bold text-slate-900 text-sm font-serif">Vehicle Rented</div>
                    <div>Model: <strong>{selectedCustomerProfile.carNameModel}</strong></div>
                    <div>Plate: <strong className="font-mono">{selectedCustomerProfile.carPlateNumber}</strong></div>
                    <div>Dates: <strong>{selectedCustomerProfile.startDate} to {selectedCustomerProfile.endDate} ({selectedCustomerProfile.totalDays} Days)</strong></div>
                  </div>

                  <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-2 font-serif">
                    <div className="font-bold text-slate-900 text-sm font-serif">Financial Accounting</div>
                    <div>Total Rent Charged: <strong>Rs. {selectedCustomerProfile.totalPrice.toLocaleString()}</strong></div>
                    <div className="text-emerald-800 font-bold">Advance Paid: Rs. {selectedCustomerProfile.advancePaid.toLocaleString()}</div>
                    <div className="text-rose-800 font-bold">Balance Due: Rs. {selectedCustomerProfile.balanceDue.toLocaleString()}</div>
                    <div>
                      Payment Status:{' '}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-serif ${
                        selectedCustomerProfile.paymentStatus === 'PAID_FULL' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {selectedCustomerProfile.paymentStatus === 'PAID_FULL' ? 'PAID IN FULL' : 'PENDING DUE'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </main>
        )}
      </>
    )}


        {/* EDIT RECORD MODAL DIALOG */}
        {editingModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-serif">
            <div className="bg-white border border-slate-300 rounded-xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto font-serif space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 font-serif">
                <h3 className="font-bold text-slate-900 text-base font-serif">
                  Edit {editingModal.type === 'investor' ? 'Investor Record' : editingModal.type === 'customer' ? 'Customer Rental Booking' : 'Maintenance Log'}
                </h3>
                <button
                  onClick={() => setEditingModal(null)}
                  className="text-slate-500 hover:text-slate-900 font-bold text-xs border border-slate-200 px-2 py-1 rounded font-serif"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSaveEditModal} className="space-y-4 text-xs font-serif">
                
                {/* EDIT INVESTOR FORM */}
                {editingModal.type === 'investor' && (
                  <>
                    <div className="p-3 bg-[#faf9f5] border border-slate-200 rounded-lg space-y-3 font-serif">
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-200 pb-1 font-serif">
                        Investor Profile Information
                      </h4>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1 font-serif">Investor Full Name *</label>
                        <input
                          type="text"
                          required
                          value={editingModal.data.name}
                          onChange={(e) => setEditingModal({ ...editingModal, data: { ...editingModal.data, name: e.target.value } })}
                          className="w-full custom-input font-bold font-serif"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 font-serif">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1 font-serif">CNIC Number *</label>
                          <input
                            type="text"
                            required
                            maxLength={15}
                            value={editingModal.data.cnic}
                            onChange={(e) => setEditingModal({ ...editingModal, data: { ...editingModal.data, cnic: formatCnicInput(e.target.value) } })}
                            className="w-full custom-input font-bold font-serif"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1 font-serif">Phone Number</label>
                          <input
                            type="text"
                            maxLength={12}
                            value={editingModal.data.phone || ''}
                            onChange={(e) => setEditingModal({ ...editingModal, data: { ...editingModal.data, phone: formatPhoneInput(e.target.value) } })}
                            className="w-full custom-input font-bold font-serif"
                          />
                        </div>
                      </div>
                    </div>

                    {/* EDIT INVESTOR VEHICLES & TIME LAPSE / DATES */}
                    {Array.isArray(editingModal.data.vehicles) && editingModal.data.vehicles.length > 0 && (
                      <div className="p-3 bg-[#faf9f5] border border-slate-200 rounded-lg space-y-3 font-serif">
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-200 pb-1 font-serif">
                          Deposited Vehicles & Agreement Time Lapse ({editingModal.data.vehicles.length} Vehicle{editingModal.data.vehicles.length > 1 ? 's' : ''})
                        </h4>

                        {editingModal.data.vehicles.map((v: any, vIdx: number) => {
                          const days = calculateDays(v.startDate, v.endDate);
                          const payout = parseFloat(String(v.payoutAmount)) || 0;
                          const adv = parseFloat(String(v.advancePaid)) || 0;
                          const bal = Math.max(0, payout - adv);

                          return (
                            <div key={vIdx} className="p-3 bg-white border border-slate-300 rounded-lg space-y-2 font-serif shadow-xs">
                              <div className="text-xs font-bold text-slate-800 font-serif">
                                Vehicle #{vIdx + 1}: {v.carNameModel || 'Vehicle'} [{v.carPlateNumber || 'Plate'}]
                              </div>

                              <div className="grid grid-cols-2 gap-2 font-serif">
                                <div>
                                  <label className="block text-slate-600 font-bold mb-1 text-[11px] font-serif">Vehicle Model</label>
                                  <input
                                    type="text"
                                    value={v.carNameModel}
                                    onChange={(e) => {
                                      const updated = [...editingModal.data.vehicles];
                                      updated[vIdx] = { ...updated[vIdx], carNameModel: e.target.value };
                                      setEditingModal({ ...editingModal, data: { ...editingModal.data, vehicles: updated } });
                                    }}
                                    className="w-full custom-input font-bold text-xs font-serif"
                                  />
                                </div>

                                <div>
                                  <label className="block text-slate-600 font-bold mb-1 text-[11px] font-serif">Plate Number</label>
                                  <input
                                    type="text"
                                    value={v.carPlateNumber}
                                    onChange={(e) => {
                                      const updated = [...editingModal.data.vehicles];
                                      updated[vIdx] = { ...updated[vIdx], carPlateNumber: e.target.value.toUpperCase() };
                                      setEditingModal({ ...editingModal, data: { ...editingModal.data, vehicles: updated } });
                                    }}
                                    className="w-full custom-input font-bold uppercase text-xs font-serif"
                                  />
                                </div>
                              </div>

                              {/* CALENDAR TIMELAPSE (START & END DATES) */}
                              <div className="grid grid-cols-2 gap-2 font-serif pt-1">
                                <div>
                                  <label className="block text-slate-600 font-bold mb-1 text-[11px] font-serif">Agreement Start Date</label>
                                  <input
                                    type="date"
                                    value={v.startDate}
                                    onChange={(e) => {
                                      const updated = [...editingModal.data.vehicles];
                                      const newStart = e.target.value;
                                      const calcD = calculateDays(newStart, v.endDate);
                                      updated[vIdx] = { ...updated[vIdx], startDate: newStart, totalDays: calcD };
                                      setEditingModal({ ...editingModal, data: { ...editingModal.data, vehicles: updated } });
                                    }}
                                    className="w-full custom-input text-xs font-serif"
                                  />
                                </div>

                                <div>
                                  <label className="block text-slate-600 font-bold mb-1 text-[11px] font-serif">Agreement End Date</label>
                                  <input
                                    type="date"
                                    value={v.endDate}
                                    onChange={(e) => {
                                      const updated = [...editingModal.data.vehicles];
                                      const newEnd = e.target.value;
                                      const calcD = calculateDays(v.startDate, newEnd);
                                      updated[vIdx] = { ...updated[vIdx], endDate: newEnd, totalDays: calcD };
                                      setEditingModal({ ...editingModal, data: { ...editingModal.data, vehicles: updated } });
                                    }}
                                    className="w-full custom-input text-xs font-serif"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-slate-600 font-serif pt-1">
                                <span>Calculated Duration: <strong className="text-slate-900">{days} Days Time Lapse</strong></span>
                              </div>

                              {/* FINANCIAL AMOUNTS */}
                              <div className="grid grid-cols-3 gap-2 font-serif pt-1">
                                <div>
                                  <label className="block text-slate-600 font-bold mb-1 text-[11px] font-serif">Agreed Payout (Rs.)</label>
                                  <input
                                    type="number"
                                    value={v.payoutAmount}
                                    onChange={(e) => {
                                      const updated = [...editingModal.data.vehicles];
                                      const pay = parseFloat(e.target.value) || 0;
                                      const curAdv = updated[vIdx].advancePaid || 0;
                                      updated[vIdx] = { ...updated[vIdx], payoutAmount: pay, balanceDue: Math.max(0, pay - curAdv) };
                                      setEditingModal({ ...editingModal, data: { ...editingModal.data, vehicles: updated } });
                                    }}
                                    className="w-full custom-input font-bold text-xs font-serif"
                                  />
                                </div>

                                <div>
                                  <label className="block text-slate-600 font-bold mb-1 text-[11px] font-serif">Advance Paid (Rs.)</label>
                                  <input
                                    type="number"
                                    value={v.advancePaid}
                                    onChange={(e) => {
                                      const updated = [...editingModal.data.vehicles];
                                      const advVal = parseFloat(e.target.value) || 0;
                                      const curPay = updated[vIdx].payoutAmount || 0;
                                      updated[vIdx] = { ...updated[vIdx], advancePaid: advVal, balanceDue: Math.max(0, curPay - advVal) };
                                      setEditingModal({ ...editingModal, data: { ...editingModal.data, vehicles: updated } });
                                    }}
                                    className="w-full custom-input font-bold text-xs font-serif"
                                  />
                                </div>

                                <div>
                                  <label className="block text-slate-600 font-bold mb-1 text-[11px] font-serif">Balance Left Due</label>
                                  <div className="p-2 bg-slate-100 border border-slate-300 rounded font-bold text-xs text-rose-800 font-serif">
                                    Rs. {bal.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                {/* EDIT CUSTOMER FORM */}
                {editingModal.type === 'customer' && (
                  <>
                    <div className="p-3 bg-[#faf9f5] border border-slate-200 rounded-lg space-y-3 font-serif">
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-200 pb-1 font-serif">
                        Customer Details
                      </h4>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1 font-serif">Customer Full Name *</label>
                        <input
                          type="text"
                          required
                          value={editingModal.data.customerName}
                          onChange={(e) => setEditingModal({ ...editingModal, data: { ...editingModal.data, customerName: e.target.value } })}
                          className="w-full custom-input font-bold font-serif"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 font-serif">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1 font-serif">CNIC Number *</label>
                          <input
                            type="text"
                            required
                            maxLength={15}
                            value={editingModal.data.customerCnic}
                            onChange={(e) => setEditingModal({ ...editingModal, data: { ...editingModal.data, customerCnic: formatCnicInput(e.target.value) } })}
                            className="w-full custom-input font-bold font-serif"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1 font-serif">Customer Phone Number</label>
                          <input
                            type="text"
                            maxLength={12}
                            value={editingModal.data.customerPhone || ''}
                            onChange={(e) => setEditingModal({ ...editingModal, data: { ...editingModal.data, customerPhone: formatPhoneInput(e.target.value) } })}
                            className="w-full custom-input font-bold font-serif"
                          />
                        </div>
                      </div>
                    </div>

                    {/* VEHICLE & TIME LAPSE / CALENDAR DATES */}
                    <div className="p-3 bg-[#faf9f5] border border-slate-200 rounded-lg space-y-3 font-serif">
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-200 pb-1 font-serif">
                        Rented Vehicle & Calendar Time Lapse
                      </h4>

                      <div className="grid grid-cols-2 gap-3 font-serif">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1 font-serif">Vehicle Name & Model *</label>
                          <input
                            type="text"
                            required
                            value={editingModal.data.carNameModel}
                            onChange={(e) => setEditingModal({ ...editingModal, data: { ...editingModal.data, carNameModel: e.target.value } })}
                            className="w-full custom-input font-bold font-serif"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1 font-serif">Vehicle Plate Number *</label>
                          <input
                            type="text"
                            required
                            value={editingModal.data.carPlateNumber}
                            onChange={(e) => setEditingModal({ ...editingModal, data: { ...editingModal.data, carPlateNumber: e.target.value.toUpperCase() } })}
                            className="w-full custom-input font-bold uppercase font-serif"
                          />
                        </div>
                      </div>

                      {/* CALENDAR DATES */}
                      <div className="grid grid-cols-2 gap-3 font-serif">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1 font-serif">Rental Start Date (Calendar) *</label>
                          <input
                            type="date"
                            required
                            value={editingModal.data.startDate}
                            onChange={(e) => {
                              const newStart = e.target.value;
                              const calcD = calculateDays(newStart, editingModal.data.endDate);
                              setEditingModal({
                                ...editingModal,
                                data: { ...editingModal.data, startDate: newStart, totalDays: calcD }
                              });
                            }}
                            className="w-full custom-input font-bold font-serif"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1 font-serif">Rental Return Date (Calendar) *</label>
                          <input
                            type="date"
                            required
                            value={editingModal.data.endDate}
                            onChange={(e) => {
                              const newEnd = e.target.value;
                              const calcD = calculateDays(editingModal.data.startDate, newEnd);
                              setEditingModal({
                                ...editingModal,
                                data: { ...editingModal.data, endDate: newEnd, totalDays: calcD }
                              });
                            }}
                            className="w-full custom-input font-bold font-serif"
                          />
                        </div>
                      </div>

                      <div className="p-2.5 bg-white border border-slate-200 rounded text-xs font-bold text-slate-800 flex items-center justify-between font-serif">
                        <span>Calculated Rental Duration:</span>
                        <span className="px-2.5 py-0.5 bg-slate-900 text-white rounded font-mono text-xs">
                          {calculateDays(editingModal.data.startDate, editingModal.data.endDate)} Days Time Lapse
                        </span>
                      </div>
                    </div>

                    {/* FINANCIAL BALANCES */}
                    <div className="p-3 bg-[#faf9f5] border border-slate-200 rounded-lg space-y-3 font-serif">
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-200 pb-1 font-serif">
                        Rental Pricing & Ledger Balance
                      </h4>

                      <div className="grid grid-cols-2 gap-3 font-serif">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1 font-serif">Total Rent Charged (Rs.) *</label>
                          <input
                            type="number"
                            required
                            value={editingModal.data.totalPrice}
                            onChange={(e) => {
                              const tot = parseFloat(e.target.value) || 0;
                              const adv = editingModal.data.advancePaid || 0;
                              setEditingModal({
                                ...editingModal,
                                data: { ...editingModal.data, totalPrice: tot, balanceDue: Math.max(0, tot - adv) }
                              });
                            }}
                            className="w-full custom-input font-bold font-serif"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1 font-serif">Advance Received (Rs.)</label>
                          <input
                            type="number"
                            value={editingModal.data.advancePaid}
                            onChange={(e) => {
                              const adv = parseFloat(e.target.value) || 0;
                              const tot = editingModal.data.totalPrice || 0;
                              setEditingModal({
                                ...editingModal,
                                data: { ...editingModal.data, advancePaid: adv, balanceDue: Math.max(0, tot - adv) }
                              });
                            }}
                            className="w-full custom-input font-bold font-serif"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded font-serif text-xs">
                        <span className="text-slate-600 font-bold">Remaining Balance Left Due:</span>
                        <span className="text-rose-800 font-bold text-sm font-serif">
                          Rs. {(editingModal.data.balanceDue !== undefined ? editingModal.data.balanceDue : Math.max(0, (editingModal.data.totalPrice || 0) - (editingModal.data.advancePaid || 0))).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* EDIT MAINTENANCE FORM */}
                {editingModal.type === 'maintenance' && (
                  <>
                    <div className="p-3 bg-[#faf9f5] border border-slate-200 rounded-lg space-y-3 font-serif">
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-200 pb-1 font-serif">
                        Vehicle & Workshop Details
                      </h4>

                      <div className="grid grid-cols-2 gap-3 font-serif">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1 font-serif">Vehicle Plate Number *</label>
                          <input
                            type="text"
                            required
                            value={editingModal.data.carPlateNumber}
                            onChange={(e) => setEditingModal({ ...editingModal, data: { ...editingModal.data, carPlateNumber: e.target.value.toUpperCase() } })}
                            className="w-full custom-input font-bold uppercase font-serif"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1 font-serif">Vehicle Name & Model</label>
                          <input
                            type="text"
                            value={editingModal.data.carNameModel || ''}
                            onChange={(e) => setEditingModal({ ...editingModal, data: { ...editingModal.data, carNameModel: e.target.value } })}
                            className="w-full custom-input font-bold font-serif"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 font-serif">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1 font-serif">Service Date (Calendar) *</label>
                          <input
                            type="date"
                            required
                            value={editingModal.data.serviceDate}
                            onChange={(e) => setEditingModal({ ...editingModal, data: { ...editingModal.data, serviceDate: e.target.value } })}
                            className="w-full custom-input font-bold font-serif"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1 font-serif">Service Category / Type</label>
                          <input
                            type="text"
                            value={editingModal.data.serviceType}
                            onChange={(e) => setEditingModal({ ...editingModal, data: { ...editingModal.data, serviceType: e.target.value } })}
                            className="w-full custom-input font-bold font-serif"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 font-serif">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1 font-serif">Workshop / Vendor Name</label>
                          <input
                            type="text"
                            value={editingModal.data.vendorName || ''}
                            onChange={(e) => setEditingModal({ ...editingModal, data: { ...editingModal.data, vendorName: e.target.value } })}
                            className="w-full custom-input font-serif"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1 font-serif">Cost / Kharcha (Rs.) *</label>
                          <input
                            type="number"
                            required
                            value={editingModal.data.cost}
                            onChange={(e) => setEditingModal({ ...editingModal, data: { ...editingModal.data, cost: parseFloat(e.target.value) || 0 } })}
                            className="w-full custom-input font-bold font-serif"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1 font-serif">Description / Service Remarks</label>
                        <textarea
                          rows={2}
                          value={editingModal.data.description || ''}
                          onChange={(e) => setEditingModal({ ...editingModal, data: { ...editingModal.data, description: e.target.value } })}
                          className="w-full custom-input font-serif"
                        />
                      </div>
                    </div>
                  </>
                )}


                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 font-serif">
                  <button
                    type="button"
                    onClick={() => setEditingModal(null)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded font-bold hover:bg-slate-100 font-serif"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-slate-900 text-white rounded font-bold hover:bg-slate-800 font-serif"
                  >
                    Save Changes to MongoDB
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* FORMAL REGISTRATION SUCCESS POPUP MODAL */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm font-serif animate-fade-in">
            <div className="bg-white border border-slate-300 w-full max-w-lg p-6 rounded-xl shadow-2xl space-y-5 font-serif">
              
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between font-serif">
                <div className="space-y-1 font-serif">
                  <div className="text-[10px] uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded font-bold inline-block font-serif">
                    Registration Confirmed
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 font-serif">
                    {showSuccessModal.title}
                  </h3>
                </div>
                <button
                  onClick={() => setShowSuccessModal(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-xs border border-slate-200 px-2 py-1 rounded font-serif"
                >
                  Close
                </button>
              </div>

              <p className="text-xs text-slate-600 font-serif leading-relaxed">
                {showSuccessModal.subtitle}
              </p>

              <div className="p-4 bg-[#faf9f5] border border-slate-200 rounded-lg space-y-2.5 text-xs font-serif">
                {showSuccessModal.details.map((d, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/80 pb-2 last:border-0 last:pb-0 font-serif">
                    <span className="text-slate-500 font-bold font-serif">{d.label}:</span>
                    <span className="text-slate-900 font-bold font-serif">{d.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 font-serif">
                <button
                  onClick={() => {
                    const target = showSuccessModal.targetTab;
                    setShowSuccessModal(null);
                    setActiveTab(target);
                  }}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm font-serif transition"
                >
                  Done / View Directory
                </button>
              </div>

            </div>
          </div>
        )}

        {/* DATABASE BACKUP & DISASTER RECOVERY MODAL */}
        {showBackupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm font-serif animate-fade-in">
            <div className="bg-white border border-slate-300 w-full max-w-2xl p-6 rounded-xl shadow-2xl space-y-6 font-serif max-h-[90vh] overflow-y-auto">
              
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between font-serif">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-serif">
                    Database Backup & Disaster Recovery
                  </h3>
                  <p className="text-xs text-slate-600 font-serif">
                    Export full MongoDB cloud backups to your computer or restore previous database snapshots.
                  </p>
                </div>
                <button
                  onClick={() => setShowBackupModal(false)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-xs border border-slate-200 px-2.5 py-1 rounded font-serif"
                >
                  Close
                </button>
              </div>

              {/* Current Database Summary */}
              <div className="grid grid-cols-3 gap-3 font-serif">
                <div className="p-3 bg-[#faf9f5] border border-slate-200 rounded-lg text-center font-serif">
                  <div className="text-xs text-slate-500 font-serif">Registered Investors</div>
                  <div className="text-xl font-bold text-slate-900 font-serif">{investorRecords.length}</div>
                </div>
                <div className="p-3 bg-[#faf9f5] border border-slate-200 rounded-lg text-center font-serif">
                  <div className="text-xs text-slate-500 font-serif">Customer Rentals</div>
                  <div className="text-xl font-bold text-slate-900 font-serif">{customerRentals.length}</div>
                </div>
                <div className="p-3 bg-[#faf9f5] border border-slate-200 rounded-lg text-center font-serif">
                  <div className="text-xs text-slate-500 font-serif">Maintenance Logs</div>
                  <div className="text-xl font-bold text-slate-900 font-serif">{maintenanceLogs.length}</div>
                </div>
              </div>

              {/* Action 1: Export Backup */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3 font-serif">
                <div className="flex items-center justify-between font-serif">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm font-serif">1. Export Full Database Backup File</h4>
                    <p className="text-xs text-slate-600 font-serif mt-0.5">
                      Download an exact JSON snapshot of all investors, fleet records, customer rentals, and financial ledgers.
                    </p>
                  </div>
                  <button
                    onClick={handleExportBackup}
                    className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg shadow-sm font-serif shrink-0 transition"
                  >
                    Download Backup File
                  </button>
                </div>
              </div>

              {/* Action 2: Restore from Backup */}
              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3 font-serif">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm font-serif">2. Restore Database from Backup File</h4>
                  <p className="text-xs text-slate-600 font-serif mt-0.5">
                    Select a previously exported <code className="font-mono text-slate-800 font-bold">.json</code> file to restore your entire database to MongoDB Cloud.
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-300 rounded-lg font-serif">
                  <label className="block text-slate-700 font-bold mb-2 text-xs font-serif">
                    Upload Backup JSON File:
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    disabled={backupRestoreLoading}
                    onChange={handleRestoreFileSelect}
                    className="w-full text-xs font-serif text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 file:cursor-pointer"
                  />
                  {backupRestoreLoading && (
                    <div className="text-xs text-amber-900 font-bold mt-2 font-serif">
                      Restoring database records to MongoDB Cloud Atlas... Please wait.
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-amber-900 bg-amber-100/60 p-2.5 rounded border border-amber-300/80 font-serif">
                  <strong>Notice:</strong> Restoring a backup replaces existing MongoDB collection records with the contents of the chosen backup file.
                </div>
              </div>



              <div className="flex items-center justify-end pt-2 border-t border-slate-200 font-serif">
                <button
                  onClick={() => setShowBackupModal(false)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg font-serif transition"
                >
                  Close
                </button>
              </div>


            </div>
          </div>
        )}


      </div>
    </div>
  );
}


export default App;
