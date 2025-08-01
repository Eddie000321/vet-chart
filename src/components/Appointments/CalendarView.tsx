import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, PawPrint, Edit, Trash2, CheckCircle, XCircle, Filter } from 'lucide-react';
import { Appointment } from '../../types';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, startOfMonth, endOfMonth, getDay, setMonth, setYear, getMonth, getYear } from 'date-fns';
import { useBusinessHours } from '../../hooks/useBusinessHours';
import { appointmentsAPI } from '../../services/api';

interface CalendarViewProps {
  viewMode: 'day' | 'week' | 'month';
  appointments: Appointment[];
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onStatusChange: (id: string, status: Appointment['status']) => void;
  onDeleteAppointment: (id: string) => void;
  deletingId: string | null;
  onDayClick?: (date: Date) => void;
  onAppointmentUpdated?: (appointment: Appointment) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  viewMode,
  appointments,
  currentDate,
  setCurrentDate,
  onAppointmentClick,
  onStatusChange,
  onDeleteAppointment,
  deletingId,
  onDayClick,
  onAppointmentUpdated
}) => {

  const { generateTimeSlots } = useBusinessHours();
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ date: Date; time: string; doctor?: string } | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');

  // Doctor color mapping
  const doctorColors = {
    'J Han': { bg: 'bg-blue-500', bgLight: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-900' },
    'J Lee': { bg: 'bg-green-500', bgLight: 'bg-green-100', border: 'border-green-200', text: 'text-green-900' },
    'Sarah Wilson': { bg: 'bg-purple-500', bgLight: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-900' },
    'Michael Brown': { bg: 'bg-orange-500', bgLight: 'bg-orange-100', border: 'border-orange-200', text: 'text-orange-900' }
  };

  // Get unique doctors from appointments
  const availableDoctors = [...new Set(appointments.map(apt => apt.veterinarian))].sort();

  // Filter appointments by selected doctor
  const filteredAppointments = selectedDoctor === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.veterinarian === selectedDoctor);

  // Generate year options (current year ± 5 years)
  const currentYear = getYear(new Date());
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  
  // Month options
  const monthOptions = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' }
  ];
  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'no-show':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDoctorColor = (doctorName: string) => {
    return doctorColors[doctorName as keyof typeof doctorColors] || {
      bg: 'bg-gray-500',
      bgLight: 'bg-gray-100',
      border: 'border-gray-200',
      text: 'text-gray-900'
    };
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'day') {
      setCurrentDate(direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    } else if (viewMode === 'month') {
      setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    }
  };

  // Get unique doctors from appointments
  const getDoctorsForDate = (date: Date) => {
    const dayAppointments = getAppointmentsForDate(date);
    const doctors = [...new Set(dayAppointments.map(apt => apt.veterinarian))];
    return doctors.length > 0 ? doctors : ['J Han', 'J Lee']; // Default doctors if no appointments
  };

  const getAppointmentsForDoctorAndTime = (date: Date, doctor: string, time: string) => {
    return filteredAppointments.filter(appointment => 
      isSameDay(new Date(appointment.date), date) &&
      appointment.veterinarian === doctor &&
      appointment.time === time
    );
  };
  const handleYearChange = (year: number) => {
    setCurrentDate(setYear(currentDate, year));
  };

  const handleMonthChange = (month: number) => {
    setCurrentDate(setMonth(currentDate, month));
  };

  const handleDragStart = (e: React.DragEvent, appointment: Appointment) => {
    setDraggedAppointment(appointment);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.style.opacity = '1';
    setDraggedAppointment(null);
    setDragOverSlot(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, date: Date, time: string, doctor?: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set drag over if we're actually over this specific slot
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      setDragOverSlot({ date, time, doctor });
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // More precise drag leave detection using mouse coordinates
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    // Add a small buffer to prevent flickering
    const buffer = 2;
    if (x < rect.left - buffer || x > rect.right + buffer || 
        y < rect.top - buffer || y > rect.bottom + buffer) {
      setDragOverSlot(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetDate: Date, targetTime: string, targetDoctor?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Ensure we're dropping on the correct element
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    // Verify the drop is within the target element bounds
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverSlot(null);
      return;
    }
    
    setDragOverSlot(null);

    if (!draggedAppointment) return;

    // Ensure we format the date correctly for the API
    const newDate = format(targetDate, 'yyyy-MM-dd');
    const newVeterinarian = targetDoctor || draggedAppointment.veterinarian;

    // Don't update if dropping in the same slot
    if (draggedAppointment.date === newDate && 
        draggedAppointment.time === targetTime && 
        draggedAppointment.veterinarian === newVeterinarian) {
      return;
    }

    // Validate that the target time slot exists in business hours
    const timeSlots = generateTimeSlots();
    if (!timeSlots.includes(targetTime)) {
      alert('Invalid time slot. Please drop on a valid time.');
      return;
    }

    // Check if target slot is already occupied
    const existingAppointment = filteredAppointments.find(apt => 
      apt.date === newDate && 
      apt.time === targetTime && 
      apt.veterinarian === newVeterinarian &&
      apt.id !== draggedAppointment.id
    );

    if (existingAppointment) {
      alert('This time slot is already occupied. Please choose a different slot.');
      return;
    }

    console.log(`Moving appointment from ${draggedAppointment.date} ${draggedAppointment.time} to ${newDate} ${targetTime}`);
    
    try {
      const updatedAppointment = await appointmentsAPI.update(draggedAppointment.id, {
        ...draggedAppointment,
        date: newDate,
        time: targetTime,
        veterinarian: newVeterinarian
      });
      
      console.log('Appointment updated successfully:', updatedAppointment);
      onAppointmentUpdated?.(updatedAppointment);
    } catch (error) {
      console.error('Failed to update appointment:', error);
      alert('Failed to move appointment. Please try again.');
    }
  };

  const selectedYear = getYear(currentDate);
  const selectedMonth = getMonth(currentDate);

  const getDateRange = () => {
    if (viewMode === 'day') {
      return [currentDate];
    } else if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      return eachDayOfInterval({ start, end });
    } else if (viewMode === 'month') {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return eachDayOfInterval({ start, end });
    }
    return [];
  };

  const getAppointmentsForDate = (date: Date) => {
    return filteredAppointments.filter(appointment => 
      isSameDay(new Date(appointment.date), date)
    ).sort((a, b) => a.time.localeCompare(b.time));
  };

  const getHeaderTitle = () => {
    if (viewMode === 'day') {
      return format(currentDate, 'EEEE, MMMM do, yyyy');
    } else if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    } else if (viewMode === 'month') {
      return format(currentDate, 'MMMM yyyy');
    }
    return '';
  };

  const timeSlots = generateTimeSlots();

  const renderDayView = () => {
    const doctors = getDoctorsForDate(currentDate);
    
    const getDoctorAppointmentCount = (doctor: string) => {
      return appointments.filter(appointment => 
        isSameDay(new Date(appointment.date), currentDate) &&
        appointment.veterinarian === doctor &&
        appointment.status === 'scheduled'
      ).length;
    };
    
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className={`grid gap-0`} style={{ gridTemplateColumns: `2fr repeat(${doctors.length}, 1fr)` }}>
          {/* Time column */}
          <div className="border-r border-gray-200">
            <div className="h-12 border-b border-gray-200 bg-gray-50 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">Time</span>
            </div>
            {timeSlots.map((time) => (
              <div key={time} className="h-16 border-b border-gray-100 flex items-center justify-center">
                <span className="text-sm text-gray-500">{time}</span>
              </div>
            ))}
          </div>
          
          {/* Doctor columns */}
          {doctors.map((doctor) => (
            <div key={doctor} className="border-r border-gray-200 last:border-r-0 relative">
              <div className="h-12 border-b border-gray-200 bg-gray-50 flex flex-col items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  Dr. {doctor}
                </span>
                <span className="text-xs text-teal-600 font-medium">
                  {getDoctorAppointmentCount(doctor)} appointments
                </span>
              </div>
              
              {timeSlots.map((time) => {
                const doctorAppointments = getAppointmentsForDoctorAndTime(currentDate, doctor, time);
                const isDropTarget = dragOverSlot?.date && 
                  isSameDay(dragOverSlot.date, currentDate) && 
                  dragOverSlot.time === time && 
                  dragOverSlot.doctor === doctor;
                
                return (
                  <div 
                    key={time} 
                    className={`h-16 border-b border-gray-100 p-1 transition-colors ${
                      isDropTarget ? 'bg-teal-100 border-teal-300' : ''
                    } relative`}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, currentDate, time, doctor)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, currentDate, time, doctor)}
                    data-day={format(currentDate, 'yyyy-MM-dd')}
                    data-time={time}
                  >
                    <div className="space-y-1 max-h-full overflow-y-auto">
                      {doctorAppointments.map((appointment) => {
                        const doctorColor = getDoctorColor(appointment.veterinarian);
                        return (
                          <div
                            key={appointment.id}
                            className={`${doctorColor.bgLight} border ${doctorColor.border} rounded p-2 cursor-move hover:shadow-md transition-all ${
                              draggedAppointment?.id === appointment.id ? 'opacity-50' : ''
                            }`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, appointment)}
                            onDragEnd={handleDragEnd}
                            onClick={() => onAppointmentClick(appointment)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-medium ${doctorColor.text} truncate`}>
                                  {appointment.patient?.name}
                                </p>
                                <p className={`text-xs ${doctorColor.text} opacity-75 truncate`}>
                                  {appointment.reason.substring(0, 15)}...
                                </p>
                              </div>
                              <span className={`px-1 py-0.5 rounded text-xs ml-1 ${getStatusColor(appointment.status)}`}>
                                {appointment.status.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {doctorAppointments.length > 1 && (
                        <div className="text-xs text-gray-500 text-center">
                          {doctorAppointments.length} appts
                        </div>
                      )}
                    </div>
                    {/* Drop zone indicator */}
                    {isDropTarget && doctorAppointments.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-teal-400 rounded bg-teal-50 z-10">
                        <span className="text-xs text-teal-600 font-medium">Drop here</span>
                      </div>
                    )}
                    {/* Grid overlay for precise drop targeting */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="w-full h-full border border-transparent hover:border-teal-200 transition-colors"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getDateRange();
    
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="grid grid-cols-8 gap-0">
          {/* Time column */}
          <div className="border-r border-gray-200">
            <div className="h-12 border-b border-gray-200 bg-gray-50"></div>
            {timeSlots.map((time) => (
              <div key={time} className="h-16 border-b border-gray-100 flex items-center justify-center">
                <span className="text-sm text-gray-500">{time}</span>
              </div>
            ))}
          </div>
          
          {/* Day columns */}
          {weekDays.map((day) => {
            const dayAppointments = getAppointmentsForDate(day);
            return (
              <div key={day.toISOString()} className="border-r border-gray-200 last:border-r-0">
                <div className="h-12 border-b border-gray-200 bg-gray-50 flex flex-col items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {format(day, 'EEE')}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {format(day, 'd')}
                  </span>
                </div>
                
                {timeSlots.map((time) => {
                  const slotAppointments = dayAppointments.filter(apt => apt.time === time);
                  const isDropTarget = dragOverSlot?.date && 
                    isSameDay(dragOverSlot.date, day) && 
                    dragOverSlot.time === time;
                  
                  return (
                    <div 
                      key={time} 
                      className={`h-16 border-b border-gray-100 p-1 transition-all duration-200 ${
                        isDropTarget ? 'bg-teal-100 border-teal-300' : ''
                      }`}
                      onDragOver={handleDragOver}
                      onDragEnter={(e) => handleDragEnter(e, day, time)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, day, time)}
                    >
                      {/* Visual drop zone indicator */}
                      {isDropTarget && slotAppointments.length === 0 && (
                        <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-teal-400 rounded bg-teal-50">
                          <span className="text-xs text-teal-600 font-medium">Drop here</span>
                        </div>
                      )}
                      
                      <div className="space-y-1 max-h-full overflow-y-auto">
                        {slotAppointments.map((appointment) => {
                          const doctorColor = getDoctorColor(appointment.veterinarian);
                          return (
                            <React.Fragment key={appointment.id}>
                              <div
                                className={`${doctorColor.bgLight} border ${doctorColor.border} rounded p-1 cursor-move hover:shadow-md transition-all ${
                                  draggedAppointment?.id === appointment.id ? 'opacity-50' : ''
                                } select-none relative z-20`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, appointment)}
                                onDragEnd={handleDragEnd}
                                onClick={() => onAppointmentClick(appointment)}
                                data-appointment-id={appointment.id}
                              >
                                <p className={`text-xs font-medium ${doctorColor.text} truncate`}>
                                  {appointment.patient?.name}
                                </p>
                                <p className={`text-xs ${doctorColor.text} opacity-75 truncate`}>
                                  Dr. {appointment.veterinarian}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className={`text-xs ${doctorColor.text} opacity-60`}>{appointment.time}</span>
                                  <span className={`text-xs ${doctorColor.text} opacity-60`}>{appointment.duration}m</span>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })}
                        {slotAppointments.length > 1 && (
                          <div className="text-xs text-gray-400 text-center">
                            +{slotAppointments.length - 1}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
    
    // Add visual feedback for successful drops
    const showSuccessMessage = (message: string) => {
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    };
  };

  const renderMonthView = () => {
    const monthDays = getDateRange();
    const startDate = startOfMonth(currentDate);
    const firstDayOfWeek = getDay(startDate);
    
    // Add empty cells for days before the first day of the month
    const emptyCells = Array.from({ length: firstDayOfWeek }, (_, i) => (
      <div key={`empty-${i}`} className="h-32 border border-gray-200 bg-gray-50"></div>
    ));
    
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="h-12 border-b border-gray-200 bg-gray-50 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">{day}</span>
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0">
          {emptyCells}
          {monthDays.map((day) => {
            const dayAppointments = getAppointmentsForDate(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={day.toISOString()} 
                className="h-32 border border-gray-200 p-2 overflow-y-auto cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onDayClick?.(day)}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isToday ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((appointment) => {
                    const doctorColor = getDoctorColor(appointment.veterinarian);
                    return (
                      <div
                        key={appointment.id}
                        className={`${doctorColor.bgLight} border ${doctorColor.border} rounded p-1 cursor-move hover:shadow-md transition-all ${
                          draggedAppointment?.id === appointment.id ? 'opacity-50' : ''
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, appointment)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onAppointmentClick(appointment)}
                      >
                        <p className={`text-xs font-medium ${doctorColor.text} truncate`}>
                          {appointment.time} - {appointment.patient?.name}
                        </p>
                        <p className={`text-xs ${doctorColor.text} opacity-60 truncate`}>
                          Dr. {appointment.veterinarian}
                        </p>
                      </div>
                    );
                  })}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayAppointments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">
              {getHeaderTitle()}
            </h2>
            
            {/* Doctor Filter */}
            {viewMode === 'week' && (
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Doctors</option>
                  {availableDoctors.map((doctor) => (
                    <option key={doctor} value={doctor}>
                      Dr. {doctor}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Year and Month Selectors */}
            <div className="flex items-center space-x-2">
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            onClick={() => navigateDate('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <button
          onClick={() => setCurrentDate(new Date())}
          className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Today
        </button>
      </div>

      {/* Calendar Content */}
      {viewMode === 'day' && renderDayView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'month' && renderMonthView()}

      {/* Doctor Color Legend */}
      {viewMode === 'week' && selectedDoctor === 'all' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-6">
            <span className="text-xs font-medium text-gray-600">Doctors:</span>
            {availableDoctors.map((doctor) => {
              const doctorColor = getDoctorColor(doctor);
              return (
                <div key={doctor} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 ${doctorColor.bg} rounded`}></div>
                  <span className="text-xs text-gray-600">Dr. {doctor}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;