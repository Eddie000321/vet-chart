import React, { useState, useEffect } from 'react';
import { X, Search, ChevronDown } from 'lucide-react';
import { MedicalRecord, Patient } from '../../types';
import { recordsAPI, patientsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface RecordFormProps {
  onClose: () => void;
  onRecordAdded: (record: MedicalRecord) => void;
  preSelectedPatientId?: string;
}

const RecordForm: React.FC<RecordFormProps> = ({ onClose, onRecordAdded, preSelectedPatientId }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    patientId: preSelectedPatientId || '',
    visitDate: new Date().toISOString().split('T')[0],
    recordType: 'treatment' as 'vaccine' | 'surgery' | 'treatment' | 'dental',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    veterinarian: `${user?.firstName} ${user?.lastName}` || ''
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);
  
  useEffect(() => {
    // Set initial selected patient name if pre-selected
    if (preSelectedPatientId && patients.length > 0) {
      const patient = patients.find(p => p.id === preSelectedPatientId);
      if (patient) {
        setSelectedPatientName(`${patient.name} (${patient.species}) - ${patient.owner?.firstName} ${patient.owner?.lastName}`);
      }
    }
  }, [preSelectedPatientId, patients]);

  useEffect(() => {
    const filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
      patient.species.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
      patient.breed.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
      (patient.owner && `${patient.owner.firstName} ${patient.owner.lastName}`.toLowerCase().includes(patientSearchTerm.toLowerCase()))
    );
    setFilteredPatients(filtered);
  }, [patients, patientSearchTerm]);

  const fetchPatients = async () => {
    try {
      const data = await patientsAPI.getAll();
      setPatients(data);
      setFilteredPatients(data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const recordData = {
        ...formData,
      };
      const newRecord = await recordsAPI.create(recordData);
      onRecordAdded(newRecord);
    } catch (err: any) {
      setError(err.message || 'Failed to add record');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePatientSelect = (patient: Patient) => {
    setFormData(prev => ({ ...prev, patientId: patient.id }));
    setSelectedPatientName(`${patient.name} (${patient.species}) - ${patient.owner?.firstName} ${patient.owner?.lastName}`);
    setPatientSearchTerm('');
    setShowPatientDropdown(false);
  };

  const handlePatientSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientSearchTerm(e.target.value);
    setShowPatientDropdown(true);
    if (e.target.value === '') {
      setFormData(prev => ({ ...prev, patientId: '' }));
      setSelectedPatientName('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Medical Record</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient
              </label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={selectedPatientName || patientSearchTerm}
                    onChange={handlePatientSearchChange}
                    onFocus={() => setShowPatientDropdown(true)}
                    placeholder="Search for a patient..."
                    required
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <ChevronDown 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 cursor-pointer"
                    onClick={() => setShowPatientDropdown(!showPatientDropdown)}
                  />
                </div>
                
                {showPatientDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <div
                          key={patient.id}
                          onClick={() => handlePatientSelect(patient)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">
                            {patient.name} ({patient.species})
                          </div>
                          <div className="text-sm text-gray-500">
                            {patient.breed} • Owner: {patient.owner?.firstName} {patient.owner?.lastName}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-center">
                        No patients found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visit Date
              </label>
              <input
                type="date"
                name="visitDate"
                value={formData.visitDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Record Type
              </label>
              <select
                name="recordType"
                value={formData.recordType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="treatment">Treatment</option>
                <option value="vaccine">Vaccine</option>
                <option value="surgery">Surgery</option>
                <option value="dental">Dental</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Symptoms
            </label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Describe the symptoms observed..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis
            </label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Enter the diagnosis..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Treatment
            </label>
            <textarea
              name="treatment"
              value={formData.treatment}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Describe the treatment plan..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Veterinarian
            </label>
            <select
              name="veterinarian"
              value={formData.veterinarian}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select Veterinarian</option>
              <option value="J Han">Dr. J Han</option>
              <option value="J Lee">Dr. J Lee</option>
              <option value="Sarah Wilson">Dr. Sarah Wilson</option>
              <option value="Michael Brown">Dr. Michael Brown</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Any additional notes or observations..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordForm;