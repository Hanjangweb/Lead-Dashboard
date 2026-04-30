# SaaS Lead Dashboard & Reporting System

A premium, full-stack lead management system built with Node.js, MongoDB, and React.

## Deployment Instructions (Render)

### 1. Backend Deployment (Node.js)
1. Create a **New Web Service** on Render.
2. Connect your GitHub repository.
3. **Root Directory:** `backend`
4. **Environment:** `Node`
5. **Build Command:** `npm install`
6. **Start Command:** `node server.js`
7. **Environment Variables:**
   - `PORT`: `9000` (or leave default)
   - `MONGO_URI`: `Your MongoDB Connection String`
   - `JWT_SECRET`: `Your Secret Key`
   - `DB_NAME`: `LeadDashboard`

### 2. Frontend Deployment (React/Vite)
1. Go to your Vercel Dashboard and select Add New > Project.
2. Import your GitHub repository.
3. Framework Preset: Select Vite (Vercel usually auto-detects this).
4. **Root Directory:** `frontend`
5. **Build Command:** `npm install; npm run build`
6. **Publish Directory:** `dist`
7. **Environment Variables:**
   - `VITE_API_URL`: `https://your-backend-url.onrender.com/api`
8. Click Deploy.

<<<<<<< HEAD
9. **Note:** To ensure client-side routing works correctly on Vercel (preventing 404s on refresh), ensure you have a vercel.json file in your frontend folder with:
=======
Note: To ensure client-side routing works correctly on Vercel (preventing 404s on refresh), ensure you have a vercel.json file in your frontend folder with:
>>>>>>> cde95586429637ac7a06ca86f5a71728823746ce
{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }

---

## Features
- **Lead Management:** Full CRUD operations (Add, View, Update, Delete).
- **Interactive Dashboard:** Real-time KPI cards and status/service-wise charts.
- **Reporting:** Advanced filtering and CSV export.
- **Profile Management:** Secure profile updates and password hashing.
- **Responsive Design:** Mobile-first layout with animated sidebar and popups.
- **AI Insights:** Intelligent analysis of lead data.

##  Tech Stack
- **Frontend:** React, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend:** Node.js, Express, MongoDB (Mongoose).
- **Auth:** JWT (JSON Web Tokens) with BcryptJS.
