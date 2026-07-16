import api from './client'
export const getExpenses = (fid) => api.get(`/funerals/${fid}/expenses`)
export const saveExpense = (fid, data) => api.post(`/funerals/${fid}/expenses`, data)
export const updateExpense = (eid, data) => api.put(`/expenses/${eid}`, data)
export const deleteExpense = (eid) => api.delete(`/expenses/${eid}`)
