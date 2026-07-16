import api from './client'

export const getVendorReviews = (vid) => api.get(`/reviews/${vid}`)
export const createReview = (data) => api.post('/reviews', data)
export const deleteReview = (id) => api.delete(`/reviews/${id}`)
