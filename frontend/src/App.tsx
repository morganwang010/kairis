// import { Routes, Route, Navigate } from 'react-router-dom'
// import { Suspense } from 'react'
// import { Spin } from 'antd'
// import route from './router'
// import type { RouteConfig } from './types'
import { RouterProvider } from 'react-router-dom'
import router from './router'
// const renderRoutes = (routes: RouteConfig[]) => {
//   return routes.map((route) => (
//     <Route
//       key={route.path}
//       path={route.path}
//       element={<route.element />}
//     >
//       {route.children && renderRoutes(route.children)}
//     </Route>
//   ))
// }

function App() {
  return (
          <RouterProvider router={router} />

    // <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>}>
    //   <Routes>
    //     {renderRoutes([route])}
    //     <Route path="/" element={<Navigate to="/dashboard" replace />} />
    //   </Routes>
    // </Suspense>
  )
}

export default App
