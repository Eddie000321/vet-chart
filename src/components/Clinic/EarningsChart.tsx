import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign } from 'lucide-react';

interface EarningsData {
  period: string;
  earnings: number;
  appointments: number;
}

interface EarningsChartProps {
  selectedPeriod: 'week' | 'month' | 'year';
}

const EarningsChart: React.FC<EarningsChartProps> = ({ selectedPeriod }) => {
  const [earningsData, setEarningsData] = useState<EarningsData[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [growthRate, setGrowthRate] = useState(0);

  useEffect(() => {
    generateEarningsData();
  }, [selectedPeriod]);

  const generateEarningsData = () => {
    let data: EarningsData[] = [];
    let total = 0;

    if (selectedPeriod === 'week') {
      // Last 7 days
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      data = days.map((day, index) => {
        const earnings = Math.floor(Math.random() * 3000) + 1000;
        const appointments = Math.floor(earnings / 135); // Average appointment value
        total += earnings;
        return { period: day, earnings, appointments };
      });
      setGrowthRate(12.5);
    } else if (selectedPeriod === 'month') {
      // Last 4 weeks
      data = [
        { period: 'Week 1', earnings: 11200, appointments: 83 },
        { period: 'Week 2', earnings: 12800, appointments: 95 },
        { period: 'Week 3', earnings: 10900, appointments: 81 },
        { period: 'Week 4', earnings: 13300, appointments: 98 }
      ];
      total = data.reduce((sum, item) => sum + item.earnings, 0);
      setGrowthRate(8.3);
    } else {
      // Last 12 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      data = months.map((month, index) => {
        const earnings = Math.floor(Math.random() * 20000) + 35000;
        const appointments = Math.floor(earnings / 135);
        total += earnings;
        return { period: month, earnings, appointments };
      });
      setGrowthRate(15.7);
    }

    setEarningsData(data);
    setTotalEarnings(total);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const maxEarnings = Math.max(...earningsData.map(d => d.earnings));

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'week':
        return 'Daily Earnings';
      case 'month':
        return 'Weekly Earnings';
      case 'year':
        return 'Monthly Earnings';
      default:
        return 'Earnings';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{getPeriodLabel()}</h3>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(totalEarnings)}
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
        {earningsData.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-16 text-sm font-medium text-gray-600">
              {item.period}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(item.earnings)}
                </span>
                <span className="text-xs text-gray-500">
                  {item.appointments} appointments
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(item.earnings / maxEarnings) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(totalEarnings / earningsData.length)}
            </div>
            <div className="text-xs text-gray-500">Average</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(Math.max(...earningsData.map(d => d.earnings)))}
            </div>
            <div className="text-xs text-gray-500">Highest</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {Math.round(earningsData.reduce((sum, item) => sum + item.appointments, 0) / earningsData.length)}
            </div>
            <div className="text-xs text-gray-500">Avg Appointments</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsChart;