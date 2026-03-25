import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Modal } from 'antd'
import { logout } from '../api'
import { useDispatch, useSelector } from 'react-redux'
import { setCredentials, logout as logoutAction, setToken } from '../stores/slices/userSlice'
import type { RootState } from '../stores'
import store from '../stores'

// const login = useCallback((userData: AuthUser, token: string) => {
//   // 🔴 将用户信息和 Token 写入 Redux Store
//   dispatch(setCredentials({ user: userData, token }))
//   //                              ↑
//   //                     这个 action 会触发 userSlice 中的 reducer
// }, [dispatch])
// 使用与 types/index.ts 一致的 User 接口
interface AuthUser {
  id: string
  username: string
  email: string
  avatar?: string
  roles: string[]
  permissions: string[]
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  loading: boolean
  login: (userData: AuthUser, token: string) => void
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

// 安全选项：使用 sessionStorage（比 localStorage 安全，会话结束即清除）
// 注意：最安全的方式是使用 HttpOnly Cookie，不将 token 存储在 JS 可访问的存储中
const TOKEN_STORAGE_KEY = 'token'
const USER_STORAGE_KEY = 'user'

// 简单的加密函数（生产环境建议使用更安全的加密方案）
const simpleEncrypt = (data: string): string => {
  return btoa(encodeURIComponent(data))
}

const simpleDecrypt = (data: string): string => {
  try {
    return decodeURIComponent(atob(data))
  } catch {
    return ''
  }
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user)
  const [loading, setLoading] = useState<boolean>(true)
  const [modalVisible, setModalVisible] = useState<boolean>(false)

  // 从安全存储恢复认证状态（用于页面刷新）
  const restoreAuthFromStorage = useCallback(() => {
    try {
      const encryptedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY)
      const encryptedUser = sessionStorage.getItem(USER_STORAGE_KEY)
      
      if (encryptedToken && encryptedUser) {
        const token = simpleDecrypt(encryptedToken)
        const userData = JSON.parse(simpleDecrypt(encryptedUser)) as AuthUser
        console.log('userData', userData);
        console.log('token00000', token);
        setTimeout(() => {
          console.log('token00000', token);
        }, 6000)
        if (token && userData) {
          dispatch(setCredentials({ user: userData, token }))
          return true
        }
      }
      return false
    } catch (error) {
      console.error('恢复认证状态失败:', error)
      return false
    }
  }, [dispatch])

  // 安全地存储认证信息（仅用于页面刷新恢复）
  const secureStoreAuth = useCallback((userData: AuthUser, token: string) => {
    try {
      const encryptedToken = simpleEncrypt(token)
      const encryptedUser = simpleEncrypt(JSON.stringify(userData))
      // localStorage.setItem('token', encryptedToken)
      // localStorage.setItem('user', encryptedUser)

      sessionStorage.setItem(TOKEN_STORAGE_KEY, encryptedToken)
      sessionStorage.setItem(USER_STORAGE_KEY, encryptedUser)
    } catch (error) {
      console.error('存储认证信息失败:', error)
    }
  }, [])

  // 清除安全存储的认证信息
  const clearSecureStorage = useCallback(() => {
    // sessionStorage.removeItem(TOKEN_STORAGE_KEY)
    // sessionStorage.removeItem(USER_STORAGE_KEY)
    // // 清除所有遗留的 localStorage（迁移用）
    // localStorage.removeItem('token')
    // localStorage.removeItem('user')
    // localStorage.removeItem('savedUser')
    // localStorage.removeItem('justLoggedIn')
    // localStorage.removeItem('license')
  }, [])

  // 检查认证状态
  const checkAuth = useCallback(async () => {
    setLoading(true)
    try {
      // 如果 Redux 中已有认证状态，直接使用
      if (isAuthenticated && user) {
        console.log('已从 Redux 获取认证状态')
        return
      }

      // 否则尝试从安全存储恢复
      // const restored = restoreAuthFromStorage()
      const token = sessionStorage.getItem(TOKEN_STORAGE_KEY)
      if (!token) {
        console.log('没有认证信息，跳转到登录页面')
        // if (window.location.pathname !== '/login') {
        //   window.location.href = '/login'
        // }
      }
    } catch (error) {
      console.error('检查认证状态失败:', error)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user, restoreAuthFromStorage])

  // 登录
  const login = useCallback((userData: AuthUser, token: string) => {
    console.log('登录用户:', userData)
    
    // 1. 存储到 Redux（主要存储，内存中，XSS 难以直接访问）
    dispatch(setCredentials({ user: userData, token }))

    dispatch(setToken(token))
    
    // 2. 安全存储到 sessionStorage（仅用于页面刷新恢复，会话结束自动清除）
    secureStoreAuth(userData, token)
    
    // 3. 清除遗留的 localStorage（迁移用）
    // clearSecureStorage()
  }, [dispatch, secureStoreAuth])

  // 登出
  const handleLogout = useCallback(async () => {
    try {
      // 从 Redux store 获取 token
      const state = store.getState()
      const currentToken = state.user?.token || ''
      
      if (currentToken) {
        await logout(currentToken)
      }
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      // 1. 清除 Redux 状态
      dispatch(logoutAction())
      
      // 2. 清除安全存储
      clearSecureStorage()
      
      window.location.href = '/login'
    }
  }, [dispatch, clearSecureStorage])

  // 处理登录拦截
  const handleModalOk = () => {
    setModalVisible(false)
    window.location.href = '/login'
  }

  // 组件挂载时检查认证状态
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout: handleLogout,
        checkAuth
      }}
    >
      {children}
      <Modal
        title="登录过期"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        okText="重新登录"
        cancelText="取消"
      >
        <p>您的登录状态已过期，请重新登录。</p>
      </Modal>
    </AuthContext.Provider>
  )
}

export default AuthProvider
