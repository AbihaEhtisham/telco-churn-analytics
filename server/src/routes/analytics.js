const express = require('express');
const router = express.Router();
const {
  getKPIs,
  getChurnAnalysis,
  getRevenueAnalysis,
  getDemographicsAnalysis,
  getServiceAnalysis
} = require('../controllers/analyticsController');

router.get('/kpis', getKPIs);
router.get('/churn', getChurnAnalysis);
router.get('/revenue', getRevenueAnalysis);
router.get('/demographics', getDemographicsAnalysis);
router.get('/services', getServiceAnalysis);

module.exports = router;