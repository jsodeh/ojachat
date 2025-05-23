import { FC, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, LineChart, CreditCard, ShoppingCart, TrendingUp, TrendingDown, CircleDollarSign } from 'lucide-react';

// Simulated data for the line chart (will be replaced with actual data)
const dummyChartData = [
  { date: '2023-11-01', value: 45 },
  { date: '2023-11-02', value: 52 },
  { date: '2023-11-03', value: 49 },
  { date: '2023-11-04', value: 58 },
  { date: '2023-11-05', value: 55 },
  { date: '2023-11-06', value: 67 },
  { date: '2023-11-07', value: 62 },
  { date: '2023-11-08', value: 70 },
  { date: '2023-11-09', value: 66 },
  { date: '2023-11-10', value: 75 },
  { date: '2023-11-11', value: 80 },
  { date: '2023-11-12', value: 73 },
  { date: '2023-11-13', value: 82 },
  { date: '2023-11-14', value: 85 },
];

interface DashboardStat {
  title: string;
  value: string | number;
  change: number;
  icon: JSX.Element;
}

const AdminDashboard: FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '3M' | '6M'>('1W');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      try {
        // In a real implementation, you would fetch actual data from Supabase
        // For now, we'll use simulated data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setStats([
          {
            title: 'Total Users',
            value: 3247,
            change: 12.5,
            icon: <User className="h-5 w-5 text-blue-600" />
          },
          {
            title: 'Total Revenue',
            value: '₦837,240.00',
            change: 8.2,
            icon: <CircleDollarSign className="h-5 w-5 text-green-600" />
          },
          {
            title: 'Active Subscriptions',
            value: 845,
            change: 23.1,
            icon: <CreditCard className="h-5 w-5 text-purple-600" />
          },
          {
            title: 'Total Orders',
            value: 1254,
            change: -4.3,
            icon: <ShoppingCart className="h-5 w-5 text-amber-600" />
          }
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        
        <div className="inline-flex rounded-md shadow-sm">
          {(['1D', '1W', '1M', '3M', '6M'] as const).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm font-medium ${
                timeRange === range
                  ? 'bg-green-100 text-green-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } ${
                range === '1D'
                  ? 'rounded-l-md'
                  : range === '6M'
                  ? 'rounded-r-md'
                  : ''
              } border border-gray-300`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center">
              <div className="rounded-md bg-gray-50 p-3">{stat.icon}</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className={`mt-1 flex items-center text-sm ${
                  stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change >= 0 ? (
                    <TrendingUp className="mr-1 h-4 w-4" />
                  ) : (
                    <TrendingDown className="mr-1 h-4 w-4" />
                  )}
                  <span>{Math.abs(stat.change)}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-500">Current Period</span>
            </div>
            <div className="flex items-center">
              <div className="mr-2 h-3 w-3 rounded-full bg-gray-300"></div>
              <span className="text-sm text-gray-500">Previous Period</span>
            </div>
          </div>
        </div>
        
        {/* This is a placeholder for the chart. In a real implementation, 
            you would use a proper charting library like Recharts, Chart.js, etc. */}
        <div className="h-64 w-full bg-gray-50 flex items-center justify-center border border-gray-100 rounded-md">
          <div className="text-gray-400 flex flex-col items-center">
            <LineChart className="h-8 w-8 mb-2" />
            <span>Revenue chart would be displayed here</span>
          </div>
        </div>
      </div>
      
      {/* Recent activity section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h2>
        
        <div className="space-y-4">
          {/* Activity items */}
          <div className="flex items-start pb-4 border-b border-gray-100">
            <div className="mr-4 rounded-full bg-blue-100 p-2">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">New user registered</p>
              <p className="text-sm text-gray-500">John Smith created an account</p>
              <p className="text-xs text-gray-400">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-start pb-4 border-b border-gray-100">
            <div className="mr-4 rounded-full bg-green-100 p-2">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">New subscription</p>
              <p className="text-sm text-gray-500">Alice Johnson upgraded to OjaPRIME MAX</p>
              <p className="text-xs text-gray-400">4 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="mr-4 rounded-full bg-amber-100 p-2">
              <ShoppingCart className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">New order placed</p>
              <p className="text-sm text-gray-500">Marketplace order #1234 - ₦34,500.00</p>
              <p className="text-xs text-gray-400">6 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 