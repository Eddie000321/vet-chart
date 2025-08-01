import React from 'react';
import { User, TrendingUp, Calendar, DollarSign, Star, Activity } from 'lucide-react';

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

interface DoctorStatisticsProps {
  doctors: DoctorPerformance[];
  selectedPeriod: 'week' | 'month' | 'year';
}

const DoctorStatistics: React.FC<DoctorStatisticsProps> = ({ doctors, selectedPeriod }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getAppointmentCount = (doctor: DoctorPerformance) => {
    switch (selectedPeriod) {
      case 'week':
        return doctor.weeklyAppointments;
      case 'month':
        return doctor.monthlyAppointments;
      case 'year':
        return doctor.monthlyAppointments * 12; // Approximate
      default:
        return doctor.monthlyAppointments;
    }
  };

  const getEarnings = (doctor: DoctorPerformance) => {
    switch (selectedPeriod) {
      case 'week':
        return doctor.earnings.weekly;
      case 'month':
        return doctor.earnings.monthly;
      case 'year':
        return doctor.earnings.yearly;
      default:
        return doctor.earnings.monthly;
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

  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSatisfactionColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Doctor Performance</h2>
        <span className="text-sm text-gray-500">{getPeriodLabel()}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-teal-100 p-2 rounded-full">
                  <User className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Dr. {doctor.name}</h3>
                  <p className="text-sm text-gray-500">{doctor.specialization}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getUtilizationColor(doctor.utilizationRate)}`}>
                {doctor.utilizationRate}% Utilization
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Calendar className="w-4 h-4 text-blue-600 mr-1" />
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {getAppointmentCount(doctor)}
                </div>
                <div className="text-xs text-gray-600">Appointments</div>
              </div>

              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                </div>
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(getEarnings(doctor))}
                </div>
                <div className="text-xs text-gray-600">Earnings</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{doctor.totalPatients} Total Patients</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className={`w-4 h-4 ${getSatisfactionColor(doctor.patientSatisfaction)}`} />
                <span className={`font-medium ${getSatisfactionColor(doctor.patientSatisfaction)}`}>
                  {doctor.patientSatisfaction}
                </span>
              </div>
            </div>

            {/* Performance Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Performance Score</span>
                <span>{Math.round((doctor.utilizationRate + doctor.patientSatisfaction * 20) / 2)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.round((doctor.utilizationRate + doctor.patientSatisfaction * 20) / 2)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorStatistics;