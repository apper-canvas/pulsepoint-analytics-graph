import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '../components/ApperIcon'
import clientService from '../services/api/clientService'

const Clients = () => {
const Clients = () => {
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [selectedClients, setSelectedClients] = useState([])
  const [viewClient, setViewClient] = useState(null)
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    status: 'active',
    tags: []
  })

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoading(true)
      const data = await clientService.getAll()
      setClients(data || [])
    } catch (error) {
      toast.error('Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  const handleAddClient = async () => {
    if (!newClient.name.trim() || !newClient.email.trim()) {
      toast.error('Name and email are required')
      return
    }

    try {
      const clientData = {
        ...newClient,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        lastContact: new Date().toISOString(),
        feedbackCount: 0,
        averageRating: 0
      }
      
      const createdClient = await clientService.create(clientData)
      setClients([createdClient, ...clients])
      setShowAddModal(false)
      setNewClient({ name: '', email: '', company: '', phone: '', status: 'active', tags: [] })
      toast.success('Client added successfully')
    } catch (error) {
      toast.error('Failed to add client')
    }
  }

  const handleUpdateClient = async (clientId, updates) => {
    try {
      const updatedClient = await clientService.update(clientId, {
        ...updates,
        lastModified: new Date().toISOString()
      })
      setClients(clients.map(client => client.id === clientId ? updatedClient : client))
      setEditingClient(null)
      toast.success('Client updated successfully')
    } catch (error) {
      toast.error('Failed to update client')
    }
  }

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return

    try {
      await clientService.delete(clientId)
      setClients(clients.filter(client => client.id !== clientId))
      toast.success('Client deleted successfully')
    } catch (error) {
      toast.error('Failed to delete client')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedClients.length === 0) return
    if (!window.confirm(`Are you sure you want to delete ${selectedClients.length} selected clients?`)) return

    try {
      await Promise.all(selectedClients.map(id => clientService.delete(id)))
      setClients(clients.filter(client => !selectedClients.includes(client.id)))
      setSelectedClients([])
      toast.success(`${selectedClients.length} clients deleted successfully`)
    } catch (error) {
      toast.error('Failed to delete selected clients')
    }
  }

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedClients.length === 0) return

    try {
      await Promise.all(selectedClients.map(id => 
        clientService.update(id, { status: newStatus })
      ))
      setClients(clients.map(client => 
        selectedClients.includes(client.id) 
          ? { ...client, status: newStatus }
          : client
      ))
      setSelectedClients([])
      toast.success(`${selectedClients.length} clients updated successfully`)
    } catch (error) {
      toast.error('Failed to update selected clients')
    }
  }

  const filteredAndSortedClients = clients
    .filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client.company?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || client.status === filterStatus
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name)
        case 'email': return a.email.localeCompare(b.email)
        case 'company': return (a.company || '').localeCompare(b.company || '')
        case 'created': return new Date(b.createdAt) - new Date(a.createdAt)
        case 'lastContact': return new Date(b.lastContact) - new Date(a.lastContact)
        default: return 0
      }
    })

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-secondary text-white'
      case 'inactive': return 'bg-surface-400 text-white'
      case 'pending': return 'bg-yellow-500 text-white'
      case 'blocked': return 'bg-red-500 text-white'
      default: return 'bg-surface-200 text-surface-700'
    }
  }

  const ClientCard = ({ client }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-card hover:shadow-lg transition-all duration-300 border border-surface-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selectedClients.includes(client.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedClients([...selectedClients, client.id])
              } else {
                setSelectedClients(selectedClients.filter(id => id !== client.id))
              }
            }}
            className="w-4 h-4 text-primary border-surface-300 rounded focus:ring-primary"
          />
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-semibold">
            {client.name.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
            {client.status}
          </span>
          <button
            onClick={() => setViewClient(client)}
            className="p-2 text-surface-400 hover:text-primary transition-colors"
          >
            <ApperIcon name="Eye" className="h-4 w-4" />
          </button>
          <button
            onClick={() => setEditingClient(client)}
            className="p-2 text-surface-400 hover:text-accent transition-colors"
          >
            <ApperIcon name="Edit2" className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteClient(client.id)}
            className="p-2 text-surface-400 hover:text-red-500 transition-colors"
          >
            <ApperIcon name="Trash2" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-surface-900">{client.name}</h3>
        <p className="text-surface-600 text-sm">{client.email}</p>
        {client.company && (
          <p className="text-surface-500 text-sm">{client.company}</p>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t border-surface-100">
          <div className="text-sm text-surface-500">
            <span className="flex items-center space-x-1">
              <ApperIcon name="MessageCircle" className="h-4 w-4" />
              <span>{client.feedbackCount || 0} feedback</span>
            </span>
          </div>
          <div className="text-sm text-surface-500">
            {client.averageRating > 0 && (
              <span className="flex items-center space-x-1">
                <ApperIcon name="Star" className="h-4 w-4 text-yellow-500" />
                <span>{client.averageRating.toFixed(1)}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )

  const ClientModal = ({ client, isEdit, onClose, onSave }) => {
    const [formData, setFormData] = useState(
      client || { name: '', email: '', company: '', phone: '', status: 'active', tags: [] }
    )

    const handleSave = () => {
      if (!formData.name.trim() || !formData.email.trim()) {
        toast.error('Name and email are required')
        return
      }
      onSave(formData)
    }

    return (
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
          <h3 className="text-lg font-semibold text-surface-900 mb-4">
            {isEdit ? 'Edit Client' : 'Add New Client'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter client name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter email address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter company name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter phone number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-surface-600 hover:text-surface-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              {isEdit ? 'Update Client' : 'Add Client'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )
  }

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
                <h1 className="text-2xl font-bold text-surface-900">Client Management</h1>
              </div>
              <p className="text-surface-600">Manage your client relationships and feedback data</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              {selectedClients.length > 0 && (
                <>
                  <select
                    onChange={(e) => e.target.value && handleBulkStatusUpdate(e.target.value)}
                    className="px-4 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    defaultValue=""
                  >
                    <option value="">Update Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="blocked">Blocked</option>
                  </select>
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                  >
                    <ApperIcon name="Trash2" className="h-4 w-4" />
                    <span>Delete ({selectedClients.length})</span>
                  </button>
                </>
              )}
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
              >
                <ApperIcon name="UserPlus" className="h-4 w-4" />
                <span>Add Client</span>
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
              placeholder="Search clients..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="blocked">Blocked</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="company">Sort by Company</option>
            <option value="created">Sort by Created</option>
            <option value="lastContact">Sort by Last Contact</option>
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
            {filteredAndSortedClients.map(client => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}

        {!loading && filteredAndSortedClients.length === 0 && (
          <div className="text-center py-12">
            <ApperIcon name="Users" className="h-12 w-12 text-surface-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-surface-900 mb-2">No clients found</h3>
            <p className="text-surface-600 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first client'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Add Your First Client
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <ClientModal
            onClose={() => setShowAddModal(false)}
            onSave={handleAddClient}
          />
        )}
        
        {editingClient && (
          <ClientModal
            client={editingClient}
            isEdit={true}
            onClose={() => setEditingClient(null)}
            onSave={(formData) => handleUpdateClient(editingClient.id, formData)}
          />
        )}

        {viewClient && (
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
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-surface-900">Client Details</h3>
                <button
                  onClick={() => setViewClient(null)}
                  className="text-surface-400 hover:text-surface-600"
                >
                  <ApperIcon name="X" className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                    {viewClient.name.charAt(0).toUpperCase()}
                  </div>
                  <h4 className="text-xl font-semibold text-surface-900">{viewClient.name}</h4>
                  <p className="text-surface-600">{viewClient.email}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-surface-200">
                  {viewClient.company && (
                    <div className="flex items-center justify-between">
                      <span className="text-surface-600">Company</span>
                      <span className="text-surface-900">{viewClient.company}</span>
                    </div>
                  )}
                  {viewClient.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-surface-600">Phone</span>
                      <span className="text-surface-900">{viewClient.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-surface-600">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(viewClient.status)}`}>
                      {viewClient.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-surface-600">Feedback Count</span>
                    <span className="text-surface-900">{viewClient.feedbackCount || 0}</span>
                  </div>
                  {viewClient.averageRating > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-surface-600">Average Rating</span>
                      <span className="text-surface-900">{viewClient.averageRating.toFixed(1)}/5.0</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-surface-600">Joined</span>
                    <span className="text-surface-900">
                      {new Date(viewClient.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-surface-200">
                <button
                  onClick={() => {
                    setViewClient(null)
                    setEditingClient(viewClient)
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Edit Client
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Clients