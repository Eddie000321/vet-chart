import React, { useState, useEffect } from 'react';
import { X, Search, ChevronDown, Clock } from 'lucide-react';
import { Appointment, Patient } from '../../types';
import { appointmentsAPI, patientsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useBusinessHours } from '../../hooks/useBusinessHours';

interface AppointmentEditFormProps {
  appointment: Appointment;
  onClose: () => void;
  onAppointmentUpdated: (appointment: Appointment) => void;
}

const AppointmentEditForm: React.FC<AppointmentEditFormProps> = ({ appointment, onClose, onAppointmentUpdated }) => {
  const { user } = useAuth();
  const { generateTimeSlots } = useBusinessHours();
  const [formData, setFormData] = useState({
    patientId: appointment.patientId,
    date: appointment.date.split('T')[0],
    time: appointment.time,
    duration: appointment.duration,
    reason: appointment.reason,
    notes: appointment.notes || '',
    status: appointment.status,
    veterinarian: appointment.veterinarian || ''
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const timeSlots = generateTimeSlots();
  const durationOptions = [30, 60, 90, 120];
  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no-show', label: 'No Show' }
  ];

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    // Set initial selected patient name
    if (appointment.patient) {
      setSelectedPatientName(`${appointment.patient.name} (${appointment.patient.species}) - ${appointment.patient.owner?.firstName} ${appointment.patient.owner?.lastName}`);
    }
  }, [appointment.patient]);

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
      const appointmentData = {
        ...formData,
      };
      const updatedAppointment = await appointmentsAPI.update(appointment.id, appointmentData);
      onAppointmentUpdated(updatedAppointment);
    } catch (err: any) {
      setError(err.message || 'Failed to update appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'duration' ? parseInt(value) : value }));
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
          <h2 className="text-xl font-semibold text-gray-900">Edit Appointment</h2>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {durationOptions.map((duration) => (
                  <option key={duration} value={duration}>
                    {duration} minutes
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Visit
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Describe the reason for this appointment..."
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
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Any additional notes or special instructions..."
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
              {loading ? 'Updating...' : 'Update Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentEditForm;