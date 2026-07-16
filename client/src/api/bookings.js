import api from './client'

export const createBooking = (data) => api.post('/bookings', data)
export const getFuneralBookings = (fid) => api.get(`/bookings/funeral/${fid}`)
export const getMyVendorBookings = () => api.get('/bookings/vendor')
export const getAllBookings = () => api.get('/bookings/admin')
export const updateBookingStatus = (id, status) => api.patch(`/bookings/${id}/status`, { status })
