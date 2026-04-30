# Lead Dashboard & Reporting System 🚀

A full-stack, premium SaaS web application designed to manage, track, and analyze client leads seamlessly. Built with a robust **Node.js/Express backend** and a beautiful, modern **React/Vite frontend**.

This repository serves as a complete solution for the Lead Management Technical Task.

---

## 🌟 Key Features

### 1. Advanced Lead Management
- **Add, View, and Update** leads instantly with an intuitive, glassmorphism-themed UI.
- Secure forms with strict backend data validations (Mongoose Schema Regex & Constraints).
- Dynamic, color-coded status management (New, Interested, Converted, Rejected).

### 2. Analytical Dashboard
- **Real-Time Metrics:** Tracks Total Leads and Conversion Rates.
- **Data Visualization:** Integrated Recharts provides responsive Pie Charts and Bar Charts mapping:
  - Lead Status Distribution
  - City-wise Coverage
  - Service-wise Demand
- **✨ AI-Powered Insights:** Automatically parses total leads and conversion percentages to generate natural-language strategy recommendations dynamically.

### 3. Robust Reporting & Export System
- **Advanced Filtering:** Filter leads seamlessly by Date Range, City, Status, and Service utilizing flexible case-insensitive MongoDB regex search.
- **1-Click CSV Export:** Generates clean, Excel-ready CSV files containing filtered reporting data. (Formatted to prevent scientific notation truncation).

### 4. Optional Bonus Features Complete ✅
- **Python Data Analysis:** Includes `scripts/analysis.py`, a script utilizing `pandas` and `matplotlib` to parse exported CSV data and generate comprehensive terminal analytics and `.png` charts!
- **AI-Based Insights:** Deep data aggregation endpoint generates dynamic sales funnels advice.

---

## 🛠️ Technology Stack

| Frontend          | Backend            | Database         | Scripting       |
| ----------------- | ------------------ | ---------------- | --------------- |
| React 19          | Node.js            | MongoDB (Atlas)  | Python 3        |
| Vite              | Express.js         | Mongoose         | Pandas          |
| Tailwind CSS v4   | jsonwebtoken       | Aggregations     | Matplotlib      |
| Recharts & Lucide | bcryptjs & json2csv|                  |                 |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Cluster or Local Instance
- Python 3.8+ (If running the analysis script)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/LeadCRM.git
   cd LeadCRM
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `/backend` directory:
   ```env
   PORT=9000
   MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/LeadDashboard
   JWT_SECRET=your_super_secret_key
   ```
   Start the backend:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   ```
   Start the frontend:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`. 
   *Note: Ensure the backend is running on port 9000 as configured.*

---

## 📈 Running the Python Analysis Script

Export a CSV file from the `Reports` tab in the web dashboard, place it in the `backend/scripts` directory, and run:

```bash
cd backend/scripts
pip install pandas matplotlib
python analysis.py --file leads_report.csv
```
It will output total metrics and generate visual `.png` charts of your data.

---

## ☁️ Deployment Guidelines

### Deploying the Backend (Render/Heroku)
1. Push your code to GitHub.
2. Link your repo to Render as a "Web Service".
3. Set the Root Directory to `backend`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add your `.env` variables in the Render dashboard.

### Deploying the Frontend (Vercel/Netlify)
1. Link your repo to Vercel.
2. Set the Root Directory to `frontend`.
3. Set Framework Preset to **Vite**.
4. Important: Update `frontend/src/services/api.js` to point to your new Live Backend URL instead of `localhost`.
5. Deploy!

---

*Designed and Developed for Technical Assessment*
