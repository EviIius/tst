export interface DataSource {
  id: string;
  name: string;
  description: string;
  type: 'database' | 'api' | 'file' | 'warehouse';
  status: 'active' | 'inactive' | 'maintenance';
  lastUpdated: string;
  owner: string;
  department: string;
  tags: string[];
  recordCount?: number;
  size?: string;
}

export interface DataTable {
  id: string;
  name: string;
  description: string;
  sourceId: string;
  schema: string;
  columns: DataColumn[];
  lastAccessed: string;
  accessCount: number;
  sensitive: boolean;
  tags: string[];
}

export interface DataColumn {
  name: string;
  type: string;
  description?: string;
  nullable: boolean;
  primaryKey?: boolean;
  sensitive?: boolean;
}

export interface Application {
  id: string;
  name: string;
  description: string;
  type: 'web-app' | 'mobile-app' | 'desktop-app' | 'service' | 'microservice';
  status: 'active' | 'inactive' | 'maintenance';
  owner: string;
  department: string;
  technologies: string[];
  connectedDataSources: string[]; // DataSource IDs
  url?: string;
  version: string;
  lastDeployed: string;
  environment: 'production' | 'staging' | 'development' | 'testing';
  tags: string[];
}

export interface SchemaView {
  applicationId?: string;
  applicationName?: string;
  dataSourceId: string;
  dataSourceName: string;
  schema: string;
  tableName: string;
  columns: DataColumn[];
}

export interface SearchFilters {
  query: string;
  type?: string;
  department?: string;
  tags?: string[];
  status?: string;
}