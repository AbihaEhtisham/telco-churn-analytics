import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ServiceAdoption({ data }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Service Adoption & Churn Impact</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" stroke="#64748b" />
          <YAxis dataKey="service" type="category" stroke="#64748b" width={120} />
          <Tooltip />
          <Legend />
          <Bar dataKey="adoptionRate" name="Adoption Rate %" fill="#10b981" radius={[0, 4, 4, 0]} />
          <Bar dataKey="churnRateWithService" name="Churn Rate %" fill="#ef4444" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}