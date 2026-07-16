import api from './client'

export const getMyVendors = () => api.get('/vendors')
export const getActiveVendors = () => api.get('/vendors/active')
export const getVendor = (id) => api.get(`/vendors/${id}`)
export const getMyVendorProfile = () => api.get('/vendors/me')
export const saveVendor = (data) => api.post('/vendors', data)
export const updateVendor = (id, data) => api.put(`/vendors/${id}`, data)
export const deleteVendor = (id) => api.delete(`/vendors/${id}`)
export const getVendorProducts = (vid) => api.get(`/vendors/${vid}/products`)
export const saveProduct = (vid, data) => api.post(`/vendors/${vid}/products`, data)
export const updateProduct = (vid, pid, data) => api.put(`/vendors/${vid}/products/${pid}`, data)
export const deleteProduct = (vid, pid) => api.delete(`/vendors/${vid}/products/${pid}`)
