const Lead = require('../models/Lead');
const { Parser } = require('json2csv');

exports.createLead = async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json(lead);
  } catch (err) {
    res.status(400).json({ message: "Failed to create lead", error: err.message });
  }
};

exports.getLeads = async (req, res) => {
  try {
    const { city, status, service, startDate, endDate, search, page = 1, limit = 50 } = req.query;
    let filter = {};

    if (city) filter.city = { $regex: city, $options: "i" };
    if (status) filter.status = status;
    if (service) filter.service = { $regex: service, $options: "i" };
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      // Set end date to the end of the day if it's just YYYY-MM-DD
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate.includes('T') ? endDate : `${endDate}T23:59:59.999Z`);
      }
    }
    
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    const total = await Lead.countDocuments(filter);

    res.json({
      data: leads,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Lead not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Failed to update lead", error: err.message });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const deleted = await Lead.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Lead not found" });
    res.json({ message: "Lead deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete lead", error: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const total = await Lead.countDocuments();

    const byStatus = await Lead.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const byCity = await Lead.aggregate([
      { $group: { _id: "$city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const byService = await Lead.aggregate([
      { $group: { _id: "$service", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const monthly = await Lead.aggregate([
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    res.json({ total, byStatus, byCity, byService, monthly });
  } catch (err) {
    res.status(500).json({ message: "Failed to load dashboard stats", error: err.message });
  }
};

exports.exportCSV = async (req, res) => {
  try {
    const { city, status, service, startDate, endDate } = req.query;
    let filter = {};

    if (city) filter.city = { $regex: city, $options: "i" };
    if (status) filter.status = status;
    if (service) filter.service = { $regex: service, $options: "i" };
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate.includes('T') ? endDate : `${endDate}T23:59:59.999Z`);
      }
    }

    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    
    // Format data to prevent Excel from converting mobile to scientific notation 
    // and to format dates readably
    const formattedLeads = leads.map(lead => ({
      name: lead.name,
      mobile: `\t${lead.mobile}`, // Tab forces Excel to interpret as text
      email: lead.email,
      city: lead.city,
      service: lead.service,
      budget: lead.budget,
      status: lead.status,
      createdAt: `\t${lead.createdAt.toISOString().split('T')[0]}` // 'YYYY-MM-DD'
    }));

    const fields = ['name', 'mobile', 'email', 'city', 'service', 'budget', 'status', 'createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(formattedLeads);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('leads_report.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).send("Export failed");
  }
};

exports.getInsights = async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      total,
      converted,
      newLeads,
      interested,
      rejected,
      thisMonthCount,
      lastMonthCount,
      topCityAgg,
      topServiceAgg,
      avgBudgetAgg,
      rejectedByServiceAgg,
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: 'Converted' }),
      Lead.countDocuments({ status: 'New' }),
      Lead.countDocuments({ status: 'Interested' }),
      Lead.countDocuments({ status: 'Rejected' }),
      Lead.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Lead.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } }),
      Lead.aggregate([{ $group: { _id: "$city",    count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 3 }]),
      Lead.aggregate([{ $group: { _id: "$service", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 3 }]),
      Lead.aggregate([{ $group: { _id: null, avg: { $avg: "$budget" }, max: { $max: "$budget" } } }]),
      Lead.aggregate([
        { $match: { status: 'Rejected' } },
        { $group: { _id: "$service", count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 1 }
      ]),
    ]);

    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : 0;
    const rejectionRate  = total > 0 ? ((rejected  / total) * 100).toFixed(1) : 0;
    const topCity        = topCityAgg[0]?._id    ?? 'N/A';
    const topService     = topServiceAgg[0]?._id ?? 'N/A';
    const avgBudget      = avgBudgetAgg[0]?.avg ? Math.round(avgBudgetAgg[0].avg) : 0;
    const maxBudget      = avgBudgetAgg[0]?.max ?? 0;
    const rejectedService = rejectedByServiceAgg[0]?._id ?? null;

    // Month-over-month growth
    let momGrowth = 0;
    if (lastMonthCount > 0) {
      momGrowth = (((thisMonthCount - lastMonthCount) / lastMonthCount) * 100).toFixed(1);
    } else if (thisMonthCount > 0) {
      momGrowth = 100;
    }

    // Build insight sentences
    const lines = [];
    if (total === 0) {
      lines.push("No lead data yet. Add your first lead to start generating AI insights.");
    } else {
      lines.push(`You have ${total} total leads with a ${conversionRate}% conversion rate and ${rejectionRate}% rejection rate.`);
      if (topCity !== 'N/A') lines.push(`📍 Top performing region: ${topCity} (${topCityAgg[0].count} leads). Focus sales efforts there.`);
      if (topService !== 'N/A') lines.push(`🔧 Most demanded service: ${topService} — consider expanding capacity.`);
      if (avgBudget > 0) lines.push(`💰 Average deal size is ₹${avgBudget.toLocaleString('en-IN')}, with a peak deal of ₹${maxBudget.toLocaleString('en-IN')}.`);
      if (momGrowth > 0)  lines.push(`📈 Lead volume grew ${momGrowth}% this month vs last month — great momentum!`);
      if (momGrowth < 0)  lines.push(`📉 Lead volume dropped ${Math.abs(momGrowth)}% this month — consider ramping up outreach.`);
      if (newLeads > 0 && conversionRate < 15) lines.push(`⚡ ${newLeads} leads are still in "New" status. Fast follow-up within 24 hours can triple your conversion rate.`);
      if (interested > 0) lines.push(`🎯 ${interested} leads are actively interested — prioritise these for immediate closing.`);
      if (rejectedService) lines.push(`⚠️ "${rejectedService}" has the highest rejection rate. Review your pricing or pitch for this service.`);
    }

    res.json({
      insights: lines.join(' '),
      lines, // structured for frontend modal
      conversionRate,
      rejectionRate,
      topCity,
      topService,
      avgBudget,
      momGrowth,
      thisMonthCount,
      lastMonthCount,
      total,
    });
  } catch (err) {
    console.error('Insights error:', err);
    res.status(500).json({ message: "Failed to load insights" });
  }
};