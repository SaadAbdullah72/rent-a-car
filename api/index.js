import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Secure Admin Credentials from Environment
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'falah87t';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'taxila3ee4';
const JWT_SECRET = process.env.JWT_SECRET || 'alfalah_enterprise_super_secure_key_2026_x89';

const generateSessionToken = (username) => {
  const timestamp = Date.now();
  const raw = `${username}:${timestamp}:${JWT_SECRET}`;
  const signature = crypto.createHash('sha256').update(raw).digest('hex');
  return Buffer.from(JSON.stringify({ username, timestamp, signature })).toString('base64');
};

const verifySessionToken = (token) => {
  try {
    if (!token) return false;
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    const { username, timestamp, signature } = decoded;
    if (Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) return false;
    const raw = `${username}:${timestamp}:${JWT_SECRET}`;
    const expectedSig = crypto.createHash('sha256').update(raw).digest('hex');
    return signature === expectedSig;
  } catch (e) {
    return false;
  }
};

// Middleware
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'] }));
app.use(express.json({ limit: '10mb' }));

// DISABLE Mongoose buffering
mongoose.set('bufferCommands', false);

// 15 Realistic Pakistani Seed Datasets
const seedInvestors = [
  {
    id: 'inv-seed-1', name: 'Chaudhry Tariq Mahmood', cnic: '35202-8765432-1', phone: '0300-8451234',
    vehicles: [{ carNameModel: 'Toyota Corolla Altis Grande 1.8', carPlateNumber: 'LEA-2024-88', startDate: '2026-08-01', endDate: '2026-08-31', totalDays: 31, payoutAmount: 85000, advancePaid: 25000, balanceDue: 60000, paymentStatus: 'PENDING', notes: 'Monthly executive rental agreement.' }],
    createdAt: '2026-08-01T10:00:00.000Z'
  },
  {
    id: 'inv-seed-2', name: 'Malik Zeeshan Afzal', cnic: '37405-1234987-3', phone: '0333-5128901',
    vehicles: [{ carNameModel: 'Kia Sportage AWD', carPlateNumber: 'ISB-990-Z', startDate: '2026-08-05', endDate: '2026-08-25', totalDays: 21, payoutAmount: 110000, advancePaid: 40000, balanceDue: 70000, paymentStatus: 'PENDING', notes: 'Agreed 21-day rental tenure.' }],
    createdAt: '2026-08-05T11:00:00.000Z'
  },
  {
    id: 'inv-seed-3', name: 'Mian Shahbaz Sharif Wattoo', cnic: '35201-9988776-5', phone: '0321-4455667',
    vehicles: [
      { carNameModel: 'Honda Civic RS Turbo', carPlateNumber: 'LEC-2023-14', startDate: '2026-08-10', endDate: '2026-09-10', totalDays: 32, payoutAmount: 125000, advancePaid: 30000, balanceDue: 95000, paymentStatus: 'PENDING', notes: 'Monthly sedan deposit.' },
      { carNameModel: 'Hyundai Tucson Ultimate', carPlateNumber: 'LEB-2024-55', startDate: '2026-08-12', endDate: '2026-09-12', totalDays: 32, payoutAmount: 130000, advancePaid: 50000, balanceDue: 80000, paymentStatus: 'PENDING', notes: 'SUV rental deposit.' }
    ],
    createdAt: '2026-08-10T12:00:00.000Z'
  },
  {
    id: 'inv-seed-4', name: 'Sardar Jahangir Khan Tareen', cnic: '38403-5544332-9', phone: '0301-7788990',
    vehicles: [{ carNameModel: 'Toyota Fortuner Legender', carPlateNumber: 'LXR-786', startDate: '2026-08-01', endDate: '2026-08-30', totalDays: 30, payoutAmount: 220000, advancePaid: 100000, balanceDue: 120000, paymentStatus: 'PENDING', notes: 'Luxury SUV monthly deposit.' }],
    createdAt: '2026-08-01T09:00:00.000Z'
  },
  {
    id: 'inv-seed-5', name: 'Syed Ali Raza Rizvi', cnic: '35202-3322110-7', phone: '0345-6677889',
    vehicles: [{ carNameModel: 'Suzuki Cultus VXL', carPlateNumber: 'LEF-2022-99', startDate: '2026-08-15', endDate: '2026-08-31', totalDays: 17, payoutAmount: 45000, advancePaid: 15000, balanceDue: 30000, paymentStatus: 'PENDING', notes: 'Economy hatch deposit.' }],
    createdAt: '2026-08-15T14:00:00.000Z'
  }
];

