import { Card, Row, Col, Statistic, Progress } from 'antd'
import { UserOutlined, FileTextOutlined, AreaChartOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { getEmployeeCount, getSalaries } from '../api'

const HomePage = () => {
  const { t } = useTranslation();
  const [employeeCount, setEmployeeCount] = useState<number>(0);
  const [salarySummary, setSalarySummary] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // 获取员工数量和薪资汇总
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // const [count, salaries] = await Promise.all([
        const [count] = await Promise.all([
          getEmployeeCount(),
          getSalaries({})
        ]);
        setEmployeeCount(count);
        
        // // 计算薪资汇总
        // const totalSalary = salaries.reduce((sum: number, salary: any) => {
        //   const roundOffSalary = parseFloat(salary.round_off_salary) || 0;
        //   return sum + roundOffSalary;
        // }, 0);
        // setSalarySummary(totalSalary);
      } catch (error) {
        console.error('获取数据失败:', error);
        // 如果获取失败，使用默认值
        setEmployeeCount(0);
        setSalarySummary(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: '20px',width: '100%' }}>
      <Card className="mb-4" style={{ marginBottom: '16px' }}>
          <h2>{t('layout.title')}</h2>
          <p>HR Management System Dashboard</p>
        </Card>
      
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('common.employee')}
              value={employeeCount}
              suffix={t('common.people')}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<UserOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('common.totalRoundOffSalary')}
              value={salarySummary}
              suffix={t('common.currency')}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<FileTextOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('common.salaryCalculation')}
              value={85}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#1890ff' }}
              prefix={<AreaChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Tasks"
              value={12}
              suffix={t('common.items')}
              precision={0}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      <Card style={{ marginTop: '16px' }}>
          <h3>{t('layout.title')} Usage</h3>
          <Progress percent={90} status="success" />
        </Card>
    </div>
  )
}

export default HomePage