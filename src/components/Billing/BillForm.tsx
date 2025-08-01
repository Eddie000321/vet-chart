import React, { useState, useEffect } from 'react';
import { X, Search, ChevronDown, Plus, Trash2, Zap } from 'lucide-react';
import { Bill, BillItem, Owner, Patient, MedicalRecord } from '../../types';
import { billsAPI, ownersAPI, patientsAPI, recordsAPI } from '../../services/api';
import { ConfigurableBillItem } from './BillItemSettingsModal';

interface BillFormProps {
  onClose: () => void;
  onBillAdded: (bill: Bill) => void;
  editingBill?: Bill | null;
  configurableItems?: ConfigurableBillItem[];
}

const BillForm: React.FC<BillFormProps> = ({ onClose, onBillAdded, editingBill, configurableItems = [] }) => {
  const [formData, setFormData] = useState({
    ownerId: editingBill?.ownerId || '',
    patientId: editingBill?.patientId || '',
    billDate: editingBill?.billDate.split('T')[0] || new Date().toISOString().split('T')[0],
    dueDate: editingBill?.dueDate.split('T')[0] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: editingBill?.notes || '',
    taxRate: editingBill ? (editingBill.tax / editingBill.subtotal) : 0.08
  });
  
  const [items, setItems] = useState<BillItem[]>([
    ...(editingBill?.items || [{ id: '1', description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }])
  ]);
  
  const [owners, setOwners] = useState<Owner[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>(editingBill?.medicalRecordIds || []);
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
  const [showQuickAdd, setShowQuickAdd] = useState<number | null>(null);

  useEffect(() => {
    fetchOwners();
    fetchPatients();
    
    // Set initial owner and patient names if editing
    if (editingBill) {
      if (editingBill.owner) {
        setSelectedOwnerName(`${editingBill.owner.firstName} ${editingBill.owner.lastName}`);
      }
      if (editingBill.patient) {
        setSelectedPatientName(`${editingBill.patient.name} (${editingBill.patient.species})`);
      }
    }
  }, []);

  useEffect(() => {
    if (formData.patientId) {
      fetchPatientMedicalRecords(formData.patientId);
    }
  }, [formData.patientId]);
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

  const fetchPatientMedicalRecords = async (patientId: string) => {
    try {
      const data = await recordsAPI.getByPatientId(patientId);
      setMedicalRecords(data);
    } catch (error) {
      console.error('Failed to fetch medical records:', error);
      setMedicalRecords([]);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const tax = subtotal * formData.taxRate;
      const totalAmount = subtotal + tax;

      const billData = {
        ...formData,
        medicalRecordIds: selectedRecordIds,
        items,
        subtotal,
        tax: tax,
        totalAmount,
        status: editingBill?.status || 'draft' as const
      };

      if (editingBill) {
        const updatedBill = await billsAPI.update(editingBill.id, billData);
        onBillAdded(updatedBill);
      } else {
        const newBill = await billsAPI.create(billData);
        onBillAdded(newBill);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${editingBill ? 'update' : 'create'} bill`);
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
    
    // Clear selected medical records when patient changes
    setSelectedRecordIds([]);
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

  const handleQuickAddItem = (configurableItem: ConfigurableBillItem, index: number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      description: configurableItem.name,
      unitPrice: configurableItem.price,
      totalPrice: newItems[index].quantity * configurableItem.price
    };
    setItems(newItems);
    setShowQuickAdd(null);
  };

  const handleRecordToggle = (recordId: string) => {
    setSelectedRecordIds(prev => 
      prev.includes(recordId)
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
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
          <h2 className="text-xl font-semibold text-gray-900">
            {editingBill ? 'Edit Bill' : 'Create New Bill'}
          </h2>
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
                  <div className="col-span-5 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Service or product description"
                        required
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      {configurableItems.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowQuickAdd(showQuickAdd === index ? null : index)}
                          className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                          title="Quick add from configured items"
                        >
                          <Zap className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {/* Quick Add Dropdown */}
                    {showQuickAdd === index && configurableItems.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                        {(() => {
                          // Group items by category
                          const groupedItems = configurableItems.reduce((acc, item) => {
                            const category = item.category || 'Other';
                            if (!acc[category]) {
                              acc[category] = [];
                            }
                            acc[category].push(item);
                            return acc;
                          }, {} as Record<string, ConfigurableBillItem[]>);

                          const getCategoryColor = (category: string) => {
                            const colors = {
                              'Examination': 'bg-blue-100 text-blue-700 border-blue-200',
                              'Vaccination': 'bg-green-100 text-green-700 border-green-200',
                              'Surgery': 'bg-red-100 text-red-700 border-red-200',
                              'Dental': 'bg-yellow-100 text-yellow-700 border-yellow-200',
                              'Laboratory': 'bg-purple-100 text-purple-700 border-purple-200',
                              'Medication': 'bg-pink-100 text-pink-700 border-pink-200',
                              'Emergency': 'bg-orange-100 text-orange-700 border-orange-200',
                              'Grooming': 'bg-cyan-100 text-cyan-700 border-cyan-200',
                              'Other': 'bg-gray-100 text-gray-700 border-gray-200'
                            };
                            return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
                          };

                          return Object.entries(groupedItems).map(([category, categoryItems]) => (
                            <div key={category}>
                              {/* Category Header */}
                              <div className={`px-4 py-2 text-xs font-medium border-b border-gray-200 sticky top-0 z-10 ${getCategoryColor(category)}`}>
                                {category} ({categoryItems.length} item{categoryItems.length !== 1 ? 's' : ''})
                              </div>
                              
                              {/* Category Items */}
                              {categoryItems.map((configItem) => (
                                <div
                                  key={configItem.id}
                                  onClick={() => handleQuickAddItem(configItem, index)}
                                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900 text-sm">
                                        {configItem.name}
                                      </div>
                                    </div>
                                    <div className="text-sm font-medium text-green-600 ml-2">
                                      ${configItem.price.toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ));
                        })()}
                      </div>
                    )}
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

          {/* Medical Records Selection */}
          {formData.patientId && medicalRecords.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Link Medical Records ({selectedRecordIds.length} selected)
              </h3>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                {medicalRecords.map((record) => (
                  <div
                    key={record.id}
                    className={`flex items-center space-x-3 p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                      selectedRecordIds.includes(record.id) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleRecordToggle(record.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRecordIds.includes(record.id)}
                      onChange={() => handleRecordToggle(record.id)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(record.visitDate).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          Dr. {record.veterinarian}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {record.diagnosis}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              {loading ? (editingBill ? 'Updating...' : 'Creating...') : (editingBill ? 'Update Bill' : 'Create Bill')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillForm;