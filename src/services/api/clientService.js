import clientData from '../mockData/client.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class ClientService {
  constructor() {
    this.data = [...clientData]
  }

  async getAll() {
    await delay(300)
    return [...this.data]
  }

  async getById(id) {
    await delay(200)
    const item = this.data.find(client => client.id === id)
    return item ? { ...item } : null
  }

  async create(client) {
    await delay(400)
    const newClient = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    this.data.push(newClient)
    return { ...newClient }
  }

  async update(id, clientData) {
    await delay(350)
    const index = this.data.findIndex(client => client.id === id)
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...clientData }
      return { ...this.data[index] }
    }
    throw new Error('Client not found')
  }

  async delete(id) {
    await delay(250)
    const index = this.data.findIndex(client => client.id === id)
    if (index !== -1) {
      const deleted = this.data.splice(index, 1)[0]
      return { ...deleted }
    }
    throw new Error('Client not found')
  }

  async getByIndustry(industry) {
    await delay(300)
    return this.data.filter(client => client.industry === industry).map(item => ({ ...item }))
  }
}

export default new ClientService()