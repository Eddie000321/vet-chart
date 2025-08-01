import React from 'react';
import { 
  BarChart3, 
  Users, 
  PawPrint, 
  FileText, 
  Calendar,
  UserCheck,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();

  // Helper function to check if user has any of the specified roles
  const hasRole = (rolesToCheck: string[]) => {
    return user?.roles?.some(role => rolesToCheck.includes(role)) || false;
  };

  const menuItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: BarChart3 },
    { id: 'owners', label: 'Owners', icon: Users },
    { id: 'patients', label: 'Patients', icon: PawPrint },
    { id: 'records', label: 'Medical Records', icon: FileText },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'members', label: 'Hospital Members', icon: UserCheck },
    { id: 'billing', label: 'Billing', icon: Receipt },
  ];

  // Only show Clinic Analytics for users with admin role
  if (hasRole(['admin'])) {
    menuItems.push({ id: 'settings', label: 'Clinic Analytics', icon: TrendingUp });
  }

  return (
    <aside className="bg-gray-50 border-r border-gray-200 w-64 min-h-screen">
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-teal-100 text-teal-700 shadow-sm border-l-4 border-teal-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;