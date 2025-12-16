import React from 'react';
import { Monitor, Smartphone, Server, Globe, Calendar, User, Code, ExternalLink, Database } from 'lucide-react';
import { Application } from '../types';

interface ApplicationCardProps {
  application: Application;
  onClick: (application: Application) => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onClick }) => {
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
      case 'web-app':
        return <Globe className="w-5 h-5" />;
      case 'mobile-app':
        return <Smartphone className="w-5 h-5" />;
      case 'desktop-app':
        return <Monitor className="w-5 h-5" />;
      case 'service':
      case 'microservice':
        return <Server className="w-5 h-5" />;
      default:
        return <Code className="w-5 h-5" />;
    }
  };

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case 'production':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'staging':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'development':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'testing':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const formatType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div 
      className="card cursor-pointer hover:border-accent-300 transition-all duration-200"
      onClick={() => onClick(application)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-100 rounded-lg text-accent-600">
            {getTypeIcon(application.type)}
          </div>
          <div>
            <h3 className="font-semibold text-corporate-900 text-lg">{application.name}</h3>
            <p className="text-corporate-600 text-sm">{formatType(application.type)}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
            {application.status}
          </div>
          <div className={`inline-flex items-center px-2 py-1 rounded border text-xs font-medium ${getEnvironmentColor(application.environment)}`}>
            {application.environment}
          </div>
        </div>
      </div>

      <p className="text-corporate-700 mb-4 line-clamp-2">{application.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2 text-corporate-600">
          <User className="w-4 h-4" />
          <span>{application.owner}</span>
        </div>
        <div className="flex items-center gap-2 text-corporate-600">
          <Calendar className="w-4 h-4" />
          <span>{new Date(application.lastDeployed).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-corporate-600">{application.department}</span>
        <div className="flex items-center gap-2 text-sm text-corporate-600">
          <Database className="w-4 h-4" />
          <span>{application.connectedDataSources.length} data sources</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-sm">
          <span className="text-corporate-600">Version: </span>
          <span className="font-medium text-corporate-900">{application.version}</span>
        </div>
        {application.url && (
          <div className="flex items-center gap-1 text-accent-600 text-sm">
            <ExternalLink className="w-3 h-3" />
            <span>Live</span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="text-sm text-corporate-600 mb-2">Technologies:</div>
        <div className="flex flex-wrap gap-1">
          {application.technologies.slice(0, 3).map((tech, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
            >
              {tech}
            </span>
          ))}
          {application.technologies.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-corporate-100 text-corporate-700">
              +{application.technologies.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {application.tags.slice(0, 2).map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-corporate-100 text-corporate-700"
          >
            {tag}
          </span>
        ))}
        {application.tags.length > 2 && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-corporate-100 text-corporate-700">
            +{application.tags.length - 2} more
          </span>
        )}
      </div>
    </div>
  );
};

export default ApplicationCard;