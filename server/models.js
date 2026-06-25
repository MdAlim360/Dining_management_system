const mongoose = require('mongoose');

// ==================== SETTINGS ====================
const SettingsSchema = new mongoose.Schema({
  _id: { type: String, default: 'global' },
  adminUser: { type: String, default: 'admin100043' },
  adminPass: { type: String, default: 'alim1234' },
  mealOffLocked: { type: Boolean, default: false },
  commentLocked: { type: Boolean, default: false },
  feedbackLocked: { type: Boolean, default: false },
  mealCutoffTimes: {
    sokal: { type: String, default: '09:00' },
    dopore: { type: String, default: '12:00' },
    ratre: { type: String, default: '19:30' },
  },
  bkashNumber: { type: String, default: '' },
  bkashType: { type: String, default: 'personal' },
  nagadNumber: { type: String, default: '' },
  nagadType: { type: String, default: 'personal' },
}, { _id: false });
const Settings = mongoose.model('Settings', SettingsSchema);

// ==================== SUB ADMINS ====================
const SubAdminSchema = new mongoose.Schema({
  user: String,
  pass: String,
  name: String,
}, { timestamps: true });
const SubAdmin = mongoose.model('SubAdmin', SubAdminSchema);

// ==================== ADMIN DINING DATES ====================
const DiningDatesSchema = new mongoose.Schema({
  _id: { type: String, default: 'dates' },
  start: String,
  end: String,
}, { _id: false });
const DiningDates = mongoose.model('DiningDates', DiningDatesSchema);

// ==================== MIL RATES ====================
const MilRatesSchema = new mongoose.Schema({
  _id: { type: String, default: 'rates' },
  sokal: { type: Number, default: 15 },
  dopore: { type: Number, default: 40 },
  ratre: { type: Number, default: 30 },
  cooking: { type: Number, default: 5 },
}, { _id: false });
const MilRates = mongoose.model('MilRates', MilRatesSchema);

// ==================== STUDENTS ====================
const StudentSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  name: String,
  batch: String,
  room: String,
  dept: String,
  hall: String,
  wa: String,
  password: String,
  meals: {
    sokal: Boolean,
    dopore: Boolean,
    ratre: Boolean,
  },
  dailyRate: Number,
  balance: { type: Number, default: 0 },
  diningStatus: { type: String, default: 'pending' },
  startDate: String,
  cycleEnd: String,
  createdAt: String,
}, { timestamps: true });
const Student = mongoose.model('Student', StudentSchema);

// ==================== PAYMENTS ====================
const PaymentSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  studentId: Number,
  studentName: String,
  amount: Number,
  method: String,
  charge: Number,
  netAmount: Number,
  txnId: String,
  payPhone: String,
  status: { type: String, default: 'pending' },
  depositDate: String,
  approvedAt: String,
  note: String,
  createdAt: String,
}, { timestamps: true });
const Payment = mongoose.model('Payment', PaymentSchema);

// ==================== NOTICES ====================
const NoticeSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  title: String,
  body: String,
  type: { type: String, default: 'normal' },
  time: String,
}, { timestamps: true });
const Notice = mongoose.model('Notice', NoticeSchema);

// ==================== POLLS ====================
const PollSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  question: String,
  options: [String],
  votes: [Number],
  active: { type: Boolean, default: true },
}, { timestamps: true });
const Poll = mongoose.model('Poll', PollSchema);

// ==================== FEEDBACKS ====================
const FeedbackSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  cat: String,
  text: String,
  author: String,
  time: String,
}, { timestamps: true });
const Feedback = mongoose.model('Feedback', FeedbackSchema);

// ==================== COMMENTS ====================
// key = "YYYY-MM-DD_meal"
const CommentSchema = new mongoose.Schema({
  key: { type: String, index: true },
  author: String,
  text: String,
  time: String,
}, { timestamps: true });
const Comment = mongoose.model('Comment', CommentSchema);

