import React from 'react';
import { X, Globe, Smartphone, Monitor, Server, Code, Calendar, User, Database, ExternalLink, Tag } from 'lucide-react';
import { Application, DataSource } from '../types';

interface ApplicationDetailModalProps {
  application: Application | null;
  dataSources: DataSource[];
  isOpen: boolean;
  onClose: () => void;
}

const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({ 
  application, 
  dataSources, 
  isOpen, 
  onClose 
}) => {
  if (!isOpen || !application) return null;

  const connectedSources = dataSources.filter(ds => 
    application.connectedDataSources.includes(ds.id)
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'web-app':
        return <Globe className="w-6 h-6" />;
      case 'mobile-app':
        return <Smartphone className="w-6 h-6" />;
      case 'desktop-app':
        return <Monitor className="w-6 h-6" />;
      case 'service':
      case 'microservice':
        return <Server className="w-6 h-6" />;
      default:
        return <Code className="w-6 h-6" />;
    }
  };

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case 'production':
        return 'text-green-700 bg-green-100';
      case 'staging':
        return 'text-yellow-700 bg-yellow-100';
      case 'development':
        return 'text-blue-700 bg-blue-100';
      case 'testing':
        return 'text-purple-700 bg-purple-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const formatType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-corporate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-100 rounded-lg text-accent-600">
              {getTypeIcon(application.type)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-corporate-900">{application.name}</h2>
              <p className="text-corporate-600">{formatType(application.type)}</p>
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
              <p className="text-corporate-700 mb-4">{application.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-corporate-900 mb-1">Owner</h4>
                  <div className="flex items-center gap-2 text-corporate-600">
                    <User className="w-4 h-4" />
                    <span>{application.owner}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-corporate-900 mb-1">Department</h4>
                  <p className="text-corporate-600">{application.department}</p>
                </div>
                <div>
                  <h4 className="font-medium text-corporate-900 mb-1">Last Deployed</h4>
                  <div className="flex items-center gap-2 text-corporate-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(application.lastDeployed).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-corporate-900 mb-1">Version</h4>
                  <p className="text-corporate-600 font-mono">{application.version}</p>
                </div>
              </div>

              {application.url && (
                <div className="mb-4">
                  <h4 className="font-medium text-corporate-900 mb-1">URL</h4>
                  <a 
                    href={application.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-accent-600 hover:text-accent-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {application.url}
                  </a>
                </div>
              )}

              <div className="mb-4">
                <h4 className="font-medium text-corporate-900 mb-2">Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {application.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-corporate-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {application.tags.map((tag, index) => (
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
              <h3 className="font-medium text-corporate-900 mb-4">Application Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-corporate-600">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    application.status === 'active' ? 'text-green-600 bg-green-100' :
                    application.status === 'inactive' ? 'text-red-600 bg-red-100' :
                    'text-yellow-600 bg-yellow-100'
                  }`}>
                    {application.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-corporate-600">Environment</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEnvironmentColor(application.environment)}`}>
                    {application.environment}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-corporate-600">Connected Data Sources</p>
                  <p className="text-lg font-semibold text-corporate-900">{connectedSources.length}</p>
                </div>
              </div>
            </div>
          </div>

          {connectedSources.length > 0 && (
            <div>
              <h3 className="font-medium text-corporate-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Connected Data Sources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connectedSources.map((source) => (
                  <div key={source.id} className="border border-corporate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-corporate-900">{source.name}</h4>
                        <p className="text-sm text-corporate-600 capitalize">{source.type}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        source.status === 'active' ? 'text-green-600 bg-green-100' :
                        source.status === 'inactive' ? 'text-red-600 bg-red-100' :
                        'text-yellow-600 bg-yellow-100'
                      }`}>
                        {source.status}
                      </span>
                    </div>
                    <p className="text-sm text-corporate-700 mb-3">{source.description}</p>
                    <div className="flex justify-between items-center text-sm text-corporate-600">
                      <span>{source.owner}</span>
                      <span>{source.recordCount?.toLocaleString() || 'N/A'} records</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {source.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent-100 text-accent-700"
                        >
                          {tag}
                        </span>
                      ))}
                      {source.tags.length > 2 && (
                        <span className="text-xs text-corporate-500">
                          +{source.tags.length - 2} more
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

export default ApplicationDetailModal;