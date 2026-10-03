import API from './base';

// ── matches leetcodeRoutes.js ─────────────────────────────
export const getLeetCodeStats = () => API.get('/leetcode/stats');
export const syncLeetCode = (force = false) => API.post(`/leetcode/sync${force ? '?force=true' : ''}`);
export const getRecentSubmissions = (limit = 20) => API.get(`/leetcode/submissions?limit=${limit}`);
export const getHeatmap = () => API.get('/leetcode/heatmap');
export const getPublicStats = (username) => API.get(`/leetcode/user/${username}`);