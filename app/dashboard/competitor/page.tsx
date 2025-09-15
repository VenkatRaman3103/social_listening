'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { setUser } from '@/lib/store/slices/userSlice';
import { setArticles } from '@/lib/store/slices/newsSlice';
import { dataManager } from '../../../services/dataManager';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Calendar, 
  ExternalLink, 
  Eye, 
  MessageSquare,
  Share2,
  Heart,
  BarChart3,
  Target,
  Users,
  Building2
} from 'lucide-react';
import styles from './page.module.scss';

interface User {
  id: number;
  name: string;
  email: string;
  plan: string;
  status: string;
  keywords?: string[];
}

interface Keyword {
  id: number;
  userId: number;
  keyword: string;
  createdAt: string;
}

export default function CompetitorPage() {
  const dispatch = useAppDispatch();
  const { user: reduxUser } = useAppSelector((state) => state.user);
  const { articles, loading: newsLoading, error: newsError } = useAppSelector((state) => state.news);
  const [user, setUser] = useState<User | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');
  const [newsData, setNewsData] = useState(dataManager.getNewsData());

  useEffect(() => {
    // Subscribe to news data updates
    const handleNewsUpdate = (data: any) => {
      setNewsData(data);
      if (data.articles && data.articles.length > 0) {
        dispatch(setArticles(data.articles));
      }
    };

    dataManager.subscribe('news', handleNewsUpdate);

    const loadUserAndData = async () => {
      // Get user data from localStorage
      const userData = localStorage.getItem("user");
      console.log('CompetitorPage - User data from localStorage:', userData);
      
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('CompetitorPage - Parsed user:', parsedUser);
          setUser(parsedUser);
          
          // Update Redux store with user data
          dispatch(setUser(parsedUser));
          console.log('CompetitorPage - User dispatched to Redux');

          // Load keywords using the same logic as Social Listening
          try {
            console.log('CompetitorPage - Loading keywords...');
            console.log('CompetitorPage - Parsed user data:', parsedUser);
            console.log('CompetitorPage - User keywords from parsedUser:', parsedUser.keywords);
            
            // First, try to use keywords from Redux store (which is working)
            if (parsedUser.keywords && parsedUser.keywords.length > 0) {
              console.log('CompetitorPage - Using keywords from Redux store:', parsedUser.keywords);
              setKeywords(parsedUser.keywords);
            } else {
              console.log('CompetitorPage - No keywords in parsedUser, trying API...');
              
              // Fallback: try API call
              const token = btoa(JSON.stringify({ userId: parsedUser.id }));
              const response = await fetch('/api/keywords', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
              });

              console.log('CompetitorPage - Keywords API response status:', response.status);
              
              if (response.ok) {
                const keywordsData = await response.json();
                console.log('CompetitorPage - Keywords loaded from API:', keywordsData);
                if (Array.isArray(keywordsData)) {
                  const keywordStrings = keywordsData.map((kw: any) => kw.keyword);
                  console.log('CompetitorPage - Extracted keyword strings:', keywordStrings);
                  setKeywords(keywordStrings);
                } else {
                  console.log('CompetitorPage - API data is not an array:', keywordsData);
                  setKeywords([]);
                }
              } else {
                const errorData = await response.json();
                console.error('CompetitorPage - Failed to load keywords:', errorData);
                
                // Final fallback: try to get keywords from localStorage
                const userData = localStorage.getItem('user');
                if (userData) {
                  const parsedUser = JSON.parse(userData);
                  console.log('CompetitorPage - localStorage user data:', parsedUser);
                  if (parsedUser.keywords && parsedUser.keywords.length > 0) {
                    console.log('CompetitorPage - Using keywords from localStorage as fallback:', parsedUser.keywords);
                    setKeywords(parsedUser.keywords);
                  } else {
                    console.log('CompetitorPage - No keywords found in localStorage either');
                    setKeywords([]);
                  }
                } else {
                  console.log('CompetitorPage - No user data in localStorage');
                  setKeywords([]);
                }
              }
            }
          } catch (error) {
            console.error('CompetitorPage - Error loading keywords:', error);
            
            // Final fallback: try to get keywords from localStorage
            const userData = localStorage.getItem('user');
            if (userData) {
              const parsedUser = JSON.parse(userData);
              if (parsedUser.keywords && parsedUser.keywords.length > 0) {
                console.log('CompetitorPage - Using keywords from localStorage as fallback:', parsedUser.keywords);
                setKeywords(parsedUser.keywords);
              } else {
                console.log('CompetitorPage - No keywords found in localStorage fallback');
                setKeywords([]);
              }
            } else {
              console.log('CompetitorPage - No user data in localStorage fallback');
              setKeywords([]);
            }
          }
          
          // Initialize data if not already loaded
          if (!newsData.lastFetched) {
            console.log('CompetitorPage - Initializing news data...');
            await dataManager.refreshAllData();
          }
        } catch (error) {
          console.error('CompetitorPage - Error parsing user data:', error);
        }
      } else {
        console.log('CompetitorPage - No user data found in localStorage');
      }

      setLoading(false);
    };

    loadUserAndData();

    // Cleanup subscription
    return () => {
      dataManager.unsubscribe('news', handleNewsUpdate);
    };
  }, [dispatch, newsData.lastFetched]);

  // Separate useEffect for keyword loading when user changes
  useEffect(() => {
    if (user && user.keywords && user.keywords.length > 0) {
      console.log('CompetitorPage - User changed, reloading keywords:', user.keywords);
      setKeywords(user.keywords);
    }
  }, [user]);

  // Show loading state for initial load or when data is being refreshed
  if (loading || newsData.isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <h3>Loading Competitor Analysis...</h3>
        <p>Analyzing competitor data and insights</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.error}>
        <h2>Access Denied</h2>
        <p>Please sign in to access competitor analysis.</p>
      </div>
    );
  }

  if (newsError) {
    return (
      <div className={styles.error}>
        <h2>Error Loading Data</h2>
        <p>{newsError.message || 'Failed to load competitor data'}</p>
      </div>
    );
  }

  // Debug logging
  console.log('CompetitorPage - Debug info:', {
    keywords: keywords,
    keywordsLength: keywords.length,
    selectedKeyword: selectedKeyword,
    articles: articles,
    articlesLength: articles?.length,
    user: user,
    userKeywords: user?.keywords
  });

  // Filter articles based on selected keyword
  const filteredArticles = selectedKeyword 
    ? articles.filter(article => 
        article.title?.toLowerCase().includes(selectedKeyword.toLowerCase()) ||
        article.description?.toLowerCase().includes(selectedKeyword.toLowerCase()) ||
        article.content?.toLowerCase().includes(selectedKeyword.toLowerCase())
      )
    : articles;

  // Calculate competitor insights
  const totalArticles = filteredArticles.length;
  const breakingNews = filteredArticles.filter(article => article.isBreaking).length;
  const sentimentBreakdown = {
    positive: filteredArticles.filter(article => article.sentiment === 'positive').length,
    negative: filteredArticles.filter(article => article.sentiment === 'negative').length,
    neutral: filteredArticles.filter(article => article.sentiment === 'neutral').length,
  };

  const topSources = filteredArticles.reduce((acc, article) => {
    const source = article.source || 'Unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSourcesArray = Object.entries(topSources)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h1>Competitor Analysis</h1>
            <p>Monitor competitor mentions and analyze market positioning</p>
          </div>
        </div>
      </div>

      {/* Keyword Filter */}
      <div className={styles.filterSection}>
        <div className={styles.filterBar}>
          <div className={styles.keywordSelector}>
            <Search className={styles.searchIcon} />
            <select
              value={selectedKeyword}
              onChange={(e) => setSelectedKeyword(e.target.value)}
              className={styles.keywordSelect}
            >
              <option value="">All Keywords</option>
              {keywords.map((keyword, index) => (
                <option key={index} value={keyword}>
                  {keyword}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filterInfo}>
            <span className={styles.filterLabel}>
              {selectedKeyword ? `Filtered by: ${selectedKeyword}` : 'Showing all competitor mentions'}
            </span>
          </div>
        </div>
      </div>

      {/* Competitor Insights */}
      <div className={styles.insightsGrid}>
        <div className={styles.insightCard}>
          <div className={styles.insightIcon}>
            <Target size={24} />
          </div>
          <div className={styles.insightContent}>
            <div className={styles.insightValue}>{totalArticles}</div>
            <div className={styles.insightLabel}>Total Mentions</div>
          </div>
        </div>
        
        <div className={styles.insightCard}>
          <div className={styles.insightIcon}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.insightContent}>
            <div className={styles.insightValue}>{breakingNews}</div>
            <div className={styles.insightLabel}>Breaking News</div>
          </div>
        </div>
        
        <div className={styles.insightCard}>
          <div className={styles.insightIcon}>
            <BarChart3 size={24} />
          </div>
          <div className={styles.insightContent}>
            <div className={styles.insightValue}>{sentimentBreakdown.positive}</div>
            <div className={styles.insightLabel}>Positive Mentions</div>
          </div>
        </div>
        
        <div className={styles.insightCard}>
          <div className={styles.insightIcon}>
            <Users size={24} />
          </div>
          <div className={styles.insightContent}>
            <div className={styles.insightValue}>{topSourcesArray.length}</div>
            <div className={styles.insightLabel}>Sources</div>
          </div>
        </div>
      </div>

      {/* Sentiment Analysis */}
      <div className={styles.sentimentSection}>
        <h2>Sentiment Analysis</h2>
        <div className={styles.sentimentGrid}>
          <div className={styles.sentimentItem}>
            <div className={styles.sentimentBar}>
              <div 
                className={styles.sentimentFillPositive} 
                style={{ width: `${(sentimentBreakdown.positive / totalArticles) * 100}%` }}
              ></div>
            </div>
            <span className={styles.sentimentLabel}>Positive ({sentimentBreakdown.positive})</span>
          </div>
          <div className={styles.sentimentItem}>
            <div className={styles.sentimentBar}>
              <div 
                className={styles.sentimentFillNeutral} 
                style={{ width: `${(sentimentBreakdown.neutral / totalArticles) * 100}%` }}
              ></div>
            </div>
            <span className={styles.sentimentLabel}>Neutral ({sentimentBreakdown.neutral})</span>
          </div>
          <div className={styles.sentimentItem}>
            <div className={styles.sentimentBar}>
              <div 
                className={styles.sentimentFillNegative} 
                style={{ width: `${(sentimentBreakdown.negative / totalArticles) * 100}%` }}
              ></div>
            </div>
            <span className={styles.sentimentLabel}>Negative ({sentimentBreakdown.negative})</span>
          </div>
        </div>
      </div>

      {/* Top Sources */}
      <div className={styles.sourcesSection}>
        <h2>Top Sources</h2>
        <div className={styles.sourcesList}>
          {topSourcesArray.map(([source, count], index) => (
            <div key={index} className={styles.sourceItem}>
              <div className={styles.sourceInfo}>
                <Building2 size={16} />
                <span className={styles.sourceName}>{source}</span>
              </div>
              <span className={styles.sourceCount}>{count} mentions</span>
            </div>
          ))}
        </div>
      </div>

      {/* Articles List */}
      <div className={styles.articlesSection}>
        <h2>Competitor Mentions</h2>
        {filteredArticles.length === 0 ? (
          <div className={styles.emptyState}>
            <Target className={styles.emptyIcon} />
            <h3>No Competitor Mentions Found</h3>
            <p>
              {selectedKeyword 
                ? `No mentions found for keyword "${selectedKeyword}"`
                : 'No competitor mentions available. Try collecting data first.'
              }
            </p>
          </div>
        ) : (
          <div className={styles.articlesGrid}>
            {filteredArticles.map((article, index) => (
              <div key={index} className={styles.articleCard}>
                <div className={styles.articleHeader}>
                  <div className={styles.articleMeta}>
                    <span className={styles.articleSource}>{article.source}</span>
                    <span className={styles.articleDate}>
                      <Calendar size={12} />
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.articleSentiment}>
                    <span className={`${styles.sentimentBadge} ${styles[article.sentiment]}`}>
                      {article.sentiment}
                    </span>
                  </div>
                </div>
                
                <h3 className={styles.articleTitle}>{article.title}</h3>
                <p className={styles.articleDescription}>{article.description}</p>
                
                <div className={styles.articleFooter}>
                  <div className={styles.articleActions}>
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.readMoreButton}
                    >
                      <ExternalLink size={14} />
                      Read More
                    </a>
                  </div>
                  <div className={styles.articleStats}>
                    <div className={styles.statItem}>
                      <Eye size={12} />
                      <span>{article.views || 0}</span>
                    </div>
                    <div className={styles.statItem}>
                      <MessageSquare size={12} />
                      <span>{article.comments || 0}</span>
                    </div>
                    <div className={styles.statItem}>
                      <Share2 size={12} />
                      <span>{article.shares || 0}</span>
                    </div>
                    <div className={styles.statItem}>
                      <Heart size={12} />
                      <span>{article.likes || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