const seedCustomerRentals = [
  { id: 'rent-seed-1', customerName: 'Hamza Bilal Butt', customerCnic: '35201-9876543-1', customerPhone: '0321-9988776', carNameModel: 'Toyota Corolla Altis Grande', carPlateNumber: 'LEA-2024-88', startDate: '2026-08-18', endDate: '2026-08-23', totalDays: 6, totalPrice: 42000, advancePaid: 15000, balanceDue: 27000, paymentStatus: 'PENDING', notes: 'Family northern tour rental.', createdAt: '2026-08-18T08:00:00.000Z' },
  { id: 'rent-seed-2', customerName: 'Usman Ali Dogar', customerCnic: '35404-7766554-3', customerPhone: '0302-8877665', carNameModel: 'Kia Sportage AWD', carPlateNumber: 'ISB-990-Z', startDate: '2026-08-18', endDate: '2026-08-20', totalDays: 3, totalPrice: 36000, advancePaid: 20000, balanceDue: 16000, paymentStatus: 'PENDING', notes: 'Official business travel.', createdAt: '2026-08-18T09:00:00.000Z' },
  { id: 'rent-seed-3', customerName: 'Dr. Bilal Ahmad Khan', customerCnic: '37302-1122334-7', customerPhone: '0334-5544332', carNameModel: 'Honda Civic RS Turbo', carPlateNumber: 'LEC-2023-14', startDate: '2026-08-19', endDate: '2026-08-26', totalDays: 8, totalPrice: 72000, advancePaid: 30000, balanceDue: 42000, paymentStatus: 'PENDING', notes: 'Wedding ceremony rental.', createdAt: '2026-08-18T09:30:00.000Z' },
  { id: 'rent-seed-4', customerName: 'Faisal Mukhtar Chaudhry', customerCnic: '35202-6655443-1', customerPhone: '0300-1122334', carNameModel: 'Toyota Fortuner Legender', carPlateNumber: 'LXR-786', startDate: '2026-08-18', endDate: '2026-08-18', totalDays: 1, totalPrice: 25000, advancePaid: 25000, balanceDue: 0, paymentStatus: 'PAID_FULL', notes: 'Single day protocol rental. Paid in full.', createdAt: '2026-08-18T07:00:00.000Z' },
  { id: 'rent-seed-5', customerName: 'Khurram Shahzad Gujjar', customerCnic: '34101-9988112-9', customerPhone: '0313-7766554', carNameModel: 'Suzuki Cultus VXL', carPlateNumber: 'LEF-2022-99', startDate: '2026-08-18', endDate: '2026-08-22', totalDays: 5, totalPrice: 20000, advancePaid: 5000, balanceDue: 15000, paymentStatus: 'PENDING', notes: 'City intercity commute.', createdAt: '2026-08-18T10:00:00.000Z' }
];

const seedMaintenance = [
  { id: 'maint-seed-1', carPlateNumber: 'LEA-2024-88', carNameModel: 'Toyota Corolla Altis Grande', serviceType: 'Oil & Filters Change', customServiceType: '', serviceDate: '2026-08-10', cost: 14500, vendorName: 'Toyota Ravi Motors', odometer: 35000, description: 'Mobil 1 5W-30 Synthetic engine oil, genuine oil filter, & air filter replaced.', createdAt: '2026-08-10T10:00:00.000Z' },
  { id: 'maint-seed-2', carPlateNumber: 'ISB-990-Z', carNameModel: 'Kia Sportage AWD', serviceType: 'Tyres & Alignment', customServiceType: '', serviceDate: '2026-08-12', cost: 48000, vendorName: 'Yokohama Tyre Hub Johar Town', odometer: 42000, description: '2 front Yokohama 225/55R18 tyres installed, 4-wheel computerized alignment done.', createdAt: '2026-08-12T11:00:00.000Z' },
  { id: 'maint-seed-3', carPlateNumber: 'LEC-2023-14', carNameModel: 'Honda Civic RS Turbo', serviceType: 'Brakes & Rotors', customServiceType: '', serviceDate: '2026-08-14', cost: 22000, vendorName: 'Honda Fort Gulberg', odometer: 28000, description: 'Front & rear ceramic brake pads replaced, brake rotors resurfaced.', createdAt: '2026-08-14T12:00:00.000Z' },
  { id: 'maint-seed-4', carPlateNumber: 'LXR-786', carNameModel: 'Toyota Fortuner Legender', serviceType: 'Other: Front Windshield OEM Glass Replacement', customServiceType: 'Front Windshield OEM Glass Replacement', serviceDate: '2026-08-15', cost: 38000, vendorName: 'Glasspoint Defense', odometer: 18000, description: 'Front OEM laminated windshield glass replacement due to highway stone crack.', createdAt: '2026-08-15T13:00:00.000Z' },
  { id: 'maint-seed-5', carPlateNumber: 'LEF-2022-99', carNameModel: 'Suzuki Cultus VXL', serviceType: 'AC Service & Gas', customServiceType: '', serviceDate: '2026-08-16', cost: 9500, vendorName: 'Master Cool AC Specialist', odometer: 52000, description: 'AC compressor service, R134a refrigerant gas refill, and cooling coil leak check.', createdAt: '2026-08-16T14:00:00.000Z' }
];

// Mongoose Schemas & Models
const VehicleSchema = new mongoose.Schema({
  carNameModel: { type: String, required: true },
  carPlateNumber: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  totalDays: { type: Number, default: 1 },
  payoutAmount: { type: Number, default: 0 },
  advancePaid: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 },
  paymentStatus: { type: String, default: 'PENDING' },
  notes: { type: String, default: '' }
}, { versionKey: false });

const InvestorSchema = new mongoose.Schema({
  id: { type: String, index: true },
  name: { type: String, required: true },
  cnic: { type: String, required: true, index: true },
  phone: { type: String, default: '' },
  vehicles: [VehicleSchema],
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: false, versionKey: false });

const CustomerRentalSchema = new mongoose.Schema({
  id: { type: String, index: true },
  customerName: { type: String, required: true },
  customerCnic: { type: String, required: true },
  customerPhone: { type: String, default: '' },
  carNameModel: { type: String, required: true },
  carPlateNumber: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  totalDays: { type: Number, default: 1 },
  totalPrice: { type: Number, default: 0 },
  advancePaid: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 },
  paymentStatus: { type: String, default: 'PENDING' },
  notes: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: false, versionKey: false });

const MaintenanceSchema = new mongoose.Schema({
  id: { type: String, index: true },
  carPlateNumber: { type: String, required: true },
  carNameModel: { type: String, default: 'Vehicle' },
  serviceType: { type: String, required: true },
  customServiceType: { type: String, default: '' },
  serviceDate: { type: String, required: true },
  cost: { type: Number, default: 0 },
  vendorName: { type: String, default: '' },
  odometer: { type: Number, default: 0 },
  description: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: false, versionKey: false });

const Investor = mongoose.models.Investor || mongoose.model('Investor', InvestorSchema);
const CustomerRental = mongoose.models.CustomerRental || mongoose.model('CustomerRental', CustomerRentalSchema);
const MaintenanceRecord = mongoose.models.MaintenanceRecord || mongoose.model('MaintenanceRecord', MaintenanceSchema);

let isMongoReady = false;
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Connect to MongoDB Atlas (Optimized for Serverless Lambdas)
const connectMongo = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    isMongoReady = false;
    throw new Error('MONGODB_URI is not set in Environment Variables.');
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    isMongoReady = true;
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 6000,
      socketTimeoutMS: 30000,
    };
    cached.promise = mongoose.connect(uri, opts).then((m) => {
      isMongoReady = true;
      console.log('✅ MongoDB Atlas CONNECTED!');
      autoSeedDatabase().catch(() => {});
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
    isMongoReady = true;
  } catch (e) {
    cached.promise = null;
    isMongoReady = false;
    throw e;
  }
  return cached.conn;
};

mongoose.connection.on('connected', () => { isMongoReady = true; });
mongoose.connection.on('disconnected', () => { isMongoReady = false; });
mongoose.connection.on('error', () => { isMongoReady = false; });

