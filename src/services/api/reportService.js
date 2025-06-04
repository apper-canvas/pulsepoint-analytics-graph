import reportData from '../mockData/report.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class ReportService {
  constructor() {
    this.data = [...reportData]
  }

  async getAll() {
    await delay(300)
    return [...this.data]
  }

  async getById(id) {
    await delay(200)
    const item = this.data.find(report => report.id === id)
    return item ? { ...item } : null
  }

  async create(report) {
    await delay(400)
    const newReport = {
      ...report,
      id: Date.now().toString(),
      generatedAt: new Date().toISOString()
    }
    this.data.push(newReport)
    return { ...newReport }
  }

  async update(id, reportData) {
    await delay(350)
    const index = this.data.findIndex(report => report.id === id)
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...reportData }
      return { ...this.data[index] }
    }
    throw new Error('Report not found')
  }

  async delete(id) {
    await delay(250)
    const index = this.data.findIndex(report => report.id === id)
    if (index !== -1) {
      const deleted = this.data.splice(index, 1)[0]
      return { ...deleted }
    }
    throw new Error('Report not found')
  }

  async getByClient(clientId) {
    await delay(300)
    return this.data.filter(report => report.clientId === clientId).map(item => ({ ...item }))
  }

  async generateReport(clientId, dateRange) {
    await delay(500)
    const newReport = {
      id: Date.now().toString(),
      clientId,
      dateRange,
      metrics: {
        averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        totalResponses: Math.floor(Math.random() * 100 + 50),
        responseRate: Math.round((Math.random() * 30 + 70) * 10) / 10,
        sentimentScore: Math.round((Math.random() * 20 + 80) * 10) / 10
      },
      generatedAt: new Date().toISOString()
    }
    this.data.push(newReport)
    return { ...newReport }
  }
}

export default new ReportService()