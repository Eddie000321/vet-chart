import React, { useState, useEffect } from 'react';
import { X, Search, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { Bill, BillItem, Owner, Patient } from '../../types';
import { billsAPI, ownersAPI, patientsAPI } from '../../services/api';

interface BillFormProps {
  onClose: () => void;
  onBillAdded: (bill: Bill) => void;
}

const BillForm: React.FC<BillFormProps> = ({ onClose, onBillAdded }) => {
  const [formData, setFormData] = useState({
    ownerId: '',
    patientId: '',
    billDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    notes: '',
    taxRate: 0.08 // Default 8% tax rate
  });
  
  const [items, setItems] = useState<BillItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
  ]);
  
  const [owners, setOwners] = useState<Owner[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  
  const [ownerSearchTerm, setOwnerSearchTerm] = useState('');
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedOwnerName, setSelectedOwnerName] = useState('');
  const [selectedPatientName, setSelectedPatientName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOwners();
    fetchPatients();
  }, []);

  useEffect(() => {
    const filtered = owners.filter(owner =>
      `${owner.firstName} ${owner.lastName}`.toLowerCase().includes(ownerSearchTerm.toLowerCase()) ||
      owner.email.toLowerCase().includes(ownerSearchTerm.toLowerCase())
    );
    setFilteredOwners(filtered);
  }, [owners, ownerSearchTerm]);

  useEffect(() => {
    const filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
      patient.species.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
      (patient.owner && `${patient.owner.firstName} ${patient.owner.lastName}`.toLowerCase().includes(patientSearchTerm.toLowerCase()))
    );
    setFilteredPatients(filtered);
  }, [patients, patientSearchTerm]);

  const fetchOwners = async () => {
    try {
      const data = await ownersAPI.getAll();
      setOwners(data);
      setFilteredOwners(data);
    } catch (error) {
      console.error('Failed to fetch owners:', error);
    }
  };

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
      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const tax = subtotal * 0.08; // 8% tax rate
      const totalAmount = subtotal + tax;

      const billData = {
        ...formData,
        medicalRecordIds: [], // Empty for now, will be linked later
        items,
        subtotal,
        tax: tax,
        totalAmount,
        status: 'draft' as const
      };

      const newBill = await billsAPI.create(billData);
      onBillAdded(newBill);
    } catch (err: any) {
      setError(err.message || 'Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOwnerSelect = (owner: Owner) => {
    setFormData(prev => ({ ...prev, ownerId: owner.id }));
    setSelectedOwnerName(`${owner.firstName} ${owner.lastName}`);
    setOwnerSearchTerm('');
    setShowOwnerDropdown(false);
    
    // Filter patients by selected owner
    const ownerPatients = patients.filter(patient => patient.ownerId === owner.id);
    setFilteredPatients(ownerPatients);
    
    // Reset patient selection if current patient doesn't belong to selected owner
    const currentPatient = patients.find(p => p.id === formData.patientId);
    if (currentPatient && currentPatient.ownerId !== owner.id) {
      setFormData(prev => ({ ...prev, patientId: '' }));
      setSelectedPatientName('');
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setFormData(prev => ({ ...prev, patientId: patient.id }));
    setSelectedPatientName(`${patient.name} (${patient.species})`);
    setPatientSearchTerm('');
    setShowPatientDropdown(false);
    
    // Auto-select owner if not already selected
    if (!formData.ownerId && patient.owner) {
      setFormData(prev => ({ ...prev, ownerId: patient.owner!.id }));
      setSelectedOwnerName(`${patient.owner.firstName} ${patient.owner.lastName}`);
    }
  };

  const handleOwnerSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOwnerSearchTerm(e.target.value);
    setShowOwnerDropdown(true);
    if (e.target.value === '') {
      setFormData(prev => ({ ...prev, ownerId: '' }));
      setSelectedOwnerName('');
      setFilteredPatients(patients); // Reset patient filter
    }
  };

  const handlePatientSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientSearchTerm(e.target.value);
    setShowPatientDropdown(true);
    if (e.target.value === '') {
      setFormData(prev => ({ ...prev, patientId: '' }));
      setSelectedPatientName('');
    }
  };

  const handleItemChange = (index: number, field: keyof BillItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate total price for this item
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    const newItem: BillItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * formData.taxRate;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Bill</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Owner and Patient Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Bill Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bill Date
              </label>
              <input
                type="date"
                name="billDate"
                value={formData.billDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Bill Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Bill Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Service or product description"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      min="1"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price
                    </label>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total
                    </label>
                    <input
                      type="text"
                      value={`$${item.totalPrice.toFixed(2)}`}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bill Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Bill Summary</h3>
            
            {/* Tax Rate Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate
              </label>
              <select
                value={formData.taxRate}
                onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value={0}>No Tax (0%)</option>
                <option value={0.05}>5%</option>
                <option value={0.06}>6%</option>
                <option value={0.07}>7%</option>
                <option value={0.08}>8%</option>
                <option value={0.09}>9%</option>
                <option value={0.10}>10%</option>
                <option value={0.125}>12.5%</option>
                <option value={0.15}>15%</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax ({(formData.taxRate * 100).toFixed(1)}%):</span>
                <span className="font-medium">${calculateTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                <span>Total:</span>
                <span className="text-green-600">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
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
              {loading ? 'Creating...' : 'Create Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillForm;