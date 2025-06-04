import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'
import feedbackService from '../services/api/feedbackService'
import clientService from '../services/api/clientService'

const Home = () => {
const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [dashboardData, setDashboardData] = useState({
    averageRating: 0,
    totalResponses: 0,
    responseRate: 0,
    sentimentScore: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true)
      try {
        const [feedback, clients] = await Promise.all([
          feedbackService.getAll(),
          clientService.getAll()
        ])
        
        // Calculate metrics
        const totalResponses = feedback?.length || 0
        const averageRating = totalResponses > 0 
          ? feedback.reduce((sum, f) => {
              const ratings = f.ratings || []
              const avgRating = ratings.length > 0 
                ? ratings.reduce((s, r) => s + (r.value || 0), 0) / ratings.length 
                : 0
              return sum + avgRating
            }, 0) / totalResponses
          : 0
        
        const responseRate = clients?.length > 0 ? (totalResponses / clients.length) * 10 : 0
        const sentimentScore = Math.min(averageRating * 20, 100)
        
        setDashboardData({
          averageRating: Math.round(averageRating * 10) / 10,
          totalResponses,
          responseRate: Math.min(Math.round(responseRate * 10) / 10, 100),
          sentimentScore: Math.round(sentimentScore)
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

const navigationItems = [
    { icon: 'BarChart3', label: 'Dashboard', active: true, path: '/' },
    { icon: 'MessageSquare', label: 'Feedback Forms', path: '/feedback-forms' },
    { icon: 'TrendingUp', label: 'Analytics', path: '/analytics' },
    { icon: 'Users', label: 'Clients', path: '/clients' },
    { icon: 'FileText', label: 'Reports', path: '/reports' },
    { icon: 'Settings', label: 'Settings', path: '/settings' }
  ]

  const MetricCard = ({ title, value, change, icon, color, loading }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-card hover:shadow-lg transition-all duration-300 border border-surface-200 gradient-border"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          <ApperIcon name={icon} className="h-6 w-6 text-white" />
        </div>
        <div className="flex items-center space-x-1 text-sm">
          <ApperIcon name="TrendingUp" className="h-4 w-4 text-secondary" />
          <span className="text-secondary font-medium">{change}</span>
        </div>
      </div>
      <div>
        <h3 className="text-surface-600 text-sm font-medium mb-1">{title}</h3>
        {loading ? (
          <div className="h-8 bg-surface-200 rounded animate-pulse"></div>
        ) : (
          <p className="text-2xl font-bold text-surface-900 animate-counter">
            {value}
          </p>
        )}
      </div>
    </motion.div>
  )

  return (
    <div className={`min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 ${darkMode ? 'dark' : ''}`}>
      {/* Top Navigation */}
      <nav className="bg-white/80 glass-morphic border-b border-surface-200 px-4 py-3 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-surface-100 rounded-lg transition-colors"
            >
              <ApperIcon name="Menu" className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <ApperIcon name="Zap" className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-surface-900">PulsePoint</h1>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <ApperIcon name="Search" className="h-5 w-5 text-surface-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search feedback, clients..."
                className="w-full pl-10 pr-4 py-2 bg-surface-50 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
            >
              <ApperIcon name={darkMode ? "Sun" : "Moon"} className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-surface-100 rounded-lg transition-colors relative">
              <ApperIcon name="Bell" className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></span>
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-secondary to-secondary-dark rounded-full"></div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240 }}
            className="fixed left-0 top-16 h-full w-60 bg-white/90 glass-morphic border-r border-surface-200 z-40 lg:translate-x-0"
          >
            <nav className="p-4 space-y-2">
{navigationItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    item.active
                      ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg'
                      : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                  }`}
                >
                  <ApperIcon name={item.icon} className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              ))}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-16 lg:pl-60 min-h-screen">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-surface-900 mb-2">
                  Analytics Dashboard
                </h2>
                <p className="text-surface-600">
                  Monitor feedback trends and client satisfaction metrics
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mt-4 md:mt-0">
                <select className="px-4 py-2 bg-white border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option>Last 30 days</option>
                  <option>Last 7 days</option>
                  <option>Last 90 days</option>
                </select>
                <button className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center space-x-2">
                  <ApperIcon name="Download" className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <MetricCard
                title="Average Rating"
                value={`${dashboardData.averageRating}/5.0`}
                change="+12%"
                icon="Star"
                color="from-accent to-yellow-600"
                loading={loading}
              />
              <MetricCard
                title="Total Responses"
                value={dashboardData.totalResponses.toLocaleString()}
                change="+23%"
                icon="MessageCircle"
                color="from-primary to-primary-dark"
                loading={loading}
              />
              <MetricCard
                title="Response Rate"
                value={`${dashboardData.responseRate}%`}
                change="+8%"
                icon="TrendingUp"
                color="from-secondary to-secondary-dark"
                loading={loading}
              />
              <MetricCard
                title="Sentiment Score"
                value={`${dashboardData.sentimentScore}%`}
                change="+15%"
                icon="Heart"
                color="from-pink-500 to-rose-600"
                loading={loading}
              />
            </div>
          </div>

          {/* Main Feature Component */}
          <MainFeature />
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Home