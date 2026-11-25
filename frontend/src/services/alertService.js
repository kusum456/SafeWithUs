import api from './api'


// ==========================================
// USER ALERTS
// ==========================================

export const getAlerts = async () => {

  const response = await api.get('/alerts/')

  return response.data
}


// ==========================================
// ADMIN - ALL ALERTS
// ==========================================

export const getAllAlerts = async () => {

  const response = await api.get('/admin/alerts/')

  return response.data
}