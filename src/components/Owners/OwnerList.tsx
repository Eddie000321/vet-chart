import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Phone, Mail, MapPin, Trash2, Edit } from 'lucide-react';
import { Owner } from '../../types';
import { ownersAPI } from '../../services/api';
import OwnerForm from './OwnerForm';
import OwnerPetsModal from './OwnerPetsModal';

const OwnerList: React.FC = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);

  useEffect(() => {
    fetchOwners();
  }, []);

  useEffect(() => {
    const filtered = owners.filter(owner =>
      `${owner.firstName} ${owner.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.phone.includes(searchTerm)
    );
    setFilteredOwners(filtered);
  }, [owners, searchTerm]);

  const fetchOwners = async () => {
    try {
      const data = await ownersAPI.getAll();
      setOwners(data);
    } catch (error) {
      console.error('Failed to fetch owners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOwnerAdded = (newOwner: Owner) => {
    setOwners(prev => [newOwner, ...prev]);
    setShowForm(false);
  };

  const handleOwnerUpdated = (updatedOwner: Owner) => {
    setOwners(prev => prev.map(owner => 
      owner.id === updatedOwner.id ? updatedOwner : owner
    ));
    setEditingOwner(null);
    setShowForm(false);
  };

  const handleEditOwner = (owner: Owner) => {
    setEditingOwner(owner);
    setShowForm(true);
  };

  const handleOwnerClick = (owner: Owner, e: React.MouseEvent) => {
    // Don't open modal if clicking on edit or delete buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setSelectedOwner(owner);
  };

  const handleDeleteOwner = async (ownerId: string) => {
    if (!confirm('Are you sure you want to delete this owner? This action cannot be undone.')) {
      return;
    }

    setDeletingId(ownerId);
    try {
      await ownersAPI.delete(ownerId);
      setOwners(prev => prev.filter(owner => owner.id !== ownerId));
    } catch (error: any) {
      alert(error.message || 'Failed to delete owner');
    } finally {
      setDeletingId(null);
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Pet Owners</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Owner</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search owners by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>

      {/* Owners Grid */}
      {filteredOwners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOwners.map((owner) => (
            <div 
              key={owner.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={(e) => handleOwnerClick(owner, e)}
            >
              <div className="flex flex-col space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className="bg-teal-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                      <User className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {owner.firstName} {owner.lastName}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1 flex-shrink-0">
                    <button
                      onClick={() => handleEditOwner(owner)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Edit owner"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteOwner(owner.id)}
                      disabled={deletingId === owner.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                      title="Delete owner"
                    >
                      {deletingId === owner.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{owner.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="break-all sm:break-normal">{owner.phone}</span>
                  </div>
                  
                  <div className="flex items-start space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="break-words">{owner.address}</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Registered {new Date(owner.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No owners found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new pet owner.'}
          </p>
        </div>
      )}

      {/* Owner Form Modal */}
      {showForm && (
        <OwnerForm
          onClose={() => {
            setShowForm(false);
            setEditingOwner(null);
          }}
          onOwnerAdded={handleOwnerAdded}
          onOwnerUpdated={handleOwnerUpdated}
          editingOwner={editingOwner}
        />
      )}

      {/* Owner Pets Modal */}
      {selectedOwner && (
        <OwnerPetsModal
          owner={selectedOwner}
          onClose={() => setSelectedOwner(null)}
        />
      )}
    </div>
  );
};

export default OwnerList;