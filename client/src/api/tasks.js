import api from './client'
export const getTasks = (fid) => api.get(`/funerals/${fid}/tasks`)
export const saveTask = (fid, data) => api.post(`/funerals/${fid}/tasks`, data)
export const updateTask = (tid, data) => api.put(`/tasks/${tid}`, data)
export const completeTask = (tid) => api.patch(`/tasks/${tid}/complete`)
export const deleteTask = (tid) => api.delete(`/tasks/${tid}`)
