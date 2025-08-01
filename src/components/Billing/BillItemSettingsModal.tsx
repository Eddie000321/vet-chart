import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Save, Settings, DollarSign } from 'lucide-react';

export interface ConfigurableBillItem {
  id: string;
  name: string;
  price: number;
  category?: string;
}

interface BillItemSettingsModalProps {
  onClose: () => void;
  onSave: (items: ConfigurableBillItem[]) => void;
  currentItems: ConfigurableBillItem[];
}

const BillItemSettingsModal: React.FC<BillItemSettingsModalProps> = ({ 
  onClose, 
  onSave, 
  currentItems 
}) => {
  const [items, setItems] = useState<ConfigurableBillItem[]>(currentItems);
  const [editingItem, setEditingItem] = useState<ConfigurableBillItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: ''
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    'Examination',
    'Vaccination',
    'Surgery',
    'Dental',
    'Laboratory',
    'Medication',
    'Emergency',
    'Grooming',
    'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    const newItem: ConfigurableBillItem = {
      id: editingItem?.id || Date.now().toString(),
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      category: formData.category || 'Other'
    };

    if (editingItem) {
      setItems(prev => prev.map(item => 
        item.id === editingItem.id ? newItem : item
      ));
    } else {
      setItems(prev => [...prev, newItem]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', category: '' });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const handleEdit = (item: ConfigurableBillItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('configurableBillItems', JSON.stringify(items));
      onSave(items);
      onClose();
    } catch (error) {
      console.error('Failed to save bill items:', error);
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPresets = () => {
    const presetItems: ConfigurableBillItem[] = [
      { id: 'preset-1', name: 'Annual Wellness Exam', price: 85.00, category: 'Examination' },
      { id: 'preset-2', name: 'Rabies Vaccination', price: 35.00, category: 'Vaccination' },
      { id: 'preset-3', name: 'DHPP Vaccination', price: 40.00, category: 'Vaccination' },
      { id: 'preset-4', name: 'Heartworm Test', price: 45.00, category: 'Laboratory' },
      { id: 'preset-5', name: 'Dental Cleaning', price: 180.00, category: 'Dental' },
      { id: 'preset-6', name: 'Dental X-rays', price: 25.00, category: 'Dental' },
      { id: 'preset-7', name: 'Spay/Neuter Surgery', price: 250.00, category: 'Surgery' },
      { id: 'preset-8', name: 'Microchip Implantation', price: 55.00, category: 'Other' },
      { id: 'preset-9', name: 'Emergency Visit Fee', price: 150.00, category: 'Emergency' },
      { id: 'preset-10', name: 'Blood Chemistry Panel', price: 85.00, category: 'Laboratory' }
    ];

    // Only add presets that don't already exist
    const existingNames = items.map(item => item.name.toLowerCase());
    const newPresets = presetItems.filter(preset => 
      !existingNames.includes(preset.name.toLowerCase())
    );

    if (newPresets.length > 0) {
      setItems(prev => [...prev, ...newPresets]);
    } else {
      alert('All preset items already exist');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Examination': 'bg-blue-100 text-blue-700',
      'Vaccination': 'bg-green-100 text-green-700',
      'Surgery': 'bg-red-100 text-red-700',
      'Dental': 'bg-yellow-100 text-yellow-700',
      'Laboratory': 'bg-purple-100 text-purple-700',
      'Medication': 'bg-pink-100 text-pink-700',
      'Emergency': 'bg-orange-100 text-orange-700',
      'Grooming': 'bg-cyan-100 text-cyan-700',
      'Other': 'bg-gray-100 text-gray-700'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ConfigurableBillItem[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Manage Billable Items</h2>
              <p className="text-sm text-gray-500">Configure services and products for quick billing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Items List */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Configured Items ({items.length})
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddPresets}
                  className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Add Presets
                </button>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>

            {Object.keys(groupedItems).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(groupedItems).map(([category, categoryItems]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs mr-2 ${getCategoryColor(category)}`}>
                        {category}
                      </span>
                      ({categoryItems.length} items)
                    </h4>
                    <div className="space-y-2">
                      {categoryItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{item.name}</h5>
                            <p className="text-sm text-green-600 font-medium">
                              {formatCurrency(item.price)}
                            </p>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit item"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No items configured</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add billable items to streamline your billing process
                </p>
              </div>
            )}
          </div>

          {/* Add/Edit Form */}
          <div className="w-80 p-6 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h3>

            {showAddForm || editingItem ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Annual Wellness Exam"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    {editingItem ? 'Update' : 'Add'} Item
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <Plus className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-4">
                  Click "Add Item" to create a new billable item
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {items.length} item{items.length !== 1 ? 's' : ''} configured
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillItemSettingsModal;