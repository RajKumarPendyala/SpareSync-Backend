const FinancialReport = require('./FinancialReportModel');
const mongoose = require('mongoose');

const calculateSummary = async (year, month) => {
  let result;

  if(!(year && month)){
    result = await FinancialReport.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$totalSales" },
            totalOrders: { $sum: "$totalOrders" },
            netProfit: { $sum: "$netProfit" }
          }
        }
    ]);
  }
  if(year || month){
    let startDate;
    let endDate;

    if(year && month){
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 1); 
    }
    else{
        startDate = new Date(year, 0, 1);  
        endDate = new Date(year + 1, 0, 1); 
    }

    result = await FinancialReport.aggregate([
        {
        $match: {
            isDeleted: false,
            generatedAt: {
            $gte: startDate,
            $lt: endDate
            }
        }
        },
        {
        $group: {
            _id: null,
            totalSales: { $sum: "$totalSales" },
            totalOrders: { $sum: "$totalOrders" },
            netProfit: { $sum: "$netProfit" }
        }
        }
    ]);
  }

  const summary = result[0] || {
    totalSales: new mongoose.Types.Decimal128("0.00"),
    totalOrders: 0,
    netProfit: new mongoose.Types.Decimal128("0.00")
  };

  return {
    totalSales: summary.totalSales.toString(),
    totalOrders: summary.totalOrders,
    netProfit: summary.netProfit.toString()
  };
};


exports.calculateSummary = calculateSummary;
exports.calculateMonthlySummary = calculateSummary;
exports.calculateYearlySummary = calculateSummary;