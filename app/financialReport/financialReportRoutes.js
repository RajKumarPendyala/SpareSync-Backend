const express = require('express');
const router = express.Router();

const financialReportController = require('./financialReportController');
const isAdmin = require('../../middleware/isAdmin');
const authMiddleware = require('../../middleware/authMiddleware');

router.get('/', authMiddleware, isAdmin, financialReportController.getCompleteFinancialReport);
router.get('/monthly', authMiddleware, isAdmin, financialReportController.getMonthlyFinancialReport);
router.get('/yearly', authMiddleware, isAdmin, financialReportController.getYearlyFinancialReport);


module.exports = router;