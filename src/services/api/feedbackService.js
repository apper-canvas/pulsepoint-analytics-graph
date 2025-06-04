import feedbackData from '../mockData/feedback.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class FeedbackService {
  constructor() {
    this.data = [...feedbackData]
  }

  async getAll() {
    await delay(300)
    return [...this.data]
  }

  async getById(id) {
    await delay(200)
    const item = this.data.find(feedback => feedback.id === id)
    return item ? { ...item } : null
  }

  async create(feedback) {
    await delay(400)
    const newFeedback = {
      ...feedback,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    }
    this.data.push(newFeedback)
    return { ...newFeedback }
  }

  async update(id, feedbackData) {
    await delay(350)
    const index = this.data.findIndex(feedback => feedback.id === id)
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...feedbackData }
      return { ...this.data[index] }
    }
    throw new Error('Feedback not found')
  }

  async delete(id) {
    await delay(250)
    const index = this.data.findIndex(feedback => feedback.id === id)
    if (index !== -1) {
      const deleted = this.data.splice(index, 1)[0]
      return { ...deleted }
    }
    throw new Error('Feedback not found')
  }

  async getByClient(clientId) {
    await delay(300)
    return this.data.filter(feedback => feedback.clientId === clientId).map(item => ({ ...item }))
  }

  async getByDateRange(startDate, endDate) {
    await delay(300)
    return this.data.filter(feedback => {
      const date = new Date(feedback.timestamp)
      return date >= new Date(startDate) && date <= new Date(endDate)
    }).map(item => ({ ...item }))
  }
}

export default new FeedbackService()