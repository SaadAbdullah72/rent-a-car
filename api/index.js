'use strict';

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');

// ─── ENV ─────────────────────────────────────────────────────────────────────
const MONGODB_URI   = process.env.MONGODB_URI;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'falah87t';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'taxila3ee4';
const JWT_SECRET     = process.env.JWT_SECRET     || 'alfalah_super_secure_2026';

// ─── EXPRESS APP ─────────────────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','OPTIONS'] }));
app.use(express.json({ limit: '10mb' }));
mongoose.set('bufferCommands', false);

// ─── AUTH HELPERS ─────────────────────────────────────────────────────────────
function generateToken(username) {
  const ts  = Date.now();
  const sig = crypto.createHash('sha256').update(`${username}:${ts}:${JWT_SECRET}`).digest('hex');
  return Buffer.from(JSON.stringify({ username, ts, sig })).toString('base64');
}
function verifyToken(token) {
  try {
    const d = JSON.parse(Buffer.from(token, 'base64').toString());
    if (Date.now() - d.ts > 7 * 86400000) return false;
    const expected = crypto.createHash('sha256').update(`${d.username}:${d.ts}:${JWT_SECRET}`).digest('hex');
    return d.sig === expected;
  } catch { return false; }
}

// ─── MONGOOSE SCHEMAS ─────────────────────────────────────────────────────────
const VehicleSchema = new mongoose.Schema({
  carNameModel:   { type: String, required: true },
  carPlateNumber: { type: String, required: true },
  startDate:      String, endDate: String,
  totalDays:      { type: Number, default: 1 },
  payoutAmount:   { type: Number, default: 0 },
  advancePaid:    { type: Number, default: 0 },
  balanceDue:     { type: Number, default: 0 },
  paymentStatus:  { type: String, default: 'PENDING' },
  notes:          { type: String, default: '' }
}, { versionKey: false, _id: true });

const InvestorSchema = new mongoose.Schema({
  id:        { type: String },
  name:      { type: String, required: true },
  cnic:      { type: String, required: true },
  phone:     { type: String, default: '' },
  vehicles:  [VehicleSchema],
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: false, versionKey: false });

const CustomerRentalSchema = new mongoose.Schema({
  id:             String,
  customerName:   { type: String, required: true },
  customerCnic:   { type: String, required: true },
  customerPhone:  { type: String, default: '' },
  carNameModel:   { type: String, required: true },
  carPlateNumber: { type: String, required: true },
  startDate:      String, endDate: String,
  totalDays:      { type: Number, default: 1 },
  totalPrice:     { type: Number, default: 0 },
  advancePaid:    { type: Number, default: 0 },
  balanceDue:     { type: Number, default: 0 },
  paymentStatus:  { type: String, default: 'PENDING' },
  notes:          { type: String, default: '' },
  createdAt:      { type: String, default: () => new Date().toISOString() }
}, { timestamps: false, versionKey: false });

const MaintenanceSchema = new mongoose.Schema({
  id:              String,
  carPlateNumber:  { type: String, required: true },
  carNameModel:    { type: String, default: '' },
  serviceType:     { type: String, required: true },
  customServiceType: { type: String, default: '' },
  serviceDate:     String,
  cost:            { type: Number, default: 0 },
  vendorName:      { type: String, default: '' },
  odometer:        { type: Number, default: 0 },
  description:     { type: String, default: '' },
  createdAt:       { type: String, default: () => new Date().toISOString() }
}, { timestamps: false, versionKey: false });

// Use cached model registration to avoid "Cannot overwrite model" error in serverless
const Investor        = mongoose.models.Investor        || mongoose.model('Investor',        InvestorSchema);
const CustomerRental  = mongoose.models.CustomerRental  || mongoose.model('CustomerRental',  CustomerRentalSchema);
const MaintenanceRecord = mongoose.models.MaintenanceRecord || mongoose.model('MaintenanceRecord', MaintenanceSchema);

// ─── SERVERLESS-SAFE MONGODB CONNECTION (with global cache & auto-reconnect) ──
global._mongooseCache = global._mongooseCache || { conn: null, promise: null };

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS:          45000,
  connectTimeoutMS:         20000,
  maxPoolSize:              10,
  minPoolSize:              1,
  maxIdleTimeMS:            60000,
  heartbeatFrequencyMS:     10000,
  retryWrites:              true,
  retryReads:               true,
  autoIndex:                false,
};

