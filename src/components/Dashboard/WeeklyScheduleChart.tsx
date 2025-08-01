import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, X, PawPrint, Phone, Mail } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { useBusinessHours } from '../../hooks/useBusinessHours';
import { useAuth } from '../../contexts/AuthContext';

interface Appointment {
  id: string;
  patientId: string;
  patient?: {
    name: string;
    species: string;
    owner?: {
      firstName: string;
      lastName: string;
    };
  };
  date: string;
  time: string;
  duration: number;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  veterinarian: string;
}

const WeeklyScheduleChart: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ date: Date; time: string } | null>(null);
  const { generateTimeSlots } = useBusinessHours();
  const { user } = useAuth();

  useEffect(() => {
    fetchAppointments();
  }, [currentWeek]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  const timeSlots = generateTimeSlots();

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt => {
      const doctorName = `${user?.firstName} ${user?.lastName}`;
      return isSameDay(new Date(apt.date), date) && 
             apt.status === 'scheduled' &&
             apt.veterinarian === doctorName;
    }
    );
  };

  const getAppointmentForTimeSlot = (date: Date, time: string) => {
    const dayAppointments = getAppointmentsForDay(date);
    return dayAppointments.find(apt => apt.time === time);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = direction === 'next' ? addWeeks(currentWeek, 1) : subWeeks(currentWeek, 1);
    setCurrentWeek(newWeek);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleDragStart = (e: React.DragEvent, appointment: Appointment) => {
    setDraggedAppointment(appointment);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', appointment.id);
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
    setDraggedAppointment(null);
    setDragOverSlot(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, date: Date, time: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlot({ date, time });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear drag over if we're leaving the drop zone completely
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverSlot(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetDate: Date, targetTime: string) => {
    e.preventDefault();
    setDragOverSlot(null);

    if (!draggedAppointment) return;

    const newDate = format(targetDate, 'yyyy-MM-dd');
    const doctorName = `${user?.firstName} ${user?.lastName}`;

    // Don't update if dropping in the same slot
    if (draggedAppointment.date === newDate && draggedAppointment.time === targetTime) {
      return;
    }

    // Check if target slot is already occupied by another appointment
    const existingAppointment = appointments.find(apt => 
      apt.date === newDate && 
      apt.time === targetTime && 
      apt.veterinarian === doctorName &&
      apt.id !== draggedAppointment.id
    );

    if (existingAppointment) {
      alert('This time slot is already occupied. Please choose a different slot.');
      return;
    }

    try {
      const response = await fetch(`/api/appointments/${draggedAppointment.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...draggedAppointment,
          date: newDate,
          time: targetTime
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }
      
      // Refresh appointments
      fetchAppointments();
    } catch (error) {
      console.error('Failed to update appointment:', error);
      alert('Failed to move appointment. Please try again.');
    }
  };

  const closeModal = () => {
    setSelectedAppointment(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Weekly Schedule</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            title="Previous week"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          
          <span className="text-sm font-medium text-gray-700">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </span>
          
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            title="Next week"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
          
          <button
            onClick={() => setCurrentWeek(new Date())}
            className="px-3 py-1 text-xs font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            title="Go to current week"
          >
            Today
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header with days */}
          <div className="grid grid-cols-8 gap-0 mb-2">
            <div className="p-2 text-xs font-medium text-gray-500 text-center">Time</div>
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="p-2 text-center">
                <div className="text-xs font-medium text-gray-600">
                  {format(day, 'EEE')}
                </div>
                <div className={`text-sm font-semibold ${
                  isSameDay(day, new Date()) ? 'text-teal-600' : 'text-gray-900'
                }`}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Schedule grid */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {timeSlots.map((time, timeIndex) => (
              <div key={time} className={`grid grid-cols-8 ${
                timeIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'
              }`}>
                {/* Time column */}
                <div className="p-2 border-r border-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-500">{time}</span>
                </div>
                
                {/* Day columns */}
                {weekDays.map((day) => {
                  const appointment = getAppointmentForTimeSlot(day, time);
                  const isDropTarget = dragOverSlot?.date && 
                    isSameDay(dragOverSlot.date, day) && 
                    dragOverSlot.time === time;
                  
                  return (
                    <div 
                      key={`${day.toISOString()}-${time}`} 
                      className={`p-1 border-r border-gray-200 last:border-r-0 h-12 transition-colors ${
                        isDropTarget ? 'bg-teal-100 border-2 border-teal-300 border-dashed' : ''
                      }`}
                      onDragOver={handleDragOver}
                      onDragEnter={(e) => handleDragEnter(e, day, time)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, day, time)}
                    >
                      {appointment && (
                        <div className="h-full relative group select-none">
                          <div 
                            className={`h-full w-full rounded ${getStatusColor(appointment.status)} opacity-90 hover:opacity-100 transition-all cursor-move shadow-sm hover:shadow-md ${
                              draggedAppointment?.id === appointment.id ? 'opacity-50' : ''
                            }`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, appointment)}
                            onDragEnd={handleDragEnd}
                            onClick={() => handleAppointmentClick(appointment)}
                            title={`${appointment.patient?.name} - ${appointment.reason.substring(0, 50)}...`}
                          >
                            <div className="p-1 text-white text-xs">
                              <div className="font-medium truncate">
                                {appointment.patient?.name}
                              </div>
                              <div className="text-xs opacity-75 truncate">
                                {appointment.patient?.species}
                              </div>
                            </div>
                          </div>
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap shadow-lg">
                            <div className="font-medium">{appointment.patient?.name}</div>
                            <div className="text-gray-300">{appointment.patient?.species}</div>
                            <div className="text-gray-300">Dr. {appointment.veterinarian}</div>
                            <div className="text-gray-300">{appointment.duration} min</div>
                            <div className="text-gray-300 max-w-xs truncate">{appointment.reason}</div>
                            {/* Tooltip arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      )}
                      
                      {/* Drop zone indicator when dragging */}
                      {isDropTarget && !appointment && (
                        <div className="h-full w-full flex items-center justify-center">
                          <div className="text-teal-600 text-xs font-medium">Drop here</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-300 border border-dashed border-gray-400 rounded"></div>
          <span className="text-xs text-gray-600">Drop Zone</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-xs text-gray-600">Scheduled</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-xs text-gray-600">Completed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-xs text-gray-600">Cancelled</span>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="bg-teal-100 p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Appointment Details</h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(selectedAppointment.date), 'EEEE, MMMM do, yyyy')}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Patient Information */}
              {selectedAppointment.patient && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-3 mb-2">
                    <PawPrint className="w-4 h-4 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {selectedAppointment.patient.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {selectedAppointment.patient.species}
                      </p>
                    </div>
                  </div>
                  
                  {selectedAppointment.patient.owner && (
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center space-x-2">
                        <User className="w-3 h-3" />
                        <span>
                          {selectedAppointment.patient.owner.firstName} {selectedAppointment.patient.owner.lastName}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Appointment Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Time:</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {selectedAppointment.time} ({selectedAppointment.duration} min)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Veterinarian:</span>
                  <span className="text-sm text-gray-900">
                    Dr. {selectedAppointment.veterinarian}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                    {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Reason */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Reason for Visit:</h4>
                <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  {selectedAppointment.reason}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyScheduleChart;