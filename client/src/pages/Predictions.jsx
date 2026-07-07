import { useState, useEffect } from 'react';
import { fetchCustomers } from '../utils/api';
import axios from 'axios';
import { Brain, AlertTriangle, Shield, TrendingUp, Zap, Target } from 'lucide-react';

const ML_API = 'http://localhost:5001';

export default function Predictions() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [batchResults, setBatchResults] = useState(null);

  const loadHighRiskCustomers = async () => {
    try {
      const res = await fetchCustomers({ segment: 'At Risk', limit: 20 });
      setCustomers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadHighRiskCustomers();
  }, []);

  const predictChurn = async (customer) => {
    setLoading(true);
    setSelectedCustomer(customer);
    
    try {
      const payload = {
        tenure: customer.account.tenure,
        monthlyCharges: customer.account.monthlyCharges,
        totalCharges: customer.account.totalCharges,
        serviceCount: customer.metrics.serviceCount,
        seniorCitizen: customer.demographics.seniorCitizen,
        gender: customer.demographics.gender,
        partner: customer.demographics.partner,
        dependents: customer.demographics.dependents,
        contract: customer.account.contract,
        onlineSecurity: customer.services.onlineSecurity,
        techSupport: customer.services.techSupport,
        onlineBackup: customer.services.onlineBackup,
        deviceProtection: customer.services.deviceProtection,
        streamingTV: customer.services.streamingTV,
        streamingMovies: customer.services.streamingMovies,
        internetService: customer.services.internetService,
        phone: customer.services.phone,
        multipleLines: customer.services.multipleLines,
        paymentMethod: customer.account.paymentMethod,
        paperlessBilling: customer.account.paperlessBilling
      };

      const res = await axios.post(`${ML_API}/predict`, payload);
      setPrediction(res.data.prediction);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runBatchPrediction = async () => {
    setLoading(true);
    try {
      const payload = {
        customers: customers.slice(0, 10).map(c => ({
          customerId: c.customerId,
          tenure: c.account.tenure,
          monthlyCharges: c.account.monthlyCharges,
          totalCharges: c.account.totalCharges,
          serviceCount: c.metrics.serviceCount,
          seniorCitizen: c.demographics.seniorCitizen,
          gender: c.demographics.gender,
          partner: c.demographics.partner,
          dependents: c.demographics.dependents,
          contract: c.account.contract,
          onlineSecurity: c.services.onlineSecurity,
          techSupport: c.services.techSupport,
          onlineBackup: c.services.onlineBackup,
          deviceProtection: c.services.deviceProtection,
          streamingTV: c.services.streamingTV,
          streamingMovies: c.services.streamingMovies,
          internetService: c.services.internetService,
          phone: c.services.phone,
          multipleLines: c.services.multipleLines,
          paymentMethod: c.account.paymentMethod,
          paperlessBilling: c.account.paperlessBilling
        }))
      };

      const res = await axios.post(`${ML_API}/batch-predict`, payload);
      setBatchResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
    if (score >= 70) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">AI Churn Predictions</h2>
        <p className="text-slate-600 mt-1">ML-powered churn prediction with XGBoost (80%+ accuracy)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">At-Risk Customers</h3>
            <button
              onClick={runBatchPrediction}
              disabled={loading}
              className="flex items-center gap-1 text-sm bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700"
            >
              <Zap size={14} />
              Batch Analyze
            </button>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {customers.map(customer => (
              <button
                key={customer.customerId}
                onClick={() => predictChurn(customer)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedCustomer?.customerId === customer.customerId
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{customer.customerId}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    customer.metrics.churnRiskScore >= 70 ? 'bg-red-100 text-red-700' :
                    customer.metrics.churnRiskScore >= 40 ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {customer.metrics.churnRiskScore}%
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {customer.account.contract} • {customer.account.tenure}mo
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Prediction Result */}
        <div className="lg:col-span-2">
          {loading && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-600 mt-4">Running ML prediction...</p>
            </div>
          )}

          {!loading && !prediction && !batchResults && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <Brain size={48} className="text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Select a customer or run batch analysis</p>
            </div>
          )}

          {prediction && selectedCustomer && (
            <div className="space-y-6">
              {/* Risk Score Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-slate-900">Prediction for {selectedCustomer.customerId}</h3>
                    <p className="text-sm text-slate-500">ML Confidence: {prediction.confidence}%</p>
                  </div>
                  <Target size={24} className="text-blue-500" />
                </div>

                <div className="flex items-center justify-center mb-4">
                  <div className={`text-center p-6 rounded-full border-2 ${getRiskColor(prediction.riskScore)}`}>
                    <span className="text-5xl font-bold">{prediction.riskScore}%</span>
                    <p className="text-sm font-medium mt-1">{prediction.riskLevel} Risk</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-center">
                  {prediction.riskLevel === 'High' ? (
                    <AlertTriangle className="text-red-500" size={20} />
                  ) : prediction.riskLevel === 'Medium' ? (
                    <AlertTriangle className="text-orange-500" size={20} />
                  ) : (
                    <Shield className="text-green-500" size={20} />
                  )}
                  <span className="text-sm font-medium">
                    {prediction.willChurn ? 'Likely to churn - Take action' : 'Customer appears stable'}
                  </span>
                </div>
              </div>

              {/* Recommendations */}
              {prediction.recommendations.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-blue-500" />
                    Retention Recommendations
                  </h3>
                  <div className="space-y-3">
                    {prediction.recommendations.map((rec, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${
                        rec.impact === 'Critical' ? 'bg-red-50 border-red-200' :
                        rec.impact === 'High' ? 'bg-orange-50 border-orange-200' :
                        'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{rec.action}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            rec.impact === 'Critical' ? 'bg-red-200 text-red-800' :
                            rec.impact === 'High' ? 'bg-orange-200 text-orange-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {rec.impact}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{rec.description}</p>
                        {rec.potentialSavings && (
                          <p className="text-xs text-green-600 mt-1 font-medium">💰 {rec.potentialSavings}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Batch Results */}
          {batchResults && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Batch Analysis Results</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{batchResults.summary.highRisk}</p>
                  <p className="text-xs text-slate-600">High Risk</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{batchResults.summary.mediumRisk}</p>
                  <p className="text-xs text-slate-600">Medium Risk</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{batchResults.summary.lowRisk}</p>
                  <p className="text-xs text-slate-600">Low Risk</p>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {batchResults.predictions.map(pred => (
                  <div key={pred.customerId} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium">{pred.customerId}</span>
                    <span className={`text-sm px-2 py-0.5 rounded-full ${
                      pred.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                      pred.riskLevel === 'Medium' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {pred.riskScore}% - {pred.riskLevel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}