# Kairis 企业管理系统 - 项目启动指南

## 项目概述

Kairis 是一个基于 React 19 + Go Gin + PostgreSQL 的企业级管理后台系统，包含动态菜单、RBAC 权限系统、虚拟表格组件、响应式设计等核心功能。

## 技术栈

### 前端
- React 19
- Vite 7 (Beta)
- TypeScript
- React Router V6
- Redux Toolkit
- Zustand
- Ant Design 6
- i18n 国际化
- Axios

### 后端
- Go 1.25
- Gin 框架
- PostgreSQL
- GORM
- JWT 认证

## 项目结构

```
kairis/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── api/             # API 接口
│   │   ├── components/      # 公共组件
│   │   ├── layouts/         # 布局组件
│   │   ├── pages/           # 页面组件
│   │   ├── router/          # 路由配置
│   │   ├── stores/          # 状态管理
│   │   ├── hooks/           # 自定义 Hooks
│   │   ├── utils/           # 工具函数
│   │   ├── types/           # TypeScript 类型定义
│   │   ├── locales/         # 国际化配置
│   │   └── styles/          # 样式文件
│   ├── .env.development     # 开发环境变量
│   └── .env.production      # 生产环境变量
│
└── backend/                  # 后端项目
    ├── cmd/                 # 应用入口
    ├── internal/            # 内部代码
    │   ├── handler/         # HTTP 处理器
    │   ├── service/         # 业务逻辑层
    │   ├── repository/      # 数据访问层
    │   ├── model/           # 数据模型
    │   ├── middleware/      # 中间件
    │   └── config/          # 配置
    └── .env.example         # 环境变量示例
```

## 快速开始

### 前置要求

- Node.js 18+
- Go 1.25+
- PostgreSQL 12+

### 1. 数据库配置

创建 PostgreSQL 数据库：

```sql
CREATE DATABASE kairis;
```

### 2. 后端启动

```bash
cd backend

# 复制环境变量配置文件
cp .env.example .env

# 修改 .env 文件中的数据库配置
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASS=your_password
# DB_NAME=kairis

# 安装依赖
go mod download

# 启动服务
go run cmd/main.go
```

后端服务将在 `http://localhost:8080` 启动

### 3. 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将在 `http://localhost:5173` 启动

## 核心功能

### 1. 动态菜单系统
- 支持多级菜单
- 菜单权限控制
- 菜单图标配置
- 菜单排序

### 2. RBAC 权限系统
- 用户管理
- 角色管理
- 权限管理
- 菜单/按钮级权限控制

### 3. 虚拟表格组件
- 支持大数据量渲染
- 固定表头
- 自定义列配置

### 4. 响应式设计
- 适配手机端
- 支持暗黑模式
- 主题定制

### 5. 国际化
- 支持中文、英文
- 可扩展其他语言

## API 接口

### 认证接口
- `POST /api/auth/login` - 用户登录

### 用户管理
- `GET /api/users` - 获取用户列表
- `GET /api/users/:id` - 获取用户详情
- `POST /api/users` - 创建用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

### 角色管理
- `GET /api/roles` - 获取角色列表
- `GET /api/roles/:id` - 获取角色详情
- `POST /api/roles` - 创建角色
- `PUT /api/roles/:id` - 更新角色
- `DELETE /api/roles/:id` - 删除角色

### 权限管理
- `GET /api/permissions` - 获取权限列表
- `GET /api/permissions/:id` - 获取权限详情
- `POST /api/permissions` - 创建权限
- `PUT /api/permissions/:id` - 更新权限
- `DELETE /api/permissions/:id` - 删除权限

### 菜单管理
- `GET /api/menus` - 获取菜单列表
- `GET /api/menus/:id` - 获取菜单详情
- `GET /api/menus/tree` - 获取菜单树
- `POST /api/menus` - 创建菜单
- `PUT /api/menus/:id` - 更新菜单
- `DELETE /api/menus/:id` - 删除菜单

## 开发规范

### 前端
- 使用 TypeScript 严格模式
- 遵循 React Hooks 最佳实践
- 组件命名使用 PascalCase
- 文件命名使用 PascalCase（组件）或 camelCase（工具函数）

### 后端
- 遵循 Go 标准项目布局
- 使用 GORM 进行数据库操作
- API 返回统一格式：`{ code, message, data }`
- 错误处理使用中间件统一处理

## 构建部署

### 前端构建

```bash
cd frontend
npm run build
```

构建产物在 `frontend/dist` 目录

### 后端构建

```bash
cd backend
go build -o bin/kairis cmd/main.go
```

## 常见问题

### 1. 数据库连接失败
检查 `.env` 文件中的数据库配置是否正确

### 2. 前端跨域问题
后端已配置 CORS 中间件，允许跨域访问

### 3. JWT Token 过期
在 `.env` 文件中配置 `JWT_SECRET`，生产环境请使用强密钥

## 下一步

1. 完善数据库迁移脚本
2. 添加单元测试
3. 实现 WebSocket 实时通信
4. 添加日志系统
5. 实现文件上传功能
6. 添加数据导出功能

## 许可证

MIT License
