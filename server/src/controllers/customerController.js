const Customer = require('../models/Customer');

// Get all customers with filtering, pagination, sorting
const getCustomers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '',
      segment,
      churn,
      contract,
      internetService,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    
    if (search) {
      filter.$or = [
        { customerId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (segment) filter['metrics.segment'] = segment;
    if (churn !== undefined) filter['metrics.churn'] = churn === 'true';
    if (contract) filter['account.contract'] = contract;
    if (internetService) filter['services.internetService'] = internetService;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort
    const sortObj = {};
    sortObj[sortBy] = order === 'asc' ? 1 : -1;

    // Execute query
    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Customer.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: customers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
};

// Get single customer
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({ 
      customerId: req.params.id 
    }).lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customer',
      error: error.message
    });
  }
};

// Get customer segments distribution
const getSegments = async (req, res) => {
  try {
    const segments = await Customer.aggregate([
      {
        $group: {
          _id: '$metrics.segment',
          count: { $sum: 1 },
          avgMonthlyCharges: { $avg: '$account.monthlyCharges' },
          avgTenure: { $avg: '$account.tenure' },
          totalRevenue: { $sum: '$account.totalCharges' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: segments
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching segments',
      error: error.message
    });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  getSegments
};