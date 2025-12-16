import CSVDataLoader, { CSVApp } from './csvDataLoader';
import GeminiAIService, { GeminiAIResponse } from './geminiService';
import MockAIService from './mockAIService';

export interface AISearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  relevanceScore: number;
  type: 'application' | 'datasource';
}

export interface EnhancedAISearchResponse {
  results: AISearchResult[];
  aiResponse?: GeminiAIResponse;
  intent?: {
    intent: string;
    category?: string;
    keywords: string[];
    searchType: 'specific' | 'category' | 'feature' | 'general';
  };
}

/**
 * Simple RAG (Retrieval-Augmented Generation) system for searching CSV data
 * This simulates semantic search by analyzing keywords and context
 */
export class RAGSearchService {
  private csvData: CSVApp[] = [];
  private geminiService: GeminiAIService;
  private mockAIService: MockAIService;
  private useGemini: boolean = true;
  
  constructor() {
    this.initializeData();
    this.geminiService = GeminiAIService.getInstance();
    this.mockAIService = new MockAIService();
  }

  private async initializeData(): Promise<void> {
    try {
      this.csvData = await CSVDataLoader.loadCSVData();
      console.log(`RAG System initialized with ${this.csvData.length} applications`);
    } catch (error) {
      console.error('Failed to initialize RAG system:', error);
    }
  }

  /**
   * Enhanced semantic search with Gemini AI integration
   * @param query - Natural language search query
   * @param limit - Maximum number of results to return
   * @param useAI - Whether to use Gemini AI for enhanced responses
   * @returns Enhanced search response with AI insights
   */
  public async searchWithAI(query: string, limit: number = 10, useAI: boolean = true): Promise<EnhancedAISearchResponse> {
    if (!query || query.trim().length === 0) {
      if (useAI) {
        let welcomeResponse: GeminiAIResponse;
        
        if (this.useGemini) {
          try {
            welcomeResponse = await this.geminiService.generateWelcomeResponse(this.csvData);
          } catch (error) {
            console.warn('Gemini API failed for welcome response, using mock AI:', error);
            this.useGemini = false;
            welcomeResponse = await this.mockAIService.generateWelcomeResponse(this.csvData);
          }
        } else {
          welcomeResponse = await this.mockAIService.generateWelcomeResponse(this.csvData);
        }
        
        return {
          results: [],
          aiResponse: welcomeResponse
        };
      }
      return { results: [] };
    }

    // Get basic search results
    const results = await this.search(query, limit);
    
    if (!useAI) {
      return { results };
    }

    try {
      // Get relevant apps for context
      const relevantApps = results.map(result => 
        this.csvData.find(app => app.app_id === result.id)!
      ).filter(Boolean);

      let aiResponse: GeminiAIResponse;
      let intent: any;

      if (this.useGemini) {
        try {
          // Try Gemini first
          intent = await this.geminiService.analyzeIntent(query);
          aiResponse = await this.geminiService.generateResponse(
            query,
            this.csvData,
            relevantApps
          );
        } catch (geminiError) {
          console.warn('Gemini API failed, falling back to mock AI:', geminiError);
          this.useGemini = false; // Temporarily disable Gemini
          
          // Use mock AI service as fallback
          intent = await this.mockAIService.analyzeIntent(query);
          aiResponse = await this.mockAIService.generateResponse(
            query,
            this.csvData,
            relevantApps
          );
        }
      } else {
        // Use mock AI service
        intent = await this.mockAIService.analyzeIntent(query);
        aiResponse = await this.mockAIService.generateResponse(
          query,
          this.csvData,
          relevantApps
        );
      }

      return {
        results,
        aiResponse,
        intent
      };
    } catch (error) {
      console.error('AI enhancement error:', error);
      return { results };
    }
  }

