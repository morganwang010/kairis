# Kairis 企业管理系统

基于 React 19 + Go Gin + PostgreSQL 的企业级管理后台系统

## 技术栈

### 前端
- React 19
- Vite 7
- TypeScript
- React Router V6
- Redux Toolkit
- Zustand
- Ant Design 6
- i18n 国际化

### 后端
- Go
- Gin 框架
- PostgreSQL
- GORM

## 核心功能

- 动态菜单系统
- RBAC 权限控制（菜单/按钮级）
- 虚拟表格组件
- 响应式设计（适配手机端）
- 动态路由
- 国际化支持

## 项目结构

```
kairis/
├── frontend/          # 前端项目
└── backend/           # 后端项目
```

## 快速开始

### 前端
```bash
cd frontend
npm install
npm run dev
```

### 后端
```bash
cd backend
go mod download
go run main.go
```

## 开发规范

- 前端使用 TypeScript 严格模式
- 后端遵循 Go 标准项目布局
- 代码提交前必须通过 lint 和 typecheck
