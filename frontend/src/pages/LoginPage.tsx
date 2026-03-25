import { Card, Form, Input, Button, message, Modal, Typography, Checkbox } from 'antd'
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth';
import { useAuth } from '../components/AuthProvider'
const { Title } = Typography
const { Item } = Form


const LoginPage = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()  // 这个 login 方法内部已经会存入 Redux
  const [messageApi, messageContextHolder] = message.useMessage();
  const [ _, contextHolder] = Modal.useModal();

  // 组件挂载时从 sessionStorage 读取"记住我"的用户名
  useEffect(() => {
    const savedCredential = sessionStorage.getItem('savedUser1')
    if (savedCredential) {
      try {
        const { username, password } = JSON.parse(savedCredential)
        form.setFieldsValue({
          username,
          password: atob(password),
          remember: true
        })
      } catch (error) {
        console.error('读取保存的用户信息失败:', error)
      }
    }
  }, [form])

  const handleLogin = async (values: any) => {
    setLoading(true)
    console.log('登录请求:', values)
    try {
      const loginRequest = { "username": values.username, "password": values.password }
      const result = await authApi.login(loginRequest)
      
      console.log('登录结果22:', result.data.user.id)
      
      if (!result) {
        messageApi.error('登录失败：未收到响应')
        return
      }
      console.log('登录结果3333:', result.data.user.id)

      if (!result.data.user) {
        messageApi.error('登录失败：未收到用户信息')
        return
      }

      // 使用后端返回的完整用户信息（确保包含 roles 和 permissions）
      const userData = {
        id: String(result.data.user.id),  // 确保是字符串类型
        username: result.data.user.username,
        email: result.data.user.email,
        avatar: result.data.user.avatar || '',
        roles: result.data.user.roles || [],
        permissions: result.data.user.permissions || [],
      }
      // store.dispatch({ token: result.data.token, user: userData })

      // ✅ 这一步已经将用户信息和 token 存入 Redux
      // AuthProvider 的 login 方法内部会调用 dispatch(setCredentials(...))
      login(userData, result.data.token)

      // "记住我"功能：只保存用户名/密码到 sessionStorage（用于自动填充表单）
      // token 和用户信息已由 AuthProvider 管理，无需重复存储
      if (values.remember) {
        sessionStorage.setItem('savedUser1', JSON.stringify({
          username: values.username,
          password: btoa(values.password)
        }))
      } else {
        sessionStorage.removeItem('savedUser1')
      }

      messageApi.success('登录成功')
      navigate('/app')

    } catch (error) {
      console.error('登录失败:', error)
      messageApi.error('登录失败：用户名或密码错误')
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      width: '100vw',
    }}>
             {contextHolder}
       {messageContextHolder}
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
          <Item name="remember" valuePropName="checked">
            <Form.Item>
              <Checkbox>记住密码</Checkbox>
            </Form.Item>
          </Item>
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