  /**
   * Semantic search through CSV applications (original method)
   * @param query - Natural language search query
   * @param limit - Maximum number of results to return
   * @returns Array of search results with relevance scores
   */
  public async search(query: string, limit: number = 10): Promise<AISearchResult[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchTerms = this.extractSearchTerms(query.toLowerCase());
    const results: AISearchResult[] = [];

    // Search through applications
    for (const app of this.csvData) {
      const relevanceScore = this.calculateRelevanceScore(app, searchTerms, query.toLowerCase());
      
      if (relevanceScore > 0.1) { // Minimum relevance threshold
        results.push({
          id: app.app_id,
          title: app.app_name,
          description: app.description,
          category: app.category,
          relevanceScore,
          type: 'application'
        });
      }
    }

    // Sort by relevance and limit results
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  /**
   * Get applications by category
   */
  public getApplicationsByCategory(category: string): AISearchResult[] {
    return this.csvData
      .filter(app => app.category.toLowerCase() === category.toLowerCase())
      .map(app => ({
        id: app.app_id,
        title: app.app_name,
        description: app.description,
        category: app.category,
        relevanceScore: 1.0,
        type: 'application' as const
      }));
  }

  /**
   * Get all unique categories
   */
  public getCategories(): string[] {
    const categories = this.csvData.map(app => app.category);
    return [...new Set(categories)].sort();
  }

  /**
   * Get application statistics
   */
  public getStatistics() {
    const categories = this.getCategories();
    const categoryStats = categories.map(category => ({
      category,
      count: this.csvData.filter(app => app.category === category).length
    }));

    return {
      totalApplications: this.csvData.length,
      totalCategories: categories.length,
      categoryBreakdown: categoryStats
    };
  }

  /**
   * Extract meaningful search terms from query
   */
  private extractSearchTerms(query: string): string[] {
    // Remove common stop words
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'among', 'this', 'that',
      'these', 'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
      'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself',
      'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
      'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'whose', 'this', 'that',
      'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'can', 'find', 'search', 'show', 'get'
    ]);

    return query
      .split(/\s+/)
      .filter(term => term.length > 2 && !stopWords.has(term))
      .map(term => term.replace(/[^\w]/g, ''));
  }

  /**
   * Calculate relevance score for an application against search terms
   */
  private calculateRelevanceScore(app: CSVApp, searchTerms: string[], fullQuery: string): number {
    let score = 0;
    const appName = app.app_name.toLowerCase();
    const appDescription = app.description.toLowerCase();
    const appCategory = app.category.toLowerCase();

    // Exact name match gets highest score
    if (appName.includes(fullQuery)) {
      score += 10;
    }

    // Category match
    if (appCategory.includes(fullQuery)) {
      score += 5;
    }

    // Description match
    if (appDescription.includes(fullQuery)) {
      score += 3;
    }

    // Individual term matching
    searchTerms.forEach(term => {
      if (appName.includes(term)) {
        score += 2;
      }
      if (appCategory.includes(term)) {
        score += 1.5;
      }
      if (appDescription.includes(term)) {
        score += 1;
      }
    });

    // Boost score for popular categories
    const popularCategories = ['Finance', 'Security', 'Productivity', 'Social'];
    if (popularCategories.includes(app.category)) {
      score += 0.5;
    }

    // Normalize score (0-1 range)
    return Math.min(score / 10, 1);
  }

  /**
   * Get AI-generated search suggestions
   */
  public async getAISuggestions(query: string): Promise<string[]> {
    try {
      return await this.geminiService.generateSuggestions(query, this.csvData);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      return [
        "Show me productivity applications",
        "Find finance and banking tools",
        "What security apps are available?",
        "Browse entertainment applications"
      ];
    }
  }

  /**
   * Get recommendations based on an application
   */
  public getRecommendations(appId: string, limit: number = 5): AISearchResult[] {
    const targetApp = this.csvData.find(app => app.app_id === appId);
    if (!targetApp) {
      return [];
    }

    // Find similar applications (same category or similar keywords)
    const recommendations: AISearchResult[] = [];
    
    for (const app of this.csvData) {
      if (app.app_id === appId) continue; // Skip the same app

      let similarityScore = 0;

      // Same category gets high similarity
      if (app.category === targetApp.category) {
        similarityScore += 0.8;
      }

      // Similar keywords in description
      const targetWords = targetApp.description.toLowerCase().split(/\s+/);
      const appWords = app.description.toLowerCase().split(/\s+/);
      const commonWords = targetWords.filter(word => appWords.includes(word));
      similarityScore += (commonWords.length / targetWords.length) * 0.5;

      if (similarityScore > 0.3) {
        recommendations.push({
          id: app.app_id,
          title: app.app_name,
          description: app.description,
          category: app.category,
          relevanceScore: similarityScore,
          type: 'application'
        });
      }
    }

    return recommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  /**
   * Toggle between Gemini AI and Mock AI service
   */
  public setUseGemini(useGemini: boolean): void {
    this.useGemini = useGemini;
    console.log(`AI Service switched to: ${useGemini ? 'Gemini API' : 'Mock AI'}`);
  }

  /**
   * Get current AI service status
   */
  public isUsingGemini(): boolean {
    return this.useGemini;
  }

  /**
   * Force retry with Gemini (reset after API failure)
   */
  public retryWithGemini(): void {
    this.useGemini = true;
    console.log('Retrying with Gemini API...');
  }
}

export default RAGSearchService;