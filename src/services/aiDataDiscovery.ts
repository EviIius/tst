// AI-powered data discovery service
export interface AISearchResult {
  type: 'application' | 'dataSource' | 'table' | 'column';
  id: string;
  name: string;
  relevanceScore: number;
  reason: string;
  path: string;
  sensitive: boolean;
  matchType: 'exact' | 'semantic' | 'related';
}

export interface AISearchResponse {
  query: string;
  intent: string;
  suggestions: AISearchResult[];
  alternativeQueries: string[];
  warnings: string[];
}

export class AIDataDiscoveryService {
  // Simulate AI analysis of user query
  static async searchData(query: string, dataSources: any[], tables: any[], applications: any[]): Promise<AISearchResponse> {
    const normalizedQuery = query.toLowerCase();
    
    // Detect intent and extract key terms
    const intent = this.detectIntent(normalizedQuery);
    const keyTerms = this.extractKeyTerms(normalizedQuery);
    const dataTypes = this.identifyDataTypes(normalizedQuery);
    
    const results: AISearchResult[] = [];
    
    // Search through all data with AI-like scoring
    this.searchApplications(applications, keyTerms, dataTypes, results);
    this.searchDataSources(dataSources, keyTerms, dataTypes, results);
    this.searchTables(tables, keyTerms, dataTypes, results);
    this.searchColumns(tables, keyTerms, dataTypes, results);
    
    // Sort by relevance score
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Generate suggestions and warnings
    const suggestions = results.slice(0, 10);
    const alternativeQueries = this.generateAlternativeQueries(query, keyTerms);
    const warnings = this.generateWarnings(suggestions);
    
    return {
      query,
      intent,
      suggestions,
      alternativeQueries,
      warnings
    };
  }
  
  private static detectIntent(query: string): string {
    const patterns = [
      { pattern: /(credit card|payment|billing|card number)/i, intent: 'Find payment/credit card data' },
      { pattern: /(customer|user|client|person)/i, intent: 'Find customer information' },
      { pattern: /(order|purchase|transaction|sale)/i, intent: 'Find transaction/order data' },
      { pattern: /(employee|staff|hr|human resource)/i, intent: 'Find employee/HR data' },
      { pattern: /(product|inventory|catalog|item)/i, intent: 'Find product/inventory data' },
      { pattern: /(financial|finance|revenue|profit)/i, intent: 'Find financial data' },
      { pattern: /(marketing|campaign|advertisement)/i, intent: 'Find marketing data' },
      { pattern: /(sensitive|pii|personal|private)/i, intent: 'Find sensitive/personal data' },
    ];
    
    for (const { pattern, intent } of patterns) {
      if (pattern.test(query)) {
        return intent;
      }
    }
    
    return 'General data search';
  }
  
