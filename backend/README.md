# Kairis Backend

基于 Go Gin + PostgreSQL 的企业级管理系统后端

## 技术栈

- Go
- Gin 框架
- PostgreSQL
- GORM
- JWT

## 项目结构

```
backend/
├── cmd/              # 应用入口
├── internal/         # 内部代码
│   ├── handler/      # HTTP 处理器
│   ├── service/      # 业务逻辑
│   ├── repository/   # 数据访问层
│   ├── model/        # 数据模型
│   ├── middleware/   # 中间件
│   └── config/       # 配置
├── pkg/              # 公共包
├── configs/          # 配置文件
└── api/              # API 文档
```

## 快速开始

### 1. 安装依赖

```bash
go mod download
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env` 并修改配置：

```bash
cp .env.example .env
```

### 3. 启动服务

```bash
go run cmd/main.go
```

## API 文档

### 认证

- POST `/api/auth/login` - 用户登录

### 用户管理

- GET `/api/users` - 获取用户列表
- GET `/api/users/:id` - 获取用户详情
- POST `/api/users` - 创建用户
- PUT `/api/users/:id` - 更新用户
- DELETE `/api/users/:id` - 删除用户

### 角色管理

- GET `/api/roles` - 获取角色列表
- GET `/api/roles/:id` - 获取角色详情
- POST `/api/roles` - 创建角色
- PUT `/api/roles/:id` - 更新角色
- DELETE `/api/roles/:id` - 删除角色

### 权限管理

- GET `/api/permissions` - 获取权限列表
- GET `/api/permissions/:id` - 获取权限详情
- POST `/api/permissions` - 创建权限
- PUT `/api/permissions/:id` - 更新权限
- DELETE `/api/permissions/:id` - 删除权限

### 菜单管理

- GET `/api/menus` - 获取菜单列表
- GET `/api/menus/:id` - 获取菜单详情
- GET `/api/menus/tree` - 获取菜单树
- POST `/api/menus` - 创建菜单
- PUT `/api/menus/:id` - 更新菜单
- DELETE `/api/menus/:id` - 删除菜单
