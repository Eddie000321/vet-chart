import React from 'react';
import { X, Calendar, Clock, User, PawPrint, FileText, Phone, Mail, CheckCircle } from 'lucide-react';
import { Appointment } from '../../types';
import { format } from 'date-fns';

interface AppointmentDetailsModalProps {
  appointment: Appointment;
  onClose: () => void;
  onStatusChange?: (id: string, status: Appointment['status']) => void;
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({ appointment, onClose, onStatusChange }) => {
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

  const getSpeciesColor = (species: string) => {
    const colors = {
      'Dog': 'bg-blue-100 text-blue-600',
      'Cat': 'bg-purple-100 text-purple-600',
      'Bird': 'bg-yellow-100 text-yellow-600',
      'Rabbit': 'bg-green-100 text-green-600',
      'Hamster': 'bg-orange-100 text-orange-600',
      'Fish': 'bg-cyan-100 text-cyan-600',
      'Reptile': 'bg-red-100 text-red-600',
    };
    return colors[species as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-teal-100 p-2 rounded-lg">
              <Calendar className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
              <p className="text-sm text-gray-500">
                {format(new Date(appointment.date), 'EEEE, MMMM do, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {appointment.status === 'scheduled' && onStatusChange && (
              <button
                onClick={() => {
                  onStatusChange(appointment.id, 'completed');
                  onClose();
                }}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Complete</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-lg font-medium text-gray-900">
                  {appointment.time}
                </span>
                <span className="text-sm text-gray-500">
                  ({appointment.duration} minutes)
                </span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </div>

          {/* Patient Information */}
          {appointment.patient && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <PawPrint className="w-5 h-5 mr-2 text-gray-600" />
                Patient Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getSpeciesColor(appointment.patient.species)}`}>
                      <PawPrint className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{appointment.patient.name}</p>
                      <p className="text-sm text-gray-500">
                        {appointment.patient.species} • {appointment.patient.breed}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Age:</span> {appointment.patient.age} years</p>
                    <p><span className="font-medium">Gender:</span> {appointment.patient.gender}</p>
                    <p><span className="font-medium">Weight:</span> {appointment.patient.weight} {appointment.patient.weightUnit || 'lbs'}</p>
                  </div>
                </div>

                {/* Owner Information */}
                {appointment.patient.owner && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Owner Details
                    </h4>
                    <div className="text-sm space-y-2">
                      <p className="font-medium text-gray-900">
                        {appointment.patient.owner.firstName} {appointment.patient.owner.lastName}
                      </p>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail className="w-3 h-3" />
                        <span>{appointment.patient.owner.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="w-3 h-3" />
                        <span>{appointment.patient.owner.phone}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Appointment Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-600" />
                Appointment Details
              </h3>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Reason for Visit</h4>
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    {appointment.reason}
                  </p>
                </div>

                {appointment.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Additional Notes</h4>
                    <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      {appointment.notes}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Veterinarian</h4>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">Dr. {appointment.veterinarian}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Metadata */}
          <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
            <p>Appointment created {format(new Date(appointment.createdAt), 'MMM dd, yyyy \'at\' h:mm a')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsModal;