import React, { useState } from 'react'
import { Tabs } from 'antd'
import { useTranslation } from 'react-i18next'
import AttendanceUploadPage from './AttendanceUploadPage'
import EmployeeUploadPage from './EmployeeUploadPage'
import IncidentUploadPage from './IncidentUploadPage'
// import SalaryUploadPage from './SalaryUploadPage'

const ImportManagementPage: React.FC = () => {
  const { t } = useTranslation()
  const [activeTabKey, setActiveTabKey] = useState<string>('attendance')

  const handleTabChange = (key: string) => {
    setActiveTabKey(key)
  }

  // 定义Tabs的items配置
  const tabItems = [
 
    {
      key: 'attendance',
      label: t('importManagementPage.attendanceImport'),
      children: <AttendanceUploadPage />,
    },
    {
      key: 'incident',
      label: t('importManagementPage.incidentImport'),
      children: <IncidentUploadPage />,
    },
    // {
    //   key: 'salary',
    //   label: t('importManagementPage.salaryImport'),
    //   children: <SalaryUploadPage />,
    // },
    {
      key: 'employee',
      label: t('importManagementPage.employeeImport'),
      children: <EmployeeUploadPage />,
    },
  ]

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ marginBottom: '24px' }}>{t('importManagementPage.title')}</h2>
      <Tabs 
        activeKey={activeTabKey} 
        onChange={handleTabChange}
        tabPosition="top"
        items={tabItems}
      />
    </div>
  )
}

export default ImportManagementPage