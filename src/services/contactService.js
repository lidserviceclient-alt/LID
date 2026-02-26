import api from './api'

export async function sendContactMessage(payload) {
  const response = await api.post('/api/v1/public/contact', payload)
  return response.data
}
