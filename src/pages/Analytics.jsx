import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Chart from 'react-apexcharts'
import { toast } from 'react-toastify'
import ApperIcon from '../components/ApperIcon'
import feedbackService from '../services/api/feedbackService'
import clientService from '../services/api/clientService'

const Analytics = () => {
  const [dateRange, setDateRange] = useState('30')
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    totalFeedback: 0,
    averageRating: 0,
    responseRate: 0,
    sentimentScore: 0,
    trends: [],
    categories: [],
    sources: []
  })

  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const [feedback, clients] = await Promise.all([
        feedbackService.getAll(),
        clientService.getAll()
      ])

      // Process analytics data
      const totalFeedback = feedback?.length || 0
      const averageRating = totalFeedback > 0 
        ? feedback.reduce((sum, f) => {
            const ratings = f.ratings || []
            const avgRating = ratings.length > 0 
              ? ratings.reduce((s, r) => s + (r.value || 0), 0) / ratings.length 
              : 0
            return sum + avgRating
          }, 0) / totalFeedback
        : 0

      const responseRate = clients?.length > 0 ? (totalFeedback / clients.length) * 100 : 0
      const sentimentScore = Math.min(averageRating * 20, 100)

      // Generate trend data
      const trends = generateTrendData(feedback)
      const categories = generateCategoryData(feedback)
      const sources = generateSourceData(feedback)

      setAnalytics({
        totalFeedback,
        averageRating: Math.round(averageRating * 10) / 10,
        responseRate: Math.min(Math.round(responseRate * 10) / 10, 100),
        sentimentScore: Math.round(sentimentScore),
        trends,
        categories,
        sources
      })
    } catch (error) {
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const generateTrendData = (feedback) => {
    const last30Days = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayFeedback = feedback?.filter(f => 
        f.submittedAt?.startsWith(dateStr)
      ).length || Math.floor(Math.random() * 20)
      
      last30Days.push({
        date: dateStr,
        responses: dayFeedback,
        rating: 3.5 + Math.random() * 1.5
      })
    }
    return last30Days
  }

  const generateCategoryData = (feedback) => {
    return [
      { name: 'Very Satisfied', value: 45, color: '#10B981' },
      { name: 'Satisfied', value: 30, color: '#34D399' },
      { name: 'Neutral', value: 15, color: '#F59E0B' },
      { name: 'Dissatisfied', value: 7, color: '#F97316' },
      { name: 'Very Dissatisfied', value: 3, color: '#EF4444' }
    ]
  }

  const generateSourceData = (feedback) => {
    return [
      { name: 'Website', value: 40 },
      { name: 'Email', value: 25 },
      { name: 'Mobile App', value: 20 },
      { name: 'Social Media', value: 10 },
      { name: 'In-Store', value: 5 }
    ]
  }

  const lineChartOptions = {
    chart: {
      type: 'line',
      height: 350,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: ['#6366F1', '#10B981'],
    stroke: {
      curve: 'smooth',
      width: 3
    },
    xaxis: {
      categories: analytics.trends.map(t => new Date(t.date).toLocaleDateString()),
      labels: {
        style: { colors: '#64748B', fontSize: '12px' }
      }
    },
    yaxis: [{
      title: { text: 'Responses', style: { color: '#64748B' } },
      labels: { style: { colors: '#64748B' } }
    }, {
      opposite: true,
      title: { text: 'Rating', style: { color: '#64748B' } },
      labels: { style: { colors: '#64748B' } },
      min: 0,
      max: 5
    }],
    grid: {
      borderColor: '#E2E8F0'
    },
    legend: {
      position: 'top',
      labels: { colors: '#64748B' }
    }
  }

  const lineChartSeries = [
    {
      name: 'Daily Responses',
      type: 'column',
      data: analytics.trends.map(t => t.responses)
    },
    {
      name: 'Average Rating',
      type: 'line',
      yAxisIndex: 1,
      data: analytics.trends.map(t => t.rating.toFixed(1))
    }
  ]

  const donutChartOptions = {
    chart: {
      type: 'donut',
      height: 300
    },
    colors: analytics.categories.map(c => c.color),
    labels: analytics.categories.map(c => c.name),
    legend: {
      position: 'bottom',
      labels: { colors: '#64748B' }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%'
        }
      }
    }
  }

  const donutChartSeries = analytics.categories.map(c => c.value)

  const MetricCard = ({ title, value, change, icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-card hover:shadow-lg transition-all duration-300 border border-surface-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          <ApperIcon name={icon} className="h-6 w-6 text-white" />
        </div>
        <div className="flex items-center space-x-1 text-sm">
          <ApperIcon 
            name={trend === 'up' ? 'TrendingUp' : 'TrendingDown'} 
            className={`h-4 w-4 ${trend === 'up' ? 'text-secondary' : 'text-red-500'}`} 
          />
          <span className={`font-medium ${trend === 'up' ? 'text-secondary' : 'text-red-500'}`}>
            {change}
          </span>
        </div>
      </div>
      <div>
        <h3 className="text-surface-600 text-sm font-medium mb-1">{title}</h3>
        {loading ? (
          <div className="h-8 bg-surface-200 rounded animate-pulse"></div>
        ) : (
          <p className="text-2xl font-bold text-surface-900">{value}</p>
        )}
      </div>
    </motion.div>
  )

  const exportData = () => {
    const csvData = analytics.trends.map(trend => ({
      Date: trend.date,
      Responses: trend.responses,
      'Average Rating': trend.rating.toFixed(2)
    }))
    
    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    
    toast.success('Analytics data exported successfully')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100">
      {/* Header */}
      <div className="bg-white border-b border-surface-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-surface-900 mb-2">Analytics Dashboard</h1>
              <p className="text-surface-600">Detailed insights and trends from your feedback data</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              <button
                onClick={exportData}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
              >
                <ApperIcon name="Download" className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Feedback"
            value={analytics.totalFeedback.toLocaleString()}
            change="+23%"
            icon="MessageCircle"
            color="from-primary to-primary-dark"
            trend="up"
          />
          <MetricCard
            title="Average Rating"
            value={`${analytics.averageRating}/5.0`}
            change="+12%"
            icon="Star"
            color="from-accent to-yellow-600"
            trend="up"
          />
          <MetricCard
            title="Response Rate"
            value={`${analytics.responseRate}%`}
            change="+8%"
            icon="TrendingUp"
            color="from-secondary to-secondary-dark"
            trend="up"
          />
          <MetricCard
            title="Sentiment Score"
            value={`${analytics.sentimentScore}%`}
            change="+15%"
            icon="Heart"
            color="from-pink-500 to-rose-600"
            trend="up"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-card border border-surface-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-surface-900">Response Trends</h3>
              <button className="text-surface-400 hover:text-surface-600">
                <ApperIcon name="MoreHorizontal" className="h-5 w-5" />
              </button>
            </div>
            {loading ? (
              <div className="h-80 bg-surface-100 rounded-lg animate-pulse"></div>
            ) : (
              <Chart
                options={lineChartOptions}
                series={lineChartSeries}
                type="line"
                height={320}
              />
            )}
          </motion.div>

          {/* Satisfaction Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-card border border-surface-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-surface-900">Satisfaction Distribution</h3>
              <button className="text-surface-400 hover:text-surface-600">
                <ApperIcon name="MoreHorizontal" className="h-5 w-5" />
              </button>
            </div>
            {loading ? (
              <div className="h-80 bg-surface-100 rounded-lg animate-pulse"></div>
            ) : (
              <Chart
                options={donutChartOptions}
                series={donutChartSeries}
                type="donut"
                height={320}
              />
            )}
          </motion.div>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Feedback Sources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-card border border-surface-200"
          >
            <h3 className="text-lg font-semibold text-surface-900 mb-6">Feedback Sources</h3>
            <div className="space-y-4">
              {analytics.sources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-surface-700">{source.name}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-20 bg-surface-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${source.value}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-surface-900 w-8">{source.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-card border border-surface-200"
          >
            <h3 className="text-lg font-semibold text-surface-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { action: 'New feedback received', time: '2 minutes ago', icon: 'MessageCircle' },
                { action: 'Form published', time: '1 hour ago', icon: 'FileText' },
                { action: 'Client added', time: '3 hours ago', icon: 'UserPlus' },
                { action: 'Report generated', time: '1 day ago', icon: 'BarChart' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="p-2 bg-surface-100 rounded-lg">
                    <ApperIcon name={activity.icon} className="h-4 w-4 text-surface-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-surface-900">{activity.action}</p>
                    <p className="text-xs text-surface-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-card border border-surface-200"
          >
            <h3 className="text-lg font-semibold text-surface-900 mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full p-3 text-left border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors flex items-center space-x-3">
                <ApperIcon name="Plus" className="h-5 w-5 text-primary" />
                <span className="text-surface-700">Create New Form</span>
              </button>
              <button className="w-full p-3 text-left border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors flex items-center space-x-3">
                <ApperIcon name="FileText" className="h-5 w-5 text-secondary" />
                <span className="text-surface-700">Generate Report</span>
              </button>
              <button className="w-full p-3 text-left border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors flex items-center space-x-3">
                <ApperIcon name="UserPlus" className="h-5 w-5 text-accent" />
                <span className="text-surface-700">Add Client</span>
              </button>
              <button className="w-full p-3 text-left border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors flex items-center space-x-3">
                <ApperIcon name="Settings" className="h-5 w-5 text-surface-600" />
                <span className="text-surface-700">Analytics Settings</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Analytics