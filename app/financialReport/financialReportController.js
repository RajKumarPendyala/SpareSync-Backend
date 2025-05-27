const { calculateSummary, calculateMonthlySummary, calculateYearlySummary } = require('./financialReportService');

exports.getCompleteFinancialReport = async (req, res, next) => {
  try {
    const summary = await calculateSummary();

    if(summary){
        return res.status(200).json({
            message: "Financial summary fetched successfully",
            data: summary
        });
    }
    res.status(400).json({
        message: "Failed to fetch financial summary."
    });

  } catch (error) {
    next(error);
  }
};


exports.getMonthlyFinancialReport = async (req, res, next) => {
  try {
    const { year, month } = req.body;

    if (!year || !month) {
      return res.status(400).json({
        message: 'Year and month are required as query parameters'
      });
    }

    const summary = await calculateMonthlySummary(parseInt(year), parseInt(month));

    if(summary){
        return res.status(200).json({
            message: "Monthly financial summary fetched successfully",
            data: summary
        });
    }
    res.status(400).json({
        message: "Failed to fetch montly financial summary.",
    });
  } catch (error) {
    next(error);
  }
};


exports.getYearlyFinancialReport = async (req, res, next) => {
  try {
    const { year } = req.body;

    if (!year) {
      return res.status(400).json({ message: 'Year is required as query parameter' });
    }

    const summary = await calculateYearlySummary(parseInt(year));

    if(summary){
        return res.status(200).json({
            message: 'Yearly financial summary fetched successfully',
            data: summary
        });
    }
    res.status(400).json({
        message: "Failed to fetch yearly financial summary.",
    });
  } catch (error) {
    next(error);
  }
};