require('dotenv').config(); 
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth"); 

const app = express();

// Middleware
app.use(cors());

app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 3. Database Connection with Error Handling
const mongoURI = process.env.MONGO_URI || "YOUR_MONGO_URL_HERE";

mongoose.connect(mongoURI)
  .then(() => console.log(" MongoDB Connected..."))
  .catch((err) => {
    console.error("DB Connection Error:", err.message);
    process.exit(1); // Stop server if DB 
  });

// 4. Routes
app.get("/", (req, res) => res.send("Lead Dashboard API is running..."));

// This matches your frontend call: http://localhost:5000/api/auth/register
app.use("/api/auth", authRoutes); 
const leadRoutes = require("./routes/leadRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api", leadRoutes);
app.use("/api/notifications", notificationRoutes);

// Global Error Handler (Optional but helpful)
app.use((err, req, res, next) => {
  console.error("--- GLOBAL ERROR ---");
  console.error(err.message);
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong on the server!',
    details: err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));