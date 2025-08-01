import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Star,
  PawPrint,
  FileText,
  Award,
  Target,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

interface DoctorStats {
  todayAppointments: number;
  weeklyAppointments: number;
  monthlyAppointments: number;
  totalPatients: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  yearlyEarnings: number;
  patientSatisfaction: number;
  utilizationRate: number;
  averageAppointmentValue: number;
  completionRate: number;
}

interface RecentActivity {
  id: string;
  type: 'appointment' | 'record' | 'patient';
  title: string;
  subtitle: string;
  time: string;
  status?: string;
}

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DoctorStats>({
    todayAppointments: 0,
    weeklyAppointments: 0,
    monthlyAppointments: 0,
    totalPatients: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    yearlyEarnings: 0,
    patientSatisfaction: 0,
    utilizationRate: 0,
    averageAppointmentValue: 0,
    completionRate: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchDoctorStats();
    fetchRecentActivity();
  }, [user, selectedPeriod]);

  const fetchDoctorStats = async () => {
    try {
      // Simulate API call - replace with actual API for specific doctor
      const mockStats: DoctorStats = {
        todayAppointments: 8,
        weeklyAppointments: 32,
        monthlyAppointments: 128,
        totalPatients: 89,
        weeklyEarnings: 4320,
        monthlyEarnings: 17280,
        yearlyEarnings: 207360,
        patientSatisfaction: 4.8,
        utilizationRate: 85,
        averageAppointmentValue: 135,
        completionRate: 94
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch doctor stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'appointment',
          title: 'Buddy - Golden Retriever',
          subtitle: 'Annual wellness check',
          time: '2 hours ago',
          status: 'completed'
        },
        {
          id: '2',
          type: 'record',
          title: 'Luna - Siamese Cat',
          subtitle: 'Updated medical record',
          time: '4 hours ago'
        },
        {
          id: '3',
          type: 'patient',
          title: 'New Patient: Max',
          subtitle: 'German Shepherd registered',
          time: '1 day ago'
        },
        {
          id: '4',
          type: 'appointment',
          title: 'Whiskers - Persian Cat',
          subtitle: 'Follow-up examination',
          time: '1 day ago',
          status: 'completed'
        }
      ];
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getEarningsForPeriod = () => {
    switch (selectedPeriod) {
      case 'week':
        return stats.weeklyEarnings;
      case 'month':
        return stats.monthlyEarnings;
      case 'year':
        return stats.yearlyEarnings;
      default:
        return stats.monthlyEarnings;
    }
  };

  const getAppointmentsForPeriod = () => {
    switch (selectedPeriod) {
      case 'week':
        return stats.weeklyAppointments;
      case 'month':
        return stats.monthlyAppointments;
      case 'year':
        return stats.monthlyAppointments * 12; // Approximate
      default:
        return stats.monthlyAppointments;
    }
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'year':
        return 'This Year';
      default:
        return 'This Month';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'record':
        return <FileText className="w-4 h-4 text-green-600" />;
      case 'patient':
        return <PawPrint className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-600 bg-green-100' };
    if (score >= 80) return { label: 'Good', color: 'text-blue-600 bg-blue-100' };
    if (score >= 70) return { label: 'Average', color: 'text-yellow-600 bg-yellow-100' };
    return { label: 'Needs Improvement', color: 'text-red-600 bg-red-100' };
  };

  const performanceScore = Math.round((stats.utilizationRate + stats.patientSatisfaction * 20 + stats.completionRate) / 3);
  const performanceLevel = getPerformanceLevel(performanceScore);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, Dr. {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-gray-600 mt-1">
            {format(new Date(), 'EEEE, MMMM do, yyyy')} • Your practice overview
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'year')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </div>
      </div>

      {/* Today's Overview */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Today's Schedule</h2>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span className="text-lg font-medium">{stats.todayAppointments} appointments</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span className="text-lg font-medium">Next: 2:30 PM</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.utilizationRate}%</div>
            <div className="text-sm opacity-90">Utilization Rate</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">My Earnings</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(getEarningsForPeriod())}
              </p>
              <p className="text-xs text-gray-500 mt-1">{getPeriodLabel()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">My Patients</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalPatients}</p>
              <p className="text-xs text-gray-500 mt-1">Total under care</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <PawPrint className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Appointments</p>
              <p className="text-2xl font-bold text-purple-600">
                {getAppointmentsForPeriod()}
              </p>
              <p className="text-xs text-gray-500 mt-1">{getPeriodLabel()}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Satisfaction</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.patientSatisfaction}/5.0
              </p>
              <p className="text-xs text-gray-500 mt-1">Patient rating</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Performance</h3>
            <Award className="w-5 h-5 text-yellow-500" />
          </div>
          
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {performanceScore}%
            </div>
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${performanceLevel.color}`}>
              {performanceLevel.label}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Utilization Rate</span>
              <span className="font-medium">{stats.utilizationRate}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Completion Rate</span>
              <span className="font-medium">{stats.completionRate}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Patient Rating</span>
              <span className="font-medium">{stats.patientSatisfaction}/5.0</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Financial Summary</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          
          <div className="space-y-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(stats.averageAppointmentValue)}
              </div>
              <div className="text-xs text-gray-600">Average per appointment</div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-sm font-bold text-gray-900">
                  {formatCurrency(stats.weeklyEarnings)}
                </div>
                <div className="text-xs text-gray-500">This Week</div>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">
                  {formatCurrency(stats.monthlyEarnings)}
                </div>
                <div className="text-xs text-gray-500">This Month</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
            <Target className="w-5 h-5 text-indigo-500" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Today's Appointments</span>
              <span className="text-lg font-bold text-indigo-600">{stats.todayAppointments}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Weekly Total</span>
              <span className="text-lg font-bold text-indigo-600">{stats.weeklyAppointments}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Monthly Total</span>
              <span className="text-lg font-bold text-indigo-600">{stats.monthlyAppointments}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {activity.subtitle}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {activity.status && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'completed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {activity.status}
                  </span>
                )}
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;