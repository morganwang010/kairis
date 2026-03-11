import { Card, Form, Input, Button, message, Typography, Space, Divider } from 'antd'
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
// import { invoke } from '@tauri-apps/api/core'
import { useNavigate } from 'react-router-dom'
// import { login } from '../api'
import { useAuth } from '../components/AuthProvider'
import { t } from 'i18next'
import { authApi } from '../api/auth';
import type { LoginResponse } from '../types';
const { Title, Text, Paragraph } = Typography
const { Item } = Form

const LoginPage = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login: authLogin } = useAuth()

  // 组件挂载时从localStorage读取保存的用户信息
  useEffect(() => {
    const savedUser = localStorage.getItem('savedUser1')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        form.setFieldsValue({
          username: userData.username,
          password: atob(userData.password), // 解码Base64密码
          remember: true
        })
      } catch (error) {
        console.error('读取保存的用户信息失败:', error)
      }
    }
  }, [form])

  const handleLogin = async (values: any) => {

    setLoading(true)
    console.log('登录请求11111:', values)
    try {
      console.log('登录请求:', values)
      // 直接使用invoke进行登录，避免通过api.ts中的login函数
      // const { invoke } = await import('@tauri-apps/api/core')
      const loginRequest = { username: values.username, password: values.password }
      console.log("request:", loginRequest)
      const result = await authApi.login(loginRequest)
      
      console.log('登录结果:', result)
      
      // 检查结果是否存在
      if (!result) {
        message.error('登录失败：未收到响应')
        return
      }
      
      // 保存token和用户信息
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      localStorage.setItem('savedUser', JSON.stringify({
        user_id: result.user.id,
        username: result.user.username,
        role: result.user.roles?.[0] || '',
        full_name: result.user.username,
        email: result.user.email,
        token: result.token
      }))

      // 保存记住密码
      if (values.remember) {
        localStorage.setItem('savedUser1', JSON.stringify({
          username: values.username,
          password: btoa(values.password) // Base64编码密码
        }))
      } else {
        localStorage.removeItem('savedUser1')
      }

      message.success('登录成功')
      // 导航到首页
      navigate('/app')

    } catch (error) {
      console.error('登录失败:', error)
      message.error('登录失败：用户名或密码错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card 
        title={<Title level={4} style={{ color: '#1890ff', margin: 0 }}>用户登录</Title>}
        style={{ 
          width: 400, 
          borderRadius: 12,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}
        bodyStyle={{ padding: '30px 24px' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
        >
          <Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="请输入用户名"
              size="large"
            />
          </Item>
          <Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="请输入密码"
              size="large"
            />
          </Item>
          {/* <Item name="remember" valuePropName="checked" noStyle>
            <Form.Item>
              <Input.Checkbox>记住我</Input.Checkbox>
            </Form.Item>
          </Item> */}
          <Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              style={{ height: 48, fontSize: 16 }}
            >
              <LoginOutlined style={{ marginRight: 8 }} />
              登录
            </Button>
          </Item>
        </Form>
      </Card>
    </div>
  )
}

export default LoginPage
