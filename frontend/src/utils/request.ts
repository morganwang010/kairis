import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

class Request {
  private instance: AxiosInstance;

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config);
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const { code, data, message: msg } = response.data;
        
        if (code === 200) {
          return data;
        } else {
          message.error(msg || '请求失败');
          return Promise.reject(new Error(msg || '请求失败'));
        }
      },
      (error) => {
        if (error.response) {
          const { status } = error.response;
          switch (status) {
            case 401:
              message.error('未授权，请重新登录');
              localStorage.removeItem('token');
              window.location.href = '/login';
              break;
            case 403:
              message.error('拒绝访问');
              break;
            case 404:
              message.error('请求地址不存在');
              break;
            case 500:
              message.error('服务器错误');
              break;
            default:
              message.error(error.response.data?.message || '请求失败');
          }
        } else {
          message.error('网络错误');
        }
        return Promise.reject(error);
      }
    );
  }

  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put(url, data, config);
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config);
  }
}

export default new Request({
  baseURL,
  timeout: 10000,
});
