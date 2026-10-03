import API from './base';

export const getDashboard = () => API.get('/stats/dashboard');
export const getTopicBreakdown = () => API.get('/stats/topics');
export const getWeakSpots = () => API.get('/stats/weak-spots');
export const getDifficultyBreakdown = () => API.get('/stats/difficulty');
export const getProgressChart = (period = 'month') => API.get(`/stats/progress?period=${period}`);
export const getLeaderboard = (type = 'total', limit = 10) => API.get(`/stats/leaderboard?type=${type}&limit=${limit}`);