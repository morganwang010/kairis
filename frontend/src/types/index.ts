import React from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
}

export interface Menu {
  id: string;
  title: string;
  path: string;
  icon?: string;
  component?: string;
  redirect?: string;
  hidden?: boolean;
  children?: Menu[];
  permissions?: string[];
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  type: 'menu' | 'button';
  resourceId: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  permissions: Permission[];
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RouteConfig {
  path: string;
  element: React.LazyExoticComponent<React.ComponentType>;
  meta?: {
    title?: string;
    icon?: string;
    hidden?: boolean;
    permissions?: string[];
  };
  children?: RouteConfig[];
}
