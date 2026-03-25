import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import store from '../stores';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083/api';

class Request {
  private instance: AxiosInstance;

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config);
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器 - ✅ 从 Redux 获取 Token（内存中，未加密）
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // 🔴 重要：直接从 Redux store 获取内存中的 token（未加密）
        const state = store.getState();
        const token = state.user?.token;  // 使用可选链防止访问不存在的属性
        console.log('拦截器从 Redux 获取 token:', token ? '已获取' : '未获取');
        
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        } else if (!token) {
          // 如果 Redux 中没有 token，尝试从 sessionStorage 解密获取（用于页面刷新后的首次请求）
          try {
            const encryptedToken = sessionStorage.getItem('token');
            if (encryptedToken) {
              const decryptedToken = decodeURIComponent(atob(encryptedToken));
              console.log('拦截器从 sessionStorage 解密获取 token');
              if (config.headers) {
                config.headers.Authorization = `Bearer ${decryptedToken}`;
              }
            }
          } catch (e) {
            console.log('从 sessionStorage 获取 token 失败');
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器 - 正确处理响应格式
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response.data;
      },
      (error) => {
        if (error.response) {
          const { status } = error.response;
          switch (status) {
            case 401:
              message.error('未授权，请重新登录');
              store.dispatch({ type: 'user/logout' });
              sessionStorage.clear();
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

  public post<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config);
  }

  public put<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put(url, data, config);
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config);
  }

  public patch<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.patch(url, data, config);
  }
}

const request = new Request({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default request;
