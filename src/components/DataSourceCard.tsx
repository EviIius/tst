import React from 'react';
import { Database, Calendar, User, AlertCircle, CheckCircle, Clock, HardDrive } from 'lucide-react';
import { DataSource } from '../types';

interface DataSourceCardProps {
  dataSource: DataSource;
  onClick: (dataSource: DataSource) => void;
}

const DataSourceCard: React.FC<DataSourceCardProps> = ({ dataSource, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-red-600 bg-red-100';
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'database':
        return <Database className="w-5 h-5" />;
      case 'api':
        return <Clock className="w-5 h-5" />;
      case 'file':
        return <HardDrive className="w-5 h-5" />;
      case 'warehouse':
        return <Database className="w-5 h-5" />;
      default:
        return <Database className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'inactive':
        return <AlertCircle className="w-4 h-4" />;
      case 'maintenance':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div 
      className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200 cursor-pointer hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:scale-[1.02]"
      onClick={() => onClick(dataSource)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg group-hover:shadow-xl transition-shadow">
              {getTypeIcon(dataSource.type)}
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white opacity-90"></div>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-700 transition-colors">{dataSource.name}</h3>
            <p className="text-slate-500 text-sm font-medium capitalize bg-slate-100 px-2 py-1 rounded-lg mt-1">{dataSource.type}</p>
          </div>
        </div>
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold shadow-sm ${getStatusColor(dataSource.status)}`}>
          {getStatusIcon(dataSource.status)}
          <span className="capitalize">{dataSource.status}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-600 mb-5 line-clamp-2 leading-relaxed">{dataSource.description}</p>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
          <User className="w-4 h-4 text-slate-500" />
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Owner</p>
            <p className="text-sm font-semibold text-slate-700">{dataSource.owner}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
          <Calendar className="w-4 h-4 text-slate-500" />
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Updated</p>
            <p className="text-sm font-semibold text-slate-700">{new Date(dataSource.lastUpdated).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Department & Records */}
      <div className="flex justify-between items-center mb-5 bg-gradient-to-r from-slate-50 to-blue-50 p-4 rounded-xl">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Department</p>
          <p className="font-semibold text-slate-700">{dataSource.department}</p>
        </div>
        {dataSource.recordCount && (
          <div className="text-right">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Records</p>
            <p className="font-bold text-lg text-blue-700">{dataSource.recordCount.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {dataSource.tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 transition-colors"
          >
            {tag}
          </span>
        ))}
        {dataSource.tags.length > 3 && (
          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            +{dataSource.tags.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
};

export default DataSourceCard;