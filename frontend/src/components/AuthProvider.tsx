import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Modal } from 'antd'
import {  logout, checkLicenseStatus } from '../api'
// import { getCurrentWindow } from "@tauri-apps/api/window";



interface User {
  user_id: number
  username: string
  role: string
  full_name?: string
  email?: string
  token: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (user: User) => void
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [modalVisible, setModalVisible] = useState<boolean>(false)

  // 检查认证状态
  const checkAuth = useCallback(async () => {
    setLoading(true)
    try {
      // 同时检查user和savedUser，增加可靠性
      const userStr = localStorage.getItem('user') || localStorage.getItem('savedUser')
      const token = localStorage.getItem('token')
      const justLoggedIn = localStorage.getItem('justLoggedIn')
      
      console.log('userStr:', userStr)
      console.log('token:', token)
      console.log('justLoggedIn:', justLoggedIn)
      console.log('当前路径:', window.location.pathname)
      
      // 如果没有token或用户信息，跳转到登录页面
      if (!token) {
        console.log('没有token或用户信息，跳转到登录页面')
        setUser(null)
        // 未登录，跳转到登录页面
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return
      }
      if (!userStr) {
        console.log('没有用户信息，跳转到登录页面')
        setUser(null)
        // 未登录，跳转到登录页面
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return
      }
      // 直接使用本地存储的用户信息设置user状态
      // 避免token验证导致的Tauri回调ID失效问题
      try {
        const userData = JSON.parse(userStr)
        setUser(userData)
        console.log('设置用户状态成功:', userData)
      } catch (parseError) {
        console.error('解析用户信息失败:', parseError)
        // 解析失败，不设置用户状态，保持当前状态
      }
      
      // 如果用户刚刚登录，清除标志
      if (justLoggedIn === 'true') {
        console.log('用户刚刚登录，清除登录标志')
        // 清除刚刚登录的标志
        localStorage.removeItem('justLoggedIn')
      }
    } catch (error) {
      console.error('检查认证状态失败:', error)
      // 检查失败，不清除本地存储，避免误判
      // 保持当前用户状态
    } finally {
      setLoading(false)
    }
  }, [])



  // 登录
  const login = useCallback((user: User) => {
    console.log('登录用户:', user)
    setUser(user)
    // 存储用户信息到localStorage
    localStorage.setItem('user', JSON.stringify(user))

    localStorage.setItem('savedUser', JSON.stringify(user))
    // 存储token到localStorage
    localStorage.setItem('token', user.token)
    // 登录成功后，设置一个标志，避免在checkAuth中立即验证token
    localStorage.setItem('justLoggedIn', 'true')
    // 登录成功后，执行checkAuth，确保认证状态正确
    checkAuth()
  }, [checkAuth])
  // },[])

  // 登出
  const handleLogout = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await logout(token)
      }
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('savedUser')
      localStorage.removeItem('license')
      setUser(null)
      window.location.href = '/login'
    }
  }, [])

  // 处理登录拦截
  const handleModalOk = () => {
    setModalVisible(false)
    window.location.href = '/login'
  }

  // 组件挂载时检查认证状态
  useEffect(() => {
    // 检查认证状态
    checkAuth()
  }, [])

  // 用户登录后获取license状态
  useEffect(() => {
    const fetchLicenseStatus = async () => {
      if (user) {
        try {
          const licenseResult = await checkLicenseStatus()
          localStorage.setItem('license', JSON.stringify(licenseResult))
          console.log('登录成功，获取并存储License状态:', licenseResult)
        } catch (error) {
          console.error('登录成功后获取License状态失败:', error)
        }
      }
    }

    fetchLicenseStatus()
  }, [user])

  // 监听路由变化，检查是否需要登录
  useEffect(() => {
    const handleRouteChange = () => {
      const token = localStorage.getItem('token')
      const currentPath = window.location.pathname
      
      // 如果不在登录页面且没有token，显示登录提示
      if (!token && !currentPath.startsWith('/login')) {
        setModalVisible(true)
        window.location.href = '/login'
      }
    }

    window.addEventListener('popstate', handleRouteChange)
    window.addEventListener('pushstate', handleRouteChange)
    window.addEventListener('replacestate', handleRouteChange)




    return () => {
      window.removeEventListener('popstate', handleRouteChange)
      window.removeEventListener('pushstate', handleRouteChange)
      window.removeEventListener('replacestate', handleRouteChange)
    }
  }, [checkAuth])

  // 监听窗口关闭事件，清除登录信息
  // useEffect(() => {
  //   // 尝试使用Tauri的窗口关闭事件
  //   const setupCloseListener = async () => {
  //     try {
  //       // 动态导入Tauri API，避免在非Tauri环境中出错
  //       const { getCurrentWindow } = await import('@tauri-apps/api/window')
        
  //       // 获取当前窗口
  //       const window = getCurrentWindow()
        
  //       // 监听Tauri窗口关闭事件
  //       const unlisten = await window.onCloseRequested(() => {
  //         console.log('Tauri窗口关闭请求，清除登录信息')
  //         // 清除所有登录相关信息
  //         localStorage.removeItem('token')
  //         localStorage.removeItem('user')
  //         localStorage.removeItem('license')
  //         localStorage.removeItem('justLoggedIn')
  //         localStorage.removeItem('savedUser')
  //       })
        
  //       return unlisten
  //     } catch (error) {
  //       console.error('设置Tauri窗口关闭事件监听器失败:', error)
  //       // 回退到浏览器的beforeunload事件
  //       const handleBeforeUnload = () => {
  //         console.log('浏览器窗口关闭请求，清除登录信息')
  //         // 清除所有登录相关信息
  //         localStorage.removeItem('token')
  //         // localStorage.removeItem('user')
  //         // localStorage.removeItem('license')
  //         // localStorage.removeItem('justLoggedIn')
  //         // localStorage.removeItem('savedUser')
  //       }

  //       // 添加浏览器窗口关闭事件监听器
  //       window.addEventListener('beforeunload', handleBeforeUnload)

  //       return () => {
  //         // 移除监听器
  //         window.removeEventListener('beforeunload', handleBeforeUnload)
  //       }
  //     }
  //   }

  //   let unlistenFn: (() => void) | undefined

  //   // 立即执行设置监听器的函数
  //   setupCloseListener().then(unlisten => {
  //     unlistenFn = unlisten
  //   })

  //   return () => {
  //     // 移除监听器
  //     if (unlistenFn) {
  //       unlistenFn()
  //     }
  //   }
  // }, [checkAuth])
 
  
  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout: handleLogout, checkAuth }}>
      {children}
      
      {/* 登录拦截模态框 */}
      <Modal
        title="登录提醒"
        open={modalVisible}
        onOk={handleModalOk}
        okText="去登录"
        cancelText={null}
        maskClosable={false}
      >
        <p>您尚未登录或登录已过期</p>
        <p>请先登录以继续使用系统功能</p>
      </Modal>
    </AuthContext.Provider>
  )
}

export default AuthProvider