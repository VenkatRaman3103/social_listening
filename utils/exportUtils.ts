// Export utilities for different dashboard sections
import { ExportData, ExportColumn } from '@/services/exportService';

// Keywords Management Export
export const createKeywordsExportData = (keywords: any[]): ExportData => ({
  title: 'Keywords Management Report',
  data: keywords,
  columns: [
    { key: 'keyword', label: 'Keyword', type: 'string' },
    { key: 'status', label: 'Status', type: 'string' },
    { key: 'createdAt', label: 'Created Date', type: 'date' },
    { key: 'lastChecked', label: 'Last Checked', type: 'date' },
    { key: 'mentions', label: 'Mentions', type: 'number' },
    { key: 'sentiment', label: 'Sentiment', type: 'string' },
    { key: 'priority', label: 'Priority', type: 'string' }
  ],
  metadata: {
    generatedAt: new Date().toISOString(),
    section: 'Keywords Management',
    totalRecords: keywords.length
  }
});

// News Monitoring Export
export const createNewsExportData = (articles: any[]): ExportData => ({
  title: 'News Blog Monitoring Report',
  data: articles,
  columns: [
    { key: 'title', label: 'Title', type: 'string' },
    { key: 'description', label: 'Description', type: 'string', format: (value) => value ? value.substring(0, 200) + (value.length > 200 ? '...' : '') : 'N/A' },
    { key: 'sourceName', label: 'Source', type: 'string' },
    { key: 'publishedAt', label: 'Published Date', type: 'date' },
    { key: 'sentimentScore', label: 'Sentiment Score', type: 'number' },
    { key: 'sentimentLabel', label: 'Sentiment Label', type: 'string' },
    { key: 'readTime', label: 'Read Time (min)', type: 'number' },
    { key: 'isBreaking', label: 'Is Breaking', type: 'boolean', format: (value) => value ? 'Yes' : 'No' },
    { key: 'categories', label: 'Categories', type: 'string', format: (value) => value ? value.map((cat: any) => typeof cat === 'string' ? cat : cat.name || cat.id || 'Category').join(', ') : 'N/A' },
    { key: 'engagement.views', label: 'Views', type: 'number' },
    { key: 'engagement.shares', label: 'Shares', type: 'number' },
    { key: 'engagement.comments', label: 'Comments', type: 'number' },
    { key: 'url', label: 'URL', type: 'url' }
  ],
  metadata: {
    generatedAt: new Date().toISOString(),
    section: 'News Blog Monitoring',
    totalRecords: articles.length
  }
});

// YouTube Search Export
export const createYouTubeExportData = (videos: any[]): ExportData => ({
  title: 'YouTube Search Results',
  data: videos,
  columns: [
    { key: 'title', label: 'Video Title', type: 'string' },
    { key: 'url', label: 'URL', type: 'url' },
    { key: 'duration_raw', label: 'Duration', type: 'string' },
    { key: 'views', label: 'Views', type: 'number', format: (value) => value.toLocaleString() },
    { key: 'publishedAt', label: 'Published', type: 'string' },
    { key: 'description', label: 'Description', type: 'string' }
  ],
  metadata: {
    generatedAt: new Date().toISOString(),
    section: 'YouTube Search',
    totalRecords: videos.length
  }
});

// Social Analytics Export
export const createSocialAnalyticsExportData = (analytics: any[]): ExportData => ({
  title: 'Social Analytics Report',
  data: analytics,
  columns: [
    { key: 'platform', label: 'Platform', type: 'string' },
    { key: 'metric', label: 'Metric', type: 'string' },
    { key: 'value', label: 'Value', type: 'number' },
    { key: 'change', label: 'Change', type: 'string' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'trend', label: 'Trend', type: 'string' }
  ],
  metadata: {
    generatedAt: new Date().toISOString(),
    section: 'Social Analytics',
    totalRecords: analytics.length
  }
});

// Competitor Analysis Export
export const createCompetitorExportData = (competitors: any[]): ExportData => ({
  title: 'Competitor Analysis Report',
  data: competitors,
  columns: [
    { key: 'name', label: 'Competitor Name', type: 'string' },
    { key: 'website', label: 'Website', type: 'url' },
    { key: 'industry', label: 'Industry', type: 'string' },
    { key: 'mentions', label: 'Mentions', type: 'number' },
    { key: 'sentiment', label: 'Sentiment', type: 'string' },
    { key: 'marketShare', label: 'Market Share', type: 'number', format: (value) => `${value}%` },
    { key: 'lastAnalyzed', label: 'Last Analyzed', type: 'date' }
  ],
  metadata: {
    generatedAt: new Date().toISOString(),
    section: 'Competitor Analysis',
    totalRecords: competitors.length
  }
});

