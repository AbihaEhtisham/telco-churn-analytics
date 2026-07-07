import { useState, useEffect } from 'react';
import { Users, TrendingDown, DollarSign, Clock } from 'lucide-react';
import KPICard from '../components/dashboard/KPICard';
import LoadingSpinner from '../components/dashboard/LoadingSpinner';
import ChurnByContract from '../components/charts/ChurnByContract';
import RevenueBySegment from '../components/charts/RevenueBySegment';
import { fetchKPIs, fetchChurnAnalysis, fetchRevenueAnalysis } from '../utils/api';

export default function Overview() {
  const [kpis, setKpis] = useState(null);
  const [churnData, setChurnData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [kpiRes, churnRes, revenueRes] = await Promise.all([
          fetchKPIs(),
          fetchChurnAnalysis(),
          fetchRevenueAnalysis()
        ]);
        
        setKpis(kpiRes.data.data);
        setChurnData(churnRes.data.data);
        setRevenueData(revenueRes.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!kpis) return null;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Executive Overview</h2>
        <p className="text-slate-600 mt-1">Key metrics and insights at a glance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Customers"
          value={kpis.totalCustomers}
          icon={Users}
          color="bg-blue-500"
          change={2.5}
        />
        <KPICard
          title="Churn Rate"
          value={kpis.churnRate}
          suffix="%"
          icon={TrendingDown}
          color="bg-red-500"
          change={-1.2}
        />
        <KPICard
          title="Monthly Revenue"
          value={kpis.mrr}
          prefix="$"
          icon={DollarSign}
          color="bg-green-500"
          change={3.8}
        />
        <KPICard
          title="Avg Tenure"
          value={kpis.avgTenure}
          suffix=" mo"
          icon={Clock}
          color="bg-purple-500"
          change={5.1}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {churnData && <ChurnByContract data={churnData.churnByContract} />}
        {revenueData && <RevenueBySegment data={revenueData.revenueBySegment} />}
      </div>
    </div>
  );
}