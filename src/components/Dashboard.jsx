import React, { useState, useEffect } from 'react';
import { AnalyticsService } from '../services';
import { SubscriptionService } from '../services/SubscriptionService';
import { StorageService } from '../services/StorageService';
import './Dashboard.css';

const Dashboard = ({ subscriptionInfo, onNavigate }) => {
  const [analytics, setAnalytics] = useState({
    totalInvoices: 0,
    totalReceipts: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    recentDocuments: [],
    monthlyTrend: []
  });

  const [timeFilter, setTimeFilter] = useState('month'); // week, month, year
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [timeFilter]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const history = StorageService.getHistory();
      const now = new Date();
      const filterDate = getFilterDate(timeFilter);
      
      const filteredHistory = history.filter(doc => 
        new Date(doc.createdAt) >= filterDate
      );

      const invoices = filteredHistory.filter(doc => doc.type === 'invoice');
      const receipts = filteredHistory.filter(doc => doc.type === 'receipt');
      
      const totalRevenue = filteredHistory.reduce((sum, doc) => sum + (doc.amount || 0), 0);
      
      // Get recent documents (last 5)
      const recentDocuments = history
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // Generate monthly trend data
      const monthlyTrend = generateMonthlyTrend(history);

      setAnalytics({
        totalInvoices: invoices.length,
        totalReceipts: receipts.length,
        totalRevenue,
        monthlyRevenue: getTotalForCurrentMonth(history),
        recentDocuments,
        monthlyTrend
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilterDate = (filter) => {
    const now = new Date();
    switch (filter) {
      case 'week':
        return new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1));
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return new Date(now.setMonth(now.getMonth() - 1));
    }
  };

  const getTotalForCurrentMonth = (history) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return history
      .filter(doc => {
        const docDate = new Date(doc.createdAt);
        return docDate.getMonth() === currentMonth && 
               docDate.getFullYear() === currentYear;
      })
      .reduce((sum, doc) => sum + (doc.amount || 0), 0);
  };

  const generateMonthlyTrend = (history) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthData = history
        .filter(doc => {
          const docDate = new Date(doc.createdAt);
          return docDate.getMonth() === date.getMonth() && 
                 docDate.getFullYear() === date.getFullYear();
        });
      
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        invoices: monthData.filter(doc => doc.type === 'invoice').length,
        receipts: monthData.filter(doc => doc.type === 'receipt').length,
        revenue: monthData.reduce((sum, doc) => sum + (doc.amount || 0), 0)
      });
    }
    
    return months;
  };

  const getUsagePercentage = (used, limit) => {
    if (limit === Infinity) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return '#ef4444';
    if (percentage >= 75) return '#f59e0b';
    return '#10b981';
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-title-skeleton loading"></div>
          <div className="dashboard-filters-skeleton loading"></div>
        </div>
        <div className="dashboard-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="stat-card loading">
              <div className="stat-skeleton"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1 className="dashboard-title">
            <span className="dashboard-icon">📊</span>
            Dashboard
          </h1>
          <p className="dashboard-subtitle">
            Track your business performance at a glance
          </p>
        </div>
        
        <div className="dashboard-filters">
          <div className="filter-group">
            <label className="filter-label">Time Period:</label>
            <select 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="dashboard-grid">
        {/* Documents Created */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon documents">📄</div>
            <div className="stat-info">
              <h3 className="stat-title">Documents Created</h3>
              <div className="stat-value">
                {analytics.totalInvoices + analytics.totalReceipts}
              </div>
            </div>
          </div>
          <div className="stat-breakdown">
            <div className="breakdown-item">
              <span className="breakdown-label">Invoices</span>
              <span className="breakdown-value">{analytics.totalInvoices}</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Receipts</span>
              <span className="breakdown-value">{analytics.totalReceipts}</span>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon revenue">💰</div>
            <div className="stat-info">
              <h3 className="stat-title">Total Revenue</h3>
              <div className="stat-value">
                ${analytics.totalRevenue.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="stat-detail">
            This {timeFilter === 'week' ? 'week' : timeFilter === 'month' ? 'month' : 'year'}
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon monthly">📈</div>
            <div className="stat-info">
              <h3 className="stat-title">This Month</h3>
              <div className="stat-value">
                ${analytics.monthlyRevenue.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="stat-detail">
            Current month earnings
          </div>
        </div>

        {/* Usage Limits */}
        <div className="stat-card usage-card">
          <div className="stat-header">
            <div className="stat-icon usage">⚡</div>
            <div className="stat-info">
              <h3 className="stat-title">Plan Usage</h3>
              <div className="stat-value">
                {subscriptionInfo.plan.toUpperCase()}
              </div>
            </div>
          </div>
          <div className="usage-bars">
            <div className="usage-item">
              <div className="usage-label">
                <span>Invoices</span>
                <span>{subscriptionInfo.usage.invoice}/{subscriptionInfo.limits.invoice === Infinity ? '∞' : subscriptionInfo.limits.invoice}</span>
              </div>
              <div className="usage-bar">
                <div 
                  className="usage-fill"
                  style={{
                    width: `${getUsagePercentage(subscriptionInfo.usage.invoice, subscriptionInfo.limits.invoice)}%`,
                    backgroundColor: getUsageColor(getUsagePercentage(subscriptionInfo.usage.invoice, subscriptionInfo.limits.invoice))
                  }}
                ></div>
              </div>
            </div>
            <div className="usage-item">
              <div className="usage-label">
                <span>Receipts</span>
                <span>{subscriptionInfo.usage.receipt}/{subscriptionInfo.limits.receipt === Infinity ? '∞' : subscriptionInfo.limits.receipt}</span>
              </div>
              <div className="usage-bar">
                <div 
                  className="usage-fill"
                  style={{
                    width: `${getUsagePercentage(subscriptionInfo.usage.receipt, subscriptionInfo.limits.receipt)}%`,
                    backgroundColor: getUsageColor(getUsagePercentage(subscriptionInfo.usage.receipt, subscriptionInfo.limits.receipt))
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Monthly Trend */}
      <div className="dashboard-lower-grid">
        {/* Recent Documents */}
        <div className="dashboard-section recent-documents">
          <div className="section-header">
            <h2 className="section-title">Recent Documents</h2>
            <button 
              className="section-action"
              onClick={() => onNavigate('history')}
            >
              View All →
            </button>
          </div>
          <div className="recent-list">
            {analytics.recentDocuments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p>No documents created yet</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => onNavigate('invoice')}
                >
                  Create Your First Invoice
                </button>
              </div>
            ) : (
              analytics.recentDocuments.map((doc, index) => (
                <div key={doc.id || index} className="recent-item">
                  <div className="recent-icon">
                    {doc.type === 'invoice' ? '📄' : '🧾'}
                  </div>
                  <div className="recent-details">
                    <div className="recent-title">{doc.filename}</div>
                    <div className="recent-meta">
                      <span className="recent-client">{doc.clientName || 'No client'}</span>
                      <span className="recent-amount">${(doc.amount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="recent-date">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="dashboard-section trend-chart">
          <div className="section-header">
            <h2 className="section-title">6-Month Trend</h2>
          </div>
          <div className="chart-container">
            <div className="chart-grid">
              {analytics.monthlyTrend.map((month, index) => {
                const maxValue = Math.max(...analytics.monthlyTrend.map(m => m.invoices + m.receipts));
                const height = maxValue === 0 ? 5 : ((month.invoices + month.receipts) / maxValue) * 100;
                
                return (
                  <div key={index} className="chart-bar-container">
                    <div className="chart-tooltip">
                      <div className="tooltip-content">
                        <div className="tooltip-month">{month.month}</div>
                        <div className="tooltip-stats">
                          <div>📄 {month.invoices} invoices</div>
                          <div>🧾 {month.receipts} receipts</div>
                          <div>💰 ${month.revenue.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                    <div className="chart-bar">
                      <div 
                        className="chart-bar-fill"
                        style={{ height: `${Math.max(height, 5)}%` }}
                      ></div>
                    </div>
                    <div className="chart-label">{month.month}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="action-grid">
          <button 
            className="action-card"
            onClick={() => onNavigate('invoice')}
          >
            <div className="action-icon">📄</div>
            <div className="action-title">Create Invoice</div>
            <div className="action-subtitle">Generate a new invoice</div>
          </button>
          
          <button 
            className="action-card"
            onClick={() => onNavigate('receipt')}
          >
            <div className="action-icon">🧾</div>
            <div className="action-title">Create Receipt</div>
            <div className="action-subtitle">Generate a new receipt</div>
          </button>
          
          <button 
            className="action-card"
            onClick={() => onNavigate('drafts')}
          >
            <div className="action-icon">💾</div>
            <div className="action-title">View Drafts</div>
            <div className="action-subtitle">Continue saved work</div>
          </button>
          
          <button 
            className="action-card"
            onClick={() => onNavigate('history')}
          >
            <div className="action-icon">📋</div>
            <div className="action-title">View History</div>
            <div className="action-subtitle">Browse past documents</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
