import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  PieChart, 
  Activity,
  Brain
} from 'lucide-react';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Overview' },
  { path: '/customers', icon: Users, label: 'Customers' },
  { path: '/churn', icon: TrendingUp, label: 'Churn Analysis' },
  { path: '/revenue', icon: PieChart, label: 'Revenue' },
  { path: '/demographics', icon: Activity, label: 'Demographics' },
  { path: '/predictions', icon: Brain, label: 'AI Predictions' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          ChurnIQ
        </h1>
        <p className="text-slate-400 text-sm mt-1">Analytics Dashboard</p>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white border-r-4 border-blue-400' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}