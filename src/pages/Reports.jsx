import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '../components/ApperIcon'
import reportService from '../services/api/reportService'
import feedbackService from '../services/api/feedbackService'
const Reports = () => {
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedReports, setSelectedReports] = useState([])
  const [generatingReports, setGeneratingReports] = useState(new Set())
  const [newReport, setNewReport] = useState({
    title: '',
    type: 'feedback_summary',
    description: '',
    dateRange: '30',
    format: 'pdf',
    schedule: 'none'
  })

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const data = await reportService.getAll()
      setReports(data || [])
    } catch (error) {
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReport = async () => {
    if (!newReport.title.trim()) {
      toast.error('Report title is required')
      return
    }

    try {
      const reportData = {
        ...newReport,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        status: 'pending',
        fileSize: 0,
        downloadCount: 0
      }
      
      const createdReport = await reportService.create(reportData)
      setReports([createdReport, ...reports])
      setShowCreateModal(false)
      setNewReport({
        title: '',
        type: 'feedback_summary',
        description: '',
        dateRange: '30',
        format: 'pdf',
        schedule: 'none'
      })
      
      // Auto-generate the report
      handleGenerateReport(createdReport.id)
      toast.success('Report created successfully')
    } catch (error) {
      toast.error('Failed to create report')
    }
  }

  const handleGenerateReport = async (reportId) => {
    setGeneratingReports(prev => new Set([...prev, reportId]))
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const updatedReport = await reportService.update(reportId, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        fileSize: Math.floor(Math.random() * 1000) + 100, // KB
        downloadUrl: `/reports/${reportId}.pdf`
      })
      
      setReports(reports.map(report => 
        report.id === reportId ? updatedReport : report
      ))
      
      toast.success('Report generated successfully')
    } catch (error) {
      await reportService.update(reportId, { status: 'failed' })
      setReports(reports.map(report => 
        report.id === reportId ? { ...report, status: 'failed' } : report
      ))
      toast.error('Failed to generate report')
    } finally {
      setGeneratingReports(prev => {
        const newSet = new Set(prev)
        newSet.delete(reportId)
        return newSet
      })
    }
  }

  const handleDownloadReport = async (report) => {
    try {
      // Simulate download
      const link = document.createElement('a')
      link.href = '#'
      link.download = `${report.title.replace(/\s+/g, '_')}.${report.format}`
      link.click()
      
      // Update download count
      await reportService.update(report.id, {
        downloadCount: (report.downloadCount || 0) + 1,
        lastDownloaded: new Date().toISOString()
      })
      
      setReports(reports.map(r => 
        r.id === report.id 
          ? { ...r, downloadCount: (r.downloadCount || 0) + 1 }
          : r
      ))
      
      toast.success('Report downloaded successfully')
    } catch (error) {
      toast.error('Failed to download report')
    }
  }

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return

    try {
      await reportService.delete(reportId)
      setReports(reports.filter(report => report.id !== reportId))
      toast.success('Report deleted successfully')
    } catch (error) {
      toast.error('Failed to delete report')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedReports.length === 0) return
    if (!window.confirm(`Are you sure you want to delete ${selectedReports.length} selected reports?`)) return

    try {
      await Promise.all(selectedReports.map(id => reportService.delete(id)))
      setReports(reports.filter(report => !selectedReports.includes(report.id)))
      setSelectedReports([])
      toast.success(`${selectedReports.length} reports deleted successfully`)
    } catch (error) {
      toast.error('Failed to delete selected reports')
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || report.type === filterType
    return matchesSearch && matchesType
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-secondary text-white'
      case 'pending': return 'bg-yellow-500 text-white'
      case 'failed': return 'bg-red-500 text-white'
      case 'scheduled': return 'bg-blue-500 text-white'
      default: return 'bg-surface-200 text-surface-700'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'feedback_summary': return 'MessageCircle'
      case 'analytics': return 'BarChart3'
      case 'client_report': return 'Users'
      case 'satisfaction': return 'Heart'
      case 'nps': return 'TrendingUp'
      default: return 'FileText'
    }
  }

  const ReportCard = ({ report }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-card hover:shadow-lg transition-all duration-300 border border-surface-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selectedReports.includes(report.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedReports([...selectedReports, report.id])
              } else {
                setSelectedReports(selectedReports.filter(id => id !== report.id))
              }
            }}
            className="w-4 h-4 text-primary border-surface-300 rounded focus:ring-primary"
          />
          <div className="p-2 bg-surface-100 rounded-lg">
            <ApperIcon name={getTypeIcon(report.type)} className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
            {report.status}
          </span>
          <button
            onClick={() => handleDeleteReport(report.id)}
            className="p-2 text-surface-400 hover:text-red-500 transition-colors"
          >
            <ApperIcon name="Trash2" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-surface-900 mb-2">{report.title}</h3>
      <p className="text-surface-600 text-sm mb-4 line-clamp-2">{report.description}</p>

      <div className="flex items-center justify-between text-sm text-surface-500 mb-4">
        <span className="capitalize">{report.type.replace('_', ' ')}</span>
        <span className="uppercase">{report.format}</span>
      </div>

      {report.fileSize > 0 && (
        <div className="flex items-center justify-between text-sm text-surface-500 mb-4">
          <span>{report.fileSize} KB</span>
          <span>{report.downloadCount || 0} downloads</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-surface-400">
          Created {new Date(report.createdAt).toLocaleDateString()}
        </span>
        <div className="flex space-x-2">
          {report.status === 'pending' && (
            <button
              onClick={() => handleGenerateReport(report.id)}
              disabled={generatingReports.has(report.id)}
              className="px-3 py-1 bg-primary text-white rounded-lg text-xs hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center space-x-1"
            >
              {generatingReports.has(report.id) ? (
                <>
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <ApperIcon name="Play" className="h-3 w-3" />
                  <span>Generate</span>
                </>
              )}
            </button>
          )}
          {report.status === 'completed' && (
            <button
              onClick={() => handleDownloadReport(report)}
              className="px-3 py-1 bg-secondary text-white rounded-lg text-xs hover:bg-secondary-dark transition-colors flex items-center space-x-1"
            >
              <ApperIcon name="Download" className="h-3 w-3" />
              <span>Download</span>
            </button>
          )}
          {report.status === 'failed' && (
            <button
              onClick={() => handleGenerateReport(report.id)}
              className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition-colors flex items-center space-x-1"
            >
              <ApperIcon name="RefreshCw" className="h-3 w-3" />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100">
{/* Header */}
      <div className="bg-white border-b border-surface-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-surface-100 rounded-lg transition-colors flex items-center space-x-2 text-surface-600 hover:text-surface-900"
                >
                  <ApperIcon name="ArrowLeft" className="h-5 w-5" />
                  <span className="hidden sm:inline">Back</span>
                </button>
                <h1 className="text-2xl font-bold text-surface-900">Reports</h1>
              </div>
              <p className="text-surface-600">Generate and manage comprehensive feedback reports</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              {selectedReports.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                >
                  <ApperIcon name="Trash2" className="h-4 w-4" />
                  <span>Delete ({selectedReports.length})</span>
                </button>
              )}
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
              >
                <ApperIcon name="Plus" className="h-4 w-4" />
                <span>Create Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-surface-200 p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1 max-w-md">
            <ApperIcon name="Search" className="h-5 w-5 text-surface-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Types</option>
            <option value="feedback_summary">Feedback Summary</option>
            <option value="analytics">Analytics</option>
            <option value="client_report">Client Report</option>
            <option value="satisfaction">Satisfaction</option>
            <option value="nps">NPS Report</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-card animate-pulse">
                <div className="h-4 bg-surface-200 rounded mb-4"></div>
                <div className="h-6 bg-surface-200 rounded mb-2"></div>
                <div className="h-4 bg-surface-200 rounded mb-4"></div>
                <div className="h-8 bg-surface-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}

        {!loading && filteredReports.length === 0 && (
          <div className="text-center py-12">
            <ApperIcon name="FileText" className="h-12 w-12 text-surface-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-surface-900 mb-2">No reports found</h3>
            <p className="text-surface-600 mb-4">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first report'
              }
            </p>
            {!searchTerm && filterType === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Create Your First Report
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Report Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md max-h-96 overflow-y-auto"
            >
              <h3 className="text-lg font-semibold text-surface-900 mb-4">Create New Report</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newReport.title}
                    onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter report title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Type</label>
                  <select
                    value={newReport.type}
                    onChange={(e) => setNewReport({ ...newReport, type: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="feedback_summary">Feedback Summary</option>
                    <option value="analytics">Analytics Report</option>
                    <option value="client_report">Client Report</option>
                    <option value="satisfaction">Satisfaction Report</option>
                    <option value="nps">NPS Report</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Description</label>
                  <textarea
                    value={newReport.description}
                    onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    rows="3"
                    placeholder="Enter report description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Date Range</label>
                  <select
                    value={newReport.dateRange}
                    onChange={(e) => setNewReport({ ...newReport, dateRange: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Format</label>
                  <select
                    value={newReport.format}
                    onChange={(e) => setNewReport({ ...newReport, format: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-surface-600 hover:text-surface-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateReport}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Create Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Reports