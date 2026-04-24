// Admin API — standalone serverless function (separated from main API for security)
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || '';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  if (!MONGODB_URI) {
    console.log('MONGODB_URI not set, skipping DB connection');
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Schemas & Models
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 20 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  points: { type: Number, default: 0 },
  membership: { type: String, enum: ['free', 'weekly', 'monthly', 'yearly'], default: 'free' },
  membershipExpiry: { type: Date },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  birthday: { type: String },
  inviteCode: { type: String, unique: true, sparse: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastCheckIn: { type: Date },
  checkInStreak: { type: Number, default: 0 },
  totalCheckIns: { type: Number, default: 0 },
  lastReadingDate: { type: String },
  dailyReadings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
UserSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

const ReadingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  spreadType: { type: String },
  spreadName: { type: String },
  cards: [{ name: String, image: String, orientation: String, position: Number }],
  question: { type: String },
  interpretation: { type: String },
  readerStyle: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const PointsLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  type: { type: String, required: true, enum: ['checkin', 'share', 'invite', 'recharge', 'spend', 'subscribe', 'lucky_draw', 'achievement'] },
  amount: { type: Number, required: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const ErrorLogSchema = new mongoose.Schema({
  type: { type: String, required: true },
  message: { type: String, required: true },
  stack: { type: String },
  path: { type: String },
  method: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId },
  createdAt: { type: Date, default: Date.now },
});

const RequestLogSchema = new mongoose.Schema({
  path: { type: String },
  method: { type: String },
  status: { type: Number },
  duration: { type: Number },
  ip: { type: String },
  userAgent: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Reading = mongoose.models.Reading || mongoose.model('Reading', ReadingSchema);
const PointsLog = mongoose.models.PointsLog || mongoose.model('PointsLog', PointsLogSchema);
const ErrorLog = mongoose.models.ErrorLog || mongoose.model('ErrorLog', ErrorLogSchema);
const RequestLog = mongoose.models.RequestLog || mongoose.model('RequestLog', RequestLogSchema);

// Auth
function getTokenFromRequest(req: any): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenMatch = cookies.match(/token=([^;]+)/);
    if (tokenMatch) return decodeURIComponent(tokenMatch[1]);
  }
  return null;
}

const authMiddleware = async (req: any, res: any, silent = false) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      if (!silent) res.status(401).json({ message: 'Authentication required' });
      return null;
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (error) {
    if (!silent) res.status(401).json({ message: 'Invalid token' });
    return null;
  }
};

const ADMIN_EMAILS = ['paul89114@126.com'];
const adminMiddleware = async (req: any, res: any) => {
  const userId = await authMiddleware(req, res, true);
  if (!userId) return null;
  const user = await User.findById(userId);
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    res.status(403).json({ message: 'Admin access required' });
    return null;
  }
  return userId;
};

