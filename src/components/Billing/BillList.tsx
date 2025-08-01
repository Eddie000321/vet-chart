import React, { useState, useEffect } from 'react';
import { Search, Plus, Receipt, Calendar, User, PawPrint, Edit, Trash2, Eye, DollarSign, Settings } from 'lucide-react';
import { Bill } from '../../types';
import { billsAPI } from '../../services/api';
import { format } from 'date-fns';
import BillForm from './BillForm';
import BillItemSettingsModal, { ConfigurableBillItem } from './BillItemSettingsModal';

const BillList: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [viewingBill, setViewingBill] = useState<Bill | null>(null);
  const [showItemSettings, setShowItemSettings] = useState(false);
  const [configurableItems, setConfigurableItems] = useState<ConfigurableBillItem[]>([]);

  useEffect(() => {
    fetchBills();
    loadConfigurableItems();
  }, []);

  useEffect(() => {
    let filtered = bills.filter(bill =>
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bill.owner && `${bill.owner.firstName} ${bill.owner.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bill.patient && bill.patient.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(bill => bill.status === statusFilter);
    }

    setFilteredBills(filtered);
  }, [bills, searchTerm, statusFilter]);

  const fetchBills = async () => {
    try {
      const data = await billsAPI.getAll();
      setBills(data);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBill = async (billId: string) => {
    if (!confirm('Are you sure you want to delete this bill? This action cannot be undone.')) {
      return;
    }

    setDeletingId(billId);
    try {
      await billsAPI.delete(billId);
      setBills(prev => prev.filter(bill => bill.id !== billId));
    } catch (error: any) {
      alert(error.message || 'Failed to delete bill');
    } finally {
      setDeletingId(null);
    }
  };

  const handleBillAdded = (newBill: Bill) => {
    setBills(prev => [newBill, ...prev]);
    setShowForm(false);
  };

  const handleBillUpdated = (updatedBill: Bill) => {
    setBills(prev => prev.map(bill => 
      bill.id === updatedBill.id ? updatedBill : bill
    ));
    setEditingBill(null);
  };

  const handleEditBill = (bill: Bill) => {
    setEditingBill(bill);
  };

  const handleViewBill = (bill: Bill) => {
    setViewingBill(bill);
  };

  const loadConfigurableItems = () => {
    try {
      const saved = localStorage.getItem('configurableBillItems');
      if (saved) {
        setConfigurableItems(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load configurable items:', error);
    }
  };

  const handleItemSettingsSave = (items: ConfigurableBillItem[]) => {
    setConfigurableItems(items);
    setShowItemSettings(false);
  };

  const getStatusColor = (status: Bill['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'sent':
        return 'bg-blue-100 text-blue-700';
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      case 'cancelled':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowItemSettings(true)}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <Settings className="w-4 h-4" />
            <span>Manage Items</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Create Bill</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search bills by number, owner, or patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Bills List */}
      {filteredBills.length > 0 ? (
        <div className="space-y-4">
          {filteredBills.map((bill) => (
            <div key={bill.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-teal-100 p-2 rounded-lg">
                    <Receipt className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {bill.billNumber}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}>
                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{bill.owner?.firstName} {bill.owner?.lastName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <PawPrint className="w-4 h-4" />
                        <span>{bill.patient?.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(bill.billDate), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(bill.totalAmount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Due: {format(new Date(bill.dueDate), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleViewBill(bill)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="View bill"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleEditBill(bill)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Edit bill"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteBill(bill.id)}
                      disabled={deletingId === bill.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                      title="Delete bill"
                    >
                      {deletingId === bill.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Bill Items</h4>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {bill.items.length} item{bill.items.length !== 1 ? 's' : ''}
                    {bill.items.length > 0 && (
                      <div className="mt-1">
                        {bill.items.slice(0, 2).map((item, index) => (
                          <div key={index} className="text-xs">
                            • {item.description} ({item.quantity}x)
                          </div>
                        ))}
                        {bill.items.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{bill.items.length - 2} more items
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Medical Records</h4>
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    {bill.medicalRecordIds.length} record{bill.medicalRecordIds.length !== 1 ? 's' : ''} linked
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Amount Breakdown</h4>
                  <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(bill.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatCurrency(bill.tax)}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t border-green-200 pt-1 mt-1">
                      <span>Total:</span>
                      <span>{formatCurrency(bill.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {bill.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                    {bill.notes}
                  </p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                Bill created {format(new Date(bill.createdAt), 'MMM dd, yyyy \'at\' h:mm a')}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Receipt className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bills found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Get started by creating a bill.'}
          </p>
        </div>
      )}

      {/* Bill Form Modal */}
      {showForm && (
        <BillForm
          onClose={() => setShowForm(false)}
          onBillAdded={handleBillAdded}
          configurableItems={configurableItems}
        />
      )}

      {/* Bill Edit Form Modal */}
      {editingBill && (
        <BillForm
          onClose={() => setEditingBill(null)}
          onBillAdded={handleBillUpdated}
          editingBill={editingBill}
          configurableItems={configurableItems}
        />
      )}

      {/* Bill View Modal */}
      {viewingBill && (
        <BillViewModal
          bill={viewingBill}
          onClose={() => setViewingBill(null)}
          onEdit={() => {
            setEditingBill(viewingBill);
            setViewingBill(null);
          }}
        />
      )}

      {/* Bill Item Settings Modal */}
      {showItemSettings && (
        <BillItemSettingsModal
          currentItems={configurableItems}
          onClose={() => setShowItemSettings(false)}
          onSave={handleItemSettingsSave}
        />
      )}
    </div>
  );
};

export default BillList;