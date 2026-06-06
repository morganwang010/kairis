import { useTranslation } from 'react-i18next';
import { UserOutlined, TeamOutlined, MenuOutlined } from '@ant-design/icons';

const Dashboard = () => {
  const { t } = useTranslation();

  const stats = [
    {
      title: t('dashboard.totalUsers'),
      value: 1128,
      icon: UserOutlined,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: t('dashboard.totalRoles'),
      value: 93,
      icon: TeamOutlined,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: t('dashboard.totalMenus'),
      value: 56,
      icon: MenuOutlined,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    // {
    //   title: t('dashboard.growth'),
    //   value: '+23.5%',
    //   icon: TrendingUpOutlined,
    //   color: 'from-orange-500 to-amber-500',
    //   bgColor: 'bg-orange-50',
    //   iconBg: 'bg-orange-100',
    //   iconColor: 'text-orange-600',
    // },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            {t('dashboard.welcome')}
          </h1>
          <p className="text-slate-500 text-lg">
            {t('dashboard.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bgColor} rounded-2xl p-6 shadow-sm border border-slate-100 card-hover cursor-pointer transition-all duration-300 hover:shadow-lg`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.iconBg} p-3 rounded-xl`}>
                    <IconComponent className={`${stat.iconColor} text-xl`} />
                  </div>
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-1">
                  {stat.value}
                </div>
                <div className="text-slate-500 text-sm font-medium">
                  {stat.title}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">
              {t('dashboard.recentActivity')}
            </h2>
            <div className="space-y-4">
              {[
                { action: t('dashboard.userCreated'), time: '2 minutes ago', user: 'John Doe' },
                { action: t('dashboard.roleUpdated'), time: '15 minutes ago', user: 'Jane Smith' },
                { action: t('dashboard.menuAdded'), time: '1 hour ago', user: 'Admin' },
                { action: t('dashboard.permissionChanged'), time: '2 hours ago', user: 'John Doe' },
                { action: t('dashboard.userDeleted'), time: '3 hours ago', user: 'Admin' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                      {item.user.charAt(0)}
                    </div>
                    <div>
                      <div className="text-slate-800 font-medium">{item.action}</div>
                      <div className="text-slate-400 text-sm">{item.user}</div>
                    </div>
                  </div>
                  <div className="text-slate-400 text-sm">{item.time}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">
              {t('dashboard.quickStats')}
            </h2>
            <div className="space-y-4">
              {[
                { label: t('dashboard.activeUsers'), value: '892', percent: '79%' },
                { label: t('dashboard.pendingTasks'), value: '12', percent: '15%' },
                { label: t('dashboard.completedToday'), value: '156', percent: '100%' },
                { label: t('dashboard.averageResponse'), value: '2.3h', percent: '-15%' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-600 text-sm">{item.label}</div>
                    <div className="text-2xl font-bold text-slate-800">{item.value}</div>
                  </div>
                  <div className={`text-sm font-medium ${
                    item.percent.includes('-') ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {item.percent}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
