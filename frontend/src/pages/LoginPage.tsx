import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Form, Input, Button, Card, message, Tabs } from 'antd'
import { login, register } from '../redux/slices/authSlice'
import type { RootState } from '../redux/store'

const { TabPane } = Tabs

const LoginPage: React.FC = () => {
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state: RootState) => state.auth)
  const [activeTab, setActiveTab] = useState('login')

  const handleLogin = async (values: { username: string; password: string }) => {
    try {
      await dispatch(login(values)).unwrap()
      message.success('登录成功')
    } catch (err: any) {
      message.error(err || '登录失败')
    }
  }

  const handleRegister = async (values: { username: string; password: string; email: string }) => {
    try {
      await dispatch(register(values)).unwrap()
      message.success('注册成功')
    } catch (err: any) {
      message.error(err || '注册失败')
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
      <Card title="客服工具登录" style={{ width: 400 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="登录" key="login">
            <Form onFinish={handleLogin} layout="vertical">
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  登录
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab="注册" key="register">
            <Form onFinish={handleRegister} layout="vertical">
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入有效的邮箱地址' }]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  注册
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
        {error && <div style={{ marginTop: 16, color: 'red' }}>{error}</div>}
      </Card>
    </div>
  )
}

export default LoginPage