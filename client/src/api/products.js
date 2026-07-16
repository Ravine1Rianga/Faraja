import api from './client'
export const getActiveProducts = () => api.get('/products/active')
export const getProduct = (id) => api.get(`/products/${id}`)
export const deleteProduct = (id) => api.delete(`/products/${id}`)
