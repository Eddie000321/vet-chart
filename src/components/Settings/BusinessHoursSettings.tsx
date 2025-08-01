import React, { useState, useEffect } from 'react';
import { X, Clock, Save } from 'lucide-react';

interface BusinessHoursSettingsProps {
  onClose: () => void;
  onSave: (settings: BusinessHoursConfig) => void;
  currentSettings: BusinessHoursConfig;
}

export interface BusinessHoursConfig {
  startHour: number;
  endHour: number;
  intervalMinutes: number;
}

const BusinessHoursSettings: React.FC<BusinessHoursSettingsProps> = ({ 
  onClose, 
  onSave, 
  currentSettings 
}) => {
  const [settings, setSettings] = useState<BusinessHoursConfig>(currentSettings);
  const [loading, setLoading] = useState(false);

  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: `${i.toString().padStart(2, '0')}:00`
  }));

  const intervalOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' }
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      // Validate settings
      if (settings.startHour >= settings.endHour) {
        alert('Start time must be before end time');
        return;
      }
      
      if (settings.endHour - settings.startHour < 2) {
        alert('Business hours must be at least 2 hours');
        return;
      }

      // Save to localStorage
      localStorage.setItem('businessHours', JSON.stringify(settings));
      
      onSave(settings);
      onClose();
    } catch (error) {
      console.error('Failed to save business hours:', error);
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      startHour: 8,
      endHour: 18,
      intervalMinutes: 30
    });
  };

  const getTotalHours = () => {
    return settings.endHour - settings.startHour;
  };

  const getTotalSlots = () => {
    const totalMinutes = (settings.endHour - settings.startHour) * 60;
    return Math.floor(totalMinutes / settings.intervalMinutes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Business Hours</h2>
              <p className="text-sm text-gray-500">Configure your clinic's operating hours</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opening Time
            </label>
            <select
              value={settings.startHour}
              onChange={(e) => setSettings(prev => ({ ...prev, startHour: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {hourOptions.slice(0, 22).map((hour) => (
                <option key={hour.value} value={hour.value}>
                  {hour.label}
                </option>
              ))}
            </select>
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Closing Time
            </label>
            <select
              value={settings.endHour}
              onChange={(e) => setSettings(prev => ({ ...prev, endHour: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {hourOptions.slice(settings.startHour + 1).map((hour) => (
                <option key={hour.value} value={hour.value}>
                  {hour.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appointment Intervals
            </label>
            <select
              value={settings.intervalMinutes}
              onChange={(e) => setSettings(prev => ({ ...prev, intervalMinutes: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {intervalOptions.map((interval) => (
                <option key={interval.value} value={interval.value}>
                  {interval.label}
                </option>
              ))}
            </select>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Preview</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Operating Hours:</span> {settings.startHour.toString().padStart(2, '0')}:00 - {settings.endHour.toString().padStart(2, '0')}:00
              </p>
              <p>
                <span className="font-medium">Total Hours:</span> {getTotalHours()} hours
              </p>
              <p>
                <span className="font-medium">Available Slots:</span> {getTotalSlots()} slots per day
              </p>
              <p>
                <span className="font-medium">Interval:</span> {settings.intervalMinutes} minutes
              </p>
            </div>
          </div>

          {/* Common Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSettings({ startHour: 8, endHour: 18, intervalMinutes: 30 })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                8:00 - 18:00
              </button>
              <button
                onClick={() => setSettings({ startHour: 9, endHour: 17, intervalMinutes: 30 })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                9:00 - 17:00
              </button>
              <button
                onClick={() => setSettings({ startHour: 8, endHour: 20, intervalMinutes: 30 })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                8:00 - 20:00
              </button>
              <button
                onClick={() => setSettings({ startHour: 7, endHour: 19, intervalMinutes: 30 })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                7:00 - 19:00
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Reset to Default
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessHoursSettings;