import React, { useState, useEffect } from 'react';
import { Search, Plus, UserCheck, Mail, Phone, Calendar, Edit, User } from 'lucide-react';
import { format } from 'date-fns';
import MemberEditForm from './MemberEditForm';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'veterinarian' | 'staff' | 'admin';
  specialization?: string;
  licenseNumber?: string;
  hireDate: string;
  status: 'active' | 'inactive';
  employmentType: 'full-time' | 'part-time';
  isPermanent: boolean;
  createdAt: string;
}

const MemberList: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [inactiveMembers, setInactiveMembers] = useState<Member[]>([]);
  const [formerMembers, setFormerMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    // Initialize with sample data
    const sampleMembers: Member[] = [
      {
        id: '1',
        firstName: 'J',
        lastName: 'Han',
        email: 'j.han@vetchart.com',
        phone: '(555) 123-4567',
        role: 'veterinarian-admin',
        specialization: 'Small Animal Medicine',
        licenseNumber: 'VET-2019-001',
        hireDate: '2019-03-15',
        status: 'active',
        employmentType: 'full-time',
        isPermanent: true,
        createdAt: '2019-03-15T00:00:00Z'
      },
      {
        id: '2',
        firstName: 'J',
        lastName: 'Lee',
        email: 'j.lee@vetchart.com',
        phone: '(555) 234-5678',
        role: 'veterinarian',
        specialization: 'Surgery & Emergency Care',
        licenseNumber: 'VET-2020-002',
        hireDate: '2020-06-01',
        status: 'active',
        employmentType: 'full-time',
        isPermanent: true,
        createdAt: '2020-06-01T00:00:00Z'
      },
      {
        id: '3',
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@vetchart.com',
        phone: '(555) 345-6789',
        role: 'veterinarian',
        specialization: 'Exotic Animals',
        licenseNumber: 'VET-2021-003',
        hireDate: '2021-01-10',
        status: 'active',
        employmentType: 'part-time',
        isPermanent: false,
        createdAt: '2021-01-10T00:00:00Z'
      },
      {
        id: '4',
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@vetchart.com',
        phone: '(555) 456-7890',
        role: 'veterinarian',
        specialization: 'Dental Care',
        licenseNumber: 'VET-2022-004',
        hireDate: '2022-04-20',
        status: 'active',
        employmentType: 'full-time',
        isPermanent: true,
        createdAt: '2022-04-20T00:00:00Z'
      },
      {
        id: '5',
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@vetchart.com',
        phone: '(555) 567-8901',
        role: 'staff',
        specialization: 'Veterinary Technician',
        hireDate: '2021-08-15',
        status: 'active',
        employmentType: 'full-time',
        isPermanent: true,
        createdAt: '2021-08-15T00:00:00Z'
      },
      {
        id: '6',
        firstName: 'Robert',
        lastName: 'Johnson',
        email: 'robert.johnson@vetchart.com',
        phone: '(555) 678-9012',
        role: 'staff',
        specialization: 'Reception & Administration',
        hireDate: '2020-11-30',
        status: 'active',
        employmentType: 'part-time',
        isPermanent: false,
        createdAt: '2020-11-30T00:00:00Z'
      },
      {
        id: '7',
        firstName: 'Lisa',
        lastName: 'Martinez',
        email: 'lisa.martinez@vetchart.com',
        phone: '(555) 789-0123',
        role: 'staff',
        specialization: 'Veterinary Assistant',
        hireDate: '2022-02-14',
        status: 'active',
        employmentType: 'full-time',
        isPermanent: true,
        createdAt: '2022-02-14T00:00:00Z'
      },
      {
        id: '8',
        firstName: 'David',
        lastName: 'Garcia',
        email: 'david.garcia@vetchart.com',
        phone: '(555) 890-1234',
        role: 'staff',
        specialization: 'Hospital Administrator',
        hireDate: '2018-09-01',
        status: 'active',
        employmentType: 'full-time',
        isPermanent: true,
        createdAt: '2018-09-01T00:00:00Z'
      },
      {
        id: '9',
        firstName: 'Rachel',
        lastName: 'Thompson',
        email: 'rachel.thompson@vetchart.com',
        phone: '(555) 999-0000',
        role: 'veterinarian-admin',
        specialization: 'Chief Veterinarian',
        licenseNumber: 'VET-2017-007',
        hireDate: '2017-01-15',
        status: 'active',
        employmentType: 'full-time',
        isPermanent: true,
        createdAt: '2017-01-15T00:00:00Z'
      },
      {
        id: '10',
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james.wilson@vetchart.com',
        phone: '(555) 888-7777',
        role: 'staff',
        specialization: 'Practice Manager',
        hireDate: '2019-08-20',
        status: 'active',
        employmentType: 'full-time',
        isPermanent: true,
        createdAt: '2019-08-20T00:00:00Z'
      }
    ];
    
    // Sample inactive members (still employed but not currently working)
    const sampleInactiveMembers: Member[] = [
      {
        id: '11',
        firstName: 'Amanda',
        lastName: 'Taylor',
        email: 'amanda.taylor@vetchart.com',
        phone: '(555) 222-3333',
        role: 'staff',
        specialization: 'Veterinary Technician',
        hireDate: '2021-03-10',
        status: 'inactive',
        employmentType: 'part-time',
        isPermanent: true,
        createdAt: '2021-03-10T00:00:00Z'
      },
      {
        id: '12',
        firstName: 'Kevin',
        lastName: 'Anderson',
        email: 'kevin.anderson@vetchart.com',
        phone: '(555) 444-5555',
        role: 'veterinarian',
        specialization: 'Emergency Medicine',
        licenseNumber: 'VET-2020-006',
        hireDate: '2020-01-15',
        status: 'inactive',
        employmentType: 'full-time',
        isPermanent: true,
        createdAt: '2020-01-15T00:00:00Z'
      }
    ];
    
    // Sample former members
    const sampleFormerMembers: Member[] = [
      {
        id: '9',
        firstName: 'Jennifer',
        lastName: 'Smith',
        email: 'jennifer.smith@former.com',
        phone: '(555) 111-2222',
        role: 'veterinarian',
        specialization: 'Internal Medicine',
        licenseNumber: 'VET-2018-005',
        hireDate: '2018-05-01',
        status: 'inactive',
        employmentType: 'full-time',
        isPermanent: true,
        createdAt: '2018-05-01T00:00:00Z'
      },
      {
        id: '10',
        firstName: 'Mark',
        lastName: 'Williams',
        email: 'mark.williams@former.com',
        phone: '(555) 333-4444',
        role: 'staff',
        specialization: 'Veterinary Technician',
        hireDate: '2019-08-15',
        status: 'inactive',
        employmentType: 'part-time',
        isPermanent: false,
        createdAt: '2019-08-15T00:00:00Z'
      }
    ];
    
    // Filter active members only for main display
    const activeMembers = sampleMembers.filter(member => member.status === 'active');
    setMembers(activeMembers);
    setFilteredMembers(activeMembers);
    setInactiveMembers(sampleInactiveMembers);
    setFormerMembers(sampleFormerMembers);
  }, []);

  useEffect(() => {
    let filtered = members.filter(member =>
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role === roleFilter);
    }

    setFilteredMembers(filtered);
  }, [members, searchTerm, roleFilter]);

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setShowEditForm(true);
  };

  const handleMemberUpdated = (updatedMember: Member) => {
    // Remove member from current arrays
    setMembers(prev => prev.filter(member => member.id !== updatedMember.id));
    setInactiveMembers(prev => prev.filter(member => member.id !== updatedMember.id));
    setFormerMembers(prev => prev.filter(member => member.id !== updatedMember.id));
    
    // Add member to appropriate array based on status
    if (updatedMember.status === 'active') {
      setMembers(prev => [...prev, updatedMember]);
    } else if (updatedMember.status === 'inactive') {
      setInactiveMembers(prev => [...prev, updatedMember]);
    } else if (updatedMember.status === 'former') {
      setFormerMembers(prev => [...prev, updatedMember]);
    }
    
    setEditingMember(null);
    setShowEditForm(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'veterinarian':
        return 'bg-blue-100 text-blue-700';
      case 'veterinarian-admin':
        return 'bg-purple-100 text-purple-700';
      case 'staff':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'veterinarian':
        return '🩺';
      case 'veterinarian-admin':
        return '👨‍⚕️';
      case 'staff':
        return '👩‍⚕️';
      default:
        return '👤';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-700 border-green-200' 
      : 'bg-red-100 text-red-700 border-red-200';
  };

  const getEmploymentTypeColor = (type: string) => {
    return type === 'full-time'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-orange-100 text-orange-700';
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
        <h1 className="text-2xl font-bold text-gray-900">Active Members</h1>
        <button className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search members by name, email, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="all">All Roles</option>
          <option value="veterinarian">Veterinarians</option>
          <option value="veterinarian-admin">Veterinarian Admins</option>
          <option value="staff">Staff</option>
        </select>
      </div>

      {/* Members Grid */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="bg-teal-100 p-3 rounded-full flex-shrink-0">
                    <span className="text-2xl">{getRoleIcon(member.role)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      Dr. {member.firstName} {member.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {member.specialization}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(member.status)}`}>
                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{member.phone}</span>
                </div>
                
                {member.licenseNumber && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <UserCheck className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">License: {member.licenseNumber}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>Hired: {format(new Date(member.hireDate), 'MMM dd, yyyy')}</span>
                </div>
                
                {/* Employment Details */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEmploymentTypeColor(member.employmentType)}`}>
                    {member.employmentType.charAt(0).toUpperCase() + member.employmentType.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    member.isPermanent ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {member.isPermanent ? 'Permanent' : 'Contract'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Member since {format(new Date(member.createdAt), 'MMM yyyy')}
                </span>
                
                <div>
                  <button 
                    onClick={() => handleEditMember(member)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No members found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || roleFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Get started by adding a hospital member.'}
          </p>
        </div>
      )}

      {/* Inactive Members Section */}
      {inactiveMembers.length > 0 && (
        <div className="mt-12">
          <div className="border-t border-gray-300 pt-8">
            <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Inactive Members
              <span className="ml-2 text-sm font-normal text-gray-500">(On leave or temporarily unavailable)</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactiveMembers.map((member) => (
                <div key={member.id} className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-200 p-6 opacity-80">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="bg-yellow-200 p-3 rounded-full flex-shrink-0">
                        <span className="text-2xl">{getRoleIcon(member.role)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">
                          Dr. {member.firstName} {member.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {member.specialization}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800">
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-700 border-yellow-300">
                        Inactive
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>Hired: {format(new Date(member.hireDate), 'MMM dd, yyyy')}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-yellow-200">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800">
                        {member.employmentType.charAt(0).toUpperCase() + member.employmentType.slice(1)}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800">
                        {member.isPermanent ? 'Permanent' : 'Contract'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-yellow-200">
                    <span className="text-xs text-gray-500">
                      Member since {format(new Date(member.createdAt), 'MMM yyyy')}
                    </span>
                    
                    <div>
                      <button 
                        onClick={() => handleEditMember(member)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Change member status"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Former Members Section */}
      {formerMembers.length > 0 && (
        <div className="mt-12">
          <div className="border-t border-gray-300 pt-8">
            <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Former Members
              <span className="ml-2 text-sm font-normal text-gray-500">(No longer with the hospital)</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formerMembers.map((member) => (
                <div key={member.id} className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-6 opacity-75">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="bg-gray-200 p-3 rounded-full flex-shrink-0">
                        <span className="text-2xl grayscale">{getRoleIcon(member.role)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-700 truncate">
                          Dr. {member.firstName} {member.lastName}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {member.specialization}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium border bg-red-100 text-red-700 border-red-200">
                        Former
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>Worked: {format(new Date(member.hireDate), 'MMM yyyy')} - {format(new Date(), 'MMM yyyy')}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                        {member.employmentType.charAt(0).toUpperCase() + member.employmentType.slice(1)}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                        {member.isPermanent ? 'Permanent' : 'Contract'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      Former member
                    </span>
                    
                    <div>
                      <button 
                        onClick={() => handleEditMember(member)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Edit member"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Member Edit Form Modal */}
      {showEditForm && editingMember && (
        <MemberEditForm
          member={editingMember}
          onClose={() => {
            setShowEditForm(false);
            setEditingMember(null);
          }}
          onMemberUpdated={handleMemberUpdated}
        />
      )}
    </div>
  );
};

export default MemberList;