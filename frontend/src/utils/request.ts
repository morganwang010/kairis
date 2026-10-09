import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import store from '../stores';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083/api';

// 定义后端统一返回结构（根据你后端实际字段调整）
interface BackendWrap<T = any> {
  code: number;
  data: T;
  message: string;
}

class Request {
  // 👉 重写instance类型：axios实例经过响应拦截器后，get/post直接返回BackendWrap
  private instance: Omit<AxiosInstance, 'get' | 'post' | 'put' | 'delete' | 'patch'> & {
    get: <T>(url: string, config?: AxiosRequestConfig) => Promise<BackendWrap<T>>;
    post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<BackendWrap<T>>;
    put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<BackendWrap<T>>;
    delete: <T>(url: string, config?: AxiosRequestConfig) => Promise<BackendWrap<T>>;
    patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<BackendWrap<T>>;
  };

  constructor(config: AxiosRequestConfig) {
    // 创建原生axios实例，再类型断言
    const rawInstance = axios.create(config);
    this.instance = rawInstance as typeof this.instance;
    this.setupInterceptors(rawInstance);
  }

  // 拦截器接收原生实例，避免类型干扰
  private setupInterceptors(rawInstance: AxiosInstance) {
    // 请求拦截器
    rawInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const state = store.getState();
        const token = state.user?.token;
        console.log('拦截器从 Redux 获取 token:', token ? '已获取' : '未获取');

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        } else if (!token) {
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

    // 响应拦截器
    rawInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response.data; // 这里返回后端包装对象 BackendWrap
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

  // ✅ 对外方法：返回 T，自动提取 backendWrap.data
  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get<T>(url, config).then(res => res.data);
  }

  public post<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post<T>(url, data, config).then(res => res.data);
  }

  public put<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put<T>(url, data, config).then(res => res.data);
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete<T>(url, config).then(res => res.data);
  }

  public patch<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.patch<T>(url, data, config).then(res => res.data);
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