// CORS
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://2or.com').split(',').map(o => o.trim());
function getCorsHeaders(req: any) {
  const origin = req.headers.origin;
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

// Admin Handlers
async function handleAdminDashboard(req: any, res: any) {
  const adminId = await adminMiddleware(req, res);
  if (!adminId) return;

  try {
    const totalUsers = await User.countDocuments();
    const totalReadings = await Reading.countDocuments();
    const totalPointsLogs = await PointsLog.countDocuments();
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayUsers = await User.countDocuments({ createdAt: { $gte: todayStart } });
    const todayReadings = await Reading.countDocuments({ createdAt: { $gte: todayStart } });

    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const dailyStats = await Reading.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const dailyRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const membershipStats = await User.aggregate([
      { $group: { _id: '$membership', count: { $sum: 1 } } }
    ]);

    const recentErrors = await ErrorLog.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    return res.status(200).json({
      totalUsers, totalReadings, totalPointsLogs,
      todayUsers, todayReadings, recentErrors,
      dailyStats, dailyRegistrations, membershipStats,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Dashboard error', error: error.message });
  }
}

async function handleAdminUsers(req: any, res: any) {
  const adminId = await adminMiddleware(req, res);
  if (!adminId) return;

  try {
    const { page = 1, limit = 20, search = '', role = '', sort = 'createdAt' } = req.query;
    const query: any = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .sort({ [sort as string]: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    return res.status(200).json({ users, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
}

async function handleAdminUpdateUser(req: any, res: any) {
  const adminId = await adminMiddleware(req, res);
  if (!adminId) return;

  try {
    const { userId, username, email, points, membership, role, membershipExpiry } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });

    const update: any = {};
    if (username !== undefined) update.username = username;
    if (email !== undefined) update.email = email;
    if (points !== undefined) update.points = points;
    if (membership !== undefined) update.membership = membership;
    if (role !== undefined) update.role = role;
    if (membershipExpiry !== undefined) update.membershipExpiry = membershipExpiry;

    const user = await User.findByIdAndUpdate(userId, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json(user);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating user', error: error.message });
  }
}

async function handleAdminDeleteUser(req: any, res: any) {
  const adminId = await adminMiddleware(req, res);
  if (!adminId) return;

  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    if (userId === adminId.toString()) return res.status(400).json({ message: 'Cannot delete yourself' });

    await User.findByIdAndDelete(userId);
    await Reading.deleteMany({ userId });
    await PointsLog.deleteMany({ userId });

    return res.status(200).json({ message: 'User deleted' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
}

async function handleAdminReadings(req: any, res: any) {
  const adminId = await adminMiddleware(req, res);
  if (!adminId) return;

  try {
    const { page = 1, limit = 20, userId = '' } = req.query;
    const query: any = {};
    if (userId) query.userId = userId;

    const readings = await Reading.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .select('-interpretation');

    const total = await Reading.countDocuments(query);

    return res.status(200).json({ readings, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching readings', error: error.message });
  }
}

async function handleAdminPointsLogs(req: any, res: any) {
  const adminId = await adminMiddleware(req, res);
  if (!adminId) return;

  try {
    const { page = 1, limit = 20, userId = '', type = '' } = req.query;
    const query: any = {};
    if (userId) query.userId = userId;
    if (type) query.type = type;

    const logs = await PointsLog.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await PointsLog.countDocuments(query);

    return res.status(200).json({ logs, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching points logs', error: error.message });
  }
}

async function handleAdminErrorLogs(req: any, res: any) {
  const adminId = await adminMiddleware(req, res);
  if (!adminId) return;

  try {
    const { page = 1, limit = 50, type = '' } = req.query;
    const query: any = {};
    if (type) query.type = type;

    const logs = await ErrorLog.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await ErrorLog.countDocuments(query);

    return res.status(200).json({ logs, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching error logs', error: error.message });
  }
}

async function handleAdminRequestLogs(req: any, res: any) {
  const adminId = await adminMiddleware(req, res);
  if (!adminId) return;

  try {
    const { page = 1, limit = 50, path: logPath = '', method: logMethod = '' } = req.query;
    const query: any = {};
    if (logPath) query.path = { $regex: logPath, $options: 'i' };
    if (logMethod) query.method = logMethod;

    const logs = await RequestLog.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await RequestLog.countDocuments(query);

    return res.status(200).json({ logs, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching request logs', error: error.message });
  }
}

async function handleAdminClearErrorLogs(req: any, res: any) {
  const adminId = await adminMiddleware(req, res);
  if (!adminId) return;

  try {
    const { beforeDays = 30 } = req.body;
    const cutoff = new Date(Date.now() - Number(beforeDays) * 86400000);
    const result = await ErrorLog.deleteMany({ createdAt: { $lt: cutoff } });
    return res.status(200).json({ deleted: result.deletedCount });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error clearing logs', error: error.message });
  }
}

async function handleAdminClearRequestLogs(req: any, res: any) {
  const adminId = await adminMiddleware(req, res);
  if (!adminId) return;

  try {
    const { beforeDays = 30 } = req.body;
    const cutoff = new Date(Date.now() - Number(beforeDays) * 86400000);
    const result = await RequestLog.deleteMany({ createdAt: { $lt: cutoff } });
    return res.status(200).json({ deleted: result.deletedCount });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error clearing logs', error: error.message });
  }
}

// Main handler
export default async function handler(req: any, res: any) {
  await connectDB();

  const corsHeaders = getCorsHeaders(req);
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.url?.split('?')[0] || '';
  const method = req.method;

  if (path === '/api/admin/dashboard' && method === 'GET') return handleAdminDashboard(req, res);
  if (path === '/api/admin/users' && method === 'GET') return handleAdminUsers(req, res);
  if (path === '/api/admin/users' && method === 'PUT') return handleAdminUpdateUser(req, res);
  if (path === '/api/admin/users' && method === 'DELETE') return handleAdminDeleteUser(req, res);
  if (path === '/api/admin/readings' && method === 'GET') return handleAdminReadings(req, res);
  if (path === '/api/admin/points-logs' && method === 'GET') return handleAdminPointsLogs(req, res);
  if (path === '/api/admin/error-logs' && method === 'GET') return handleAdminErrorLogs(req, res);
  if (path === '/api/admin/request-logs' && method === 'GET') return handleAdminRequestLogs(req, res);
  if (path === '/api/admin/error-logs' && method === 'DELETE') return handleAdminClearErrorLogs(req, res);
  if (path === '/api/admin/request-logs' && method === 'DELETE') return handleAdminClearRequestLogs(req, res);

  return res.status(404).json({ message: 'Not found' });
}