// ==================== RATINGS ====================
// key = "YYYY-MM-DD_meal", values = array of numbers
const RatingSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  values: [Number],
});
const Rating = mongoose.model('Rating', RatingSchema);

// ==================== MENUS ====================
// date → { sokal, dopore, ratre }
const MenuSchema = new mongoose.Schema({
  date: { type: String, unique: true, index: true },
  sokal: mongoose.Schema.Types.Mixed,
  dopore: mongoose.Schema.Types.Mixed,
  ratre: mongoose.Schema.Types.Mixed,
});
const Menu = mongoose.model('Menu', MenuSchema);

// ==================== MEAL OFFS ====================
// { studentId, date, meals: ['sokal','dopore','ratre'] }
const MealOffSchema = new mongoose.Schema({
  studentId: { type: Number, index: true },
  date: String,
  meals: [String],
});
MealOffSchema.index({ studentId: 1, date: 1 }, { unique: true });
const MealOff = mongoose.model('MealOff', MealOffSchema);

// ==================== TEMP MEAL ONS ====================
const TempMealOnSchema = new mongoose.Schema({
  studentId: { type: Number, index: true },
  date: String,
  meals: [String],
});
TempMealOnSchema.index({ studentId: 1, date: 1 }, { unique: true });
const TempMealOn = mongoose.model('TempMealOn', TempMealOnSchema);

// ==================== GUEST MEALS ====================
const GuestMealSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  studentId: Number,
  studentName: String,
  guestName: String,
  dates: [String],
  meals: [String],
  perDay: Number,
  total: Number,
  chargeSokal: Number,
  chargeDopore: Number,
  chargeRatre: Number,
  chargeCooking: Number,
  status: { type: String, default: 'approved' },
  createdAt: String,
}, { timestamps: true });
const GuestMeal = mongoose.model('GuestMeal', GuestMealSchema);

// ==================== BAZAR ====================
const BazarSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  date: String,
  items: mongoose.Schema.Types.Mixed,
  cost: Number,
  note: String,
}, { timestamps: true });
const Bazar = mongoose.model('Bazar', BazarSchema);

// ==================== BAZAR STOCK ====================
const BazarStockSchema = new mongoose.Schema({
  _id: { type: String, default: 'stock' },
  items: mongoose.Schema.Types.Mixed,
}, { _id: false });
const BazarStock = mongoose.model('BazarStock', BazarStockSchema);

// ==================== EXTRA MEALS ====================
// date → { sokal, dopore, ratre }
const ExtraMealSchema = new mongoose.Schema({
  date: { type: String, unique: true },
  sokal: { type: Number, default: 0 },
  dopore: { type: Number, default: 0 },
  ratre: { type: Number, default: 0 },
});
const ExtraMeal = mongoose.model('ExtraMeal', ExtraMealSchema);

// ==================== AUDIT LOG ====================
const AuditSchema = new mongoose.Schema({
  id: Number,
  action: String,
  targetStudentId: Number,
  targetStudentName: String,
  details: String,
  performedBy: String,
  timestamp: String,
}, { timestamps: true });
const Audit = mongoose.model('Audit', AuditSchema);

// ==================== BILLS ====================
const BillSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  studentId: Number,
  studentName: String,
  startDate: String,
  endDate: String,
  breakdown: mongoose.Schema.Types.Mixed,
  totalBill: Number,
  note: String,
  createdAt: String,
}, { timestamps: true });
const Bill = mongoose.model('Bill', BillSchema);

// ==================== MESSAGES ====================
const MessageSchema = new mongoose.Schema({
  id: Number,
  studentId: Number,
  studentName: String,
  text: String,
  senderType: String,
  time: String,
  read: { type: Boolean, default: false },
  createdAt: String,
}, { timestamps: true });
const Message = mongoose.model('Message', MessageSchema);

module.exports = {
  Settings, SubAdmin, DiningDates, MilRates, Student, Payment,
  Notice, Poll, Feedback, Comment, Rating, Menu, MealOff, TempMealOn,
  GuestMeal, Bazar, BazarStock, ExtraMeal, Audit, Bill, Message,
};
