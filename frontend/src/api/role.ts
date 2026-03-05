import request from '../utils/request';
import type { Role, ApiResponse } from '../types';

export interface CreateRoleParams {
  name: string;
  code: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateRoleParams extends CreateRoleParams {
  id: string;
}

export interface RoleListResponse {
  list: Role[];
  total: number;
  page: number;
  pageSize: number;
}

export const roleApi = {
  list: (params: { page?: number; pageSize?: number } = {}) => {
    return request.get<ApiResponse<RoleListResponse>>('/roles', { params });
  },

  get: (id: string) => {
    return request.get<ApiResponse<Role>>(`/roles/${id}`);
  },

  create: (data: CreateRoleParams) => {
    return request.post<ApiResponse<Role>>('/roles', data);
  },

  update: (id: string, data: UpdateRoleParams) => {
    return request.put<ApiResponse<Role>>(`/roles/${id}`, data);
  },

  delete: (id: string) => {
    return request.delete<ApiResponse>(`/roles/${id}`);
  },
};