  private static extractKeyTerms(query: string): string[] {
    // Remove common words and extract meaningful terms
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'i', 'want', 'need', 'find', 'get', 'show', 'me', 'data', 'information'];
    
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2 && !stopWords.includes(term));
  }
  
  private static identifyDataTypes(query: string): string[] {
    const dataTypePatterns = [
      { pattern: /(credit card|card number|payment card|cc)/i, type: 'credit_card' },
      { pattern: /(ssn|social security|social security number)/i, type: 'ssn' },
      { pattern: /(email|e-mail|email address)/i, type: 'email' },
      { pattern: /(phone|telephone|mobile|cell)/i, type: 'phone' },
      { pattern: /(address|street|city|zip|postal)/i, type: 'address' },
      { pattern: /(name|first name|last name|full name)/i, type: 'name' },
      { pattern: /(password|pwd|passcode)/i, type: 'password' },
      { pattern: /(salary|wage|income|compensation)/i, type: 'salary' },
      { pattern: /(dob|date of birth|birthday)/i, type: 'date_of_birth' },
    ];
    
    const types: string[] = [];
    for (const { pattern, type } of dataTypePatterns) {
      if (pattern.test(query)) {
        types.push(type);
      }
    }
    
    return types;
  }
  
  private static searchApplications(applications: any[], keyTerms: string[], dataTypes: string[], results: AISearchResult[]): void {
    applications.forEach(app => {
      let score = 0;
      let reason = '';
      let matchType: 'exact' | 'semantic' | 'related' = 'related';
      
      // Check application name and description
      const appText = `${app.name} ${app.description} ${app.tags.join(' ')}`.toLowerCase();
      
      keyTerms.forEach(term => {
        if (appText.includes(term)) {
          score += 30;
          reason += `Matches "${term}" in application details. `;
          matchType = 'semantic';
        }
      });
      
      // Special scoring for credit card related queries
      if (dataTypes.includes('credit_card')) {
        if (appText.includes('payment') || appText.includes('billing') || appText.includes('financial')) {
          score += 50;
          reason += 'Likely contains payment/financial data. ';
          matchType = 'semantic';
        }
        if (app.name.toLowerCase().includes('portal') || app.name.toLowerCase().includes('crm')) {
          score += 30;
          reason += 'Customer-facing application may store payment info. ';
        }
      }
      
      if (score > 0) {
        results.push({
          type: 'application',
          id: app.id,
          name: app.name,
          relevanceScore: score,
          reason: reason.trim(),
          path: `Application: ${app.name}`,
          sensitive: app.tags.includes('customer-facing') || app.name.toLowerCase().includes('financial'),
          matchType
        });
      }
    });
  }
  
  private static searchDataSources(dataSources: any[], keyTerms: string[], dataTypes: string[], results: AISearchResult[]): void {
    dataSources.forEach(ds => {
      let score = 0;
      let reason = '';
      let matchType: 'exact' | 'semantic' | 'related' = 'related';
      
      const dsText = `${ds.name} ${ds.description} ${ds.tags.join(' ')} ${ds.department}`.toLowerCase();
      
      keyTerms.forEach(term => {
        if (dsText.includes(term)) {
          score += 25;
          reason += `Matches "${term}" in data source. `;
          matchType = 'semantic';
        }
      });
      
      // Special scoring for credit card data
      if (dataTypes.includes('credit_card')) {
        if (ds.name.toLowerCase().includes('customer') || ds.description.toLowerCase().includes('customer')) {
          score += 40;
          reason += 'Customer database likely contains payment information. ';
        }
        if (ds.name.toLowerCase().includes('sales') || ds.name.toLowerCase().includes('order')) {
          score += 35;
          reason += 'Sales/order data may include payment details. ';
        }
      }
      
      if (score > 0) {
        results.push({
          type: 'dataSource',
          id: ds.id,
          name: ds.name,
          relevanceScore: score,
          reason: reason.trim(),
          path: `Data Source: ${ds.name}`,
          sensitive: ds.tags.includes('pii') || ds.tags.includes('customer'),
          matchType
        });
      }
    });
  }
  
  private static searchTables(tables: any[], keyTerms: string[], dataTypes: string[], results: AISearchResult[]): void {
    tables.forEach(table => {
      let score = 0;
      let reason = '';
      let matchType: 'exact' | 'semantic' | 'related' = 'related';
      
      const tableText = `${table.name} ${table.description} ${table.tags.join(' ')}`.toLowerCase();
      
      keyTerms.forEach(term => {
        if (tableText.includes(term)) {
          score += 20;
          reason += `Matches "${term}" in table. `;
          matchType = 'semantic';
        }
      });
      
      // Credit card specific logic
      if (dataTypes.includes('credit_card')) {
        if (table.name === 'customers' || table.name === 'orders') {
          score += 45;
          reason += 'Table commonly contains payment information. ';
          matchType = 'semantic';
        }
        
        // Check if table has payment-related columns
        const hasPaymentColumns = table.columns.some((col: any) => 
          /payment|card|billing|cc/i.test(col.name)
        );
        if (hasPaymentColumns) {
          score += 60;
          reason += 'Contains payment-related columns. ';
          matchType = 'exact';
        }
      }
      
      if (score > 0) {
        results.push({
          type: 'table',
          id: table.id,
          name: table.name,
          relevanceScore: score,
          reason: reason.trim(),
          path: `Table: ${table.schema}.${table.name}`,
          sensitive: table.sensitive,
          matchType
        });
      }
    });
  }
  
  private static searchColumns(tables: any[], keyTerms: string[], dataTypes: string[], results: AISearchResult[]): void {
    tables.forEach(table => {
      table.columns.forEach((column: any) => {
        let score = 0;
        let reason = '';
        let matchType: 'exact' | 'semantic' | 'related' = 'related';
        
        const columnText = `${column.name} ${column.description || ''} ${column.type}`.toLowerCase();
        
        keyTerms.forEach(term => {
          if (columnText.includes(term)) {
            score += 15;
            reason += `Matches "${term}" in column. `;
            matchType = 'semantic';
          }
        });
        
        // Credit card specific scoring
        if (dataTypes.includes('credit_card')) {
          // Direct matches
          if (/^(card_number|credit_card|cc_number|payment_card)$/i.test(column.name)) {
            score += 100;
            reason += 'Direct match for credit card number field. ';
            matchType = 'exact';
          }
          // Semantic matches
          else if (/card|payment|billing/i.test(column.name)) {
            score += 70;
            reason += 'Payment-related column name. ';
            matchType = 'semantic';
          }
          // Type-based matches
          else if (column.type.includes('varchar') && /16|19/.test(column.type) && table.name === 'customers') {
            score += 40;
            reason += 'VARCHAR field in customer table, possible card number storage. ';
            matchType = 'semantic';
          }
        }
        
        if (score > 0) {
          results.push({
            type: 'column',
            id: `${table.id}_${column.name}`,
            name: column.name,
            relevanceScore: score,
            reason: reason.trim(),
            path: `Column: ${table.schema}.${table.name}.${column.name}`,
            sensitive: column.sensitive || table.sensitive,
            matchType
          });
        }
      });
    });
  }
  
  private static generateAlternativeQueries(originalQuery: string, keyTerms: string[]): string[] {
    const alternatives: string[] = [];
    
    if (originalQuery.toLowerCase().includes('credit card')) {
      alternatives.push(
        'payment information',
        'billing data',
        'customer payment methods',
        'card number fields',
        'financial transaction data'
      );
    }
    
    if (keyTerms.includes('customer')) {
      alternatives.push(
        'user profile data',
        'client information',
        'customer records'
      );
    }
    
    return alternatives.slice(0, 5);
  }
  
  private static generateWarnings(suggestions: AISearchResult[]): string[] {
    const warnings: string[] = [];
    
    const sensitiveResults = suggestions.filter(s => s.sensitive);
    if (sensitiveResults.length > 0) {
      warnings.push(`⚠️ ${sensitiveResults.length} results contain sensitive data. Ensure you have proper authorization before accessing.`);
    }
    
    const exactMatches = suggestions.filter(s => s.matchType === 'exact');
    if (exactMatches.length === 0) {
      warnings.push('💡 No exact matches found. Results are based on semantic analysis and may require verification.');
    }
    
    const creditCardColumns = suggestions.filter(s => s.type === 'column' && /card|payment/i.test(s.name));
    if (creditCardColumns.length > 0) {
      warnings.push('🔒 Credit card data found. This is highly sensitive PII subject to PCI DSS compliance requirements.');
    }
    
    return warnings;
  }
}