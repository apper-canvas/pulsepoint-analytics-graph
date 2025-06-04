import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '../components/ApperIcon'
import formService from '../services/api/formService'

const FeedbackForms = () => {
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingForm, setEditingForm] = useState(null)
  const [selectedForms, setSelectedForms] = useState([])
  const [newForm, setNewForm] = useState({
    title: '',
    description: '',
    questions: [],
    status: 'draft',
    category: 'satisfaction'
  })

  useEffect(() => {
    loadForms()
  }, [])

  const loadForms = async () => {
    try {
      setLoading(true)
      const data = await formService.getAll()
      setForms(data || [])
    } catch (error) {
      toast.error('Failed to load forms')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateForm = async () => {
    if (!newForm.title.trim()) {
      toast.error('Form title is required')
      return
    }

    try {
      const createdForm = await formService.create({
        ...newForm,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        responses: 0,
        lastModified: new Date().toISOString()
      })
      setForms([createdForm, ...forms])
      setShowCreateModal(false)
      setNewForm({ title: '', description: '', questions: [], status: 'draft', category: 'satisfaction' })
      toast.success('Form created successfully')
    } catch (error) {
      toast.error('Failed to create form')
    }
  }

  const handleUpdateForm = async (formId, updates) => {
    try {
      const updatedForm = await formService.update(formId, {
        ...updates,
        lastModified: new Date().toISOString()
      })
      setForms(forms.map(form => form.id === formId ? updatedForm : form))
      toast.success('Form updated successfully')
    } catch (error) {
      toast.error('Failed to update form')
    }
  }

  const handleDeleteForm = async (formId) => {
    if (!window.confirm('Are you sure you want to delete this form?')) return

    try {
      await formService.delete(formId)
      setForms(forms.filter(form => form.id !== formId))
      toast.success('Form deleted successfully')
    } catch (error) {
      toast.error('Failed to delete form')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedForms.length === 0) return
    if (!window.confirm(`Are you sure you want to delete ${selectedForms.length} selected forms?`)) return

    try {
      await Promise.all(selectedForms.map(id => formService.delete(id)))
      setForms(forms.filter(form => !selectedForms.includes(form.id)))
      setSelectedForms([])
      toast.success(`${selectedForms.length} forms deleted successfully`)
    } catch (error) {
      toast.error('Failed to delete selected forms')
    }
  }

  const handlePublishForm = async (formId) => {
    try {
      await handleUpdateForm(formId, { status: 'published' })
      toast.success('Form published successfully')
    } catch (error) {
      toast.error('Failed to publish form')
    }
  }

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || form.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-secondary text-white'
      case 'draft': return 'bg-yellow-500 text-white'
      case 'archived': return 'bg-surface-400 text-white'
      default: return 'bg-surface-200 text-surface-700'
    }
  }

  const FormCard = ({ form }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-card hover:shadow-lg transition-all duration-300 border border-surface-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selectedForms.includes(form.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedForms([...selectedForms, form.id])
              } else {
                setSelectedForms(selectedForms.filter(id => id !== form.id))
              }
            }}
            className="w-4 h-4 text-primary border-surface-300 rounded focus:ring-primary"
          />
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(form.status)}`}>
            {form.status}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setEditingForm(form)}
            className="p-2 text-surface-400 hover:text-primary transition-colors"
          >
            <ApperIcon name="Edit2" className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteForm(form.id)}
            className="p-2 text-surface-400 hover:text-red-500 transition-colors"
          >
            <ApperIcon name="Trash2" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-surface-900 mb-2">{form.title}</h3>
      <p className="text-surface-600 text-sm mb-4 line-clamp-2">{form.description}</p>

      <div className="flex items-center justify-between text-sm text-surface-500 mb-4">
        <span>{form.questions?.length || 0} questions</span>
        <span>{form.responses || 0} responses</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-surface-400">
          Modified {new Date(form.lastModified).toLocaleDateString()}
        </span>
        <div className="flex space-x-2">
          {form.status === 'draft' && (
            <button
              onClick={() => handlePublishForm(form.id)}
              className="px-3 py-1 bg-secondary text-white rounded-lg text-xs hover:bg-secondary-dark transition-colors"
            >
              Publish
            </button>
          )}
          <button className="px-3 py-1 bg-primary text-white rounded-lg text-xs hover:bg-primary-dark transition-colors">
            View
          </button>
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
              <h1 className="text-2xl font-bold text-surface-900 mb-2">Feedback Forms</h1>
              <p className="text-surface-600">Create and manage feedback forms</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              {selectedForms.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                >
                  <ApperIcon name="Trash2" className="h-4 w-4" />
                  <span>Delete ({selectedForms.length})</span>
                </button>
              )}
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
              >
                <ApperIcon name="Plus" className="h-4 w-4" />
                <span>Create Form</span>
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
              placeholder="Search forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
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
            {filteredForms.map(form => (
              <FormCard key={form.id} form={form} />
            ))}
          </div>
        )}

        {!loading && filteredForms.length === 0 && (
          <div className="text-center py-12">
            <ApperIcon name="FileText" className="h-12 w-12 text-surface-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-surface-900 mb-2">No forms found</h3>
            <p className="text-surface-600 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first feedback form'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Create Your First Form
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Form Modal */}
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
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-surface-900 mb-4">Create New Form</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newForm.title}
                    onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter form title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Description</label>
                  <textarea
                    value={newForm.description}
                    onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    rows="3"
                    placeholder="Enter form description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Category</label>
                  <select
                    value={newForm.category}
                    onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="satisfaction">Customer Satisfaction</option>
                    <option value="nps">Net Promoter Score</option>
                    <option value="product">Product Feedback</option>
                    <option value="service">Service Quality</option>
                    <option value="event">Event Feedback</option>
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
                  onClick={handleCreateForm}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Create Form
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FeedbackForms