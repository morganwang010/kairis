import request from '../utils/request';
import type { ApiResponse, User } from '../types';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: (data: LoginParams) => {
    return request.post<ApiResponse<LoginResponse>>('/auth/login', data);
  },
};