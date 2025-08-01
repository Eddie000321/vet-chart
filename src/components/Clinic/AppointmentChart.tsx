import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Clock } from 'lucide-react';

interface AppointmentData {
  doctor: string;
  appointments: number;
  color: string;
  percentage: number;
}

interface AppointmentChartProps {
  selectedPeriod: 'week' | 'month' | 'year';
}

const AppointmentChart: React.FC<AppointmentChartProps> = ({ selectedPeriod }) => {
  const [appointmentData, setAppointmentData] = useState<AppointmentData[]>([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [growthRate, setGrowthRate] = useState(0);

  useEffect(() => {
    generateAppointmentData();
  }, [selectedPeriod]);

  const generateAppointmentData = () => {
    let data: AppointmentData[] = [];
    let total = 0;

    if (selectedPeriod === 'week') {
      data = [
        { doctor: 'J Han', appointments: 32, color: 'bg-blue-500', percentage: 0 },
        { doctor: 'J Lee', appointments: 28, color: 'bg-green-500', percentage: 0 },
        { doctor: 'Sarah Wilson', appointments: 18, color: 'bg-purple-500', percentage: 0 },
        { doctor: 'Michael Brown', appointments: 11, color: 'bg-orange-500', percentage: 0 }
      ];
      setGrowthRate(7.2);
    } else if (selectedPeriod === 'month') {
      data = [
        { doctor: 'J Han', appointments: 128, color: 'bg-blue-500', percentage: 0 },
        { doctor: 'J Lee', appointments: 112, color: 'bg-green-500', percentage: 0 },
        { doctor: 'Sarah Wilson', appointments: 72, color: 'bg-purple-500', percentage: 0 },
        { doctor: 'Michael Brown', appointments: 44, color: 'bg-orange-500', percentage: 0 }
      ];
      setGrowthRate(12.8);
    } else {
      data = [
        { doctor: 'J Han', appointments: 1536, color: 'bg-blue-500', percentage: 0 },
        { doctor: 'J Lee', appointments: 1344, color: 'bg-green-500', percentage: 0 },
        { doctor: 'Sarah Wilson', appointments: 864, color: 'bg-purple-500', percentage: 0 },
        { doctor: 'Michael Brown', appointments: 528, color: 'bg-orange-500', percentage: 0 }
      ];
      setGrowthRate(18.5);
    }

    total = data.reduce((sum, item) => sum + item.appointments, 0);
    
    // Calculate percentages
    data = data.map(item => ({
      ...item,
      percentage: Math.round((item.appointments / total) * 100)
    }));

    setAppointmentData(data);
    setTotalAppointments(total);
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'week':
        return 'Weekly Appointments by Doctor';
      case 'month':
        return 'Monthly Appointments by Doctor';
      case 'year':
        return 'Yearly Appointments by Doctor';
      default:
        return 'Appointments by Doctor';
    }
  };

  const maxAppointments = Math.max(...appointmentData.map(d => d.appointments));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{getPeriodLabel()}</h3>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">
                {totalAppointments.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">+{growthRate}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {appointmentData.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-20 text-sm font-medium text-gray-600">
              Dr. {item.doctor}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {item.appointments} appointments
                </span>
                <span className="text-xs text-gray-500">
                  {item.percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`${item.color} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${(item.appointments / maxAppointments) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pie Chart Representation */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              {appointmentData.map((item, index) => {
                const startAngle = appointmentData.slice(0, index).reduce((sum, d) => sum + (d.percentage * 3.6), 0);
                const endAngle = startAngle + (item.percentage * 3.6);
                const largeArcFlag = item.percentage > 50 ? 1 : 0;
                
                const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
                
                const pathData = [
                  `M 50 50`,
                  `L ${x1} ${y1}`,
                  `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');
                
                return (
                  <path
                    key={index}
                    d={pathData}
                    className={item.color.replace('bg-', 'fill-')}
                    opacity="0.8"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{totalAppointments}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          {appointmentData.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
              <span className="text-xs text-gray-600">Dr. {item.doctor}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppointmentChart;