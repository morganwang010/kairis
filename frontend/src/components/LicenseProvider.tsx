import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { Modal } from 'antd'
import { checkLicenseStatus } from '../api'
import { useAuth } from './AuthProvider'
import { useLocation } from 'react-router-dom'
// 导入 store 以获取 token
import store from '../stores'

interface LicenseContextType {
  licenseValid: boolean
  licenseStatus: any
  loading: boolean
  checkStatus: () => Promise<void>
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined)

export const useLicense = () => {
  const context = useContext(LicenseContext)
  if (!context) {
    throw new Error('useLicense must be used within a LicenseProvider')
  }
  return context
}

interface LicenseProviderProps {
  children: ReactNode
}

// License 存储密钥
const LICENSE_STORAGE_KEY = 'app_license'

// 内部组件，使用useLocation钩子
const LicenseProviderContent = ({ children }: LicenseProviderProps) => {
  const [licenseValid, setLicenseValid] = useState<boolean>(true)
  const [licenseStatus, setLicenseStatus] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  // 从安全存储获取 License
  const getStoredLicense = (): any | null => {
    try {
      const storedLicense = sessionStorage.getItem(LICENSE_STORAGE_KEY)
      if (storedLicense) {
        return JSON.parse(storedLicense)
      }
      return null
    } catch (error) {
      console.error('读取 License 失败:', error)
      return null
    }
  }

  // 安全存储 License
  const setStoredLicense = (licenseData: any) => {
    try {
      sessionStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(licenseData))
    } catch (error) {
      console.error('存储 License 失败:', error)
    }
  }

  // 清除 License 存储
  const clearStoredLicense = () => {
    sessionStorage.removeItem(LICENSE_STORAGE_KEY)
  }

  // 检查license状态
  const checkStatus = async () => {
    // 只有当用户已登录时才检查license状态
    const state = store.getState()
    const token = state.user.token

    if (!token) {
      console.log('用户未登录，跳过License检查')
      setLoading(false)
      return
    } else {
      console.log('用户已登录，开始检查License状态')
    }

    setLoading(true)
    try {
      // 优先从 sessionStorage 中获取license状态
      const storedLicense = getStoredLicense()
      if (storedLicense) {
        console.log('从 sessionStorage 获取 License 状态')
        setLicenseStatus(storedLicense)
        
        const expirationDate = storedLicense.data?.data?.expiration_date
        console.log('License 过期日期:', expirationDate)
        
        // 如果 expirationDate 大于当前时间，则 license 有效
        if (expirationDate && expirationDate > new Date().toISOString().split('T')[0]) {
          console.log('License 有效')
          setLicenseValid(true)
        } else {
          console.log('License 已过期')
          setLicenseValid(false)
          setModalVisible(true)
          return
        }
        
        if (!licenseValid) {
          console.log('License 无效，当前路径:', location.pathname)
          
          if (location.pathname.startsWith('/app') && !location.pathname.includes('/license')) {
            console.log('License 无效，跳转到 license 页面')
            window.location.href = '/app/license'
            setModalVisible(true)
          } else if (!location.pathname.startsWith('/license') && !location.pathname.startsWith('/app/license')) {
            setModalVisible(true)
          }
        }
      } else {
        // 如果 sessionStorage 中没有，调用 API 获取
        console.log('sessionStorage 中无 License 状态，调用 API 获取')
        const result = await checkLicenseStatus()
        setLicenseStatus(result)
        setStoredLicense(result)
        
        const expirationDate = result.data?.data?.expiration_date
        
        if (expirationDate && expirationDate > new Date().toISOString().split('T')[0]) {
          console.log('License 有效')
          setLicenseValid(true)
        } else {
          console.log('License 已过期')
          setLicenseValid(false)
          setModalVisible(true)
          return
        }
      }
    } catch (error) {
      console.error('检查 License 状态失败:', error)
      setLicenseValid(false)
      
      if (location.pathname.startsWith('/app') && !location.pathname.includes('/license')) {
        console.log('License 检查失败，跳转到 license 页面')
        window.location.href = '/app/license'
      } else if (!location.pathname.startsWith('/license') && !location.pathname.startsWith('/app/license')) {
        setModalVisible(true)
      }
    } finally {
      setLoading(false)
    }
  }

  // 处理拦截模态框
  const handleModalOk = () => {
    setModalVisible(false)
    window.location.href = '/app/license'
  }

  const handleModalCancel = async () => {
    setModalVisible(false)
    try {
      console.log('清除认证信息...')
      // 清除所有存储的认证信息
      clearStoredLicense()
      // 清除 Redux 状态
      store.dispatch({ type: 'user/logout' })
      // 清除所有 sessionStorage
      sessionStorage.clear()
      // 清除遗留的 localStorage
      localStorage.clear()
      
      // window.location.href = '/login'
    } catch (error) {
      console.error('操作失败:', error)
      // window.location.href = '/login'
    }
  }

  // 当登录状态变化时检查状态
  useEffect(() => {
    if (isAuthenticated) {
      checkStatus()
    }
  }, [isAuthenticated, location.pathname])

  // 路径变化时检查状态
  useEffect(() => {
    const isInApp = location.pathname.startsWith('/app')
    const isLicensePage = location.pathname.includes('/license')
    
    if (isInApp && !isLicensePage) {
      console.log('路由变化到应用页面，检查 License 状态:', location.pathname)
      checkStatus()
    }
  }, [isAuthenticated, location.pathname])

  return (
    <LicenseContext.Provider value={{ licenseValid, licenseStatus, loading, checkStatus }}>
      {children}
      
      {/* License拦截模态框 */}
      <Modal
        title="License 授权提醒"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="立即授权"
        cancelText="退出"
      >
        <p>您的 License 已过期或无效，请重新授权后继续使用。</p>
      </Modal>
    </LicenseContext.Provider>
  )
}

export const LicenseProvider = ({ children }: LicenseProviderProps) => {
  return <LicenseProviderContent>{children}</LicenseProviderContent>
}

export default LicenseProvider
