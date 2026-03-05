import { Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, TeamOutlined, MenuOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t('dashboard.welcome')}</h2>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('dashboard.totalUsers')}
              value={1128}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('dashboard.totalRoles')}
              value={93}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('dashboard.totalMenus')}
              value={56}
              prefix={<MenuOutlined />}
            />
          </Card>
          
        </Col>
          <Col span={8}>
          <Card>
            <Statistic
              title={t('dashboard.totalMenus')}
              value={56}
              prefix={<MenuOutlined />}
            />
          </Card>
          
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
