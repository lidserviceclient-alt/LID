import api from './api'

export async function fetchPublicAppConfig() {
  const response = await api.get('/api/v1/public/app-config')
  return response.data
}
