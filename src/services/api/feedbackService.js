class FeedbackService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'feedback'
    this.allFields = [
      'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy',
      'form_id', 'submitted_at', 'ratings', 'client_id'
    ]
    this.updateableFields = ['Name', 'Tags', 'Owner', 'form_id', 'submitted_at', 'ratings', 'client_id']
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
      console.error('Error fetching feedback:', error)
      throw error
    }
  }

  async getById(id) {
    try {
      const params = { fields: this.allFields }
      const response = await this.apperClient.getRecordById(this.tableName, id, params)
      return response?.data || null
    } catch (error) {
      console.error(`Error fetching feedback with ID ${id}:`, error)
      throw error
    }
  }

  async create(feedbackData) {
    try {
      // Filter to only include updateable fields
      const filteredData = {}
      this.updateableFields.forEach(field => {
        if (feedbackData[field] !== undefined) {
          filteredData[field] = feedbackData[field]
        }
      })

      const params = { records: [filteredData] }
      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (response?.success && response?.results?.[0]?.success) {
        return response.results[0].data
      } else {
        throw new Error(response?.results?.[0]?.message || 'Failed to create feedback')
      }
    } catch (error) {
      console.error('Error creating feedback:', error)
      throw error
    }
  }

  async update(id, feedbackData) {
    try {
      // Filter to only include updateable fields plus Id
      const filteredData = { Id: id }
      this.updateableFields.forEach(field => {
        if (feedbackData[field] !== undefined) {
          filteredData[field] = feedbackData[field]
        }
      })

      const params = { records: [filteredData] }
      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response?.success && response?.results?.[0]?.success) {
        return response.results[0].data
      } else {
        throw new Error(response?.results?.[0]?.message || 'Failed to update feedback')
      }
    } catch (error) {
      console.error('Error updating feedback:', error)
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
        throw new Error('Failed to delete feedback')
      }
    } catch (error) {
      console.error('Error deleting feedback:', error)
      throw error
    }
  }

  async getByClient(clientId) {
    try {
      const params = {
        fields: this.allFields,
        where: [{
          fieldName: 'client_id',
          operator: 'ExactMatch',
          values: [clientId]
        }]
      }
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      return response?.data || []
    } catch (error) {
      console.error('Error fetching feedback by client:', error)
      throw error
    }
  }

  async getByDateRange(startDate, endDate) {
    try {
      const params = {
        fields: this.allFields,
        where: [{
          fieldName: 'submitted_at',
          operator: 'GreaterThanOrEqualTo',
          values: [startDate]
        }, {
          fieldName: 'submitted_at',
          operator: 'LessThanOrEqualTo',
          values: [endDate]
        }]
      }
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      return response?.data || []
    } catch (error) {
      console.error('Error fetching feedback by date range:', error)
      throw error
    }
  }
}

export default new FeedbackService()