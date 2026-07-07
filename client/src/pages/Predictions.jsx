import { useState } from 'react';
import { fetchCustomerById } from '../utils/api';
import { Brain, AlertTriangle, Shield, TrendingUp } from 'lucide-react';

export default function Predictions() {
  const [customerId, setCustomerId] = useState('');
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!customerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetchCustomerById(customerId);
      setCustomer(res.data.data);
    } catch (err) {
      setError('Customer not found');
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
    if (score >= 70) return 'text-red-600 bg-red-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const getSegmentColor = (segment) => {
    const colors = {
      'High Value': 'bg-green-100 text-green-800',
      'At Risk': 'bg-red-100 text-red-800',
      'Stable': 'bg-blue-100 text-blue-800',
      'New': 'bg-purple-100 text-purple-800',
      'Lost': 'bg-gray-100 text-gray-800'
    };
    return colors[segment] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">AI Churn Predictions</h2>
        <p className="text-slate-600 mt-1">Predict customer churn risk and get retention recommendations</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="Enter Customer ID (e.g., 7590-VHVEG)"
            className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Brain size={18} />
            Analyze
          </button>
        </form>
      </div>

      {loading && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-200 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 mt-4">Analyzing customer data...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600">
          {error}
        </div>
      )}

      {customer && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Score Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Churn Risk Assessment</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-40 h-40">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className={`text-4xl font-bold ${getRiskColor(customer.metrics.churnRiskScore)}`}>
                      {customer.metrics.churnRiskScore}%
                    </span>
                    <p className="text-sm text-slate-600 mt-1">Risk Score</p>
                  </div>
                </div>
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="45" fill="none"
                    stroke={customer.metrics.churnRiskScore >= 70 ? '#ef4444' : customer.metrics.churnRiskScore >= 40 ? '#f59e0b' : '#10b981'}
                    strokeWidth="8"
                    strokeDasharray={`${customer.metrics.churnRiskScore * 2.83} 283`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-center">
              {customer.metrics.churn ? (
                <AlertTriangle className="text-red-500" size={20} />
              ) : customer.metrics.churnRiskScore >= 70 ? (
                <AlertTriangle className="text-orange-500" size={20} />
              ) : (
                <Shield className="text-green-500" size={20} />
              )}
              <span className="text-sm font-medium text-slate-700">
                {customer.metrics.churn ? 'Customer has churned' : 
                 customer.metrics.churnRiskScore >= 70 ? 'High risk - Immediate action needed' :
                 customer.metrics.churnRiskScore >= 40 ? 'Medium risk - Monitor closely' :
                 'Low risk - Customer is stable'}
              </span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Customer Profile</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Customer ID</span>
                <span className="font-medium">{customer.customerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Segment</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSegmentColor(customer.metrics.segment)}`}>
                  {customer.metrics.segment}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tenure</span>
                <span className="font-medium">{customer.account.tenure} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Monthly Charges</span>
                <span className="font-medium">${customer.account.monthlyCharges}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Contract</span>
                <span className="font-medium">{customer.account.contract}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Services</span>
                <span className="font-medium">{customer.metrics.serviceCount} active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Status</span>
                <span className={`font-medium ${customer.metrics.churn ? 'text-red-600' : 'text-green-600'}`}>
                  {customer.metrics.churn ? 'Churned' : 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 lg:col-span-2">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-500" />
              Retention Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!customer.services.onlineSecurity && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-medium text-blue-900">Offer Online Security</p>
                  <p className="text-sm text-blue-700 mt-1">Customers with online security are 40% less likely to churn</p>
                </div>
              )}
              {!customer.services.techSupport && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="font-medium text-purple-900">Add Tech Support</p>
                  <p className="text-sm text-purple-700 mt-1">Tech support users show higher retention rates</p>
                </div>
              )}
              {customer.account.contract === 'Month-to-month' && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-medium text-green-900">Offer Annual Contract</p>
                  <p className="text-sm text-green-700 mt-1">Yearly contracts reduce churn by 65%</p>
                </div>
              )}
              {customer.metrics.serviceCount < 3 && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="font-medium text-orange-900">Bundle Services</p>
                  <p className="text-sm text-orange-700 mt-1">Customers with 3+ services have 50% lower churn</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}