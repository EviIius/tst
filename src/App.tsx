import React, { useState, useMemo, useEffect } from 'react';
import { Search, BarChart3, Database, Monitor, Columns, Bot } from 'lucide-react';
import Dashboard from './components/Dashboard';
import SearchBar from './components/SearchBar';
import DataSourceCard from './components/DataSourceCard';
import DataDetailModal from './components/DataDetailModal';
import ApplicationCard from './components/ApplicationCard';
import ApplicationDetailModal from './components/ApplicationDetailModal';
import SchemaViewer from './components/SchemaViewer';
import { DataSource, SearchFilters, Application } from './types';
import { mockDataTables } from './data/mockData';
import CSVDataLoader from './services/csvDataLoader';
import { AISearchResult, EnhancedAISearchResponse } from './services/ragSearchService';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'catalog' | 'applications' | 'schema' | 'ai-search'>('dashboard');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({ query: '' });
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load CSV data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await CSVDataLoader.loadCSVData();
        const csvDataSources = CSVDataLoader.convertToDataSources();
        const csvApplications = CSVDataLoader.convertToApplications();
        
        setDataSources(csvDataSources);
        setApplications(csvApplications);
        console.log('Loaded CSV data:', { 
          dataSources: csvDataSources.length, 
          applications: csvApplications.length 
        });
      } catch (error) {
        console.error('Failed to load CSV data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Get unique values for filters
  const departments = useMemo(() => 
    Array.from(new Set(dataSources.map(ds => ds.department))).sort(),
    [dataSources]
  );

  const tags = useMemo(() => 
    Array.from(new Set(dataSources.reduce((acc: string[], ds) => acc.concat(ds.tags), []))).sort(),
    [dataSources]
  );

  // Filter data sources based on search criteria
  const filteredDataSources = useMemo(() => {
    return dataSources.filter(ds => {
      const matchesQuery = !searchFilters.query || 
        ds.name.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
        ds.description.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
        ds.owner.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
        ds.tags.some(tag => tag.toLowerCase().includes(searchFilters.query.toLowerCase()));
      
      const matchesType = !searchFilters.type || ds.type === searchFilters.type;
      const matchesDepartment = !searchFilters.department || ds.department === searchFilters.department;
      const matchesStatus = !searchFilters.status || ds.status === searchFilters.status;
      const matchesTags = !searchFilters.tags?.length || 
        searchFilters.tags.some(tag => ds.tags.indexOf(tag) !== -1);

      return matchesQuery && matchesType && matchesDepartment && matchesStatus && matchesTags;
    });
  }, [dataSources, searchFilters]);

  const handleDataSourceClick = (dataSource: DataSource) => {
    setSelectedDataSource(dataSource);
    setIsDataModalOpen(true);
  };

  const handleApplicationClick = (application: Application) => {
    setSelectedApplication(application);
    setIsAppModalOpen(true);
  };

  const handleAIResultClick = (result: AISearchResult) => {
    // Navigate to the appropriate view based on the result type
    switch (result.type) {
      case 'application':
        const app = applications.find(a => a.id === result.id);
        if (app) {
          setSelectedApplication(app);
          setIsAppModalOpen(true);
        }
        break;
      case 'datasource':
        const ds = dataSources.find(d => d.id === result.id);
        if (ds) {
          setSelectedDataSource(ds);
          setIsDataModalOpen(true);
        }
        break;
      default:
        console.log('Clicked result:', result);
    }
  };

  // Handle AI search from SearchBar
  const handleAISearch = (response: EnhancedAISearchResponse) => {
    // For now, just log the response. Could be used to show results in main area
    console.log('Enhanced AI Search Response:', response);
    if (response.aiResponse) {
      console.log('AI Assistant says:', response.aiResponse.answer);
    }
  };

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    if (currentView === 'dashboard') {
      setCurrentView('catalog');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Professional Header */}
      <header className="bg-white shadow-xl border-b border-slate-200 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Brand */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Database className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  DataHub Enterprise
                </h1>
                <p className="text-sm text-slate-500 font-medium">Intelligent Data Discovery Platform</p>
              </div>
            </div>
            
            {/* Professional Navigation */}
            <nav className="flex items-center space-x-1 bg-slate-50 rounded-2xl p-1 shadow-inner">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  currentView === 'dashboard'
                    ? 'bg-white text-blue-700 shadow-md shadow-blue-100 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('ai-search')}
                className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  currentView === 'ai-search'
                    ? 'bg-white text-purple-700 shadow-md shadow-purple-100 border border-purple-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Bot className="w-4 h-4" />
                AI Discover
              </button>
              <button
                onClick={() => setCurrentView('catalog')}
                className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  currentView === 'catalog'
                    ? 'bg-white text-emerald-700 shadow-md shadow-emerald-100 border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Search className="w-4 h-4" />
                Data Catalog
              </button>
              <button
                onClick={() => setCurrentView('applications')}
                className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  currentView === 'applications'
                    ? 'bg-white text-indigo-700 shadow-md shadow-indigo-100 border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Monitor className="w-4 h-4" />
                Applications
              </button>
              <button
                onClick={() => setCurrentView('schema')}
                className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  currentView === 'schema'
                    ? 'bg-white text-amber-700 shadow-md shadow-amber-100 border border-amber-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Columns className="w-4 h-4" />
                Schema Browser
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {isLoading && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-slate-600 font-medium">Loading CSV data from 50 applications...</p>
            </div>
          </div>
        )}
        
        {!isLoading && currentView === 'dashboard' && (
          <Dashboard dataSources={dataSources} dataTables={mockDataTables} />
        )}
        
        {!isLoading && currentView === 'ai-search' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-center">
              <Bot className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">AI Search Integration</h2>
              <p className="text-slate-600 mb-6">
                AI search is now integrated directly into the search bar above! 
                Click the <Bot className="w-4 h-4 inline mx-1" /> button to enable AI search mode.
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-left">
                <h3 className="font-semibold text-purple-800 mb-2">How to use AI Search:</h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Click the AI bot icon in the search bar to toggle AI mode</li>
                  <li>• Ask natural language questions about our 50 applications</li>
                  <li>• Example: "Show me finance applications" or "Find apps for productivity"</li>
                  <li>• Results are ranked by relevance using our RAG system</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {!isLoading && currentView === 'catalog' && (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-slate-200">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Data Catalog
                  </h1>
                </div>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Discover and explore enterprise data sources across your organization. 
                  Use intelligent search and advanced filters to find exactly what you need.
                </p>
                <div className="flex items-center gap-4 mt-6 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>{dataSources.length} Data Sources</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Real-time Updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>AI-Powered</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-slate-200">
              <SearchBar 
                onSearch={handleSearch}
                onAISearch={handleAISearch}
                departments={departments}
                tags={tags}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-slate-600 font-medium">
                  Showing {filteredDataSources.length} of {dataSources.length} data sources
                </div>
                {filteredDataSources.length < dataSources.length && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    Filtered
                  </span>
                )}
              </div>
              {searchFilters.query && (
                <button
                  onClick={() => setSearchFilters({ query: '' })}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>

            {filteredDataSources.length === 0 ? (
              <div className="text-center py-12">
                <Database className="w-16 h-16 text-corporate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-corporate-900 mb-2">No data sources found</h3>
                <p className="text-corporate-600">
                  Try adjusting your search criteria or filters to find what you're looking for.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDataSources.map((dataSource) => (
                  <DataSourceCard
                    key={dataSource.id}
                    dataSource={dataSource}
                    onClick={handleDataSourceClick}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!isLoading && currentView === 'applications' && (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-slate-200">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Enterprise Applications
                  </h1>
                </div>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Comprehensive overview of all applications connected to your data ecosystem. 
                  Monitor system integrations and data flow across your enterprise infrastructure.
                </p>
                <div className="flex items-center gap-4 mt-6 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span>{applications.length} Connected Applications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Live Monitoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Enterprise Grade</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onClick={handleApplicationClick}
                />
              ))}
            </div>
          </div>
        )}

        {!isLoading && currentView === 'schema' && (
          <SchemaViewer 
            dataSources={dataSources}
            dataTables={mockDataTables}
            applications={applications}
          />
        )}
      </main>

      {/* Modals */}
      <DataDetailModal
        dataSource={selectedDataSource}
        dataTables={mockDataTables}
        isOpen={isDataModalOpen}
        onClose={() => {
          setIsDataModalOpen(false);
          setSelectedDataSource(null);
        }}
      />

      <ApplicationDetailModal
        application={selectedApplication}
        dataSources={dataSources}
        isOpen={isAppModalOpen}
        onClose={() => {
          setIsAppModalOpen(false);
          setSelectedApplication(null);
        }}
      />
    </div>
  );
}

export default App;