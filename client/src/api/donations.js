import api from './client'
export const createDonation = (data) => api.post('/donations', data)
export const getFuneralDonations = (fid) => api.get(`/donations/${fid}`)
export const getDonationReport = (fid) => api.get(`/donations/${fid}/report`)
export const getAllDonations = () => api.get('/donations')
export const mpesaCallback = (data) => api.post('/donations/mpesa/callback', data)
