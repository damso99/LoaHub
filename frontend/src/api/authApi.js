import { apiClient } from './client';

export const signup = (data) => {
  return apiClient.post('/api/auth/signup', data);
};

export const register = (data) => {
  return signup(data);
};

export const login = (data) => {
  return apiClient.post('/api/auth/login', data);
};

export const checkEmail = (email) => {
  return apiClient.get('/api/auth/check-email', { params: { email } });
};

export const checkNickname = (nickname) => {
  return apiClient.get('/api/auth/check-nickname', { params: { nickname } });
};
