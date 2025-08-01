import React, { useState, useEffect } from 'react';
import { Search, Plus, FileText, Calendar, User, PawPrint, Edit, Download, Printer, CheckSquare, Square } from 'lucide-react';
import { MedicalRecord } from '../../types';
import { recordsAPI } from '../../services/api';
import { format } from 'date-fns';
import RecordForm from './RecordForm';
import RecordEditForm from './RecordEditForm';
import { generateMedicalRecordPDF, downloadPDF, printPDF } from '../../utils/pdfGenerator';

const RecordList: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [recordTypeFilter, setRecordTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    const filtered = records.filter(record =>
      record.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.treatment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.veterinarian.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const typeFiltered = recordTypeFilter !== 'all' 
      ? filtered.filter(record => record.recordType === recordTypeFilter)
      : filtered;

    setFilteredRecords(typeFiltered);
  }, [records, searchTerm, recordTypeFilter]);

  const fetchRecords = async () => {
    try {
      const data = await recordsAPI.getAll();
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordAdded = (newRecord: MedicalRecord) => {
    setRecords(prev => [newRecord, ...prev]);
    setShowForm(false);
  };

  const handleRecordUpdated = (updatedRecord: MedicalRecord) => {
    setRecords(prev => prev.map(record => 
      record.id === updatedRecord.id ? updatedRecord : record
    ));
    setEditingRecord(null);
    setShowEditForm(false);
  };

  const handleEditRecord = (record: MedicalRecord) => {
    setEditingRecord(record);
    setShowEditForm(true);
  };

  const handleToggleSelection = (recordId: string) => {
    const newSelection = new Set(selectedRecords);
    if (newSelection.has(recordId)) {
      newSelection.delete(recordId);
    } else {
      newSelection.add(recordId);
    }
    setSelectedRecords(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedRecords.size === filteredRecords.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(filteredRecords.map(record => record.id)));
    }
  };

  const handlePrintSelected = async () => {
    if (selectedRecords.size === 0) {
      alert('Please select at least one record to print.');
      return;
    }

    const recordsToPrint = filteredRecords.filter(record => selectedRecords.has(record.id));
    const title = recordsToPrint.length === 1 
      ? `Medical Record - ${recordsToPrint[0].patient?.name}` 
      : `Combined Medical Records (${recordsToPrint.length} records)`;
    
    try {
      const pdf = await generateMedicalRecordPDF(recordsToPrint, title);
      printPDF(pdf);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedRecords.size === 0) {
      alert('Please select at least one record to download.');
      return;
    }

    const recordsToPrint = filteredRecords.filter(record => selectedRecords.has(record.id));
    const filename = recordsToPrint.length === 1 
      ? `medical-record-${recordsToPrint[0].patient?.name}-${format(new Date(recordsToPrint[0].visitDate), 'yyyy-MM-dd')}.pdf`
      : `combined-medical-records-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    
    const title = recordsToPrint.length === 1 
      ? `Medical Record - ${recordsToPrint[0].patient?.name}` 
      : `Combined Medical Records (${recordsToPrint.length} records)`;
    
    try {
      const pdf = await generateMedicalRecordPDF(recordsToPrint, title);
      downloadPDF(pdf, filename);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handlePrintSingle = async (record: MedicalRecord) => {
    const title = `Medical Record - ${record.patient?.name}`;
    try {
      const pdf = await generateMedicalRecordPDF([record], title);
      printPDF(pdf);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleDownloadSingle = async (record: MedicalRecord) => {
    const filename = `medical-record-${record.patient?.name}-${format(new Date(record.visitDate), 'yyyy-MM-dd')}.pdf`;
    const title = `Medical Record - ${record.patient?.name}`;
    try {
      const pdf = await generateMedicalRecordPDF([record], title);
      downloadPDF(pdf, filename);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const getRecordTypeColor = (recordType: string) => {
    switch (recordType) {
      case 'vaccine':
        return 'bg-green-100 text-green-700';
      case 'surgery':
        return 'bg-red-100 text-red-700';
      case 'treatment':
        return 'bg-blue-100 text-blue-700';
      case 'dental':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
        <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
        <div className="flex items-center space-x-3">
          {isSelectionMode && (
            <>
              <button
                onClick={handleSelectAll}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm"
              >
                {selectedRecords.size === filteredRecords.length ? <Square className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
                <span>{selectedRecords.size === filteredRecords.length ? 'Deselect All' : 'Select All'}</span>
              </button>
              
              <button
                onClick={handlePrintSelected}
                disabled={selectedRecords.size === 0}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                <span>Print ({selectedRecords.size})</span>
              </button>
              
              <button
                onClick={handleDownloadSelected}
                disabled={selectedRecords.size === 0}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Download ({selectedRecords.size})</span>
              </button>
            </>
          )}
          
          <button
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              setSelectedRecords(new Set());
            }}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 text-sm ${
              isSelectionMode 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>{isSelectionMode ? 'Cancel Selection' : 'Select Records'}</span>
          </button>
          
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search records by patient, diagnosis, treatment, or veterinarian..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={recordTypeFilter}
          onChange={(e) => setRecordTypeFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="treatment">Treatment</option>
          <option value="vaccine">Vaccine</option>
          <option value="surgery">Surgery</option>
          <option value="dental">Dental</option>
        </select>
      </div>

      {/* Records List */}
      {filteredRecords.length > 0 ? (
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <div key={record.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4 relative">
                {isSelectionMode && (
                  <div className="absolute -left-2 -top-2">
                    <button
                      onClick={() => handleToggleSelection(record.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {selectedRecords.has(record.id) ? (
                        <CheckSquare className="w-5 h-5 text-teal-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <div className="bg-teal-100 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <PawPrint className="w-4 h-4 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {record.patient?.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        ({record.patient?.species})
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecordTypeColor(record.recordType)}`}>
                        {record.recordType.charAt(0).toUpperCase() + record.recordType.slice(1)}
                      </span>
                    </div>
                    {record.patient?.owner && (
                      <div className="flex items-center space-x-1 mt-1 text-sm text-gray-600">
                        <User className="w-3 h-3" />
                        <span>Owner: {record.patient.owner.firstName} {record.patient.owner.lastName}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(record.visitDate), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>Dr. {record.veterinarian}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePrintSingle(record)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="Print record"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDownloadSingle(record)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleEditRecord(record)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="Edit record"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Symptoms</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {record.symptoms}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Diagnosis</h4>
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    {record.diagnosis}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Treatment</h4>
                  <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                    {record.treatment}
                  </p>
                </div>
              </div>

              {record.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Notes</h4>
                  <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                    {record.notes}
                  </p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                Record created {format(new Date(record.createdAt), 'MMM dd, yyyy \'at\' h:mm a')}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No medical records found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a medical record.'}
          </p>
        </div>
      )}

      {/* Record Form Modal */}
      {showForm && (
        <RecordForm
          onClose={() => setShowForm(false)}
          onRecordAdded={handleRecordAdded}
        />
      )}

      {/* Record Edit Form Modal */}
      {showEditForm && editingRecord && (
        <RecordEditForm
          record={editingRecord}
          onClose={() => {
            setShowEditForm(false);
            setEditingRecord(null);
          }}
          onRecordUpdated={handleRecordUpdated}
        />
      )}
    </div>
  );
};

export default RecordList;