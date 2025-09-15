'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw, Play, Pause, Heart, MessageCircle, Share, Eye, Calendar, Hash, User, ExternalLink, Monitor } from 'lucide-react';
import { socialMonitoringService, SocialContent, SocialPlatform } from '../../../services/socialMonitoringService';
import { useSelector } from 'react-redux';
import { RootState } from '../../../lib/store';
import { dataManager } from '../../../services/dataManager';
import RefreshButton from '../../../components/RefreshButton';
import styles from './page.module.scss';

interface SearchResult {
  platform: SocialPlatform;
  content: SocialContent[];
  keyword?: string;
}

interface Keyword {
  id: number;
  userId: number;
  keyword: string;
  createdAt: string;
}

export default function SocialListeningPage() {
  const { user } = useSelector((state: RootState) => state.user);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [errors, setErrors] = useState<{ platform: SocialPlatform; error: string }[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'engagement' | 'platform'>('date');
  const [loadingKeywords, setLoadingKeywords] = useState(true);
  const [socialData, setSocialData] = useState(dataManager.getSocialData());

  useEffect(() => {
    // Subscribe to social data updates
    const handleSocialUpdate = (data: any) => {
      setSocialData(data);
      if (data.results && data.results.length > 0) {
        setSearchResults(data.results);
      }
      if (data.errors && data.errors.length > 0) {
        setErrors(data.errors);
      }
    };

    dataManager.subscribe('social', handleSocialUpdate);
    loadPlatforms();

    // Cleanup subscription
    return () => {
      dataManager.unsubscribe('social', handleSocialUpdate);
    };
  }, []);

  useEffect(() => {
    if (user) {
      loadKeywords();
    }
  }, [user]);

  const loadPlatforms = async () => {
    try {
      const platformsData = await socialMonitoringService.getWorkPlatforms();
      setPlatforms(platformsData.filter(p => p.category === 'SOCIAL' && p.status === 'ACTIVE'));
    } catch (error) {
      console.error('Failed to load platforms:', error);
    }
  };

  const loadKeywords = async () => {
    try {
      setLoadingKeywords(true);
      console.log('Loading keywords...');
      
      // First, try to use keywords from Redux store (which is working)
      if (user?.keywords && user.keywords.length > 0) {
        console.log('Using keywords from Redux store:', user.keywords);
        const reduxKeywords = user.keywords.map((keyword: string, index: number) => ({
          id: index + 1,
          userId: user.id,
          keyword: keyword,
          createdAt: new Date().toISOString()
        }));
        setKeywords(reduxKeywords);
        setLoadingKeywords(false);
        return;
      }
      
      // Fallback: try API call
      const response = await fetch('/api/keywords', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Keywords API response status:', response.status);
      
      if (response.ok) {
        const keywordsData = await response.json();
        console.log('Keywords loaded from API:', keywordsData);
        setKeywords(keywordsData);
      } else {
        const errorData = await response.json();
        console.error('Failed to load keywords:', errorData);
        
        // Final fallback: try to get keywords from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.keywords && parsedUser.keywords.length > 0) {
            console.log('Using keywords from localStorage as fallback:', parsedUser.keywords);
            const fallbackKeywords = parsedUser.keywords.map((keyword: string, index: number) => ({
              id: index + 1,
              userId: parsedUser.id,
              keyword: keyword,
              createdAt: new Date().toISOString()
            }));
            setKeywords(fallbackKeywords);
          }
        }
      }
    } catch (error) {
      console.error('Error loading keywords:', error);
      
      // Final fallback: try to get keywords from localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.keywords && parsedUser.keywords.length > 0) {
          console.log('Using keywords from localStorage as fallback:', parsedUser.keywords);
          const fallbackKeywords = parsedUser.keywords.map((keyword: string, index: number) => ({
            id: index + 1,
            userId: parsedUser.id,
            keyword: keyword,
            createdAt: new Date().toISOString()
          }));
          setKeywords(fallbackKeywords);
        }
      }
    } finally {
      setLoadingKeywords(false);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchResults([]);
    setErrors([]);

    try {
      let allResults: SearchResult[] = [];
      let allErrors: { platform: SocialPlatform; error: string }[] = [];

      // If a specific keyword is selected, search only that keyword
      if (selectedKeyword.trim()) {
        const result = await socialMonitoringService.searchKeywordAcrossAllPlatforms(selectedKeyword.trim());
        allResults = result.results;
        allErrors = result.errors;
      } else {
        // If no keyword selected, search all keywords
        if (keywords.length === 0) {
          throw new Error('No keywords available to search');
        }

        for (const keyword of keywords) {
          try {
            console.log(`Searching for keyword: ${keyword.keyword}`);
            const result = await socialMonitoringService.searchKeywordAcrossAllPlatforms(keyword.keyword);
            
            // Add keyword info to results
            const keywordResults = result.results.map(searchResult => ({
              ...searchResult,
              keyword: keyword.keyword
            }));
            
            allResults = [...allResults, ...keywordResults];
            allErrors = [...allErrors, ...result.errors];
            
            // Add delay between keyword searches to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (error) {
            console.error(`Failed to search keyword ${keyword.keyword}:`, error);
            allErrors.push({ 
              platform: { id: 'general', name: 'General' } as SocialPlatform, 
              error: `Failed to search keyword: ${keyword.keyword}` 
            });
          }
        }
      }

      setSearchResults(allResults);
      setErrors(allErrors);
      
      // Store social listening data for hashtag tracking
      const socialData = {
        keyword: selectedKeyword.trim() || 'all',
        results: allResults,
        errors: allErrors,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('socialListeningData', JSON.stringify(socialData));
      
      // Update data manager
      dataManager.setSocialData({
        results: allResults,
        errors: allErrors,
        lastFetched: new Date().toISOString(),
        isLoading: false,
        error: null
      });
      
      if (allErrors.length > 0) {
        console.warn('Some platforms failed:', allErrors);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setErrors([{ platform: { id: 'general', name: 'General' } as SocialPlatform, error: 'Search failed. Please try again.' }]);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredResults = searchResults.filter(result => 
    selectedPlatform === 'all' || result.platform.id === selectedPlatform
  );

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.content[0]?.published_at || 0).getTime() - new Date(a.content[0]?.published_at || 0).getTime();
      case 'engagement':
        const aEngagement = a.content.reduce((sum, item) => sum + (item.engagement.like_count || 0) + (item.engagement.comment_count || 0) + (item.engagement.share_count || 0), 0);
        const bEngagement = b.content.reduce((sum, item) => sum + (item.engagement.like_count || 0) + (item.engagement.comment_count || 0) + (item.engagement.share_count || 0), 0);
        return bEngagement - aEngagement;
      case 'platform':
        return a.platform.name.localeCompare(b.platform.name);
      default:
        return 0;
    }
  });

  const totalContent = searchResults.reduce((sum, result) => sum + result.content.length, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.headerText}>
                <h1>Social Listening</h1>
                <p>Monitor social media mentions and engagement across all available platforms</p>
              </div>
            </div>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <div className={styles.keywordSelector}>
            <Search className={styles.searchIcon} />
            <select
              value={selectedKeyword}
              onChange={(e) => setSelectedKeyword(e.target.value)}
              className={styles.keywordSelect}
              disabled={isSearching || loadingKeywords}
            >
              <option value="">
                {loadingKeywords ? 'Loading keywords...' : 'All Keywords'}
              </option>
              {keywords.map((keyword) => (
                <option key={keyword.id} value={keyword.keyword}>
                  {keyword.keyword}
                </option>
              ))}
            </select>
          </div>
          <button 
            className={styles.searchButton}
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <RefreshCw className={styles.spinner} />
            ) : (
              <Search />
            )}
            {isSearching ? 'Searching...' : 'Search All Keywords'}
          </button>
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>Platform</label>
            <select 
              value={selectedPlatform} 
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Platforms</option>
              {platforms.map(platform => (
                <option key={platform.id} value={platform.id}>
                  {platform.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label>Sort By</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className={styles.filterSelect}
            >
              <option value="date">Date</option>
              <option value="engagement">Engagement</option>
              <option value="platform">Platform</option>
            </select>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className={styles.errorSection}>
          <h3>Platform Status Summary</h3>
          <div className={styles.statusSummary}>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>✅ Working Platforms:</span>
              <span className={styles.statusValue}>{searchResults.length}</span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>❌ Failed Platforms:</span>
              <span className={styles.statusValue}>{errors.length}</span>
            </div>
          </div>
          
          {errors.length > 0 && (
            <details className={styles.errorDetails}>
              <summary>View Failed Platforms ({errors.length})</summary>
              <div className={styles.errorList}>
                {errors.map((error, index) => (
                  <div key={index} className={styles.errorItem}>
                    <span className={styles.errorPlatform}>{error.platform.name}:</span>
                    <span className={styles.errorMessage}>{error.error}</span>
                  </div>
                ))}
              </div>
              <div className={styles.errorNote}>
                <p>
                  <strong>Rate limit errors (429):</strong> Too many requests - will resolve automatically<br/>
                  <strong>Not found errors (404):</strong> Platform may not be available or endpoint not found<br/>
                  <strong>Bad request errors (400):</strong> Platform may have different API requirements
                </p>
              </div>
            </details>
          )}
        </div>
      )}

      {searchResults.length > 0 && (
        <div className={styles.resultsHeader}>
          <div className={styles.resultsStats}>
            <h2>Search Results</h2>
            <span className={styles.resultsCount}>
              {totalContent} posts across {searchResults.length} platforms
            </span>
          </div>
          <button className={styles.exportButton}>
            <Download />
            Export Results
          </button>
        </div>
      )}

      <div className={styles.results}>
        {sortedResults.map((result, index) => (
          <div key={index} className={styles.platformSection}>
            <div className={styles.platformHeader}>
              <div className={styles.platformInfo}>
                <img 
                  src={result.platform.logo_url} 
                  alt={result.platform.name}
                  className={styles.platformLogo}
                />
                <div>
                  <h3>{result.platform.name}</h3>
                  {result.keyword && (
                    <span className={styles.keywordTag}>#{result.keyword}</span>
                  )}
                  <span className={styles.postCount}>{result.content.length} posts</span>
                </div>
              </div>
            </div>

            <div className={styles.contentGrid}>
              {result.content.map((item, itemIndex) => (
                <div key={itemIndex} className={styles.contentCard}>
                  <div className={styles.contentHeader}>
                    <div className={styles.profileInfo}>
                      <div className={styles.profileAvatar}>
                        {item.profile.image_url ? (
                          <img src={item.profile.image_url} alt={item.profile.platform_username} />
                        ) : (
                          <User />
                        )}
                      </div>
                      <div>
                        <div className={styles.username}>@{item.profile.platform_username}</div>
                        <div className={styles.publishDate}>
                          <Calendar />
                          {new Date(item.published_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.externalLink}
                    >
                      <ExternalLink />
                    </a>
                  </div>

                  <div className={styles.contentBody}>
                    <h4 className={styles.contentTitle}>{item.title}</h4>
                    <p className={styles.contentDescription}>{item.description}</p>
                    
                    {item.hashtags && item.hashtags.length > 0 && (
                      <div className={styles.hashtags}>
                        {item.hashtags.map((hashtag, tagIndex) => (
                          <span key={tagIndex} className={styles.hashtag}>
                            <Hash />
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {item.thumbnail_url && (
                    <div className={styles.mediaContainer}>
                      <img 
                        src={item.thumbnail_url} 
                        alt="Content thumbnail"
                        className={styles.thumbnail}
                      />
                      {item.format === 'VIDEO' && (
                        <div className={styles.playButton}>
                          <Play />
                        </div>
                      )}
                    </div>
                  )}

                  <div className={styles.engagement}>
                    <div className={styles.engagementItem}>
                      <Heart />
                      <span>{(item.engagement.like_count || 0).toLocaleString()}</span>
                    </div>
                    <div className={styles.engagementItem}>
                      <MessageCircle />
                      <span>{(item.engagement.comment_count || 0).toLocaleString()}</span>
                    </div>
                    <div className={styles.engagementItem}>
                      <Share />
                      <span>{(item.engagement.share_count || 0).toLocaleString()}</span>
                    </div>
                    <div className={styles.engagementItem}>
                      <Eye />
                      <span>{(item.engagement.view_count || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

        {loadingKeywords ? (
          <div className={styles.emptyState}>
            <RefreshCw className={`${styles.emptyIcon} ${styles.spinning}`} />
            <h3>Loading Keywords...</h3>
            <p>Please wait while we load your keywords.</p>
          </div>
        ) : keywords.length === 0 ? (
          <div className={styles.emptyState}>
            <Monitor className={styles.emptyIcon} />
            <h3>No Keywords Available</h3>
            <p>You need to add keywords first. Go to the Keywords page to add keywords for monitoring.</p>
            <button 
              className={styles.goToKeywordsButton}
              onClick={() => window.location.href = '/dashboard/keywords'}
            >
              Go to Keywords
            </button>
          </div>
        ) : searchResults.length === 0 && !isSearching ? (
          <div className={styles.emptyState}>
            <Monitor className={styles.emptyIcon} />
            <h3>Start Social Listening</h3>
            <p>Select a keyword from your list to begin monitoring social media mentions across all available platforms</p>
          </div>
        ) : null}
    </div>
  );
}
