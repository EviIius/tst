import React, { useState, useMemo } from 'react';
import { Table, Columns, Search, Lock, Key, Eye } from 'lucide-react';
import { DataSource, DataTable, Application } from '../types';

interface SchemaViewerProps {
  dataSources: DataSource[];
  dataTables: DataTable[];
  applications: Application[];
}

const SchemaViewer: React.FC<SchemaViewerProps> = ({ dataSources, dataTables, applications }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<string>('');
  const [selectedDataSource, setSelectedDataSource] = useState<string>('');
  const [selectedSchema, setSelectedSchema] = useState<string>('');
  const [showSensitiveOnly, setShowSensitiveOnly] = useState(false);

  // Get unique schemas
  const schemas = useMemo(() => {
    const schemaSet = new Set(dataTables.map(table => table.schema));
    return Array.from(schemaSet).sort();
  }, [dataTables]);

  // Filter and organize data
  const filteredData = useMemo(() => {
    let filteredTables = dataTables;

    // Filter by application
    if (selectedApplication) {
      const app = applications.find(a => a.id === selectedApplication);
      if (app) {
        filteredTables = filteredTables.filter(table => 
          app.connectedDataSources.includes(table.sourceId)
        );
      }
    }

    // Filter by data source
    if (selectedDataSource) {
      filteredTables = filteredTables.filter(table => table.sourceId === selectedDataSource);
    }

    // Filter by schema
    if (selectedSchema) {
      filteredTables = filteredTables.filter(table => table.schema === selectedSchema);
    }

    // Filter by search query
    if (searchQuery) {
      filteredTables = filteredTables.filter(table =>
        table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        table.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        table.columns.some(col => 
          col.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          col.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filter sensitive only
    if (showSensitiveOnly) {
      filteredTables = filteredTables.filter(table => 
        table.sensitive || table.columns.some(col => col.sensitive)
      );
    }

    return filteredTables.map(table => {
      const dataSource = dataSources.find(ds => ds.id === table.sourceId);
      const connectedApps = applications.filter(app => 
        app.connectedDataSources.includes(table.sourceId)
      );

      return {
        ...table,
        dataSourceName: dataSource?.name || 'Unknown',
        dataSourceType: dataSource?.type || 'unknown',
        connectedApplications: connectedApps
      };
    });
  }, [dataTables, dataSources, applications, selectedApplication, selectedDataSource, selectedSchema, searchQuery, showSensitiveOnly]);

  const clearFilters = () => {
    setSelectedApplication('');
    setSelectedDataSource('');
    setSelectedSchema('');
    setSearchQuery('');
    setShowSensitiveOnly(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Columns className="w-8 h-8 text-accent-600" />
        <h1 className="text-2xl font-bold text-corporate-900">Schema Viewer</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-corporate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-corporate-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-corporate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tables or columns..."
                className="w-full pl-10 pr-4 py-2 border border-corporate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-corporate-700 mb-2">Application</label>
            <select
              className="w-full px-3 py-2 border border-corporate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
              value={selectedApplication}
              onChange={(e) => setSelectedApplication(e.target.value)}
            >
              <option value="">All Applications</option>
              {applications.map(app => (
                <option key={app.id} value={app.id}>{app.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-corporate-700 mb-2">Data Source</label>
            <select
              className="w-full px-3 py-2 border border-corporate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
              value={selectedDataSource}
              onChange={(e) => setSelectedDataSource(e.target.value)}
            >
              <option value="">All Data Sources</option>
              {dataSources.map(ds => (
                <option key={ds.id} value={ds.id}>{ds.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-corporate-700 mb-2">Schema</label>
            <select
              className="w-full px-3 py-2 border border-corporate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
              value={selectedSchema}
              onChange={(e) => setSelectedSchema(e.target.value)}
            >
              <option value="">All Schemas</option>
              {schemas.map(schema => (
                <option key={schema} value={schema}>{schema}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-corporate-700">
              <input
                type="checkbox"
                checked={showSensitiveOnly}
                onChange={(e) => setShowSensitiveOnly(e.target.checked)}
                className="rounded border-corporate-300 text-accent-600 focus:ring-accent-500"
              />
              <Lock className="w-4 h-4" />
              Show sensitive data only
            </label>
          </div>
          <button
            onClick={clearFilters}
            className="text-accent-600 hover:text-accent-700 text-sm font-medium"
          >
            Clear all filters
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="text-corporate-600 mb-4">
        Showing {filteredData.length} tables
      </div>

      {filteredData.length === 0 ? (
        <div className="text-center py-12">
          <Table className="w-16 h-16 text-corporate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-corporate-900 mb-2">No tables found</h3>
          <p className="text-corporate-600">
            Try adjusting your search criteria or filters to find what you're looking for.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredData.map((table) => (
            <div key={table.id} className="bg-white rounded-xl shadow-sm border border-corporate-200 overflow-hidden">
              {/* Table Header */}
              <div className="bg-corporate-50 px-6 py-4 border-b border-corporate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Table className="w-5 h-5 text-accent-600" />
                    <div>
                      <h3 className="font-semibold text-corporate-900">
                        {table.dataSourceName}.{table.schema}.{table.name}
                      </h3>
                      <p className="text-sm text-corporate-600">{table.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {table.sensitive && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <Lock className="w-3 h-3" />
                        Sensitive
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Eye className="w-3 h-3" />
                      {table.accessCount} accesses
                    </span>
                  </div>
                </div>
                
                {table.connectedApplications.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs text-corporate-600">Connected Applications: </span>
                    {table.connectedApplications.map((app, index) => (
                      <span key={app.id} className="text-xs text-accent-600">
                        {app.name}{index < table.connectedApplications.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Columns Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-corporate-100">
                    <tr>
                      <th className="text-left py-3 px-6 text-sm font-medium text-corporate-700">Column</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-corporate-700">Type</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-corporate-700">Description</th>
                      <th className="text-center py-3 px-6 text-sm font-medium text-corporate-700">Nullable</th>
                      <th className="text-center py-3 px-6 text-sm font-medium text-corporate-700">Key</th>
                      <th className="text-center py-3 px-6 text-sm font-medium text-corporate-700">Sensitive</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.columns.map((column, index) => (
                      <tr key={index} className="border-b border-corporate-100 hover:bg-corporate-50">
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-corporate-900">{column.name}</span>
                            {column.primaryKey && (
                              <Key className="w-4 h-4 text-yellow-600" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-6 text-corporate-600 font-mono text-sm">{column.type}</td>
                        <td className="py-3 px-6 text-corporate-600">{column.description || '-'}</td>
                        <td className="py-3 px-6 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            column.nullable 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {column.nullable ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-center">
                          {column.primaryKey && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              PK
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-6 text-center">
                          {column.sensitive && (
                            <Lock className="w-4 h-4 text-red-500 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchemaViewer;