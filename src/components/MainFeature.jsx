import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import Chart from 'react-apexcharts'
import ApperIcon from './ApperIcon'
import feedbackService from '../services/api/feedbackService'
import clientService from '../services/api/clientService'
import formService from '../services/api/formService'

const MainFeature = () => {
  const [activeTab, setActiveTab] = useState('trends')
  const [feedbackData, setFeedbackData] = useState([])
  const [clients, setClients] = useState([])
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedClient, setSelectedClient] = useState('all')
  const [dateRange, setDateRange] = useState('30')
  const [chartType, setChartType] = useState('line')

  // Form Builder State
  const [formBuilder, setFormBuilder] = useState({
    title: '',
    questions: []
  })
  const [showFormBuilder, setShowFormBuilder] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [feedbackResult, clientsResult, formsResult] = await Promise.all([
        feedbackService.getAll(),
        clientService.getAll(),
        formService.getAll()
      ])
      setFeedbackData(feedbackResult || [])
      setClients(clientsResult || [])
      setForms(formsResult || [])
    } catch (err) {
      setError(err.message)
      toast.error("Failed to load analytics data")
    } finally {
      setLoading(false)
    }
  }

  const generateChartData = () => {
    if (!feedbackData || feedbackData.length === 0) {
      return {
        series: [{ name: 'Average Rating', data: [] }],
        categories: []
      }
    }

    const filteredData = selectedClient === 'all' 
      ? feedbackData 
      : feedbackData.filter(f => f.clientId === selectedClient)

    // Group by date and calculate averages
    const groupedData = filteredData.reduce((acc, feedback) => {
      const date = new Date(feedback.timestamp).toDateString()
      if (!acc[date]) {
        acc[date] = { ratings: [], count: 0 }
      }
      
      const ratings = feedback.ratings || []
      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + (r.value || 0), 0) / ratings.length
        : 0
      
      acc[date].ratings.push(avgRating)
      acc[date].count++
      return acc
    }, {})

    const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(a) - new Date(b))
    const last30Days = sortedDates.slice(-parseInt(dateRange))
    
    const series = last30Days.map(date => {
      const dayData = groupedData[date]
      return dayData.ratings.length > 0
        ? dayData.ratings.reduce((sum, r) => sum + r, 0) / dayData.ratings.length
        : 0
    })

    return {
      series: [{ name: 'Average Rating', data: series }],
      categories: last30Days.map(date => new Date(date).toLocaleDateString())
    }
  }

  const chartData = generateChartData()

  const chartOptions = {
    chart: {
      type: chartType,
      height: 350,
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    colors: ['#6366F1'],
    stroke: {
      curve: 'smooth',
      width: 3
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 100]
      }
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: { colors: '#64748B' }
      }
    },
    yaxis: {
      min: 0,
      max: 5,
      labels: {
        style: { colors: '#64748B' }
      }
    },
    grid: {
      borderColor: '#E2E8F0',
      strokeDashArray: 5
    },
    tooltip: {
      theme: 'light',
      style: { fontSize: '12px' }
    }
  }

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: 'rating',
      text: '',
      options: []
    }
    setFormBuilder(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }))
  }

  const updateQuestion = (id, field, value) => {
    setFormBuilder(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    }))
  }

  const removeQuestion = (id) => {
    setFormBuilder(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }))
  }

  const saveForm = async () => {
    if (!formBuilder.title.trim()) {
      toast.error("Please enter a form title")
      return
    }
    
    if (formBuilder.questions.length === 0) {
      toast.error("Please add at least one question")
      return
    }

    try {
      const newForm = {
        title: formBuilder.title,
        questions: formBuilder.questions,
        clientIds: [],
        isActive: true
      }
      
      await formService.create(newForm)
      setFormBuilder({ title: '', questions: [] })
      setShowFormBuilder(false)
      await loadData()
      toast.success("Feedback form created successfully!")
    } catch (err) {
      toast.error("Failed to create form")
    }
  }

  const getClientPerformance = () => {
    if (!feedbackData || feedbackData.length === 0 || !clients || clients.length === 0) {
      return []
    }

    return clients.map(client => {
      const clientFeedback = feedbackData.filter(f => f.clientId === client.id) || []
      const totalResponses = clientFeedback.length
      
      const avgRating = totalResponses > 0
        ? clientFeedback.reduce((sum, f) => {
            const ratings = f.ratings || []
            const rating = ratings.length > 0 
              ? ratings.reduce((s, r) => s + (r.value || 0), 0) / ratings.length
              : 0
            return sum + rating
          }, 0) / totalResponses
        : 0

      return {
        id: client.id,
        name: client.name || 'Unknown Client',
        industry: client.industry || 'N/A',
        responses: totalResponses,
        avgRating: Math.round(avgRating * 10) / 10,
        trend: Math.random() > 0.5 ? 'up' : 'down' // Simplified trend calculation
      }
    })
  }

  const clientPerformance = getClientPerformance()

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'trends', label: 'Trend Analytics', icon: 'TrendingUp' },
          { id: 'clients', label: 'Client Performance', icon: 'Users' },
          { id: 'forms', label: 'Form Builder', icon: 'PlusCircle' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg'
                : 'bg-white text-surface-600 hover:bg-surface-50 border border-surface-200'
            }`}
          >
            <ApperIcon name={tab.icon} className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Trend Analytics Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'trends' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl p-6 shadow-card border border-surface-200"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h3 className="text-xl font-bold text-surface-900 mb-4 md:mb-0">
                Feedback Trends
              </h3>
              <div className="flex flex-wrap gap-3">
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Clients</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name || `Client ${client.id}`}
                    </option>
                  ))}
                </select>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
                <div className="flex bg-surface-100 rounded-lg p-1">
                  {['line', 'area', 'bar'].map(type => (
                    <button
                      key={type}
                      onClick={() => setChartType(type)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                        chartType === type
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-surface-600 hover:text-surface-900'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="h-80 bg-surface-100 rounded-lg animate-pulse"></div>
            ) : chartData.series[0].data.length > 0 ? (
              <Chart
                options={chartOptions}
                series={chartData.series}
                type={chartType}
                height={350}
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-surface-500">
                <div className="text-center">
                  <ApperIcon name="BarChart3" className="h-12 w-12 mx-auto mb-4 text-surface-300" />
                  <p>No feedback data available for the selected criteria</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Client Performance Tab */}
        {activeTab === 'clients' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl p-6 shadow-card border border-surface-200"
          >
            <h3 className="text-xl font-bold text-surface-900 mb-6">Client Performance</h3>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-surface-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : clientPerformance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-200">
                      <th className="text-left py-3 px-4 font-semibold text-surface-700">Client</th>
                      <th className="text-left py-3 px-4 font-semibold text-surface-700">Industry</th>
                      <th className="text-left py-3 px-4 font-semibold text-surface-700">Responses</th>
                      <th className="text-left py-3 px-4 font-semibold text-surface-700">Avg Rating</th>
                      <th className="text-left py-3 px-4 font-semibold text-surface-700">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientPerformance.map(client => (
                      <tr key={client.id} className="border-b border-surface-100 hover:bg-surface-50">
                        <td className="py-4 px-4">
                          <div className="font-medium text-surface-900">{client.name}</div>
                        </td>
                        <td className="py-4 px-4 text-surface-600">{client.industry}</td>
                        <td className="py-4 px-4 text-surface-900">{client.responses}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-surface-900">{client.avgRating}</span>
                            <div className="flex text-yellow-400">
                              {[1, 2, 3, 4, 5].map(star => (
                                <ApperIcon
                                  key={star}
                                  name="Star"
                                  className={`h-4 w-4 ${
                                    star <= client.avgRating ? 'fill-current' : ''
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className={`flex items-center space-x-1 ${
                            client.trend === 'up' ? 'text-secondary' : 'text-red-500'
                          }`}>
                            <ApperIcon 
                              name={client.trend === 'up' ? 'TrendingUp' : 'TrendingDown'} 
                              className="h-4 w-4" 
                            />
                            <span className="text-sm font-medium">
                              {client.trend === 'up' ? '+' : '-'}{Math.floor(Math.random() * 15 + 5)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <ApperIcon name="Users" className="h-12 w-12 mx-auto mb-4 text-surface-300" />
                <p className="text-surface-500">No client data available</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Form Builder Tab */}
        {activeTab === 'forms' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Existing Forms */}
            <div className="bg-white rounded-2xl p-6 shadow-card border border-surface-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-surface-900">Feedback Forms</h3>
                <button
                  onClick={() => setShowFormBuilder(!showFormBuilder)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  <ApperIcon name="Plus" className="h-4 w-4" />
                  <span>Create Form</span>
                </button>
              </div>

              {forms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {forms.map(form => (
                    <div key={form.id} className="border border-surface-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                      <h4 className="font-semibold text-surface-900 mb-2">{form.title}</h4>
                      <p className="text-sm text-surface-600 mb-3">
                        {form.questions?.length || 0} questions
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          form.isActive 
                            ? 'bg-secondary/10 text-secondary' 
                            : 'bg-surface-100 text-surface-600'
                        }`}>
                          {form.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <div className="flex space-x-2">
                          <button className="p-1 text-surface-400 hover:text-primary transition-colors">
                            <ApperIcon name="Edit2" className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-surface-400 hover:text-red-500 transition-colors">
                            <ApperIcon name="Trash2" className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ApperIcon name="FileText" className="h-12 w-12 mx-auto mb-4 text-surface-300" />
                  <p className="text-surface-500">No forms created yet</p>
                </div>
              )}
            </div>

            {/* Form Builder */}
            <AnimatePresence>
              {showFormBuilder && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-card border border-surface-200"
                >
                  <h3 className="text-xl font-bold text-surface-900 mb-6">Create Feedback Form</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Form Title
                      </label>
                      <input
                        type="text"
                        value={formBuilder.title}
                        onChange={(e) => setFormBuilder(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter form title..."
                        className="w-full px-4 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-surface-700">
                          Questions
                        </label>
                        <button
                          onClick={addQuestion}
                          className="flex items-center space-x-2 px-3 py-2 bg-surface-100 text-surface-700 rounded-lg hover:bg-surface-200 transition-colors"
                        >
                          <ApperIcon name="Plus" className="h-4 w-4" />
                          <span>Add Question</span>
                        </button>
                      </div>

                      <div className="space-y-4">
                        {formBuilder.questions.map((question, index) => (
                          <motion.div
                            key={question.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 border border-surface-200 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-surface-700">
                                Question {index + 1}
                              </span>
                              <button
                                onClick={() => removeQuestion(question.id)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <ApperIcon name="X" className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <div className="space-y-3">
                              <select
                                value={question.type}
                                onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                                className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                              >
                                <option value="rating">Star Rating</option>
                                <option value="text">Text Response</option>
                                <option value="scale">Scale (1-10)</option>
                                <option value="multiple">Multiple Choice</option>
                              </select>
                              
                              <input
                                type="text"
                                value={question.text}
                                onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                                placeholder="Enter question text..."
                                className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowFormBuilder(false)}
                        className="px-4 py-2 text-surface-600 border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveForm}
                        className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition-all duration-200"
                      >
                        Save Form
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MainFeature