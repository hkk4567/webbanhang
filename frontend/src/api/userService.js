// src/api/userService.js
import apiClient from './apiClient';

export const getUsers = (params) => {
    return apiClient.get('/users', { params });
};

export const getUserById = (id) => {
    return apiClient.get(`/users/${id}`);
};

export const createUser = (userData) => {
    return apiClient.post('/users/register', userData);
};

export const updateUser = (id, userData) => {
    return apiClient.patch(`/users/${id}`, userData);
};

export const deleteUser = (id) => {
    return apiClient.delete(`/users/${id}`);
};