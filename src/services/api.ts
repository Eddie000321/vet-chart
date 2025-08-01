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
    const response = await fetch(`${API_BASE_URL}/bills`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (billData: any) => {
    const response = await fetch(`${API_BASE_URL}/bills`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(billData)
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/bills/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  update: async (id: string, billData: any) => {
    const response = await fetch(`${API_BASE_URL}/bills/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(billData)
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/bills/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
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