import request from '../utils/request';
import type { LoginResponse } from '../types';

export interface LoginParams {
  username: string;
  password: string;
}

export const authApi = {
  login: (data: LoginParams) => {
    return request.post<LoginResponse>('/auth/login', data);
  },
};
