'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { setUser } from '@/lib/store/slices/userSlice';
import { useCollectNewsData } from '@/lib/hooks/useNewsSimple';
import { dataManager } from '../services/dataManager';
import { socialMonitoringService } from '../services/socialMonitoringService';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity, 
  Users, 
  Search, 
  Newspaper, 
  MessageSquare,
  Eye,
  Share2,
  Heart,
  Calendar,
  Clock,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { InteractiveGraphs } from './InteractiveGraphs';
import ExportButton from './ExportButton';
import { createDashboardAnalyticsExportData } from '@/utils/exportUtils';
import styles from './SleekDashboard.module.scss';

interface User {
  id: number;
  name: string;
  email: string;
  plan: string;
  status: string;
  keywords?: string[];
}

export function SleekDashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const { articles, loading, error } = useAppSelector((state) => state.news);
  
  const [keywords, setKeywords] = useState<string[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  
  const collectNewsData = useCollectNewsData();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      
      // Update Redux store with user data
      dispatch(setUser(parsedUser));
      
      // Extract keywords from user data
      if (parsedUser.keywords && parsedUser.keywords.length > 0) {
        setKeywords(parsedUser.keywords);
      }
    }
    setPageLoading(false);
  }, [dispatch]);

  const handleCollectData = async () => {
    if (user) {
      try {
        console.log('Starting data collection for both news and social...');
        
        // Collect news data
        await collectNewsData.mutateAsync(user.id);
        
        // Collect social data for all keywords
        if (user.keywords && user.keywords.length > 0) {
          console.log('Collecting social data for keywords:', user.keywords);
          
          for (const keyword of user.keywords) {
            try {
              console.log(`Collecting social data for keyword: ${keyword}`);
              const result = await socialMonitoringService.searchKeywordAcrossAllPlatforms(keyword);
              
              // Store social data
              const socialData = {
                keyword: keyword,
                results: result.results,
                errors: result.errors,
                timestamp: new Date().toISOString()
              };
              localStorage.setItem('socialListeningData', JSON.stringify(socialData));
              
              console.log(`Social data collected for ${keyword}:`, result.results.length, 'results');
            } catch (error) {
              console.error(`Failed to collect social data for keyword ${keyword}:`, error);
            }
          }
        }
        
        // Refresh all data in the data manager
        await dataManager.refreshAllData();
        
        console.log('Data collection completed successfully');
      } catch (error) {
        console.error('Failed to collect data:', error);
      }
    }
  };

  // Calculate metrics
  const totalArticles = articles.length;
  const breakingNews = articles.filter(article => article.isBreaking).length;
  const sentimentBreakdown = {
    positive: articles.filter(article => (article.sentimentScore || 0) > 10).length,
    negative: articles.filter(article => (article.sentimentScore || 0) < -10).length,
    neutral: articles.filter(article => 
      (article.sentimentScore || 0) >= -10 && (article.sentimentScore || 0) <= 10
    ).length
  };

  const uniqueSources = [...new Set(articles.map(article => article.sourceName))];
  const totalEngagement = articles.reduce((sum, article) => {
    const engagement = article.engagement || {};
    return sum + (engagement.views || 0) + (engagement.shares || 0) + (engagement.comments || 0);
  }, 0);

  const avgSentiment = articles.length > 0 
    ? articles.reduce((sum, article) => sum + (article.sentimentScore || 0), 0) / articles.length 
    : 0;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getSentimentIcon = (score: number) => {
    if (score > 10) return <TrendingUp className={styles.positiveIcon} />;
    if (score < -10) return <TrendingDown className={styles.negativeIcon} />;
    return <Minus className={styles.neutralIcon} />;
  };

  const getSentimentColor = (score: number) => {
    if (score > 10) return '#10b981';
    if (score < -10) return '#ef4444';
    return '#6b7280';
  };

  if (pageLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.title}>Welcome back, {user?.name || 'User'}!</h1>
            <p className={styles.subtitle}>Here's what's happening with your reputation monitoring</p>
          </div>
          <div className={styles.headerActions}>
            <ExportButton
              data={createDashboardAnalyticsExportData([
                { metric: 'Total Articles', value: totalArticles, change: '+12%', trend: 'up', category: 'Content', timestamp: new Date().toISOString() },
                { metric: 'Keywords Monitored', value: keywords.length, change: '+2', trend: 'up', category: 'Keywords', timestamp: new Date().toISOString() },
                { metric: 'Social Mentions', value: 0, change: '0%', trend: 'stable', category: 'Social', timestamp: new Date().toISOString() },
                { metric: 'Sentiment Score', value: 0, change: '0%', trend: 'stable', category: 'Analytics', timestamp: new Date().toISOString() }
              ])}
              variant="outline"
              size="medium"
              showLabel={true}
            />
            <button 
              onClick={handleCollectData}
              disabled={collectNewsData.isPending}
              className={styles.collectButton}
            >
              <Zap size={20} />
              {collectNewsData.isPending ? 'Collecting...' : 'Collect New Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Newspaper size={24} />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{totalArticles}</div>
            <div className={styles.metricLabel}>Total Articles</div>
            <div className={styles.metricChange}>
              <ArrowUpRight size={16} />
              <span>+12% from last week</span>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Target size={24} />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{keywords.length}</div>
            <div className={styles.metricLabel}>Keywords Monitored</div>
            <div className={styles.metricChange}>
              <ArrowUpRight size={16} />
              <span>+2 this month</span>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Activity size={24} />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{formatNumber(totalEngagement)}</div>
            <div className={styles.metricLabel}>Total Engagement</div>
            <div className={styles.metricChange}>
              <ArrowUpRight size={16} />
              <span>+8% from last week</span>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <BarChart3 size={24} />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{avgSentiment.toFixed(1)}</div>
            <div className={styles.metricLabel}>Avg Sentiment</div>
            <div className={styles.metricChange}>
              {avgSentiment > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span>{avgSentiment > 0 ? 'Positive' : 'Negative'} trend</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Graphs Section */}
      <div className={styles.graphsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Data Analytics & Insights</h2>
          <BarChart3 size={24} />
        </div>
        <InteractiveGraphs articles={articles} keywords={keywords} />
      </div>

      {/* Recent Activity */}
      <div className={styles.activitySection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Recent Activity</h3>
          <Calendar size={20} />
        </div>
        <div className={styles.activityGrid}>
          {articles.slice(0, 6).map((article, index) => (
            <div key={article.id} className={styles.activityCard}>
              <div className={styles.activityIcon}>
                {getSentimentIcon(article.sentimentScore || 0)}
              </div>
              <div className={styles.activityContent}>
                <h4 className={styles.activityTitle}>{article.title}</h4>
                <div className={styles.activityMeta}>
                  <span className={styles.activitySource}>{article.sourceName}</span>
                  <span className={styles.activityTime}>
                    <Clock size={14} />
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className={styles.activityEngagement}>
                  <span><Eye size={14} /> {formatNumber(article.engagement?.views || 0)}</span>
                  <span><Share2 size={14} /> {formatNumber(article.engagement?.shares || 0)}</span>
                  <span><MessageSquare size={14} /> {formatNumber(article.engagement?.comments || 0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Keywords Status */}
      <div className={styles.keywordsSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Keywords Status</h3>
          <Search size={20} />
        </div>
        <div className={styles.keywordsGrid}>
          {keywords.map((keyword, index) => (
            <div key={keyword} className={styles.keywordCard}>
              <div className={styles.keywordIcon}>
                <Search size={16} />
              </div>
              <span className={styles.keywordText}>{keyword}</span>
              <div className={styles.keywordStatus}>
                <div className={styles.statusDot}></div>
                <span>Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
