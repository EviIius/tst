import { CSVApp } from './csvDataLoader';
import { GeminiAIResponse } from './geminiService';

/**
 * Mock AI Service that provides intelligent-like responses without API calls
 * This can be used as a fallback when Gemini API has CORS issues in browser
 */
export class MockAIService {
  /**
   * Generate mock intelligent response based on query and context
   */
  public async generateResponse(
    query: string,
    csvData: CSVApp[],
    relevantApps: CSVApp[]
  ): Promise<GeminiAIResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const lowerQuery = query.toLowerCase();
    
    // Analyze the query to generate contextual responses
    let response = this.generateContextualResponse(query, relevantApps);
    
    // Generate suggested queries based on the context
    const suggestedQueries = this.generateSuggestions(lowerQuery, csvData);

    return {
      answer: response,
      relevantApps: relevantApps.slice(0, 5).map(app => app.app_id),
      suggestedQueries,
      confidence: 0.85
    };
  }

  private generateContextualResponse(query: string, relevantApps: CSVApp[]): string {
    const lowerQuery = query.toLowerCase();
    
    if (relevantApps.length === 0) {
      return `I couldn't find any applications that directly match "${query}". Try broadening your search or exploring different categories like Finance, Security, or Productivity.`;
    }

    // Category-based responses
    if (lowerQuery.includes('finance') || lowerQuery.includes('money') || lowerQuery.includes('payment')) {
      return this.generateFinanceResponse(relevantApps);
    }
    
    if (lowerQuery.includes('security') || lowerQuery.includes('encrypt') || lowerQuery.includes('safe')) {
      return this.generateSecurityResponse(relevantApps);
    }
    
    if (lowerQuery.includes('productivity') || lowerQuery.includes('work') || lowerQuery.includes('team')) {
      return this.generateProductivityResponse(relevantApps);
    }
    
    if (lowerQuery.includes('entertainment') || lowerQuery.includes('game') || lowerQuery.includes('music')) {
      return this.generateEntertainmentResponse(relevantApps);
    }

    // Generic response based on found apps
    return this.generateGenericResponse(query, relevantApps);
  }

  private generateFinanceResponse(apps: CSVApp[]): string {
    const financeApps = apps.filter(app => app.category.toLowerCase().includes('finance'));
    if (financeApps.length > 0) {
      return `Great! I found ${apps.length} applications that can help with financial needs. ${financeApps[0].app_name} looks particularly useful - ${financeApps[0].description}. These apps offer various financial features from basic money management to advanced investment tracking.`;
    }
    return `I found ${apps.length} applications that might help with your financial needs. While not exclusively finance apps, they include useful money-related features that could be valuable for your requirements.`;
  }

  private generateSecurityResponse(apps: CSVApp[]): string {
    return `Security is crucial! I've identified ${apps.length} applications that address security and privacy concerns. These tools focus on protecting your data and maintaining privacy, which is essential in today's digital environment. ${apps[0]?.app_name} is particularly notable for its security features.`;
  }

  private generateProductivityResponse(apps: CSVApp[]): string {
    return `Perfect for boosting productivity! I found ${apps.length} applications designed to enhance your workflow and team collaboration. These tools can help streamline processes, manage tasks, and improve overall efficiency. ${apps[0]?.app_name} stands out as a great option for productivity enhancement.`;
  }

  private generateEntertainmentResponse(apps: CSVApp[]): string {
    return `Looking for some entertainment? I discovered ${apps.length} applications that offer various forms of digital entertainment and media. From music and games to lifestyle content, these apps provide engaging experiences for your leisure time.`;
  }

  private generateGenericResponse(query: string, apps: CSVApp[]): string {
    const topApp = apps[0];
    const categories = [...new Set(apps.slice(0, 3).map(app => app.category))];
    
    return `Based on your search for "${query}", I found ${apps.length} relevant applications. The top match is ${topApp.app_name} (${topApp.category}) - ${topApp.description}. The results span across ${categories.join(', ')} categories, giving you diverse options to explore.`;
  }

  private generateSuggestions(query: string, csvData: CSVApp[]): string[] {
    const suggestions: string[] = [];
    const categories = [...new Set(csvData.map(app => app.category))];

    // Query-based suggestions
    if (query.includes('finance')) {
      suggestions.push('Show me investment tracking apps', 'Find budgeting applications');
    } else if (query.includes('security')) {
      suggestions.push('What privacy-focused apps do we have?', 'Find encryption tools');
    } else if (query.includes('productivity')) {
      suggestions.push('Show me team collaboration tools', 'Find project management apps');
    } else {
      // Generic helpful suggestions
      suggestions.push('What are our most popular applications?', 'Browse applications by department');
    }

    // Add category suggestions
    const randomCategories = categories.sort(() => 0.5 - Math.random()).slice(0, 2);
    randomCategories.forEach(category => {
      if (suggestions.length < 4) {
        suggestions.push(`Explore ${category} applications`);
      }
    });

    return suggestions.slice(0, 4);
  }

  public async analyzeIntent(query: string): Promise<{
    intent: string;
    category?: string;
    keywords: string[];
    searchType: 'specific' | 'category' | 'feature' | 'general';
  }> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const lowerQuery = query.toLowerCase();
    const keywords = lowerQuery.split(' ').filter(word => word.length > 2);
    
    // Detect category
    let category: string | undefined;
    let searchType: 'specific' | 'category' | 'feature' | 'general' = 'general';
    
    if (lowerQuery.includes('finance') || lowerQuery.includes('money')) {
      category = 'Finance';
      searchType = 'category';
    } else if (lowerQuery.includes('security') || lowerQuery.includes('privacy')) {
      category = 'Security';
      searchType = 'category';
    } else if (lowerQuery.includes('productivity') || lowerQuery.includes('work')) {
      category = 'Productivity';
      searchType = 'category';
    } else if (lowerQuery.includes('entertainment') || lowerQuery.includes('music') || lowerQuery.includes('game')) {
      category = 'Entertainment';
      searchType = 'category';
    } else if (keywords.some(word => ['find', 'show', 'get', 'need'].includes(word))) {
      searchType = 'feature';
    }

    // Generate intent description
    let intent = 'Find relevant applications';
    if (category) {
      intent = `Find applications in the ${category} category`;
    } else if (lowerQuery.includes('best') || lowerQuery.includes('top')) {
      intent = 'Find the best applications';
    } else if (lowerQuery.includes('team') || lowerQuery.includes('collaboration')) {
      intent = 'Find team collaboration tools';
    }

    return {
      intent,
      category,
      keywords,
      searchType
    };
  }

  public async generateWelcomeResponse(csvData: CSVApp[]): Promise<GeminiAIResponse> {
    const categories = [...new Set(csvData.map(app => app.category))];
    const totalApps = csvData.length;

    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      answer: `👋 Hello! I'm your AI assistant for discovering applications in our catalog of ${totalApps} enterprise applications. I can help you find specific tools, explore categories like ${categories.slice(0, 3).join(', ')}, and answer questions about our software portfolio. 

What would you like to find today? You can ask me things like "Show me finance applications" or "What productivity tools do we have for teams?"`,
      relevantApps: [],
      suggestedQueries: [
        'Show me finance applications',
        'Find productivity tools for teams',
        'What security apps do we have?',
        'Browse entertainment applications'
      ],
      confidence: 1.0
    };
  }

  public async generateSuggestionsAsync(query: string, csvData: CSVApp[]): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.generateSuggestions(query.toLowerCase(), csvData);
  }
}

export default MockAIService;