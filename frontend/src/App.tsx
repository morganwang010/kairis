import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense } from 'react'
import { Spin } from 'antd'
import { routes } from './router'
import type { RouteConfig } from './types'

const renderRoutes = (routes: RouteConfig[]) => {
  return routes.map((route) => (
    <Route
      key={route.path}
      path={route.path}
      element={<route.element />}
    >
      {route.children && renderRoutes(route.children)}
    </Route>
  ))
}

function App() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>}>
      <Routes>
        {renderRoutes(routes)}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
