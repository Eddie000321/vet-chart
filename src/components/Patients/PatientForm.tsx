import React, { useState, useEffect } from 'react';
import { X, Search, ChevronDown } from 'lucide-react';
import { Patient, Owner } from '../../types';
import { patientsAPI, ownersAPI } from '../../services/api';

interface PatientFormProps {
  onClose: () => void;
  onPatientAdded: (patient: Patient) => void;
  onPatientUpdated?: (patient: Patient) => void;
  editingPatient?: Patient | null;
  preSelectedOwnerId?: string;
}

const PatientForm: React.FC<PatientFormProps> = ({ onClose, onPatientAdded, onPatientUpdated, editingPatient, preSelectedOwnerId }) => {
  const [formData, setFormData] = useState({
    name: editingPatient?.name || '',
    species: editingPatient?.species || '',
    breed: editingPatient?.breed || '',
    age: editingPatient?.age?.toString() || '',
    gender: editingPatient?.gender || 'Male' as 'Male' | 'Female',
    weight: editingPatient?.weight?.toString() || '',
    ownerId: editingPatient?.ownerId || preSelectedOwnerId || '',
    weightUnit: editingPatient?.weightUnit || 'lbs' as 'lbs' | 'kg',
    status: editingPatient?.status || 'active' as 'active' | 'inactive',
    assignedDoctor: editingPatient?.assignedDoctor || '',
    handlingDifficulty: editingPatient?.handlingDifficulty || '' as '' | 'easy' | 'medium' | 'hard'
  });
  const [owners, setOwners] = useState<Owner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);
  const [ownerSearchTerm, setOwnerSearchTerm] = useState('');
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [selectedOwnerName, setSelectedOwnerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOwners();
    // Set initial selected owner name if editing or pre-selected
    if (editingPatient && owners.length > 0) {
      const owner = owners.find(o => o.id === editingPatient.ownerId);
      if (owner) {
        setSelectedOwnerName(`${owner.firstName} ${owner.lastName}`);
      }
    } else if (preSelectedOwnerId && owners.length > 0) {
      const owner = owners.find(o => o.id === preSelectedOwnerId);
      if (owner) {
        setSelectedOwnerName(`${owner.firstName} ${owner.lastName}`);
      }
    }
  }, [editingPatient, preSelectedOwnerId, owners]);

  useEffect(() => {
    const filtered = owners.filter(owner =>
      `${owner.firstName} ${owner.lastName}`.toLowerCase().includes(ownerSearchTerm.toLowerCase()) ||
      owner.email.toLowerCase().includes(ownerSearchTerm.toLowerCase())
    );
    setFilteredOwners(filtered);
  }, [owners, ownerSearchTerm]);

  const fetchOwners = async () => {
    try {
      const data = await ownersAPI.getAll();
      setOwners(data);
      setFilteredOwners(data);
    } catch (error) {
      console.error('Failed to fetch owners:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const patientData = {
        ...formData,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        weightUnit: formData.weightUnit
      };
      
      if (editingPatient) {
        const updatedPatient = await patientsAPI.update(editingPatient.id, patientData);
        onPatientUpdated?.(updatedPatient);
      } else {
        const newPatient = await patientsAPI.create(patientData);
        onPatientAdded(newPatient);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${editingPatient ? 'update' : 'add'} patient`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOwnerSelect = (owner: Owner) => {
    setFormData(prev => ({ ...prev, ownerId: owner.id }));
    setSelectedOwnerName(`${owner.firstName} ${owner.lastName}`);
    setOwnerSearchTerm('');
    setShowOwnerDropdown(false);
  };

  const handleOwnerSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOwnerSearchTerm(e.target.value);
    setShowOwnerDropdown(true);
    if (e.target.value === '') {
      setFormData(prev => ({ ...prev, ownerId: '' }));
      setSelectedOwnerName('');
    }
  };

  const speciesOptions = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Fish', 'Reptile', 'Other'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingPatient ? 'Edit Patient' : 'Add New Patient'}
          </h2>
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
              Owner
            </label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={selectedOwnerName || ownerSearchTerm}
                  onChange={handleOwnerSearchChange}
                  onFocus={() => setShowOwnerDropdown(true)}
                  placeholder="Search for an owner..."
                  required
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <ChevronDown 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 cursor-pointer"
                  onClick={() => setShowOwnerDropdown(!showOwnerDropdown)}
                />
              </div>
              
              {showOwnerDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredOwners.length > 0 ? (
                    filteredOwners.map((owner) => (
                      <div
                        key={owner.id}
                        onClick={() => handleOwnerSelect(owner)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">
                          {owner.firstName} {owner.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {owner.email} • {owner.phone}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-center">
                      No owners found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pet Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Species
              </label>
              <select
                name="species"
                value={formData.species}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Select species</option>
                {speciesOptions.map((species) => (
                  <option key={species} value={species}>
                    {species}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Breed
              </label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age (years)
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="0"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                required
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                name="weightUnit"
                value={formData.weightUnit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="lbs">lbs</option>
                <option value="kg">kg</option>
              </select>
            </div>
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Handling Difficulty
            </label>
            <select
              name="handlingDifficulty"
              value={formData.handlingDifficulty}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select Difficulty (Optional)</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Doctor
            </label>
            <select
              name="assignedDoctor"
              value={formData.assignedDoctor}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select Doctor (Optional)</option>
              <option value="J Han">Dr. J Han</option>
              <option value="J Lee">Dr. J Lee</option>
              <option value="Sarah Wilson">Dr. Sarah Wilson</option>
              <option value="Michael Brown">Dr. Michael Brown</option>
            </select>
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
              {loading ? (editingPatient ? 'Updating...' : 'Adding...') : (editingPatient ? 'Update Patient' : 'Add Patient')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;