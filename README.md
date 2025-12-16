# Corporate Data Mart

A professional data discovery platform designed for corporate environments. This application provides a clean, intuitive interface for finding and exploring data sources across your organization.

## Features

### 🎯 **Data Discovery**
- **Advanced Search**: Full-text search across data sources, descriptions, owners, and tags
- **Smart Filtering**: Filter by data type, department, status, and custom tags
- **Real-time Results**: Instant search results as you type

### 📊 **Dashboard Analytics**
- **Overview Metrics**: Total sources, tables, records, and departments
- **Visual Analytics**: Department and type distribution charts
- **Activity Tracking**: Recent table access patterns
- **Status Monitoring**: Active vs inactive data sources

### 🗂️ **Data Catalog**
- **Comprehensive Listings**: Browse all available data sources
- **Detailed Metadata**: Descriptions, owners, update dates, and record counts
- **Sensitivity Indicators**: Clear marking of sensitive data
- **Related Tables**: View associated tables and schemas

### 🔍 **Detailed Views**
- **Source Details**: Complete information about each data source
- **Table Schemas**: Column definitions, types, and constraints
- **Access Statistics**: Usage patterns and access frequency
- **Tag Management**: Organized categorization system

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom corporate theme
- **Icons**: Lucide React icons
- **State Management**: React hooks (useState, useMemo)
- **Build Tool**: Create React App

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Dashboard.tsx   # Main dashboard with analytics
│   ├── SearchBar.tsx   # Advanced search interface
│   ├── DataSourceCard.tsx  # Data source display cards
│   └── DataDetailModal.tsx # Detailed view modal
├── data/               # Mock data and data layer
│   └── mockData.ts     # Sample corporate data
├── types/              # TypeScript type definitions
│   └── index.ts        # Data model interfaces
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
└── index.css           # Global styles and Tailwind config
```

## Mock Data

The application includes realistic corporate data examples:

- **6 Data Sources**: Databases, APIs, files, and warehouses
- **4 Data Tables**: With schemas, columns, and metadata
- **Multiple Departments**: Sales, Marketing, Finance, HR, etc.
- **Various Data Types**: Production, staging, and legacy systems

## Customization

### Adding New Data Sources

Edit `src/data/mockData.ts` to add your data sources:

```typescript
export const mockDataSources: DataSource[] = [
  {
    id: 'ds-new',
    name: 'Your Data Source',
    description: 'Description of your data source',
    type: 'database', // 'database' | 'api' | 'file' | 'warehouse'
    status: 'active', // 'active' | 'inactive' | 'maintenance'
    lastUpdated: '2024-11-03T10:00:00Z',
    owner: 'Data Owner Name',
    department: 'Your Department',
    tags: ['tag1', 'tag2'],
    recordCount: 1000000,
    size: '10.5 GB'
  }
  // ... more sources
];
```

### Theming

The application uses a corporate color scheme defined in `tailwind.config.js`:

- **Corporate Colors**: Professional grays and blues
- **Accent Colors**: Customizable brand colors
- **Status Colors**: Standard green/yellow/red indicators

### API Integration

To connect to real data sources:

1. Replace mock data in `src/data/mockData.ts`
2. Add API calls in component `useEffect` hooks
3. Implement loading states and error handling
4. Add authentication if required

## Features for Future Development

### 🔒 **Security & Access Control**
- User authentication and authorization
- Role-based data access permissions
- Audit logging for data access

### 🔌 **Data Integration**
- Real-time API connections
- Database query interface
- Data preview and sampling

### 📈 **Advanced Analytics**
- Data lineage tracking
- Usage analytics and recommendations
- Data quality metrics

### 🔔 **Notifications**
- Data freshness alerts
- Schema change notifications
- Access request workflows

## Best Practices

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessibility**: WCAG compliant with proper ARIA labels
- **Performance**: Optimized with React.memo and useMemo
- **Type Safety**: Full TypeScript coverage
- **Clean Code**: Consistent formatting and naming conventions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Test thoroughly
5. Submit a pull request

## License

This project is created for demonstration purposes. Adapt as needed for your corporate environment.

---

**Corporate Data Mart** - Making data discovery simple and efficient for enterprise environments.