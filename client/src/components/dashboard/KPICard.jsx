import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KPICard({ title, value, prefix, suffix, change, icon: Icon, color }) {
  const isPositive = change > 0;
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-600 font-medium">{title}</span>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      
      <div className="mb-2">
        <span className="text-3xl font-bold text-slate-900">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </span>
      </div>
      
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{Math.abs(change)}% from last month</span>
        </div>
      )}
    </div>
  );
}