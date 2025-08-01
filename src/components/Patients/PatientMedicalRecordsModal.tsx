import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, User, Stethoscope, Pill, ClipboardList, Plus } from 'lucide-react';
import { Patient, MedicalRecord } from '../../types';
import { recordsAPI } from '../../services/api';
import { format } from 'date-fns';
import RecordForm from '../Records/RecordForm';

interface PatientMedicalRecordsModalProps {
  patient: Patient;
  onClose: () => void;
}

const PatientMedicalRecordsModal: React.FC<PatientMedicalRecordsModalProps> = ({ patient, onClose }) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddRecordForm, setShowAddRecordForm] = useState(false);

  useEffect(() => {
    fetchPatientRecords();
  }, [patient.id]);

  const fetchPatientRecords = async () => {
    try {
      const data = await recordsAPI.getByPatientId(patient.id);
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch patient records:', error);
    } finally {
      setLoading(false);
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

  const handleRecordAdded = (newRecord: MedicalRecord) => {
    setRecords(prev => [newRecord, ...prev]);
    setShowAddRecordForm(false);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${getSpeciesColor(patient.species)}`}>
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {patient.name}'s Medical Records
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {patient.species} • {patient.breed} • Owner: {patient.owner?.firstName} {patient.owner?.lastName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddRecordForm(true)}
              className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Record</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : records.length > 0 ? (
            <div className="space-y-6">
              <div className="text-sm text-gray-600 mb-4">
                {records.length} medical {records.length === 1 ? 'record' : 'records'} found
              </div>
              
              {records.map((record) => (
                <div key={record.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-teal-100 p-2 rounded-lg">
                        <FileText className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">
                              {format(new Date(record.visitDate), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>Dr. {record.veterinarian}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <ClipboardList className="w-4 h-4 text-gray-500" />
                        <h4 className="text-sm font-medium text-gray-900">Symptoms</h4>
                      </div>
                      <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border">
                        {record.symptoms}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="w-4 h-4 text-blue-500" />
                        <h4 className="text-sm font-medium text-gray-900">Diagnosis</h4>
                      </div>
                      <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                        {record.diagnosis}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Pill className="w-4 h-4 text-green-500" />
                        <h4 className="text-sm font-medium text-gray-900">Treatment</h4>
                      </div>
                      <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg border border-green-200">
                        {record.treatment}
                      </p>
                    </div>
                  </div>

                  {record.notes && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Notes</h4>
                      <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        {record.notes}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    Record created {format(new Date(record.createdAt), 'MMM dd, yyyy \'at\' h:mm a')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No medical records found</h3>
              <p className="mt-1 text-sm text-gray-500">
                This patient doesn't have any medical records yet.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Record Form Modal */}
      {showAddRecordForm && (
        <RecordForm
          onClose={() => setShowAddRecordForm(false)}
          onRecordAdded={handleRecordAdded}
          preSelectedPatientId={patient.id}
        />
      )}
    </div>
  );
};

export default PatientMedicalRecordsModal;