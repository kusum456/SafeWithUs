import api from './api'

export const getEmergencies = async () => {
  const response = await api.get('/emergency/')
  return response.data
}

export const getAllEmergencies = async () => {
  const response = await api.get('/emergency/')
  return response.data
}

export const createEmergency = async (emergencyData) => {
  const response = await api.post(
    '/emergency/',
    emergencyData
  )

  return response.data
}

export const resolveEmergency = async (id) => {
  const response = await api.patch(
    `/emergency/${id}/resolve/`
  )

  return response.data
}

export const cancelEmergency = async (id) => {
  const response = await api.patch(
    `/emergency/${id}/cancel/`
  )

  return response.data
}