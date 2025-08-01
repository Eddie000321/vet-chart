import React from 'react';
import { X, Receipt, Calendar, User, PawPrint, DollarSign, Edit, Printer, Download } from 'lucide-react';
import { Bill } from '../../types';
import { format } from 'date-fns';

interface BillViewModalProps {
  bill: Bill;
  onClose: () => void;
  onEdit: () => void;
}

const BillViewModal: React.FC<BillViewModalProps> = ({ bill, onClose, onEdit }) => {
  const getStatusColor = (status: Bill['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'sent':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'paid':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'cancelled':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // This would generate a PDF download
    alert('PDF download functionality would be implemented here');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-teal-100 p-2 rounded-lg">
              <Receipt className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Bill Details</h2>
              <p className="text-sm text-gray-500">{bill.billNumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            
            <button
              onClick={onEdit}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Bill Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{bill.billNumber}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(bill.status)}`}>
                  {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                </span>
                <div className="text-sm text-gray-600">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Bill Date: {format(new Date(bill.billDate), 'MMM dd, yyyy')}
                </div>
                <div className="text-sm text-gray-600">
                  Due: {format(new Date(bill.dueDate), 'MMM dd, yyyy')}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(bill.totalAmount)}
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-600" />
                Bill To
              </h3>
              {bill.owner && (
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">
                    {bill.owner.firstName} {bill.owner.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{bill.owner.email}</p>
                  <p className="text-sm text-gray-600">{bill.owner.phone}</p>
                  <p className="text-sm text-gray-600">{bill.owner.address}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <PawPrint className="w-5 h-5 mr-2 text-gray-600" />
                Patient
              </h3>
              {bill.patient && (
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{bill.patient.name}</p>
                  <p className="text-sm text-gray-600">
                    {bill.patient.species} • {bill.patient.breed}
                  </p>
                  <p className="text-sm text-gray-600">
                    Age: {bill.patient.age} years • Gender: {bill.patient.gender}
                  </p>
                  <p className="text-sm text-gray-600">
                    Weight: {bill.patient.weight} {bill.patient.weightUnit || 'lbs'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bill Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Services & Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Quantity</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Unit Price</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bill.items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bill Summary */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(bill.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Tax ({((bill.tax / bill.subtotal) * 100).toFixed(1)}%):
                  </span>
                  <span className="font-medium">{formatCurrency(bill.tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-3">
                  <span>Total:</span>
                  <span className="text-green-600">{formatCurrency(bill.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {bill.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                {bill.notes}
              </p>
            </div>
          )}

          {/* Medical Records */}
          {bill.medicalRecordIds.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Linked Medical Records</h3>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">
                    {bill.medicalRecordIds.length} medical record{bill.medicalRecordIds.length !== 1 ? 's' : ''} linked to this bill
                  </span>
                  <span className="text-xs text-blue-600">
                    Record IDs: {bill.medicalRecordIds.join(', ')}
                  </span>
                </div>
                <p className="text-xs text-blue-700">
                  These medical records are associated with the services billed to this patient.
                </p>
              </div>
            </div>
          )}

          {/* Bill Metadata */}
          <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p>Bill created {format(new Date(bill.createdAt), 'MMM dd, yyyy \'at\' h:mm a')}</p>
              <p>Last updated {format(new Date(bill.updatedAt), 'MMM dd, yyyy \'at\' h:mm a')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillViewModal;