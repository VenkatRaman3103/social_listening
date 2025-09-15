'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Heart, MessageCircle, Share, Eye, Calendar, Hash, Filter } from 'lucide-react';
import { socialMonitoringService, SocialContent, SocialPlatform } from '../../../services/socialMonitoringService';
import styles from './page.module.scss';

interface AnalyticsData {
  totalPosts: number;
  totalEngagement: number;
  platformBreakdown: { platform: string; count: number; engagement: number }[];
  topHashtags: { hashtag: string; count: number }[];
  engagementTrend: { date: string; engagement: number }[];
  topContent: SocialContent[];
}

export default function SocialAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState('7d');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  // Mock data for demonstration - in real app, this would come from API
  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange, selectedPlatform]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAnalyticsData({
        totalPosts: 1247,
        totalEngagement: 45632,
        platformBreakdown: [
          { platform: 'TikTok', count: 456, engagement: 18234 },
          { platform: 'Instagram', count: 389, engagement: 15678 },
          { platform: 'Twitter', count: 234, engagement: 7890 },
          { platform: 'YouTube', count: 168, engagement: 3830 },
        ],
        topHashtags: [
          { hashtag: 'tesla', count: 234 },
          { hashtag: 'electric', count: 189 },
          { hashtag: 'innovation', count: 156 },
          { hashtag: 'technology', count: 134 },
          { hashtag: 'future', count: 98 },
        ],
        engagementTrend: [
          { date: '2024-01-01', engagement: 1200 },
          { date: '2024-01-02', engagement: 1800 },
          { date: '2024-01-03', engagement: 2100 },
          { date: '2024-01-04', engagement: 1900 },
          { date: '2024-01-05', engagement: 2500 },
          { date: '2024-01-06', engagement: 2800 },
          { date: '2024-01-07', engagement: 3200 },
        ],
        topContent: []
      });
      setIsLoading(false);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <BarChart3 className={styles.emptyIcon} />
          <h3>No Analytics Data</h3>
          <p>Start monitoring social media to see analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Social Analytics</h1>
          <p>Comprehensive insights into your social media performance</p>
        </div>
        <div className={styles.filters}>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <BarChart3 />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{analyticsData.totalPosts.toLocaleString()}</div>
            <div className={styles.metricLabel}>Total Posts</div>
            <div className={styles.metricChange}>
              <TrendingUp />
              +12.5%
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Heart />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{analyticsData.totalEngagement.toLocaleString()}</div>
            <div className={styles.metricLabel}>Total Engagement</div>
            <div className={styles.metricChange}>
              <TrendingUp />
              +8.3%
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Users />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>2.4K</div>
            <div className={styles.metricLabel}>Unique Creators</div>
            <div className={styles.metricChange}>
              <TrendingUp />
              +15.2%
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Eye />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>156K</div>
            <div className={styles.metricLabel}>Total Views</div>
            <div className={styles.metricChange}>
              <TrendingUp />
              +22.1%
            </div>
          </div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Platform Breakdown</h3>
            <Filter className={styles.filterIcon} />
          </div>
          <div className={styles.chartContent}>
            {analyticsData.platformBreakdown.map((platform, index) => (
              <div key={index} className={styles.platformItem}>
                <div className={styles.platformInfo}>
                  <div className={styles.platformName}>{platform.platform}</div>
                  <div className={styles.platformStats}>
                    {platform.count} posts • {platform.engagement.toLocaleString()} engagement
                  </div>
                </div>
                <div className={styles.platformBar}>
                  <div 
                    className={styles.platformFill}
                    style={{ width: `${(platform.count / Math.max(...analyticsData.platformBreakdown.map(p => p.count))) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Top Hashtags</h3>
            <Hash className={styles.filterIcon} />
          </div>
          <div className={styles.chartContent}>
            {analyticsData.topHashtags.map((hashtag, index) => (
              <div key={index} className={styles.hashtagItem}>
                <div className={styles.hashtagInfo}>
                  <span className={styles.hashtagName}>#{hashtag.hashtag}</span>
                  <span className={styles.hashtagCount}>{hashtag.count}</span>
                </div>
                <div className={styles.hashtagBar}>
                  <div 
                    className={styles.hashtagFill}
                    style={{ width: `${(hashtag.count / Math.max(...analyticsData.topHashtags.map(h => h.count))) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.engagementChart}>
        <div className={styles.chartHeader}>
          <h3>Engagement Trend</h3>
          <Calendar className={styles.filterIcon} />
        </div>
        <div className={styles.chartContent}>
          <div className={styles.trendChart}>
            {analyticsData.engagementTrend.map((point, index) => (
              <div key={index} className={styles.trendPoint}>
                <div 
                  className={styles.trendBar}
                  style={{ height: `${(point.engagement / Math.max(...analyticsData.engagementTrend.map(p => p.engagement))) * 100}%` }}
                ></div>
                <div className={styles.trendLabel}>
                  {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
