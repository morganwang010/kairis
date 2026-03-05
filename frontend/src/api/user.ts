import request from '../utils/request';
import type { User, ApiResponse } from '../types';

export interface CreateUserParams {
  username: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  roles?: string[];
}

export interface UpdateUserParams {
  email: string;
  phone?: string;
  avatar?: string;
  status?: string;
  roles?: string[];
}

export interface UserListResponse {
  list: User[];
  total: number;
  page: number;
  pageSize: number;
}

export const userApi = {
  list: (params: { page?: number; pageSize?: number; search?: string } = {}) => {
    return request.get<ApiResponse<UserListResponse>>('/users', { params });
  },

  get: (id: string) => {
    return request.get<ApiResponse<User>>(`/users/${id}`);
  },

  create: (data: CreateUserParams) => {
    return request.post<ApiResponse<User>>('/users', data);
  },

  update: (id: string, data: UpdateUserParams) => {
    return request.put<ApiResponse<User>>(`/users/${id}`, data);
  },

  delete: (id: string) => {
    return request.delete<ApiResponse>(`/users/${id}`);
  },
};