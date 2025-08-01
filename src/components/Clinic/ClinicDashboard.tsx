import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar, 
  BarChart3, 
  PieChart, 
  Activity,
  Clock,
  Award,
  Target
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subWeeks, subMonths } from 'date-fns';
import DoctorStatistics from './DoctorStatistics';
import EarningsChart from './EarningsChart';
import AppointmentChart from './AppointmentChart';
import PerformanceMetrics from './PerformanceMetrics';

interface ClinicStats {
  totalPatients: number;
  totalDoctors: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  yearlyEarnings: number;
  weeklyAppointments: number;
  monthlyAppointments: number;
  averageAppointmentValue: number;
  patientSatisfaction: number;
  doctorUtilization: number;
}

interface DoctorPerformance {
  id: string;
  name: string;
  totalPatients: number;
  weeklyAppointments: number;
  monthlyAppointments: number;
  earnings: {
    weekly: number;
    monthly: number;
    yearly: number;
  };
  patientSatisfaction: number;
  specialization: string;
  utilizationRate: number;
}

const ClinicDashboard: React.FC = () => {
  const [stats, setStats] = useState<ClinicStats>({
    totalPatients: 0,
    totalDoctors: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    yearlyEarnings: 0,
    weeklyAppointments: 0,
    monthlyAppointments: 0,
    averageAppointmentValue: 0,
    patientSatisfaction: 0,
    doctorUtilization: 0
  });
  
  const [doctorPerformance, setDoctorPerformance] = useState<DoctorPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchClinicStats();
    fetchDoctorPerformance();
  }, [selectedPeriod]);

  const fetchClinicStats = async () => {
    try {
      // Simulate API call - replace with actual API
      const mockStats: ClinicStats = {
        totalPatients: 247,
        totalDoctors: 4,
        weeklyEarnings: 12450,
        monthlyEarnings: 48200,
        yearlyEarnings: 578400,
        weeklyAppointments: 89,
        monthlyAppointments: 356,
        averageAppointmentValue: 135,
        patientSatisfaction: 4.7,
        doctorUtilization: 78
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch clinic stats:', error);
    }
  };

  const fetchDoctorPerformance = async () => {
    try {
      // Simulate API call - replace with actual API
      const mockDoctorData: DoctorPerformance[] = [
        {
          id: '1',
          name: 'J Han',
          totalPatients: 89,
          weeklyAppointments: 32,
          monthlyAppointments: 128,
          earnings: {
            weekly: 4320,
            monthly: 17280,
            yearly: 207360
          },
          patientSatisfaction: 4.8,
          specialization: 'Small Animal Medicine',
          utilizationRate: 85
        },
        {
          id: '2',
          name: 'J Lee',
          totalPatients: 76,
          weeklyAppointments: 28,
          monthlyAppointments: 112,
          earnings: {
            weekly: 3780,
            monthly: 15120,
            yearly: 181440
          },
          patientSatisfaction: 4.6,
          specialization: 'Surgery & Emergency Care',
          utilizationRate: 82
        },
        {
          id: '3',
          name: 'Sarah Wilson',
          totalPatients: 45,
          weeklyAppointments: 18,
          monthlyAppointments: 72,
          earnings: {
            weekly: 2430,
            monthly: 9720,
            yearly: 116640
          },
          patientSatisfaction: 4.9,
          specialization: 'Exotic Animals',
          utilizationRate: 65
        },
        {
          id: '4',
          name: 'Michael Brown',
          totalPatients: 37,
          weeklyAppointments: 11,
          monthlyAppointments: 44,
          earnings: {
            weekly: 1920,
            monthly: 6080,
            yearly: 72960
          },
          patientSatisfaction: 4.5,
          specialization: 'Dental Care',
          utilizationRate: 58
        }
      ];
      setDoctorPerformance(mockDoctorData);
    } catch (error) {
      console.error('Failed to fetch doctor performance:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clinic Management</h1>
          <p className="text-gray-600 mt-1">
            {format(new Date(), 'EEEE, MMMM do, yyyy')}
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

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Earnings</p>
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
              <p className="text-sm font-medium text-gray-600 mb-1">Total Patients</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalPatients}</p>
              <p className="text-xs text-gray-500 mt-1">Active patients</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Appointments</p>
              <p className="text-2xl font-bold text-purple-600">
                {selectedPeriod === 'week' ? stats.weeklyAppointments : stats.monthlyAppointments}
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
              <p className="text-sm font-medium text-gray-600 mb-1">Average Value</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(stats.averageAppointmentValue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Per appointment</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Patient Satisfaction</h3>
            <Award className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-3xl font-bold text-yellow-600">{stats.patientSatisfaction}</div>
            <div className="flex-1">
              <div className="text-sm text-gray-600">out of 5.0</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${(stats.patientSatisfaction / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Doctor Utilization</h3>
            <Activity className="w-5 h-5 text-teal-500" />
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-3xl font-bold text-teal-600">{stats.doctorUtilization}%</div>
            <div className="flex-1">
              <div className="text-sm text-gray-600">Average across all doctors</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-teal-500 h-2 rounded-full" 
                  style={{ width: `${stats.doctorUtilization}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Doctors</h3>
            <Target className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-3xl font-bold text-indigo-600">{stats.totalDoctors}</div>
            <div className="flex-1">
              <div className="text-sm text-gray-600">Veterinarians on staff</div>
              <div className="text-xs text-green-600 mt-1">All active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EarningsChart selectedPeriod={selectedPeriod} />
        <AppointmentChart selectedPeriod={selectedPeriod} />
      </div>

      {/* Doctor Statistics */}
      <DoctorStatistics 
        doctors={doctorPerformance} 
        selectedPeriod={selectedPeriod}
      />

      {/* Performance Metrics */}
      <PerformanceMetrics 
        doctors={doctorPerformance}
        clinicStats={stats}
      />
    </div>
  );
};

export default ClinicDashboard;