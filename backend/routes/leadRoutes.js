const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const protect = require('../middleware/authMiddleware');

// Apply protection to all routes in this router
router.use(protect);

// ─── Static routes MUST come before /:id routes ────────────────────────────
router.get('/leads/stats',  leadController.getDashboardStats);
router.get('/leads/export', leadController.exportCSV);
router.get('/insights',     leadController.getInsights);

// ─── Lead CRUD ──────────────────────────────────────────────────────────────
router.post('/leads',       leadController.createLead);
router.get('/leads',        leadController.getLeads);
router.put('/leads/:id',    leadController.updateLead);
router.delete('/leads/:id', leadController.deleteLead);

module.exports = router;
