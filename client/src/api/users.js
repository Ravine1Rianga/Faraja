import api from './client'

export const getProfile = () => api.get('/users/profile')
export const getMyContributions = () => api.get('/users/profile/contributions')
export const updateProfile = (data) => api.put('/users/profile', data)
export const updateProfileWithPhoto = (formData) => api.put('/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteAccount = () => api.delete('/users/profile')
export const getAllUsers = () => api.get('/users/all')
export const getAdminMetrics = () => api.get('/users/admin/metrics')
export const adminUpdateUser = (id, data) => api.put(`/users/${id}`, data)
export const adminDeleteUser = (id) => api.delete(`/users/${id}`)