// Hashtag Tracker Export
export const createHashtagExportData = (hashtags: any[]): ExportData => ({
  title: 'Hashtag Tracking Report',
  data: hashtags,
  columns: [
    { key: 'hashtag', label: 'Hashtag', type: 'string' },
    { key: 'platform', label: 'Platform', type: 'string' },
    { key: 'mentions', label: 'Mentions', type: 'number' },
    { key: 'reach', label: 'Reach', type: 'number' },
    { key: 'engagement', label: 'Engagement', type: 'number' },
    { key: 'trend', label: 'Trend', type: 'string' },
    { key: 'lastUpdated', label: 'Last Updated', type: 'date' }
  ],
  metadata: {
    generatedAt: new Date().toISOString(),
    section: 'Hashtag Tracker',
    totalRecords: hashtags.length
  }
});

// Trending Mentions Export
export const createTrendingMentionsExportData = (mentions: any[]): ExportData => ({
  title: 'Trending Mentions Report',
  data: mentions,
  columns: [
    { key: 'keyword', label: 'Keyword', type: 'string' },
    { key: 'platform', label: 'Platform', type: 'string' },
    { key: 'mentions', label: 'Mentions', type: 'number' },
    { key: 'growth', label: 'Growth %', type: 'number', format: (value) => `${value}%` },
    { key: 'sentiment', label: 'Sentiment', type: 'string' },
    { key: 'topContent', label: 'Top Content', type: 'string' },
    { key: 'timestamp', label: 'Timestamp', type: 'date' }
  ],
  metadata: {
    generatedAt: new Date().toISOString(),
    section: 'Trending Mentions',
    totalRecords: mentions.length
  }
});

// Social Listening Export
export const createSocialListeningExportData = (listening: any[]): ExportData => ({
  title: 'Social Listening Report',
  data: listening,
  columns: [
    { key: 'content', label: 'Content', type: 'string' },
    { key: 'platform', label: 'Platform', type: 'string' },
    { key: 'author', label: 'Author', type: 'string' },
    { key: 'sentiment', label: 'Sentiment', type: 'string' },
    { key: 'engagement', label: 'Engagement', type: 'number' },
    { key: 'url', label: 'URL', type: 'url' },
    { key: 'timestamp', label: 'Timestamp', type: 'date' }
  ],
  metadata: {
    generatedAt: new Date().toISOString(),
    section: 'Social Listening',
    totalRecords: listening.length
  }
});

// Dashboard Analytics Export
export const createDashboardAnalyticsExportData = (analytics: any[]): ExportData => ({
  title: 'Dashboard Analytics Report',
  data: analytics,
  columns: [
    { key: 'metric', label: 'Metric', type: 'string' },
    { key: 'value', label: 'Value', type: 'number' },
    { key: 'change', label: 'Change', type: 'string' },
    { key: 'trend', label: 'Trend', type: 'string' },
    { key: 'category', label: 'Category', type: 'string' },
    { key: 'timestamp', label: 'Timestamp', type: 'date' }
  ],
  metadata: {
    generatedAt: new Date().toISOString(),
    section: 'Dashboard Analytics',
    totalRecords: analytics.length
  }
});

// AI Chatbot Export
export const createAIChatbotExportData = (conversations: any[]): ExportData => ({
  title: 'AI Chatbot Conversations',
  data: conversations,
  columns: [
    { key: 'timestamp', label: 'Timestamp', type: 'date' },
    { key: 'userMessage', label: 'User Message', type: 'string' },
    { key: 'botResponse', label: 'Bot Response', type: 'string' },
    { key: 'intent', label: 'Intent', type: 'string' },
    { key: 'confidence', label: 'Confidence', type: 'number', format: (value) => `${(value * 100).toFixed(1)}%` },
    { key: 'sessionId', label: 'Session ID', type: 'string' }
  ],
  metadata: {
    generatedAt: new Date().toISOString(),
    section: 'AI Chatbot',
    totalRecords: conversations.length
  }
});

// Generic data export creator
export const createGenericExportData = (
  title: string,
  data: any[],
  section: string,
  customColumns?: ExportColumn[]
): ExportData => {
  const defaultColumns: ExportColumn[] = customColumns || [
    { key: 'id', label: 'ID', type: 'string' },
    { key: 'name', label: 'Name', type: 'string' },
    { key: 'createdAt', label: 'Created', type: 'date' }
  ];

  return {
    title,
    data,
    columns: defaultColumns,
    metadata: {
      generatedAt: new Date().toISOString(),
      section,
      totalRecords: data.length
    }
  };
};
