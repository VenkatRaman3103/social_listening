// Global Data Manager for persistent data across navigation
export interface NewsData {
  articles: any[];
  lastFetched: string;
  isLoading: boolean;
  error: string | null;
}

export interface SocialData {
  results: any[];
  errors: any[];
  lastFetched: string;
  isLoading: boolean;
  error: string | null;
}

export interface HashtagData {
  hashtags: any[];
  lastFetched: string;
  isLoading: boolean;
  error: string | null;
}

class DataManager {
  private newsData: NewsData = {
    articles: [],
    lastFetched: '',
    isLoading: false,
    error: null
  };

  private socialData: SocialData = {
    results: [],
    errors: [],
    lastFetched: '',
    isLoading: false,
    error: null
  };

  private hashtagData: HashtagData = {
    hashtags: [],
    lastFetched: '',
    isLoading: false,
    error: null
  };

  private listeners: { [key: string]: ((data: any) => void)[] } = {};

  // News Data Management
  getNewsData(): NewsData {
    return this.newsData;
  }

  setNewsData(data: Partial<NewsData>) {
    this.newsData = { ...this.newsData, ...data };
    this.notifyListeners('news', this.newsData);
  }

  setNewsLoading(loading: boolean) {
    this.newsData.isLoading = loading;
    this.notifyListeners('news', this.newsData);
  }

  setNewsError(error: string | null) {
    this.newsData.error = error;
    this.notifyListeners('news', this.newsData);
  }

  // Social Data Management
  getSocialData(): SocialData {
    return this.socialData;
  }

  setSocialData(data: Partial<SocialData>) {
    this.socialData = { ...this.socialData, ...data };
    this.notifyListeners('social', this.socialData);
  }

  setSocialLoading(loading: boolean) {
    this.socialData.isLoading = loading;
    this.notifyListeners('social', this.socialData);
  }

  setSocialError(error: string | null) {
    this.socialData.error = error;
    this.notifyListeners('social', this.socialData);
  }

  // Hashtag Data Management
  getHashtagData(): HashtagData {
    return this.hashtagData;
  }

  setHashtagData(data: Partial<HashtagData>) {
    this.hashtagData = { ...this.hashtagData, ...data };
    this.notifyListeners('hashtag', this.hashtagData);
  }

  setHashtagLoading(loading: boolean) {
    this.hashtagData.isLoading = loading;
    this.notifyListeners('hashtag', this.hashtagData);
  }

  setHashtagError(error: string | null) {
    this.hashtagData.error = error;
    this.notifyListeners('hashtag', this.hashtagData);
  }

  // Refresh all data
  async refreshAllData() {
    console.log('Refreshing all data...');
    
    // Set all data to loading
    this.setNewsLoading(true);
    this.setSocialLoading(true);
    this.setHashtagLoading(true);

    try {
      // Refresh news data
      await this.refreshNewsData();
      
      // Refresh social data (if keywords exist)
      await this.refreshSocialData();
      
      // Refresh hashtag data
      await this.refreshHashtagData();
      
      console.log('All data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }

  private async refreshNewsData() {
    try {
      const response = await fetch('/api/news', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.setNewsData({
          articles: data.articles || [],
          lastFetched: new Date().toISOString(),
          isLoading: false,
          error: null
        });
      } else {
        throw new Error('Failed to fetch news data');
      }
    } catch (error) {
      this.setNewsError(error instanceof Error ? error.message : 'Failed to fetch news data');
      this.setNewsLoading(false);
    }
  }

  private async refreshSocialData() {
    try {
      // Check if we have keywords to search
      const userData = localStorage.getItem('user');
      if (!userData) {
        this.setSocialLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      if (!user.keywords || user.keywords.length === 0) {
        this.setSocialLoading(false);
        return;
      }

      // For now, just clear social data as we need user interaction for keyword selection
      this.setSocialData({
        results: [],
        errors: [],
        lastFetched: new Date().toISOString(),
        isLoading: false,
        error: null
      });
    } catch (error) {
      this.setSocialError(error instanceof Error ? error.message : 'Failed to refresh social data');
      this.setSocialLoading(false);
    }
  }

  private async refreshHashtagData() {
    try {
      // Process existing social data for hashtags
      const socialData = localStorage.getItem('socialListeningData');
      let hashtagMap = new Map<string, any>();

      if (socialData) {
        const data = JSON.parse(socialData);
        this.processSocialDataForHashtags(data, hashtagMap);
      }

      const hashtagArray = Array.from(hashtagMap.values());
      this.setHashtagData({
        hashtags: hashtagArray,
        lastFetched: new Date().toISOString(),
        isLoading: false,
        error: null
      });
    } catch (error) {
      this.setHashtagError(error instanceof Error ? error.message : 'Failed to refresh hashtag data');
      this.setHashtagLoading(false);
    }
  }

  private processSocialDataForHashtags(data: any, hashtagMap: Map<string, any>) {
    if (data.results) {
      data.results.forEach((platformResult: any) => {
        if (platformResult.content) {
          platformResult.content.forEach((content: any) => {
            if (content.hashtags && content.hashtags.length > 0) {
              content.hashtags.forEach((hashtag: string) => {
                const normalizedHashtag = hashtag.toLowerCase();
                
                if (hashtagMap.has(normalizedHashtag)) {
                  const existing = hashtagMap.get(normalizedHashtag)!;
                  existing.count += 1;
                  existing.engagement.total += (content.engagement.like_count || 0) + (content.engagement.share_count || 0) + (content.engagement.comment_count || 0);
                  existing.engagement.likes += content.engagement.like_count || 0;
                  existing.engagement.shares += content.engagement.share_count || 0;
                  existing.engagement.comments += content.engagement.comment_count || 0;
                  existing.engagement.views += content.engagement.view_count || 0;
                  
                  if (!existing.platforms.includes(content.work_platform.name)) {
                    existing.platforms.push(content.work_platform.name);
                  }
                  
                  const contentDate = new Date(content.published_at);
                  const lastSeenDate = new Date(existing.lastSeen);
                  if (contentDate > lastSeenDate) {
                    existing.lastSeen = content.published_at;
                  }
                } else {
                  hashtagMap.set(normalizedHashtag, {
                    hashtag: hashtag,
                    count: 1,
                    platforms: [content.work_platform.name],
                    lastSeen: content.published_at,
                    trend: 'stable',
                    engagement: {
                      total: (content.engagement.like_count || 0) + (content.engagement.share_count || 0) + (content.engagement.comment_count || 0),
                      likes: content.engagement.like_count || 0,
                      shares: content.engagement.share_count || 0,
                      comments: content.engagement.comment_count || 0,
                      views: content.engagement.view_count || 0,
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  }

  // Event listeners for real-time updates
  subscribe(event: string, callback: (data: any) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  unsubscribe(event: string, callback: (data: any) => void) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  private notifyListeners(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Initialize data on app start
  async initializeData() {
    console.log('Initializing data...');
    await this.refreshAllData();
  }
}

export const dataManager = new DataManager();
