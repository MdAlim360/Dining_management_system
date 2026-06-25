require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const path = require('path');

const {
  Settings, SubAdmin, DiningDates, MilRates, Student, Payment,
  Notice, Poll, Feedback, Comment, Rating, Menu, MealOff, TempMealOn,
  GuestMeal, Bazar, BazarStock, ExtraMeal, Audit, Bill, Message,
} = require('./models');

const app = express();
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, '../client/public')));

// ==================== DB CONNECT ====================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dining_db')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ==================== HELPERS ====================
function ts() { return Date.now(); }

// Initialize default settings if not exists
async function ensureSettings() {
  const s = await Settings.findById('global');
  if (!s) await Settings.create({ _id: 'global' });
}
async function ensureRates() {
  const r = await MilRates.findById('rates');
  if (!r) await MilRates.create({ _id: 'rates' });
}

// ==================== SETTINGS ====================
app.get('/api/settings', async (req, res) => {
  await ensureSettings();
  const s = await Settings.findById('global').lean();
  res.json(s);
});

app.put('/api/settings', async (req, res) => {
  await Settings.findByIdAndUpdate('global', req.body, { upsert: true, new: true });
  res.json({ ok: true });
});

// ==================== SUB ADMINS ====================
app.get('/api/subadmins', async (req, res) => {
  res.json(await SubAdmin.find().lean());
});
app.post('/api/subadmins', async (req, res) => {
  const sa = await SubAdmin.create(req.body);
  res.json(sa);
});
app.delete('/api/subadmins/:id', async (req, res) => {
  await SubAdmin.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// ==================== DINING DATES ====================
app.get('/api/dining-dates', async (req, res) => {
  const d = await DiningDates.findById('dates').lean();
  res.json(d || null);
});
app.put('/api/dining-dates', async (req, res) => {
  await DiningDates.findByIdAndUpdate('dates', req.body, { upsert: true, new: true });
  res.json({ ok: true });
});

// ==================== MIL RATES ====================
app.get('/api/milrates', async (req, res) => {
  await ensureRates();
  res.json(await MilRates.findById('rates').lean());
});
app.put('/api/milrates', async (req, res) => {
  await MilRates.findByIdAndUpdate('rates', req.body, { upsert: true, new: true });
  res.json({ ok: true });
});

// ==================== STUDENTS ====================
app.get('/api/students', async (req, res) => {
  res.json(await Student.find().lean());
});
app.get('/api/students/:id', async (req, res) => {
  const s = await Student.findOne({ id: parseInt(req.params.id) }).lean();
  res.json(s || null);
});
app.post('/api/students', async (req, res) => {
  try {
    const s = await Student.create(req.body);
    res.json(s);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
app.put('/api/students/:id', async (req, res) => {
  const s = await Student.findOneAndUpdate(
    { id: parseInt(req.params.id) }, req.body, { new: true }
  ).lean();
  res.json(s);
});
app.delete('/api/students/:id', async (req, res) => {
  const sid = parseInt(req.params.id);
  await Student.deleteOne({ id: sid });
  // Clean up related data
  await Payment.deleteMany({ studentId: sid });
  await MealOff.deleteMany({ studentId: sid });
  await TempMealOn.deleteMany({ studentId: sid });
  await GuestMeal.deleteMany({ studentId: sid });
  await Message.deleteMany({ studentId: sid });
  await Bill.deleteMany({ studentId: sid });
  res.json({ ok: true });
});

// Student login
app.post('/api/students/login', async (req, res) => {
  const { name, password } = req.body;
  const s = await Student.findOne({ name, password }).lean();
  if (!s) return res.status(401).json({ error: 'ভুল নাম বা পাসওয়ার্ড' });
  res.json(s);
});

// ==================== PAYMENTS ====================
app.get('/api/payments', async (req, res) => {
  const filter = {};
  if (req.query.studentId) filter.studentId = parseInt(req.query.studentId);
  if (req.query.status) filter.status = req.query.status;
  res.json(await Payment.find(filter).lean());
});
app.post('/api/payments', async (req, res) => {
  const p = await Payment.create({ ...req.body, id: ts() + Math.floor(Math.random()*1000) });
  res.json(p);
});
app.put('/api/payments/:id', async (req, res) => {
  const p = await Payment.findOneAndUpdate(
    { id: parseInt(req.params.id) }, req.body, { new: true }
  ).lean();
  res.json(p);
});
app.delete('/api/payments/:id', async (req, res) => {
  await Payment.deleteOne({ id: parseInt(req.params.id) });
  res.json({ ok: true });
});

// ==================== NOTICES ====================
app.get('/api/notices', async (req, res) => {
  res.json(await Notice.find().sort({ _id: -1 }).lean());
});
app.post('/api/notices', async (req, res) => {
  const n = await Notice.create({ ...req.body, id: ts() });
  res.json(n);
});
app.delete('/api/notices/:id', async (req, res) => {
  await Notice.deleteOne({ id: parseInt(req.params.id) });
  res.json({ ok: true });
});

// ==================== POLLS ====================
app.get('/api/polls', async (req, res) => {
  res.json(await Poll.find().sort({ _id: -1 }).lean());
});
app.post('/api/polls', async (req, res) => {
  const p = await Poll.create({ ...req.body, id: ts() });
  res.json(p);
});
app.put('/api/polls/:id', async (req, res) => {
  const p = await Poll.findOneAndUpdate(
    { id: parseInt(req.params.id) }, req.body, { new: true }
  ).lean();
  res.json(p);
});
app.delete('/api/polls/:id', async (req, res) => {
  await Poll.deleteOne({ id: parseInt(req.params.id) });
  res.json({ ok: true });
});

// ==================== FEEDBACKS ====================
app.get('/api/feedbacks', async (req, res) => {
  res.json(await Feedback.find().sort({ _id: -1 }).lean());
});
app.post('/api/feedbacks', async (req, res) => {
  const f = await Feedback.create({ ...req.body, id: ts() });
  res.json(f);
});
app.delete('/api/feedbacks/:id', async (req, res) => {
  await Feedback.deleteOne({ id: parseInt(req.params.id) });
  res.json({ ok: true });
});

// ==================== COMMENTS ====================
// key = "YYYY-MM-DD_meal"
app.get('/api/comments', async (req, res) => {
  const { key } = req.query;
  const filter = key ? { key } : {};
  const comments = await Comment.find(filter).sort({ _id: -1 }).lean();
  // Return as { key: [...] } grouped object OR array
  if (key) return res.json(comments);
  // Group by key
  const grouped = {};
  comments.forEach(c => {
    if (!grouped[c.key]) grouped[c.key] = [];
    grouped[c.key].push(c);
  });
  res.json(grouped);
});
app.post('/api/comments', async (req, res) => {
  const c = await Comment.create(req.body);
  res.json(c);
});

// ==================== RATINGS ====================
app.get('/api/ratings', async (req, res) => {
  const { key } = req.query;
  if (key) {
    const r = await Rating.findOne({ key }).lean();
    return res.json(r ? r.values : []);
  }
  const all = await Rating.find().lean();
  const obj = {};
  all.forEach(r => { obj[r.key] = r.values; });
  res.json(obj);
});
app.post('/api/ratings', async (req, res) => {
  const { key, value } = req.body;
  await Rating.findOneAndUpdate(
    { key }, { $push: { values: value } }, { upsert: true, new: true }
  );
  res.json({ ok: true });
});

// ==================== MENUS ====================
app.get('/api/menus', async (req, res) => {
  const { date } = req.query;
  if (date) {
    const m = await Menu.findOne({ date }).lean();
    return res.json(m || null);
  }
  const all = await Menu.find().lean();
  const obj = {};
  all.forEach(m => { obj[m.date] = m; });
  res.json(obj);
});
app.put('/api/menus/:date', async (req, res) => {
  const m = await Menu.findOneAndUpdate(
    { date: req.params.date }, req.body, { upsert: true, new: true }
  ).lean();
  res.json(m);
});

// ==================== MEAL OFFS ====================
app.get('/api/mealoffs', async (req, res) => {
  const { studentId } = req.query;
  const filter = studentId ? { studentId: parseInt(studentId) } : {};
  const offs = await MealOff.find(filter).lean();
  // Return as { studentId: { date: meals[] } }
  const obj = {};
  offs.forEach(o => {
    if (!obj[o.studentId]) obj[o.studentId] = {};
    obj[o.studentId][o.date] = o.meals;
  });
  res.json(obj);
});
app.put('/api/mealoffs', async (req, res) => {
  // Body: { studentId, date, meals }
  const { studentId, date, meals } = req.body;
  if (!meals || meals.length === 0) {
    await MealOff.deleteOne({ studentId, date });
  } else {
    await MealOff.findOneAndUpdate(
      { studentId, date }, { meals }, { upsert: true }
    );
  }
  res.json({ ok: true });
});
app.delete('/api/mealoffs', async (req, res) => {
  const { studentId, date } = req.body;
  await MealOff.deleteOne({ studentId, date });
  res.json({ ok: true });
});

// ==================== TEMP MEAL ONS ====================
app.get('/api/tempmealons', async (req, res) => {
  const { studentId } = req.query;
  const filter = studentId ? { studentId: parseInt(studentId) } : {};
  const items = await TempMealOn.find(filter).lean();
  const obj = {};
  items.forEach(t => {
    if (!obj[t.studentId]) obj[t.studentId] = {};
    obj[t.studentId][t.date] = t.meals;
  });
  res.json(obj);
});
app.put('/api/tempmealons', async (req, res) => {
  const { studentId, date, meals } = req.body;
  if (!meals || meals.length === 0) {
    await TempMealOn.deleteOne({ studentId, date });
  } else {
    await TempMealOn.findOneAndUpdate(
      { studentId, date }, { meals }, { upsert: true }
    );
  }
  res.json({ ok: true });
});
app.delete('/api/tempmealons', async (req, res) => {
  const { studentId, date } = req.body;
  await TempMealOn.deleteOne({ studentId, date });
  res.json({ ok: true });
});

// ==================== GUEST MEALS ====================
app.get('/api/guestmeals', async (req, res) => {
  const filter = {};
  if (req.query.studentId) filter.studentId = parseInt(req.query.studentId);
  if (req.query.status) filter.status = req.query.status;
  res.json(await GuestMeal.find(filter).lean());
});
app.post('/api/guestmeals', async (req, res) => {
  const g = await GuestMeal.create({ ...req.body, id: ts() + Math.floor(Math.random()*1000) });
  res.json(g);
});
app.put('/api/guestmeals/:id', async (req, res) => {
  const g = await GuestMeal.findOneAndUpdate(
    { id: parseInt(req.params.id) }, req.body, { new: true }
  ).lean();
  res.json(g);
});
app.delete('/api/guestmeals/:id', async (req, res) => {
  await GuestMeal.deleteOne({ id: parseInt(req.params.id) });
  res.json({ ok: true });
});

// ==================== BAZAR ====================
app.get('/api/bazar', async (req, res) => {
  res.json(await Bazar.find().sort({ date: -1 }).lean());
});
app.post('/api/bazar', async (req, res) => {
  const b = await Bazar.create({ ...req.body, id: ts() });
  res.json(b);
});
app.put('/api/bazar/:id', async (req, res) => {
  const b = await Bazar.findOneAndUpdate(
    { id: parseInt(req.params.id) }, req.body, { new: true }
  ).lean();
  res.json(b);
});
app.delete('/api/bazar/:id', async (req, res) => {
  await Bazar.deleteOne({ id: parseInt(req.params.id) });
  res.json({ ok: true });
});

// Bazar Stock
app.get('/api/bazar-stock', async (req, res) => {
  const s = await BazarStock.findById('stock').lean();
  res.json(s ? s.items : {});
});
app.put('/api/bazar-stock', async (req, res) => {
  await BazarStock.findByIdAndUpdate('stock', { items: req.body }, { upsert: true });
  res.json({ ok: true });
});

// ==================== EXTRA MEALS ====================
app.get('/api/extrameals', async (req, res) => {
  const all = await ExtraMeal.find().lean();
  const obj = {};
  all.forEach(e => { obj[e.date] = { sokal: e.sokal, dopore: e.dopore, ratre: e.ratre }; });
  res.json(obj);
});
app.put('/api/extrameals/:date', async (req, res) => {
  await ExtraMeal.findOneAndUpdate(
    { date: req.params.date }, req.body, { upsert: true }
  );
  res.json({ ok: true });
});

// ==================== AUDIT LOG ====================
app.get('/api/audit', async (req, res) => {
  res.json(await Audit.find().sort({ _id: -1 }).limit(500).lean());
});
app.post('/api/audit', async (req, res) => {
  await Audit.create({ ...req.body, id: ts() });
  res.json({ ok: true });
});
app.delete('/api/audit', async (req, res) => {
  await Audit.deleteMany({});
  res.json({ ok: true });
});

// ==================== BILLS ====================
app.get('/api/bills', async (req, res) => {
  const filter = {};
  if (req.query.studentId) filter.studentId = parseInt(req.query.studentId);
  res.json(await Bill.find(filter).lean());
});
app.post('/api/bills', async (req, res) => {
  const b = await Bill.create({ ...req.body, id: ts() });
  res.json(b);
});
app.delete('/api/bills/:id', async (req, res) => {
  await Bill.deleteOne({ id: parseInt(req.params.id) });
  res.json({ ok: true });
});
app.delete('/api/bills', async (req, res) => {
  await Bill.deleteMany({});
  res.json({ ok: true });
});

// ==================== MESSAGES ====================
app.get('/api/messages', async (req, res) => {
  const filter = {};
  if (req.query.studentId) filter.studentId = parseInt(req.query.studentId);
  res.json(await Message.find(filter).lean());
});
app.post('/api/messages', async (req, res) => {
  const m = await Message.create({ ...req.body, id: ts() });
  res.json(m);
});
app.put('/api/messages/:id', async (req, res) => {
  const m = await Message.findOneAndUpdate(
    { id: parseInt(req.params.id) }, req.body, { new: true }
  ).lean();
  res.json(m);
});

// ==================== BULK DATA (backup/restore) ====================
app.get('/api/backup', async (req, res) => {
  const [settings, diningDates, milRates, students, payments, notices, polls, feedbacks,
    mealoffs, tempmealons, guestmeals, bazar, extrameals, audit, bills, messages, subAdmins] = await Promise.all([
    Settings.findById('global').lean(),
    DiningDates.findById('dates').lean(),
    MilRates.findById('rates').lean(),
    Student.find().lean(),
    Payment.find().lean(),
    Notice.find().lean(),
    Poll.find().lean(),
    Feedback.find().lean(),
    MealOff.find().lean(),
    TempMealOn.find().lean(),
    GuestMeal.find().lean(),
    Bazar.find().lean(),
    ExtraMeal.find().lean(),
    Audit.find().lean(),
    Bill.find().lean(),
    Message.find().lean(),
    SubAdmin.find().lean(),
  ]);
  res.json({ settings, diningDates, milRates, students, payments, notices, polls, feedbacks,
    mealoffs, tempmealons, guestmeals, bazar, extrameals, audit, bills, messages, subAdmins,
    exportedAt: new Date().toISOString() });
});

app.post('/api/restore', async (req, res) => {
  try {
    const data = req.body;
    // Clear and restore each collection
    const ops = [];
    if (data.settings) ops.push(Settings.findByIdAndUpdate('global', data.settings, { upsert: true }));
    if (data.diningDates) ops.push(DiningDates.findByIdAndUpdate('dates', data.diningDates, { upsert: true }));
    if (data.milRates) ops.push(MilRates.findByIdAndUpdate('rates', data.milRates, { upsert: true }));
    if (data.students) { ops.push(Student.deleteMany({})); ops.push(Student.insertMany(data.students, { ordered: false }).catch(()=>{})); }
    if (data.payments) { ops.push(Payment.deleteMany({})); ops.push(Payment.insertMany(data.payments, { ordered: false }).catch(()=>{})); }
    if (data.notices) { ops.push(Notice.deleteMany({})); ops.push(Notice.insertMany(data.notices, { ordered: false }).catch(()=>{})); }
    if (data.polls) { ops.push(Poll.deleteMany({})); ops.push(Poll.insertMany(data.polls, { ordered: false }).catch(()=>{})); }
    if (data.feedbacks) { ops.push(Feedback.deleteMany({})); ops.push(Feedback.insertMany(data.feedbacks, { ordered: false }).catch(()=>{})); }
    if (data.mealoffs) { ops.push(MealOff.deleteMany({})); ops.push(MealOff.insertMany(data.mealoffs, { ordered: false }).catch(()=>{})); }
    if (data.tempmealons) { ops.push(TempMealOn.deleteMany({})); ops.push(TempMealOn.insertMany(data.tempmealons, { ordered: false }).catch(()=>{})); }
    if (data.guestmeals) { ops.push(GuestMeal.deleteMany({})); ops.push(GuestMeal.insertMany(data.guestmeals, { ordered: false }).catch(()=>{})); }
    if (data.bazar) { ops.push(Bazar.deleteMany({})); ops.push(Bazar.insertMany(data.bazar, { ordered: false }).catch(()=>{})); }
    if (data.extrameals) { ops.push(ExtraMeal.deleteMany({})); ops.push(ExtraMeal.insertMany(data.extrameals, { ordered: false }).catch(()=>{})); }
    if (data.bills) { ops.push(Bill.deleteMany({})); ops.push(Bill.insertMany(data.bills, { ordered: false }).catch(()=>{})); }
    if (data.messages) { ops.push(Message.deleteMany({})); ops.push(Message.insertMany(data.messages, { ordered: false }).catch(()=>{})); }
    if (data.subAdmins) { ops.push(SubAdmin.deleteMany({})); ops.push(SubAdmin.insertMany(data.subAdmins, { ordered: false }).catch(()=>{})); }
    await Promise.all(ops);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== SERVE FRONTEND ====================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
