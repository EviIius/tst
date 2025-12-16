import React, { useState, useEffect } from 'react';
import { Search, Filter, Database, Clock, User, Tag, Bot, Sparkles, Zap } from 'lucide-react';
import { SearchFilters } from '../types';
import RAGSearchService, { AISearchResult, EnhancedAISearchResponse } from '../services/ragSearchService';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  onAISearch?: (response: EnhancedAISearchResponse) => void;
  departments: string[];
  tags: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onAISearch, departments, tags }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: '',
    department: '',
    tags: [],
    status: ''
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aiResponse, setAiResponse] = useState<EnhancedAISearchResponse | null>(null);
  const [isAIMode, setIsAIMode] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [ragService, setRagService] = useState<RAGSearchService | null>(null);
  const [isUsingGemini, setIsUsingGemini] = useState(true);

  useEffect(() => {
    const service = new RAGSearchService();
    setRagService(service);
  }, []);

  const handleSearch = async () => {
    if (isAIMode && ragService && filters.query.trim()) {
      // AI Search using RAG with Gemini
      setIsLoadingAI(true);
      try {
        const response = await ragService.searchWithAI(filters.query, 10, true);
        setAiResponse(response);
        if (onAISearch) {
          onAISearch(response);
        }
      } catch (error) {
        console.error('AI Search error:', error);
      } finally {
        setIsLoadingAI(false);
      }
    } else {
      // Regular search
      onSearch(filters);
      setAiResponse(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleAIMode = () => {
    setIsAIMode(!isAIMode);
    setAiResponse(null);
  };

  const toggleAIService = () => {
    const newUseGemini = !isUsingGemini;
    setIsUsingGemini(newUseGemini);
    if (ragService) {
      ragService.setUseGemini(newUseGemini);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder={isAIMode ? "Ask AI about our 50 applications..." : "Search data sources, tables, descriptions..."}
            className={`w-full pl-12 pr-4 py-4 bg-white border-2 ${isAIMode ? 'border-purple-200 focus:ring-purple-500 focus:border-purple-300' : 'border-slate-200 focus:ring-blue-500 focus:border-blue-300'} rounded-2xl focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 text-slate-700 font-medium shadow-sm`}
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            onKeyPress={handleKeyPress}
          />
        </div>
        <button
          onClick={toggleAIMode}
          className={`px-6 py-4 font-semibold rounded-2xl transition-all shadow-lg hover:shadow-xl ${
            isAIMode 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700' 
              : 'bg-white text-slate-600 border-2 border-slate-200 hover:bg-slate-50'
          }`}
          title={isAIMode ? 'Disable AI Mode' : 'Enable AI Mode'}
        >
          <Bot className="w-5 h-5" />
        </button>
        {isAIMode && (
          <button
            onClick={toggleAIService}
            className={`px-4 py-4 font-medium text-xs rounded-2xl transition-all shadow-md hover:shadow-lg ${
              isUsingGemini
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700'
            }`}
            title={isUsingGemini ? 'Using Gemini API (click for Mock AI)' : 'Using Mock AI (click for Gemini API)'}
          >
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              {isUsingGemini ? 'Gemini' : 'Mock'}
            </div>
          </button>
        )}
        <button
          onClick={handleSearch}
          disabled={isLoadingAI}
          className={`px-8 py-4 font-semibold rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-75 disabled:cursor-not-allowed ${
            isAIMode
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 focus:ring-purple-500'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500'
          }`}
        >
          {isLoadingAI ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              AI Thinking...
            </div>
          ) : isAIMode ? (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Ask AI
            </div>
          ) : (
            'Search'
          )}
        </button>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`px-6 py-4 border-2 font-semibold rounded-2xl transition-all shadow-md hover:shadow-lg ${
            showAdvanced 
              ? 'border-blue-300 bg-blue-50 text-blue-700' 
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {showAdvanced && (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Advanced Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">
                <Database className="w-4 h-4" />
                Type
              </label>
              <select
                className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all font-medium text-slate-700"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="database">Database</option>
                <option value="api">API</option>
                <option value="file">File</option>
                <option value="warehouse">Data Warehouse</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">
                <User className="w-4 h-4" />
                Department
              </label>
              <select
                className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all font-medium text-slate-700"
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">
                <Clock className="w-4 h-4" />
                Status
              </label>
              <select
                className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all font-medium text-slate-700"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

          <div>
            <label className="block text-sm font-medium text-corporate-700 mb-2">
              <Tag className="inline w-4 h-4 mr-1" />
              Tags
            </label>
            <select
              className="input-field"
              value=""
              onChange={(e) => {
                const tag = e.target.value;
                if (tag && !filters.tags?.includes(tag)) {
                  setFilters({ 
                    ...filters, 
                    tags: [...(filters.tags || []), tag] 
                  });
                }
              }}
            >
              <option value="">Add Tag Filter</option>
              {tags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            {filters.tags && filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent-100 text-accent-800"
                  >
                    {tag}
                    <button
                      onClick={() => setFilters({
                        ...filters,
                        tags: filters.tags?.filter(t => t !== tag)
                        })}
                        className="ml-2 text-purple-600 hover:text-purple-800 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Search Results */}
      {isAIMode && (isLoadingAI || aiResponse) && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
          {isLoadingAI ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span className="text-purple-700 font-medium">AI is analyzing your request...</span>
                </div>
              </div>
            </div>
          ) : aiResponse && (
            <>
              {/* AI Response */}
              {aiResponse.aiResponse && (
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Bot className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-bold text-purple-800">AI Assistant</h3>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-xs text-purple-600">
                        {Math.round(aiResponse.aiResponse.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-purple-100">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                      {aiResponse.aiResponse.answer}
                    </p>
                    {aiResponse.aiResponse.suggestedQueries.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-purple-100">
                        <p className="text-sm font-medium text-purple-800 mb-2">You might also ask:</p>
                        <div className="flex flex-wrap gap-2">
                          {aiResponse.aiResponse.suggestedQueries.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setFilters({ ...filters, query: suggestion });
                                handleSearch();
                              }}
                              className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Application Results */}
              {aiResponse.results.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Database className="w-5 h-5 text-purple-600" />
                    <h4 className="font-bold text-purple-800">Found Applications</h4>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                      {aiResponse.results.length} results
                    </span>
                  </div>
                  <div className="space-y-3">
                    {aiResponse.results.map((result) => (
                      <div
                        key={result.id}
                        className="bg-white rounded-xl p-4 border border-purple-100 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => {
                          console.log('Selected AI result:', result);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-slate-800">{result.title}</h4>
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                {result.category}
                              </span>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed">{result.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 ml-4">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                              <span className="text-xs font-medium text-purple-600">
                                {Math.round(result.relevanceScore * 100)}% match
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 capitalize">{result.type}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;