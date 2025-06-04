class ReportService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'report'
    this.allFields = [
      'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy',
      'title', 'type', 'description', 'date_range', 'format', 'status', 'file_size', 'download_count', 'download_url'
    ]
    this.updateableFields = ['Name', 'Tags', 'Owner', 'title', 'type', 'description', 'date_range', 'format', 'status', 'file_size', 'download_count', 'download_url']
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
      console.error('Error fetching reports:', error)
      throw error
    }
  }

  async getById(id) {
    try {
      const params = { fields: this.allFields }
      const response = await this.apperClient.getRecordById(this.tableName, id, params)
      return response?.data || null
    } catch (error) {
      console.error(`Error fetching report with ID ${id}:`, error)
      throw error
    }
  }

  async create(reportData) {
    try {
      // Filter to only include updateable fields
      const filteredData = {}
      this.updateableFields.forEach(field => {
        if (reportData[field] !== undefined) {
          filteredData[field] = reportData[field]
        }
      })

      const params = { records: [filteredData] }
      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (response?.success && response?.results?.[0]?.success) {
        return response.results[0].data
      } else {
        throw new Error(response?.results?.[0]?.message || 'Failed to create report')
      }
    } catch (error) {
      console.error('Error creating report:', error)
      throw error
    }
  }

  async update(id, reportData) {
    try {
      // Filter to only include updateable fields plus Id
      const filteredData = { Id: id }
      this.updateableFields.forEach(field => {
        if (reportData[field] !== undefined) {
          filteredData[field] = reportData[field]
        }
      })

      const params = { records: [filteredData] }
      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response?.success && response?.results?.[0]?.success) {
        return response.results[0].data
      } else {
        throw new Error(response?.results?.[0]?.message || 'Failed to update report')
      }
    } catch (error) {
      console.error('Error updating report:', error)
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
        throw new Error('Failed to delete report')
      }
    } catch (error) {
      console.error('Error deleting report:', error)
      throw error
    }
  }

  async getByType(type) {
    try {
      const params = {
        fields: this.allFields,
        where: [{
          fieldName: 'type',
          operator: 'ExactMatch',
          values: [type]
        }]
      }
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      return response?.data || []
    } catch (error) {
      console.error('Error fetching reports by type:', error)
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
      console.error('Error fetching reports by status:', error)
      throw error
    }
  }
}

export default new ReportService()