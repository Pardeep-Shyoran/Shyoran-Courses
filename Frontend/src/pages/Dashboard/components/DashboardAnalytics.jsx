import React, { useState, useEffect } from 'react'
import { getLearningAnalytics, getAIStudyInsights } from '../../../services/api'
import styles from './DashboardAnalytics.module.css'

const DashboardAnalytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [aiInsights, setAiInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Interactive Controls
  const [velocityRange, setVelocityRange] = useState(7) // 7 or 14 days
  const [copiedTip, setCopiedTip] = useState(false)

  const fetchAnalyticsData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getLearningAnalytics()
      setAnalytics(data)
      try {
        const insights = await getAIStudyInsights()
        setAiInsights(insights)
      } catch (err) {
        console.warn('Initial AI insights fallback:', err)
      }
    } catch (err) {
      console.error('Failed to load learning analytics:', err)
      setError('Could not load learning analytics data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const handleRefreshAiInsights = async () => {
    setAiLoading(true)
    try {
      const insights = await getAIStudyInsights()
      setAiInsights(insights)
    } catch (err) {
      alert(err.message || 'Failed to refresh AI study insights.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleCopyTip = () => {
    if (!aiInsights?.recommendation) return
    navigator.clipboard.writeText(aiInsights.recommendation)
    setCopiedTip(true)
    setTimeout(() => setCopiedTip(false), 2500)
  }

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Analyzing learning velocity & activity patterns...</p>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Synthesizing activity heatmaps and AI recommendations</span>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className={styles.errorState}>
        <p>{error || 'Analytics unavailable.'}</p>
        <button onClick={fetchAnalyticsData} className={styles.btnRetry}>Retry Analytics</button>
      </div>
    )
  }

  // Active trend list depending on range filter (7 vs 14 days)
  const activeTrendList = velocityRange === 14 ? (analytics.fullVelocityTrend || []) : (analytics.velocityTrend || [])
  const maxVelocityCount = Math.max(1, ...activeTrendList.map(d => d.count))

  // Goal Progress Circle Calculations
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const strokeOffset = circumference - (Math.min(100, analytics.goalCompletionRate) / 100) * circumference

  // Total estimated watch hours
  const totalWatchHours = ((analytics.totalCompletedVideos || 0) * 15 / 60).toFixed(1)

  return (
    <div className={styles.container}>
      {/* Header & AI Action Banner */}
      <div className={styles.analyticsHeader}>
        <div className={styles.headerTitleGroup}>
          <div className={styles.analyticsBadge}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
            <span>Learning Intelligence & Velocity</span>
          </div>
          <h2 className={styles.headerTitle}>Learning Analytics & Study Insights</h2>
          <p className={styles.headerSubtitle}>Real-time measurement of completion speed, category coverage, and AI productivity tips.</p>
        </div>

        <button 
          onClick={handleRefreshAiInsights} 
          disabled={aiLoading} 
          className={styles.btnRefreshAi}
          title="Re-run AI Study Coach analysis"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
          </svg>
          <span>{aiLoading ? 'AI Analyzing...' : 'Refresh AI Coach'}</span>
        </button>
      </div>

      {/* Top KPI Cards Grid */}
      <div className={styles.kpiGrid}>
        {/* 1. Weekly Velocity Card */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <div className={styles.kpiIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polyline>
              </svg>
            </div>
            {analytics.velocityChangePercent !== 0 && (
              <span className={`${styles.kpiTrendBadge} ${analytics.velocityChangePercent > 0 ? styles.positive : styles.neutral}`}>
                {analytics.velocityChangePercent > 0 ? `+${analytics.velocityChangePercent}%` : `${analytics.velocityChangePercent}%`} vs prev week
              </span>
            )}
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>7-Day Velocity</span>
            <span className={styles.kpiValue}>{analytics.currentWeekCompletions} <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>lessons</span></span>
            <span className={styles.kpiSubtext}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Daily Avg: {analytics.dailyAverageVelocity} lessons / day</span>
            </span>
          </div>
        </div>

        {/* 2. Peak Focus Window */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <div className={styles.kpiIcon} style={{ background: 'rgba(245, 158, 11, 0.14)', color: '#f59e0b' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <span className={`${styles.kpiTrendBadge} ${styles.positive}`}>Optimal Window</span>
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Peak Focus Time</span>
            <span className={styles.kpiValue} style={{ fontSize: '1.25rem' }}>{analytics.peakTimeSlot}</span>
            <span className={styles.kpiSubtext}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
              </svg>
              <span>Highest focus & activity density</span>
            </span>
          </div>
        </div>

        {/* 3. Top Category */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <div className={styles.kpiIcon} style={{ background: 'rgba(168, 85, 247, 0.14)', color: '#a855f7' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <span className={`${styles.kpiTrendBadge} ${styles.neutral}`}>Top Skill</span>
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Primary Category</span>
            <span className={styles.kpiValue} style={{ fontSize: '1.35rem' }}>{analytics.topCategory}</span>
            <span className={styles.kpiSubtext}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>{analytics.totalCompletedVideos} video lessons completed</span>
            </span>
          </div>
        </div>

        {/* 4. Weekly Goal Progress Ring */}
        <div className={styles.kpiCard}>
          <div className={styles.goalRingWrapper}>
            <svg className={styles.svgRing} viewBox="0 0 50 50">
              <circle className={styles.ringBg} cx="25" cy="25" r={radius} />
              <circle 
                className={styles.ringFg} 
                cx="25" 
                cy="25" 
                r={radius} 
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
              />
            </svg>
            <div className={styles.kpiContent}>
              <span className={styles.kpiLabel}>Weekly Goal ({analytics.goalCompletionRate}%)</span>
              <span className={styles.kpiValue} style={{ fontSize: '1.4rem' }}>{analytics.currentWeekCompletions} / {analytics.targetWeeklyLessons}</span>
              <span className={styles.kpiSubtext}>{analytics.consistencyIndex}% weekly active consistency</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Study Coach Banner */}
      {aiInsights && (
        <div className={styles.aiCoachCard}>
          <div className={styles.aiCoachHeader}>
            <div className={styles.aiProfileGroup}>
              <div className={styles.aiAvatarWrapper}>
                <div className={styles.aiAvatarGlow}></div>
                <div className={styles.aiAvatar}>🤖</div>
              </div>
              <div className={styles.aiHeadlineGroup}>
                <h3 className={styles.aiCoachTitle}>{aiInsights.headline || '⚡ Personalized AI Learning Analysis'}</h3>
                <span className={styles.aiBadge}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  <span>Optimal Focus Window: {aiInsights.peakWindow || analytics.peakTimeSlot}</span>
                </span>
              </div>
            </div>
          </div>
          
          <p className={styles.aiInsightsText}>{aiInsights.insightsText}</p>
          
          {aiInsights.recommendation && (
            <div className={styles.aiRecommendationBox}>
              <div className={styles.recommendTextGroup}>
                <svg className={styles.recommendIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div>
                  <strong style={{ color: 'var(--primary-color)' }}>AI Action Tip:</strong> {aiInsights.recommendation}
                </div>
              </div>
              
              <button onClick={handleCopyTip} className={styles.btnCopyTip} title="Copy tip to clipboard">
                {copiedTip ? '✓ Copied' : '📋 Copy Tip'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Velocity Bar Chart Section */}
      <div className={styles.chartCard}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              <span>Daily Lesson Completion Velocity</span>
            </h3>
            <span className={styles.cardSubtitle}>Real-time video completion velocity across days</span>
          </div>

          <div className={styles.rangeToggleGroup}>
            <button 
              className={`${styles.btnToggleRange} ${velocityRange === 7 ? styles.activeRange : ''}`}
              onClick={() => setVelocityRange(7)}
            >
              Past 7 Days
            </button>
            <button 
              className={`${styles.btnToggleRange} ${velocityRange === 14 ? styles.activeRange : ''}`}
              onClick={() => setVelocityRange(14)}
            >
              Past 14 Days
            </button>
          </div>
        </div>

        <div className={styles.velocityChartWrapper}>
          <div className={styles.barChartContainer}>
            {activeTrendList.map((dayItem, idx) => {
              const heightPercent = maxVelocityCount > 0 ? Math.round((dayItem.count / maxVelocityCount) * 100) : 0
              const isToday = idx === activeTrendList.length - 1

              return (
                <div 
                  key={dayItem.date} 
                  className={`${styles.barColumn} ${isToday ? styles.activeToday : ''}`}
                  title={`${dayItem.label}: ${dayItem.count} completed lessons`}
                >
                  {dayItem.count > 0 && (
                    <span className={styles.barValue}>{dayItem.count}</span>
                  )}
                  <div className={styles.barTrack}>
                    <div 
                      className={styles.barFill} 
                      style={{ height: `${Math.max(dayItem.count > 0 ? 15 : 0, heightPercent)}%` }}
                    ></div>
                  </div>
                  <span className={styles.barLabel}>{isToday ? 'Today' : dayItem.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className={styles.twoColGrid}>
        {/* Category Breakdown */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
                <polyline points="17 2 12 7 7 2"></polyline>
              </svg>
              <span>Category & Skill Distribution</span>
            </h3>
          </div>

          <div className={styles.categoryList}>
            {analytics.categoryBreakdown && analytics.categoryBreakdown.length > 0 ? (
              analytics.categoryBreakdown.map(catItem => (
                <div key={catItem.category} className={styles.categoryItem}>
                  <div className={styles.categoryMeta}>
                    <span className={styles.categoryName}>
                      {catItem.category}
                      <span className={styles.categoryPill}>{catItem.percentage}%</span>
                    </span>
                    <span className={styles.categoryStats}>{catItem.count} lessons (~{catItem.estimatedMinutes} mins)</span>
                  </div>
                  <div className={styles.progressBarTrack}>
                    <div 
                      className={styles.progressBarFill} 
                      style={{ width: `${Math.max(5, catItem.percentage)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyNotice}>
                No category data recorded yet. Complete a video lesson to see skill distribution!
              </div>
            )}
          </div>
        </div>

        {/* 24-Hour Peak Focus Distribution */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Peak Focus Time Breakdown</span>
            </h3>
          </div>

          <div className={styles.peakQuadrantGrid}>
            {analytics.timeSlotsBreakdown && analytics.timeSlotsBreakdown.map(slot => (
              <div key={slot.name} className={styles.quadrantItem}>
                <div className={styles.quadrantHeader}>
                  <span className={styles.quadrantName}>{slot.name}</span>
                </div>
                <span className={styles.quadrantVal}>{slot.count} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>events</span></span>
              </div>
            ))}
          </div>

          {/* Hourly Intensity Histogram */}
          <div style={{ marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.785rem', fontWeight: 700, color: 'var(--text-secondary)' }}>24-Hour Activity Heat Intensity:</span>
            <div className={styles.hourlyHistogram}>
              {analytics.hourlyHistogram && analytics.hourlyHistogram.map((count, hour) => {
                const maxHour = Math.max(1, ...(analytics.hourlyHistogram || []))
                const hHeight = Math.round((count / maxHour) * 100)
                
                let intensityClass = styles.zeroIntensity
                if (count > 0) {
                  if (count >= maxHour * 0.75) intensityClass = styles.highIntensity
                  else if (count >= maxHour * 0.3) intensityClass = styles.medIntensity
                  else intensityClass = styles.lowIntensity
                }

                return (
                  <div 
                    key={hour} 
                    className={`${styles.hourlyBar} ${intensityClass}`} 
                    style={{ height: `${Math.max(8, hHeight)}%` }}
                    title={`${hour}:00 - ${count} activity events recorded`}
                  ></div>
                )
              })}
            </div>
            <div className={styles.histogramTimeLabels}>
              <span>12 AM</span>
              <span>6 AM</span>
              <span>12 PM</span>
              <span>6 PM</span>
              <span>11 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Footer Metric Bar */}
      <div className={styles.summaryFooterBar}>
        <div className={styles.footerMetricItem}>
          <div className={styles.footerMetricIcon}>⚡</div>
          <div className={styles.footerMetricGroup}>
            <span className={styles.footerMetricLabel}>Study Velocity Pace</span>
            <span className={styles.footerMetricValue}>{analytics.dailyAverageVelocity} lessons / active day</span>
          </div>
        </div>

        <div className={styles.footerMetricItem}>
          <div className={styles.footerMetricIcon}>⏱️</div>
          <div className={styles.footerMetricGroup}>
            <span className={styles.footerMetricLabel}>Estimated Total Watch Time</span>
            <span className={styles.footerMetricValue}>~{totalWatchHours} hours completed</span>
          </div>
        </div>

        <div className={styles.footerMetricItem}>
          <div className={styles.footerMetricIcon}>🌟</div>
          <div className={styles.footerMetricGroup}>
            <span className={styles.footerMetricLabel}>Consistency Index</span>
            <span className={styles.footerMetricValue}>{analytics.activeDaysCount} of 7 active study days ({analytics.consistencyIndex}%)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardAnalytics
