import api from './client'

export const getCondolences = (fid) => api.get(`/condolences/${fid}`)
export const saveCondolence = (data) => api.post('/condolences', data)
export const deleteCondolence = (id) => api.delete(`/condolences/${id}`)
