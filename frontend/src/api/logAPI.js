import API from './base';

export const logProblem = (data) => API.post('/logs', data);
export const getTodayLog = () => API.get('/logs/today');
export const getLogByDate = (date) => API.get(`/logs/date/${date}`);
export const getLogHistory = (page = 1, limit = 10) => API.get(`/logs/history?page=${page}&limit=${limit}`);
export const getStreak = () => API.get('/logs/streak');
export const getActivityGrid = (days = 90) => API.get(`/logs/activity-grid?days=${days}`);
export const getSummary = (period = 'week') => API.get(`/logs/summary?period=${period}`);
export const updateMood = (mood, date) => API.put('/logs/mood', { mood, date });
export const removeProblem = (date, titleSlug) => API.delete(`/logs/${date}/${titleSlug}`);
export const updateLoggedProblem = (date, titleSlug, data) => API.patch(`/logs/${date}/${titleSlug}`, data);
export const markRevised = (date, titleSlug) => API.patch(`/logs/${date}/${titleSlug}/revise`);
export const getFavorites = () => API.get('/logs/favorites');