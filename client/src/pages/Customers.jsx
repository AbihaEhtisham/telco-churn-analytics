import { useState, useEffect } from 'react';
import { fetchCustomers } from '../utils/api';
import LoadingSpinner from '../components/dashboard/LoadingSpinner';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    segment: '',
    churn: '',
    contract: ''
  });

  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 10, ...filters };
        Object.keys(params).forEach(key => {
          if (!params[key]) delete params[key];
        });
        
        const res = await fetchCustomers(params);
        setCustomers(res.data.data);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadCustomers();
  }, [page, filters]);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Customers</h2>
        <p className="text-slate-600 mt-1">Manage and analyze customer base</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6">
        <div className="flex gap-4 flex-wrap">
          <select 
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            value={filters.segment}
            onChange={(e) => setFilters({...filters, segment: e.target.value})}
          >
            <option value="">All Segments</option>
            <option value="High Value">High Value</option>
            <option value="At Risk">At Risk</option>
            <option value="Stable">Stable</option>
            <option value="New">New</option>
            <option value="Lost">Lost</option>
          </select>

          <select 
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            value={filters.churn}
            onChange={(e) => setFilters({...filters, churn: e.target.value})}
          >
            <option value="">All Status</option>
            <option value="true">Churned</option>
            <option value="false">Active</option>
          </select>

          <select 
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            value={filters.contract}
            onChange={(e) => setFilters({...filters, contract: e.target.value})}
          >
            <option value="">All Contracts</option>
            <option value="Month-to-month">Month-to-month</option>
            <option value="One year">One Year</option>
            <option value="Two year">Two Year</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Customer ID</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Segment</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Tenure</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Monthly</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Contract</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.customerId} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">{customer.customerId}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      customer.metrics.segment === 'High Value' ? 'bg-green-100 text-green-800' :
                      customer.metrics.segment === 'At Risk' ? 'bg-red-100 text-red-800' :
                      customer.metrics.segment === 'Lost' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {customer.metrics.segment}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{customer.account.tenure} months</td>
                  <td className="px-6 py-4 text-sm text-slate-600">${customer.account.monthlyCharges}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{customer.account.contract}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      customer.metrics.churn ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {customer.metrics.churn ? 'Churned' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm border border-slate-300 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 text-sm border border-slate-300 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}