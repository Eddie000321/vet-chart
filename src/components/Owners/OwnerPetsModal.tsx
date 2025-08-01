import React, { useState, useEffect } from 'react';
import { X, PawPrint, Scale, Calendar, Plus } from 'lucide-react';
import { Owner, Patient } from '../../types';
import { patientsAPI } from '../../services/api';
import PatientMedicalRecordsModal from '../Patients/PatientMedicalRecordsModal';
import PatientForm from '../Patients/PatientForm';

interface OwnerPetsModalProps {
  owner: Owner;
  onClose: () => void;
}

const OwnerPetsModal: React.FC<OwnerPetsModalProps> = ({ owner, onClose }) => {
  const [pets, setPets] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState<Patient | null>(null);
  const [showAddPetForm, setShowAddPetForm] = useState(false);

  useEffect(() => {
    fetchOwnerPets();
  }, [owner.id]);

  const fetchOwnerPets = async () => {
    try {
      const allPatients = await patientsAPI.getAll();
      const ownerPets = allPatients.filter(patient => patient.ownerId === owner.id);
      setPets(ownerPets);
    } catch (error) {
      console.error('Failed to fetch owner pets:', error);
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

  const formatWeight = (patient: Patient) => {
    const unit = patient.weightUnit || 'lbs';
    const weight = patient.weight;
    const convertedWeight = unit === 'lbs' ? 
      (weight * 0.453592) : 
      (weight / 0.453592);
    const convertedUnit = unit === 'lbs' ? 'kg' : 'lbs';
    
    return `${weight} ${unit} (${convertedWeight.toFixed(1)} ${convertedUnit})`;
  };

  const handlePetClick = (pet: Patient) => {
    setSelectedPet(pet);
  };

  const handlePetAdded = (newPet: Patient) => {
    setPets(prev => [newPet, ...prev]);
    setShowAddPetForm(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {owner.firstName} {owner.lastName}'s Pets
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {pets.length} {pets.length === 1 ? 'pet' : 'pets'} registered
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddPetForm(true)}
              className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Pet</span>
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
          ) : pets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.map((pet) => (
                <div 
                  key={pet.id} 
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-100 hover:shadow-md transition-all duration-200"
                  onClick={() => handlePetClick(pet)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getSpeciesColor(pet.species)}`}>
                        <PawPrint className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{pet.name}</h3>
                        <p className="text-sm text-gray-500">{pet.breed}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSpeciesColor(pet.species)}`}>
                      {pet.species}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium">{pet.age} years</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Gender:</span>
                      <span className="font-medium">{pet.gender}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Weight:</span>
                      <div className="flex items-center space-x-1">
                        <Scale className="w-3 h-3 text-gray-400" />
                        <span className="font-medium text-xs">{formatWeight(pet)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500 pt-2 border-t border-gray-200">
                      <Calendar className="w-3 h-3" />
                      <span>Registered {new Date(pet.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <PawPrint className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pets registered</h3>
              <p className="mt-1 text-sm text-gray-500">
                This owner doesn't have any pets registered yet.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Patient Medical Records Modal */}
      {selectedPet && (
        <PatientMedicalRecordsModal
          patient={selectedPet}
          onClose={() => setSelectedPet(null)}
        />
      )}
      
      {/* Add Pet Form Modal */}
      {showAddPetForm && (
        <PatientForm
          onClose={() => setShowAddPetForm(false)}
          onPatientAdded={handlePetAdded}
          preSelectedOwnerId={owner.id}
        />
      )}
    </div>
  );
};

export default OwnerPetsModal;