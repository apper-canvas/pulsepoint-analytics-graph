import formData from '../mockData/form.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class FormService {
  constructor() {
    this.data = [...formData]
  }

  async getAll() {
    await delay(300)
    return [...this.data]
  }

  async getById(id) {
    await delay(200)
    const item = this.data.find(form => form.id === id)
    return item ? { ...item } : null
  }

  async create(form) {
    await delay(400)
    const newForm = {
      ...form,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    this.data.push(newForm)
    return { ...newForm }
  }

  async update(id, formData) {
    await delay(350)
    const index = this.data.findIndex(form => form.id === id)
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...formData }
      return { ...this.data[index] }
    }
    throw new Error('Form not found')
  }

  async delete(id) {
    await delay(250)
    const index = this.data.findIndex(form => form.id === id)
    if (index !== -1) {
      const deleted = this.data.splice(index, 1)[0]
      return { ...deleted }
    }
    throw new Error('Form not found')
  }

  async getActive() {
    await delay(300)
    return this.data.filter(form => form.isActive).map(item => ({ ...item }))
  }

  async getByClient(clientId) {
    await delay(300)
    return this.data.filter(form => form.clientIds.includes(clientId)).map(item => ({ ...item }))
  }
}

export default new FormService()