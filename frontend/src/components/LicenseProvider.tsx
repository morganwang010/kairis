import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { Modal } from 'antd'
import { checkLicenseStatus } from '../api'
// import { invoke } from '@tauri-apps/api/core'
import { useAuth } from './AuthProvider'
import { useLocation } from 'react-router-dom'
import { t } from 'i18next'



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

// 内部组件，使用useLocation钩子
const LicenseProviderContent = ({ children }: LicenseProviderProps) => {
  const [licenseValid, setLicenseValid] = useState<boolean>(true) // 默认假设有效，避免启动时阻塞
  const [licenseStatus, setLicenseStatus] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  // 检查license状态
  const checkStatus = async () => {
    // 只有当用户已登录时才检查license状态
    const user = localStorage.getItem('user')

    if (!user) {
      console.log('用户未登录，跳过License检查')
      setLoading(false)
      return
    }else{
      console.log('用户已登录，开始检查License状态')
    }


    setLoading(true)
    try {
      // 优先从localStorage中获取license状态
      const storedLicense = localStorage.getItem('license')
      if (storedLicense) {
        console.log('从localStorage获取License状态')
        const parsedLicense = JSON.parse(storedLicense)
        setLicenseStatus(parsedLicense)
        
        // 类型断言
        const typedResult = parsedLicense as { success: boolean }
        setLicenseValid(typedResult.success)
        
        if (!typedResult.success) {
          console.log('License无效，当前路径:', location.pathname)
          
          // 如果在应用页面中且license无效，直接跳转到license页面
          if (location.pathname.startsWith('/app') && !location.pathname.includes('/license')) {
            console.log('License无效，直接跳转到license页面')
            window.location.href = '/app/license'
            setModalVisible(true)

          } else if (!location.pathname.startsWith('/license') && !location.pathname.startsWith('/app/license')) {
            setModalVisible(true)
          }
        }
      } else {
        // 如果localStorage中没有，调用API获取
        console.log('localStorage中无License状态，调用API获取')
        const result = await checkLicenseStatus()
        setLicenseStatus(result)
        localStorage.setItem('license', JSON.stringify(result))
        
        // 类型断言
        const typedResult = result as { success: boolean }
        setLicenseValid(typedResult.success)
        
        if (!typedResult.success) {
          console.log('License无效，当前路径:', location.pathname)
          
          // 如果在应用页面中且license无效，直接跳转到license页面
          if (location.pathname.startsWith('/app') && !location.pathname.includes('/license')) {
            console.log('License无效，直接跳转到license页面')
            window.location.href = '/app/license'
          } else if (!location.pathname.startsWith('/license') && !location.pathname.startsWith('/app/license')) {
            setModalVisible(true)
          }
        }
      }
    } catch (error) {
      console.error('检查License状态失败:', error)
      setLicenseValid(false)
      
      // 如果在应用页面中且license检查失败，直接跳转到license页面
      if (location.pathname.startsWith('/app') && !location.pathname.includes('/license')) {
        console.log('License检查失败，直接跳转到license页面')
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
      console.log('尝试退出应用...')
      // 只清除license信息，保留用户信息
      localStorage.removeItem('license')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('justLoggedIn')
      localStorage.removeItem('savedUser')
      // 直接调用后端exit_app命令，这会调用std::process::exit(0)来退出整个进程
      // await invoke('exit_app')
      console.log('应用已退出')
    } catch (error) {
      console.error('退出应用失败:', error)
      // 如果invoke失败，尝试使用window.close()
      try {
        window.close()
      } catch (fallbackError) {
        console.error('关闭应用失败:', fallbackError)
      }
    }
  }

  // 组件挂载时检查状态
  // useEffect(() => {
  //   checkStatus()
  // }, [checkStatus])

  // 当登录状态变化时检查状态
  useEffect(() => {
    if (isAuthenticated) {
      console.log('用户已登录，开始检查License状态')
      checkStatus()
    }
  }, [isAuthenticated, location.pathname])

  // 路径变化时检查状态
  useEffect(() => {
    // 检查是否在应用的页面中（/app/*）
    const isInApp = location.pathname.startsWith('/app')
    const isLicensePage = location.pathname.includes('/license')
    
    // 只有在应用页面中且不是license页面时才检查
    if (isInApp && !isLicensePage) {
      console.log('路由变化到应用页面，检查License状态:', location.pathname)
      checkStatus()
    }
  }, [isAuthenticated, location.pathname])

  return (
    <LicenseContext.Provider value={{ licenseValid, licenseStatus, loading, checkStatus }}>
      {children}
      
      {/* License拦截模态框 */}
      <Modal
        title="License授权提醒"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="去激活License"
        cancelText="取消"
        maskClosable={false}
        footer={[
          <button
            key="cancel"
            onClick={handleModalCancel}
            style={{
              marginRight: '8px',
              padding: '6px 16px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              backgroundColor: '#fff',
              cursor: 'pointer'
            }}
          >
            {t('common.cancel')}
          </button>,
          <button
            key="ok"
            onClick={handleModalOk}
            style={{
              padding: '6px 16px',
              border: '1px solid #1890ff',
              borderRadius: '4px',
              backgroundColor: '#1890ff',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            {t('common.activateLicense')}
          </button>
        ]}
      >
        <p>{t('common.licenseInvalidOrExpired')}</p>
        <p>{t('common.pleaseActivateLicenseToContinue')}</p>
        <p style={{ marginTop: '16px', color: '#ff4d4f' }}>
          {t('common.testLicenseValidFor7Days')}
        </p>
      </Modal>
    </LicenseContext.Provider>
  )
}

// 外部LicenseProvider组件，不使用useLocation
export const LicenseProvider = ({ children }: LicenseProviderProps) => {
  return (
    // 这里不使用useLocation，所以可以在Router外部被创建
    <LicenseProviderContent>
      {children}
    </LicenseProviderContent>
  )
}

export default LicenseProvider
