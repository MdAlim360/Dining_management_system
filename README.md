# 🍽️ Hall Dining Management System
## MongoDB + Node.js + Express Backend

সম্পূর্ণ সিস্টেম ৩০০ ছাত্রের জন্য deploy করার গাইড।

---

## 📁 ফাইল স্ট্রাকচার

```
dining-system/
├── server/
│   ├── index.js        # Express সার্ভার + সব API routes
│   └── models.js       # MongoDB (Mongoose) models
├── client/
│   └── public/
│       └── index.html  # পুরো frontend (single file)
├── package.json
├── .env.example        # Environment variables template
└── README.md
```

---

## 🚀 Deploy করার ধাপ (Free Tier)

### ১. MongoDB Atlas (Free Database)
1. [mongodb.com/cloud/atlas](https://cloud.mongodb.com) এ যান
2. **Free Cluster** তৈরি করুন (M0 - বিনামূল্যে)
3. Database User তৈরি করুন (username + password মনে রাখুন)
4. Network Access → Add IP Address → `0.0.0.0/0` (সব IP allow)
5. Connect → Drivers → Connection String কপি করুন
   - Format: `mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/dining_db`

### ২. Render.com (Free Server Deploy)
1. [render.com](https://render.com) এ যান → Free account
2. **New** → **Web Service**
3. GitHub থেকে এই project connect করুন অথবা ZIP upload করুন
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node server/index.js`
5. **Environment Variables** যোগ করুন:
   - `MONGODB_URI` = আপনার MongoDB Atlas connection string
   - `PORT` = `3000`
6. **Deploy** করুন → URL পাবেন (যেমন: `https://dining.onrender.com`)

### ৩. Railway.app (Alternative - Free $5/month credit)
```bash
# Railway CLI দিয়ে deploy
npm install -g @railway/cli
railway login
railway init
railway add
railway up
# Environment variable যোগ করুন MONGODB_URI
```

### ৪. Vercel (শুধু Static নয়, Serverless Functions)
```json
// vercel.json তৈরি করুন
{
  "version": 2,
  "builds": [{"src": "server/index.js", "use": "@vercel/node"}],
  "routes": [{"src": "/(.*)", "dest": "server/index.js"}]
}
```

---

## ⚙️ Local Development

```bash
# ১. Dependencies install
npm install

# ২. .env ফাইল তৈরি
cp .env.example .env
# .env ফাইল edit করে MONGODB_URI সেট করুন

# ৩. Server চালু করুন
npm start
# অথবা development mode:
npm run dev

# ৪. Browser এ যান
# http://localhost:3000
```

---

## 🔐 Default Login

**Admin:**
- Username: `admin100043`
- Password: `alim1234`

> ⚠️ প্রথম login-এর পরেই Settings থেকে password পরিবর্তন করুন!

---

## 📡 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/students` | সব ছাত্র |
| POST | `/api/students` | নতুন ছাত্র যোগ |
| PUT | `/api/students/:id` | ছাত্র update |
| DELETE | `/api/students/:id` | ছাত্র মুছুন |
| GET | `/api/payments` | সব পেমেন্ট |
| POST | `/api/payments` | নতুন পেমেন্ট |
| PUT | `/api/payments/:id` | পেমেন্ট update |
| GET | `/api/settings` | সেটিংস |
| PUT | `/api/settings` | সেটিংস update |
| GET | `/api/milrates` | মিল রেট |
| PUT | `/api/milrates` | মিল রেট update |
| GET | `/api/mealoffs` | মিল বন্ধের তালিকা |
| PUT | `/api/mealoffs` | মিল বন্ধ/চালু |
| GET | `/api/guestmeals` | গেস্ট মিল |
| POST | `/api/guestmeals` | নতুন গেস্ট মিল |
| GET | `/api/backup` | সম্পূর্ণ ব্যাকআপ JSON |
| POST | `/api/restore` | ব্যাকআপ থেকে পুনরুদ্ধার |
| ... | | অন্য সব endpoint |

---

## 💡 যেভাবে কাজ করে

```
Browser → API Request → Express Server → MongoDB Atlas
                    ↑
              In-memory cache
              (page load এ server থেকে সব data একসাথে fetch)
```

- **Page load এ:** সব data MongoDB থেকে in-memory cache এ আসে
- **User action এ:** cache update হয় → server এ async save হয়
- **300 ছাত্র:** MongoDB Atlas free tier (512MB) যথেষ্ট
- **Data loss নেই:** সব data MongoDB তে persistent

---

## 📦 Tech Stack
- **Frontend:** Vanilla HTML/CSS/JS (Bangla UI)
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Deploy:** Render.com / Railway / Vercel (free tier)

---

## ❓ সমস্যা হলে

1. MongoDB connection error → Atlas IP Whitelist চেক করুন
2. Port error → `PORT` env variable সেট করুন
3. Data দেখা যাচ্ছে না → Browser Console এ error দেখুন
