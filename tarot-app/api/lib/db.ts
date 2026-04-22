// MongoDB 连接和模型定义

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

let isConnected = false;

export async function connectDB(): Promise<void> {
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
    throw error;
  }
}

export function getConnectionStatus(): boolean {
  return isConnected;
}

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 20 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  points: { type: Number, default: 0 },
  inviteCode: { type: String, unique: true, sparse: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastCheckIn: { type: Date, default: null },
  dailyReadings: { type: Number, default: 0 },
  lastReadingDate: { type: String, default: '' },
  birthday: { type: String, default: '' },
  checkInStreak: { type: Number, default: 0 },
  totalCheckIns: { type: Number, default: 0 },
  achievements: [{ type: String }],
  membership: { type: String, enum: ['free', 'monthly', 'yearly'], default: 'free' },
  membershipExpiry: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Reading Schema
const ReadingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'User' },
  question: { type: String, default: '' },
  spreadType: { type: String, required: true },
  spreadName: { type: String, default: '' },
  cards: [{
    id: String,
    name: String,
    nameEn: String,
    suit: String,
    arcana: String,
    image: String,
    meaning: String,
    meaningReversed: String,
    position: String,
    orientation: { type: String, enum: ['upright', 'reversed'], default: 'upright' }
  }],
  interpretation: { type: String, required: true },
  readerStyle: { type: String, default: 'mystic' },
  yesNoResult: { type: String, enum: ['yes', 'no', 'maybe', null], default: null },
  followUps: [{
    question: { type: String, required: true },
    answer: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
  shareId: { type: String, unique: true, sparse: true },
  isShared: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// AnonReading Schema
const AnonReadingSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  date: { type: String, required: true },
  count: { type: Number, default: 0 },
});
AnonReadingSchema.index({ ip: 1, date: 1 }, { unique: true });

// DailyFortune Schema
const DailyFortuneSchema = new mongoose.Schema({
  date: { type: String, required: true },
  zodiac: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cardName: { type: String },
  cardNameEn: { type: String },
  cardImage: { type: String },
  cardOrientation: { type: String },
  fortune: { type: String },
  overall: { type: Number, min: 1, max: 5 },
  love: { type: Number, min: 1, max: 5 },
  career: { type: Number, min: 1, max: 5 },
  wealth: { type: Number, min: 1, max: 5 },
  health: { type: Number, min: 1, max: 5 },
  luckyNumber: { type: Number },
  luckyColor: { type: String },
  advice: { type: String },
  lang: { type: String, default: 'zh-CN' },
  createdAt: { type: Date, default: Date.now },
});
DailyFortuneSchema.index({ date: 1, zodiac: 1, lang: 1 }, { unique: true });

// PointsLog Schema
const PointsLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  type: { type: String, required: true, enum: ['checkin', 'share', 'invite', 'recharge', 'spend', 'subscribe', 'lucky_draw', 'achievement'] },
  amount: { type: Number, required: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

// 动态获取或创建模型（避免热重载时的重复定义错误）
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Reading = mongoose.models.Reading || mongoose.model('Reading', ReadingSchema);
export const AnonReading = mongoose.models.AnonReading || mongoose.model('AnonReading', AnonReadingSchema);
export const DailyFortune = mongoose.models.DailyFortune || mongoose.model('DailyFortune', DailyFortuneSchema);
export const PointsLog = mongoose.models.PointsLog || mongoose.model('PointsLog', PointsLogSchema);

// 导入 bcrypt 用于密码处理
import bcrypt from 'bcryptjs';
