import { useState, useEffect } from 'react'
import { Tabs, Card } from 'antd'
import type { TabsProps } from 'antd'
import { useParams } from 'react-router-dom'
import { getProjects } from '../api'
import NewAttendancePage from './NewAttendancePage'
import IncidentPage from './IncidentPage'
import NewSalaryPage from './NewSalaryPage'
import SalarySlipPage from './SalarySlipPage'
import { useTranslation } from 'react-i18next'
import EmployeePage from './EmployeePage'

const SalaryMainPage = () => {
  const params = useParams<{ projectId: string }>()
  const [activeTabKey, setActiveTabKey] = useState<string>('attendance')
  const [projectName, setProjectName] = useState<string>('所有项目')
  const { t } = useTranslation()
  
  // 根据路由参数确定当前项目
  const currentProject = params.projectId || 'all'
  
  // 加载项目信息
  useEffect(() => {
    if (params.projectId) {
      const loadProjectInfo = async () => {
        try {
          // 查找特定ID的项目
          const projects = await getProjects()
          const foundProject = projects.find((p: any) => p.id.toString() === params.projectId)
          if (foundProject) {
            setProjectName(foundProject.project_abbr || foundProject.project_name)
          }
        } catch (error) {
          console.error('加载项目信息失败:', error)
        }
      }
      loadProjectInfo()
    } else {
      setProjectName('所有项目')
    }
  }, [params.projectId])

  const tabItems: TabsProps['items'] = [
          {
      key: 'employees',
      label: t('common.employee'),
      children: <EmployeePage projectId={currentProject} projectName={projectName} />,
    },
    {
      key: 'attendance',
      label: t('common.attendance'),
      children: <NewAttendancePage projectId={currentProject} projectName={projectName} />,
    },
    {
      key: 'incident',
      label: t('common.incidentManagement'),
      children: <IncidentPage projectId={currentProject} projectName={projectName} />,
    },
    {
      key: 'salary',
      label: t('common.salary'),
      children: <NewSalaryPage projectId={currentProject} projectName={projectName} />,
    },
      {
      key: 'salarySlip',
      label: t('common.salarySlips'),
      children: <SalarySlipPage projectId={currentProject} projectName={projectName} />,
    },

  ]

  return (
    <Card 
      style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        margin: 0, 
        padding: 0, 
        border: '1px solid #f8f8f8ff', 
        boxShadow: 'none' 
      }}
      bodyStyle={{ 
        margin: 0, 
        padding: '8px 16px 0 16px'
      }}
    >
      <Tabs 
        activeKey={activeTabKey} 
        onChange={setActiveTabKey} 
        items={tabItems}
        style={{ width: '100%', borderBottom: '0px solid #f5f5f5ff', marginTop: 0 }}
      />
    </Card>
  )
}

export default SalaryMainPage