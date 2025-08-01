import React, { useState, useEffect } from 'react';
import { Users, PawPrint, Calendar, FileText, TrendingUp, Settings, UserCheck } from 'lucide-react';
import { DashboardStats } from '../../types';
import { dashboardAPI } from '../../services/api';
import { format } from 'date-fns';
import WeeklyScheduleChart from './WeeklyScheduleChart';
import QuickActionsConfigModal from './QuickActionsConfigModal';

interface QuickActionsConfig {
  patients: boolean;
  owners: boolean;
  records: boolean;
  appointments: boolean;
  members: boolean;
}

interface DashboardProps {
  onNavigate?: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalOwners: 0,
    todayAppointments: 0,
    recentRecords: []
  });
  const [loading, setLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [quickActionsConfig, setQuickActionsConfig] = useState<QuickActionsConfig>({
    patients: true,
    owners: true,
    records: true,
    appointments: true,
    members: false
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardAPI.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    // Load quick actions config from localStorage
    const savedConfig = localStorage.getItem('quickActionsConfig');
    if (savedConfig) {
      try {
        setQuickActionsConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Failed to parse quick actions config:', error);
      }
    }
  }, []);

  const handleConfigSave = (config: QuickActionsConfig) => {
    setQuickActionsConfig(config);
    localStorage.setItem('quickActionsConfig', JSON.stringify(config));
    setShowConfigModal(false);
  };

  const quickActionItems = [
    {
      key: 'patients',
      label: 'Add New Patient',
      icon: PawPrint,
      bgColor: 'bg-teal-50',
      hoverColor: 'hover:bg-teal-100',
      iconColor: 'text-teal-600',
      textColor: 'text-teal-700',
      navigateTo: 'patients'
    },
    {
      key: 'owners',
      label: 'Register Owner',
      icon: Users,
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-700',
      navigateTo: 'owners'
    },
    {
      key: 'records',
      label: 'Create Medical Record',
      icon: FileText,
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-green-700',
      navigateTo: 'records'
    },
    {
      key: 'appointments',
      label: 'Schedule Appointment',
      icon: Calendar,
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-700',
      navigateTo: 'appointments'
    },
    {
      key: 'members',
      label: 'Manage Hospital Members',
      icon: UserCheck,
      bgColor: 'bg-indigo-50',
      hoverColor: 'hover:bg-indigo-100',
      iconColor: 'text-indigo-600',
      textColor: 'text-indigo-700',
      navigateTo: 'members'
    }
  ];
  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: PawPrint,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      navigateTo: 'patients'
    },
    {
      title: 'Total Owners',
      value: stats.totalOwners,
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      navigateTo: 'owners'
    },
    {
      title: 'Today\'s Appointments',
      value: stats.todayAppointments,
      icon: Calendar,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      navigateTo: 'appointments'
    },
    {
      title: 'Medical Records',
      value: stats.recentRecords.length,
      icon: FileText,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      navigateTo: 'records'
    }
  ];

  const handleCardClick = (navigateTo: string) => {
    if (onNavigate) {
      onNavigate(navigateTo);
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {format(new Date(), 'EEEE, MMMM do, yyyy')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div 
              key={index} 
              className={`${card.bgColor} rounded-xl p-6 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transform hover:scale-105 transition-all duration-200`}
              onClick={() => handleCardClick(card.navigateTo)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Medical Records</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          {stats.recentRecords.length > 0 ? (
            <div className="space-y-4">
              {stats.recentRecords.slice(0, 5).map((record) => (
                <div key={record.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0 w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {record.patient?.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {record.diagnosis}
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(record.visitDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent medical records</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <button
              onClick={() => setShowConfigModal(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Configure Quick Actions"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {quickActionItems
              .filter(item => quickActionsConfig[item.key as keyof QuickActionsConfig])
              .map((item) => {
                const Icon = item.icon;
                return (
                  <button 
                    key={item.key}
                    onClick={() => handleCardClick(item.navigateTo)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg ${item.bgColor} ${item.hoverColor} transition-colors text-left`}
                  >
                    <Icon className={`w-5 h-5 ${item.iconColor}`} />
                    <span className={item.textColor}>{item.label}</span>
                  </button>
                );
              })}
            
            {quickActionItems.filter(item => quickActionsConfig[item.key as keyof QuickActionsConfig]).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Settings className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No quick actions enabled</p>
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="text-teal-600 hover:text-teal-700 text-sm mt-1"
                >
                  Configure actions
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <WeeklyScheduleChart />

      {/* Quick Actions Configuration Modal */}
      {showConfigModal && (
        <QuickActionsConfigModal
          config={quickActionsConfig}
          onClose={() => setShowConfigModal(false)}
          onSave={handleConfigSave}
        />
      )}
    </div>
  );
};

export default Dashboard;