// Auto-seed MongoDB with records if empty
const autoSeedDatabase = async () => {
  try {
    const invCount = await Investor.countDocuments();
    if (invCount === 0) await Investor.insertMany(seedInvestors);
    const custCount = await CustomerRental.countDocuments();
    if (custCount === 0) await CustomerRental.insertMany(seedCustomerRentals);
    const maintCount = await MaintenanceRecord.countDocuments();
    if (maintCount === 0) await MaintenanceRecord.insertMany(seedMaintenance);
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

// Middleware: check MongoDB is ready before any API call
const requireMongo = async (req, res, next) => {
  try {
    await connectMongo();
    next();
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    return res.status(503).json({
      error: `Database connection error: ${err.message}`,
      hint: 'Please check MONGODB_URI in Vercel Environment Variables and ensure 0.0.0.0/0 is added in MongoDB Atlas Network Access.',
      dbStatus: 'DISCONNECTED'
    });
  }
};

const findDocSafely = async (Model, id) => {
  try {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const found = await Model.findById(id);
      if (found) return found;
    }
    return await Model.findOne({ $or: [{ id: id }, { cnic: id }, { customerCnic: id }] });
  } catch (e) {
    return null;
  }
};

// ===== REST API ROUTES =====

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: isMongoReady ? 'MongoDB Cloud CONNECTED ✅' : 'MongoDB DISCONNECTED ❌',
    readyState: mongoose.connection.readyState,
    timestamp: new Date()
  });
});

// --- AUTHENTICATION ROUTES ---
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password required.' });
    }

    const inputUser = String(username).trim();
    const inputPass = String(password).trim();

    if (inputUser === ADMIN_USERNAME && inputPass === ADMIN_PASSWORD) {
      const token = generateSessionToken(inputUser);
      return res.json({
        success: true,
        message: 'Administrator Authentication Verified!',
        token,
        username: inputUser
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid Username or Password. Access Denied.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Authentication failed.' });
  }
});

app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : req.query.token;
  if (verifySessionToken(token)) {
    return res.json({ valid: true });
  }
  return res.status(401).json({ valid: false, error: 'Session expired or invalid.' });
});

