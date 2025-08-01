import React from 'react';
import { Trophy, Target, TrendingUp, Users, Clock, Star } from 'lucide-react';

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

interface PerformanceMetricsProps {
  doctors: DoctorPerformance[];
  clinicStats: ClinicStats;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ doctors, clinicStats }) => {
  const topPerformer = doctors.reduce((prev, current) => 
    (prev.earnings.monthly > current.earnings.monthly) ? prev : current
  );

  const mostSatisfied = doctors.reduce((prev, current) => 
    (prev.patientSatisfaction > current.patientSatisfaction) ? prev : current
  );

  const mostUtilized = doctors.reduce((prev, current) => 
    (prev.utilizationRate > current.utilizationRate) ? prev : current
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-600 bg-green-100' };
    if (score >= 80) return { label: 'Good', color: 'text-blue-600 bg-blue-100' };
    if (score >= 70) return { label: 'Average', color: 'text-yellow-600 bg-yellow-100' };
    return { label: 'Needs Improvement', color: 'text-red-600 bg-red-100' };
  };

  const clinicPerformanceScore = Math.round(
    (clinicStats.doctorUtilization + clinicStats.patientSatisfaction * 20) / 2
  );

  const performanceLevel = getPerformanceLevel(clinicPerformanceScore);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Performers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
          <Trophy className="w-5 h-5 text-yellow-500" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 p-2 rounded-full">
                <TrendingUp className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Top Earner</h4>
                <p className="text-sm text-gray-600">Dr. {topPerformer.name}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-yellow-600">
                {formatCurrency(topPerformer.earnings.monthly)}
              </div>
              <div className="text-xs text-gray-500">This month</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Star className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Highest Satisfaction</h4>
                <p className="text-sm text-gray-600">Dr. {mostSatisfied.name}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-green-600">
                {mostSatisfied.patientSatisfaction}/5.0
              </div>
              <div className="text-xs text-gray-500">Patient rating</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Most Utilized</h4>
                <p className="text-sm text-gray-600">Dr. {mostUtilized.name}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-blue-600">
                {mostUtilized.utilizationRate}%
              </div>
              <div className="text-xs text-gray-500">Utilization rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Clinic Performance Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Clinic Performance</h3>
          <Target className="w-5 h-5 text-indigo-500" />
        </div>

        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {clinicPerformanceScore}%
          </div>
          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${performanceLevel.color}`}>
            {performanceLevel.label}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Patient Satisfaction</span>
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(clinicStats.patientSatisfaction / 5) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {clinicStats.patientSatisfaction}/5.0
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Doctor Utilization</span>
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${clinicStats.doctorUtilization}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {clinicStats.doctorUtilization}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Revenue per Appointment</span>
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${Math.min((clinicStats.averageAppointmentValue / 200) * 100, 100)}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(clinicStats.averageAppointmentValue)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">
                {clinicStats.totalPatients}
              </div>
              <div className="text-xs text-gray-500">Active Patients</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {clinicStats.monthlyAppointments}
              </div>
              <div className="text-xs text-gray-500">Monthly Appointments</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;