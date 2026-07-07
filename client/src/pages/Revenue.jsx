import { useState, useEffect } from 'react';
import { fetchRevenueAnalysis } from '../utils/api';
import LoadingSpinner from '../components/dashboard/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingDown, Users } from 'lucide-react';

export default function Revenue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchRevenueAnalysis();
        setData(res.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600 p-6">Error: {error}</div>;
  if (!data) return null;

  const churnLoss = data.churnRevenue;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Revenue Analytics</h2>
        <p className="text-slate-600 mt-1">Financial insights and revenue breakdowns</p>
      </div>

      {/* Revenue Impact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-600">Monthly Revenue Lost</span>
            <TrendingDown size={20} className="text-red-500" />
          </div>
          <div className="text-3xl font-bold text-red-600">
            ${churnLoss.lostRevenue?.toLocaleString() || 0}
          </div>
          <p className="text-sm text-slate-500 mt-1">Due to customer churn</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-600">Churned Customers</span>
            <Users size={20} className="text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-orange-600">
            {churnLoss.churnedCustomers?.toLocaleString() || 0}
          </div>
          <p className="text-sm text-slate-500 mt-1">Lost this period</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-600">Avg Lost Per Customer</span>
            <DollarSign size={20} className="text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-purple-600">
            ${churnLoss.avgLostPerCustomer?.toFixed(2) || 0}
          </div>
          <p className="text-sm text-slate-500 mt-1">Monthly revenue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Service */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Revenue by Internet Service</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.revenueByService}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="_id" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalRevenue" name="Total Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Segment */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Revenue by Customer Segment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.revenueBySegment}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="_id" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalRevenue" name="Total Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}