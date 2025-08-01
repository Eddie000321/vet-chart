import React from 'react';
import { X, FileText, Calendar, User, PawPrint, Stethoscope, Pill, ClipboardList, Edit } from 'lucide-react';
import { MedicalRecord } from '../../types';
import { format } from 'date-fns';

interface MedicalRecordDetailsModalProps {
  record: MedicalRecord;
  onClose: () => void;
  onEdit?: (record: MedicalRecord) => void;
}

const MedicalRecordDetailsModal: React.FC<MedicalRecordDetailsModalProps> = ({ record, onClose, onEdit }) => {
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
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-teal-100 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Medical Record Details</h2>
              <p className="text-sm text-gray-500">
                {format(new Date(record.visitDate), 'EEEE, MMMM do, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit?.(record)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              title="Edit record"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Visit Information */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-lg font-medium text-gray-900">
                  {format(new Date(record.visitDate), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Dr. {record.veterinarian}
                </span>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          {record.patient && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <PawPrint className="w-5 h-5 mr-2 text-gray-600" />
                Patient Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getSpeciesColor(record.patient.species)}`}>
                      <PawPrint className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{record.patient.name}</p>
                      <p className="text-sm text-gray-500">
                        {record.patient.species} • {record.patient.breed}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Age:</span> {record.patient.age} years</p>
                    <p><span className="font-medium">Gender:</span> {record.patient.gender}</p>
                    <p><span className="font-medium">Weight:</span> {record.patient.weight} {record.patient.weightUnit || 'lbs'}</p>
                  </div>
                </div>

                {/* Owner Information */}
                {record.patient.owner && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Owner Details
                    </h4>
                    <div className="text-sm space-y-2">
                      <p className="font-medium text-gray-900">
                        {record.patient.owner.firstName} {record.patient.owner.lastName}
                      </p>
                      <p className="text-gray-600">{record.patient.owner.email}</p>
                      <p className="text-gray-600">{record.patient.owner.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Medical Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <ClipboardList className="w-4 h-4 text-gray-500" />
                <h4 className="text-sm font-medium text-gray-900">Symptoms</h4>
              </div>
              <p className="text-sm text-gray-600 bg-white p-4 rounded-lg border border-gray-200">
                {record.symptoms}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-4 h-4 text-blue-500" />
                <h4 className="text-sm font-medium text-gray-900">Diagnosis</h4>
              </div>
              <p className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
                {record.diagnosis}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Pill className="w-4 h-4 text-green-500" />
                <h4 className="text-sm font-medium text-gray-900">Treatment</h4>
              </div>
              <p className="text-sm text-gray-600 bg-green-50 p-4 rounded-lg border border-green-200">
                {record.treatment}
              </p>
            </div>
          </div>

          {/* Additional Notes */}
          {record.notes && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Additional Notes</h4>
              <p className="text-sm text-gray-600 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                {record.notes}
              </p>
            </div>
          )}

          {/* Record Metadata */}
          <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
            <p>Record created {format(new Date(record.createdAt), 'MMM dd, yyyy \'at\' h:mm a')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordDetailsModal;