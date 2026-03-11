import { Card, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { InfoCircleOutlined } from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

const AboutPage = () => {
  const { t } = useTranslation()
  
  // 版本信息 - 使用构建时生成的版本号（日期时间格式）
  const version = import.meta.env.BUILD_VERSION || import.meta.env.VITE_BUILD_VERSION || '1.0.1'
  console.log("BUILD_VERSION:", version)
  // // 软件功能
  // const features = [
  //   '员工信息管理：维护员工基本信息、薪资数据等',
  //   '项目管理：跟踪项目进度和员工分配情况',
  //   '考勤管理：记录和分析员工考勤数据',
  //   '薪资计算：自动计算员工薪资、税费和津贴',
  //   '薪资条生成：生成详细的员工薪资条',
  //   '税率管理：配置和管理税率信息',
  //   '导入导出：支持Excel格式的数据导入导出'
  // ]
  
  // 发版记录
  // const releaseNotes = [
  //   {
  //     version: '1.0.1',
  //     date: '2025-12-11',
  //     changes: [
  //       '将rapel_basic_sal统一重命名为rapel_basic_salary',
  //       '在考勤记录中添加ew1/ew2/ew3等新字段',
  //       '完善薪资系数API的反序列化处理',
  //       '优化前端表单字段映射关系',
  //       '添加多语言支持的新字段',
  //       '调整表格布局和滚动设置'
  //     ]
  //   },
  //   {
  //     version: '1.0.0',
  //     date: '2024-12-05',
  //     changes: [
  //       '初始版本发布',
  //       '实现员工信息管理功能',
  //       '实现项目管理功能',
  //       '实现考勤管理功能',
  //       '实现薪资计算功能',
  //       '实现薪资条生成功能',
  //       '实现税率管理功能'
  //     ]
  //   }
  // ]
  
  return (
    <div style={{ padding: '20px', width: '100%' }}>
      <Card className="mb-4" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <InfoCircleOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '12px' }} />
          <Title level={2} style={{ margin: 0 }}>{t('about.title')}</Title>
        </div>
        <Paragraph>人力资源管理系统 - 高效管理企业人力资源信息</Paragraph>
        <Text strong>当前版本构建时间：</Text> {version}
      </Card>
      
      {/* <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <CodeOutlined style={{ fontSize: '20px', color: '#52c41a', marginRight: '12px' }} />
          <Title level={3}>主要功能</Title>
        </div>
        <List
          dataSource={features}
          renderItem={item => <List.Item>{item}</List.Item>}
        />
      </Card> */}
      
      {/* <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <CalendarOutlined style={{ fontSize: '20px', color: '#fa8c16', marginRight: '12px' }} />
          <Title level={3}>发版记录</Title>
        </div>
        {releaseNotes.map((release, index) => (
          <Space direction="vertical" style={{ width: '100%' }} key={index}>
            <div>
              <Text strong>版本 {release.version} - {release.date}</Text>
            </div>
            <List
              dataSource={release.changes}
              renderItem={change => <List.Item>• {change}</List.Item>}
            />
            {index < releaseNotes.length - 1 && <Divider />}
          </Space>
        ))}
      </Card> */}
    </div>
  )
}

export default AboutPage