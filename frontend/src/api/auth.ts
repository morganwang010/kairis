import request from '../utils/request';
import type { ApiResponse, LoginResponse } from '../types';

export interface LoginParams {
  username: string;
  password: string;
}

export const authApi = {
  login: (data: LoginParams) => {
    return request.post<ApiResponse<LoginResponse>>('/auth/login', data);
  },
};