// Listeners to auto-heal disconnected state
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connection established');
});
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message);
});
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected, resetting cached connection...');
  if (global._mongooseCache) {
    global._mongooseCache.conn = null;
    global._mongooseCache.promise = null;
  }
});

async function connectDB(retries = 3, delay = 1000) {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set. Please add it in Vercel Project Settings → Environment Variables.');
  }

  // If already connected, return cached connection immediately
  if (global._mongooseCache.conn && mongoose.connection.readyState === 1) {
    return global._mongooseCache.conn;
  }

  // If connection is already in-flight, await the existing promise
  if (global._mongooseCache.promise) {
    try {
      global._mongooseCache.conn = await global._mongooseCache.promise;
      if (mongoose.connection.readyState === 1) {
        return global._mongooseCache.conn;
      }
    } catch (e) {
      global._mongooseCache.promise = null;
    }
  }

  // Retry loop with exponential backoff
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      global._mongooseCache.promise = mongoose.connect(MONGODB_URI, MONGO_OPTIONS);
      global._mongooseCache.conn = await global._mongooseCache.promise;

      // Auto-seed if empty on initial connect
      try {
        const count = await Investor.countDocuments();
        if (count === 0) await seedDatabase();
      } catch (e) { /* ignore seed errors */ }

      return global._mongooseCache.conn;
    } catch (err) {
      global._mongooseCache.promise = null;
      global._mongooseCache.conn = null;
      console.error(`MongoDB connect attempt ${attempt}/${retries} failed:`, err.message);
      if (attempt === retries) throw err;
      await new Promise(res => setTimeout(res, delay * attempt));
    }
  }
}

async function seedDatabase() {
  await Investor.insertMany([
    { id:'inv-seed-1', name:'Chaudhry Tariq Mahmood', cnic:'35202-8765432-1', phone:'0300-8451234', vehicles:[{carNameModel:'Toyota Corolla Altis Grande',carPlateNumber:'LEA-2024-88',startDate:'2026-08-01',endDate:'2026-08-31',totalDays:31,payoutAmount:85000,advancePaid:25000,balanceDue:60000,paymentStatus:'PENDING',notes:'Monthly executive rental.'}], createdAt:'2026-08-01T10:00:00.000Z' },
    { id:'inv-seed-2', name:'Malik Zeeshan Afzal',    cnic:'37405-1234987-3', phone:'0333-5128901', vehicles:[{carNameModel:'Kia Sportage AWD',carPlateNumber:'ISB-990-Z',startDate:'2026-08-05',endDate:'2026-08-25',totalDays:21,payoutAmount:110000,advancePaid:40000,balanceDue:70000,paymentStatus:'PENDING',notes:'Agreed 21-day tenure.'}], createdAt:'2026-08-05T11:00:00.000Z' },
    { id:'inv-seed-3', name:'Sardar Jahangir Tareen', cnic:'38403-5544332-9', phone:'0301-7788990', vehicles:[{carNameModel:'Toyota Fortuner Legender',carPlateNumber:'LXR-786',startDate:'2026-08-01',endDate:'2026-08-30',totalDays:30,payoutAmount:220000,advancePaid:100000,balanceDue:120000,paymentStatus:'PENDING',notes:'Luxury SUV monthly deposit.'}], createdAt:'2026-08-01T09:00:00.000Z' }
  ]);
  await CustomerRental.insertMany([
    { id:'rent-seed-1', customerName:'Hamza Bilal Butt', customerCnic:'35201-9876543-1', customerPhone:'0321-9988776', carNameModel:'Toyota Corolla Altis Grande', carPlateNumber:'LEA-2024-88', startDate:'2026-08-18', endDate:'2026-08-23', totalDays:6, totalPrice:42000, advancePaid:15000, balanceDue:27000, paymentStatus:'PENDING', notes:'Family northern tour.', createdAt:'2026-08-18T08:00:00.000Z' },
    { id:'rent-seed-2', customerName:'Usman Ali Dogar',  customerCnic:'35404-7766554-3', customerPhone:'0302-8877665', carNameModel:'Kia Sportage AWD', carPlateNumber:'ISB-990-Z', startDate:'2026-08-18', endDate:'2026-08-20', totalDays:3, totalPrice:36000, advancePaid:20000, balanceDue:16000, paymentStatus:'PENDING', notes:'Official travel.', createdAt:'2026-08-18T09:00:00.000Z' }
  ]);
  await MaintenanceRecord.insertMany([
    { id:'maint-seed-1', carPlateNumber:'LEA-2024-88', carNameModel:'Toyota Corolla Altis Grande', serviceType:'Oil & Filters Change', customServiceType:'', serviceDate:'2026-08-10', cost:14500, vendorName:'Toyota Ravi Motors', odometer:35000, description:'Mobil 1 5W-30 synthetic oil change.', createdAt:'2026-08-10T10:00:00.000Z' },
    { id:'maint-seed-2', carPlateNumber:'ISB-990-Z',   carNameModel:'Kia Sportage AWD',             serviceType:'Tyres & Alignment', customServiceType:'', serviceDate:'2026-08-12', cost:48000, vendorName:'Yokohama Tyre Hub', odometer:42000, description:'2 front Yokohama tyres + 4-wheel alignment.', createdAt:'2026-08-12T11:00:00.000Z' }
  ]);
}

