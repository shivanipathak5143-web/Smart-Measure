import API from './base';

export const sendMessage = (message, chatId = null) => API.post('/chat/message', { message, chatId });
export const getAllChats = () => API.get('/chat');
export const getChatById = (chatId) => API.get(`/chat/${chatId}`);
export const deleteChat = (chatId) => API.delete(`/chat/${chatId}`);
export const clearChat = (chatId) => API.put(`/chat/${chatId}/clear`);
export const getRoadmap = (topic, level) => API.get(`/chat/roadmap?topic=${topic || ''}&level=${level || 'beginner'}`);
export const getChatMessages = (chatId) => API.get(`/chat/${chatId}/messages`);