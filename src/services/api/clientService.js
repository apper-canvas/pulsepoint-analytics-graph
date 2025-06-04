class ClientService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'client'
    this.allFields = [
      'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy',
      'email', 'company', 'phone', 'status'
    ]
    this.updateableFields = ['Name', 'Tags', 'Owner', 'email', 'company', 'phone', 'status']
  }

  async getAll(params = {}) {
    try {
      const queryParams = {
        fields: this.allFields,
        ...params
      }
      
      const response = await this.apperClient.fetchRecords(this.tableName, queryParams)
      return response?.data || []
    } catch (error) {
      console.error('Error fetching clients:', error)
      throw error
    }
  }

  async getById(id) {
    try {
      const params = { fields: this.allFields }
      const response = await this.apperClient.getRecordById(this.tableName, id, params)
      return response?.data || null
    } catch (error) {
      console.error(`Error fetching client with ID ${id}:`, error)
      throw error
    }
  }

  async create(clientData) {
    try {
      // Filter to only include updateable fields
      const filteredData = {}
      this.updateableFields.forEach(field => {
        if (clientData[field] !== undefined) {
          filteredData[field] = clientData[field]
        }
      })

      const params = { records: [filteredData] }
      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (response?.success && response?.results?.[0]?.success) {
        return response.results[0].data
      } else {
        throw new Error(response?.results?.[0]?.message || 'Failed to create client')
      }
    } catch (error) {
      console.error('Error creating client:', error)
      throw error
    }
  }

  async update(id, clientData) {
    try {
      // Filter to only include updateable fields plus Id
      const filteredData = { Id: id }
      this.updateableFields.forEach(field => {
        if (clientData[field] !== undefined) {
          filteredData[field] = clientData[field]
        }
      })

      const params = { records: [filteredData] }
      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response?.success && response?.results?.[0]?.success) {
        return response.results[0].data
      } else {
        throw new Error(response?.results?.[0]?.message || 'Failed to update client')
      }
    } catch (error) {
      console.error('Error updating client:', error)
      throw error
    }
  }

  async delete(id) {
    try {
      const params = { RecordIds: Array.isArray(id) ? id : [id] }
      const response = await this.apperClient.deleteRecord(this.tableName, params)
      
      if (response?.success) {
        return true
      } else {
        throw new Error('Failed to delete client')
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      throw error
    }
  }

  async getByStatus(status) {
    try {
      const params = {
        fields: this.allFields,
        where: [{
          fieldName: 'status',
          operator: 'ExactMatch',
          values: [status]
        }]
      }
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      return response?.data || []
    } catch (error) {
      console.error('Error fetching clients by status:', error)
      throw error
    }
  }
}

export default new ClientService()