// ─── DB MIDDLEWARE ────────────────────────────────────────────────────────────
async function requireDB(req, res, next) {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connect error:', err.message);
    res.status(503).json({
      error: 'Cannot connect to database.',
      detail: err.message,
      fix: 'Check MONGODB_URI in Vercel Environment Variables AND whitelist 0.0.0.0/0 in MongoDB Atlas → Network Access.'
    });
  }
}

// helper: strip mongo internals from update body
function sanitize(body) {
  const d = { ...body };
  delete d._id; delete d.__v; delete d.id;
  return d;
}
// helper: build id query
function idQuery(id) {
  const parts = [{ id: id }];
  if (mongoose.Types.ObjectId.isValid(id)) parts.push({ _id: id });
  return { $or: parts };
}

// ─── ROUTES ──────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', async (req, res) => {
  const state = ['disconnected','connected','connecting','disconnecting'];
  let dbOk = false;
  try { await connectDB(); dbOk = mongoose.connection.readyState === 1; } catch {}
  res.json({ status: 'OK', db: dbOk ? 'CONNECTED ✅' : 'DISCONNECTED ❌', readyState: state[mongoose.connection.readyState] });
});

// ── Auth ──────────────────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ success: false, error: 'Username and password required.' });
  if (String(username).trim() === ADMIN_USERNAME && String(password).trim() === ADMIN_PASSWORD) {
    return res.json({ success: true, token: generateToken(username), username });
  }
  return res.status(401).json({ success: false, error: 'Invalid credentials.' });
});

app.get('/api/auth/verify', (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (verifyToken(token)) return res.json({ valid: true });
  return res.status(401).json({ valid: false });
});

