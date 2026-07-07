const Customer = require('../models/Customer');

// Dashboard KPIs
const getKPIs = async (req, res) => {
  try {
    const [totalCustomers, churnedCustomers, activeCustomers] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ 'metrics.churn': true }),
      Customer.countDocuments({ 'metrics.churn': false })
    ]);

    const revenue = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$account.totalCharges' },
          avgMonthlyCharges: { $avg: '$account.monthlyCharges' },
          avgTenure: { $avg: '$account.tenure' },
          totalMonthlyRevenue: { $sum: '$account.monthlyCharges' }
        }
      }
    ]);

    const churnRate = ((churnedCustomers / totalCustomers) * 100).toFixed(1);

    res.json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        churnedCustomers,
        churnRate: parseFloat(churnRate),
        totalRevenue: revenue[0]?.totalRevenue || 0,
        avgMonthlyCharges: revenue[0]?.avgMonthlyCharges || 0,
        avgTenure: Math.round(revenue[0]?.avgTenure || 0),
        mrr: revenue[0]?.totalMonthlyRevenue || 0
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching KPIs',
      error: error.message
    });
  }
};

// Churn Analysis
const getChurnAnalysis = async (req, res) => {
  try {
    // Churn by contract type
    const churnByContract = await Customer.aggregate([
      {
        $group: {
          _id: '$account.contract',
          total: { $sum: 1 },
          churned: {
            $sum: { $cond: ['$metrics.churn', 1, 0] }
          }
        }
      },
      {
        $project: {
          contract: '$_id',
          total: 1,
          churned: 1,
          churnRate: {
            $round: [{ $multiply: [{ $divide: ['$churned', '$total'] }, 100] }, 1]
          }
        }
      }
    ]);

    // Churn by internet service
    const churnByInternet = await Customer.aggregate([
      {
        $group: {
          _id: '$services.internetService',
          total: { $sum: 1 },
          churned: {
            $sum: { $cond: ['$metrics.churn', 1, 0] }
          }
        }
      },
      {
        $project: {
          internetService: '$_id',
          total: 1,
          churned: 1,
          churnRate: {
            $round: [{ $multiply: [{ $divide: ['$churned', '$total'] }, 100] }, 1]
          }
        }
      }
    ]);

    // Churn by tenure groups
    const churnByTenure = await Customer.aggregate([
      {
        $bucket: {
          groupBy: '$account.tenure',
          boundaries: [0, 12, 24, 36, 48, 60, 72],
          default: '72+',
          output: {
            total: { $sum: 1 },
            churned: {
              $sum: { $cond: ['$metrics.churn', 1, 0] }
            }
          }
        }
      },
      {
        $project: {
          tenureGroup: '$_id',
          total: 1,
          churned: 1,
          churnRate: {
            $round: [{ $multiply: [{ $divide: ['$churned', '$total'] }, 100] }, 1]
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        churnByContract,
        churnByInternet,
        churnByTenure
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching churn analysis',
      error: error.message
    });
  }
};

// Revenue Analysis
const getRevenueAnalysis = async (req, res) => {
  try {
    // Revenue by service type
    const revenueByService = await Customer.aggregate([
      {
        $group: {
          _id: '$services.internetService',
          totalRevenue: { $sum: '$account.totalCharges' },
          avgMonthlyCharges: { $avg: '$account.monthlyCharges' },
          customerCount: { $sum: 1 }
        }
      }
    ]);

    // Revenue by segment
    const revenueBySegment = await Customer.aggregate([
      {
        $group: {
          _id: '$metrics.segment',
          totalRevenue: { $sum: '$account.totalCharges' },
          avgMonthlyCharges: { $avg: '$account.monthlyCharges' },
          customerCount: { $sum: 1 }
        }
      }
    ]);

    // Revenue lost to churn
    const churnRevenue = await Customer.aggregate([
      {
        $match: { 'metrics.churn': true }
      },
      {
        $group: {
          _id: null,
          lostRevenue: { $sum: '$account.monthlyCharges' },
          churnedCustomers: { $sum: 1 },
          avgLostPerCustomer: { $avg: '$account.monthlyCharges' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        revenueByService,
        revenueBySegment,
        churnRevenue: churnRevenue[0] || { lostRevenue: 0, churnedCustomers: 0, avgLostPerCustomer: 0 }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue analysis',
      error: error.message
    });
  }
};

// Demographics Analysis
const getDemographicsAnalysis = async (req, res) => {
  try {
    // Gender distribution
    const genderDistribution = await Customer.aggregate([
      {
        $group: {
          _id: '$demographics.gender',
          total: { $sum: 1 },
          churned: {
            $sum: { $cond: ['$metrics.churn', 1, 0] }
          }
        }
      },
      {
        $project: {
          gender: '$_id',
          total: 1,
          churned: 1,
          churnRate: {
            $round: [{ $multiply: [{ $divide: ['$churned', '$total'] }, 100] }, 1]
          }
        }
      }
    ]);

    // Senior citizen impact
    const seniorCitizenImpact = await Customer.aggregate([
      {
        $group: {
          _id: '$demographics.seniorCitizen',
          total: { $sum: 1 },
          churned: {
            $sum: { $cond: ['$metrics.churn', 1, 0] }
          },
          avgTenure: { $avg: '$account.tenure' }
        }
      },
      {
        $project: {
          isSenior: '$_id',
          total: 1,
          churned: 1,
          churnRate: {
            $round: [{ $multiply: [{ $divide: ['$churned', '$total'] }, 100] }, 1]
          },
          avgTenure: { $round: ['$avgTenure', 0] }
        }
      }
    ]);

    // Partner and dependents effect
    const partnerEffect = await Customer.aggregate([
      {
        $group: {
          _id: {
            partner: '$demographics.partner',
            dependents: '$demographics.dependents'
          },
          total: { $sum: 1 },
          churned: {
            $sum: { $cond: ['$metrics.churn', 1, 0] }
          },
          avgMonthlyCharges: { $avg: '$account.monthlyCharges' }
        }
      },
      {
        $project: {
          partner: '$_id.partner',
          dependents: '$_id.dependents',
          total: 1,
          churned: 1,
          churnRate: {
            $round: [{ $multiply: [{ $divide: ['$churned', '$total'] }, 100] }, 1]
          },
          avgMonthlyCharges: { $round: ['$avgMonthlyCharges', 2] }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        genderDistribution,
        seniorCitizenImpact,
        partnerEffect
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching demographics analysis',
      error: error.message
    });
  }
};

// Service Analysis
const getServiceAnalysis = async (req, res) => {
  try {
    const services = [
      'onlineSecurity', 'onlineBackup', 'deviceProtection', 
      'techSupport', 'streamingTV', 'streamingMovies'
    ];

    const serviceAdoption = await Promise.all(
      services.map(async (service) => {
        const stats = await Customer.aggregate([
          {
            $group: {
              _id: `$services.${service}`,
              total: { $sum: 1 },
              churned: {
                $sum: { $cond: ['$metrics.churn', 1, 0] }
              }
            }
          }
        ]);

        const total = stats.reduce((sum, s) => sum + s.total, 0);
        const withService = stats.find(s => s._id === true) || { total: 0, churned: 0 };

        return {
          service,
          totalCustomers: total,
          adoptedCount: withService.total,
          adoptionRate: parseFloat(((withService.total / total) * 100).toFixed(1)),
          churnedWithService: withService.churned,
          churnRateWithService: parseFloat(((withService.churned / withService.total) * 100).toFixed(1))
        };
      })
    );

    res.json({
      success: true,
      data: serviceAdoption
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching service analysis',
      error: error.message
    });
  }
};

module.exports = {
  getKPIs,
  getChurnAnalysis,
  getRevenueAnalysis,
  getDemographicsAnalysis,
  getServiceAnalysis
};