import api from './client'

export const requestJoin = (funeralId, data) => api.post(`/funerals/${funeralId}/join`, data)
export const getMembers = (funeralId) => api.get(`/funerals/${funeralId}/members`)
export const getJoinRequests = (funeralId) => api.get(`/funerals/${funeralId}/requests`)
export const updateMemberStatus = (funeralId, memberId, status) => api.put(`/funerals/${funeralId}/members/${memberId}`, { status })
export const removeMember = (funeralId, memberId) => api.delete(`/funerals/${funeralId}/members/${memberId}`)