// --- INVESTORS ---
app.get('/api/investors', requireMongo, async (req, res) => {
  try {
    const investors = await Investor.find().sort({ createdAt: -1 });
    return res.json(investors);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/investors', requireMongo, async (req, res) => {
  try {
    const { name, cnic, phone, vehicles, id, createdAt } = req.body;
    if (!name || !cnic) return res.status(400).json({ error: 'Name and CNIC required.' });

    const trimmedCnic = cnic.trim();
    const updateData = {
      name: name.trim(),
      cnic: trimmedCnic,
      phone: phone ? phone.trim() : '',
      vehicles: Array.isArray(vehicles) ? vehicles : []
    };

    let existing = await Investor.findOne({ $or: [{ cnic: trimmedCnic }, ...(id ? [{ id }] : [])] });
    if (existing) {
      const updated = await Investor.findByIdAndUpdate(
        existing._id,
        { $set: updateData },
        { returnDocument: 'after', runValidators: false }
      );
      return res.json({ message: 'Investor updated in MongoDB!', investor: updated });
    }

    const newInv = new Investor({
      id: id || `inv-${Date.now()}`,
      ...updateData,
      createdAt: createdAt || new Date().toISOString()
    });
    await newInv.save();
    return res.status(201).json({ message: 'Investor saved to MongoDB!', investor: newInv });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/investors/:id', requireMongo, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;

    if (updateData.name) updateData.name = updateData.name.trim();
    if (updateData.cnic) updateData.cnic = updateData.cnic.trim();
    if (updateData.phone !== undefined) updateData.phone = updateData.phone.trim();

    const query = { $or: [ ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : []), { id: id }, { cnic: id } ] };
    const updated = await Investor.findOneAndUpdate(query, { $set: updateData }, { returnDocument: 'after', runValidators: false });
    if (!updated) return res.status(404).json({ error: 'Investor not found' });
    return res.json({ message: 'Investor updated!', investor: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/investors/:id', requireMongo, async (req, res) => {
  try {
    const { id } = req.params;
    const query = { $or: [ ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : []), { id: id }, { cnic: id } ] };
    await Investor.deleteOne(query);
    return res.json({ message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// --- CUSTOMER RENTALS ---
app.get('/api/customer-rentals', requireMongo, async (req, res) => {
  try {
    const rentals = await CustomerRental.find().sort({ createdAt: -1 });
    return res.json(rentals);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/customer-rentals', requireMongo, async (req, res) => {
  try {
    const { customerName, customerCnic, carNameModel, carPlateNumber, id, createdAt } = req.body;
    if (!customerName || !customerCnic || !carNameModel || !carPlateNumber) {
      return res.status(400).json({ error: 'Customer Name, CNIC, Vehicle Name, and Plate required.' });
    }

    const newRental = new CustomerRental({
      id: id || `rent-${Date.now()}`,
      ...req.body,
      createdAt: createdAt || new Date().toISOString()
    });
    await newRental.save();
    return res.status(201).json({ message: 'Customer rental saved to MongoDB!', rental: newRental });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/customer-rentals/:id', requireMongo, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;

    const query = { $or: [ ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : []), { id: id }, { customerCnic: id } ] };
    const updated = await CustomerRental.findOneAndUpdate(query, { $set: updateData }, { returnDocument: 'after', runValidators: false });
    if (!updated) return res.status(404).json({ error: 'Customer rental not found' });
    return res.json({ message: 'Customer rental updated!', rental: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/customer-rentals/:id', requireMongo, async (req, res) => {
  try {
    const { id } = req.params;
    const query = { $or: [ ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : []), { id: id }, { customerCnic: id } ] };
    await CustomerRental.deleteOne(query);
    return res.json({ message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// --- MAINTENANCE ---
app.get('/api/maintenance', requireMongo, async (req, res) => {
  try {
    const records = await MaintenanceRecord.find().sort({ createdAt: -1 });
    return res.json(records);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/maintenance', requireMongo, async (req, res) => {
  try {
    const { carPlateNumber, serviceType, id, createdAt } = req.body;
    if (!carPlateNumber || !serviceType) {
      return res.status(400).json({ error: 'Plate Number and Service Type required.' });
    }

    const newMaint = new MaintenanceRecord({
      id: id || `maint-${Date.now()}`,
      ...req.body,
      createdAt: createdAt || new Date().toISOString()
    });
    await newMaint.save();
    return res.status(201).json({ message: 'Maintenance saved to MongoDB!', record: newMaint });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/maintenance/:id', requireMongo, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;

    const query = { $or: [ ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : []), { id: id } ] };
    const updated = await MaintenanceRecord.findOneAndUpdate(query, { $set: updateData }, { returnDocument: 'after', runValidators: false });
    if (!updated) return res.status(404).json({ error: 'Maintenance record not found' });
    return res.json({ message: 'Maintenance record updated!', record: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/maintenance/:id', requireMongo, async (req, res) => {
  try {
    const { id } = req.params;
    const query = { $or: [ ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : []), { id: id } ] };
    await MaintenanceRecord.deleteOne(query);
    return res.json({ message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// --- BACKUP & RESTORE ---
app.get('/api/backup/export', requireMongo, async (req, res) => {
  try {
    const [investors, customerRentals, maintenanceLogs] = await Promise.all([
      Investor.find().lean(),
      CustomerRental.find().lean(),
      MaintenanceRecord.find().lean()
    ]);

    const backupPayload = {
      version: '2.0',
      software: 'Al-Falah Rent A Car Management Portal',
      exportedAt: new Date().toISOString(),
      counts: {
        investors: investors.length,
        customerRentals: customerRentals.length,
        maintenanceLogs: maintenanceLogs.length
      },
      data: {
        investors,
        customerRentals,
        maintenanceLogs
      }
    };

    return res.json(backupPayload);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to export database backup: ' + err.message });
  }
});

app.post('/api/backup/restore', requireMongo, async (req, res) => {
  try {
    const backupData = req.body.data ? req.body.data : req.body;
    if (!backupData || typeof backupData !== 'object') {
      return res.status(400).json({ error: 'Invalid backup file format.' });
    }

    const investors = Array.isArray(backupData.investors) ? backupData.investors : (Array.isArray(backupData.records) ? backupData.records : []);
    const customerRentals = Array.isArray(backupData.customerRentals) ? backupData.customerRentals : [];
    const maintenanceLogs = Array.isArray(backupData.maintenanceLogs) ? backupData.maintenanceLogs : [];

    await Promise.all([
      Investor.deleteMany({}),
      CustomerRental.deleteMany({}),
      MaintenanceRecord.deleteMany({})
    ]);

    const [restoredInv, restoredRent, restoredMaint] = await Promise.all([
      investors.length > 0 ? Investor.insertMany(investors) : Promise.resolve([]),
      customerRentals.length > 0 ? CustomerRental.insertMany(customerRentals) : Promise.resolve([]),
      maintenanceLogs.length > 0 ? MaintenanceRecord.insertMany(maintenanceLogs) : Promise.resolve([])
    ]);

    return res.json({
      message: 'Database Restored Successfully from Backup File!',
      counts: {
        investors: restoredInv.length,
        customerRentals: restoredRent.length,
        maintenanceLogs: restoredMaint.length
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to restore database: ' + err.message });
  }
});

connectMongo();

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;
