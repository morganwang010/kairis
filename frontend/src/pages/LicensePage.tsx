import { Card, Form, Input, Button, message, Alert, Typography, Space, Divider } from 'antd'
import { useTranslation } from 'react-i18next'
import { LockOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { checkLicenseStatus, activateLicense } from '../api'

const { Title, Text, Paragraph } = Typography
const { Item } = Form

const LicensePage = () => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [licenseStatus, setLicenseStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 检查license状态
  const checkStatus = async () => {
    setLoading(true)
    try {
      console.log('开始检查License状态')
      const result = await checkLicenseStatus()
      setLicenseStatus(result)
      console.log('License状态:', result)
    } catch (error) {
      console.error('检查License状态失败:', error)
      message.error('检查License状态失败')
    } finally {
      setLoading(false)
    }
  }

  // 激活license
  const handleActivate = async (values: any) => {
    setSubmitting(true)
    try {
      const result = await activateLicense({
        license_key: values.licenseKey,
        company_name: values.companyName
      })
      
      // 类型断言
      const typedResult = (result as unknown) as { success: boolean; message?: string }
      
      if (typedResult.success) {
        message.success('License激活成功')
        form.resetFields()
        // 重新检查状态
        await checkStatus()
      } else {
        message.error(`激活失败: ${typedResult.message}`)
      }
    } catch (error) {
      console.error('激活License失败:', error)
      message.error(`激活失败: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setSubmitting(false)
    }
  }

  // 组件挂载时检查状态
  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <div style={{ padding: '20px', width: '100%', margin: '0 auto' }}>
      <Card className="mb-4">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <LockOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '12px' }} />
          <Title level={2} style={{ margin: 0 }}>{t('licensePage.title') || 'License 授权管理'}</Title>
        </div>

        {/* License状态显示 */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={4} style={{ marginBottom: '16px' }}>{t('licensePage.licenseStatus') }</Title>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>检查中...</div>
          ) : licenseStatus && licenseStatus.data && licenseStatus.data.message === 'Success' ? (
            <Alert
              message={licenseStatus.data.message === 'Success' ? t('licensePage.licenseStatusActive') : t('licensePage.licenseStatusInvalid')}
              description={
                <div>
                  <Text>{licenseStatus.message}</Text>
                  {licenseStatus.data && (
                    <Space direction="vertical" style={{ marginTop: '8px' }}>
                      <Divider style={{ margin: '8px 0' }} />
                      <div>
                        <Text strong>License Key:</Text> {licenseStatus.data.data.license_key}
                      </div>
                      <div>
                        <Text strong>{t('licensePage.status') }</Text> {licenseStatus.data.data.status}
                      </div>
                      {licenseStatus.data.activation_date && (
                        <div>
                          <Text strong>{t('licensePage.activationDate') }</Text> {new Date(licenseStatus.data.data.activation_date).toLocaleString()}
                        </div>
                      )}
                      {licenseStatus.data.expiration_date && (
                        <div>
                          <Text strong>{t('licensePage.expirationDate') }</Text> {new Date(licenseStatus.data.data.expiration_date).toLocaleString()}
                        </div>
                      )}
                      {licenseStatus.data.company_name && (
                        <div>
                          <Text strong>{t('licensePage.companyName') }</Text> {licenseStatus.data.data.company_name}
                        </div>
                      )}
                      {licenseStatus.data.employee_count && (
                        <div>
                          <Text strong>{t('licensePage.employeeCount') }</Text> {licenseStatus.data.data.employee_count}
                        </div>
                      )}
                    </Space>
                  )}
                </div>
              }
              type={licenseStatus.data.message === 'Success' ? 'success' : 'error'}
              showIcon
            />
          ) : (
            <Alert
              message="未检查License状态"
              description="点击下方按钮检查License状态"
              type="info"
              showIcon
            />
          )}
        </div>

        {/* 激活License表单 */}
        <Divider />
        <Title level={4} style={{ marginBottom: '16px' }}>{t('licensePage.activateLicense') }</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleActivate}
        >
          <Item
            name="licenseKey"
            label={t('licensePage.licenseKey') }
            rules={[{ required: true, message: t('licensePage.licenseKeyRequired') }]}
          >
            <Input
              prefix={<LockOutlined />}
              placeholder={t('licensePage.licenseKeyPlaceholder') }
              style={{ maxWidth: '400px' }}
            />
          </Item>

          <Item
            name="companyName"
            label={t('licensePage.companyName') }
            rules={[{ required: false, message: t('licensePage.companyNameRequired') }]}
          >
            <Input
              placeholder={t('licensePage.companyNamePlaceholder') }
              style={{ maxWidth: '400px' }}
            />
          </Item>

          <Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                icon={<CheckCircleOutlined />}
              >
                {t('licensePage.activateLicense') }
              </Button>
              <Button
                onClick={checkStatus}
                loading={loading}
                icon={<ClockCircleOutlined />}
              >
                {t('licensePage.checkStatus') }
              </Button>
            </Space>
          </Item>
        </Form>

        {/* 提示信息 */}
        <Divider />
        <Card size="small" style={{ marginTop: '16px' }}>
          <Title level={5} style={{ marginBottom: '8px' }}>{t('licensePage.activationInstructions') }</Title>
          <Paragraph style={{ margin: '8px 0' }}>
            <Text type="secondary">{t('licensePage.activationInstruction1') }</Text>
          </Paragraph>
          <Paragraph style={{ margin: '8px 0' }}>
            <Text type="secondary">{t('licensePage.activationInstruction2') }</Text>
          </Paragraph>
          <Paragraph style={{ margin: '8px 0' }}>
            <Text type="secondary">{t('licensePage.activationInstruction3') }</Text>
          </Paragraph>
          <Paragraph style={{ margin: '8px 0' }}>
            <Text type="secondary">{t('licensePage.activationInstruction4') }</Text>
          </Paragraph>
        </Card>
      </Card>
    </div>
  )
}

export default LicensePage
