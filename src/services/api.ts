const API_BASE_URL = '/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return handleResponse(response);
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Owners API
export const ownersAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/owners`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (ownerData: any) => {
    const response = await fetch(`${API_BASE_URL}/owners`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(ownerData)
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/owners/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  update: async (id: string, ownerData: any) => {
    const response = await fetch(`${API_BASE_URL}/owners/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(ownerData)
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/owners/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Patients API
export const patientsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (patientData: any) => {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(patientData)
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  update: async (id: string, patientData: any) => {
    const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(patientData)
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Medical Records API
export const recordsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/records`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (recordData: any) => {
    const response = await fetch(`${API_BASE_URL}/records`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(recordData)
    });
    return handleResponse(response);
  },

  getByPatientId: async (patientId: string) => {
    const response = await fetch(`${API_BASE_URL}/records/patient/${patientId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  update: async (id: string, recordData: any) => {
    const response = await fetch(`${API_BASE_URL}/records/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(recordData)
    });
    return handleResponse(response);
  }
};

// Appointments API
export const appointmentsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (appointmentData: any) => {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(appointmentData)
    });
    return handleResponse(response);
  },

  update: async (id: string, appointmentData: any) => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(appointmentData)
    });
    return handleResponse(response);
  },

  updateStatus: async (id: string, status: string) => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Bills API
export const billsAPI = {
  getAll: async () => {
    // Temporary mock data for demonstration
    return Promise.resolve([
      {
        id: '1',
        billNumber: 'BILL-2024-001',
        ownerId: '1',
        owner: {
          id: '1',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@email.com',
          phone: '(555) 123-4567',
          address: '123 Oak Street, Springfield, IL 62701',
          notes: 'Prefers morning appointments',
          createdAt: '2024-01-15T08:00:00Z'
        },
        patientId: '1',
        patient: {
          id: '1',
          name: 'Buddy',
          species: 'Dog',
          breed: 'Golden Retriever',
          age: 5,
          gender: 'Male',
          weight: 68.5,
          weightUnit: 'lbs',
          ownerId: '1',
          status: 'active',
          assignedDoctor: 'J Han',
          handlingDifficulty: 'easy',
          createdAt: '2024-01-15T08:00:00Z'
        },
        appointmentId: '1',
        medicalRecordIds: ['1', '2'],
        items: [
          {
            id: '1',
            description: 'Annual Wellness Exam',
            quantity: 1,
            unitPrice: 85.00,
            totalPrice: 85.00
          },
          {
            id: '2',
            description: 'Rabies Vaccination',
            quantity: 1,
            unitPrice: 35.00,
            totalPrice: 35.00
          },
          {
            id: '3',
            description: 'Heartworm Test',
            quantity: 1,
            unitPrice: 45.00,
            totalPrice: 45.00
          }
        ],
        subtotal: 165.00,
        tax: 13.20,
        totalAmount: 178.20,
        status: 'sent',
        billDate: '2024-01-20T00:00:00Z',
        dueDate: '2024-02-19T00:00:00Z',
        notes: 'Annual checkup completed. All vaccinations up to date.',
        createdAt: '2024-01-20T10:30:00Z',
        updatedAt: '2024-01-20T10:30:00Z'
      },
      {
        id: '2',
        billNumber: 'BILL-2024-002',
        ownerId: '2',
        owner: {
          id: '2',
          firstName: 'Michael',
          lastName: 'Chen',
          email: 'michael.chen@email.com',
          phone: '(555) 987-6543',
          address: '456 Pine Avenue, Springfield, IL 62702',
          notes: 'Cat is very shy, handle with care',
          createdAt: '2024-01-10T09:00:00Z'
        },
        patientId: '2',
        patient: {
          id: '2',
          name: 'Whiskers',
          species: 'Cat',
          breed: 'Persian',
          age: 3,
          gender: 'Female',
          weight: 8.2,
          weightUnit: 'lbs',
          ownerId: '2',
          status: 'active',
          assignedDoctor: 'J Lee',
          handlingDifficulty: 'medium',
          createdAt: '2024-01-10T09:00:00Z'
        },
        appointmentId: '2',
        medicalRecordIds: ['3'],
        items: [
          {
            id: '4',
            description: 'Dental Cleaning',
            quantity: 1,
            unitPrice: 180.00,
            totalPrice: 180.00
          },
          {
            id: '5',
            description: 'Dental X-rays',
            quantity: 3,
            unitPrice: 25.00,
            totalPrice: 75.00
          },
          {
            id: '6',
            description: 'Anesthesia',
            quantity: 1,
            unitPrice: 65.00,
            totalPrice: 65.00
          }
        ],
        subtotal: 320.00,
        tax: 25.60,
        totalAmount: 345.60,
        status: 'paid',
        billDate: '2024-01-18T00:00:00Z',
        dueDate: '2024-02-17T00:00:00Z',
        notes: 'Dental procedure completed successfully. Follow-up in 6 months.',
        createdAt: '2024-01-18T14:15:00Z',
        updatedAt: '2024-01-22T09:00:00Z'
      },
      {
        id: '3',
        billNumber: 'BILL-2024-003',
        ownerId: '3',
        owner: {
          id: '3',
          firstName: 'Emily',
          lastName: 'Rodriguez',
          email: 'emily.rodriguez@email.com',
          phone: '(555) 456-7890',
          address: '789 Maple Drive, Springfield, IL 62703',
          notes: 'First-time pet owner, needs guidance',
          createdAt: '2024-01-05T11:00:00Z'
        },
        patientId: '3',
        patient: {
          id: '3',
          name: 'Charlie',
          species: 'Dog',
          breed: 'Labrador Mix',
          age: 1,
          gender: 'Male',
          weight: 45.0,
          weightUnit: 'lbs',
          ownerId: '3',
          status: 'active',
          assignedDoctor: 'Sarah Wilson',
          handlingDifficulty: 'easy',
          createdAt: '2024-01-05T11:00:00Z'
        },
        appointmentId: '3',
        medicalRecordIds: ['4', '5'],
        items: [
          {
            id: '7',
            description: 'Puppy Wellness Package',
            quantity: 1,
            unitPrice: 120.00,
            totalPrice: 120.00
          },
          {
            id: '8',
            description: 'DHPP Vaccination',
            quantity: 1,
            unitPrice: 40.00,
            totalPrice: 40.00
          },
          {
            id: '9',
            description: 'Deworming Treatment',
            quantity: 1,
            unitPrice: 25.00,
            totalPrice: 25.00
          },
          {
            id: '10',
            description: 'Microchip Implantation',
            quantity: 1,
            unitPrice: 55.00,
            totalPrice: 55.00
          }
        ],
        subtotal: 240.00,
        tax: 19.20,
        totalAmount: 259.20,
        status: 'overdue',
        billDate: '2024-01-12T00:00:00Z',
        dueDate: '2024-02-11T00:00:00Z',
        notes: 'Puppy package includes first year wellness plan. Next appointment in 4 weeks.',
        createdAt: '2024-01-12T16:45:00Z',
        updatedAt: '2024-01-12T16:45:00Z'
      },
      {
        id: '4',
        billNumber: 'BILL-2024-004',
        ownerId: '4',
        owner: {
          id: '4',
          firstName: 'David',
          lastName: 'Thompson',
          email: 'david.thompson@email.com',
          phone: '(555) 321-0987',
          address: '321 Elm Street, Springfield, IL 62704',
          notes: 'Senior pet, requires gentle handling',
          createdAt: '2023-12-20T10:00:00Z'
        },
        patientId: '4',
        patient: {
          id: '4',
          name: 'Luna',
          species: 'Cat',
          breed: 'Siamese',
          age: 12,
          gender: 'Female',
          weight: 7.8,
          weightUnit: 'lbs',
          ownerId: '4',
          status: 'active',
          assignedDoctor: 'Michael Brown',
          handlingDifficulty: 'medium',
          createdAt: '2023-12-20T10:00:00Z'
        },
        appointmentId: '4',
        medicalRecordIds: ['6'],
        items: [
          {
            id: '11',
            description: 'Senior Pet Comprehensive Exam',
            quantity: 1,
            unitPrice: 95.00,
            totalPrice: 95.00
          },
          {
            id: '12',
            description: 'Blood Chemistry Panel',
            quantity: 1,
            unitPrice: 85.00,
            totalPrice: 85.00
          },
          {
            id: '13',
            description: 'Thyroid Function Test',
            quantity: 1,
            unitPrice: 65.00,
            totalPrice: 65.00
          },
          {
            id: '14',
            description: 'Joint Supplement (30-day supply)',
            quantity: 1,
            unitPrice: 35.00,
            totalPrice: 35.00
          }
        ],
        subtotal: 280.00,
        tax: 22.40,
        totalAmount: 302.40,
        status: 'draft',
        billDate: '2024-01-25T00:00:00Z',
        dueDate: '2024-02-24T00:00:00Z',
        notes: 'Senior wellness exam shows good overall health. Continue current medications.',
        createdAt: '2024-01-25T11:20:00Z',
        updatedAt: '2024-01-25T11:20:00Z'
      },
      {
        id: '5',
        billNumber: 'BILL-2024-005',
        ownerId: '5',
        owner: {
          id: '5',
          firstName: 'Lisa',
          lastName: 'Martinez',
          email: 'lisa.martinez@email.com',
          phone: '(555) 654-3210',
          address: '654 Cedar Lane, Springfield, IL 62705',
          notes: 'Multiple pets, bulk appointment scheduling preferred',
          createdAt: '2023-11-15T14:00:00Z'
        },
        patientId: '5',
        patient: {
          id: '5',
          name: 'Max',
          species: 'Dog',
          breed: 'German Shepherd',
          age: 7,
          gender: 'Male',
          weight: 85.0,
          weightUnit: 'lbs',
          ownerId: '5',
          status: 'active',
          assignedDoctor: 'J Han',
          handlingDifficulty: 'hard',
          createdAt: '2023-11-15T14:00:00Z'
        },
        appointmentId: '5',
        medicalRecordIds: ['7'],
        items: [
          {
            id: '15',
            description: 'Emergency Visit - Laceration Repair',
            quantity: 1,
            unitPrice: 150.00,
            totalPrice: 150.00
          },
          {
            id: '16',
            description: 'Surgical Sutures',
            quantity: 8,
            unitPrice: 12.00,
            totalPrice: 96.00
          },
          {
            id: '17',
            description: 'Pain Medication (5-day supply)',
            quantity: 1,
            unitPrice: 28.00,
            totalPrice: 28.00
          },
          {
            id: '18',
            description: 'Antibiotic Injection',
            quantity: 1,
            unitPrice: 22.00,
            totalPrice: 22.00
          },
          {
            id: '19',
            description: 'Elizabethan Collar',
            quantity: 1,
            unitPrice: 15.00,
            totalPrice: 15.00
          }
        ],
        subtotal: 311.00,
        tax: 24.88,
        totalAmount: 335.88,
        status: 'cancelled',
        billDate: '2024-01-22T00:00:00Z',
        dueDate: '2024-02-21T00:00:00Z',
        notes: 'Emergency treatment for laceration. Follow-up in 10 days for suture removal.',
        createdAt: '2024-01-22T18:30:00Z',
        updatedAt: '2024-01-23T09:15:00Z'
      }
    ]);
  },

  create: async (billData: any) => {
    // Simulate API call for creating bill
    const newBill = {
      id: Date.now().toString(),
      billNumber: `BILL-2024-${String(Date.now()).slice(-3).padStart(3, '0')}`,
      ...billData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // In a real implementation, this would save to database
    return Promise.resolve(newBill);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/bills/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  update: async (id: string, billData: any) => {
    // Simulate API call for updating bill
    const updatedBill = {
      id,
      billNumber: billData.billNumber || `BILL-2024-${String(Date.now()).slice(-3).padStart(3, '0')}`,
      ...billData,
      updatedAt: new Date().toISOString()
    };
    
    // In a real implementation, this would update in database
    return Promise.resolve(updatedBill);
  },

  delete: async (id: string) => {
    // Simulate API call for deleting bill
    return Promise.resolve({ success: true });
  },

  getByOwnerId: async (ownerId: string) => {
    const response = await fetch(`${API_BASE_URL}/bills/owner/${ownerId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getByPatientId: async (patientId: string) => {
    const response = await fetch(`${API_BASE_URL}/bills/patient/${patientId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};