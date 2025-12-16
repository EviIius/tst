import React from 'react';
import { Bot } from 'lucide-react';
import { AISearchResult } from '../services/ragSearchService';
import { DataSource, DataTable, Application } from '../types';

interface AISearchProps {
  dataSources: DataSource[];
  dataTables: DataTable[];
  applications: Application[];
  onResultClick: (result: AISearchResult) => void;
}

const AISearch: React.FC<AISearchProps> = () => {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <div className="text-center">
        <Bot className="w-16 h-16 text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">AI Search Integration</h2>
        <p className="text-slate-600 mb-6">
          AI search is now integrated directly into the search bar! 
          Click the AI button in the search bar to enable AI search mode.
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
  );
};

export default AISearch;