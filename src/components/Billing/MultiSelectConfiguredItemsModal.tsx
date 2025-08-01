import React, { useState } from 'react';
import { X, CheckSquare, Square, ShoppingCart, DollarSign } from 'lucide-react';
import { ConfigurableBillItem } from './BillItemSettingsModal';

interface MultiSelectConfiguredItemsModalProps {
  configurableItems: ConfigurableBillItem[];
  onClose: () => void;
  onAddItems: (selectedItems: ConfigurableBillItem[]) => void;
}

const MultiSelectConfiguredItemsModal: React.FC<MultiSelectConfiguredItemsModalProps> = ({
  configurableItems,
  onClose,
  onAddItems
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const handleToggleItem = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === configurableItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(configurableItems.map(item => item.id)));
    }
  };

  const handleSelectCategory = (category: string) => {
    const categoryItems = configurableItems.filter(item => (item.category || 'Other') === category);
    const categoryItemIds = categoryItems.map(item => item.id);
    const allCategorySelected = categoryItemIds.every(id => selectedItems.has(id));
    
    const newSelection = new Set(selectedItems);
    if (allCategorySelected) {
      // Deselect all items in this category
      categoryItemIds.forEach(id => newSelection.delete(id));
    } else {
      // Select all items in this category
      categoryItemIds.forEach(id => newSelection.add(id));
    }
    setSelectedItems(newSelection);
  };

  const handleAddSelected = () => {
    const itemsToAdd = configurableItems.filter(item => selectedItems.has(item.id));
    onAddItems(itemsToAdd);
  };

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Group items by category
  const groupedItems = configurableItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ConfigurableBillItem[]>);

  const getTotalSelectedValue = () => {
    return configurableItems
      .filter(item => selectedItems.has(item.id))
      .reduce((sum, item) => sum + item.price, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add Configured Items</h2>
              <p className="text-sm text-gray-500">
                Select multiple items to add to your bill
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Selection Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSelectAll}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
              >
                {selectedItems.size === configurableItems.length ? (
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span>
                  {selectedItems.size === configurableItems.length ? 'Deselect All' : 'Select All'}
                </span>
              </button>
              
              <div className="text-sm text-gray-500">
                {selectedItems.size} of {configurableItems.length} items selected
              </div>
            </div>
            
            {selectedItems.size > 0 && (
              <div className="flex items-center space-x-2 text-sm">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-600">
                  Total: {formatCurrency(getTotalSelectedValue())}
                </span>
              </div>
            )}
          </div>

          {/* Items by Category */}
          {Object.keys(groupedItems).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([category, categoryItems]) => {
                const categoryItemIds = categoryItems.map(item => item.id);
                const allCategorySelected = categoryItemIds.every(id => selectedItems.has(id));
                const someCategorySelected = categoryItemIds.some(id => selectedItems.has(id));
                
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => handleSelectCategory(category)}
                        className="flex items-center space-x-2 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors"
                      >
                        {allCategorySelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : someCategorySelected ? (
                          <div className="w-4 h-4 bg-blue-600 rounded border-2 border-blue-600 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-sm"></div>
                          </div>
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(category)}`}>
                          {category}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({categoryItems.length} items)
                        </span>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-6">
                      {categoryItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleToggleItem(item.id)}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            selectedItems.has(item.id)
                              ? 'border-blue-300 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {selectedItems.has(item.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 truncate">
                              {item.name}
                            </h5>
                            <p className="text-sm font-medium text-green-600">
                              {formatCurrency(item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No configured items</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure billable items in the settings to use this feature
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
            {selectedItems.size > 0 && (
              <span className="ml-2 font-medium text-green-600">
                • Total: {formatCurrency(getTotalSelectedValue())}
              </span>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSelected}
              disabled={selectedItems.size === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add Selected Items ({selectedItems.size})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiSelectConfiguredItemsModal;