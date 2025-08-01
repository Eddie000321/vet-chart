import React, { useState, useEffect } from 'react';
import { Search, Plus, PawPrint, User, Scale, Calendar, Edit, Trash2 } from 'lucide-react';
import { Patient } from '../../types';
import { patientsAPI } from '../../services/api';
import PatientForm from './PatientForm';
import PatientMedicalRecordsModal from './PatientMedicalRecordsModal';

const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [activePatients, setActivePatients] = useState<Patient[]>([]);
  const [inactivePatients, setInactivePatients] = useState<Patient[]>([]);
  const [currentView, setCurrentView] = useState<'active' | 'inactive'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    // Separate patients by status
    const active = patients.filter(patient => patient.status === 'active');
    const inactive = patients.filter(patient => patient.status === 'inactive');
    setActivePatients(active);
    setInactivePatients(inactive);
    
    // Filter based on current view
    const currentPatients = currentView === 'active' ? active : inactive;
    const filtered = currentPatients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.owner && `${patient.owner.firstName} ${patient.owner.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredPatients(filtered);
  }, [patients, searchTerm, currentView]);

  const fetchPatients = async () => {
    try {
      const data = await patientsAPI.getAll();
      // Add status to existing patients if not present (for backward compatibility)
      const patientsWithStatus = data.map(patient => ({
        ...patient,
        status: patient.status || 'active'
      }));
      setPatients(patientsWithStatus);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientAdded = (newPatient: Patient) => {
    setPatients(prev => [newPatient, ...prev]);
    setShowForm(false);
  };

  const handlePatientUpdated = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(patient => 
      patient.id === updatedPatient.id ? updatedPatient : patient
    ));
    setEditingPatient(null);
    setShowForm(false);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  const handlePatientClick = (patient: Patient, e: React.MouseEvent) => {
    // Don't open modal if clicking on edit or delete buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setSelectedPatient(patient);
  };

  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      return;
    }

    setDeletingId(patientId);
    try {
      await patientsAPI.delete(patientId);
      setPatients(prev => prev.filter(patient => patient.id !== patientId));
    } catch (error: any) {
      alert(error.message || 'Failed to delete patient');
    } finally {
      setDeletingId(null);
    }
  };

  const getSpeciesIcon = (species: string) => {
    return <PawPrint className="w-6 h-6" />;
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

  const getHandlingDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getHandlingDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '😊';
      case 'medium':
        return '😐';
      case 'hard':
        return '😤';
      default:
        return '';
    }
  };

  const convertWeight = (weight: number, fromUnit: string, toUnit: string) => {
    if (fromUnit === toUnit) return weight;
    if (fromUnit === 'lbs' && toUnit === 'kg') return weight * 0.453592;
    if (fromUnit === 'kg' && toUnit === 'lbs') return weight / 0.453592;
    return weight;
  };

  const formatWeight = (patient: Patient) => {
    const unit = patient.weightUnit || 'lbs';
    const weight = patient.weight;
    const convertedWeight = unit === 'lbs' ? 
      convertWeight(weight, 'lbs', 'kg') : 
      convertWeight(weight, 'kg', 'lbs');
    const convertedUnit = unit === 'lbs' ? 'kg' : 'lbs';
    
    return `${weight} ${unit} (${convertedWeight.toFixed(1)} ${convertedUnit})`;
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
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {currentView === 'active' ? 'Active' : 'Inactive'} Patients
          </h1>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCurrentView('active')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                currentView === 'active'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Active ({activePatients.length})
            </button>
            <button
              onClick={() => setCurrentView('inactive')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                currentView === 'inactive'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Inactive ({inactivePatients.length})
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Patient</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search patients by name, species, breed, or owner..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>

      {/* Patients Grid */}
      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <div 
              key={patient.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={(e) => handlePatientClick(patient, e)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`p-3 rounded-full ${getSpeciesColor(patient.species)}`}>
                    {getSpeciesIcon(patient.species)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                    <p className="text-sm text-gray-500">{patient.breed}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSpeciesColor(patient.species)}`}>
                    {patient.species}
                  </span>
                  
                  {patient.handlingDifficulty && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getHandlingDifficultyColor(patient.handlingDifficulty)}`}>
                      {getHandlingDifficultyIcon(patient.handlingDifficulty)} {patient.handlingDifficulty.charAt(0).toUpperCase() + patient.handlingDifficulty.slice(1)}
                    </span>
                  )}
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditPatient(patient)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Edit patient"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeletePatient(patient.id)}
                      disabled={deletingId === patient.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                      title="Delete patient"
                    >
                      {deletingId === patient.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-medium">
                    {patient.age} years
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-medium">{patient.gender}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Weight:</span>
                  <div className="flex items-center space-x-1">
                    <Scale className="w-3 h-3 text-gray-400" />
                    <span className="font-medium">{formatWeight(patient)}</span>
                  </div>
                </div>
                
                {patient.owner && (
                  <div className="flex items-center space-x-2 text-sm pt-2 border-t border-gray-100">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {patient.owner.firstName} {patient.owner.lastName}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>Registered {new Date(patient.createdAt).toLocaleDateString()}</span>
                </div>
                
                {patient.assignedDoctor && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 pt-2 border-t border-gray-100">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Assigned: Dr. {patient.assignedDoctor}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <PawPrint className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No {currentView} patients found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? 'Try adjusting your search terms.' 
              : currentView === 'active' 
                ? 'Get started by adding a new patient.' 
                : 'No inactive patients at this time.'
            }
          </p>
        </div>
      )}

      {/* Patient Form Modal */}
      {showForm && (
        <PatientForm
          onClose={() => {
            setShowForm(false);
            setEditingPatient(null);
          }}
          onPatientAdded={handlePatientAdded}
          onPatientUpdated={handlePatientUpdated}
          editingPatient={editingPatient}
        />
      )}

      {/* Patient Medical Records Modal */}
      {selectedPatient && (
        <PatientMedicalRecordsModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
};

export default PatientList;