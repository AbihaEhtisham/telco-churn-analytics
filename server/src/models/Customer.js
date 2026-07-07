const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
    unique: true
  },
  demographics: {
    gender: String,
    seniorCitizen: Boolean,
    partner: Boolean,
    dependents: Boolean
  },
  account: {
    tenure: Number,
    contract: String,
    paperlessBilling: Boolean,
    paymentMethod: String,
    monthlyCharges: Number,
    totalCharges: Number
  },
  services: {
    phone: Boolean,
    multipleLines: Boolean,
    internetService: String,
    onlineSecurity: Boolean,
    onlineBackup: Boolean,
    deviceProtection: Boolean,
    techSupport: Boolean,
    streamingTV: Boolean,
    streamingMovies: Boolean
  },
  metrics: {
    churn: Boolean,
    churnRiskScore: Number,
    customerLifetimeValue: Number,
    serviceCount: Number,
    segment: String
  }
}, {
  timestamps: true
});

customerSchema.index({ customerId: 1 });
customerSchema.index({ 'metrics.churn': 1 });
customerSchema.index({ 'metrics.segment': 1 });

module.exports = mongoose.model('Customer', customerSchema);