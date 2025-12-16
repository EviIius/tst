import { GoogleGenerativeAI } from '@google/generative-ai';
import { CSVApp } from './csvDataLoader';

export interface GeminiAIResponse {
  answer: string;
  relevantApps: string[];
  suggestedQueries: string[];
  confidence: number;
}

/**
 * Gemini AI Service for intelligent responses with RAG integration
 */
export class GeminiAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private static instance: GeminiAIService;

  constructor() {
    try {
      const apiKey = '';
      console.log('Initializing Gemini AI with API key:', apiKey.substring(0, 10) + '...');
      
      this.genAI = new GoogleGenerativeAI(apiKey);
      
      // Try gemini-pro first, fallback to gemini-1.5-flash if needed
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-pro',
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        },
      });
      
      console.log('Gemini AI model initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error);
      throw error;
    }
  }

  public static getInstance(): GeminiAIService {
    if (!GeminiAIService.instance) {
      GeminiAIService.instance = new GeminiAIService();
    }
    return GeminiAIService.instance;
  }

  /**
   * Generate intelligent response using RAG context
   */
  public async generateResponse(
    query: string, 
    csvData: CSVApp[], 
    relevantApps: CSVApp[]
  ): Promise<GeminiAIResponse> {
    try {
      const context = this.buildContext(csvData, relevantApps);
      const prompt = this.buildPrompt(query, context);

      console.log('Sending prompt to Gemini:', prompt.substring(0, 200) + '...');
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('Gemini response received:', text.substring(0, 200) + '...');
      return this.parseResponse(text, relevantApps);
    } catch (error) {
      console.error('Detailed Gemini API Error:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      });

      // Check if it's a CORS or network issue
      if (error instanceof Error) {
        if (error.message.includes('CORS') || error.message.includes('fetch')) {
          return {
            answer: "⚠️ Network Error: The Gemini API cannot be accessed directly from the browser due to CORS restrictions. However, I can still help you search through the applications using our local search capabilities.",
            relevantApps: relevantApps.slice(0, 3).map(app => app.app_id),
            suggestedQueries: [
              "Show me finance applications",
              "What productivity tools are available?", 
              "Find security-related apps"
            ],
            confidence: 0.8
          };
        }
        
        if (error.message.includes('API key')) {
          return {
            answer: "🔑 API Key Error: There seems to be an issue with the Gemini API key configuration. Please check the API key and try again.",
            relevantApps: relevantApps.slice(0, 3).map(app => app.app_id),
            suggestedQueries: [
              "Show me finance applications",
              "What productivity tools are available?",
              "Find security-related apps"  
            ],
            confidence: 0.1
          };
        }
      }

      return {
        answer: `❌ AI Service Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}. Using fallback search results instead.`,
        relevantApps: relevantApps.slice(0, 3).map(app => app.app_id),
        suggestedQueries: [
          "Show me finance applications",
          "What productivity tools are available?",
          "Find security-related apps"
        ],
        confidence: 0.1
      };
    }
  }

  /**
   * Generate contextual suggestions based on query
   */
  public async generateSuggestions(query: string, csvData: CSVApp[]): Promise<string[]> {
    try {
      const prompt = `
Based on this enterprise application catalog, suggest 4-5 related search queries for: "${query}"

Available categories: ${[...new Set(csvData.map(app => app.category))].join(', ')}

Application examples:
${csvData.slice(0, 10).map(app => `- ${app.app_name} (${app.category}): ${app.description.substring(0, 100)}...`).join('\n')}

Generate practical, specific search queries that would help users discover relevant applications. Return only the queries, one per line, without numbers or bullets.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return text.split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0 && !line.match(/^\d+\.?/))
        .slice(0, 5);
    } catch (error) {
      console.error('Gemini suggestions error:', error);
      return [
        "Show me productivity applications",
        "Find finance and banking tools", 
        "What entertainment apps are available?",
        "Security and privacy applications"
      ];
    }
  }

  /**
   * Analyze query intent using Gemini
   */
  public async analyzeIntent(query: string): Promise<{
    intent: string;
    category?: string;
    keywords: string[];
    searchType: 'specific' | 'category' | 'feature' | 'general';
  }> {
    try {
      const prompt = `
Analyze this search query for an enterprise application catalog: "${query}"

Determine:
1. The user's intent (what they're trying to find)
2. If they're looking for a specific category (Finance, Security, Productivity, etc.)
3. Key search keywords
4. Search type: specific (looking for particular app), category (browsing category), feature (looking for functionality), or general (broad search)

Respond in this JSON format:
{
  "intent": "brief description of what user wants",
  "category": "category name if applicable, null otherwise", 
  "keywords": ["key", "search", "terms"],
  "searchType": "specific|category|feature|general"
}
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback if JSON parsing fails
      return {
        intent: "Find relevant applications",
        keywords: query.toLowerCase().split(' ').filter(word => word.length > 2),
        searchType: 'general' as const
      };
    } catch (error) {
      console.error('Intent analysis error:', error);
      return {
        intent: "Find relevant applications",
        keywords: query.toLowerCase().split(' ').filter(word => word.length > 2),
        searchType: 'general' as const
      };
    }
  }

  private buildContext(allApps: CSVApp[], relevantApps: CSVApp[]): string {
    const categories = [...new Set(allApps.map(app => app.category))];
    const totalApps = allApps.length;
    
    let context = `Enterprise Application Catalog Context:
- Total applications: ${totalApps}
- Categories: ${categories.join(', ')}

Most Relevant Applications Found:
`;

    relevantApps.slice(0, 8).forEach((app, index) => {
      context += `${index + 1}. ${app.app_name} (${app.category})
   Description: ${app.description}
   
`;
    });

    if (relevantApps.length > 8) {
      context += `... and ${relevantApps.length - 8} more applications\n`;
    }

    return context;
  }

  private buildPrompt(query: string, context: string): string {
    return `You are an intelligent enterprise data discovery assistant helping users find applications from our corporate catalog.

${context}

User Query: "${query}"

Please provide a helpful, conversational response that:
1. Directly addresses the user's question
2. Highlights the most relevant applications found
3. Explains why these applications are good matches
4. Suggests related searches if appropriate
5. Uses a professional but friendly tone

Keep your response concise (2-3 paragraphs maximum) and focus on being actionable and informative.

Response:`;
  }

  private parseResponse(text: string, relevantApps: CSVApp[]): GeminiAIResponse {
    // Extract confidence based on language used
    let confidence = 0.8; // Default high confidence
    
    const lowerText = text.toLowerCase();
    if (lowerText.includes('might') || lowerText.includes('possibly') || lowerText.includes('perhaps')) {
      confidence = 0.6;
    }
    if (lowerText.includes('not sure') || lowerText.includes('unclear')) {
      confidence = 0.4;
    }

    // Generate suggested queries based on the response
    const suggestedQueries = this.generateSuggestedQueries(text, relevantApps);

    return {
      answer: text.trim(),
      relevantApps: relevantApps.slice(0, 5).map(app => app.app_id),
      suggestedQueries,
      confidence
    };
  }

  private generateSuggestedQueries(response: string, relevantApps: CSVApp[]): string[] {
    const categories = [...new Set(relevantApps.map(app => app.category))];
    const suggestions: string[] = [];

    // Generate category-based suggestions
    categories.forEach(category => {
      if (category && suggestions.length < 3) {
        suggestions.push(`Show me more ${category.toLowerCase()} applications`);
      }
    });

    // Add generic helpful suggestions
    if (suggestions.length < 4) {
      suggestions.push("What are the most popular applications?");
    }
    if (suggestions.length < 4) {
      suggestions.push("Find applications by department");
    }

    return suggestions.slice(0, 4);
  }

  /**
   * Generate conversational response for empty or broad queries
   */
  public async generateWelcomeResponse(csvData: CSVApp[]): Promise<GeminiAIResponse> {
    const categories = [...new Set(csvData.map(app => app.category))];
    const totalApps = csvData.length;

    const prompt = `
You are an enterprise data discovery assistant. A user just opened the AI search feature but hasn't asked anything specific yet.

Our catalog contains ${totalApps} applications across these categories: ${categories.join(', ')}.

Generate a brief, welcoming response that:
1. Introduces your capabilities 
2. Suggests a few example queries they could try
3. Highlights what kind of information you can help them find
4. Uses a professional but approachable tone

Keep it conversational and under 2 paragraphs.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        answer: text.trim(),
        relevantApps: [],
        suggestedQueries: [
          "Show me finance applications",
          "Find productivity tools for teams",
          "What security apps do we have?",
          "Browse entertainment applications"
        ],
        confidence: 1.0
      };
    } catch (error) {
      console.error('Welcome response error:', error);
      return {
        answer: `Hi! I'm your AI assistant for discovering applications in our catalog of ${totalApps} apps. I can help you find specific tools, browse categories like ${categories.slice(0, 3).join(', ')}, or answer questions about our available software. Try asking me something like "Show me finance applications" or "Find productivity tools for teams"!`,
        relevantApps: [],
        suggestedQueries: [
          "Show me finance applications",
          "Find productivity tools",  
          "What security apps are available?",
          "Browse by category"
        ],
        confidence: 1.0
      };
    }
  }
}

export default GeminiAIService;