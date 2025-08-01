import React, { useState, useEffect } from 'react';
import { Search, Plus, Calendar, Clock, User, PawPrint, Edit, Trash2, CheckCircle, XCircle, Settings } from 'lucide-react';
import { Appointment } from '../../types';
import { appointmentsAPI } from '../../services/api';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import AppointmentForm from './AppointmentForm';
import AppointmentEditForm from './AppointmentEditForm';
import CalendarView from './CalendarView';
import BusinessHoursSettings, { BusinessHoursConfig } from '../Settings/BusinessHoursSettings';
import { useBusinessHours } from '../../hooks/useBusinessHours';

const AppointmentList: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'day' | 'week' | 'month'>('list');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showBusinessHoursSettings, setShowBusinessHoursSettings] = useState(false);
  const { businessHours, updateBusinessHours } = useBusinessHours();
  const [initialAppointmentData, setInitialAppointmentData] = useState<{ date: string; time: string; veterinarian: string } | null>(null);

  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    setViewMode('day');
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    let filtered = appointments.filter(appointment =>
      appointment.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.veterinarian.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.patient?.owner && `${appointment.patient.owner.firstName} ${appointment.patient.owner.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === statusFilter);
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter]);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentsAPI.getAll();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentAdded = (newAppointment: Appointment) => {
    setAppointments(prev => [newAppointment, ...prev]);
    setShowForm(false);
    setInitialAppointmentData(null);
  };

  const handleAppointmentUpdated = (updatedAppointment: Appointment) => {
    setAppointments(prev => prev.map(appointment => 
      appointment.id === updatedAppointment.id ? updatedAppointment : appointment
    ));
    setEditingAppointment(null);
    setShowEditForm(false);
  };

  const handleAppointmentDeleted = (appointmentId: string) => {
    setAppointments(prev => prev.filter(appointment => appointment.id !== appointmentId));
    setEditingAppointment(null);
    setShowEditForm(false);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowEditForm(true);
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    setDeletingId(appointmentId);
    try {
      await appointmentsAPI.delete(appointmentId);
      setAppointments(prev => prev.filter(appointment => appointment.id !== appointmentId));
    } catch (error: any) {
      alert(error.message || 'Failed to delete appointment');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      const updatedAppointment = await appointmentsAPI.updateStatus(appointmentId, newStatus);
      setAppointments(prev => prev.map(appointment => 
        appointment.id === appointmentId ? updatedAppointment : appointment
      ));
    } catch (error: any) {
      alert(error.message || 'Failed to update appointment status');
    }
  };

  const handleAddAppointmentFromCalendar = (defaults: { date: string; time: string; veterinarian: string }) => {
    setInitialAppointmentData(defaults);
    setShowForm(true);
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'no-show':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM dd, yyyy');
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
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'day'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Month
            </button>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Appointment</span>
          </button>
          
          <button
            onClick={() => setShowBusinessHoursSettings(true)}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            title="Business Hours Settings"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search appointments by patient, reason, or veterinarian..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no-show">No Show</option>
        </select>
      </div>

      {/* Appointments List */}
      {viewMode === 'list' ? (
        filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-teal-100 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <PawPrint className="w-4 h-4 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.patient?.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        ({appointment.patient?.species})
                      </span>
                    </div>
                    {appointment.patient?.owner && (
                      <div className="flex items-center space-x-1 mt-1 text-sm text-gray-600">
                        <User className="w-3 h-3" />
                        <span>Owner: {appointment.patient.owner.firstName} {appointment.patient.owner.lastName}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{getDateLabel(appointment.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{appointment.time} ({appointment.duration} min)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>Dr. {appointment.veterinarian}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                  
                  <div className="flex space-x-1">
                    {appointment.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                          title="Mark as completed"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Cancel appointment"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => handleEditAppointment(appointment)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Edit appointment"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      disabled={deletingId === appointment.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                      title="Delete appointment"
                    >
                      {deletingId === appointment.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Reason for Visit</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {appointment.reason}
                  </p>
                </div>

                {appointment.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Notes</h4>
                    <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                      {appointment.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                Appointment created {format(new Date(appointment.createdAt), 'MMM dd, yyyy \'at\' h:mm a')}
              </div>
            </div>
          ))}
        </div>
        ) : (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Get started by scheduling an appointment.'}
          </p>
        </div>
        )
      ) : (
        <CalendarView
          viewMode={viewMode as 'day' | 'week' | 'month'}
          appointments={filteredAppointments}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          onAppointmentClick={handleEditAppointment}
          onStatusChange={handleStatusChange}
          onDeleteAppointment={handleDeleteAppointment}
          deletingId={deletingId}
          onDayClick={handleDayClick}
          onAppointmentUpdated={handleAppointmentUpdated}
          onAddAppointment={handleAddAppointmentFromCalendar}
        />
      )}

      {/* Appointment Form Modal */}
      {showForm && (
        <AppointmentForm
          onClose={() => {
            setShowForm(false);
            setInitialAppointmentData(null);
          }}
          onAppointmentAdded={handleAppointmentAdded}
          initialData={initialAppointmentData}
        />
      )}

      {/* Appointment Edit Form Modal */}
      {showEditForm && editingAppointment && (
        <AppointmentEditForm
          appointment={editingAppointment}
          onClose={() => {
            setShowEditForm(false);
            setEditingAppointment(null);
          }}
          onAppointmentUpdated={handleAppointmentUpdated}
          onAppointmentDeleted={handleAppointmentDeleted}
        />
      )}

      {/* Business Hours Settings Modal */}
      {showBusinessHoursSettings && (
        <BusinessHoursSettings
          currentSettings={businessHours}
          onClose={() => setShowBusinessHoursSettings(false)}
          onSave={(settings: BusinessHoursConfig) => {
            updateBusinessHours(settings);
            setShowBusinessHoursSettings(false);
          }}
        />
      )}
    </div>
  );
};

export default AppointmentList;