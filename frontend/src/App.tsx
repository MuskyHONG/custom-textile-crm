import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import { UserOutlined, FileOutlined, ShoppingOutlined, BarChartOutlined, LogoutOutlined, TeamOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import LoginPage from './pages/LoginPage'
import CustomerPage from './pages/CustomerPage'
import ProjectPage from './pages/ProjectPage'
import OrderPage from './pages/OrderPage'
import StatisticsPage from './pages/StatisticsPage'
import { logout } from './redux/slices/authSlice'
import type { RootState } from './redux/store'

const { Header, Content, Sider } = Layout

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  console.log('isAuthenticated:', isAuthenticated)
  console.log('LoginPage:', LoginPage)
  console.log('CustomerPage:', CustomerPage)
  console.log('ProjectPage:', ProjectPage)
  console.log('OrderPage:', OrderPage)
  console.log('StatisticsPage:', StatisticsPage)

  const handleLogout = () => {
    dispatch(logout())
  }

  const renderLayout = () => {
    if (!isAuthenticated) {
      return (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )
    }

    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider width={200} style={{ background: '#fff' }}>
          <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>
            客服工具
          </div>
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            style={{ height: '100%', borderRight: 0 }}
            items={[
              {
                key: '1',
                icon: <TeamOutlined />,
                label: <Link to="/customers">客户管理</Link>
              },
              {
                key: '2',
                icon: <FileOutlined />,
                label: <Link to="/projects">项目管理</Link>
              },
              {
                key: '3',
                icon: <ShoppingOutlined />,
                label: <Link to="/orders">订单管理</Link>
              },
              {
                key: '4',
                icon: <BarChartOutlined />,
                label: <Link to="/statistics">数据统计</Link>
              },
              {
                key: '5',
                icon: <LogoutOutlined />,
                label: <a onClick={handleLogout}>退出登录</a>
              }
            ]}
          />
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingRight: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <UserOutlined />
              <span>管理员</span>
            </div>
          </Header>
          <Content style={{ margin: '24px', padding: 24, background: '#fff', minHeight: 280 }}>
            <Routes>
              <Route path="/customers" element={<CustomerPage />} />
              <Route path="/projects" element={<ProjectPage />} />
              <Route path="/orders" element={<OrderPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/" element={<Navigate to="/customers" replace />} />
              <Route path="*" element={<Navigate to="/customers" replace />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    )
  }

  return renderLayout()
}

export default App