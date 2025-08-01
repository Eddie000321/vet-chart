import React, { useState } from 'react';
import { X, Settings, PawPrint, Users, FileText, Calendar, UserCheck } from 'lucide-react';

interface QuickActionsConfig {
  patients: boolean;
  owners: boolean;
  records: boolean;
  appointments: boolean;
  members: boolean;
}

interface QuickActionsConfigModalProps {
  config: QuickActionsConfig;
  onClose: () => void;
  onSave: (config: QuickActionsConfig) => void;
}

const QuickActionsConfigModal: React.FC<QuickActionsConfigModalProps> = ({ config, onClose, onSave }) => {
  const [localConfig, setLocalConfig] = useState<QuickActionsConfig>(config);

  const actionItems = [
    {
      key: 'patients' as keyof QuickActionsConfig,
      label: 'Add New Patient',
      description: 'Quick access to add new patients',
      icon: PawPrint,
      color: 'text-teal-600'
    },
    {
      key: 'owners' as keyof QuickActionsConfig,
      label: 'Register Owner',
      description: 'Quick access to register new pet owners',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      key: 'records' as keyof QuickActionsConfig,
      label: 'Create Medical Record',
      description: 'Quick access to create medical records',
      icon: FileText,
      color: 'text-green-600'
    },
    {
      key: 'appointments' as keyof QuickActionsConfig,
      label: 'Schedule Appointment',
      description: 'Quick access to schedule appointments',
      icon: Calendar,
      color: 'text-purple-600'
    },
    {
      key: 'members' as keyof QuickActionsConfig,
      label: 'Manage Hospital Members',
      description: 'Quick access to manage hospital staff',
      icon: UserCheck,
      color: 'text-indigo-600'
    }
  ];

  const handleToggle = (key: keyof QuickActionsConfig) => {
    setLocalConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    onSave(localConfig);
  };

  const handleReset = () => {
    setLocalConfig({
      patients: true,
      owners: true,
      records: true,
      appointments: true,
      members: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Settings className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Configure Quick Actions</h2>
              <p className="text-sm text-gray-500">Customize which actions appear in your dashboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Available Quick Actions</h3>
              <button
                onClick={handleReset}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Reset to Default
              </button>
            </div>

            {actionItems.map((item) => {
              const Icon = item.icon;
              const isEnabled = localConfig[item.key];
              
              return (
                <div
                  key={item.key}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${
                    isEnabled
                      ? 'border-teal-200 bg-teal-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${isEnabled ? 'bg-white' : 'bg-gray-200'}`}>
                      <Icon className={`w-5 h-5 ${isEnabled ? item.color : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h4 className={`font-medium ${isEnabled ? 'text-gray-900' : 'text-gray-500'}`}>
                        {item.label}
                      </h4>
                      <p className={`text-sm ${isEnabled ? 'text-gray-600' : 'text-gray-400'}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => handleToggle(item.key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {Object.values(localConfig).filter(Boolean).length} of {actionItems.length} actions enabled
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsConfigModal;