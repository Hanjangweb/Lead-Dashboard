# 🚀 SaaS Lead Dashboard & Reporting System

A premium, full-stack lead management system designed to streamline data tracking, provide actionable insights, and ensure a seamless user experience. Built with a modern tech stack including Node.js, MongoDB, React, and Vite.

---

## ✨ Features

- **Lead Management:** Comprehensive CRUD operations to Add, View, Update, and Delete leads seamlessly.
- **Interactive Dashboard:** Dynamic real-time KPI cards, status distribution, and service-wise charts for quick insights.
- **Advanced Reporting:** Robust filtering capabilities by date, status, city, and service, complete with one-click CSV export functionality.
- **Profile Management:** Secure user profile updates with robust password hashing.
- **Responsive Design:** A premium, mobile-first interface featuring glassmorphism elements, animated sidebars, and smooth popups.
- **AI Insights:** Intelligent analysis integration for extracting meaningful patterns from lead data.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React (via Vite)
- **Styling:** Tailwind CSS, Custom CSS (Glassmorphism)
- **Animations:** Framer Motion
- **Icons:** Lucide React

### Backend
- **Environment:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT (JSON Web Tokens), BcryptJS
- **Data Analysis:** Python (for AI Insights / Advanced Data Processing)

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- [Python 3](https://www.python.org/) (If utilizing the `analyse.py` script)

---

## 🚀 Local Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/saas-dashboard.git
cd saas-dashboard
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=9000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
DB_NAME=LeadDashboard
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:9000/api
```
Start the frontend development server:
```bash
npm run dev
```

---

## ☁️ Deployment Instructions

### Backend (Render)
1. Create a **New Web Service** on [Render](https://render.com/).
2. Connect your GitHub repository.
3. Set the **Root Directory** to `backend`.
4. Choose **Node** as the environment.
5. Set **Build Command** to `npm install`.
6. Set **Start Command** to `node server.js`.
7. Add the required **Environment Variables** (`PORT`, `MONGO_URI`, `JWT_SECRET`, `DB_NAME`).
8. Click **Deploy**.

### Frontend (Vercel)
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
2. Import your GitHub repository.
3. Select **Vite** as the Framework Preset.
4. Set the **Root Directory** to `frontend`.
5. Set the **Build Command** to `npm install; npm run build`.
6. Set the **Publish Directory** to `dist`.
7. Add the **Environment Variable** `VITE_API_URL` pointing to your deployed backend URL (e.g., `https://your-backend-url.onrender.com/api`).
8. **Client-Side Routing Fix:** Ensure the `frontend/vercel.json` file is present in your repo to prevent 404 errors on page refresh:
    ```json
    {
      "rewrites": [
        { "source": "/(.*)", "destination": "/" }
      ]
    }
    ```
9. Click **Deploy**.

---

## 📂 Project Structure

```text
SaaS-Dashboard/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route logic handlers
│   ├── middleware/      # Authentication & validation logic
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express API routes
│   ├── scripts/         # Python analysis scripts
│   └── server.js        # Entry point for backend
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application views (Dashboard, Leads, Reports, etc.)
│   │   ├── context/     # React Context for global state
│   │   └── App.jsx      # Main React application component
│   ├── vercel.json      # Vercel deployment config
│   └── vite.config.js   # Vite configuration
└── README.md
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/saas-dashboard/issues).

## 📄 License

This project is licensed under the MIT License.
