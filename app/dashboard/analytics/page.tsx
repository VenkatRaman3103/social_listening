'use client';

import { useState, useEffect } from 'react';
import { DataVisualization } from '@/components/DataVisualization';
import styles from './page.module.scss';

interface Keyword {
  id: number;
  keyword: string;
  createdAt: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  plan: string;
  status: string;
  keywords?: string[];
}

interface MonitoringData {
  keyword: string;
  newsData: any;
  socialData: any;
  timestamp: string;
}

export default function AnalyticsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [monitoringData, setMonitoringData] = useState<MonitoringData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Convert keywords from user data to keyword objects for display
      if (parsedUser.keywords && parsedUser.keywords.length > 0) {
        const keywordObjects = parsedUser.keywords.map((keyword: string, index: number) => ({
          id: index + 1,
          keyword: keyword,
          createdAt: new Date().toISOString()
        }));
        setKeywords(keywordObjects);
      }
    }
    
    fetchMonitoringData();
    setLoading(false);
  }, []);

  const fetchMonitoringData = async () => {
    try {
      if (!user) return;

      const token = btoa(JSON.stringify({ userId: user.id }));

      const response = await fetch('/api/data/monitoring', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMonitoringData(data.monitoringData || []);
      }
    } catch (err) {
      console.error('Error fetching monitoring data:', err);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.error}>
        <h2>Access Denied</h2>
        <p>Please sign in to access analytics.</p>
      </div>
    );
  }

  if (monitoringData.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>No Data Available</h2>
        <p>Collect some data first to see analytics and insights.</p>
        <a href="/dashboard" className={styles.collectButton}>
          Go to Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className={styles.analyticsPage}>
      <DataVisualization 
        monitoringData={monitoringData} 
        keywords={keywords.map(k => k.keyword)} 
      />
    </div>
  );
}