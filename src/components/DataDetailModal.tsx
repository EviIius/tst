import React from 'react';
import { X, Database, Calendar, Users, Lock, Tag, Table } from 'lucide-react';
import { DataSource, DataTable } from '../types';

interface DataDetailModalProps {
  dataSource: DataSource | null;
  dataTables: DataTable[];
  isOpen: boolean;
  onClose: () => void;
}

const DataDetailModal: React.FC<DataDetailModalProps> = ({ 
  dataSource, 
  dataTables, 
  isOpen, 
  onClose 
}) => {
  if (!isOpen || !dataSource) return null;

  const relatedTables = dataTables.filter(table => table.sourceId === dataSource.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-corporate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-100 rounded-lg text-accent-600">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-corporate-900">{dataSource.name}</h2>
              <p className="text-corporate-600 capitalize">{dataSource.type}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-corporate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-corporate-600" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <h3 className="font-medium text-corporate-900 mb-2">Description</h3>
              <p className="text-corporate-700 mb-4">{dataSource.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-corporate-900 mb-1">Owner</h4>
                  <div className="flex items-center gap-2 text-corporate-600">
                    <Users className="w-4 h-4" />
                    <span>{dataSource.owner}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-corporate-900 mb-1">Department</h4>
                  <p className="text-corporate-600">{dataSource.department}</p>
                </div>
                <div>
                  <h4 className="font-medium text-corporate-900 mb-1">Last Updated</h4>
                  <div className="flex items-center gap-2 text-corporate-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(dataSource.lastUpdated).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-corporate-900 mb-1">Size</h4>
                  <p className="text-corporate-600">{dataSource.size || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-corporate-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {dataSource.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-corporate-100 text-corporate-700"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-corporate-50 rounded-lg p-4">
              <h3 className="font-medium text-corporate-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-corporate-600">Records</p>
                  <p className="text-lg font-semibold text-corporate-900">
                    {dataSource.recordCount?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-corporate-600">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    dataSource.status === 'active' ? 'text-green-600 bg-green-100' :
                    dataSource.status === 'inactive' ? 'text-red-600 bg-red-100' :
                    'text-yellow-600 bg-yellow-100'
                  }`}>
                    {dataSource.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-corporate-600">Related Tables</p>
                  <p className="text-lg font-semibold text-corporate-900">{relatedTables.length}</p>
                </div>
              </div>
            </div>
          </div>

          {relatedTables.length > 0 && (
            <div>
              <h3 className="font-medium text-corporate-900 mb-4 flex items-center gap-2">
                <Table className="w-5 h-5" />
                Related Tables
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedTables.map((table) => (
                  <div key={table.id} className="border border-corporate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-corporate-900">{table.name}</h4>
                        <p className="text-sm text-corporate-600">{table.schema}</p>
                      </div>
                      {table.sensitive && (
                        <Lock className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-corporate-700 mb-3">{table.description}</p>
                    <div className="flex justify-between items-center text-sm text-corporate-600">
                      <span>{table.columns.length} columns</span>
                      <span>{table.accessCount} accesses</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {table.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent-100 text-accent-700"
                        >
                          {tag}
                        </span>
                      ))}
                      {table.tags.length > 2 && (
                        <span className="text-xs text-corporate-500">
                          +{table.tags.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataDetailModal;