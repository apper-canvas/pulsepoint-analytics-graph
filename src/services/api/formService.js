class FormService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'feedback_form'
    this.allFields = [
      'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy',
      'title', 'description', 'status', 'category'
    ]
    this.updateableFields = ['Name', 'Tags', 'Owner', 'title', 'description', 'status', 'category']
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
      console.error('Error fetching forms:', error)
      throw error
    }
  }

  async getById(id) {
    try {
      const params = { fields: this.allFields }
      const response = await this.apperClient.getRecordById(this.tableName, id, params)
      return response?.data || null
    } catch (error) {
      console.error(`Error fetching form with ID ${id}:`, error)
      throw error
    }
  }

  async create(formData) {
    try {
      // Filter to only include updateable fields
      const filteredData = {}
      this.updateableFields.forEach(field => {
        if (formData[field] !== undefined) {
          filteredData[field] = formData[field]
        }
      })

      const params = { records: [filteredData] }
      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (response?.success && response?.results?.[0]?.success) {
        return response.results[0].data
      } else {
        throw new Error(response?.results?.[0]?.message || 'Failed to create form')
      }
    } catch (error) {
      console.error('Error creating form:', error)
      throw error
    }
  }

  async update(id, formData) {
    try {
      // Filter to only include updateable fields plus Id
      const filteredData = { Id: id }
      this.updateableFields.forEach(field => {
        if (formData[field] !== undefined) {
          filteredData[field] = formData[field]
        }
      })

      const params = { records: [filteredData] }
      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response?.success && response?.results?.[0]?.success) {
        return response.results[0].data
      } else {
        throw new Error(response?.results?.[0]?.message || 'Failed to update form')
      }
    } catch (error) {
      console.error('Error updating form:', error)
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
        throw new Error('Failed to delete form')
      }
    } catch (error) {
      console.error('Error deleting form:', error)
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
      console.error('Error fetching forms by status:', error)
      throw error
    }
  }
}

export default new FormService()