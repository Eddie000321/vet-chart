import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import ClinicDashboard from './components/Clinic/ClinicDashboard';
import OwnerList from './components/Owners/OwnerList';
import PatientList from './components/Patients/PatientList';
import RecordList from './components/Records/RecordList';
import AppointmentList from './components/Appointments/AppointmentList';
import MemberList from './components/Members/MemberList';
import BillList from './components/Billing/BillList';
import LoginForm from './components/Auth/LoginForm';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'owners':
        return <OwnerList />;
      case 'patients':
        return <PatientList />;
      case 'records':
        return <RecordList />;
      case 'appointments':
        return <AppointmentList />;
      case 'members':
        return <MemberList />;
      case 'billing':
        return <BillList />;
      case 'settings':
        // Only allow users with admin role to access clinic analytics
        return user?.roles?.includes('admin') ? <ClinicDashboard /> : <Dashboard onNavigate={setActiveTab} />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;