// ── Investors ─────────────────────────────────────────────────────────────────
app.get('/api/investors', requireDB, async (req, res) => {
  try { res.json(await Investor.find().sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/investors', requireDB, async (req, res) => {
  try {
    const { name, cnic, phone, vehicles, id, createdAt } = req.body;
    if (!name || !cnic) return res.status(400).json({ error: 'Name and CNIC required.' });

    // Always create a fresh record – never upsert on CNIC to avoid collisions from duplicates
    const doc = await Investor.create({
      id: id || `inv-${Date.now()}`,
      name: name.trim(), cnic: cnic.trim(), phone: (phone || '').trim(),
      vehicles: Array.isArray(vehicles) ? vehicles : [],
      createdAt: createdAt || new Date().toISOString()
    });
    res.status(201).json({ message: 'Investor saved!', investor: doc });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/investors/:id', requireDB, async (req, res) => {
  try {
    const update = sanitize(req.body);
    const doc = await Investor.findOneAndUpdate(idQuery(req.params.id), { $set: update }, { returnDocument: 'after', runValidators: false });
    if (!doc) return res.status(404).json({ error: 'Investor not found' });
    res.json({ message: 'Investor updated!', investor: doc });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/investors/:id', requireDB, async (req, res) => {
  try {
    await Investor.deleteOne(idQuery(req.params.id));
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Customer Rentals ──────────────────────────────────────────────────────────
app.get('/api/customer-rentals', requireDB, async (req, res) => {
  try { res.json(await CustomerRental.find().sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/customer-rentals', requireDB, async (req, res) => {
  try {
    const { customerName, customerCnic, carNameModel, carPlateNumber } = req.body;
    if (!customerName || !customerCnic || !carNameModel || !carPlateNumber)
      return res.status(400).json({ error: 'Customer Name, CNIC, Car Name, Plate required.' });
    const doc = await CustomerRental.create({
      id: req.body.id || `rent-${Date.now()}`,
      ...req.body,
      createdAt: req.body.createdAt || new Date().toISOString()
    });
    res.status(201).json({ message: 'Rental saved!', rental: doc });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/customer-rentals/:id', requireDB, async (req, res) => {
  try {
    const update = sanitize(req.body);
    const q = { $or: [{ id: req.params.id }, ...(mongoose.Types.ObjectId.isValid(req.params.id) ? [{ _id: req.params.id }] : [])] };
    const doc = await CustomerRental.findOneAndUpdate(q, { $set: update }, { returnDocument: 'after', runValidators: false });
    if (!doc) return res.status(404).json({ error: 'Rental not found' });
    res.json({ message: 'Rental updated!', rental: doc });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/customer-rentals/:id', requireDB, async (req, res) => {
  try {
    const q = { $or: [{ id: req.params.id }, ...(mongoose.Types.ObjectId.isValid(req.params.id) ? [{ _id: req.params.id }] : [])] };
    await CustomerRental.deleteOne(q);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Maintenance ───────────────────────────────────────────────────────────────
app.get('/api/maintenance', requireDB, async (req, res) => {
  try { res.json(await MaintenanceRecord.find().sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/maintenance', requireDB, async (req, res) => {
  try {
    const { carPlateNumber, serviceType } = req.body;
    if (!carPlateNumber || !serviceType) return res.status(400).json({ error: 'Plate and Service Type required.' });
    const doc = await MaintenanceRecord.create({
      id: req.body.id || `maint-${Date.now()}`,
      ...req.body,
      createdAt: req.body.createdAt || new Date().toISOString()
    });
    res.status(201).json({ message: 'Maintenance saved!', record: doc });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/maintenance/:id', requireDB, async (req, res) => {
  try {
    const update = sanitize(req.body);
    const q = { $or: [{ id: req.params.id }, ...(mongoose.Types.ObjectId.isValid(req.params.id) ? [{ _id: req.params.id }] : [])] };
    const doc = await MaintenanceRecord.findOneAndUpdate(q, { $set: update }, { returnDocument: 'after', runValidators: false });
    if (!doc) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record updated!', record: doc });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/maintenance/:id', requireDB, async (req, res) => {
  try {
    const q = { $or: [{ id: req.params.id }, ...(mongoose.Types.ObjectId.isValid(req.params.id) ? [{ _id: req.params.id }] : [])] };
    await MaintenanceRecord.deleteOne(q);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Backup / Restore ──────────────────────────────────────────────────────────
app.get('/api/backup/export', requireDB, async (req, res) => {
  try {
    const [investors, customerRentals, maintenanceLogs] = await Promise.all([
      Investor.find(), CustomerRental.find(), MaintenanceRecord.find()
    ]);
    const backup = { exportedAt: new Date().toISOString(), version: '2.0', investors, customerRentals, maintenanceLogs };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="alfalah_backup_${Date.now()}.json"`);
    res.json(backup);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/backup/restore', requireDB, async (req, res) => {
  try {
    const { investors = [], customerRentals = [], maintenanceLogs = [] } = req.body;
    await Promise.all([Investor.deleteMany({}), CustomerRental.deleteMany({}), MaintenanceRecord.deleteMany({})]);
    const [i, r, m] = await Promise.all([
      investors.length       ? Investor.insertMany(investors)               : [],
      customerRentals.length ? CustomerRental.insertMany(customerRentals)   : [],
      maintenanceLogs.length ? MaintenanceRecord.insertMany(maintenanceLogs): []
    ]);
    res.json({ message: 'Restored!', counts: { investors: i.length, customerRentals: r.length, maintenanceLogs: m.length } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Local dev server ──────────────────────────────────────────────────────────
if (require.main === module) {
  require('dotenv').config();
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => app.listen(PORT, () => console.log(`🚀 Dev server on http://localhost:${PORT}`)))
    .catch(e => { console.error('Startup error:', e.message); process.exit(1); });
}

module.exports = app;
